// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const TIERS = new Set(["observer", "personal_pro", "business", "executive"]);
const STATUSES = new Set(["inactive", "trial", "active", "cancelled", "past_due"]);

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function GET(req) {
  const guard = await requireAdmin(); if (guard.error) return guard.error;
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const sb = admin();
  let query = sb.from("profiles").select("id, email, full_name, tier, subscription_status, trial_ends_at, created_at").order("created_at", { ascending: false }).limit(200);
  if (q) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data || [] });
}

export async function POST(req) {
  const guard = await requireAdmin(); if (guard.error) return guard.error;
  const body = await req.json();
  const { id, tier, subscription_status } = body;
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const updates = {};
  if (tier && TIERS.has(tier)) updates.tier = tier;
  if (subscription_status && STATUSES.has(subscription_status)) updates.subscription_status = subscription_status;
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "no_changes" }, { status: 400 });

  const sb = admin();
  const { error } = await sb.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  try {
    await sb.from("admin_log").insert({
      action: "user_update",
      details: { target_id: id, updates },
      performed_by: guard.user.email,
    });
  } catch {}

  return NextResponse.json({ ok: true });
}
