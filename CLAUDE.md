# HYPONOVA – Projekt-Anweisungen

## Projekt
- **Kunde**: Simon Topalli, HYPONOVA GmbH, Dahlienweg 22, 4313 Möhlin
- **Domain**: hyponova.ch (Infomaniak DNS)
- **Repo**: Orionlab4313/hyponova.ch (private)
- **Supabase Projekt-Ref**: `dqryxcdwvuborlayjain` (Kunden-Account, via CLI verwalten)

## Tech-Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **UI**: shadcn/ui (wird noch installiert)
- **Datenbank**: Supabase (CLI für Verwaltung, nicht MCP)
- **Hosting**: Vercel (geplant)
- **Terminbuchung**: Cal.com Embed
- **Sprachen**: Deutsch + Englisch

## Supabase CLI
Für alle Supabase-Operationen die CLI nutzen, nicht MCP:
```bash
npx supabase login
npx supabase projects list
npx supabase db push --project-ref dqryxcdwvuborlayjain
```

## Regeln
- Immer deutsche Umlaute verwenden (ä, ö, ü — nie ae, oe, ue)
- Formelle Ansprache auf der Website ("Sie", nicht "du") — Finanzbranche
- Alle Texte in DE + EN über i18n/translations.ts
- CSS Variablen für Farben in globals.css
- Notizen in .claude/notes.md pflegen
