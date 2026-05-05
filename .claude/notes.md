# HYPONOVA – Entwicklungsnotizen

## Status: Pre-Launch-fertig — Stand 05.05.2026

## Phase 20: Microsoft Teams Auto-Meeting via Graph API ✅ FERTIG (05.05.2026)

**Auslöser**: Standing-Teams-Link hatte Datenschutz-Risiko (Lobby-Konflikte bei mehreren Terminen). Simon wollte saubere Lösung mit Pro-Termin frischem Link.

**Setup Simon hat gemacht**:
- Microsoft 365 Business Basic Lizenz gelöst (CHF 4.90/Monat)
- Eigenen Tenant `hyponova.onmicrosoft.com` erstellt
- Admin-Login: `simontopalli@hyponova.onmicrosoft.com`
- Azure App-Registrierung "HYPONOVA Booking System"
  - Tenant ID: 786e3ec5-7fde-4109-9f42-710a8a531af5
  - Client ID: 83372449-d53b-479d-b99c-5d1480226373
  - Client Secret: in DB verschlüsselt gespeichert (24 Mt Gültigkeit)
  - Redirect URI: https://hyponova.ch/api/admin/microsoft/callback
- 4 Delegierte API-Berechtigungen: Calendars.ReadWrite, OnlineMeetings.ReadWrite, User.Read, offline_access
- Admin-Consent erteilt

**Implementiert**:
- `src/lib/microsoft-graph.ts` — Graph API Wrapper mit Token-Refresh, In-Memory-Cache, Calendar-Event-basierte Online-Meeting-Erstellung
- DB-Migration: `admin_settings` um `microsoft_tenant_id`, `microsoft_client_id`, `microsoft_client_secret_encrypted`, `microsoft_refresh_token_encrypted`, `microsoft_user_email`, `microsoft_connected_at`. `appointments` um `teams_join_url`, `teams_meeting_id`.
- 5 OAuth-Routes:
  - `GET /api/admin/microsoft/connect` — initiiert Authorization-Code-Flow
  - `GET /api/admin/microsoft/callback` — empfängt Code, tauscht gegen Refresh-Token, speichert verschlüsselt
  - `POST /api/admin/microsoft/disconnect` — löscht Refresh-Token
  - `GET /api/admin/microsoft/status` — fürs UI
  - `POST /api/admin/microsoft/config` — Admin trägt Tenant/Client/Secret ein
- Admin-UI in `/admin/einstellungen`: neue Section "Microsoft Teams Integration" mit App-Setup-Form (3 Felder), "Mit Microsoft verbinden"-Button, Status-Block mit Verbindungs-Email, Disconnect/Reconnect-Buttons
- `/api/booking` POST: nach DB-Insert wird Microsoft Graph aufgerufen → erstellt Calendar-Event mit `isOnlineMeeting=true` → speichert `joinUrl` + `eventId` zurück. Fallback: wenn fehlschlägt, läuft Termin trotzdem durch (ohne Teams-Link). Edge Function bekommt teams_join_url im Appointment-Object.
- `/api/admin/appointments` PATCH/DELETE: bei Reschedule wird Microsoft Meeting verschoben (PATCH /me/events/:id), bei Delete wird Meeting gelöscht (DELETE).
- Edge Function v23 (`on-booking`): nutzt jetzt `appointment.teams_join_url` (pro Termin) statt globalem Standing-Link. Standing-Link bleibt als Fallback im teamsBlockHTML.

**Sicherheit**:
- Client Secret + Refresh Token via AES-256-GCM verschlüsselt (crypto-helper.ts), Schlüssel aus ADMIN_SESSION_SECRET abgeleitet
- CSRF-State-Cookie (HttpOnly, 10 Min TTL) im OAuth-Flow
- Token-Rotation: wenn Microsoft uns einen neuen Refresh-Token gibt, wird automatisch in DB überschrieben

**Workflow für Simon**:
1. Geht in /admin/einstellungen
2. Trägt Tenant/Client/Secret ein → "Speichern" (einmalig)
3. Klickt "Mit Microsoft verbinden" → Microsoft-Login → Berechtigungen bestätigen → zurück
4. Status zeigt "✓ Verbunden als simontopalli@hyponova.onmicrosoft.com"
5. Ab dann: jede Termin-Buchung → automatisch Teams-Link in Bestätigungs-Email + Outlook-Kalender + ICS-Anhang

**TODO-Bekannt**:
- Admin-Manual-Created Appointments (über /admin/kalender) bekommen aktuell keinen Teams-Link automatisch — wird einfach nachgereicht falls Simon es braucht
- Token-Rotation alle 24 Monate: Client Secret muss erneuert werden (Microsoft sagt vorher Bescheid via Email)
- Wenn `OnlineMeetings.ReadWrite` Probleme macht (Teams Tenant Policy), Fallback ist `/me/events` mit `isOnlineMeeting:true` — das nutzen wir bereits
- Client Secret wurde im Klartext im Chat geteilt — sollte bei nächster Gelegenheit rotiert werden

## Phase 19: Simon-Feedback Sweep — UX, Email, Teams, Vollmacht-URL ✅ FERTIG (04.05.2026)

