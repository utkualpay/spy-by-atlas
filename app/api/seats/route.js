import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const s = await createClient(); const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });
    const { data } = await s.from("seats").select("*").eq("master_id", user.id).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json([], { status: 500 }); }
}
export async function POST(req) {
  try {
    const s = await createClient(); const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { action, email, role } = await req.json();
    if (action === "invite") {
      await s.from("seats").insert({ master_id: user.id, email, role: role || "member" });
      return NextResponse.json({ success: true });
    }
    if (action === "remove") {
      await s.from("seats").update({ status: "removed" }).eq("email", email).eq("master_id", user.id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
