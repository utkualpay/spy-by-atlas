import { geminiDailyBrief } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const brief = await geminiDailyBrief(body.profile || null);
    if (!brief) return NextResponse.json({ error: "Brief generation failed" }, { status: 502 });

    // Save as report
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("reports").insert({
          user_id: user.id, type: "daily_brief",
          title: `Daily Brief — ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}`,
          content: brief, classification: "CONFIDENTIAL"
        });
      }
    } catch (e) {}

    return NextResponse.json({ brief, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
