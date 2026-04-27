# Atlas Intelligence — Phase 11 Deployment Runbook

This phase transforms atlasspy.com from a marketing site into an
intelligence portal with daily auto-published briefs, X + Instagram
distribution, and a TradingView-style conversion funnel.

The build is **additive** — it does not delete anything. Your existing
dashboard at `/app` and all marketing pages continue to work unchanged.

---

## What gets deployed

### New public surface
- `/` — new homepage (atrium, globe, brief feed, conversion CTAs)
- `/intelligence` — public archive of all briefs, filterable
- `/intelligence/[slug]` — single brief with co-analyst + conversion wall
- `/api/feed.xml` — outbound RSS (Atlas as a citable source)

### Daily autopilot
- `/api/cron/curate` → 06:00 UTC daily — pulls 20 RSS sources, scores items, asks Claude for editorial pick, generates brief, persists, recomputes Atlas Index
- `/api/cron/post-x` → 06:30 UTC daily — posts the latest brief to X with branded card
- `/api/cron/post-instagram` → 07:00 UTC daily — same for Instagram, **silently skipped until enabled**

### State-of-the-art differentiators
- **Atlas Index** — global threat score in the header ribbon, updated daily
- **Atlas Globe** — Three.js cinematic globe, brass meridians, hotspot markers, visitor beacon
- **Co-Analyst** — every brief has a Claude-powered Q&A widget grounded in the article
- **Branded OG cards** — auto-generated per article via `next/og`
- **Sector-aware feed** — articles tagged with sector affinities for future personalisation
- **TradingView-style wall** — 60% visible to anonymous, 100% to free signups, premium tools to paid

### New schema
- `articles` — daily Atlas-format briefings
- `social_posts` — log of every X / IG publish attempt
- `atlas_index_history` — daily threat-score snapshots
- `saved_articles`, `newsletter_subscribers`, `coanalyst_turns`

---

## Deployment sequence

### 1 · Run the schema migration
Open Supabase → SQL Editor → paste and run `supabase/schema-additions.sql`.
Idempotent. Safe to re-run.

### 2 · Set environment variables on Vercel
See `.env.example` for the full list. Three blocks:

**Required immediately:**
- `NEXT_PUBLIC_SITE_URL` — `https://atlasspy.com`
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Settings → API → `service_role`
- `ANTHROPIC_API_KEY` — console.anthropic.com → API Keys
- `CRON_SECRET` — generate with `openssl rand -hex 32`

**Required for X auto-posting:**
- `X_API_KEY` / `X_API_SECRET` — from X Developer Portal app
- `X_ACCESS_TOKEN` / `X_ACCESS_TOKEN_SECRET` — generated while signed in to the Atlas brand account ("Access Token and Secret" button on the same page)

**Public social URLs (footer + JSON-LD):**
- `NEXT_PUBLIC_TWITTER_URL` / `NEXT_PUBLIC_INSTAGRAM_URL` / `NEXT_PUBLIC_LINKEDIN_URL`

**Instagram (leave `INSTAGRAM_ENABLED=false` until Meta approves):**
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `INSTAGRAM_ACCESS_TOKEN` (long-lived; refresh every ~50 days)

### 3 · Set up the X account
1. developer.x.com → Sign up → Create Project + App
2. Choose Pay-Per-Use (default for new accounts since 6 Feb 2026)
3. App settings → User authentication settings → enable OAuth 1.0a, set permissions to **Read and write**
4. Keys & Tokens → Generate "API Key and Secret" → save as `X_API_KEY` / `X_API_SECRET`
5. While signed in to the Atlas brand X account, click "Generate Access Token and Secret" → save as `X_ACCESS_TOKEN` / `X_ACCESS_TOKEN_SECRET`
6. Pre-load $5–10 of credits to start. One post per day plus the OG image upload runs ~$0.30/month.

### 4 · Deploy
```bash
git add .
git commit -m "Phase 11: intelligence portal + social autopilot"
git push
```
Vercel will rebuild and the cron jobs activate automatically (defined in `vercel.json`).

