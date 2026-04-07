# Spy by Atlas

Private intelligence platform. Built with Next.js, Supabase, and Anthropic Claude.

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                   # http://localhost:3000
```

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Step-by-step deployment to Vercel + atlasspy.com
- **[MARKETING.md](./MARKETING.md)** — Launch strategy, channels, metrics
- **[supabase/schema.sql](./supabase/schema.sql)** — Database schema (run in Supabase SQL Editor)
- **[.env.example](./.env.example)** — All required environment variables

## Architecture

```
atlasspy.com/           → Marketing landing page (public)
atlasspy.com/demo       → Demo dashboard (public, limited)
atlasspy.com/login      → Supabase auth login
atlasspy.com/signup     → Supabase auth signup
atlasspy.com/app        → Protected dashboard (requires auth)
atlasspy.com/api/*      → Server-side API routes (Claude, Stripe, CPIR)
```

All Claude API calls are routed through Next.js API routes. The Anthropic API key is never exposed to the client.

## Required Services

| Service | Purpose | Cost |
|---------|---------|------|
| Supabase | Auth + Database | Free tier |
| Anthropic | OSINT, Intel, Breach, Footprint searches | Usage-based |
| Vercel | Hosting | Free tier |
| Stripe | Payments (optional at launch) | Transaction-based |
| Formspree | Research request forms | Free tier |
