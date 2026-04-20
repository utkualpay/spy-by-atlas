import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const s = await createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });
    const { data } = await s.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json([], { status: 500 }); }
}

export async function POST(req) {
  try {
    const s = await createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { action, id, title, content, color } = body;

    if (action === "create") {
      const { data, error } = await s.from("notes").insert({
        user_id: user.id,
        title: title || "Untitled",
        content: content || "",
        color: color || "default",
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    if (action === "update") {
      await s.from("notes").update({ title, content, color, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      await s.from("notes").delete().eq("id", id).eq("user_id", user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
