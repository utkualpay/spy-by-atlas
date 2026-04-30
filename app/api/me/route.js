// app/api/me/route.js
//
// Returns the current viewer's safe profile snapshot. Used by client
// components (dashboard, nav) to know whether to show admin shortcuts,
// subscription state, etc. Never exposes other users' data — purely "me".

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ authenticated: false });

    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, account_type, subscription_status, trial_ends_at, full_name, onboarded")
      .eq("id", user.id)
      .single();

    const now = new Date();
    const trialActive =
      profile?.subscription_status === "trial" &&
      profile?.trial_ends_at &&
      new Date(profile.trial_ends_at) > now;

    const isPaying =
      profile?.subscription_status === "active" || trialActive;

    return NextResponse.json({
      authenticated: true,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || "Operator",
      tier: profile?.tier || "observer",
      subscription_status: profile?.subscription_status || "inactive",
      trial_ends_at: profile?.trial_ends_at || null,
      is_paying: isPaying,
      is_admin: isAdminEmail(user.email),
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
