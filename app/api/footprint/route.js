import { claudeSearch } from "@/lib/claude";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query, type } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });
    const analysis = await claudeSearch(
      `You are a digital footprint analyst. Conduct a thorough search of the ${type} "${query}" across the internet. Find: 1) Social media profiles and accounts 2) Data broker listings 3) Public records appearances 4) Forum and community posts 5) Professional profiles 6) Any data breach appearances 7) Website registrations or mentions. For each finding, provide: the platform/source, what data is visible, a risk rating (critical/high/medium/low), and specific remediation steps. Calculate an overall exposure score from 0-100. Be thorough and factual.`
    );
    if (!analysis) return NextResponse.json({ error: "Scan failed" }, { status: 502 });
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
