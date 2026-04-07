import SpyDashboard from "@/components/SpyDashboard";

export default function DemoPage() {
  const demoUser = {
    id: "demo",
    email: "demo@atlasspy.com",
    name: "Demo Operator",
    tier: "professional",
  };

  return <SpyDashboard user={demoUser} isDemo={true} />;
}
