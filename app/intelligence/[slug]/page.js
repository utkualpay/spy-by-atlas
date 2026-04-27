// app/intelligence/[slug]/page.js
// The brief itself. Server-rendered for SEO + share-card metadata + speed.
// 60% of body visible to all; remainder gated by ConversionWall (or signed-in users see all).

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerClient } from "@/lib/supabase-server";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import AtlasTicker from "@/components/AtlasTicker";
import AtlasMarkdown from "@/components/AtlasMarkdown";
import ConversionWall from "@/components/ConversionWall";
import CoAnalyst from "@/components/CoAnalyst";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

const C = { gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bg: "#09090b", bgCard: "#131316",
  crit: "#c45c5c", high: "#c49a5c", med: "#7c8db5", low: "#6b9e7a", info: "#8b8db5" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

const SEV = {
  critical: { color: C.crit, label: "CRITICAL" },
  high: { color: C.high, label: "HIGH" },
  medium: { color: C.med, label: "MODERATE" },
  low: { color: C.low, label: "LOW" },
  info: { color: C.info, label: "INFO" },
};

const CAT_LABEL = {
  cyber: "Cyber Intelligence",
  geopolitics: "Geopolitical Intelligence",
  policy: "Policy & Privacy",
  ics: "Critical Infrastructure",
  finance: "Financial Intelligence",
  health: "Healthcare Security",
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

async function getArticle(slug) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data } = await supabase.from("articles").select("*").eq("slug", slug).eq("published", true).single();
  return data;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: "Brief not found" };
  const ogUrl = `${SITE}/api/og/${a.slug}`;
  return {
    title: `${a.headline} — Atlas Intelligence`,
    description: a.dek,
    alternates: { canonical: `${SITE}/intelligence/${a.slug}` },
    openGraph: {
      title: a.headline,
      description: a.dek,
      url: `${SITE}/intelligence/${a.slug}`,
      type: "article",
      publishedTime: a.published_at,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: a.headline }],
    },
    twitter: {
      card: "summary_large_image",
      title: a.headline,
      description: a.dek,
      images: [ogUrl],
    },
  };
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return notFound();

  // Auth check (signed-in users get the full brief)
  let isAuthed = false;
  try {
    const sb = await createServerClient();
    const { data: { user } } = await sb.auth.getUser();
    isAuthed = !!user;
  } catch {}

  // Compute split — first ~60% of paragraphs visible to anonymous readers.
  const paragraphs = (a.body_markdown || "").split(/\n\s*\n/).filter(Boolean);
  const splitAt = Math.max(1, Math.ceil(paragraphs.length * 0.6));
  const visiblePart = paragraphs.slice(0, splitAt).join("\n\n");
  const hiddenPart = paragraphs.slice(splitAt).join("\n\n");

  // Related briefs (same category, exclude self)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data: related } = await supabase
    .from("articles")
    .select("id, slug, headline, dek, category, severity, source_name, published_at")
    .eq("published", true)
    .eq("category", a.category)
    .neq("id", a.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const sev = SEV[a.severity] || SEV.medium;

  // JSON-LD article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.headline,
    description: a.dek,
    datePublished: a.published_at,
    dateModified: a.updated_at,
    image: `${SITE}/api/og/${a.slug}`,
    author: { "@type": "Organization", name: "Atlas Intelligence" },
    publisher: { "@type": "Organization", name: "Atlas Design Institute", logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/intelligence/${a.slug}` },
    articleSection: CAT_LABEL[a.category] || a.category,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AtlasTicker />
      <PublicNav />

      <article style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 48px 0" }}>
        <Link href="/intelligence" style={{ fontSize: 11, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          ← All briefs
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 60 }} className="atlas-article-grid">
          {/* Main column */}
          <div>
            {/* Meta strip */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: sev.color, padding: "3px 12px", border: `1px solid ${sev.color}40`, borderRadius: 2, textTransform: "uppercase", fontWeight: 500 }}>{sev.label}</span>
              <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2, color: C.gold, textTransform: "uppercase" }}>{CAT_LABEL[a.category] || a.category}</span>
              <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1, color: C.textDim }}>{formatDate(a.published_at)}</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: serif, fontSize: 52, fontWeight: 400, lineHeight: 1.08, letterSpacing: -0.8, margin: "0 0 22px" }}>{a.headline}</h1>
            {/* Dek */}
            {a.dek && <p style={{ fontFamily: serif, fontSize: 22, fontStyle: "italic", color: C.textSec, fontWeight: 300, lineHeight: 1.5, margin: "0 0 36px", maxWidth: 680 }}>{a.dek}</p>}

            <div style={{ width: 60, height: 1, background: C.gold, opacity: 0.4, marginBottom: 36 }} />

            {/* Body — visible part */}
            <AtlasMarkdown source={visiblePart} />

            {/* Wall or rest */}
            {hiddenPart && (
              isAuthed ? (
                <div style={{ marginTop: 22 }}><AtlasMarkdown source={hiddenPart} /></div>
              ) : (
                <ConversionWall />
              )
            )}

            {/* Implications block — visible to all */}
            {Array.isArray(a.implications) && a.implications.length > 0 && (
              <div style={{ marginTop: 50, padding: "30px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Implications</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {a.implications.map((line, i) => (
                    <li key={i} style={{ display: "flex", gap: 14, fontSize: 16, color: C.text, fontWeight: 300, lineHeight: 1.6 }}>
                      <span style={{ color: C.gold, fontFamily: mono, fontSize: 12, marginTop: 4 }}>0{i + 1}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Source attribution */}
            <div style={{ marginTop: 30, padding: 24, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4 }}>
              <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 8 }}>Source</div>
              <div style={{ fontSize: 14, fontFamily: serif, color: C.text, marginBottom: 8 }}>{a.source_name}</div>
              <a href={a.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.gold, fontFamily: mono, textDecoration: "underline", textUnderlineOffset: 4, wordBreak: "break-all" }}>
                {a.source_url}
              </a>
              <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1, color: C.textDim, marginTop: 12, lineHeight: 1.6 }}>
                Brief is editorial commentary by Atlas Intelligence based on the cited public reporting. Atlas does not reproduce source text. Verify primary source before action.
              </div>
            </div>

            {/* Tags */}
            {Array.isArray(a.tags) && a.tags.length > 0 && (
              <div style={{ marginTop: 30, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {a.tags.map((t) => (
                  <span key={t} style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1, color: C.textSec, padding: "4px 12px", border: `1px solid ${C.border}`, borderRadius: 2, textTransform: "uppercase" }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right rail */}
          <aside style={{ position: "sticky", top: 100, alignSelf: "start", display: "flex", flexDirection: "column", gap: 18 }} className="atlas-aside">
            <CoAnalyst slug={a.slug} />

            {/* Subscribe nudge */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 22 }}>
              <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 8 }}>Daily Brief</div>
              <div style={{ fontFamily: serif, fontSize: 18, color: C.text, marginBottom: 8 }}>One brief, every morning.</div>
              <p style={{ fontSize: 12, color: C.textDim, fontWeight: 300, lineHeight: 1.6, margin: "0 0 14px" }}>
                The Atlas brief, delivered at 06:00 UTC. No noise. No marketing.
              </p>
              <Link href="/signup" style={{ display: "inline-block", padding: "9px 16px", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>
                Subscribe free →
              </Link>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <div style={{ marginTop: 80, paddingTop: 50, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2.5, color: C.textDim, textTransform: "uppercase", marginBottom: 22 }}>Related Briefs</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="atlas-grid">
              {related.map((r) => <ArticleCard key={r.id} article={r} />)}
            </div>
          </div>
        )}
      </article>

      <PublicFooter />

      <style>{`
        @media (max-width: 1024px) {
          .atlas-article-grid { grid-template-columns: 1fr !important; }
          .atlas-aside { position: static !important; }
          .atlas-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 640px) {
          .atlas-grid { grid-template-columns: 1fr !important; }
          article h1 { font-size: 34px !important; }
          article > div > div > p { font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
}
