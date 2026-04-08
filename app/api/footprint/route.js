import { claudeSearch } from "@/lib/claude";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { query, type } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });
    const analysis = await claudeSearch(`You are a digital footprint analyst. Search ${type} "${query}": social media, data brokers, public records, forums, professional profiles, breaches, web mentions. For each: platform, visible data, risk rating, remediation. Overall exposure score 0-100. Be thorough.`);
    if (!analysis) return NextResponse.json({ error: "Scan failed" }, { status: 502 });
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