**Auslöser**: Simon-Feedback nach Test der Phase 18:
- Tranchen-Logik falsch (alle Tranchen in 2 Jahren, nicht nur eine)
- CHF-Beträge brauchen Apostroph beim Tippen
- DE-Anrede-Komma falsch ("Guten Tag X," → "Guten Tag X")
- "(Bitte nur Kopien!)" entfernen
- HYPONOVA überall fett
- Vollmacht-Download zeigt Supabase-URL (sieht unprofessionell aus)
- Kündigung: 2. Person für Ehepaare/Konkubinat
- Index-Cards: direkt zur Detail-Seite, nicht zur Übersicht
- Index-CTA: Hypothekenrechner-Button → /dienstleistungen
- Nachrichten-Antwort: Subject in Sprache der Originalnachricht
- Termin → Microsoft Teams Meeting

**Geschäftslogik gefixt:**
- `isAbloesbar()` + `isAbloesbarLocal()`: `some` → `every` (alle Tranchen müssen innerhalb 2 Jahre fällig sein, sonst Vorfälligkeitsentschädigung)

**UX-Polish:**
- `formatChfInput()`: Schweizer Apostroph beim Tippen (Ablösung-Tranchen + Kündigungs-Betrag)
- `inputMode="numeric"` für Mobile-Zahlentastatur
- Index `page.tsx`: "Eigenheim kaufen" Card → /dienstleistungen/eigenheim-kaufen, "Hypothek ablösen" Card → /dienstleistungen/hypothek-abloesen, CTA-Bottom-Button "Hypothekenrechner" → /dienstleistungen
- Footer + alle Email-Templates: HYPONOVA als `<strong>` (Edge Function v22)
- Neue Komponente `BrandText` — wandelt "HYPONOVA" in Strings automatisch in `<strong>HYPONOVA</strong>` um. Eingebunden in Footer.

**Vollmacht-URL via Proxy** (Branded URL):
- Neue Route `/api/public/vorlagen/[id]/download` — fetcht PDF aus Supabase Storage, streamt mit Original-Filename und Content-Disposition: inline
- VorlagenDownloadBlock + Edge Function v22 nutzen jetzt diese URL statt direkter Storage-URL
- Resultat: hyponova.ch/api/public/vorlagen/<id>/download statt xxx.supabase.co/storage/v1/object/public/...

**Kündigungsvorlage 2. Person** (Form + API):
- Toggle "+ Zweite Person hinzufügen" — wenn aktiv: Salutation/Vorname/Nachname für 2. Person
- PDF-Generator: Sender-Block listet beide Personen, 2 Unterschriftslinien nebeneinander mit beiden Namen
- Wenn nur 1 Person: 1 Unterschriftslinie (wie vorher)

**Email-Templates poliert (Edge Function v21 → v22):**
- DE-Anrede ohne Komma: `Guten Tag Davide D'Amato` (nicht mehr `,`)
- "(Bitte nur Kopien!)" entfernt aus DE + EN Bestätigungs-Mails
- HYPONOVA als `<strong>` im Header + Footer + Body
- Vollmacht-Links nutzen jetzt SITE_URL/api/public/vorlagen/.../download

**Nachrichten-EN-Subject:**
- DB: `contact_requests.lang` Spalte hinzugefügt (DE als Default)
- `/api/contact`: speichert lang vom I18n-Context
- Admin/nachrichten: liest msg.lang, render `subjectLabel(key, lang)`. EN-Kunde bekommt Reply mit "Re: Refinance mortgage — HYPONOVA" statt "Re: Hypothek ablösen"

**Microsoft Teams Meeting:**
- Pragmatischer Ansatz: Simon hinterlegt seinen Standing/Personal Teams Meeting Link in `/admin/einstellungen` (neue Section)
- DB: `admin_settings.teams_meeting_url` Spalte
- API: PATCH /api/admin/settings nimmt teams_meeting_url entgegen
- Edge Function v22 (action="create" + "update"): fetcht Teams-URL, rendert Block "Microsoft Teams Meeting beitreten" in Bestätigungs-Email mit Beitritts-Button. ICS bekommt URL/LOCATION-Property → Kalender-Apps zeigen direkten Klick-Link.
- Alternative für später: Microsoft Graph API + OAuth → automatische Meeting-Erstellung pro Termin

**TODO/Bekannt:**
- HYPONOVA bold ist nur in Footer + Email aktiv. Andere Pages haben "HYPONOVA" oft schon visuell stark (font-weight: 600 in Headings). Wenn Simon konkrete weitere Stellen nennt → BrandText dort einsetzen.

## Phase 18: Dokument-Vorlagen + Excel-Checklisten + Mobile-Fix ✅ FERTIG (04.05.2026)

**Auslöser**: Simon hat WhatsApp/Email gesendet — er möchte (a) das offizielle Vollmachtsformular vom Anwalt im Workflow einbauen (analog Kündigungsvorlage) und (b) die Bestätigungs-Email-Checklisten passend zur ausgefüllten Variante. Dazu Mobile-Bug auf `/abloesung` (Tranchen-Tabelle zu eng).

**Mobile-Fix Tranchen-Grid (commit a641818):**
- 3-Spalten-Grid in `AbloesungForm` stackt unter 720px (1 Spalte)
- Bonus: `inputMode="numeric"` beim Betrag → Zahlentastatur Mobile
- Bug: Title war hardcoded "Hypothekartranchen" auch bei EN — fixed via `t.qTranchen` / `t.qTranchenDesc`

