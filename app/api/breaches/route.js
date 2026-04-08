import { claudeJSON } from "@/lib/claude";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const data = await claudeJSON(`Search the web for data breaches associated with "${email}" or its domain. Check Have I Been Pwned mentions, breach reports, paste sites. Return JSON array: "source", "date", "type" (exposed data), "severity", "records", "status" (action_required/monitoring/resolved), "remediation". If none found, return known breaches likely to contain this email. ONLY valid JSON array.`);
    return NextResponse.json({ breaches: data && Array.isArray(data) ? data : [] });
  } catch (e) { return NextResponse.json({ breaches: [] }, { status: 500 }); }
}
