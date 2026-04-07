import { claudeJSON } from "@/lib/claude";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const data = await claudeJSON(
      `Search the web thoroughly for data breaches associated with the email address "${email}" or its domain. Check Have I Been Pwned mentions, breach compilation reports, paste sites, and security news. Return a JSON array of breach objects with: "source" (service name that was breached), "date" (YYYY-MM-DD or approximate), "type" (what data was exposed), "severity" (critical/high/medium/low), "records" (total records in breach), "status" (one of: action_required, monitoring, resolved), "remediation" (specific steps). If no specific breaches found, return major known breaches that could potentially contain this email. Return ONLY valid JSON array.`
    );
    return NextResponse.json({ breaches: data && Array.isArray(data) ? data : [] });
  } catch (e) {
    return NextResponse.json({ breaches: [] }, { status: 500 });
  }
}
