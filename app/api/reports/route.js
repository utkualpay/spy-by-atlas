import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    let query = supabase.from("reports").select("id,type,title,subject,classification,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (type) query = query.eq("type", type);
    const { data } = await query;
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json([], { status: 500 }); }
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    const { data } = await supabase.from("reports").select("*").eq("id", id).eq("user_id", user.id).single();
    return NextResponse.json(data || { error: "Not found" });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
