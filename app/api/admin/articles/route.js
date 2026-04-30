// app/api/admin/articles/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function GET() {
  const guard = await requireAdmin(); if (guard.error) return guard.error;
  const sb = admin();
  const { data, error } = await sb.from("articles")
    .select("id, slug, headline, dek, body_markdown, published, published_at, view_count, source_name")
    .order("published_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data || [] });
}

export async function POST(req) {
  const guard = await requireAdmin(); if (guard.error) return guard.error;
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Manual curation trigger — proxies to the cron route with the secret
  if (action === "curate") {
    const cronUrl = `${url.origin}/api/cron/curate`;
    try {
      const r = await fetch(cronUrl, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET || ""}` },
      });
      const d = await r.json();
      return NextResponse.json(d, { status: r.status });
    } catch (e) {
      return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
  }

  // Update article
  const body = await req.json();
  const { id, headline, dek, body_markdown, published } = body;
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const updates = { updated_at: new Date().toISOString() };
  if (typeof headline === "string") updates.headline = headline;
  if (typeof dek === "string") updates.dek = dek;
  if (typeof body_markdown === "string") updates.body_markdown = body_markdown;
  if (typeof published === "boolean") updates.published = published;

  const sb = admin();
  const { error } = await sb.from("articles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await sb.from("admin_log").insert({
      action: "article_update",
      details: { article_id: id, updates: Object.keys(updates) },
      performed_by: guard.user.email,
    });
  } catch {}

  return NextResponse.json({ ok: true });
}
