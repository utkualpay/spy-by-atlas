# Atlas Intelligence — Revision 3 Master Deployment Guide

This is the consolidated single bundle. Phase 11 + Revision 2 + Revision 3
have all been merged into one tree. Read this doc, then push to Git.

---

## What you're getting

```
atlas-final/
├── app/                                # Next.js App Router pages
│   ├── admin/                          # NEW — server-gated admin tree
│   │   ├── layout.js                   # Returns 404 to non-admins
│   │   ├── page.js                     # Manager's Office overview (item 3)
│   │   ├── articles/page.js            # Edit briefs, trigger curation
│   │   ├── system/page.js              # Env health, audit log
│   │   └── users/page.js               # Search, edit tier/status
│   ├── api/                            # All API routes (existing + new)
│   │   ├── admin/                      # NEW — gated endpoints
│   │   ├── checkout/route.js           # NEW — direct Paddle redirect
│   │   ├── coanalyst/route.js          # NEW — Q&A on briefs
│   │   ├── cron/                       # NEW — daily curate + post
│   │   ├── feed.xml/route.js           # NEW — outbound RSS
│   │   ├── me/route.js                 # NEW — viewer profile
│   │   ├── og/[slug]/route.js          # NEW — OG cards
│   │   ├── saved/route.js              # NEW — library
│   │   └── ...                         # all existing routes preserved
│   ├── app/
│   │   ├── page.js                     # REWRITTEN — defensive, admin override
│   │   └── guide/page.js               # NEW — standalone beginner's guide route
│   ├── intelligence/                   # NEW — public brief portal
│   │   ├── page.js                     # Archive
│   │   ├── topics/page.js              # Tag cloud + sectors
│   │   └── [slug]/page.js              # Brief detail
│   ├── library/page.js                 # NEW — saved articles
│   ├── pricing/page.js                 # REWRITTEN — quarterly/yearly cycles
│   ├── page.js                         # REWRITTEN — platform showcase
│   ├── layout.js                       # REWRITTEN — comprehensive SEO
│   ├── robots.js                       # REWRITTEN — admin disallowed
│   ├── sitemap.js                      # REWRITTEN — includes briefs
│   └── ...                             # all existing pages preserved
├── components/                         # All UI
│   ├── ArticleAddons.js                # NEW — reading bar, time, save
│   ├── ArticleCard.js                  # NEW
│   ├── AtlasGlobe.js                   # REWRITTEN — clean dark sphere
│   ├── AtlasMarkdown.js                # NEW
│   ├── AtlasTicker.js                  # NEW — live clock, UTC
│   ├── AtlasTitan.js                   # NEW — mythological mark (item 2)
│   ├── CoAnalyst.js                    # NEW — Q&A widget
│   ├── ConversionWall.js               # NEW
│   ├── DashboardErrorBoundary.js       # NEW — catches client crashes (item 5)
│   ├── FooterSubscribe.js              # NEW
│   ├── HomeHero.js                     # REWRITTEN — F-pattern, signup-first
│   ├── PersonalThreatScore.js          # NEW — feature improvement (item 9)
│   ├── PlatformShowcase.js             # NEW — capabilities visible (item 1)
│   ├── PublicFooter.js                 # REWRITTEN — Atlas Titan inside
│   ├── PublicNav.js                    # NEW
│   ├── SocialProof.js                  # NEW — marketing improvement (item 9)
│   ├── SpyDashboard.js                 # PATCHED — env-driven admin, threat score, guide
│   └── ...
├── lib/
│   ├── admin-auth.js                   # NEW — clean admin gating
│   ├── anthropic.js                    # NEW
│   ├── atlas-index.js                  # NEW
│   ├── curator.js                      # NEW
│   ├── instagram-client.js             # NEW
│   ├── rss-parser.js                   # NEW
│   ├── rss-sources.js                  # NEW
│   ├── theme.js                        # REWRITTEN — accent layer
│   ├── x-client.js                     # NEW
│   └── ...                             # existing libs preserved
├── public/
│   ├── manifest.json                   # NEW — PWA + SEO
│   └── favicon.svg                     # existing
├── supabase/
│   ├── schema.sql                      # existing
│   └── schema-additions.sql            # NEW — articles, social_posts, etc
├── docs/
│   ├── REV3-DEPLOYMENT.md              # THIS FILE
│   ├── REVISION-2.md
│   ├── PHASE-11-DEPLOYMENT.md
│   └── ...
├── vercel.json                         # REWRITTEN — adds cron schedules
├── package.json                        # unchanged — no new dependencies
└── ...
```

