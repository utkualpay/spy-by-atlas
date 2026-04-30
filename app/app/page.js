// app/app/page.js — REVISION 2
//
// Hardened subscription verification. The previous version trusted
// `subscription_status` as authoritative without checking trial expiry
// dates, which meant a stale "trial" status could still grant access
// past the trial window.
//
// New verification (in order):
//   1. User must be authenticated. If not → /login.
//   2. Profile is fetched server-side.
//   3. We compute a single `is_paying` boolean:
//        active                                       → true
//        trial AND trial_ends_at > now                → true
//        anything else                                → false
//   4. We pass `is_paying` and `effective_tier` to the dashboard so it
//      can show the same gating client-side without re-deriving.
//
// The dashboard already has `lib/access.js` which gates each module by
// tier. That module-level gating still works exactly as before.

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SpyDashboard from "@/components/SpyDashboard";
import { isAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function computePayingState(profile) {
  if (!profile) return { is_paying: false, effective_tier: "observer" };
  const status = profile.subscription_status;
  const trialEnds = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const now = new Date();

  if (status === "active") {
    return { is_paying: true, effective_tier: profile.tier || "personal_pro" };
  }
  if (status === "trial" && trialEnds && trialEnds > now) {
    return { is_paying: true, effective_tier: profile.tier || "personal_pro" };
  }
  // Fallthrough — observer (free)
  return { is_paying: false, effective_tier: "observer" };
}

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { is_paying, effective_tier } = computePayingState(profile);

  // Auto-correct stale subscription_status if a trial expired without webhook
  if (profile?.subscription_status === "trial" && !is_paying) {
    try {
      await supabase.from("profiles").update({ subscription_status: "inactive" }).eq("id", user.id);
    } catch {}
  }

  const userData = {
    id: user.id,
    email: user.email,
    name: profile?.full_name || user.user_metadata?.full_name || "Operator",
    tier: effective_tier,                          // gating uses this
    raw_tier: profile?.tier || "observer",         // un-overridden source value
    account_type: profile?.account_type || null,
    subscription_status: profile?.subscription_status || "inactive",
    is_paying,
    is_admin: isAdminEmail(user.email),
    trial_started_at: profile?.trial_started_at,
    trial_ends_at: profile?.trial_ends_at,
    card_on_file: profile?.card_on_file || false,
    onboarded: profile?.onboarded || false,
    tour_completed: profile?.tour_completed || false,
    email_reports_preference: profile?.email_reports_preference || "platform_only",
    preferred_language: profile?.preferred_language || "en",
    industry: profile?.industry,
    role: profile?.role,
    interests: profile?.interests,
    concerns: profile?.concerns,
  };

  return <SpyDashboard user={userData} isDemo={false} />;
}