**Dokument-Vorlagen (Vollmacht etc.)**:
- Tabelle `dokument_vorlagen`: id, name_de/en, description_de/en, kategorie ('abloesung'|'neukauf'|'beide'), file_url, file_name, file_size, sort_order, active. RLS: public-read aktive Einträge.
- Storage-Bucket `dokument-vorlagen` (public, max 10 MB, nur PDF). Public-read Policy auf storage.objects.
- API-Routes:
  - `/api/admin/vorlagen` GET (Liste) + POST (neu)
  - `/api/admin/vorlagen/[id]` GET/PATCH/DELETE (mit auto-cleanup alter Dateien aus Storage)
  - `/api/admin/vorlagen/upload` POST File-Upload
  - `/api/public/vorlagen?kategorie=...` GET (nur aktive)
- Admin-UI `/admin/vorlagen`: Liste mit Kategorie-Filter, neue Sidebar-Eintrag "Vorlagen" mit IconStamp. Modal mit Name DE/EN, Beschreibung DE/EN, Workflow-Selector, PDF-Upload/Replace, Sort-Order, Aktiv-Toggle.
- Customer-Touchpoints — `VorlagenDownloadBlock` Komponente:
  - Success-Screen Ablösung (vor "Nächster Schritt: Kündigung") als card-Variant
  - Success-Screen Neukauf als card-Variant
  - Upload-Portal `/upload/[token]` als compact-Banner ganz oben
  - Block rendert nur wenn aktive Vorlagen existieren (kein leerer Block)
- Email: Edge Function v20 fetcht Vorlagen aus DB via REST API (Supabase REST mit Service-Role) und rendert "Wichtige Dokumente zum Download"-Block in der Bestätigungs-Email mit Direktlinks zum PDF.

**Checklisten 1:1 an Simons offiziellen Excel-Listen** (Simon-shared/Checklisten Ablösung.xlsx + Neukauf.xlsx):
- `requiredDocumentCategories()` neu geschrieben — modular: Basis (immer) + Tätigkeit (angestellt/selbständig/pensioniert) + Workflow (abloesung/neukauf) + Objektart (efh/stwe) + (Neukauf) Status (bestehend/neubau) + (Abloesung+EFH) Baurecht
- Neue Document-Category-Keys (1:1 zu Excel-Wording): mandatsvereinbarung, steuererklaerung, konto_wertschriften, leasing_kreditvertrag, betreibungsregister, lohnausweis_aktuell, geschaeftsabschluesse_3j, rentennachweis, saeule_3a, lebensversicherung, hypothekarvertrag, aufstellung_eigenmittel, gebaeudeversicherung, fotos_liegenschaft, fragebogen_renovationen, baurechtsvertrag, grundrissplaene, katasterplan, grundrissplaene_wohnflaeche, erneuerungsfonds, kaufvertrag_werkvertrag, kubische_berechnung, baubeschrieb, grundriss_fassadenplaene, baubewilligung, zahlungsplan_oder_kostenvoranschlag, verkaufsdokumentation, kaufvertrag_entwurf
- Legacy-Keys bleiben in `DOCUMENT_CATEGORY_LABELS` für alte `documents`-Einträge (Backwards-Compat)
- Edge Function v20 DOC_LABELS synchronisiert mit `submissions.ts`

**Bekannte Punkte / TODO später**:
- Baurecht-Frage gibts im Neukauf-Fragebogen noch nicht — sobald sie hinzukommt, "baurechtsvertrag" auch dort pushen wenn EFH + baurecht=true
- Edge Function nutzt `SUPABASE_URL` env (nicht `NEXT_PUBLIC_SUPABASE_URL`) — sollte automatisch im Edge-Runtime gesetzt sein, ggf. nochmal validieren
- Simon muss Vollmacht-PDF noch hochladen (kommt vom Anwalt, ist noch nicht da). Bis dahin zeigt der VorlagenDownloadBlock nichts — passt.

## Phase 17: Custom Confirm/Toast statt Browser-Popups ✅ FERTIG (04.05.2026)
- ConfirmProvider (Promise-basiertes Modal mit ESC/Enter, danger-Variante in Rot)
- ToastProvider (auto-dismiss, success/error/info, slide-in oben rechts)
- Beide global in `Providers.tsx` — auch für public Upload-Portal
- 22 Browser-confirm/alert in 11 Dateien ersetzt (Admin Dokumente, Lead-Detail, Blogposts, Leads, Nachrichten, Upload-Portal)
- Mobile-Bug gelöst (native confirm hatte teilweise nicht funktioniert auf Handy)
- Bekannt: 1× `window.prompt` im Blog-Editor (Link-URL) noch nativ — nicht in dieser Sweep enthalten, separat lösbar mit Prompt-Modal

## Phase 16: Pre-Launch-Polish + kritischer Bug-Fix ✅ FERTIG (01.05.2026)

**Kritischer Bug — Blog/Legal-Routes crashten mit 500:**
- `isomorphic-dompurify` ist auf Vercel mit Next 16 inkompatibel
  (JSDOM/cssom Module-Load-Crash)
- Alle Routes die `sanitize.ts` importierten (blogposts, blogposts/[id],
  legal-pages/[id]) gaben 500 zurueck
- **Fix**: Library entfernt, eigener Server-Side Regex-Sanitizer in
  `src/lib/sanitize.ts`. Killt Script-Tags inkl. Inhalt, gefaehrliche
  Tags (style/iframe/object/embed/form/input/button/link/meta/base),
  on*=Inline-Event-Handler, javascript:/vbscript:/data: URLs.
  Defense-in-Depth — Auth-Schicht bleibt primaere Verteidigung.

