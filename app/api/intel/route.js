import { geminiJSON } from "@/lib/gemini";
import { NextResponse } from "next/server";
export const maxDuration = 60;

export async function GET() {
  try {
    const data = await geminiJSON(
      `You are an intelligence news aggregator. Search your knowledge for the 10 most important cybersecurity and geopolitical intelligence developments from the past 48 hours as of today. Return a JSON array with objects: {"title":"string","source":"string","url":"string or #","category":"vulnerability|threat-actor|ransomware|nation-state|policy|geopolitical|data-breach","sector":"Cybersecurity|Finance & Banking|Energy & Infrastructure|Healthcare|Defense & Government|Technology|Legal|Maritime & Logistics|Telecommunications","severity":"critical|high|medium|low|info","summary":"1 sentence","time":"relative like 3h ago"}`,
      "You are a real-time intelligence feed. Return only factual, current events. Use real publication names."
    );
    if (data && Array.isArray(data) && data.length > 0) return NextResponse.json(data);
    return NextResponse.json([{ title: "Feed loading — retry in a moment", source: "System", url: "#", category: "info", sector: "Cybersecurity", severity: "info", summary: "Intelligence feed is being prepared.", time: "now" }]);
  } catch (e) {
    return NextResponse.json([{ title: "Feed error", source: "System", url: "#", category: "info", sector: "Cybersecurity", severity: "info", summary: String(e?.message || ""), time: "now" }], { status: 500 });
  }
}
