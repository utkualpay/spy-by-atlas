# Atlas Intelligence — Revision 3.2 Hotfix

Three targeted fixes on top of revision 3.

## 1 — `isAdmin is not defined` runtime error fixed

The previous patch added a discrete ⚙ admin icon to the dashboard top bar, but referenced `isAdmin` from a scope where it wasn't defined. The original `isAdmin` declaration at line ~394 was scoped to the nested `PgBreaches({user, isDemo})` component, not the main `SpyDashboard` component where the gear icon is rendered. The browser threw `ReferenceError: isAdmin is not defined` and the whole dashboard refused to mount.

**Fix:** added an explicit admin computation at the top of the main `SpyDashboard` component:

```js
const ADMIN_EMAILS_LIST = (process.env.NEXT_PUBLIC_ADMIN_EMAILS
  || process.env.NEXT_PUBLIC_ADMIN_EMAIL
  || "atlasalpaytr@gmail.com")
  .split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

const isAdmin = !!user?.is_admin
  || (user?.email && ADMIN_EMAILS_LIST.includes(String(user.email).toLowerCase()));
```

This trusts `user.is_admin` (set server-side in `app/app/page.js`) but also does a direct env check as a fallback. The nested `PgBreaches` still has its own local `isAdmin` — that's untouched.

## 2 — Globe limited by viewport edge, not a fixed box

Previously the globe lived inside a 1.1fr grid cell with `overflow: hidden`, which meant the globe was clipped by that cell's right edge — a fixed-width box, not the actual screen. The user wanted the globe to spill off the viewport's right edge.

**Fix:** the hero is now restructured so the globe is absolutely positioned against the section's right edge with `width: 62vw`. The section itself has `overflow: hidden`, and the section spans the full viewport width — meaning the globe is now bounded by the actual screen edge.

Camera shift increased from `-0.22` to `-0.30` so the globe sits ~70% across the canvas. With the right edge of the canvas being the viewport edge, ~65% of the sphere is visible and ~35% spills off-screen. The cropping bound is the viewport, not a 1.1fr column.

## 3 — Atlas Titan redrawn in classical side profile

The previous Atlas Titan was drawn frontally — symmetric, both arms forward, looking like a frontal heraldic figure. The user requested the classical iconography: figure seen from the side, like the Farnese Atlas (Roman, 2nd c. AD) or Lee Lawrie's bronze at Rockefeller Center.

**Fix:** complete redraw. Now shows:
- Figure facing right
- Deep kneeling pose — right knee bent and planted forward, left knee on ground behind
- Both arms raised overhead, hands meeting at the underside of the sphere
- Head bowed deeply between the arms (almost touching the sphere)
- Body compressed under the load, leaning forward
- Celestial sphere with proper armillary rings: equator, tropics, ecliptic (tilted 23°), polar axis

The SVG renders as a bronze-coloured silhouette suggesting muscular form. Visible at all sizes from 64px (admin dashboard mark) to 140px+ (footer).

## Build verification

All three fixes pass build:
- ✓ Compiled successfully
- ✓ 57 static pages generated
- ✓ Zero errors, zero warnings

## What you need to do

1. Replace your local repo with this bundle
2. Push to Git
3. Verify on the live site:
   - Sign in with `atlasalpaytr@gmail.com` → `/app` should now load (no `isAdmin` error)
   - Look at the homepage — the globe should be cropped by the screen edge, not by a column
   - Scroll to the footer — the Atlas figure should now be in side profile, kneeling, with arms raised supporting the celestial sphere

If anything still throws on `/app`, the `DashboardErrorBoundary` will display the actual error message instead of the generic Next.js exception screen — send me that exact message.
