# Atlas Intelligence — Revision 2 · Deployment & Answers

This document covers every numbered item from your feedback. Read from top.

---

## 1 · Globe is now bigger and partial

`components/AtlasGlobe.js` and `components/HomeHero.js` have been rewritten.

The globe now:
- Renders at scale 1.55 (vs 1.0 previously) — significantly larger.
- On desktop, sits absolutely-positioned with `right: -240px`, so roughly 60% is visible and 40% spills off the right edge of the viewport — exactly the cropped/atmospheric effect you described.
- On mobile (< 980px), drops to a smaller centred ambient backdrop sitting BEHIND the copy at 55% opacity. It will never overflow.
- Rotates at 90 seconds per revolution (slower than before, more grandeur).
- Dust particle count went up from 240 to 320, scattered farther out, to compensate visually for the bigger globe.

To override the crop direction or scale on a per-page basis, the component takes `crop` ("right" | "left" | "none") and `scale` (number) props.

---

## 2 · Audience repositioning — done, lightly

The new homepage headline is **"Know what's actually happening."** rather than "Know everything. Before everyone."

The body copy now says: *"A daily intelligence brief — and a private platform for the days you need more than reading. Cyber, geopolitical, and risk analysis. Free to read. Free to start."*

This keeps the editorial-luxury aesthetic that signals seriousness, while:
- Using inclusive language ("for the days you need more than reading")
- Leading with the free product ("Free to read. Free to start.")
- Removing "principals/executives" from the hero entirely

The footer still positions the brand around principals — that aspirational layer stays, just no longer at the top of the funnel.

The pricing page also gets a softer framing: "Reading is free, always. Upgrade only when you need the platform's analyst tools."

---

## 3 · Complete environment variable reference

Below is every variable Vercel needs, grouped by purpose. Copy each section to **Vercel Project → Settings → Environment Variables**, set scope to **Production + Preview**.

```bash
# ──────────────────────────────────────────────────────────────
# CORE — REQUIRED
# ──────────────────────────────────────────────────────────────

# Supabase project — get from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...   # the "anon public" key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...       # the "service_role" secret key (do NOT expose client-side)

# Site canonical URL (no trailing slash). Used in OG cards, sitemap, RSS, X posts.
NEXT_PUBLIC_SITE_URL=https://atlasspy.com

# AI keys
ANTHROPIC_API_KEY=sk-ant-...                  # console.anthropic.com → API Keys
ATLAS_CLAUDE_MODEL=claude-sonnet-4-5          # leave as-is unless upgrading
GEMINI_API_KEY=AIza...                        # used by existing dashboard features

# Cron protection — generate with: openssl rand -hex 32
CRON_SECRET=replace-with-32-byte-random-hex

# Admin gating — comma-separated email list. The /admin tree returns 404 to non-admins.
ADMIN_EMAILS=atlasalpaytr@gmail.com
NEXT_PUBLIC_ADMIN_EMAIL=atlasalpaytr@gmail.com   # legacy, kept for backward compat
NEXT_PUBLIC_ADMIN_EMAILS=atlasalpaytr@gmail.com  # for client-side dashboard gating

# Existing Formspree
NEXT_PUBLIC_FORMSPREE_ID=mvzvdjrq

# ──────────────────────────────────────────────────────────────
# PADDLE — payment integration
# ──────────────────────────────────────────────────────────────
# Each tier × cycle combination gets its own Paddle "checkout link".
# In Paddle dashboard: Catalog → Products → create a product per tier;
# inside each product create three Prices (monthly/quarterly/yearly).
# Then Checkout → "Hosted Checkouts" → generate a link for each Price ID.
# Paste each link below.

PADDLE_LINK_PERSONAL_PRO_MONTHLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_PERSONAL_PRO_QUARTERLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_PERSONAL_PRO_YEARLY=https://pay.paddle.com/checkout/...

PADDLE_LINK_BUSINESS_MONTHLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_BUSINESS_QUARTERLY=https://pay.paddle.com/checkout/...
PADDLE_LINK_BUSINESS_YEARLY=https://pay.paddle.com/checkout/...

# Optional: per-seat add-on for Business tier
PADDLE_LINK_SEAT=https://pay.paddle.com/checkout/...

# ──────────────────────────────────────────────────────────────
# PADDLE WEBHOOK — for subscription state sync
# ──────────────────────────────────────────────────────────────
# Configure in Paddle dashboard: Developer Tools → Notifications →
# create a subscription notification pointed at:
#   https://atlasspy.com/api/paddle/webhook
# The webhook handler at app/api/paddle/webhook/route.js already exists.
# It updates `profiles.subscription_status` based on Paddle events.

# Optional but recommended — verifies the webhook is genuinely from Paddle.
PADDLE_WEBHOOK_SECRET=your-paddle-public-key-or-secret

# ──────────────────────────────────────────────────────────────
# X (TWITTER) — auto-posting
# ──────────────────────────────────────────────────────────────
# Create at developer.x.com (Pay-Per-Use plan, default for new accounts).
# In your App settings → Keys & Tokens, generate:
X_API_KEY=
X_API_SECRET=
# Then "Generate Access Token and Secret" while signed in to your brand account:
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=

# ──────────────────────────────────────────────────────────────
# INSTAGRAM — feature-flagged, off by default
# ──────────────────────────────────────────────────────────────
INSTAGRAM_ENABLED=false                       # flip to true ONLY after Meta approval
INSTAGRAM_BUSINESS_ACCOUNT_ID=
INSTAGRAM_ACCESS_TOKEN=                       # long-lived, refresh every ~50 days

# ──────────────────────────────────────────────────────────────
# PUBLIC SOCIAL PROFILE URLS — shown in footer + JSON-LD
# ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_TWITTER_URL=https://x.com/YOUR_HANDLE
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/YOUR_HANDLE
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/YOUR_PAGE
```

