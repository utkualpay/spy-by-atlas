// lib/atlas-index.js
// The Atlas Index — a single rolling number representing the global threat
// environment, displayed at the top of every page. Differentiator feature.
//
// Composition (all weighted, normalized to 0-100):
//   • Conflict severity weight (40%) — sum of severity scores across active conflicts
//   • Cyber-event severity (35%) — derived from last 7d of generated articles
//   • Volatility / news velocity (15%) — items/day vs 14-day baseline
//   • Sector dispersion (10%) — Shannon entropy across affected sectors
//
// Lower score = calmer week. Higher score = elevated threat across vectors.
// Updated nightly by the curator cron and cached.

import { createClient } from "@supabase/supabase-js";

const SEV_VALUE = { critical: 1.0, high: 0.7, medium: 0.45, low: 0.25, info: 0.1 };

export function computeIndex({ articles = [], conflicts = [], baselineCount = 6 }) {
  // Conflict component
  const conflictRaw = conflicts.reduce((sum, c) => sum + (SEV_VALUE[c.sev] || 0.3), 0);
  const conflictNorm = Math.min(conflictRaw / 18, 1.0); // 18 = saturation

  // Cyber severity component (last 7d articles)
  const recent = articles.filter((a) => {
    if (!a.published_at) return false;
    return Date.now() - new Date(a.published_at).getTime() < 7 * 86400000;
  });
  const cyberRaw = recent.reduce((s, a) => s + (SEV_VALUE[a.severity] || 0.3), 0);
  const cyberNorm = Math.min(cyberRaw / 6, 1.0); // ~6 high-sev articles/wk = saturation

  // Velocity vs baseline
  const todayCount = recent.filter((a) => Date.now() - new Date(a.published_at).getTime() < 86400000).length;
  const velocityNorm = Math.min(todayCount / Math.max(baselineCount, 1), 1.0);

  // Sector dispersion (Shannon entropy)
  const sectorCounts = {};
  recent.forEach((a) => (a.sectors || []).forEach((s) => { sectorCounts[s] = (sectorCounts[s] || 0) + 1; }));
  const total = Object.values(sectorCounts).reduce((a, b) => a + b, 0) || 1;
  const entropy = Object.values(sectorCounts).reduce((H, c) => {
    const p = c / total; return H - p * Math.log2(p);
  }, 0);
  const dispersionNorm = Math.min(entropy / 3, 1.0);

  const score = Math.round(
    (0.40 * conflictNorm + 0.35 * cyberNorm + 0.15 * velocityNorm + 0.10 * dispersionNorm) * 100
  );
  const label = score >= 75 ? "ELEVATED" : score >= 55 ? "HEIGHTENED" : score >= 35 ? "MODERATE" : "STABLE";
  return {
    score,
    label,
    components: {
      conflict: Math.round(conflictNorm * 100),
      cyber: Math.round(cyberNorm * 100),
      velocity: Math.round(velocityNorm * 100),
      dispersion: Math.round(dispersionNorm * 100),
    },
    computed_at: new Date().toISOString(),
  };
}

// Service-role client for write paths (cron). Reads can use anon.
export function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
