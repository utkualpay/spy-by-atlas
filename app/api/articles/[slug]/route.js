// app/api/articles/[slug]/route.js
// Single article fetch + view bump.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error || !data) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Fire-and-forget view bump (do not block the response)
  supabase.rpc("bump_article_view", { p_slug: slug }).then(() => {});

  return NextResponse.json({ article: data });
}