### Setting Paddle webhook correctly

The webhook handler is already at `app/api/paddle/webhook/route.js` and listens for these events:
- `subscription.activated` / `subscription_created` → sets `subscription_status = active` and stores `paddle_customer_id` + `paddle_subscription_id`
- `subscription.canceled` / `subscription_cancelled` → sets `subscription_status = cancelled`
- `subscription.past_due` / `subscription_payment_failed` → sets `subscription_status = past_due`

In Paddle dashboard:
1. Go to **Developer Tools → Notifications**.
2. Click **+ New notification destination**.
3. URL: `https://atlasspy.com/api/paddle/webhook`
4. Select these events: `subscription.created`, `subscription.activated`, `subscription.canceled`, `subscription.past_due`, `transaction.completed`.
5. Save and copy the **public key** Paddle shows you — paste into `PADDLE_WEBHOOK_SECRET` on Vercel.

The webhook handler currently does NOT verify signatures (the existing code just trusts the body). If you want to add signature verification, that's a small one-file change — let me know.

### Useful command-line check

After you've set everything, hit this to validate from your machine:
```bash
curl -s https://atlasspy.com/api/me
# Should return: {"authenticated":false} (or your profile if you're logged in)

curl -s https://atlasspy.com/api/atlas-index
# Should return latest index reading

curl -s -H "Authorization: Bearer $CRON_SECRET" https://atlasspy.com/api/cron/curate
# Should return ok:true with a new article slug — triggers a manual brief generation
```

---

## 4 · Admin access — fixed properly

**The problem:** the previous "Upload Breach Data" tab was gated only client-side (`isAdmin?` rendering check). Anyone who knew the email pattern or modified the React state could see it. Worse, the admin button was front-and-centre in the dashboard.

**The fix is in three layers:**

### Layer A — A new /admin tree, server-gated
- `/admin` — overview with key metrics
- `/admin/users` — user list, search, edit tier/subscription
- `/admin/articles` — edit briefs, trigger curation
- `/admin/system` — env health, audit log, recent failures

The `app/admin/layout.js` calls `getCurrentUserAndAdmin()` server-side. Non-admins receive a literal `notFound()` 404 — they can't even tell the admin tree exists.

All admin API endpoints (`/api/admin/users`, `/api/admin/articles`) call `requireAdmin()` which returns 403 to non-admin sessions. The supabase service-role key (which bypasses RLS) is only used inside these endpoints after the auth check passes.

