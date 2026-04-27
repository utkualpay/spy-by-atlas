// lib/anthropic.js
// Server-side Claude API client. Mirrors the project's "no SDK, just fetch" pattern.
// Used exclusively for editorial article generation (curation + rewrite + headline).
//
// Model: claude-sonnet-4-5 — best balance of editorial quality + cost.
// Switch to claude-opus-4-7 for showcase pieces if budget allows.

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ATLAS_CLAUDE_MODEL || "claude-sonnet-4-5";

const HOUSE_VOICE = `You are the senior editorial intelligence officer of Atlas Intelligence — a private intelligence service. You write briefings for executives, principals, and HNWIs.

VOICE:
- Measured, declarative, understated. No hype, no marketing language.
- Treat the reader as a peer: informed, time-poor, decision-oriented.
- Lead with what matters. Bury nothing.
- Cite sources by name in the body when material. Never fabricate quotes or sources.
- When uncertain, name the uncertainty. Never pad.

PROHIBITED PHRASES:
- "In today's rapidly evolving landscape", "delve", "tapestry", "navigate the complexities"
- "I cannot", "As an AI", "It's worth noting", "Rest assured", "Feel free to"
- "Certainly!", "Absolutely!", "Of course!"
- Closing summaries like "I hope this helps"

FORMAT for analyses (when asked for an article):
- Headline: 6–12 words, declarative, no clickbait
- Dek: 18–28 words, sets the stake
- Body: 280–420 words, 3–5 short paragraphs
- Implications: 2–4 bullet points, 8–18 words each, naming who is affected and how
- Source line at the foot: "Source: [Publisher]"

NEVER reproduce verbatim text from the source article. Paraphrase fully. Quotes (if any) under 15 words and only when materially necessary.`;

export async function claudeJSON(prompt, { maxTokens = 2500, temperature = 0.4, system = HOUSE_VOICE } = {}) {
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY missing");
  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: "user", content: `${prompt}\n\nReturn ONLY valid JSON. No markdown fences. No prose outside the JSON.` }],
  };
  const r = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (data.error) { console.error("Anthropic error:", data.error); throw new Error(data.error.message || "anthropic_error"); }
  const text = data.content?.[0]?.text || "";
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const start = cleaned.search(/[\[{]/);
  const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  if (start === -1 || end === -1) throw new Error("anthropic_no_json");
  return JSON.parse(cleaned.substring(start, end + 1));
}

export async function claudeText(prompt, { maxTokens = 2500, temperature = 0.5, system = HOUSE_VOICE } = {}) {
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY missing");
  const r = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, temperature, system, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || "anthropic_error");
  return data.content?.[0]?.text || "";
}
