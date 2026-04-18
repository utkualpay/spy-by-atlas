import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function POST(req) {
  try {
    const body = await req.json();
    const event = body.event_type || body.alert_name;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const email = body.data?.customer?.email || body.email;
    if (!email) return NextResponse.json({ received: true });
    const updates = {};
    if (event === "subscription.activated" || event === "subscription_created") {
      updates.subscription_status = "active";
      updates.paddle_customer_id = body.data?.customer?.id || body.user_id;
      updates.paddle_subscription_id = body.data?.subscription_id || body.subscription_id;
    } else if (event === "subscription.canceled" || event === "subscription_cancelled") {
      updates.subscription_status = "cancelled";
    } else if (event === "subscription.past_due" || event === "subscription_payment_failed") {
      updates.subscription_status = "past_due";
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from("profiles").update(updates).eq("email", email);
    }
    return NextResponse.json({ received: true });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