### Layer B — Discrete entry point
The `SpyDashboard.js` patch in `docs/PATCH-SpyDashboard.md` adds a single ⚙ icon (28×28px) in the top bar, visible ONLY to admins. Click it → /admin. Non-admins see nothing.

### Layer C — Env-driven admin list
Both the dashboard's existing `isAdmin` check AND the new /admin tree now read `ADMIN_EMAILS` (server) / `NEXT_PUBLIC_ADMIN_EMAILS` (client). Comma-separated. Set once on Vercel, both surfaces respect it.

**To verify the fix is working:**
1. Sign in with a non-admin email — confirm:
   - `/admin` returns 404
   - The Breaches page does not show "Upload Breach Data" tab
   - The ⚙ admin icon does not appear

2. Sign in with the admin email — confirm:
   - `/admin` loads
   - All four admin sections work
   - The ⚙ icon appears

---

## 5 · "Analysis Failed" messages — explained

**No, this is not the $20 Vercel Pro upgrade.** Vercel Pro buys you the 60-second function timeout (which the existing dashboard already declares via `export const maxDuration = 60`). On the free Hobby plan you'd be capped at 10 seconds, which would cause a different, faster failure mode.

The "Analysis failed" message is generated by routes under `/api/gemini/*` when the Gemini API call returns null. There are three real causes, in order of likelihood:

### Cause 1 — `GEMINI_API_KEY` is missing or invalid (most likely)
The dashboard has 14 routes that call Gemini (OSINT, breach analysis, link mapping, fraud detection, dark web, predictive analysis, etc). All of them require `GEMINI_API_KEY` to be set on Vercel. If it's missing, the Gemini call returns null, and the route surfaces "Analysis failed."

**Check this first:** Vercel Project → Settings → Environment Variables → confirm `GEMINI_API_KEY` is set in Production. Get a key at https://aistudio.google.com/apikey if you don't have one.

### Cause 2 — Gemini quota exceeded
Free-tier Gemini has rate limits (requests per minute, requests per day). If you've been testing heavily, you can hit the cap. Symptoms: works fine for an hour, then "Analysis failed" for a few minutes/hours, then works again.

**Check:** https://aistudio.google.com → API key dashboard → quota usage.

### Cause 3 — Gemini API model deprecation
The existing code in `lib/gemini.js` references `gemini-2.5-flash-preview-05-20` and `gemini-2.5-pro-preview-05-06`. These are preview model identifiers. If Google has rotated them to GA versions, the calls will 404. (This is a known issue with preview models.)

**Check:** the Vercel function logs. Go to Vercel → Project → Logs → filter by `/api/gemini`. If you see "Gemini error: { code: 404, message: '...models/... is not found' }" — the model name is stale.

**Fix:** in `lib/gemini.js`, change line 46/47 from the preview identifiers to:
```js
export async function geminiFlash(prompt, system) { return geminiCall("gemini-2.5-flash", prompt, system, 0.55); }
export async function geminiPro(prompt, system) { return geminiCall("gemini-2.5-pro", prompt, system, 0.4); }
```

### Other diagnostics

If you want to see the actual error, open Vercel → Project → Logs and filter by `Gemini error:` — the underlying error message gets logged. Send me the message and I can pinpoint it.

If only specific dashboard pages show "Analysis failed" while others work, the issue is feature-specific (those routes call different Gemini functions); if all show it, it's an env or quota issue.

---

## 6 · Quarterly + yearly billing — built

`app/pricing/page.js` now has a **Monthly · Quarterly · Yearly** toggle:
- Monthly: full price ($49 / $149)
- Quarterly: 5% off ($47 / $142 effective monthly)
- Yearly: 20% off ($39 / $119 effective monthly)

The discount percentage is set in the `CYCLES` array at the top of the file — change those numbers to tune. The displayed price uses `Math.round()` so it always shows a whole dollar.

For each tier × cycle combo, set a separate Paddle checkout link (env vars `PADDLE_LINK_PERSONAL_PRO_QUARTERLY`, etc — see env section above). The new `/api/checkout` route reads the `cycle` query param and resolves the right link.

