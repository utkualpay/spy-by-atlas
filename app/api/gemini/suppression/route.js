import { geminiFlash } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { name, email, action } = await req.json();
    if (action === "mass_optout") {
      const brokers = ["Whitepages", "Spokeo", "BeenVerified", "Intelius", "TruePeopleSearch", "FastPeopleSearch", "ThatsThem", "Radaris", "USSearch", "Pipl", "PeopleFinders", "Experian (opt-out)", "Acxiom", "LexisNexis", "Oracle Data Cloud"];
      const guide = await geminiFlash(
        `Generate specific, step-by-step opt-out instructions for ${name || "the user"} (${email || "email not provided"}) for each of these data brokers: ${brokers.join(", ")}. For each broker provide: 1) Direct opt-out URL 2) Required information to submit 3) Expected processing time 4) Follow-up steps if the listing reappears. Also provide GDPR deletion request template and CCPA opt-out template.`,
        "You are a privacy analyst. Be specific with URLs and steps. These opt-outs are time-sensitive."
      );
      try { const s = await createClient(); const { data: { user } } = await s.auth.getUser(); if (user) { await s.from("suppression_requests").insert({ user_id: user.id, type: "mass_optout", target_name: name, target_email: email, brokers_targeted: brokers, status: "processing" }); await s.from("reports").insert({ user_id: user.id, type: "custom", title: `Suppression: Mass Opt-Out`, content: guide, classification: "CONFIDENTIAL" }); } } catch (e) {}
      return NextResponse.json({ guide, brokers, timestamp: new Date().toISOString() });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
