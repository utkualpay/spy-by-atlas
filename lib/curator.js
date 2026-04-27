// lib/curator.js
// The editorial brain. Given a pool of feed items, score and select the best
// candidate for the day, then generate the Atlas-format rewrite via Claude.
//
// Scoring blends: source weight × recency × signal terms × diversity penalty.
// We then ask Claude to do a final triage pass on the top 5, picking the one
// most likely to drive engagement *while* meeting our editorial bar.

import { claudeJSON } from "./anthropic.js";

// Signal-term boosts. Crude but effective for first-pass scoring.
const SIGNAL_TERMS = [
  // High-signal cyber
  ["zero-day", 1.6], ["zero day", 1.6], ["ransomware", 1.4], ["breach", 1.3],
  ["nation-state", 1.5], ["nation state", 1.5], ["apt", 1.4], ["exploit", 1.3],
  ["supply chain", 1.5], ["sanction", 1.3], ["espionage", 1.5],
  // High-signal geopolitical
  ["coup", 1.5], ["airstrike", 1.4], ["assassination", 1.5], ["sabotage", 1.4],
  ["cyberattack", 1.4], ["disinformation", 1.3], ["election", 1.2],
  ["nuclear", 1.4], ["missile", 1.3], ["incursion", 1.3],
  // De-amplifiers (fluff)
  ["webinar", 0.4], ["sponsored", 0.3], ["awards", 0.5], ["roundup", 0.6],
];

function scoreItem(item) {
  const haystack = `${item.title} ${item.description}`.toLowerCase();
  let score = item.weight || 1.0;
  // Recency: item published within 12h gets full credit; 36h gets 0.5x
  if (item.published) {
    const ageH = (Date.now() - new Date(item.published).getTime()) / 3600000;
    score *= ageH < 6 ? 1.3 : ageH < 12 ? 1.15 : ageH < 24 ? 1.0 : ageH < 36 ? 0.7 : 0.4;
  }
  // Title length sweet spot: 40–95 chars
  const tl = (item.title || "").length;
  if (tl >= 40 && tl <= 95) score *= 1.1;
  if (tl < 25 || tl > 140) score *= 0.7;
  // Signal terms
  let termBoost = 1.0;
  for (const [term, mult] of SIGNAL_TERMS) {
    if (haystack.includes(term)) termBoost *= mult;
  }
  termBoost = Math.min(termBoost, 3.0);
  return score * termBoost;
}

// Slug from title — short, URL-safe
export function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// Phase 1 — heuristic scoring + diversity
export function rankCandidates(items, { take = 8 } = {}) {
  const scored = items.map((it) => ({ ...it, _score: scoreItem(it) })).sort((a, b) => b._score - a._score);
  // Enforce category diversity in the shortlist
  const seenCats = {};
  const picks = [];
  for (const it of scored) {
    seenCats[it.category] = (seenCats[it.category] || 0) + 1;
    if (seenCats[it.category] > 3) continue;
    picks.push(it);
    if (picks.length >= take) break;
  }
  return picks;
}

// Phase 2 — Claude does final triage: pick the single best candidate
export async function selectWinner(candidates, { recentTitles = [] } = {}) {
  const compact = candidates.map((c, i) => ({
    idx: i,
    title: c.title,
    source: c.source_name,
    category: c.category,
    summary: (c.description || "").slice(0, 280),
    age_hours: c.published ? Math.round((Date.now() - new Date(c.published).getTime()) / 3600000) : null,
  }));
  const prompt = `From the following candidate items, pick exactly ONE for today's lead Atlas Intelligence brief.

CRITERIA (in order of priority):
1. Genuine intelligence value — would a CISO, executive, or HNWI care today?
2. Engagement potential — concrete, named entities, fresh, with stakes.
3. Diversity from yesterday's lead (avoid topics in the recent_titles list).
4. Avoid PR/marketing/awards content.

CANDIDATES:
${JSON.stringify(compact, null, 2)}

RECENT_TITLES (avoid):
${JSON.stringify(recentTitles)}

Return JSON: { "chosen_idx": <number>, "reason": "<one sentence>" }`;
  const out = await claudeJSON(prompt, { maxTokens: 400, temperature: 0.3 });
  const idx = Number.isInteger(out?.chosen_idx) ? out.chosen_idx : 0;
  return { winner: candidates[idx] || candidates[0], reason: out?.reason || "" };
}

// Phase 3 — generate the full Atlas-format article from the winner
export async function generateArticle(winner) {
  const prompt = `Write today's Atlas Intelligence brief based on the following source item. You may use general background knowledge to enrich context, but every specific claim must be either common knowledge or attributable to the source publication. Do NOT invent details, quotes, or statistics.

SOURCE:
- Publication: ${winner.source_name}
- Title: ${winner.title}
- Summary: ${winner.description || "(no summary)"}
- URL: ${winner.link}
- Published: ${winner.published || "(unknown)"}

OUTPUT JSON SCHEMA:
{
  "headline": "6-12 words, declarative, no clickbait",
  "dek": "18-28 word standfirst that sets the stake",
  "body_markdown": "280-420 words, 3-5 short paragraphs in markdown. May include one bolded sentence for emphasis. No headings inside the body.",
  "implications": ["2-4 bullets, 8-18 words each, naming who is affected and how"],
  "category": "cyber | geopolitics | policy | ics | finance | health",
  "sectors": ["choose 1-3 from: Cybersecurity, Finance & Banking, Energy & Infrastructure, Healthcare, Defense & Government, Technology, Legal, Maritime & Logistics, Telecommunications"],
  "severity": "critical | high | medium | low | info",
  "tags": ["3-6 short topical tags, lowercase"],
  "social_post_x": "240-character X post in Atlas voice. Must end with the article URL placeholder {URL}. No hashtag spam — at most 2 hashtags. No emoji.",
  "social_caption_instagram": "2-3 short paragraphs for Instagram caption. Atlas voice. End with: 'Read the full brief at atlasspy.com/intelligence' and 4-7 relevant hashtags."
}`;
  return claudeJSON(prompt, { maxTokens: 2500, temperature: 0.5 });
}
