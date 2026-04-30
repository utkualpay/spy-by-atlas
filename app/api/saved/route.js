// app/api/saved/route.js
//
// User's personal article library. Mirrors Stratfor's "My Collections" pattern.
// Requires auth. Tied to saved_articles table from the existing schema.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getUser() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  return { user, sb };
}

export async function GET(req) {
  const { user, sb } = await getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const url = new URL(req.url);
  const checkId = url.searchParams.get("article_id");

  if (checkId) {
    // single-article check (used by the save button)
    const { data } = await sb.from("saved_articles").select("id").eq("user_id", user.id).eq("article_id", checkId).maybeSingle();
    return NextResponse.json({ saved: !!data });
  }

  // full library
  const { data } = await sb
    .from("saved_articles")
    .select("article_id, saved_at, articles(slug, headline, dek, category, severity, source_name, published_at)")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false })
    .limit(200);

  return NextResponse.json({ items: (data || []).map((d) => ({ ...d.articles, saved_at: d.saved_at })) });
}

export async function POST(req) {
  const { user, sb } = await getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { article_id } = await req.json();
  if (!article_id) return NextResponse.json({ error: "article_id_required" }, { status: 400 });
  const { error } = await sb.from("saved_articles").upsert({ user_id: user.id, article_id }, { onConflict: "user_id,article_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, saved: true });
}

export async function DELETE(req) {
  const { user, sb } = await getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { article_id } = await req.json();
  if (!article_id) return NextResponse.json({ error: "article_id_required" }, { status: 400 });
  const { error } = await sb.from("saved_articles").delete().eq("user_id", user.id).eq("article_id", article_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, saved: false });
}
