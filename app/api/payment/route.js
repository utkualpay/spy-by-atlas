import { NextResponse } from "next/server";

// ── IYZICO PAYMENT LINKS ────────────────────────────────────────────
// Replace these with your actual iyzico payment links after generating
// them in the iyzico dashboard (https://merchant.iyzipay.com).
//
// How to set up:
// 1. Log in to iyzico merchant panel
// 2. Go to Payment Links (Ödeme Linkleri)
// 3. Create a recurring payment link for each tier
// 4. Paste the URLs below or set them as env vars in Vercel
//
// The links handle the entire payment flow — card collection,
// 3D Secure, receipts, recurring billing. No server-side
// integration needed for link payments.

const PAYMENT_LINKS = {
  professional: process.env.IYZICO_LINK_PROFESSIONAL || "https://iyzi.link/REPLACE_WITH_YOUR_LINK",
  executive:    process.env.IYZICO_LINK_EXECUTIVE    || "https://iyzi.link/REPLACE_WITH_YOUR_LINK",
  enterprise:   null, // Contact form, no payment link
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier");

  if (!tier || !PAYMENT_LINKS[tier]) {
    return NextResponse.json(
      { error: "Invalid tier. Use: professional, executive, or enterprise." },
      { status: 400 }
    );
  }

  if (tier === "enterprise") {
    // Redirect to contact/consultancy page
    return NextResponse.redirect(new URL("/app?page=consult", req.url));
  }

  const link = PAYMENT_LINKS[tier];

  if (link.includes("REPLACE_WITH_YOUR_LINK")) {
    return NextResponse.json(
      { error: "Payment link not configured yet. Set IYZICO_LINK_PROFESSIONAL and IYZICO_LINK_EXECUTIVE in environment variables." },
      { status: 503 }
    );
  }

  return NextResponse.redirect(link);
}
