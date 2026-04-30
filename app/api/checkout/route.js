// app/api/checkout/route.js
//
// Direct-to-Paddle redirect. Subscription CTAs from the homepage and pricing
// page hit this route, which 302s the user straight into the Paddle hosted
// checkout — no platform sign-in required first.
//
// Why: subscription intent is the moment of highest friction. Sending the
// user through /signup → email confirm → dashboard → upgrade button hemorrhages
// conversions. Better pattern: pay first, then provision. Paddle's webhook
// (already configured at /api/paddle/webhook) creates/updates the profile
// using the email collected by Paddle.
//
// Env vars consumed (set on Vercel for each tier × cycle combo):
//   PADDLE_LINK_PERSONAL_PRO_MONTHLY
//   PADDLE_LINK_PERSONAL_PRO_QUARTERLY
//   PADDLE_LINK_PERSONAL_PRO_YEARLY
//   PADDLE_LINK_BUSINESS_MONTHLY
//   PADDLE_LINK_BUSINESS_QUARTERLY
//   PADDLE_LINK_BUSINESS_YEARLY
//   PADDLE_LINK_SEAT (optional — for additional business seats)
//
// Backward compatibility: also reads legacy PADDLE_LINK_PERSONAL / PADDLE_LINK_BUSINESS
// (no cycle) so existing deployments keep working until you add per-cycle links.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TIER_MAP = {
  personal_pro: "PERSONAL_PRO",
  business: "BUSINESS",
  seat: "SEAT",
};

function resolvePaddleLink(tier, cycle) {
  const t = TIER_MAP[tier];
  if (!t) return null;
  const cycleKey = (cycle || "monthly").toUpperCase(); // MONTHLY / QUARTERLY / YEARLY
  // Try cycle-specific first, then legacy fallback
  return (
    process.env[`PADDLE_LINK_${t}_${cycleKey}`] ||
    process.env[`PADDLE_LINK_${t}`] ||
    // Last-resort legacy iyzico fallback
    process.env[t === "PERSONAL_PRO" ? "IYZICO_LINK_ANALYST" : t === "BUSINESS" ? "IYZICO_LINK_DIRECTOR" : ""] ||
    null
  );
}

export async function GET(req) {
  const url = new URL(req.url);
  const tier = url.searchParams.get("tier");
  const cycle = url.searchParams.get("cycle") || "monthly";

  if (!tier || !TIER_MAP[tier]) {
    return NextResponse.json({ error: "invalid_tier" }, { status: 400 });
  }

  const link = resolvePaddleLink(tier, cycle);

  if (!link || link.includes("REPLACE")) {
    // Soft-fail to /pricing with a query param so the page can show a notice
    const fallback = new URL("/pricing", req.url);
    fallback.searchParams.set("error", "checkout_unavailable");
    fallback.searchParams.set("tier", tier);
    return NextResponse.redirect(fallback);
  }

  return NextResponse.redirect(link, { status: 302 });
}
