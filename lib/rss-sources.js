// lib/rss-sources.js
// Curated intelligence sources. Each entry: { url, name, category, weight, sectors }
// `weight` (0-1.5) biases the curator toward higher-credibility sources.
// `sectors` allows future per-tier filtering (Personal Pro vs Business Premium).

export const RSS_SOURCES = [
  // ── CYBERSECURITY · TIER 1 ──────────────────────────────────────────
  { url: "https://krebsonsecurity.com/feed/", name: "Krebs on Security", category: "cyber", weight: 1.4, sectors: ["Cybersecurity", "Finance & Banking"] },
  { url: "https://www.bleepingcomputer.com/feed/", name: "BleepingComputer", category: "cyber", weight: 1.2, sectors: ["Cybersecurity", "Technology"] },
  { url: "https://feeds.feedburner.com/TheHackersNews", name: "The Hacker News", category: "cyber", weight: 1.1, sectors: ["Cybersecurity"] },
  { url: "https://therecord.media/feed/", name: "The Record", category: "cyber", weight: 1.3, sectors: ["Cybersecurity", "Defense & Government"] },
  { url: "https://www.darkreading.com/rss.xml", name: "Dark Reading", category: "cyber", weight: 1.1, sectors: ["Cybersecurity"] },
  { url: "https://www.securityweek.com/feed/", name: "SecurityWeek", category: "cyber", weight: 1.0, sectors: ["Cybersecurity"] },
  { url: "https://www.cisa.gov/news.xml", name: "CISA", category: "cyber", weight: 1.5, sectors: ["Cybersecurity", "Defense & Government", "Energy & Infrastructure"] },
  { url: "https://us-cert.cisa.gov/ncas/all.xml", name: "US-CERT", category: "cyber", weight: 1.5, sectors: ["Cybersecurity"] },
  { url: "https://cloud.google.com/blog/topics/threat-intelligence/rss", name: "Mandiant / Google TI", category: "cyber", weight: 1.4, sectors: ["Cybersecurity", "Defense & Government"] },

  // ── GEOPOLITICS / CONFLICT ──────────────────────────────────────────
  { url: "https://www.crisisgroup.org/rss/all", name: "Crisis Group", category: "geopolitics", weight: 1.4, sectors: ["Defense & Government", "All Sectors"] },
  { url: "https://warontherocks.com/feed/", name: "War on the Rocks", category: "geopolitics", weight: 1.2, sectors: ["Defense & Government"] },
  { url: "https://thediplomat.com/feed/", name: "The Diplomat", category: "geopolitics", weight: 1.1, sectors: ["Defense & Government", "Maritime & Logistics"] },
  { url: "https://www.foreignaffairs.com/rss.xml", name: "Foreign Affairs", category: "geopolitics", weight: 1.3, sectors: ["Defense & Government", "All Sectors"] },
  { url: "https://www.bellingcat.com/feed/", name: "Bellingcat", category: "geopolitics", weight: 1.2, sectors: ["Defense & Government"] },

  // ── PRIVACY / POLICY ────────────────────────────────────────────────
  { url: "https://www.eff.org/rss/updates.xml", name: "EFF", category: "policy", weight: 1.0, sectors: ["Legal", "Technology"] },
  { url: "https://iapp.org/news/rss/", name: "IAPP", category: "policy", weight: 1.0, sectors: ["Legal"] },

  // ── ENERGY · ICS · OT ───────────────────────────────────────────────
  { url: "https://www.industrialcyber.co/feed/", name: "Industrial Cyber", category: "ics", weight: 1.1, sectors: ["Energy & Infrastructure"] },
  { url: "https://claroty.com/team82/research/feed", name: "Claroty Team82", category: "ics", weight: 1.2, sectors: ["Energy & Infrastructure"] },

  // ── FINANCE · ECONOMIC INTEL ────────────────────────────────────────
  { url: "https://www.fincen.gov/news-room/news-releases/feed", name: "FinCEN", category: "finance", weight: 1.3, sectors: ["Finance & Banking", "Legal"] },

  // ── HEALTHCARE SECURITY ─────────────────────────────────────────────
  { url: "https://healthitsecurity.com/feed", name: "Health IT Security", category: "health", weight: 1.0, sectors: ["Healthcare"] },
];

// Category labels for UI
export const CATEGORIES = {
  cyber: "Cyber",
  geopolitics: "Geopolitics",
  policy: "Policy & Privacy",
  ics: "Critical Infrastructure",
  finance: "Financial Intelligence",
  health: "Healthcare Security",
};

// Source attribution chip color (kept in palette)
export const CATEGORY_HUES = {
  cyber: "#c49a5c",
  geopolitics: "#c45c5c",
  policy: "#7c8db5",
  ics: "#d4b876",
  finance: "#6b9e7a",
  health: "#8b8db5",
};
