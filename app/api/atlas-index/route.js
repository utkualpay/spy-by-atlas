// app/api/atlas-index/route.js
// Returns the latest Atlas Index reading + the last 30 days of history.
// Cached briefly at the edge.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data, error } = await supabase
    .from("atlas_index_history")
    .select("score, label, components, recorded_at")
    .order("recorded_at", { ascending: false })
    .limit(30);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const latest = data?.[0] || null;
  const history = (data || []).slice().reverse(); // chronological for sparkline
  let delta = null;
  if (history.length >= 2) {
    delta = history[history.length - 1].score - history[history.length - 2].score;
  }
  return NextResponse.json(
    { latest, history, delta },
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=900" } }
  );
}