**Cookie-Banner (DSGVO/nDSG):**
- `src/components/layout/CookieBanner.tsx`
- Floating dunkler Banner unten, slide-up Animation
- Erklaert dass nur tech-notwendige Cookies gesetzt werden
- "Verstanden"-Button speichert Consent 1 Jahr (`hyponova-cookie-consent`)
- DE+EN, Link zur Datenschutzerklaerung
- 600ms-Verzoegerung damit Banner nicht vor First-Paint reinflashed

**Vercel Analytics:**
- `@vercel/analytics` installiert + in Root-Layout
- Automatische Pageviews + Web Vitals
- Aktivierung in Vercel-Dashboard → Settings → Analytics

**Token-Cleanup Cron:**
- `vercel.json` mit `0 3 * * *` (taeglich 03:00 UTC)
- `/api/cron/prune-tokens` Endpoint, geschuetzt via `CRON_SECRET` env
- Loescht abgelaufene `lead_upload_tokens`
- ENV `CRON_SECRET` in Vercel gesetzt (Production + Preview)

**Custom 404-Page:**
- `src/app/not-found.tsx` mit Hyponova-Branding
- Header + Footer wie ueberall
- "Fehler 404" Eyebrow Orange, grosser Titel
- "Zur Startseite" + "Kontakt"-CTAs
- "Haeufig besucht" Quick-Links zu allen wichtigen Pages
- noindex robots-meta

**Sidebar + Lead-Detail Icons (Emoji → SVG):**
- `src/components/admin/AdminIcons.tsx` mit Lucide-style Outline-Icons
- 18 Icons: Dashboard, Mail, Users, Calendar, Clock, TrendingUp, Folder,
  Blog, Scale, Settings, StickyNote, CheckCircle, FileText, Pencil,
  Upload, Download, X, Plus
- Active-State im Sidebar: Icon faerbt sich Hyponova-Orange

---

## Vercel-Konfiguration nach Phase 16