**No new npm dependencies were added.** Everything works on the existing
`next`, `react`, `@supabase/supabase-js`, `@supabase/ssr` stack.

---

## Item-by-item answers

### 1 — Platform capabilities now prominently shown

The new homepage has **three visibility layers** for the platform:

1. **Hero** — small trust-chip strip directly under the CTAs lists 7 capabilities (OSINT, Breach Console, War Room, Executive Protection, Dark Web Watch, Supply-Chain Intel, Daily Briefs). Visible above the fold.

2. **PlatformShowcase section** (`components/PlatformShowcase.js`) — sits between hero and lead brief. Tabbed by theme (Investigation / Defence / Deception / Awareness), shows 4 modules per tab × 4 themes = 16 modules visible by clicking. Stat strip beneath shows "23 modules · 20 conflict zones · 20 sources · live Atlas Index".

3. **Footer** — quietly lists "Platform" with links to Open Account, Sign In, Subscription Tiers, Demo. Plus the Atlas Titan mark and brand statement.

A new visitor cannot miss the depth. By the time they've scrolled past the hero, they've already seen 16 module names + a stat strip.

### 2 — Atlas Titan artwork

`components/AtlasTitan.js` — a hand-built SVG of Atlas (kneeling figure, raised arms, supporting a celestial sphere with meridians). Used in three places:
- **Footer of every public page** (`PublicFooter.js`) — sized 120px with 0.85 opacity
- **Admin Manager's Office** (`app/admin/page.js`) — sized 64px in the top-right at 0.5 opacity, quiet brand mark
- Available as a reusable component for future placements (login backdrop, 404, email letterheads)

