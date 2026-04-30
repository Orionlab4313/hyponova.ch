# HYPONOVA – Entwicklungsnotizen

## Status: Admin + i18n + Rechtliches editierbar — Stand 30.04.2026

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