ENV vars (Production + Preview):
- `ADMIN_SESSION_SECRET` — HMAC-Secret fuer Admin-Sessions
- `CRON_SECRET` — Schutz fuer /api/cron/* Endpoints
- (zusaetzlich Standard-Vars: SUPABASE_*, SMTP_*, CALDAV_*)

Pre-Launch-Liste — komplett abgehakt:
- ✅ Cookie-Banner
- ✅ Analytics (Snippet drin, in Vercel-Dashboard aktivieren)
- ✅ Token-Cleanup Cron
- ✅ Custom 404
- ✅ /admin/blogposts Bug behoben
- ⏳ Site-Passwort-Schutz: Simon muss bei Launch in /admin/einstellungen ausschalten
- ⏳ SMTP-Delay (Infomaniak SPF/DKIM): Simon-Aufgabe
- ⏳ Echte Bilder + EN-Inhalte + UID + Foto: Simon-Aufgabe

---

## Phase 15: Admin-Workspace pro Lead ✅ FERTIG + GETESTET (01.05.2026)

**Was funktioniert (vom User verifiziert)**
- ✅ **Ablösungs-Fragebogen** — alles geht durch, Sackgasse-Logik korrekt, Email kommt an
- ✅ **Upload-Portal** — Stage-then-Submit mit grossem "Hochladen"-Button, Confirmation-Screen mit "Vielen Dank"
- ✅ **Admin-Dokumente** — File-Viewer-Modal (PDF + Bilder), lesbare DE-Antworten statt JSON, Kategorie als grosser bold Titel
- ✅ **Notizen + Aufgaben** im Lead-Detail (DB-persistiert, Save-Buttons)
- ✅ **Fragebogen-Antworten editierbar** durch Simon (z.B. Telefonate)
- ✅ **Doc-Kategorie ändern + Status** mit explizitem Speichern-Button
- ✅ **Admin-Upload** für Dokumente die per Mail/Post kommen
- ✅ **Lead komplett löschen** (mit Storage-Cleanup, Cascade über alle Tabellen)
- ✅ **Mobile-Layout** sauber: Buttons in eigener Zeile, voller File-Name sichtbar
- ✅ **Sources lesbar** — "Ablösung (Fragebogen)" statt "abloesung-fragebogen", überall Umlaute statt ae/oe/ue

**API-Routes (alle requireAdmin-geschuetzt)**
- `PATCH /api/admin/submissions/[id]` — Fragebogen-Antworten ändern, Ablösbarkeit auto-recompute
- `GET/POST /api/admin/leads/[id]/todos` — Todos pro Lead
- `PATCH/DELETE /api/admin/leads/[id]/todos/[todoId]` — Todo-Edit
- `POST /api/admin/documents` — Admin-Upload mit Kategorie
- `DELETE /api/admin/leads` — erweitert um Storage-Cleanup vor Cascade-Delete

**DB-Migration (via MCP angewandt)**
- `lead_todos` (id, lead_id FK CASCADE, text, done, due_date, created_at, updated_at)
- Updated bestehende leads: `source` von Tech-Keys zu lesbaren Labels

**Lib-Helpers (src/lib/submissions.ts)**
- `formatSubmissionAnswers(type, answers)` → strukturierte {label, value, multi[]} Liste
- `formatSource(s)` / `formatCategory(k)` / `formatUploadedVia(v)` / `formatEndPath(p)`
- `KANTON_NAMES`, `OBJEKTART_LABELS`, `MODELL_LABELS`, etc. Maps

**UI-Highlights**
- File-Viewer: ESC zum Schliessen, signed URL 5min, PDF iframe / Image inline
- Todos: offen zuerst, erledigt durchgestrichen + ausgegraut
- Notizen: orangener Border bei dirty state, "✓ Gespeichert" Flash nach Save
- Doc-Card: Kategorie editierbar via Dropdown statt static, kombiniert mit Status in einem Save-Klick

---

## Was noch offen ist (nach User-Test 01.05.2026)

### Funnel
- [ ] **Neukauf-Fragebogen** vom User testen (vermutlich OK, gleiche Mechanik wie Ablösung)
- [ ] **Kündigungsvorlage** vom User testen (PDF-Generation via pdf-lib)
- [ ] **Bilder** auf `/dienstleistungen` und Detail-Pages durch echte ersetzen (aktuell Unsplash-Stocks)

### Email-Infrastruktur
- [ ] **6-Min SMTP-Delay** bei Infomaniak — SPF/DKIM-Records prüfen oder auf Resend/Postmark wechseln (out-of-scope Hyponova-Code)

### Inhalte vom Kunden (Simon)
- [ ] EN-Versionen für Impressum, AGB, Datenschutz im Admin nachtragen
- [ ] EN-Version des bestehenden Blog-Artikels "My Finance"
- [ ] UID-Nummer für Impressum (Handelsregister)
- [ ] Gründer-Foto für Über-uns-Seite
- [ ] AGB/Datenschutz vom Anwalt prüfen lassen

### Nice-to-have / Zukunft
- [ ] Slug-Strategie pro Sprache für Blog (aktuell ein Slug für DE+EN)
- [ ] Vercel-Plan-Status checken (Trial-Ende war 10.04.2026)
- [ ] Todos: Fälligkeitsdatum-Editor im UI (DB-Feld existiert schon)
- [ ] Activities-Log pro Lead (existing Tabelle, ungenutzt)

---

## Phase 14: Fragebögen + Customer-Upload + Kündigungsvorlage ✅ FERTIG (01.05.2026)

**Public Funnel-Pfade**
- `/abloesung` — Multi-Step-Fragebogen (13 Steps, Conditional Logic, Sackgasse wenn nicht ablösbar). End-Path: Offerten-Vergleich von Hyponova ODER Beratungstermin. DE+EN.
- `/neukauf` — Multi-Step-Fragebogen (4 Steps), endet immer in Termin-Buchung. DE+EN.
- `/kuendigung` — Formular für vorsorgliches Kündigungsschreiben → PDF-Download via pdf-lib. DE+EN.
- `/upload/[token]` — Tokenized Customer-Upload-Portal mit Drag&Drop, kategorisiert nach Doc-Typ, Progress-Bar, 30 Tage gültig. DE+EN.

**Geschäftslogik**
- `isAbloesbar(tranchen)`: Hypothek ist ablösbar wenn Variable ODER Fälligkeit < 24 Monate
- `requiredDocumentCategories(type, answers)`: liefert Doc-Liste je nach Tätigkeit (Angestellt/Selbständig/Pensioniert) + Objektart + Submission-Typ
- `DOC_LABELS`: 19 Standard-CH-Hypotheken-Doc-Typen mit DE+EN Labels

**API-Routes (alle mit Rate-Limit)**
- `POST /api/public/abloesung` — Lead anlegen/updaten, Submission speichern, Upload-Token erstellen (nur bei Offerten-Pfad), Email triggern
- `POST /api/public/neukauf` — Lead + Submission, Email triggern (immer Termin)
- `POST /api/public/upload/[token]` — File-Upload zu Storage-Bucket `customer-docs/{lead_id}/{category}/`
- `DELETE /api/public/upload/[token]?docId=X` — File entfernen
- `POST /api/public/kuendigung` — PDF-Generation via pdf-lib, Download
- `GET /api/admin/documents` — Aggregation pro Lead
- `GET /api/admin/documents?leadId=X` — Lead + Submissions + alle Docs
- `GET /api/admin/documents/[id]?download=1` — Signed URL (5 Min)
- `PATCH /api/admin/documents/[id]` — Status ändern (received/reviewing/accepted/rejected)
- `DELETE /api/admin/documents/[id]` — Löschen

**Admin-Dokumente (überarbeitet)**
- `/admin/dokumente` — Liste pro Kontakt mit Filter (alle / mit Docs / mit Fragebogen), Badges für Anzahl + Prüf-Status
- `/admin/dokumente/[leadId]` — Detail-View: Lead-Info, Fragebogen-Antworten als JSON-Toggle, Doc-Liste mit Status-Selector + Download-Button + Delete

**Edge Function on-booking V18**
- Neue Action `questionnaire-submitted`
  - Customer-Email mit personalisierter Doc-Checkliste, Upload-Link (bei Offerten) oder Termin-Button (bei Termin), DE+EN
  - Internal-Notification an `NOTIFY_EMAIL` env (default `info@hyponova.ch`) mit Lead + Wunsch + Upload-Link
  - CardDAV-Kontakt wird automatisch angelegt

**DB**
- `questionnaire_submissions` (id, lead_id, type, answers JSONB, status, lang, end_path)
- `lead_upload_tokens` (token PK, lead_id, submission_id, expires_at)
- `documents` erweitert: `category`, `submission_id`, `status`, `mime_type`, `uploaded_via`
- Storage-Bucket `customer-docs` (private, nur via signed URLs / service_role)

**Middleware-Änderung**
- `/upload/*` ist jetzt von Site-Passwort ausgenommen — Kunden mit Token müssen direkt zugreifen können

**i18n**
- `services.cancellationTemplate` + Desc + CTA neu in DE+EN
- Alle Public-Pages mit inline COPY-Block DE+EN

**Files (neu)**
- `src/app/abloesung/page.tsx` + `AbloesungForm.tsx`
- `src/app/neukauf/page.tsx` + `NeukaufForm.tsx`
- `src/app/kuendigung/page.tsx` + `KuendigungForm.tsx`
- `src/app/upload/[token]/page.tsx` + `UploadView.tsx`
- `src/app/admin/dokumente/[leadId]/page.tsx` (neu)
- `src/app/admin/dokumente/page.tsx` (überarbeitet)
- `src/app/api/public/{abloesung,neukauf,kuendigung}/route.ts`
- `src/app/api/public/upload/[token]/route.ts`
- `src/app/api/admin/documents/{route,[id]/route}.ts`

**Dependencies**
- `pdf-lib` für serverseitige PDF-Generierung (Kündigungsvorlage)

## Phase 13: Security-Hardening ✅ FERTIG (30.04.2026)
- [x] **C1 Auth-Guards**: 11 ungeschuetzte Admin-API-Routen jetzt mit `requireAdmin()` (leads, appointments, messages, replies, availability, blogposts, blogposts/[id], blogposts/upload, legal-pages, legal-pages/[id])
- [x] **C2 Default-Passwoerter raus**: hartkodierte Strings `Möhlin4313` und `HypoAdmin2026!` aus `admin-settings.ts` entfernt; DB-Hash ueber Migration gesetzt
- [x] **C3 HTML-Sanitization**: `isomorphic-dompurify` in `src/lib/sanitize.ts`, Allowlist von Tags + Attributen, keine `<script>`/Inline-Handler/`javascript:`-URLs mehr durchsetzbar; in Blog + Legal API beim Save angewendet
- [x] **H1 Rate-Limiting**: DB-Tabelle `rate_limit_attempts`, Limiter in `src/lib/rate-limit.ts`. Admin-Login: 8/15min/IP, Site-Login: 12/15min/IP, Reset: 3/h/IP
- [x] **H2 Session-Secret**: `ADMIN_SESSION_SECRET` ist jetzt Pflicht (≥32 Zeichen), kein Fallback mehr; in Vercel als Env gesetzt
- [x] **H3 Mass-Assignment**: Allowlists in leads/appointments/messages
- [x] **H4 bcrypt async**: alle 6 Stellen von `compareSync`/`hashSync` zu `compare`/`hash` migriert
- [x] **H5 TOTP-Encryption**: `src/lib/crypto-helper.ts` (AES-256-GCM mit Session-Secret-derived Key), `getTotpSecret`/`setTotpSecret` Helper. Legacy-Plain-Strings werden tolerant gelesen + beim naechsten Save verschluesselt
- [x] **M1 Crypto-Random**: Filenames im Upload nutzen `crypto.randomBytes` statt `Math.random`
- [x] **M2 Site-Cookie HMAC**: `/api/auth` setzt jetzt signiertes Token (`stage:"site"`); Middleware verifiziert via WebCrypto (Edge-kompatibel)
- [x] **M3 Reset-Limit**: IP-basierter Limiter zusaetzlich zum 60s-DB-Cooldown
- [x] **M4 Backup-Codes 80 Bits**: `randomBytes(10)` statt `randomBytes(5)`
- [x] **L1 SVG-Upload raus**: `image/svg+xml` aus Allowlist entfernt
- [x] **L3 Error-Masking**: Postgres-Errors werden nicht mehr 1:1 ans Frontend geleakt, generisches "Datenbankfehler"
- [x] **bcrypt cost** von 10 auf 12 erhoeht
- [x] **.claude/notes.md** Klartext-Passwoerter entfernt
- Migration: `supabase/migrations/20260430_security_hardening.sql`
- Vercel-Env: `ADMIN_SESSION_SECRET` (Production + Preview)

## Phase 12: Blog zweisprachig (DE/EN) ✅ FERTIG (30.04.2026)
- [x] **Migration**: blog_posts Spalten zu `_de` umbenannt + `_en` ergaenzt fuer title, title_highlight, badge, excerpt, content_html, reading_time, meta_description. Slug, hero_image, status, publish_at bleiben sprachunabhaengig.
- [x] **Editor** mit DE/EN-Tabs analog zu LegalPageForm. Slug wird nur aus DE-Titel auto-generiert. Reading-Time pro Sprache automatisch berechnet aus content_html_de/en.
- [x] **Public** `/blog` und `/blog/[slug]` lesen `hyponova-lang` Cookie + zeigen passende Sprache, EN faellt auf DE zurueck wenn leer
- [x] **Hero-Texte** der Liste in DE + EN (`BlogPageView` Client-Component)
- [x] **OpenGraph locale** sprachabhaengig (`de_CH` / `en_US`)
- [x] **Admin-Liste**: zeigt DE-Titel + Badge "DE/EN" wenn EN vorhanden
- [x] **SetupNotice SQL** auf neues Schema aktualisiert
- Files: `src/lib/blog-posts.ts`, `src/app/api/admin/blogposts/{route.ts,[id]/route.ts}`, `src/components/admin/blogposts/BlogPostForm.tsx`, `src/app/admin/blogposts/{new,[id]}/page.tsx`, `src/app/blog/{page.tsx,[slug]/page.tsx}`, `src/components/blog/BlogPageView.tsx`
- Migration: `supabase/migrations/20260430_blog_posts_bilingual.sql` (via MCP angewendet)

## Phase 11: Rechtliche Seiten editierbar (DE/EN) ✅ FERTIG (30.04.2026)
- [x] **Tabelle** `legal_pages` (id text PK: 'impressum'|'agb'|'datenschutz'), pro Seite jeweils DE+EN Felder fuer title, title_highlight, content_html, meta_description
- [x] **Initial-Seed** mit aktuellen DE-Texten aus den hartkodierten Seiten; EN-Felder leer (Simon ergaenzt)
- [x] **Admin** `/admin/rechtliches` (Liste mit 3 Karten + DE/EN-Status-Badges) und `/admin/rechtliches/[id]` (Editor mit DE/EN-Tabs)
- [x] **Editor**: Wiederverwendung von `BlogPostEditor` (Tiptap) — beide Sprachen werden im DOM gehalten, nur visuell ge-toggled, kein State-Verlust beim Sprachwechsel
- [x] **Public** `/impressum`, `/agb`, `/datenschutz`: Server-Components, lesen `hyponova-lang` Cookie + Inhalt aus Supabase, EN faellt auf DE zurueck wenn leer
- [x] **Hinweis-Banner** im Editor fuer AGB/Datenschutz: juristisch pruefen lassen
- [x] **revalidatePath** beim Speichern fuer sofortige Sichtbarkeit
- APIs: `/api/admin/legal-pages` (GET), `/api/admin/legal-pages/[id]` (GET/PATCH)
- Komponenten: `src/components/admin/legal/LegalPageForm.tsx`, `src/components/legal/LegalPageView.tsx`
- Lib: `src/lib/legal-pages.ts`
- Migration: `supabase/migrations/20260430_legal_pages.sql` (bereits via MCP angewendet)



---

## Phase 1–5: Website-Grundlagen (abgeschlossen)
- [x] Projekt-Setup (GitHub, Supabase, Vercel, Domain)
- [x] Homepage, Header, Footer, WhatsApp Button, ScrollReveal
- [x] Alle Seiten: Über uns, FAQ, Kontakt, Termin, AGB, Datenschutz, Impressum
- [x] Passwort-Schutz (Middleware, Cookie, Under Construction)
- [x] PageSpeed-Optimierungen, Barrierefreiheit

## Phase 6: Admin Dashboard & CRM ✅ FERTIG
- [x] Admin Login schliessbar (X-Button, zurück zur Website)
- [x] **Dashboard** — Statistik-Karten (Nachrichten, Kontakte, Termine, Abschlussrate), letzte Nachrichten/Termine/Kontakte
- [x] **Nachrichten** — Kontaktanfragen lesen, inline per E-Mail antworten (via Supabase Edge Function SMTP), als Kontakt anlegen, löschen
- [x] **Kontakte/Leads** — Listenansicht mit Status-Badges, Filter, Bearbeiten/Löschen, Formular-Modal
- [x] **Kalender** — Monatsansicht, Termine als farbige Badges, Tag anklicken → Detail-Panel mit Kundendaten, Bearbeiten/Löschen, E-Mail an Kunden
- [x] **Verfügbarkeit** — 2 Tabs:
  - Öffnungszeiten: Wochentage ein/aus, 2 Zeitfenster pro Tag (Pause/Split), rechts ausgerichtet
  - Kalender: Monatsansicht, Tage/Stunden blockieren per Klick, Legende
- [x] **Pipeline** — Kanban-Board (Drag & Drop)
- [x] **Dokumente** — Platzhalter (kommt später)
- [x] Sidebar togglebar, alle Seiten mobile-responsive, max-width 1100px

## Phase 7: Infomaniak Integration ✅ FERTIG
- [x] **Supabase Edge Function** `on-booking` (V14) — zentral für alle Integrationen
- [x] **E-Mail** via SMTP (mail.infomaniak.com:587, info@hyponova.ch)
  - Buchungsbestätigung mit ICS-Anhang
  - Terminverschiebung mit neuem ICS
  - Terminabsage mit Grund
  - Kontaktformular-Bestätigung
  - Inline-Antwort aus Admin Nachrichten
- [x] **CalDAV** Kalender-Sync (Termine → Simons Infomaniak Kalender, Europe/Zurich Zeitzone)
- [x] **CardDAV** Kontakte-Sync (Kunden → Simons Infomaniak Kontakte)
- [x] Alle Credentials als Supabase Secrets (nicht auf Vercel)

## Phase 8: Verfügbarkeit persistent ✅ FERTIG
- [x] Supabase-Tabellen: `availability` (mit slot_index für 2 Zeitfenster/Tag) + `blocked_dates`
- [x] Availability-Store liest/schreibt direkt aus Supabase (kein Memory/localStorage)
- [x] Blockierte Tage/Stunden synchronisiert mit Kundenseite
- [x] Kundenseite: Blockierte/inaktive Tage ausgegraut, nicht anklickbar
- [x] Booking-API generiert Slots aus allen aktiven Zeitfenstern pro Tag

---

## Architektur

### Frontend (Vercel)
- Next.js 16 + TypeScript + Tailwind CSS 4
- Keine Credentials auf Vercel (ausser Supabase Keys + ADMIN_PASSWORD)
- Middleware: Passwort-Schutz für öffentliche Seiten, alle /api/* frei

### Backend (Supabase)
- **Datenbank**: leads, appointments, contact_requests, availability, blocked_dates
- **Edge Function**: `on-booking` — E-Mail (SMTP), CalDAV, CardDAV, Reply
- **Secrets**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CALDAV_USER, CALDAV_PASS, CALDAV_CALENDAR_URL, CARDDAV_ADDRESSBOOK_URL
- **Storage**: logos Bucket (public)
- **MCP**: `mcp__supabase-hyponova__*` (Simons Account, für Edge Functions + SQL)

### Infomaniak
- **E-Mail**: info@hyponova.ch (Passwort in Supabase Secret SMTP_PASS, nicht hier ablegen)
- **CalDAV**: ST07312 / nCk8AYvrg7FUouEg
- **Kalender-URL**: https://sync.infomaniak.com/calendars/ST07312/b5c18253-12b3-4eb0-8bb6-143e6f639fef/
- **Kontakte-URL**: https://sync.infomaniak.com/addressbooks/ST07312/b4f935a8-0005-4550-8219-bad56b33b084/
- **Webmail**: https://ksuite.infomaniak.com/1745676/mail

### Workflows
1. **Kunde bucht Termin** → Supabase (leads + appointments) → Edge Function → E-Mail mit ICS + CalDAV Event + CardDAV Kontakt
2. **Admin verschiebt Termin** → Supabase Update → Edge Function → Verschiebungs-E-Mail mit neuem ICS + CalDAV Update
3. **Admin löscht Termin** → Supabase Delete → Edge Function → Absage-E-Mail + CalDAV Delete
4. **Kunde sendet Kontaktformular** → Supabase (contact_requests) → Edge Function → Bestätigungs-E-Mail + CardDAV Kontakt
5. **Admin antwortet auf Nachricht** → Edge Function → Antwort-E-Mail im HYPONOVA-Design

---

## Phase 10: Einstellungen + 2FA ✅ FERTIG (26.04.2026)
- [x] **Bug-Fix Blog-Prose**: globals.css Hierarchie (h1-h3, p, ul, blockquote, code, img) im Hyponova-Brand
- [x] **Tabellen**: admin_settings (singleton), admin_password_reset_tokens
- [x] **Webseiten-Passwort**: in DB gehasht, Änderung erfordert Admin-Passwort-Bestätigung
- [x] **Admin-Passwort**: Änderung per E-Mail-Token (15 Min) an simon.topalli@hyponova.ch
- [x] **2FA (TOTP)**: optional, QR-Code, 8 Backup-Codes (gehasht)
- [x] **Admin-Login**: zweistufig (Passwort + Code) sobald 2FA aktiv
- [x] **Edge Function on-booking V17**: neue Action `admin-password-reset`
- [x] **Cookie-basierte Admin-Session**: HMAC-signiert, 8h Gültigkeit, ersetzt sessionStorage
- [x] **Sidebar-Abmelden** zusätzlich zum Header-Button
- Routen: `/admin/einstellungen`, `/admin/einstellungen/passwort-bestaetigen`
- APIs: `/api/admin/settings/{site-password,admin-password,twofa}`

## Phase 9: i18n DE/EN ✅ FERTIG
- [x] I18nProvider mit Cookie-basiertem Sprachwechsel (1 Jahr)
- [x] DE|EN Toggle im Header funktional mit Accent-Farbe (#c8553d)
- [x] Alle öffentlichen Seiten übersetzt: Homepage, Kontakt, Termin, FAQ, Dienstleistungen, Über uns, Rechner
- [x] Header, Footer, LogoMarquee übersetzt
- [x] E-Mail-Vorlagen zweisprachig (Edge Function V15 mit lang-Parameter)
- [x] Booking + Contact API senden Sprache an Edge Function
- [x] **WICHTIG**: Bei neuen Features IMMER sofort DE + EN erstellen!

---

## Was noch offen ist

| Feature | Status |
|---------|--------|
| Hypothekenrechner (Belehnung + Tragbarkeit) | ✅ Erledigt |
| Ablösungs-Prozess (5-stufiger Fragebogen) | Ausstehend |
| Neukauf-Prozess | Ausstehend |
| Datei-Upload (Supabase Storage) | Ausstehend |
| i18n in Komponenten integrieren | Ausstehend |
| SEO (Schema.org, Sitemap) | ✅ Erledigt |
| Gründer-Foto für Über-uns | Vom Kunden nötig |
| UID-Nummer für Impressum | Vom Kunden nötig |
| AGB/Datenschutz vom Anwalt prüfen | Vom Kunden nötig (Texte jetzt in DB editierbar) |
| EN-Versionen Impressum/AGB/Datenschutz | Simon muss im Admin nachtragen |
| Blog zweisprachig (DE/EN-Editor) | ✅ Erledigt (Phase 12) |

---

## Zugang
- **Website**: hyponova.ch (Site-PW liegt in `admin_settings.site_password_hash`, Aenderung via /admin/einstellungen)
- **Admin**: hyponova.ch/admin (Admin-PW liegt in `admin_settings.admin_password_hash`, Reset via "Passwort vergessen" auf Login-Screen)
- **Git**: Orionlab4313/hyponova.ch (Email: 224979510+Orionlab4313@users.noreply.github.com)
- **Vercel**: hyponova / info-35941487 (Pro Trial, läuft ab ~10.04.2026)
- **Supabase**: dqryxcdwvuborlayjain (info@hyponova.ch Account, MCP: mcp__supabase-hyponova__)
- **Infomaniak Mail**: info@hyponova.ch
- **Infomaniak CalDAV**: ST07312 / sync.infomaniak.com
