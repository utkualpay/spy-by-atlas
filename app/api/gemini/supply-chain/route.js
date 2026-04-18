import { geminiPro } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { vendorDomain, vendorName } = await req.json();
    if (!vendorDomain?.trim()) return NextResponse.json({ error: "Domain required" }, { status: 400 });
    const analysis = await geminiPro(
      `Conduct a third-party threat assessment for vendor/subcontractor:\nVendor: ${vendorName || vendorDomain}\nDomain: ${vendorDomain}\n\nAnalyze: 1) Domain security posture (SSL, DNSSEC, email security headers) 2) Known vulnerabilities in their technology stack 3) Dark web mentions of the domain or company 4) Data breach history 5) Employee credential exposure 6) Exposed ports and services 7) Compliance indicators (SOC2, ISO 27001, GDPR) 8) Financial stability indicators 9) Key personnel security exposure 10) Overall supply chain risk score (0-100). Produce a formal vendor risk assessment.`,
      "You are a supply chain security analyst. Produce formal vendor risk assessments with specific findings and risk scores."
    );
    if (!analysis) return NextResponse.json({ error: "Scan failed" }, { status: 502 });
    try {
      const s = await createClient(); const { data: { user } } = await s.auth.getUser();
      if (user) {
        await s.from("reports").insert({ user_id: user.id, type: "threat_assessment", title: `Vendor Risk: ${vendorDomain}`, subject: vendorDomain, content: analysis, classification: "CONFIDENTIAL" });
        await s.from("supply_chain").upsert({ user_id: user.id, vendor_name: vendorName || vendorDomain, vendor_domain: vendorDomain, last_scan: new Date().toISOString(), scan_results: { summary: analysis.slice(0, 500) } }, { onConflict: "user_id,vendor_domain" }).select();
      }
    } catch (e) {}
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