### 5 · Run the first curation manually
Hit the cron URL once to generate the first brief without waiting for 06:00 UTC:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://atlasspy.com/api/cron/curate
```
Then verify the brief appears at `/intelligence`. Trigger the X post the same way:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://atlasspy.com/api/cron/post-x
```

---

## Instagram — separate activation track (2–4 weeks)

Instagram requires Meta app review before you can publish on behalf of an account. This is paperwork, not code.

### Prerequisites
- Convert the Atlas Instagram to a **Professional / Business** account
- Create a **Facebook Page** for Atlas (required even if you do not post to FB)
- Link the IG to the Page: IG app → Settings → Account Center → connect FB Page
- meta.com/business → create a Business Manager
- developers.facebook.com → create a Meta app (type: Business)

### Permissions to request (each requires its own screencast)
- `instagram_business_basic` — read profile info
- `instagram_business_content_publish` — publish photos to the account

The screencast must show: a user connecting their IG account through your app, your app requesting the permission, and the resulting publish working end-to-end. Record this with QuickTime / OBS, narrate over it, upload as part of submission.

### Once approved
1. Get the long-lived page token via Graph API Explorer
2. Get the IG Business Account ID with: `GET /me/accounts?fields=instagram_business_account`
3. Set the four env vars on Vercel: `INSTAGRAM_ENABLED=true`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `INSTAGRAM_ACCESS_TOKEN`
4. The 07:00 UTC cron will start posting on its own. No code change needed.

### Token rotation
Long-lived IG tokens expire in 60 days. Set a calendar reminder for day 50 to refresh:
```
GET https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=CURRENT_TOKEN
```
Update `INSTAGRAM_ACCESS_TOKEN` on Vercel with the new value.

---

## Operational notes

### Daily cost (steady state)
- Anthropic Claude: ~1 curation + 1 generation + ~10 co-analyst turns/day ≈ **$0.50/day**
- X pay-per-use: 1 post + 1 media upload ≈ **$0.01/day**
- Vercel Pro: existing **$20/month flat**
- Supabase: still on free tier for current volumes
- **Estimated monthly run-rate: ~$35–45/month all-in** (excluding Vercel)

### Editorial controls
The curator is intentionally conservative:
- Avoids articles already written about (3-day headline lookback)
- Penalises PR / awards / sponsored content via signal-term weights
- Diversity rule: no more than 3 of any single category in the daily shortlist
- Severity is set by Claude based on content, not the source's labelling

### Manual override
To force a specific article to be the day's pick, insert it manually in `articles` and call `/api/social/x` with `{ "slug": "..." }` and the cron secret in the Authorization header.

### Failure modes & recovery
- **Curate fails** — `social_posts` won't have anything new; fallback: prior day's brief stays as lead. Re-run curate manually.
- **X post fails** — logged in `social_posts` with `status='failed'`. The next-day cron skips already-posted articles, so a one-day failure means that brief never goes to X. Use `/api/social/x` to retry.
- **Anthropic outage** — curate fails closed. No partial / placeholder brief is published.
- **Token expiry on X** — 401 from the API. Regenerate access token in the X Developer Portal, update env vars.

### Monitoring
Vercel → Project → Logs filters on `/api/cron/*` show the daily run. Each curate run returns a structured `log` object detailing every step — easy to grep.

---

## What's intentionally NOT in this phase

- **Email delivery** — newsletter signups are stored in `newsletter_subscribers` but no email is sent yet. Add Resend / Postmark in a future phase.
- **Article search** — full-text search is wired (`?q=`) but no UI yet. Add when traffic justifies.
- **Saved-for-later UI** — the schema is ready (`saved_articles`); the toggle button on article pages is the next addition.
- **Author bylines** — every brief currently attributed to "Atlas Intelligence". Multi-analyst bylines are a future addition.
- **Modifying the existing dashboard** — `SpyDashboard.js` is untouched. The platform at `/app` continues to work exactly as before.

These are deliberate restraints to keep the scope of this phase sharp and the rollout reversible.
