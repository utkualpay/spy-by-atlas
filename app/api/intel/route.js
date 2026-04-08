import { claudeJSON } from "@/lib/claude";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET() {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json([{ title: "Intelligence feed not configured.", source: "System", url: "#", category: "info", sector: "Cybersecurity", severity: "info", summary: "ANTHROPIC_API_KEY environment variable is required.", time: "now" }]);
    }
    const data = await claudeJSON(
      `Search the web for the 8 most important cybersecurity and geopolitical intelligence news stories from the past 48 hours. Return a JSON array of objects with fields: "title" (string), "source" (string), "url" (string), "category" (one of: vulnerability, threat-actor, ransomware, nation-state, policy, geopolitical, data-breach), "sector" (one of: Cybersecurity, Finance & Banking, Energy & Infrastructure, Healthcare, Defense & Government, Technology, Legal, Maritime & Logistics, Telecommunications), "severity" (one of: critical, high, medium, low, info), "summary" (1 sentence), "time" (relative like "3h ago"). Return ONLY valid JSON array.`
    );
    if (data && Array.isArray(data) && data.length > 0) return NextResponse.json(data);
    return NextResponse.json([{ title: "Feed temporarily unavailable. Please retry.", source: "System", url: "#", category: "info", sector: "Cybersecurity", severity: "info", summary: "Analysts are restoring the live feed.", time: "now" }]);
  } catch (e) {
    console.error("Intel feed error:", e);
    return NextResponse.json([{ title: "Feed error — please retry.", source: "System", url: "#", category: "info", sector: "Cybersecurity", severity: "info", summary: String(e?.message || "Unknown error"), time: "now" }], { status: 500 });
  }
}
