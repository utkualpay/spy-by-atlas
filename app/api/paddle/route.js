import { NextResponse } from "next/server";
// Paddle checkout redirect
// When Paddle is configured, this creates a checkout session
// For now, redirects to Paddle checkout links (set in env vars)
const LINKS = {
  personal_pro: process.env.PADDLE_LINK_PERSONAL || process.env.IYZICO_LINK_ANALYST || null,
  business: process.env.PADDLE_LINK_BUSINESS || process.env.IYZICO_LINK_DIRECTOR || null,
  business_seat: process.env.PADDLE_LINK_SEAT || null,
  executive: null, // contact only
};
export async function GET(req) {
  const tier = new URL(req.url).searchParams.get("tier");
  if (tier === "executive") return NextResponse.redirect(new URL("/app?page=consult", req.url));
  if (!tier || !LINKS[tier]) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  const link = LINKS[tier];
  if (!link || link.includes("REPLACE")) return NextResponse.json({ error: `Payment link for ${tier} not configured. Set PADDLE_LINK_${tier.toUpperCase()} or IYZICO_LINK env var.` }, { status: 503 });
  return NextResponse.redirect(link);
}
