import { claudeJSON } from "@/lib/claude";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await claudeJSON(
      `Search the web for the 12 most recent cybersecurity and intelligence news stories from the past 72 hours. For each story, return a JSON array of objects with these exact fields: "title" (string), "source" (string - publication name), "url" (string - direct link to article), "category" (one of: vulnerability, threat-actor, ransomware, nation-state, policy, encryption, geopolitical, data-breach), "sector" (one of: Cybersecurity, Finance & Banking, Energy & Infrastructure, Healthcare, Defense & Government, Technology, Legal, Maritime & Logistics, Telecommunications), "severity" (one of: critical, high, medium, low, info), "summary" (1-2 sentence summary), "time" (relative time like "3h ago", "1d ago"). Return ONLY valid JSON array, no other text.`
    );
    if (data && Array.isArray(data)) return NextResponse.json(data);
    return NextResponse.json([{ title: "Unable to fetch live news.", source: "System", url: "#", category: "info", sector: "Cybersecurity", severity: "info", summary: "Check connection and try again.", time: "now" }]);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