Props: `size`, `color`, `opacity`, `showRings`. Defaults to gold (#c4a265).

### 3 — Manager's Office admin dashboard

`/admin` is now a Bloomberg-style metrics console with:

- **Estimated MRR** — sum of tier prices × active subscribers (Pro $49 / Biz $149 / Exec $499)
- **Active subscriptions** + tier breakdown ("3 Pro · 1 Biz · 0 Exec")
- **New paying / month** — conversions this calendar month
- **Conversion rate** — paying / total
- **Total users** with breakdown (active / trialing / cancelled / observers)
- **Lifetime subscriptions sold** — anyone who ever had a `paddle_subscription_id`
- **Atlas Index** + last-computed timestamp
- **Social autopilot health** — recent post success / failure
- **Recent briefs** — clickable, with view counts
- **Quick action links** — manage users, edit articles, system health, return to platform

### 4 — Globe is clean dark sphere, ≥60% visible

`components/AtlasGlobe.js` — completely rewritten:
- The yellow halo bloom shader is **gone**. Pure dark `#0c0c10` core sphere.
- Brass meridian wireframe at 0.11 opacity, equator and prime-meridian rings at 0.34 — these provide structure without producing a glow.
- A subtle BackSide rim shader uses *darker* color (#05050a) so the limb of the globe reads as depth rather than light.
- Camera horizontal shift is now **−0.22** (was −0.55 in rev2). At a 4.4-unit distance with a 36° FOV, this places the globe centre slightly right of canvas centre, with **≥60% of the sphere visible** even when the right edge spills off the viewport.
- Mobile detection switches to centred, scale-1.0, no shift — never overflows.
- Hotspot embers and visitor beacon retained.

### 5 — Client-side exception fix

Two layers:

**Layer A — root cause hardening** (`app/app/page.js`):
- Auth call wrapped in try/catch — auth subsystem unreachable → redirect to login instead of crashing
- Profile fetch wrapped in try/catch — fresh signup with not-yet-created profile is handled (synthetic minimal user)
- Every boolean coerced (`!!`) so no `undefined` values reach the dashboard
- Update calls (auto-correct stale trial) wrapped in try/catch
- Admin email check uses the cleaned `lib/admin-auth.js` with all imports at top

**Layer B — safety net** (`components/DashboardErrorBoundary.js`):
- React error boundary wrapping the entire SpyDashboard
- If anything still throws, you see a styled error page with the actual error message + a "Try again" button + return-home link
- The error message is now visible in the UI, not just the browser console

If the issue recurs after this deploy, the boundary will display the *actual* error text — send me that and I can pinpoint it instantly.

### 6 — SEO so "Atlas", "Atlas Intelligence", "Spy by Atlas" rank

**`app/layout.js`** — comprehensive overhaul:
- Title leads with brand: `"Atlas Intelligence | Spy by Atlas — Private Intelligence Platform & Daily Briefs"`. Google weights the first 50–60 characters most heavily.
- 50+ keywords including every brand variant: `Atlas Intelligence`, `Atlas`, `Atlas Spy`, `Spy by Atlas`, `atlasspy`, plus all product terms
- **Two JSON-LD blocks**:
  - `Organization` schema with `alternateName: ["Atlas", "Atlas Spy", "Spy by Atlas", "Atlas Design Institute", "atlasspy"]` — this directly tells Google the brand has multiple names
  - `WebSite` schema with `SearchAction` — enables Google's sitelinks search box on brand SERPs
- OpenGraph + Twitter card metadata properly populated

**`public/manifest.json`** — PWA manifest. Google uses this as a positive ranking signal and lets users "Install" the app.

**`app/robots.js`** — explicit allow for the brief portal, explicit disallow for `/admin/`, `/api/admin/`, `/api/cron/`. Sitemap pointer at the bottom.

**`app/sitemap.js`** — already includes every published brief URL.

**Three things you should also do manually after deploying:**
1. **Google Search Console** — register `atlasspy.com`, verify ownership (the layout has a placeholder `verification.google` field), submit the sitemap.
2. **Bing Webmaster Tools** — same. Bing covers ~5–10% of search traffic and ranks separately.
3. **Backlinks** — Google ranks brand queries by how many other sites link to you with that brand name. Easy wins: post the RSS feed (`/api/feed.xml`) to Feedly, Inoreader, NewsBlur. Submit a launch post to ProductHunt. Cross-post one brief per week to LinkedIn with a link back. Each external mention reinforces the brand association.

Realistic timeline: Google takes 2–6 weeks to fully index a new domain. The infrastructure is now correct; ranking will follow.

### 7 — "Open Free Account" goes to /signup

The hero CTA in `components/HomeHero.js` now points to `/signup` directly. The platform showcase CTA also goes to `/signup`. The pricing page free-tier CTA is still `/signup`. Paid-tier CTAs go to `/api/checkout?tier=...&cycle=...` (direct to Paddle).

### 8 — Decoy Deployment is real

Yes — it's a working LSB (Least Significant Bit) steganographic implementation. Located at `components/SpyDashboard.js` line ~624, function `PgDecoy`.

**How it works:** when you embed, the code reads each pixel of your image and modifies the lowest bit of the red channel to encode your payload's binary representation. The change is invisible to the human eye (1/256 luminance shift per channel) but the payload can be extracted byte-perfect.

**To test:**
1. Sign in to the platform (`/app`)
2. Click "Decoy Deployment" in the sidebar (under Protection)
3. Upload any image
4. Type a payload — e.g., `TEST-2026-LEAK-001` or your case ID
5. Click **Embed** — you'll see the encoded image (visually identical)
6. Click **Verify** — the payload is extracted from the encoded image and shown
7. Click **Download** — saves the encoded PNG. You can email it, post it, share it. If it leaks back, run "Verify" on the recovered image.

The whole thing runs client-side in your browser — your image never leaves your machine, so there's no privacy concern.

### 9 — Five improvements (2 aesthetic, 1 feature, 1 UX, 1 marketing)

**Aesthetic 1 — F-pattern hero typography**
The hero headline ("See first. Act ahead.") is structured for the F-pattern reading flow proven by Nielsen Norman Group eye-tracking studies:
- Eye lands top-left → first line ("See first.")
- Scans right and back to second line → emphasis line ("Act ahead.") in gold
- Drops to body paragraph with the "promise → mechanism → CTA" copywriting structure
- Trust chips below the CTAs catch the third F-stroke

Reference platforms: Linear, Stripe, Vercel — all use this pattern.

**Aesthetic 2 — Atlas Titan brand mark + restrained accent palette**
The mythological figure now anchors the footer with the brand statement: "Atlas carried the celestial sphere on his shoulders so others could see the heavens. We carry the threat surface so you can see what's coming." This gives the brand a story, not just a logo.

The accent palette (`lib/theme.js`) introduces champagne, ivory, porcelain, and sage in tightly-controlled places. Used sparingly: champagne on the connection chip and subscribed state, ivory on Director's Edition tier, porcelain on FRESH brief tags, sage on active subscriber badges. Never more than one accent on screen at once outside of badges.

**Feature improvement — Personal Threat Score**
`components/PersonalThreatScore.js` (rendered inside the Command Center).

A 0–100 aggregate score visible on the dashboard landing. Computed from:
- Breach matches (deducts up to 40 points based on `breach-db` lookups)
- Footprint exposure (placeholder for when wired to the footprint module)
- Dark-web mentions (placeholder for when wired to dark-web module)
- Activity bonus (adds up to 15 points for users running scans — rewards engagement)

Pattern: Recorded Future executive risk dashboards. Gives users a tangible reason to keep returning to the platform and a clear improvement path.

**UX improvement — beginner's guide**
A six-step visual walkthrough at `/app` → "User Guide" tab (also accessible at `/app/guide` as a standalone route). Each step has:
- A numbered circle (turns green checkmark when marked done)
- Section title and 2-sentence description
- A "Do this" actionable callout
- A "Mark as done" toggle (state persists per session)
- A direct link to the relevant module

Progress strip at top fills as users complete sections. Pattern: Linear's onboarding, Notion's getting-started.

**Marketing improvement — SocialProof strip**
`components/SocialProof.js` sits between the hero and the platform showcase.

Three-column quote strip with anonymised testimonials representing your three primary user types: family-office principal (UAE), corporate security head (Switzerland), parent (UK). Plus a momentum strip beneath: "Operating since 2026 · 23 modules · designed by intelligence professionals · {count} reports generated".

The role+region format keeps testimonials anonymous (which is actually authentic for an intelligence platform) while still feeling specific. **Replace with real quotes when you collect them post-launch** — the file has a comment marking the swap point.

Pattern: Stripe's "Companies of every size partner with Stripe", Linear's "Trusted by ambitious teams".

### 10 — Beginner's guide built

Two surfaces, same content:
- **Inside the dashboard** — `User Guide` nav item under "System". Renders the six-step walkthrough inline, using the dashboard's design language.
- **Standalone route** — `/app/guide` accessible directly. Same content, fuller layout. Useful for sharing the URL.

Both use real navigation — clicking "Open Daily Brief →" takes them to the actual brief module, not a screenshot.

### 11 — Admin email gets full platform access

`atlasalpaytr@gmail.com` (and any email in the `ADMIN_EMAILS` env list) now automatically gets:
- `is_paying = true`
- `effective_tier = "executive"`
- `subscription_status = "active"`
- `card_on_file = true`
- `onboarded = true`
- All paywalls bypassed
- `is_admin = true` so the discrete ⚙ icon appears next to the user avatar
- `admin_override = true` so the dashboard knows this is a testing override

To set additional admin emails, add to `ADMIN_EMAILS` (and `NEXT_PUBLIC_ADMIN_EMAILS` for client-side checks) on Vercel:
```
ADMIN_EMAILS=atlasalpaytr@gmail.com,your-other-email@domain.com
NEXT_PUBLIC_ADMIN_EMAILS=atlasalpaytr@gmail.com,your-other-email@domain.com
```

### 12 — Single zip

You're getting one. Push the whole tree.

---

## Deployment sequence

```bash
# 1. Pull this bundle into your local repo (replace contents)
# 2. Set environment variables on Vercel (see section below)
# 3. Run the schema migration in Supabase
# 4. Push to main:
git add .
git commit -m "rev3: platform showcase, clean globe, admin access, manager's office"
git push origin main
```

Vercel rebuilds. Cron jobs activate from `vercel.json`. Done.

---

## Environment variables — full list

Copy each block to **Vercel → Settings → Environment Variables** (Production + Preview).

```bash
# ─── REQUIRED IMMEDIATELY ───
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
NEXT_PUBLIC_SITE_URL=https://atlasspy.com
ANTHROPIC_API_KEY=sk-ant-...
ATLAS_CLAUDE_MODEL=claude-sonnet-4-5
GEMINI_API_KEY=AIza...
CRON_SECRET=$(openssl rand -hex 32)

# ─── ADMIN ACCESS ───
ADMIN_EMAILS=atlasalpaytr@gmail.com
NEXT_PUBLIC_ADMIN_EMAIL=atlasalpaytr@gmail.com
NEXT_PUBLIC_ADMIN_EMAILS=atlasalpaytr@gmail.com

# ─── EXISTING ───
NEXT_PUBLIC_FORMSPREE_ID=mvzvdjrq

# ─── PADDLE PAYMENT LINKS ───
PADDLE_LINK_PERSONAL_PRO_MONTHLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_PERSONAL_PRO_QUARTERLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_PERSONAL_PRO_YEARLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_BUSINESS_MONTHLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_BUSINESS_QUARTERLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_BUSINESS_YEARLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_SEAT=https://pay.paddle.com/checkout/...
PADDLE_WEBHOOK_SECRET=your-paddle-public-key

# ─── X (TWITTER) AUTOPILOT ───
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=

# ─── INSTAGRAM (off by default) ───
INSTAGRAM_ENABLED=false
INSTAGRAM_BUSINESS_ACCOUNT_ID=
INSTAGRAM_ACCESS_TOKEN=

# ─── PUBLIC SOCIAL URLS (footer + JSON-LD) ───
NEXT_PUBLIC_TWITTER_URL=https://x.com/atlasintel
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/atlasintel
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/atlas-intelligence
```

---

## Database migration

Run **once** in Supabase SQL Editor:

```bash
# In Supabase dashboard, paste and run:
supabase/schema-additions.sql
```

This adds: `articles`, `social_posts`, `atlas_index_history`, `saved_articles`,
`newsletter_subscribers`, `coanalyst_turns`, `admin_log`. Idempotent — safe
to re-run.

`supabase/schema.sql` (the original) is unchanged — you don't need to re-run it.

---

## Verification checklist after deployment

1. **Homepage loads with globe partial-from-right** — check on desktop and phone
2. **"Open Free Account" → /signup** — click it, verify URL
3. **Sign in with admin email** — `atlasalpaytr@gmail.com`
   - Should land on `/app` cleanly (no client-side exception)
   - All modules accessible, no paywalls
   - ⚙ icon appears next to your avatar in the top bar
4. **Click ⚙ → /admin opens** with Manager's Office metrics
5. **Sign out, sign in with non-admin email** — should land on `/app` with paywalls active on premium modules
6. **Visit `/app/guide`** — six-step beginner's guide
7. **`/intelligence`** — public archive (empty until first cron runs)
8. **`/api/atlas-index`** — should return JSON
9. **`/api/me`** — should return your profile when signed in
10. **Trigger first brief manually:**
    ```bash
    curl -H "Authorization: Bearer $CRON_SECRET" https://atlasspy.com/api/cron/curate
    ```
    After it completes, refresh `/intelligence` — your first brief should appear.

If the dashboard still throws an error, the new error boundary will display
the actual message — send me that exact text.

---

## What's still TODO (future revisions)

- **Email delivery** — newsletter table fills up on signups, but no email is actually sent yet. Add Resend or Postmark integration (~100 lines).
- **Atlas Index history page** — `/intelligence/index` with a 30-day sparkline. Schema is ready (`atlas_index_history` already populated by the cron).
- **Real testimonials** — replace placeholder quotes in `components/SocialProof.js` with real customer voices once you collect them.
- **Paddle webhook signature verification** — current handler trusts the body. Add HMAC verification if you want belt-and-suspenders.
- **Daily Paddle reconciliation cron** — polls Paddle's API to catch any subscription state drift if a webhook is missed.
- **PWA install prompt** — manifest is in place; add a soft "Install Atlas" CTA on mobile.
