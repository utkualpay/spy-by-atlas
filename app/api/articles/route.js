// app/api/articles/route.js
// Public listing — supports ?category=, ?sector=, ?tag=, ?limit=, ?offset=, ?q=

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30", 10), 60);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const category = url.searchParams.get("category");
  const sector = url.searchParams.get("sector");
  const tag = url.searchParams.get("tag");
  const q = url.searchParams.get("q");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  let query = supabase
    .from("articles")
    .select("id, slug, headline, dek, category, sectors, severity, tags, source_name, published_at, view_count")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (sector) query = query.contains("sectors", [sector]);
  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.ilike("headline", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data || [] }, { headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" } });
}
