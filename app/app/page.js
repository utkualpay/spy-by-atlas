import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SpyDashboard from "@/components/SpyDashboard";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userData = {
    id: user.id,
    email: user.email,
    name: profile?.full_name || user.user_metadata?.full_name || "Operator",
    tier: profile?.tier || "observer",
    account_type: profile?.account_type || null,
    subscription_status: profile?.subscription_status || "inactive",
    onboarded: profile?.onboarded || false,
    industry: profile?.industry,
    role: profile?.role,
    interests: profile?.interests,
    concerns: profile?.concerns,
  };

  return <SpyDashboard user={userData} isDemo={false} />;
}
