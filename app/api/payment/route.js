import { NextResponse } from "next/server";

const PAYMENT_LINKS = {
  observer:   process.env.IYZICO_LINK_OBSERVER   || null,
  analyst:    process.env.IYZICO_LINK_ANALYST     || "https://iyzi.link/REPLACE_ANALYST",
  director:   process.env.IYZICO_LINK_DIRECTOR    || "https://iyzi.link/REPLACE_DIRECTOR",
  enterprise: null,
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier");

  if (!tier || !(tier in PAYMENT_LINKS)) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }
  if (tier === "observer") {
    return NextResponse.redirect(new URL("/app", req.url));
  }
  if (tier === "enterprise") {
    return NextResponse.redirect(new URL("/app?page=consult", req.url));
  }

  const link = PAYMENT_LINKS[tier];
  if (!link || link.includes("REPLACE_")) {
    return NextResponse.json({ error: `Payment link for ${tier} not configured. Set IYZICO_LINK_${tier.toUpperCase()} in environment variables.` }, { status: 503 });
  }

  return NextResponse.redirect(link);
}
