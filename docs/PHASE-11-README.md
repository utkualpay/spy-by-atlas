# Atlas Intelligence — Phase 11 Build

This bundle is **additive** to the existing repo. Files inside merge directly into your project tree at the matching paths.

## What's inside

```
atlas-build/
├── .env.example                          ← new env vars to set on Vercel
├── vercel.json                           ← REPLACES existing — adds cron schedules
├── app/
│   ├── layout.js                         ← REPLACES existing — refreshed metadata + RSS link
│   ├── page.js                           ← REPLACES existing — new portal homepage
│   ├── sitemap.js                        ← REPLACES existing — now includes articles
│   ├── intelligence/
│   │   ├── page.js                       ← NEW — public archive
│   │   └── [slug]/page.js                ← NEW — article detail
│   └── api/
│       ├── articles/route.js             ← NEW
│       ├── articles/[slug]/route.js      ← NEW
│       ├── og/[slug]/route.js            ← NEW — OG card generator
│       ├── feed.xml/route.js             ← NEW — outbound RSS
│       ├── atlas-index/route.js          ← NEW
│       ├── coanalyst/route.js            ← NEW
│       ├── newsletter/route.js           ← NEW
│       ├── social/x/route.js             ← NEW — manual X trigger
│       ├── social/instagram/route.js     ← NEW — manual IG trigger
│       └── cron/
│           ├── curate/route.js           ← NEW — daily 06:00 UTC
│           ├── post-x/route.js           ← NEW — daily 06:30 UTC
│           └── post-instagram/route.js   ← NEW — daily 07:00 UTC
├── components/
│   ├── AtlasGlobe.js                     ← NEW — the Three.js centerpiece
│   ├── AtlasTicker.js                    ← NEW — top ribbon (index + sources)
│   ├── PublicNav.js                      ← NEW — auth-aware nav
│   ├── PublicFooter.js                   ← NEW — comprehensive footer with social
│   ├── HomeHero.js                       ← NEW — atrium with globe
│   ├── ArticleCard.js                    ← NEW
│   ├── AtlasMarkdown.js                  ← NEW — small markdown renderer
│   ├── CoAnalyst.js                      ← NEW — Q&A widget
│   ├── ConversionWall.js                 ← NEW — TradingView-style gate
│   └── FooterSubscribe.js                ← NEW — newsletter form
├── lib/
│   ├── rss-sources.js                    ← NEW — 20 curated feeds
│   ├── rss-parser.js                     ← NEW — dependency-free
│   ├── anthropic.js                      ← NEW — Claude client
│   ├── curator.js                        ← NEW — scoring + selection
│   ├── x-client.js                       ← NEW — OAuth 1.0a Twitter
│   ├── instagram-client.js               ← NEW — feature-flagged
│   └── atlas-index.js                    ← NEW — threat score calc
├── supabase/
│   └── schema-additions.sql              ← NEW — run after existing schema.sql
└── docs/
    └── DEPLOYMENT.md                     ← READ THIS FIRST
```

## Three files are replacements

When you copy this bundle into your repo, **three files overwrite existing ones**:
- `vercel.json` (adds `crons` block; preserves existing headers/rewrites)
- `app/layout.js` (refreshed metadata + RSS link tag)
- `app/page.js` (the homepage transformation — the old marketing landing now lives in `app/about` if you want to preserve it; otherwise discard)
- `app/sitemap.js` (now includes article URLs)

Everything else is new and lives in directories that don't conflict with existing files.

## What is NOT touched

- `components/SpyDashboard.js` — untouched (1813 lines)
- `app/app/page.js` — the gated platform entry, untouched
- `app/login`, `app/signup`, `app/auth/*`, `app/about`, `app/pricing`, `app/demo` — untouched
- All legal pages (`/terms`, `/privacy`, `/eula`, etc.) — untouched
- `lib/gemini.js`, `lib/i18n.js`, `lib/access.js`, `lib/theme.js`, etc. — untouched
- The Supabase schema — only **additions** (no ALTERs to existing tables)

The platform at `/app` continues to work exactly as before. This phase only adds the public-facing intelligence portal and the social autopilot.

## Read DEPLOYMENT.md before merging.

It covers env vars, Supabase migration, X account setup, Meta app review for Instagram, the cron sequence, costs, and operational recovery procedures.

## No new npm dependencies required.

This entire build relies only on what `package.json` already has:
- `next` (`next/og` ships built-in for OG images)
- `react`, `react-dom`
- `@supabase/supabase-js`, `@supabase/ssr`

Three.js is loaded dynamically from CDN (no build dep).
RSS parsing, Anthropic client, X OAuth — all hand-rolled with `fetch` + `node:crypto`.
