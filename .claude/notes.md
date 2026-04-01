# HYPONOVA – Entwicklungsnotizen

## Status: Live (Under Construction) — Stand 01.04.2026

---

## Phase 1: Projekt-Setup
- [x] GitHub Repo erstellt (`Orionlab4313/hyponova.ch`, privat)
- [x] Domain `hyponova.ch` registriert (Infomaniak, Kunden-Account)
- [x] Supabase Projekt erstellt (Ref: `dqryxcdwvuborlayjain`, Region: Zürich, Free Plan)
- [x] Supabase Tabelle `contact_requests` erstellt
- [x] Next.js 16 Projekt mit TypeScript + Tailwind CSS 4 aufgesetzt
- [x] Vercel Deployment konfiguriert (automatisch via GitHub)

## Phase 2: Grundstruktur & Homepage
- [x] 10 Seiten/Routes angelegt
- [x] Header — Sticky, Desktop + Mobile Nav, animierter Unterstrich (framer-motion)
- [x] Footer — Dark Theme, 4-Spalten, alle Links
- [x] WhatsApp Floating Button — Expandable Menu
- [x] Übersetzungen DE + EN vorbereitet (i18n/translations.ts)
- [x] Homepage komplett: Hero, Partner-Logo Marquee (9 Logos), Services, Rechner-Teaser (CountUp), Vorteile-Grid, 3-Schritte Prozess, Testimonial, CTA
- [x] UI-Komponenten: ScrollReveal (6 Varianten), CountUp, LogoMarquee, Accordion

## Phase 3: Passwort-Schutz
- [x] Middleware-basierter Schutz für gesamte Website
- [x] "Under Construction" Landing Page
- [x] Cookie-Auth (30 Tage), API-Route `/api/auth`

## Phase 4: Platzhalter-Seiten ausgebaut
- [x] Über uns, FAQ, Kontakt, Termin, AGB, Datenschutz, Impressum

## Phase 5: Optimierungen
- [x] Zoom deaktiviert, Telefonnummer überall, Animationen beschleunigt
- [x] PageSpeed-Fixes: WCAG AA, Meta, noindex auf Login

## Phase 6: Admin Dashboard & CRM (01.04.2026)
- [x] Admin Login schliessbar (X-Button)
- [x] Kontaktformular → Supabase (`contact_requests` Tabelle)
- [x] Admin Nachrichten-Seite (Anfragen lesen, antworten, als Kontakt anlegen)
- [x] Terminbuchung mit Kalender, Zeitslots & Buchungsformular
- [x] Admin Verfügbarkeit (Wochentage, blockierte Tage/Stunden)
- [x] Admin Kalender als Monatsansicht (Termine, Detail-Panel, Bearbeiten/Löschen)
- [x] Dashboard mit Nachrichten-Statistik
- [x] Admin Sidebar togglebar auf Desktop & Mobile
- [x] Alle Admin-Seiten mobile-responsive

## Phase 7: Infomaniak Integration (01.04.2026)
- [x] Supabase Edge Function `on-booking` für alle Integrationen
- [x] E-Mail-Versand via SMTP (mail.infomaniak.com) mit HTML-Vorlagen
- [x] CalDAV Kalender-Sync (Termine in Simons Infomaniak Kalender)
- [x] CardDAV Kontakte-Sync (Kunden in Simons Infomaniak Kontakte)
- [x] ICS-Datei als E-Mail-Anhang (Kunde kann Termin in eigenen Kalender speichern)
- [x] Zeitzone Europe/Zurich korrekt im Kalender
- [x] E-Mail-Vorlagen: Buchungsbestätigung, Verschiebung, Absage, Kontaktformular
- [x] Infomaniak Webmail-Link im Admin für manuelle E-Mails

---

## Architektur

### Frontend (Vercel)
- Next.js 16 + TypeScript + Tailwind CSS 4
- Keine Credentials auf Vercel (ausser Supabase Keys)

### Backend (Supabase)
- **Datenbank**: leads, appointments, contact_requests
- **Edge Function**: `on-booking` — E-Mail, CalDAV, CardDAV
- **Secrets**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CALDAV_USER, CALDAV_PASS, CALDAV_CALENDAR_URL, CARDDAV_ADDRESSBOOK_URL
- **Storage**: logos Bucket (public) — Partner + HYPONOVA Logo

### Infomaniak
- **E-Mail**: info@hyponova.ch via SMTP (mail.infomaniak.com:587)
- **Kalender**: CalDAV (sync.infomaniak.com) — Simon Topalli Kalender
- **Kontakte**: CardDAV (sync.infomaniak.com) — Simon Topalli Adressbuch
- **Webmail**: ksuite.infomaniak.com/1745676/mail

---

## Was noch offen ist

| Feature | Status |
|---------|--------|
| Hypothekenrechner (Belehnung + Tragbarkeit) | Ausstehend |
| Ablösungs-Prozess (5-stufiger Fragebogen) | Ausstehend |
| Neukauf-Prozess | Ausstehend |
| Datei-Upload im Kontaktformular | Ausstehend |
| i18n in Komponenten integrieren | Ausstehend |
| Gründer-Foto für Über-uns | Vom Kunden nötig |
| UID-Nummer für Impressum | Vom Kunden nötig |
| AGB/Datenschutz vom Anwalt prüfen | Vom Kunden nötig |
| SEO (Schema.org, Sitemap) | Ausstehend |
| Responsive Testing | Ausstehend |

---

## Zugang
- **Website**: hyponova.ch (Passwort: Möhlin4313)
- **Admin**: hyponova.ch/admin (Passwort: HypoAdmin2026!)
- **Git**: Orionlab4313/hyponova.ch (Email: 224979510+Orionlab4313@users.noreply.github.com)
- **Vercel**: hyponova / info-35941487 (Pro Trial, läuft ab ~10.04.2026)
- **Supabase**: dqryxcdwvuborlayjain (info@hyponova.ch Account, MCP verbunden)
- **Infomaniak Mail**: info@hyponova.ch
- **Infomaniak CalDAV**: ST07312 / sync.infomaniak.com
