import { NextResponse } from "next/server";

export async function POST(req) {
  // Stripe integration point — requires STRIPE_SECRET_KEY env var
  // When Stripe is configured, this creates a checkout session
  try {
    const { priceId, email } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured. Set STRIPE_SECRET_KEY in environment variables." },
        { status: 503 }
      );
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://atlasspy.com"}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://atlasspy.com"}/app`,
      metadata: { product: "spy-by-atlas" },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
