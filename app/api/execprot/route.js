import { claudeSearch } from "@/lib/claude";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { target } = await req.json();
    if (!target?.trim()) return NextResponse.json({ error: "Target required" }, { status: 400 });
    const analysis = await claudeSearch(
      `You are an executive protection analyst. Conduct a comprehensive exposure assessment for the individual "${target}". Search the web for: 1) All public appearances of this name in news, social media, and corporate filings 2) Any personal information exposed (addresses, phone numbers, family members) 3) Data broker listings 4) Negative press or reputation risks 5) Potential physical security concerns based on public information 6) Digital attack surface assessment. Provide a risk rating for each finding and specific protection recommendations. Be thorough and factual.`
    );
    if (!analysis) return NextResponse.json({ error: "Assessment failed" }, { status: 502 });
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
