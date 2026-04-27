// app/api/coanalyst/route.js
// Article-grounded Q&A. The reader asks a follow-up about a specific brief;
// Claude answers using the article as primary context + general background.
// Rate-limited per IP. Anonymous use allowed.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { claudeText } from "@/lib/anthropic";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Tiny in-memory rate limit (per warm instance). Good enough for soft control.
const HITS = new Map();
const WINDOW_MS = 60_000;
const LIMIT = 6;

function ipOf(req) {
  return req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
}

function tooMany(ip) {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= LIMIT) return true;
  arr.push(now); HITS.set(ip, arr); return false;
}

const COANALYST_SYSTEM = `You are an Atlas Intelligence senior analyst on call. The reader is asking a follow-up about an article you wrote. Answer in 80-160 words, in the measured Atlas voice. Ground every claim in either the article text or established public knowledge. If the question goes beyond what you can responsibly answer, say so and suggest what additional reporting would be needed. No marketing language. No "I'm an AI" disclaimers.`;

export async function POST(req) {
  if (tooMany(ipOf(req))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { slug, question } = await req.json();
  if (!slug || !question || question.length > 400) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data: a } = await supabase
    .from("articles")
    .select("id, headline, dek, body_markdown, source_name")
    .eq("slug", slug).eq("published", true).single();
  if (!a) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const prompt = `ARTICLE:
Headline: ${a.headline}
Standfirst: ${a.dek}
Body:
${a.body_markdown}

(Source publication: ${a.source_name})

READER QUESTION:
${question}

Answer the question.`;

  try {
    const answer = await claudeText(prompt, { maxTokens: 600, temperature: 0.4, system: COANALYST_SYSTEM });
    // Persist the turn (best-effort)
    supabase.from("coanalyst_turns").insert({ article_id: a.id, question: question.slice(0, 400), answer }).then(() => {});
    return NextResponse.json({ answer });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
