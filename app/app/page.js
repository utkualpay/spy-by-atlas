// app/app/page.js — REVISION 3
//
// Defensive against runtime issues that caused the previous client-side exception.
// Changes:
//   • Profile fetch wrapped in try/catch — if profile is missing (trigger
//     hasn't fired yet for a brand-new signup), we synthesize a minimal one.
//   • All boolean state coerced to actual booleans, never undefined.
//   • Admin emails get full executive access for testing (item 11) —
//     `is_paying = true`, `effective_tier = "executive"`.
//   • Wrapped in DashboardErrorBoundary so any rendering crash shows a
//     useful page instead of Next.js's generic exception screen.

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SpyDashboard from "@/components/SpyDashboard";
import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";
import { isAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function computeAccess(profile, email) {
  // Admin override — full access for testing (item 11)
  if (isAdminEmail(email)) {
    return { is_paying: true, effective_tier: "executive", admin_override: true };
  }
  if (!profile) {
    return { is_paying: false, effective_tier: "observer", admin_override: false };
  }
  const status = profile.subscription_status;
  const trialEnds = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const now = new Date();
  if (status === "active") {
    return { is_paying: true, effective_tier: profile.tier || "personal_pro", admin_override: false };
  }
  if (status === "trial" && trialEnds && trialEnds > now) {
    return { is_paying: true, effective_tier: profile.tier || "personal_pro", admin_override: false };
  }
  return { is_paying: false, effective_tier: "observer", admin_override: false };
}

export default async function AppPage() {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data?.user || null;
  } catch {
    redirect("/login");
  }

  if (!user) redirect("/login");

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  } catch {
    profile = null;
  }

  const { is_paying, effective_tier, admin_override } = computeAccess(profile, user.email);

  if (profile?.subscription_status === "trial" && !is_paying && !admin_override) {
    try {
      const supabase = await createClient();
      await supabase.from("profiles").update({ subscription_status: "inactive" }).eq("id", user.id);
    } catch {}
  }

  const userData = {
    id: user.id,
    email: user.email || "",
    name: profile?.full_name || user.user_metadata?.full_name || "Operator",
    tier: effective_tier,
    raw_tier: profile?.tier || "observer",
    account_type: profile?.account_type || null,
    subscription_status: admin_override ? "active" : (profile?.subscription_status || "inactive"),
    is_paying: !!is_paying,
    is_admin: !!admin_override,
    admin_override: !!admin_override,
    trial_started_at: profile?.trial_started_at || null,
    trial_ends_at: profile?.trial_ends_at || null,
    card_on_file: !!profile?.card_on_file || !!admin_override,
    onboarded: !!profile?.onboarded || !!admin_override,
    tour_completed: !!profile?.tour_completed,
    email_reports_preference: profile?.email_reports_preference || "platform_only",
    preferred_language: profile?.preferred_language || "en",
    industry: profile?.industry || null,
    role: profile?.role || null,
    interests: profile?.interests || null,
    concerns: profile?.concerns || null,
  };

  return (
    <DashboardErrorBoundary>
      <SpyDashboard user={userData} isDemo={false} />
    </DashboardErrorBoundary>
  );
}
