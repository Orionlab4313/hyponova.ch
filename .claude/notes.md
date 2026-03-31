# HYPONOVA – Entwicklungsnotizen

## Status: Live (Under Construction) — Stand 31.03.2026

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
- [x] Über uns: Hero, Mission, 3 Werte-Karten, Gründer-Abschnitt (Foto-Platzhalter), CTA
- [x] FAQ: Accordion-Komponente + 10 Hypotheken-FAQs
- [x] Kontakt: Formular (6 Felder + Erfolgs-Anzeige) + Kontaktinfos
- [x] Termin: Cal.com Platzhalter, 3-Schritte "Was erwartet Sie"
- [x] AGB: 9 Abschnitte (Gerichtsstand Möhlin)
- [x] Datenschutz: nDSG-konforme Erklärung, 10 Abschnitte
- [x] Impressum: Vollständig mit Firma, Kontakt, Vertretung

## Phase 5: Optimierungen
- [x] Zoom deaktiviert (viewport)
- [x] Telefonnummer +41 79 249 70 90 überall eingefügt
- [x] Animationen ~2x beschleunigt (Hero, ScrollReveal, CountUp)
- [x] PageSpeed-Fixes: Kontrast WCAG AA, `<main>` Landmark, Meta-Description, noindex auf Login

---

## Was noch offen ist

| Feature | Status |
|---------|--------|
| Hypothekenrechner (Belehnung + Tragbarkeit) | Ausstehend |
| Ablösungs-Prozess (5-stufiger Fragebogen) | Ausstehend |
| Neukauf-Prozess | Ausstehend |
| Kontaktformular → Supabase anbinden | Ausstehend |
| Datei-Upload im Kontaktformular | Ausstehend |
| Terminbuchung einbetten (Tool noch offen) | Ausstehend |
| i18n in Komponenten integrieren | Ausstehend |
| Gründer-Foto für Über-uns | Vom Kunden nötig |
| UID-Nummer für Impressum | Vom Kunden nötig |
| AGB/Datenschutz vom Anwalt prüfen | Vom Kunden nötig |
| CRM/Booking-Tool auswählen | Mit Kunde besprechen |
| SEO (Schema.org, Sitemap) | Ausstehend |
| Responsive Testing | Ausstehend |

---

## Tech-Stack & Kosten

| Komponente | Technologie | Kosten |
|------------|------------|--------|
| Framework | Next.js 16 + TypeScript | - |
| Styling | Tailwind CSS 4 | - |
| Animationen | Framer Motion | - |
| Datenbank | Supabase (Zürich) | CHF 0/Mt |
| Hosting | Vercel (Frankfurt) | CHF 0-20/Mt |
| Domain | Infomaniak | ~CHF 15/Jahr |
| Terminbuchung | Noch offen | TBD |

## Supabase
- **Projekt-Ref**: dqryxcdwvuborlayjain
- **Region**: eu-central (Zürich)
- **Storage**: logos Bucket (public) — 9 Partner + HYPONOVA Logo
- **Tabellen**: contact_requests

## Zugang
- **Website**: hyponova.ch (Passwort: Möhlin4313)
- **Git**: Orionlab4313/hyponova.ch (Email: 224979510+Orionlab4313@users.noreply.github.com)
- **Vercel**: hyponova / info-35941487 (Pro Trial, läuft ab ~10.04.2026)
