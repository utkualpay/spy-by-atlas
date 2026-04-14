import { NextResponse } from "next/server";
const LINKS = {
  analyst: process.env.IYZICO_LINK_ANALYST || null,
  director: process.env.IYZICO_LINK_DIRECTOR || null,
};
export async function GET(req) {
  const tier = new URL(req.url).searchParams.get("tier");
  if (tier === "enterprise") return NextResponse.redirect(new URL("/app?page=consult", req.url));
  if (!tier || !LINKS[tier]) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  const link = LINKS[tier];
  if (!link || link.includes("REPLACE")) return NextResponse.json({ error: `Set IYZICO_LINK_${tier.toUpperCase()} env var` }, { status: 503 });
  return NextResponse.redirect(link);
}