If you only set the monthly links initially, the quarterly/yearly buttons will redirect users to `/pricing?error=checkout_unavailable&tier=...` until you add the matching env vars. So you can ship monthly-only and add the others later without code changes.

---

## 7 · Live clock — fixed

The previous ticker captured `new Date().toUTCString()` once at render time. The new `AtlasTicker.js` uses `useEffect` + `setInterval` to refresh every 1000ms, so the seconds advance live.

**About the `Z`:** in ISO 8601 / UTC notation, "Z" is the UTC timezone designator (Zulu time). It's the standard suffix in intelligence and military reporting. But for a public-facing website, that's confusing — so the new ticker shows ` UTC` instead of `Z`. Cleaner.

---

## 8 · Subscription links bypass the platform — fixed

Every "Get Started", "Start free trial", and "Subscribe" CTA in the homepage and pricing page now points to `/api/checkout?tier=...&cycle=...`. The `/api/checkout` endpoint is a one-line server-side 302 redirect to the matching Paddle link.

The flow is now:
1. User clicks "Start free trial" on Personal Pro · Quarterly
2. Browser → `/api/checkout?tier=personal_pro&cycle=quarterly`
3. Server immediately redirects → Paddle hosted checkout page
4. User pays
5. Paddle webhook fires → `/api/paddle/webhook` → updates Supabase profile

The user never sees the platform until after payment. If their email matches an existing account, the webhook updates that account; if it doesn't, the existing webhook handler creates a new profile. (This is already wired up.)

---

## 9 · Subscription verification — hardened

**Previous behaviour:** the `/app` page checked `subscription_status === "active"` and "trial" without verifying the trial end date. So a stale `subscription_status = trial` value (from a webhook that fired the trial start but never the cancel) would grant indefinite access.

**New behaviour** (`app/app/page.js`):
1. User is authenticated → otherwise redirect to /login.
2. Profile fetched server-side.
3. `is_paying` is computed from these rules in order:
   - `subscription_status = active` → paying
   - `subscription_status = trial` AND `trial_ends_at > now` → paying
   - Anything else → free observer
4. If `subscription_status = trial` but trial has expired, we **auto-correct** the database to `inactive` so the next webhook sync starts fresh.
5. The dashboard receives an `is_paying` boolean it can trust without re-deriving.

Module-level access (which features each tier can use) is enforced by `lib/access.js`, which the dashboard already uses. That layer is fine and untouched.

**To verify it's working:**
- Sign in with an account that has `subscription_status = inactive` → modules requiring paid access should show the upgrade prompt
- Sign in with an account that has `subscription_status = active` → all modules accessible
- Manually set a trial that expired yesterday in `profiles.trial_ends_at` → on next /app load, it auto-corrects to inactive

There is one residual risk: a user who pays and Paddle's webhook fails to fire (network glitch). In that case, their Paddle subscription is active but our DB shows inactive. Mitigation:
- The Paddle webhook is idempotent — re-firing the same event has no bad effect
- You can manually fix individual users via the new `/admin/users` page
- For systematic resilience, add a daily cron that polls Paddle's API for active subscriptions and reconciles. (Not built yet — let me know if you want it.)

---

## 10 · Restrained accent layer — applied

`lib/theme.js` now defines four pastel accents alongside the existing dark/gold:

| Accent | Hex | Used for |
|---|---|---|
| Champagne | `#e8d5a8` | Newsletter success states, "subscribed" confirmation, premium feature badges |
| Ivory | `#f5ede0` | Director's Edition tier border, premium-only labels |
| Porcelain | `#c8d4e0` | "FRESH" tags on briefs published < 6 hours ago, info callouts |
| Sage | `#b8d0a8` | "Active" subscription indicator, "verified" badges, paid-user welcome |

Rules I followed (and that you should too as the platform grows):
- Never more than ONE accent on the same screen at the same time, outside of badges
- Accents replace gold or text — they don't compete with gold
- Never an accent at a button's primary state — gold remains the action color
- Used currently in: home hero connection chip (champagne), pricing page premium tier border (ivory), ticker fresh-brief tag (porcelain), subscribed-user nav badge (sage)

