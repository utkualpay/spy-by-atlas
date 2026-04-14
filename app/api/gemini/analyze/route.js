import { geminiPro } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { query, type, module } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });

    const sys = `You are a senior intelligence analyst producing formal reports. Use professional intelligence language. Structure findings clearly. Cite specific observations. Never sound AI-generated.`;

    const prompts = {
      footprint: `Conduct a comprehensive digital footprint analysis for ${type}: "${query}". Analyze all public exposure vectors: social media, data brokers, public records, corporate filings, web mentions, breach appearances. Assign an exposure score 0-100. Structure as a formal intelligence report.`,
      execprot: `Conduct an executive protection exposure assessment for: "${query}". Analyze: public information exposure, physical security indicators, reputation risks, social engineering vectors, data broker presence, digital attack surface. Structure as a formal protection assessment.`,
      threat: `Conduct a threat assessment for: "${query}". Analyze: current threat landscape, sector-specific risks, vulnerability exposure, threat actor interest indicators. Structure as a formal threat intelligence report.`,
      docintel: `Analyze document security considerations for: "${query}". Cover: metadata exposure risks, distribution tracking methods, leak detection approaches, classification recommendations. Structure as a document intelligence brief.`,
    };

    const analysis = await geminiPro(prompts[module] || prompts.footprint, sys);
    if (!analysis) return NextResponse.json({ error: "Analysis failed" }, { status: 502 });

    // Save report
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("reports").insert({
          user_id: user.id, type: module === "execprot" ? "executive_protection" : module === "threat" ? "threat_assessment" : "footprint",
          title: `${module?.toUpperCase() || "ANALYSIS"}: ${query}`,
          subject: query, content: analysis, classification: "CONFIDENTIAL"
        });
      }
    } catch (e) {}

    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
