import { geminiOSINT } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { query, type } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });
    const report = await geminiOSINT(query, type || "person");
    if (!report) return NextResponse.json({ error: "Analysis failed. Retry." }, { status: 502 });

    // Save report to database
    let reportId = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("reports").insert({
          user_id: user.id, type: "osint", title: `OSINT: ${query} (${type})`,
          subject: query, content: report, classification: "CONFIDENTIAL",
          metadata: { query_type: type, generated_at: new Date().toISOString() }
        }).select("id").single();
        reportId = data?.id;
      }
    } catch (e) { console.error("Report save error:", e); }

    return NextResponse.json({ report, reportId, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
