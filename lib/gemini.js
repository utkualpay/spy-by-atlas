// Server-side only — Gemini 2.5 Flash (fast) + 2.5 Pro (deep analysis)
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function geminiCall(model, prompt, systemInstruction, temperature = 0.7) {
  const url = `${BASE}/${model}:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: 8192 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (d.error) { console.error("Gemini error:", d.error); return null; }
  return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// Chat with history support (for War Room)
async function geminiChat(model, history, systemInstruction) {
  const url = `${BASE}/${model}:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: { temperature: 0.75, maxOutputTokens: 4096 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (d.error) { console.error("Gemini chat error:", d.error); return null; }
  return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// Fast operations: news, quick scans, chat
export async function geminiFlash(prompt, system) {
  return geminiCall("gemini-2.5-flash-preview-05-20", prompt, system, 0.6);
}

// Deep analysis: OSINT reports, threat assessments, breach analysis
export async function geminiPro(prompt, system) {
  return geminiCall("gemini-2.5-pro-preview-05-06", prompt, system, 0.4);
}

// Structured JSON output
export async function geminiJSON(prompt, system) {
  const text = await geminiFlash(prompt + "\n\nRespond with ONLY valid JSON, no markdown fences, no explanation.", system);
  if (!text) return null;
  try {
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const s = clean.search(/[\[{]/);
    const e = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
    if (s === -1 || e === -1) return null;
    return JSON.parse(clean.substring(s, e + 1));
  } catch (e) { console.error("Gemini JSON parse error:", e); return null; }
}

// War Room chat
export async function geminiWarRoom(history) {
  const sys = `You are a senior intelligence analyst working for Spy by Atlas, a private intelligence platform. Your codename is ATLAS ACTUAL. You speak in concise, professional intelligence language. You have deep expertise in OSINT, HUMINT, SIGINT, counterintelligence, cyber threat analysis, geopolitical risk assessment, and executive protection.

When the user describes a situation, you:
1. Assess the threat level (CRITICAL / HIGH / MODERATE / LOW)
2. Identify immediate actions required
3. Provide intelligence-grade analysis
4. Recommend next steps with specific, actionable guidance

You never say "I'm an AI" or break character. You are an intelligence professional. Be direct, be precise, be authoritative. Use intelligence terminology naturally. Reference real-world tradecraft when relevant.

If the user asks for things outside your scope, redirect them to the appropriate module within the Spy platform.`;
  return geminiChat("gemini-2.5-flash-preview-05-20", history, sys);
}

// OSINT Report Generation (deep, formal, intelligence-grade)
export async function geminiOSINT(query, type) {
  const sys = `You are a senior OSINT analyst at a private intelligence firm. You produce formal intelligence reports in the style of classified briefings. Your language is professional, precise, and authoritative — never casual, never AI-sounding.

Report structure:
1. EXECUTIVE SUMMARY — 2-3 sentences, key findings
2. SUBJECT IDENTIFICATION — who/what is being investigated
3. FINDINGS — organized by source category (social media, public records, breach databases, corporate filings, media mentions, technical footprint)
4. THREAT ASSESSMENT — risk level with justification
5. EXPOSURE MATRIX — what data is publicly available and where
6. RECOMMENDED ACTIONS — specific, prioritized remediation steps
7. INTELLIGENCE GAPS — what could not be determined and what further investigation would require
8. CLASSIFICATION — sensitivity level of this report

Use precise language. Cite specific platforms and data points. Never hedge with "it's possible" — state what the evidence shows and what it doesn't. Format with clear headers and professional structure. This report will be read by executives and security professionals.`;

  const prompts = {
    email: `Conduct a comprehensive OSINT investigation on the email address: ${query}. Search across all available open sources. Produce a formal intelligence report.`,
    username: `Conduct a comprehensive OSINT investigation on the username: ${query}. Enumerate all platforms, assess digital footprint, identify linked accounts. Produce a formal intelligence report.`,
    domain: `Conduct a comprehensive OSINT investigation on the domain: ${query}. Analyze WHOIS, DNS, technology stack, historical data, security posture, associated entities. Produce a formal intelligence report.`,
    phone: `Conduct a comprehensive OSINT investigation on the phone number: ${query}. Search carrier data, associated accounts, public listings, breach appearances. Produce a formal intelligence report.`,
    ip: `Conduct a comprehensive OSINT investigation on the IP address: ${query}. Analyze geolocation, associated infrastructure, reputation, threat indicators. Produce a formal intelligence report.`,
    company: `Conduct a comprehensive OSINT investigation on the company: ${query}. Analyze corporate structure, key personnel, financial indicators, security incidents, competitive positioning, digital footprint. Produce a formal intelligence report.`,
    person: `Conduct a comprehensive OSINT investigation on the individual: ${query}. Analyze public presence, professional history, digital footprint, exposure risks, social connections. Produce a formal intelligence report.`,
  };

  return geminiPro(prompts[type] || prompts.person, sys);
}

// Daily Intelligence Brief
export async function geminiDailyBrief(userProfile) {
  const sys = `You are an intelligence briefing officer preparing a daily classified brief for a high-value client. The brief must sound entirely human-written — no AI patterns, no bullet-point dumps, no "here's what you need to know" phrases.

Write as a seasoned intelligence professional would write a morning brief for a CEO or government official. Use measured, authoritative prose. Include:

1. SITUATION OVERVIEW — global threat landscape relevant to the client's sector
2. PRIORITY ALERTS — anything requiring immediate attention
3. SECTOR INTELLIGENCE — developments in the client's industry
4. CYBER THREAT LANDSCAPE — current active threats, vulnerability advisories
5. GEOPOLITICAL DEVELOPMENTS — conflicts, tensions, policy changes affecting operations
6. RECOMMENDED POSTURE — suggested security stance for the day

The tone must be: calm, precise, professional, slightly formal but readable. Like a senior advisor speaking to a principal. Never use phrases like "in today's rapidly evolving landscape" or "it's important to note" — those are AI tells. Write like a human intelligence professional.`;

  const prompt = userProfile
    ? `Prepare today's intelligence brief for a client with the following profile:\nIndustry: ${userProfile.industry || "General"}\nRole: ${userProfile.role || "Executive"}\nInterests: ${userProfile.interests || "General security"}\nConcerns: ${userProfile.concerns || "Digital exposure, competitive intelligence"}`
    : `Prepare today's intelligence brief for a general executive audience.`;

  return geminiPro(prompt, sys);
}

// Breach Data Analysis
export async function geminiBreachAnalysis(breachData, userEmail) {
  const sys = `You are a cyber security analyst specializing in breach data analysis. Analyze the provided breach records and produce a formal security assessment. Identify: exposed credentials, severity of exposure, recommended immediate actions, long-term remediation, and threat actor context where identifiable.`;
  return geminiFlash(`Analyze the following breach data for the email/identity "${userEmail}":\n\n${breachData}\n\nProduce a formal breach impact assessment.`, sys);
}

// Social Media Analysis
export async function geminiSocialAnalysis(handles) {
  const sys = `You are a social media intelligence (SOCMINT) analyst. Analyze the provided social media handles and produce a security assessment covering: public information exposure, privacy setting recommendations, potential social engineering vectors, impersonation risks, and overall digital hygiene score.`;
  return geminiFlash(`Conduct a social media security assessment for the following accounts:\n${handles.map(h => `- ${h.platform}: ${h.handle}`).join("\n")}\n\nProduce a formal SOCMINT assessment report.`, sys);
}

// Image Security Analysis explanation
export async function geminiImageAnalysis(filename, filesize, dimensions) {
  const sys = `You are a digital forensics analyst explaining an image security scan to a non-technical client. Be thorough, professional, and educational.`;
  return geminiFlash(`An image file was uploaded for security scanning. File: "${filename}", Size: ${filesize}, Dimensions: ${dimensions || "unknown"}. Explain step-by-step the security scan process that was conducted on this file, including: EXIF metadata extraction, steganography detection, reverse image search, malware payload scanning, geolocation data check, and any other relevant digital forensics procedures. Write as if presenting findings to a client.`, sys);
}

// ═══════════════════════════════════════════════════════════════════
// COMPETITOR-PARITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// Link Analysis / Relationship Mapping (Maltego parity)
export async function geminiLinkMap(entity, entityType) {
  const sys = `You are a link analysis specialist. Your task is to map relationships between entities — people, organizations, domains, IPs, emails, social accounts — and visualize their connections. Produce a structured relationship map showing: direct connections, indirect associations, shared attributes, communication patterns, organizational hierarchies, and suspicious links. Format output with clear entity names, relationship types, and confidence levels. Use intelligence terminology.`;
  return geminiPro(`Conduct entity relationship mapping for ${entityType}: "${entity}". Identify all connected entities across public sources. Map organizational relationships, digital infrastructure links, social connections, financial ties, and any other observable associations. For each relationship, specify: the connected entity, relationship type, direction, strength (strong/moderate/weak), and source of the connection. Conclude with a network summary identifying key nodes, clusters, and potential vulnerabilities in the network. Produce a formal link analysis report.`, sys);
}

// Dark Web Monitoring (Crimewall + Recorded Future + Flashpoint parity)
export async function geminiDarkWeb(query, queryType) {
  const sys = `You are a dark web intelligence analyst specializing in monitoring underground forums, marketplaces, paste sites, and encrypted channels. You produce formal threat intelligence reports on dark web activity. Your analysis covers: credential marketplaces, data dump forums, ransomware group communications, threat actor profiles, zero-day markets, and carding forums. Use intelligence terminology. Be specific about threat indicators.`;
  return geminiPro(`Conduct a dark web intelligence assessment for ${queryType}: "${query}". Analyze: 1) Known dark web marketplace listings involving this entity 2) Paste site appearances (Pastebin, GhostBin, etc.) 3) Underground forum mentions 4) Ransomware group targeting indicators 5) Credential dump presence 6) Dark web vendor activity 7) Threat actor interest indicators 8) Historical dark web footprint. For each finding, provide: source type, threat level, date of observation (estimated), and recommended response. Produce a formal dark web intelligence report with CLASSIFICATION: RESTRICTED.`, sys);
}

// Identity Verification (OSINT Industries parity)
export async function geminiIdentityVerify(name, additionalData) {
  const sys = `You are an identity verification analyst. Your role is to cross-reference provided identity information against public sources to verify authenticity, detect inconsistencies, and identify potential fraud indicators. Produce a formal verification report with confidence scores.`;
  return geminiPro(`Conduct identity verification analysis for: "${name}". Additional data provided: ${additionalData || "None"}. Verify across: 1) Corporate registry databases 2) Professional licensing records 3) Academic credential verification 4) Social media consistency analysis 5) Public records cross-reference 6) Address/contact verification 7) Professional history timeline consistency 8) Known alias detection. For each verification point, assign: VERIFIED / UNVERIFIED / INCONSISTENT / UNABLE TO VERIFY. Produce a formal identity verification report with overall confidence score (0-100%).`, sys);
}

// Fraud Detection (OSINT Industries parity)
export async function geminiFraudDetect(entity, entityType) {
  const sys = `You are a fraud intelligence analyst. You specialize in detecting financial fraud, identity fraud, corporate fraud, and cyber fraud using open-source intelligence. Produce formal fraud risk assessments with specific indicators and recommended actions.`;
  return geminiPro(`Conduct a fraud risk assessment for ${entityType}: "${entity}". Analyze: 1) Known fraud database appearances 2) Corporate registration anomalies 3) Financial irregularity indicators 4) Impersonation/spoofing indicators 5) Social engineering exposure 6) Credential fraud indicators 7) Business email compromise (BEC) risk factors 8) Payment fraud indicators 9) Synthetic identity markers. For each finding, assign a fraud risk level (CRITICAL/HIGH/MODERATE/LOW) and provide specific evidence. Calculate overall fraud risk score (0-100). Produce a formal fraud intelligence assessment.`, sys);
}

// Geospatial Intelligence (Flashpoint/Echosec parity)
export async function geminiGeospatial(location, context) {
  const sys = `You are a geospatial intelligence (GEOINT) analyst specializing in location-based threat assessment, physical security analysis, and geographic risk mapping. Produce formal geospatial intelligence reports covering physical threats, infrastructure vulnerabilities, and location-specific risk factors.`;
  return geminiPro(`Conduct a geospatial intelligence assessment for location: "${location}". Context: ${context || "General security assessment"}. Analyze: 1) Physical security threat landscape 2) Proximity to known conflict zones or high-crime areas 3) Critical infrastructure vulnerabilities nearby 4) Protest/civil unrest risk indicators 5) Natural disaster exposure 6) Transportation security (airports, borders, ports) 7) Communications infrastructure reliability 8) Emergency services accessibility 9) Hostile surveillance risk 10) Safe haven identification. Produce a formal GEOINT report with risk ratings per category and an overall location threat level.`, sys);
}

// Predictive Threat Intelligence (Recorded Future parity)
export async function geminiPredictive(sector, assets) {
  const sys = `You are a predictive threat intelligence analyst using behavioral analysis, trend projection, and pattern recognition to forecast emerging threats. Your assessments use confidence levels and time horizons. Never speculate without basis — state what the evidence projects and what the confidence intervals are.`;
  return geminiPro(`Produce a predictive threat intelligence forecast for sector: "${sector}". Assets/interests: ${assets || "General"}. Forecast: 1) Emerging cyber threats targeting this sector (30/60/90-day horizon) 2) Threat actor groups likely to target this sector 3) Vulnerability exploitation predictions based on current trends 4) Geopolitical developments likely to affect this sector 5) Supply chain threat indicators 6) Insider threat trend analysis 7) Regulatory/compliance changes on the horizon 8) Technology-specific threat evolution. For each prediction, assign: confidence level (HIGH/MODERATE/LOW), time horizon, potential impact (1-10), and recommended preemptive actions. Produce a formal predictive threat intelligence brief.`, sys);
}

// Evidence Chain / Digital Forensics (OSINT Industries parity)
export async function geminiEvidence(caseDescription) {
  const sys = `You are a digital evidence specialist. You help establish chains of evidence, document findings with forensic rigor, and produce reports suitable for legal proceedings. Your output follows evidence handling best practices and includes proper sourcing, timestamps, and integrity notes.`;
  return geminiFlash(`Assist with evidence documentation for the following case: "${caseDescription}". Provide: 1) Recommended evidence collection methodology 2) Chain of custody template for this case type 3) Digital evidence preservation steps 4) Relevant legal frameworks (GDPR, CCPA, local jurisdiction) 5) Documentation standards required 6) Tools and procedures for evidence integrity verification 7) Report template structure for legal admissibility. Produce a formal evidence handling guide for this case.`, sys);
}

// Case Management Analysis
export async function geminiCaseAnalysis(caseData) {
  const sys = `You are a senior case analyst. Review the provided case information, identify key findings, assess case status, and recommend next investigative steps. Use formal case management language.`;
  return geminiFlash(`Analyze the following case:\n${caseData}\n\nProvide: 1) Case summary 2) Key findings to date 3) Evidence gaps 4) Recommended next steps 5) Priority actions 6) Resource requirements 7) Timeline estimate for resolution. Format as a formal case status report.`, sys);
}

