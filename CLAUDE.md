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

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