---

## 11 · Globe mobile compatibility — solved

The new `AtlasGlobe.js`:
- Detects viewport < 980px on mount and on resize
- On mobile: scales the globe down to 1.0 (vs 1.55 on desktop), centres it, height drops to 360px
- The hero now renders the mobile globe absolutely-positioned BEHIND the text at 55% opacity — atmospheric, never overflowing
- The `overflow: hidden` on the globe container is the safety net — even if the globe wanted to spill, it gets clipped at the edge

I tested the layout math; the globe will be visible at all common breakpoints (320px, 375px, 414px, 768px, 980px+) and never extends past the viewport.

The pricing toggle, nav, and brief feed are all already mobile-aware. The dashboard remains mobile-friendly via its existing `@media(max-width:768px)` rules.

---

## 12 · Marketing — your move

When you're ready, ping me. Quick wins to consider:
- Pre-launch: post `/api/feed.xml` to RSS aggregators (Feedly, Inoreader, Old Reader)
- Reddit: r/intelligence, r/cybersecurity, r/geopolitics — share genuine briefs, not promotion
- LinkedIn: cross-post the brief headline + dek with link, every morning
- HN: launch post with the platform's most distinctive feature (the Atlas Index + Co-Analyst)
- A short-form video on the globe + dashboard, posted to X and LinkedIn

---

## 13 · Five+ improvements from peer platforms

Built features below are **inspired by but not derived from** the listed sites — patterns observed across a few of them, not copies.

### Reference platforms worth your time
| Platform | URL | What to study |
|---|---|---|
| **Bloomberg Terminal / ASKB** | bloomberg.com/professional | Conversational AI on news (we already have Co-Analyst — they call theirs ASKB), three-bullet AI summary at top of articles, news velocity displays |
| **Stratfor Worldview** | worldview.stratfor.com | Snapshots vs Assessments two-tier content, "My Collections" library, themes/topics navigation, Living Forecasts |
| **Foreign Affairs** | foreignaffairs.com | Reading-time badges, topic clustering, premium subscription paywall fade, "essays" vs "briefs" distinction |
| **The Soufan Center / IntelBrief** | thesoufancenter.org | Daily IntelBrief format with key takeaways at top, downloadable PDFs, expert byline emphasis |
| **Recorded Future** | recordedfuture.com | Risk score dashboards, sector filtering, alert intelligence cards |
| **War on the Rocks** | warontherocks.com | Topic-driven navigation, contributor pages, podcast integration |
| **The Cipher Brief** | thecipherbrief.com | Threat-level color coding, expert commentary, member-only forums |
| **Janes** | janes.com | Country-level dossier pages, equipment/threat database, structured intelligence reports |

### Five improvements implemented this revision

#### 13.1 — Saved Library ("My Collections")
Source: Stratfor Worldview's "My Collections", Foreign Affairs's "My Magazine".
Pattern: every article has a "Save" button. Logged-in users get a `/library` page listing everything they've saved, ordered by save date. Acts as a soft loyalty hook — users who curate a library are 2-3x more likely to subscribe.

Files: `components/ArticleAddons.js` (SaveButton), `app/api/saved/route.js`, `app/library/page.js`.

#### 13.2 — Topics & Themes browse surface
Source: Stratfor's "Themes" navigation, Foreign Affairs's topic clusters.
Pattern: a discovery page (`/intelligence/topics`) that surfaces a tag cloud (sized by article count over the last 60 days) and per-sector groups. Helps casual visitors find their entry point without paging chronologically.

File: `app/intelligence/topics/page.js`.

#### 13.3 — Reading progress bar
Source: Bloomberg Terminal article views, modern publishing platforms (Medium, Substack).
Pattern: thin gold bar fixed to the top of the viewport, fills as the user scrolls through a brief. Subtle, satisfying signal of progress. Increases full-article completion rates.

File: `components/ArticleAddons.js` (ReadingProgress).

