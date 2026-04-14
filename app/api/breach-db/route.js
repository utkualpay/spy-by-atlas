import { geminiBreachAnalysis } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;

// Search breach DB + AI analysis
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, action } = body;
    const supabase = await createClient();

    // Admin upload breach data
    if (action === "upload") {
      const { source_name, breach_date, data_types, total_records, severity, raw_data, emails } = body;
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email !== process.env.ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      const { error } = await supabase.from("breach_entries").insert({
        source_name, breach_date, data_types, total_records, severity, raw_data,
        searchable_emails: emails || [], uploaded_by: user.email
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Search local breach DB
    const { data: localBreaches } = await supabase
      .from("breach_entries")
      .select("source_name, breach_date, data_types, severity, total_records")
      .contains("searchable_emails", [email.toLowerCase()]);

    // AI-powered analysis
    const analysis = await geminiBreachAnalysis(
      localBreaches?.length ? JSON.stringify(localBreaches) : "No records in local database",
      email
    );

    // Save report
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("reports").insert({
        user_id: user.id, type: "breach", title: `Breach Scan: ${email}`,
        subject: email, content: analysis, metadata: { local_matches: localBreaches?.length || 0 }
      });
    }

    return NextResponse.json({ analysis, localBreaches: localBreaches || [], timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
