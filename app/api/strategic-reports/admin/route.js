import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "atlasalpaytr@gmail.com";

async function requireAdmin() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return { s, user };
}

export async function POST(req) {
  try {
    const ctx = await requireAdmin();
    if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { s } = ctx;
    const { action, report } = await req.json();

    if (action === "create") {
      const row = {
        slug: report.slug || report.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80),
        title: report.title,
        subtitle: report.subtitle || null,
        category: report.category || "analysis",
        classification: report.classification || "UNCLASSIFIED",
        content: report.content || "",
        summary: report.summary || null,
        tags: report.tags || [],
        published: report.published || false,
        published_at: report.published ? new Date().toISOString() : null,
      };
      const { data, error } = await s.from("strategic_reports").insert(row).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    if (action === "update") {
      const { id, ...updates } = report;
      if (updates.published && !updates.published_at) updates.published_at = new Date().toISOString();
      updates.updated_at = new Date().toISOString();
      const { data, error } = await s.from("strategic_reports").update(updates).eq("id", id).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    if (action === "delete") {
      await s.from("strategic_reports").delete().eq("id", report.id);
      return NextResponse.json({ success: true });
    }

    if (action === "list_all") {
      const { data } = await s.from("strategic_reports").select("*").order("created_at", { ascending: false });
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
