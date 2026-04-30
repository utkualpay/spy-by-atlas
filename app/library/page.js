// app/library/page.js
//
// User's personal library of saved briefs. Stratfor "My Collections" pattern.
// Shown in the public nav when authenticated.

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import AtlasTicker from "@/components/AtlasTicker";
import ArticleCard from "@/components/ArticleCard";

const C = {
  bg: "#09090b", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", border: "#1f1f25", bgCard: "#131316",
};
const serif = "'Cormorant Garamond', serif";
const mono = "'IBM Plex Mono', monospace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Library — Atlas Intelligence", robots: { index: false } };

export default async function LibraryPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/library");

  const { data } = await sb
    .from("saved_articles")
    .select("article_id, saved_at, articles(id, slug, headline, dek, category, severity, source_name, published_at)")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false })
    .limit(200);

  const articles = (data || []).map((d) => ({ ...d.articles, saved_at: d.saved_at }));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <AtlasTicker />
      <PublicNav />

      <header style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 48px 30px" }}>
        <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>
          Your Library
        </div>
        <h1 style={{ fontSize: 50, fontFamily: serif, fontWeight: 300, lineHeight: 1.05, margin: "0 0 14px", letterSpacing: -0.6 }}>
          Saved briefs
        </h1>
        <p style={{ fontSize: 15, color: C.textSec, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
          {articles.length === 0
            ? "Briefs you save will appear here, organised by date."
            : `${articles.length} brief${articles.length === 1 ? "" : "s"} in your library.`}
        </p>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 48px 60px" }}>
        {articles.length === 0 ? (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 60, textAlign: "center" }}>
            <div style={{ fontFamily: serif, fontSize: 22, color: C.textSec, marginBottom: 8 }}>
              No saved briefs yet.
            </div>
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: mono, letterSpacing: 1, marginBottom: 24 }}>
              Click the "Save" button on any brief to add it here.
            </div>
            <Link href="/intelligence" style={{
              padding: "11px 24px", border: `1px solid ${C.gold}`, color: C.gold,
              fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
              textDecoration: "none", borderRadius: 3, display: "inline-block",
            }}>
              Browse the feed
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="lib-grid">
            {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </main>

      <PublicFooter />

      <style>{`
        @media (max-width: 1024px) { .lib-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px)  { .lib-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
