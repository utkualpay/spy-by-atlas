// app/admin/page.js — REVISION 3
//
// "The Manager's Office" — full operational visibility for the admin.
// Metrics surfaced (item 3):
//   • Total users, broken down by status (active/trial/observer)
//   • Active subscriptions count
//   • This month's revenue (estimated MRR)
//   • New signups this month
//   • New paying customers this month
//   • Subscriptions sold (lifetime)
//   • Conversion rate (paying / total)
//   • Recent activity log
//   • Recent briefs and social posts

import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import AtlasTitan from "@/components/AtlasTitan";

const C = {
  bgCard: "#131316", border: "#1f1f25",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  champagne: "#e8d5a8", sage: "#b8d0a8", sageDim: "rgba(184,208,168,0.10)",
  porcelain: "#c8d4e0", critical: "#c45c5c", high: "#c49a5c",
  ivory: "#f5ede0",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

export const dynamic = "force-dynamic";

// Map tier → estimated monthly price for revenue calculation
const TIER_PRICE = {
  observer: 0,
  personal_pro: 49,
  business: 149,
  executive: 499, // estimated mid-point for Director's Edition
};

async function loadStats() {
  try {
    const supabase = await createClient();
    const [profilesR, articlesR, recentArticlesR, socialR, newslettersR, atlasR] = await Promise.all([
      supabase.from("profiles").select("subscription_status, tier, created_at, paddle_subscription_id"),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("articles").select("id, slug, headline, published_at, view_count").eq("published", true).order("published_at", { ascending: false }).limit(5),
      supabase.from("social_posts").select("platform, status, posted_at").order("posted_at", { ascending: false }).limit(20),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("atlas_index_history").select("score, label, recorded_at").order("recorded_at", { ascending: false }).limit(1),
    ]);

    const profiles = profilesR.data || [];
    const total = profiles.length;
    const active = profiles.filter((p) => p.subscription_status === "active").length;
    const trial = profiles.filter((p) => p.subscription_status === "trial").length;
    const cancelled = profiles.filter((p) => p.subscription_status === "cancelled").length;
    const pastDue = profiles.filter((p) => p.subscription_status === "past_due").length;
    const observers = total - active - trial - cancelled - pastDue;

    // This-month signups + this-month paying conversions
    const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
    const newThisMonth = profiles.filter((p) => p.created_at && new Date(p.created_at) >= monthStart).length;
    const newPayingThisMonth = profiles.filter((p) =>
      p.created_at && new Date(p.created_at) >= monthStart && p.subscription_status === "active"
    ).length;

    // Estimated MRR — sum of tier prices for active subscribers
    const mrr = profiles
      .filter((p) => p.subscription_status === "active")
      .reduce((sum, p) => sum + (TIER_PRICE[p.tier] || 0), 0);

    // Lifetime subscriptions sold (anyone who ever had paddle_subscription_id)
    const lifetimeSubs = profiles.filter((p) => p.paddle_subscription_id).length;

    // Conversion rate = paying / total
    const conversion = total > 0 ? (active / total) * 100 : 0;

    // Tier distribution
    const tierBreakdown = {
      personal_pro: profiles.filter((p) => p.tier === "personal_pro" && p.subscription_status === "active").length,
      business: profiles.filter((p) => p.tier === "business" && p.subscription_status === "active").length,
      executive: profiles.filter((p) => p.tier === "executive" && p.subscription_status === "active").length,
    };

    return {
      users: { total, active, trial, cancelled, pastDue, observers, newThisMonth, newPayingThisMonth },
      revenue: { mrr, lifetimeSubs, conversion },
      tiers: tierBreakdown,
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

function Metric({ label, value, sub, color, accent }) {
  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${accent ? "rgba(196,162,101,0.30)" : C.border}`,
      borderRadius: 4, padding: 22,
      position: "relative",
    }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.gold }} />}
      <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontFamily: serif, fontWeight: 300, color: color || C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 8, fontFamily: mono }}>{sub}</div>}
    </div>
  );
}

export default async function AdminOverview() {
  const stats = await loadStats();
  if (stats.error) {
    return <div style={{ color: "#c45c5c", padding: 30 }}>Failed to load stats: {stats.error}</div>;
  }

  const recentSocialOk = stats.socialPosts.filter((s) => s.status === "posted").length;
  const recentSocialFailed = stats.socialPosts.filter((s) => s.status === "failed").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30, gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, margin: "0 0 6px" }}>Manager's Office</h1>
          <p style={{ color: C.textSec, fontWeight: 300, fontSize: 13 }}>
            Live operational state of Atlas Intelligence.
          </p>
        </div>
        <div style={{ flexShrink: 0, opacity: 0.5 }}>
          <AtlasTitan size={64} color={C.gold} opacity={0.7} showRings={false} />
        </div>
      </div>

      {/* Revenue strip — top-line numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        <Metric
          label="Estimated MRR"
          value={`$${stats.revenue.mrr.toLocaleString()}`}
          sub={stats.revenue.mrr > 0 ? `${stats.users.active} active subscriptions` : "No paying subs yet"}
          color={stats.revenue.mrr > 0 ? C.gold : C.textSec}
          accent
        />
        <Metric
          label="Active Subs"
          value={stats.users.active}
          sub={`${stats.tiers.personal_pro} Pro · ${stats.tiers.business} Biz · ${stats.tiers.executive} Exec`}
          color={stats.users.active > 0 ? C.sage : C.textSec}
        />
        <Metric
          label="New Paying / Month"
          value={`+${stats.users.newPayingThisMonth}`}
          sub={`This month · ${stats.users.newThisMonth} signups total`}
          color={stats.users.newPayingThisMonth > 0 ? C.champagne : C.textSec}
        />
        <Metric
          label="Conversion Rate"
          value={`${stats.revenue.conversion.toFixed(1)}%`}
          sub={`${stats.users.active} paying of ${stats.users.total} total`}
          color={C.text}
        />
      </div>

      {/* User breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 30 }}>
        <Metric label="Total Users" value={stats.users.total} sub={`${stats.users.observers} observers (free)`} />
        <Metric label="Trialing" value={stats.users.trial} sub={stats.users.trial > 0 ? "Active trial windows" : "No trials currently"} color={stats.users.trial > 0 ? C.high : C.textSec} />
        <Metric label="Cancelled" value={stats.users.cancelled} sub="Lifetime churn" color={stats.users.cancelled > 0 ? C.critical : C.textSec} />
        <Metric label="Lifetime Subscriptions" value={stats.revenue.lifetimeSubs} sub="Anyone who ever paid" />
      </div>

      {/* Content + ops */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 30 }}>
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
          color={recentSocialFailed > 0 ? C.critical : C.sage}
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

      {/* Quick actions */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
        <h2 style={{ fontSize: 18, fontFamily: serif, fontWeight: 400, margin: "0 0 14px" }}>Quick actions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/users" style={{ padding: "10px 18px", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>Manage users</Link>
          <Link href="/admin/articles" style={{ padding: "10px 18px", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>Edit briefs</Link>
          <Link href="/admin/system" style={{ padding: "10px 18px", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>System health</Link>
          <Link href="/app" style={{ padding: "10px 18px", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>Open Platform</Link>
        </div>
      </div>
    </div>
  );
}
