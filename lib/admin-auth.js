// lib/admin-auth.js — REVISION 3
//
// Single source of truth for admin status. Cleaner than rev2: all imports
// at top, no late `import` statements that some bundlers stumble on.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const LEGACY_FALLBACK = "atlasalpaytr@gmail.com";

function adminEmails() {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || LEGACY_FALLBACK;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  if (!email) return false;
  return adminEmails().includes(String(email).toLowerCase());
}

export async function getCurrentUserAndAdmin() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user || null;
    if (!user) return { user: null, isAdmin: false };
    return { user, isAdmin: isAdminEmail(user.email) };
  } catch {
    return { user: null, isAdmin: false };
  }
}

export async function requireAdmin() {
  const { user, isAdmin } = await getCurrentUserAndAdmin();
  if (!user) {
    return { user: null, isAdmin: false, error: NextResponse.json({ error: "unauthenticated" }, { status: 401 }) };
  }
  if (!isAdmin) {
    return { user, isAdmin: false, error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user, isAdmin: true, error: null };
}