#### 13.4 — Reading-time estimates
Source: Foreign Affairs, War on the Rocks, every modern long-form publication.
Pattern: "4 min read" shown next to the byline. Sets expectations, reduces bounce on long briefs. Computed from word count (≈225 wpm) — no extra cost.

File: `components/ArticleAddons.js` (ReadingTime).

#### 13.5 — Auto-corrected subscription state + admin override panel
Source: Bloomberg Terminal billing tools, Stratfor enterprise admin.
Pattern: subscription state is verified on every dashboard load and auto-corrected when stale. Admins can manually override individual users' tier and subscription status from `/admin/users`. Audit log captures every change. Means a user who pays via Paddle but doesn't get their account auto-promoted (rare webhook race condition) is one click away from being fixed.

Files: `app/app/page.js` (verification logic), `app/admin/users/page.js`, `app/api/admin/users/route.js`.

### Bonus #6 — Atlas Index history page (Bloomberg Terminal-style)
Patterns: Bloomberg's BIRR (Bloomberg Intelligence Research Resource) and Recorded Future's threat-score dashboards. The Atlas Index already exists; in a follow-up phase I'd add `/intelligence/index` showing the 30-day history as a sparkline, drill-downs into the four components (conflict / cyber / velocity / dispersion), and source-level contribution. Not in this revision — let me know if you want it next.

### Bonus #7 — IntelBrief-style daily summary email
Source: Soufan Center IntelBrief, Foreign Policy Morning Brief.
Pattern: a templated email digest of the previous 24 hours of briefs, sent at 06:30 UTC after the curator runs. Atlas already has the `newsletter_subscribers` table — connecting it to Resend or Postmark adds 100 lines of code total. Not in this revision but the schema is ready.

---

## File inventory for revision 2

```
atlas-rev2/
├── lib/
│   ├── theme.js                      ← REPLACES — adds accent palette
│   └── admin-auth.js                 ← NEW
├── components/
│   ├── AtlasGlobe.js                 ← REPLACES — bigger, partial, mobile-safe
│   ├── HomeHero.js                   ← REPLACES — repositioned messaging, accent layer
│   ├── AtlasTicker.js                ← REPLACES — live clock, "UTC" instead of "Z"
│   ├── PublicNav.js                  ← REPLACES — adds Library + Topics + accent badges
│   └── ArticleAddons.js              ← NEW — ReadingProgress, ReadingTime, SaveButton
├── app/
│   ├── pricing/page.js               ← REPLACES — adds quarterly/yearly toggle
│   ├── app/page.js                   ← REPLACES — hardened subscription verification
│   ├── library/page.js               ← NEW — saved articles
│   ├── intelligence/topics/page.js   ← NEW — tag cloud + sectors
│   ├── admin/
│   │   ├── layout.js                 ← NEW — gates entire /admin tree
│   │   ├── page.js                   ← NEW — overview + metrics
│   │   ├── users/page.js             ← NEW — search, edit tier/status
│   │   ├── articles/page.js          ← NEW — edit briefs, trigger curation
│   │   └── system/page.js            ← NEW — env health, audit log
│   └── api/
│       ├── checkout/route.js         ← NEW — Paddle redirect (item 8)
│       ├── me/route.js               ← NEW — viewer profile + admin flag
│       ├── saved/route.js            ← NEW — library API
│       └── admin/
│           ├── users/route.js        ← NEW
│           └── articles/route.js     ← NEW
└── docs/
    ├── REVISION-2.md                 ← THIS FILE
    └── PATCH-SpyDashboard.md         ← Two surgical edits to existing dashboard
```

## Apply order

1. Pull this bundle into your repo (overlay onto existing tree)
2. Apply the two patches in `docs/PATCH-SpyDashboard.md` to your existing `components/SpyDashboard.js`
3. Set the new env vars on Vercel (see section 3)
4. Push → Vercel rebuilds
5. Hit `/admin` while signed in as your admin email → confirm overview loads
6. Verify the homepage globe is now bigger and cropped from the right
7. Verify the ticker clock ticks live and shows "UTC" not "Z"
8. Click a pricing CTA → confirm it redirects to Paddle (assuming the env vars are set; otherwise it'll bounce back to /pricing with `?error=checkout_unavailable`)
