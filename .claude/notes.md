# HYPONOVA – Entwicklungsnotizen

## Status: Projekt-Setup (26.03.2026)

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

### Nächste Schritte
- [ ] Figma Design auswählen/erstellen
- [ ] Design auf alle Seiten anwenden
- [ ] Hypothekenrechner (Belehnung + Tragbarkeit)
- [ ] Ablösungs-Prozess (5-stufiger Fragebogen)
- [ ] Neukauf-Prozess
- [ ] Supabase CLI Setup + Login
- [ ] Supabase Schema (Kontaktformular, Dokumente)
- [ ] Kontaktformular mit Datei-Upload
- [ ] Cal.com Terminbuchung Integration
- [ ] Sicheres Dokumenten-Upload Portal
- [ ] Unterlagenchecklisten (3 Varianten × Objekttyp)
- [ ] Kündigungsvorlage PDF
- [ ] SEO (Meta-Tags, Schema.org, Sitemap)
- [ ] Responsive Testing

### Offene Fragen an Kunden
- WhatsApp-Nummer für den Floating Button?
- Partner-Logos (welche Banken/Versicherungen)?
- Fotos/Bilder für Über-uns Seite?
- AGB + Datenschutzerklärung Texte?
- Cal.com Account erstellt?

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
