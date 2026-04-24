import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID || "mvzvdjrq";

export async function POST(req) {
  try {
    const s = await createClient();
    const { data: { user } } = await s.auth.getUser();
    const body = await req.json();
    const { issue_type, details } = body;
    if (!details?.trim()) return NextResponse.json({ error: "Details required" }, { status: 400 });
    if (!["bug","feature","billing","account","other"].includes(issue_type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    // Store in DB
    await s.from("issue_reports").insert({
      user_id: user?.id || null,
      user_email: user?.email || body.email || null,
      issue_type,
      details: details.slice(0, 10000),
    });

    // Email admin via Formspree
    try {
      await fetch(`https://formspree.io/f/${FORMSPREE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `[Spy Issue: ${issue_type}] ${user?.email || "anonymous"}`,
          _replyto: user?.email || "noreply@atlasspy.com",
          from_user: user?.email || "anonymous",
          issue_type,
          details,
          timestamp: new Date().toISOString(),
        })
      });
    } catch (e) { console.error("Formspree notification failed:", e); }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
