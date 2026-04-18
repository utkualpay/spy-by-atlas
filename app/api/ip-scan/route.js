import { NextResponse } from "next/server";
import { geminiFlash } from "@/lib/gemini";
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { ip } = await req.json();
    // Use ip-api.com (free, no key needed for server-side)
    const geo = await fetch(`http://ip-api.com/json/${ip || ""}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query`);
    const geoData = await geo.json();
    if (geoData.status !== "success") return NextResponse.json({ error: "IP lookup failed" }, { status: 502 });

    // Threat assessment via Gemini
    const threat = await geminiFlash(
      `Assess this IP for security threats:\nIP: ${geoData.query}\nISP: ${geoData.isp}\nOrg: ${geoData.org}\nAS: ${geoData.as}\nProxy: ${geoData.proxy}\nHosting: ${geoData.hosting}\nLocation: ${geoData.city}, ${geoData.regionName}, ${geoData.country}\n\nCheck: Is this IP on known blacklists? Is the ISP associated with threats? Is this a proxy/VPN/hosting IP? Rate threat level: SAFE / CAUTION / COMPROMISED.`,
      "You are a network threat analyst. Be concise. Give a threat level and 2-3 sentence assessment."
    );

    return NextResponse.json({
      ip: geoData.query, country: geoData.country, region: geoData.regionName,
      city: geoData.city, lat: geoData.lat, lon: geoData.lon,
      isp: geoData.isp, org: geoData.org, as: geoData.as,
      isProxy: geoData.proxy, isHosting: geoData.hosting,
      threatAssessment: threat,
      timestamp: new Date().toISOString()
    });
  } catch (e) { return NextResponse.json({ error: "Scan failed" }, { status: 500 }); }
}
