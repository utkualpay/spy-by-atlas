// lib/rss-parser.js
// Dependency-free RSS 2.0 + Atom 1.0 parser. Returns normalized items.
// Designed to be tolerant: malformed feeds yield as much as can be extracted.

const stripCDATA = (s) => (s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
const decodeEntities = (s) => (s || "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
const stripHTML = (s) => decodeEntities(stripCDATA(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
const tag = (xml, name) => {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = xml.match(re); return m ? m[1] : "";
};
const tagAttr = (xml, name, attr) => {
  const re = new RegExp(`<${name}[^>]*\\s${attr}=["']([^"']+)["'][^>]*\\/?>`, "i");
  const m = xml.match(re); return m ? m[1] : "";
};
const allItems = (xml, t) => {
  const out = []; const re = new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${t}>`, "gi");
  let m; while ((m = re.exec(xml)) !== null) out.push(m[1]); return out;
};

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s); return isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeItem(raw, isAtom) {
  if (isAtom) {
    const link = tagAttr(raw, "link", "href") || stripHTML(tag(raw, "link"));
    return {
      title: stripHTML(tag(raw, "title")),
      link,
      description: stripHTML(tag(raw, "summary") || tag(raw, "content")),
      published: parseDate(stripHTML(tag(raw, "published") || tag(raw, "updated"))),
      author: stripHTML(tag(raw, "name") || tag(raw, "author")),
    };
  }
  return {
    title: stripHTML(tag(raw, "title")),
    link: stripHTML(tag(raw, "link") || tag(raw, "guid")),
    description: stripHTML(tag(raw, "description") || tag(raw, "content:encoded")),
    published: parseDate(stripHTML(tag(raw, "pubDate") || tag(raw, "dc:date"))),
    author: stripHTML(tag(raw, "author") || tag(raw, "dc:creator")),
  };
}

export async function fetchFeed(url, { timeoutMs = 12000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "AtlasIntelligence/1.0 (+https://atlasspy.com) feed-reader",
        "Accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8",
      },
      cache: "no-store",
    });
    if (!r.ok) return { ok: false, items: [], error: `HTTP ${r.status}` };
    const xml = await r.text();
    const isAtom = /<feed\b[^>]*xmlns=["']http:\/\/www\.w3\.org\/2005\/Atom["']/i.test(xml) || (/<feed\b/i.test(xml) && !/<rss\b/i.test(xml));
    const itemTag = isAtom ? "entry" : "item";
    const rawItems = allItems(xml, itemTag);
    const items = rawItems.map((r) => normalizeItem(r, isAtom)).filter((i) => i.title && i.link);
    return { ok: true, items, error: null };
  } catch (e) {
    return { ok: false, items: [], error: String(e?.message || e) };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAllFeeds(sources, { perFeedLimit = 10, hoursBack = 36 } = {}) {
  const cutoff = Date.now() - hoursBack * 3600 * 1000;
  const results = await Promise.allSettled(sources.map((s) => fetchFeed(s.url)));
  const all = [];
  results.forEach((res, i) => {
    const src = sources[i];
    if (res.status !== "fulfilled" || !res.value.ok) return;
    const items = res.value.items.slice(0, perFeedLimit).filter((it) => {
      const t = it.published ? new Date(it.published).getTime() : Date.now();
      return t >= cutoff;
    });
    items.forEach((it) =>
      all.push({
        ...it,
        source_name: src.name,
        source_url: src.url,
        category: src.category,
        weight: src.weight,
        sectors: src.sectors,
      })
    );
  });
  // Deduplicate by URL (some feeds republish across sources)
  const seen = new Set();
  return all.filter((i) => {
    const key = (i.link || "").split("?")[0];
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}
