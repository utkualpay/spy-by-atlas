// app/api/og/[slug]/route.js
// Branded social card per article. Uses next/og (built into Next.js, no dep).
// Fonts streamed from Google Fonts at request time, cached at the edge.
// 1200×630, the social-share standard.

import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function loadFont(family, weight) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;
  const css = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } }).then((r) => r.text());
  const m = css.match(/src: url\((https:[^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (!m) return null;
  const data = await fetch(m[1]).then((r) => r.arrayBuffer());
  return data;
}

export async function GET(req, { params }) {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data: a } = await supabase
    .from("articles")
    .select("headline, dek, category, severity, source_name")
    .eq("slug", slug)
    .single();

  const headline = a?.headline || "Atlas Intelligence";
  const dek = a?.dek || "Daily intelligence brief";
  const category = (a?.category || "intelligence").toUpperCase();
  const sourceName = a?.source_name || "Atlas";
  const severity = (a?.severity || "medium").toUpperCase();

  const sevColor = a?.severity === "critical" ? "#c45c5c" : a?.severity === "high" ? "#c49a5c" : "#c4a265";

  let fontSerif = null, fontMono = null;
  try { fontSerif = await loadFont("Cormorant+Garamond", 400); } catch {}
  try { fontMono = await loadFont("IBM+Plex+Mono", 400); } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          padding: "70px 80px",
          fontFamily: "serif",
          color: "#e4e0d9",
          position: "relative",
        }}
      >
        {/* Subtle dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(#c4a265 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.04,
          }}
        />
        {/* Atmospheric glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,162,101,0.10) 0%, transparent 70%)",
          }}
        />
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 38, fontFamily: "serif", color: "#c4a265", letterSpacing: 4 }}>Spy</span>
            <span style={{ fontSize: 11, color: "#5c5854", fontFamily: "monospace", letterSpacing: 2 }}>BY ATLAS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, color: sevColor, fontFamily: "monospace", letterSpacing: 2, padding: "6px 14px", border: `1px solid ${sevColor}`, borderRadius: 3 }}>
              {severity}
            </span>
            <span style={{ fontSize: 11, color: "#5c5854", fontFamily: "monospace", letterSpacing: 3 }}>{category}</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontFamily: "serif",
            fontWeight: 400,
            color: "#e4e0d9",
            lineHeight: 1.1,
            letterSpacing: -0.8,
            marginBottom: 32,
            display: "flex",
            maxWidth: 1040,
          }}
        >
          {headline}
        </div>

        {/* Dek */}
        <div
          style={{
            fontSize: 24,
            color: "#9d9890",
            fontFamily: "sans-serif",
            fontWeight: 300,
            lineHeight: 1.45,
            display: "flex",
            maxWidth: 1040,
          }}
        >
          {dek.length > 200 ? dek.slice(0, 197) + "..." : dek}
        </div>

        {/* Footer rule + source */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ width: 60, height: 1, background: "#c4a265", opacity: 0.5 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontFamily: "monospace", color: "#5c5854", letterSpacing: 2 }}>
              SOURCE — {sourceName.toUpperCase()}
            </span>
            <span style={{ fontSize: 14, fontFamily: "monospace", color: "#c4a265", letterSpacing: 2 }}>
              ATLASSPY.COM
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        ...(fontSerif ? [{ name: "serif", data: fontSerif, style: "normal", weight: 400 }] : []),
        ...(fontMono ? [{ name: "monospace", data: fontMono, style: "normal", weight: 400 }] : []),
      ],
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    }
  );
}
