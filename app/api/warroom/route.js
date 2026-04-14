import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// GET: list sessions
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });
    const { data } = await supabase.from("warroom_sessions").select("id,title,status,created_at,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(20);
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json([], { status: 500 }); }
}

// POST: create, update, or load session
export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { action, sessionId, title, messages, status } = await req.json();

    if (action === "create") {
      const { data } = await supabase.from("warroom_sessions").insert({
        user_id: user.id, title: title || "New Session", messages: messages || []
      }).select("id").single();
      return NextResponse.json({ id: data?.id });
    }

    if (action === "save" && sessionId) {
      await supabase.from("warroom_sessions").update({
        messages, title, updated_at: new Date().toISOString()
      }).eq("id", sessionId).eq("user_id", user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "load" && sessionId) {
      const { data } = await supabase.from("warroom_sessions").select("*").eq("id", sessionId).eq("user_id", user.id).single();
      return NextResponse.json(data || { error: "Not found" });
    }

    if (action === "resolve" && sessionId) {
      await supabase.from("warroom_sessions").update({ status: "resolved", updated_at: new Date().toISOString() }).eq("id", sessionId).eq("user_id", user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
