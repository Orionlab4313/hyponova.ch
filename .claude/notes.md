# HYPONOVA – Entwicklungsnotizen

## Status: Admin + i18n FERTIG — Stand 02.04.2026

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
- **E-Mail**: info@hyponova.ch (Passwort: Admin.Simon.4313!)
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
- [x] **Webseiten-Passwort**: in DB gehashed, Aenderung erfordert Admin-Passwort-Bestaetigung
- [x] **Admin-Passwort**: Aenderung per E-Mail-Token (15 Min) an simon.topalli@hyponova.ch
- [x] **2FA (TOTP)**: optional, QR-Code, 8 Backup-Codes (gehashed)
- [x] **Admin-Login**: zwei-stufig (Passwort + Code) sobald 2FA aktiv
- [x] **Edge Function on-booking V17**: neue Action `admin-password-reset`
- [x] **Cookie-basierte Admin-Session**: HMAC-signiert, 8h Gueltigkeit, ersetzt sessionStorage
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
| AGB/Datenschutz vom Anwalt prüfen | Vom Kunden nötig |

---

## Zugang
- **Website**: hyponova.ch (Passwort: Möhlin4313)
- **Admin**: hyponova.ch/admin (Passwort: HypoAdmin2026!)
- **Git**: Orionlab4313/hyponova.ch (Email: 224979510+Orionlab4313@users.noreply.github.com)
- **Vercel**: hyponova / info-35941487 (Pro Trial, läuft ab ~10.04.2026)
- **Supabase**: dqryxcdwvuborlayjain (info@hyponova.ch Account, MCP: mcp__supabase-hyponova__)
- **Infomaniak Mail**: info@hyponova.ch
- **Infomaniak CalDAV**: ST07312 / sync.infomaniak.com
