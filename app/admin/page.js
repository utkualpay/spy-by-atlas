// app/admin/page.js
// Admin landing — at-a-glance metrics: users, articles, social posts, revenue signals.

import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

const C = {
  bgCard: "#131316", border: "#1f1f25",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  champagne: "#e8d5a8", sage: "#b8d0a8", sageDim: "rgba(184,208,168,0.10)",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

export const dynamic = "force-dynamic";

async function loadStats() {
  try {
    const supabase = await createClient();
    const [
      profilesR, articlesR, recentArticlesR,
      socialR, newslettersR, atlasR,
    ] = await Promise.all([
      supabase.from("profiles").select("subscription_status, tier, created_at"),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("articles").select("id, slug, headline, published_at, view_count").eq("published", true).order("published_at", { ascending: false }).limit(5),
      supabase.from("social_posts").select("platform, status, posted_at").order("posted_at", { ascending: false }).limit(20),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("atlas_index_history").select("score, label, recorded_at").order("recorded_at", { ascending: false }).limit(1),
    ]);

    const profiles = profilesR.data || [];
    const total = profiles.length;
    const paying = profiles.filter((p) => p.subscription_status === "active").length;
    const trialing = profiles.filter((p) => p.subscription_status === "trial").length;
    const observers = total - paying - trialing;

    return {
      users: { total, paying, trialing, observers },
      articles: articlesR.count || 0,
      recentArticles: recentArticlesR.data || [],
      socialPosts: socialR.data || [],
      newsletters: newslettersR.count || 0,
      atlasIndex: atlasR.data?.[0] || null,
    };
  } catch (e) {
    return { error: String(e?.message || e) };
  }
}

function Metric({ label, value, sub, color }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 22 }}>
      <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontFamily: serif, fontWeight: 300, color: color || C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 8, fontFamily: mono }}>{sub}</div>}
    </div>
  );
}

export default async function AdminOverview() {
  const stats = await loadStats();
  if (stats.error) {
    return <div style={{ color: "#c45c5c" }}>Failed to load stats: {stats.error}</div>;
  }
  const recentSocialOk = stats.socialPosts.filter((s) => s.status === "posted").length;
  const recentSocialFailed = stats.socialPosts.filter((s) => s.status === "failed").length;

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, margin: "0 0 6px" }}>Overview</h1>
        <p style={{ color: C.textSec, fontWeight: 300, fontSize: 13 }}>Operational state of Atlas Intelligence.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 30 }}>
        <Metric label="Total Users" value={stats.users.total} sub={`${stats.users.paying} paying · ${stats.users.trialing} trial`} />
        <Metric label="Paying Subscribers" value={stats.users.paying} sub={stats.users.paying > 0 ? `~$${stats.users.paying * 49}+/mo run-rate` : "No paid yet"} color={stats.users.paying > 0 ? C.sage : C.textSec} />
        <Metric label="Published Briefs" value={stats.articles} sub={`${stats.recentArticles.length} recent`} />
        <Metric label="Newsletter" value={stats.newsletters} sub="email subscribers" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 30 }}>
        <Metric
          label="Atlas Index"
          value={stats.atlasIndex ? stats.atlasIndex.score : "—"}
          sub={stats.atlasIndex ? `${stats.atlasIndex.label} · last computed ${new Date(stats.atlasIndex.recorded_at).toUTCString().slice(5, 22)}` : "Index not yet computed"}
          color={C.gold}
        />
        <Metric
          label="Social Autopilot (last 20)"
          value={`${recentSocialOk} ok`}
          sub={recentSocialFailed > 0 ? `${recentSocialFailed} failed — see System` : "All recent posts succeeded"}
          color={recentSocialFailed > 0 ? "#c45c5c" : C.sage}
        />
      </div>

      {/* Recent briefs */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontFamily: serif, fontWeight: 400, margin: 0 }}>Recent Briefs</h2>
          <Link href="/admin/articles" style={{ fontSize: 10, fontFamily: mono, color: C.gold, textDecoration: "none", letterSpacing: 1.5, textTransform: "uppercase" }}>Manage all →</Link>
        </div>
        {stats.recentArticles.length === 0 ? (
          <div style={{ fontSize: 12, color: C.textDim }}>No briefs yet — trigger /api/cron/curate to seed the first one.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.recentArticles.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <Link href={`/intelligence/${a.slug}`} style={{ fontSize: 14, color: C.text, textDecoration: "none", fontFamily: serif }}>{a.headline}</Link>
                  <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, marginTop: 2 }}>
                    {new Date(a.published_at).toUTCString().slice(5, 22)} · {a.view_count || 0} views
                  </div>
                </div>
                <Link href={`/admin/articles?slug=${a.slug}`} style={{ fontSize: 10, fontFamily: mono, color: C.gold, textDecoration: "none", letterSpacing: 1.5, textTransform: "uppercase" }}>Edit</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
        <h2 style={{ fontSize: 18, fontFamily: serif, fontWeight: 400, margin: "0 0 14px" }}>Quick actions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/users" style={{ padding: "10px 18px", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>Manage users</Link>
          <Link href="/admin/articles" style={{ padding: "10px 18px", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>Edit briefs</Link>
          <Link href="/admin/system" style={{ padding: "10px 18px", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>System health</Link>
        </div>
      </div>
    </div>
  );
}
