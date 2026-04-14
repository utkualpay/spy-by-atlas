import { geminiSocialAnalysis } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });
    const { data } = await supabase.from("social_handles").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json([], { status: 500 }); }
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { action, handles, handleId } = await req.json();

    if (action === "add") {
      for (const h of handles) {
        await supabase.from("social_handles").insert({ user_id: user.id, platform: h.platform, handle: h.handle });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "analyze") {
      const { data: userHandles } = await supabase.from("social_handles").select("platform, handle").eq("user_id", user.id);
      if (!userHandles?.length) return NextResponse.json({ error: "No handles to analyze" }, { status: 400 });
      const analysis = await geminiSocialAnalysis(userHandles);
      if (analysis) {
        await supabase.from("reports").insert({
          user_id: user.id, type: "social_media", title: "Social Media Security Assessment",
          content: analysis, classification: "CONFIDENTIAL"
        });
        // Update handle statuses
        await supabase.from("social_handles").update({ status: "monitoring", last_review: new Date().toISOString() }).eq("user_id", user.id);
      }
      return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
    }

    if (action === "remove") {
      await supabase.from("social_handles").delete().eq("id", handleId).eq("user_id", user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
