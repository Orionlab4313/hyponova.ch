---
name: HYPONOVA hosting setup
description: Vercel hosting, Infomaniak DNS, Supabase Storage for images, password protection details
type: project
---

HYPONOVA Website ist live deployed.

**Hosting**: Vercel (Account: hyponova / info-35941487, Pro Trial)
- Project: hyponova-ch
- Vercel Org ID: team_joRmfAFvOTp0i26TAkXjL6zl
- Vercel Project ID: prj_7SYwUMhrPowftwt6awJ4VfXCCJsm
- Node.js Version: 20.x (nicht 24!)
- Functions Region: Frankfurt (fra1)

**Domain**: hyponova.ch (Infomaniak DNS)
- A Record: hyponova.ch → 76.76.21.21
- CNAME: www.hyponova.ch → cname.vercel-dns.com

**Passwort-Schutz**: Next.js Middleware, Passwort: Möhlin4313
- Cookie hält 30 Tage
- "Webseite wird gerade erstellt" Landing Page

**Supabase Storage**: Logos bucket (public)
- Partner-Logos: akb.jpg, tkb.png, vaudoise.jpg, mobiliar.jpg, migros-bank.png, ubs.webp, cler.jpg, raiffeisen.webp, bkb.png
- HYPONOVA Logo: hyponova-logo.png (zugeschnitten, 800x219)

**Git Config (WICHTIG)**:
- user.name: Orionlab4313
- user.email: 224979510+Orionlab4313@users.noreply.github.com
- Bei jedem Push auf main deployed Vercel automatisch
