// app/admin/system/page.js
// Operational health + env status. Shows what's configured and what's not.

import { createClient } from "@/lib/supabase-server";

const C = {
  bgCard: "#131316", border: "#1f1f25",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", critical: "#c45c5c", sage: "#b8d0a8", high: "#c49a5c",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

export const dynamic = "force-dynamic";

function envCheck() {
  return [
    { name: "NEXT_PUBLIC_SUPABASE_URL", set: !!process.env.NEXT_PUBLIC_SUPABASE_URL, critical: true },
    { name: "SUPABASE_SERVICE_ROLE_KEY", set: !!process.env.SUPABASE_SERVICE_ROLE_KEY, critical: true },
    { name: "ANTHROPIC_API_KEY", set: !!process.env.ANTHROPIC_API_KEY, critical: true },
    { name: "GEMINI_API_KEY", set: !!process.env.GEMINI_API_KEY, critical: true, note: "Existing dashboard features depend on this." },
    { name: "CRON_SECRET", set: !!process.env.CRON_SECRET, critical: true },
    { name: "NEXT_PUBLIC_SITE_URL", set: !!process.env.NEXT_PUBLIC_SITE_URL, critical: true },
    { name: "X_API_KEY + 3 others", set: !!(process.env.X_API_KEY && process.env.X_API_SECRET && process.env.X_ACCESS_TOKEN && process.env.X_ACCESS_TOKEN_SECRET), critical: false, note: "X auto-posting" },
    { name: "INSTAGRAM_ENABLED", set: process.env.INSTAGRAM_ENABLED === "true", critical: false, note: "Set true after Meta approves your app" },
    { name: "PADDLE_LINK_PERSONAL_PRO_MONTHLY", set: !!process.env.PADDLE_LINK_PERSONAL_PRO_MONTHLY, critical: false, note: "Paddle checkout (monthly)" },
    { name: "PADDLE_LINK_PERSONAL_PRO_QUARTERLY", set: !!process.env.PADDLE_LINK_PERSONAL_PRO_QUARTERLY, critical: false },
    { name: "PADDLE_LINK_PERSONAL_PRO_YEARLY", set: !!process.env.PADDLE_LINK_PERSONAL_PRO_YEARLY, critical: false },
    { name: "PADDLE_LINK_BUSINESS_MONTHLY", set: !!process.env.PADDLE_LINK_BUSINESS_MONTHLY, critical: false },
    { name: "PADDLE_LINK_BUSINESS_QUARTERLY", set: !!process.env.PADDLE_LINK_BUSINESS_QUARTERLY, critical: false },
    { name: "PADDLE_LINK_BUSINESS_YEARLY", set: !!process.env.PADDLE_LINK_BUSINESS_YEARLY, critical: false },
    { name: "ADMIN_EMAILS", set: !!process.env.ADMIN_EMAILS, critical: false, note: "Falls back to NEXT_PUBLIC_ADMIN_EMAIL if unset" },
  ];
}

async function loadFailures() {
  try {
    const sb = await createClient();
    const { data } = await sb.from("social_posts")
      .select("platform, error_message, posted_at, article_id")
      .eq("status", "failed")
      .order("posted_at", { ascending: false })
      .limit(10);
    return data || [];
  } catch {
    return [];
  }
}

async function loadAdminLog() {
  try {
    const sb = await createClient();
    const { data } = await sb.from("admin_log")
      .select("action, details, performed_by, created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    return data || [];
  } catch {
    return [];
  }
}

export default async function AdminSystem() {
  const env = envCheck();
  const failures = await loadFailures();
  const log = await loadAdminLog();

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, margin: "0 0 6px" }}>System</h1>
        <p style={{ color: C.textSec, fontWeight: 300, fontSize: 13 }}>Configuration health, failure log, audit trail.</p>
      </div>

      <Card title="Environment configuration">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {env.map((e) => (
            <div key={e.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 12, fontFamily: mono, color: C.text }}>{e.name}</div>
                {e.note && <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{e.note}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.set ? C.sage : (e.critical ? C.critical : C.high) }} />
                <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", color: e.set ? C.sage : (e.critical ? C.critical : C.high) }}>
                  {e.set ? "SET" : (e.critical ? "MISSING" : "OPTIONAL")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recent social-post failures (last 10)">
        {failures.length === 0 ? (
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: mono }}>No recent failures.</div>
        ) : (
          failures.map((f, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
              <div style={{ fontFamily: mono, color: C.critical, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>
                {f.platform} · {new Date(f.posted_at).toUTCString().slice(5, 22)}
              </div>
              <div style={{ color: C.textSec, marginTop: 4 }}>{f.error_message || "—"}</div>
            </div>
          ))
        )}
      </Card>

      <Card title="Admin audit log (last 15)">
        {log.length === 0 ? (
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: mono }}>No admin actions logged yet.</div>
        ) : (
          log.map((l, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: mono, color: C.gold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>{l.action}</span>
                <span style={{ fontFamily: mono, color: C.textDim, fontSize: 10 }}>{new Date(l.created_at).toUTCString().slice(5, 22)}</span>
              </div>
              <div style={{ color: C.textDim, fontSize: 11, marginTop: 3 }}>by {l.performed_by || "unknown"}</div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, marginBottom: 18 }}>
      <h2 style={{ fontSize: 18, fontFamily: serif, fontWeight: 400, margin: "0 0 14px" }}>{title}</h2>
      {children}
    </div>
  );
}
