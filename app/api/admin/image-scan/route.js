import { geminiImageAnalysis } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;

const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID || "mvzvdjrq";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "atlasalpaytr@gmail.com";

export async function POST(req) {
  try {
    const { filename, filesize, dimensions, userEmail } = await req.json();
    if (!filename) return NextResponse.json({ error: "Filename required" }, { status: 400 });

    // Generate security analysis
    const analysis = await geminiImageAnalysis(filename, filesize, dimensions);

    // Save to DB
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("image_scans").insert({
        user_id: user.id, filename, filesize, analysis, admin_notified: true
      });
    }

    // Notify admin via Formspree
    try {
      await fetch(`https://formspree.io/f/${FORMSPREE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `[Spy Admin] Image uploaded: ${filename}`,
          email: ADMIN_EMAIL,
          message: `User ${userEmail || user?.email || "unknown"} uploaded image: ${filename} (${filesize}). Review in admin panel.`,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) { console.error("Admin notify failed:", e); }

    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
