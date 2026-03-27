# HYPONOVA – Entwicklungsnotizen

## Status: Seiten-Ausbau (27.03.2026)

### Erledigt
- [x] GitHub Repo erstellt (Orionlab4313/hyponova.ch)
- [x] Domain hyponova.ch registriert (Infomaniak, Kunden-Account)
- [x] Supabase Projekt erstellt (Kunden-Account: dqryxcdwvuborlayjain)
- [x] Next.js 16 Projekt aufgesetzt (TypeScript, Tailwind 4)
- [x] Grundstruktur mit allen 10 Seiten/Routes
- [x] Header (Desktop + Mobile Nav, Sprach-Switcher Platzhalter)
- [x] Footer (3-Spalten, Navigation, Rechtliches, Adresse)
- [x] WhatsApp Floating Button
- [x] Übersetzungen DE + EN vorbereitet (i18n/translations.ts)
- [x] Homepage mit Hero, Partner-Logos, Vorteile, CTA
- [x] Über uns: Hero, Mission, Werte-Grid (3 Karten), Gründer-Abschnitt, CTA
- [x] FAQ: Accordion-Komponente (Framer Motion) + 10 Hypotheken-FAQs
- [x] Kontakt: Formular (Vorname, Nachname, E-Mail, Telefon, Betreff, Nachricht) + Kontaktinfos
- [x] Termin: Cal.com Platzhalter + Was-erwartet-Sie (3 Schritte)
- [x] AGB: Vollständige AGB (9 Abschnitte, Schweizer Recht)
- [x] Datenschutz: nDSG-konforme Erklärung (10 Abschnitte)
- [x] Impressum: Vollständig mit Firma, Kontakt, HR, Haftung, Urheberrecht

### Nächste Schritte
- [ ] Hypothekenrechner (Belehnung + Tragbarkeit)
- [ ] Ablösungs-Prozess (5-stufiger Fragebogen)
- [ ] Neukauf-Prozess
- [ ] Kontaktformular an Supabase anbinden
- [ ] Kontaktformular Datei-Upload hinzufügen
- [ ] Cal.com Terminbuchung einbetten (Account nötig)
- [ ] i18n in alle Komponenten integrieren
- [ ] Sicheres Dokumenten-Upload Portal
- [ ] Unterlagenchecklisten (3 Varianten × Objekttyp)
- [ ] Kündigungsvorlage PDF
- [ ] SEO (Meta-Tags, Schema.org, Sitemap)
- [ ] Responsive Testing
- [ ] Figma Design auswählen/erstellen

### Offene Fragen an Kunden
- WhatsApp-Nummer für den Floating Button?
- Fotos/Bilder für Über-uns Seite (Gründer-Foto)?
- Cal.com Account erstellt?
- Telefonnummer für Kontakt/Impressum?
- UID-Nummer für Impressum?
- AGB + Datenschutz Texte vom Anwalt prüfen lassen?

### Supabase
- **Projekt-Ref**: dqryxcdwvuborlayjain
- **Region**: eu-central (Zürich)
- **Plan**: Free
- **Zugriff**: Via Supabase CLI mit `--linked` Flag
- **CLI-Befehl**: `SUPABASE_ACCESS_TOKEN=... npx supabase db query --linked "SQL"`
- **Tabellen erstellt**: contact_requests (id, first_name, last_name, email, phone, subject, message, created_at)

### Kosten-Übersicht (monatlich nach Launch)
- Vercel: $0-20/mo (Free reicht zum Start)
- Supabase: $0/mo (Free Plan)
- Domain: ~CHF 15/Jahr (Infomaniak)
- Cal.com: $0/mo (Free Plan)
