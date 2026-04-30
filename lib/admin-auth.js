// lib/admin-auth.js
//
// Single source of truth for admin status. Used by:
//   • Server components that render admin pages
//   • API routes that perform admin actions
//   • Client components (via /api/me which exposes is_admin: boolean)
//
// Source of admin identity:
//   ADMIN_EMAILS env var — comma-separated email list, e.g.
//     ADMIN_EMAILS=atlasalpaytr@gmail.com,you@yourdomain.com
//
// Falls back to a single legacy email if env not set, matching the existing
// dashboard convention.

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
  return adminEmails().includes(email.toLowerCase());
}

/**
 * Returns { user, isAdmin } from the current request.
 * Use in server components and API routes.
 */
export async function getCurrentUserAndAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, isAdmin: false };
    return { user, isAdmin: isAdminEmail(user.email) };
  } catch {
    return { user: null, isAdmin: false };
  }
}

/**
 * Throws (returns null + error response) if not admin. For API routes:
 *   const guard = await requireAdmin();
 *   if (guard.error) return guard.error;
 */
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const { user, isAdmin } = await getCurrentUserAndAdmin();
  if (!user) return { user: null, isAdmin: false, error: NextResponse.json({ error: "unauthenticated" }, { status: 401 }) };
  if (!isAdmin) return { user, isAdmin: false, error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { user, isAdmin: true, error: null };
}
