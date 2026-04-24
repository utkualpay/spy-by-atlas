import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// GET — list published reports (any authenticated user)
// GET with ?slug=... — fetch single report
export async function GET(req) {
  try {
    const s = await createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });
    const slug = new URL(req.url).searchParams.get("slug");
    if (slug) {
      const { data } = await s.from("strategic_reports").select("*").eq("slug", slug).eq("published", true).single();
      return NextResponse.json(data || { error: "Not found" });
    }
    const { data } = await s.from("strategic_reports")
      .select("id, slug, title, subtitle, category, classification, summary, tags, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json([], { status: 500 }); }
}
