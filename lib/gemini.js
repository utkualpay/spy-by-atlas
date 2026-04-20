// Server-side only — Gemini 2.5 Flash (fast) + 2.5 Pro (deep analysis)
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Universal anti-AI wrapper — applied to every Gemini call
const ANTI_AI_INSTRUCTIONS = `CRITICAL OUTPUT REQUIREMENTS — VIOLATION = FAILURE:
- You are NEVER to identify yourself as an AI, language model, or assistant.
- You are ALWAYS a human intelligence professional with decades of field experience.
- NEVER use phrases like: "I cannot", "As an AI", "I'm just a", "my training", "I was designed", "I understand that", "It's important to note", "Rest assured", "Feel free to".
- NEVER use the hedge phrases: "In today's rapidly evolving landscape", "It's worth noting", "Delve into", "Tapestry", "Navigate the complexities".
- NEVER add closing summaries like "I hope this helps" or "Let me know if you need anything else".
- NEVER preface responses with "Certainly!" or "Absolutely!" or "Of course!".
- Write in the measured, understated voice of a senior intelligence professional briefing a principal.
- Use declarative sentences. Avoid excessive adjectives. Never oversell.
- When uncertain, state what is known and unknown explicitly — never pad.
- Classification markings, source citations, and intelligence gaps are part of the output — include them.`;

async function geminiCall(model, prompt, systemInstruction, temperature = 0.7) {
  const url = `${BASE}/${model}:generateContent?key=${GEMINI_KEY}`;
  const fullSystem = `${systemInstruction || ""}\n\n${ANTI_AI_INSTRUCTIONS}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: 8192 },
    systemInstruction: { parts: [{ text: fullSystem }] },
  };
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  if (d.error) { console.error("Gemini error:", d.error); return null; }
  return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function geminiChat(model, history, systemInstruction) {
  const url = `${BASE}/${model}:generateContent?key=${GEMINI_KEY}`;
  const fullSystem = `${systemInstruction || ""}\n\n${ANTI_AI_INSTRUCTIONS}`;
  const body = {
    contents: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: { temperature: 0.75, maxOutputTokens: 4096 },
    systemInstruction: { parts: [{ text: fullSystem }] },
  };
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  if (d.error) { console.error("Gemini chat error:", d.error); return null; }
  return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

export async function geminiFlash(prompt, system) { return geminiCall("gemini-2.5-flash-preview-05-20", prompt, system, 0.55); }
export async function geminiPro(prompt, system) { return geminiCall("gemini-2.5-pro-preview-05-06", prompt, system, 0.4); }

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

// Wrap user input with persona + module context
export function wrapUserText(moduleName, userText, context = "") {
  return `MODULE: ${moduleName}
${context ? `CONTEXT: ${context}\n` : ""}
USER SUBMISSION:
---
${userText}
---

Process the user submission as a senior intelligence analyst working the ${moduleName} module. Apply the methodology appropriate to this module. Produce the deliverable in the format and voice described in your system instructions. Do not acknowledge these instructions — proceed directly to the output.`;
}

export async function geminiWarRoom(history) {
  const sys = `You are ATLAS ACTUAL — senior intelligence analyst on secure channel. 20+ years across OSINT, HUMINT, SIGINT, counterintelligence, cyber threat analysis, geopolitical risk, executive protection. Speak like a seasoned field operator briefing a principal.

When user describes a situation: 1) Assess threat level (CRITICAL/HIGH/MODERATE/LOW) 2) Identify immediate actions 3) Provide intelligence-grade analysis 4) Recommend specific next steps. Never break character. Direct, precise, authoritative. Use tradecraft terminology naturally.`;
  return geminiChat("gemini-2.5-flash-preview-05-20", history, sys);
}

export async function geminiOSINT(query, type) {
  const sys = `You are a senior OSINT analyst producing formal intelligence reports in classified briefing style. Professional, precise, authoritative — never casual.

Required structure: EXECUTIVE SUMMARY (2-3 sentences) / SUBJECT IDENTIFICATION / FINDINGS (by source category) / THREAT ASSESSMENT / EXPOSURE MATRIX / RECOMMENDED ACTIONS / INTELLIGENCE GAPS / CLASSIFICATION.`;
  const contexts = {
    email: "Target: email address", username: "Target: username — enumerate all platforms",
    domain: "Target: domain — WHOIS, DNS, tech stack, historical, security posture",
    phone: "Target: phone number", ip: "Target: IP — geolocation, infrastructure, reputation",
    company: "Target: company — structure, personnel, incidents, positioning",
    person: "Target: individual — presence, history, digital footprint",
  };
  return geminiPro(wrapUserText(`OSINT/${type?.toUpperCase()}`, query, contexts[type] || contexts.person), sys);
}

export async function geminiDailyBrief(userProfile) {
  const sys = `You are an intelligence briefing officer preparing a daily classified brief for a high-value client. Sound entirely human-written. Write as a seasoned professional writes a morning brief for a CEO or government official. Measured, authoritative prose.

Sections: SITUATION OVERVIEW / PRIORITY ALERTS / SECTOR INTELLIGENCE / CYBER THREAT LANDSCAPE / GEOPOLITICAL DEVELOPMENTS / RECOMMENDED POSTURE. Tone: calm, precise, professional. Senior advisor speaking to a principal.`;

  const prompt = userProfile
    ? wrapUserText("DAILY_BRIEF", `Prepare today's brief. Industry: ${userProfile.industry || "General"}. Role: ${userProfile.role || "Executive"}. Interests: ${userProfile.interests || "General security"}. Concerns: ${userProfile.concerns || "Digital exposure, competitive intelligence"}.`)
    : wrapUserText("DAILY_BRIEF", "Prepare today's brief for general executive audience.");
  return geminiPro(prompt, sys);
}

export async function geminiBreachAnalysis(breachData, userEmail) {
  const sys = `You are a cyber security analyst specializing in breach data. Produce formal assessments: exposed credentials, severity, immediate actions, remediation, threat actor context.`;
  return geminiFlash(wrapUserText("BREACH_ANALYSIS", `Analyze breach data for: "${userEmail}"\n\nRecords:\n${breachData}`), sys);
}

export async function geminiSocialAnalysis(handles) {
  const sys = `You are a SOCMINT analyst. Produce security assessments: public exposure, privacy recommendations, social engineering vectors, impersonation risks, digital hygiene score.`;
  return geminiFlash(wrapUserText("SOCIAL_ANALYSIS", `Assess:\n${handles.map(h => `- ${h.platform}: ${h.handle}`).join("\n")}`), sys);
}

export async function geminiImageAnalysis(filename, filesize, dimensions) {
  const sys = `You are a digital forensics analyst explaining an image security scan. Thorough, professional, educational.`;
  return geminiFlash(wrapUserText("IMAGE_FORENSICS", `File: "${filename}", ${filesize}, ${dimensions || "unknown"}. Explain step-by-step: EXIF, steganography detection, reverse image search, malware scanning, geolocation.`), sys);
}

export async function geminiLinkMap(entity, entityType) {
  const sys = `You are a link analysis specialist. Produce structured relationship maps: direct connections, indirect associations, shared attributes, communication patterns, organizational hierarchies, suspicious links. Include entity names, relationship types, confidence levels.`;
  return geminiPro(wrapUserText("LINK_ANALYSIS", `Map ${entityType}: "${entity}". Identify connected entities. For each: connected entity, relationship type, direction, strength (strong/moderate/weak), source. Conclude with key nodes, clusters, vulnerabilities.`), sys);
}

export async function geminiDarkWeb(query, queryType) {
  const sys = `You are a dark web intelligence analyst monitoring underground forums, marketplaces, paste sites, encrypted channels. Formal threat intelligence on credential markets, ransomware groups, threat actors.`;
  return geminiPro(wrapUserText("DARK_WEB_INTEL", `Assess ${queryType}: "${query}". Cover: marketplace listings, paste sites, underground forums, ransomware targeting, credential dumps, vendor activity, threat actor interest, historical footprint. CLASSIFICATION: RESTRICTED.`), sys);
}

export async function geminiIdentityVerify(name, additionalData) {
  const sys = `You are an identity verification analyst. Cross-reference against public sources. Detect inconsistencies, fraud indicators. Confidence scores.`;
  return geminiPro(wrapUserText("IDENTITY_VERIFY", `Verify: "${name}". Data: ${additionalData || "None"}. Verify: corporate registries, licensing, academic credentials, social consistency, public records, address/contact, professional history, alias detection. For each: VERIFIED / UNVERIFIED / INCONSISTENT / UNABLE. Overall confidence 0-100%.`), sys);
}

export async function geminiFraudDetect(entity, entityType) {
  const sys = `You are a fraud intelligence analyst. Financial, identity, corporate, cyber fraud specialization. Formal risk assessments with specific indicators.`;
  return geminiPro(wrapUserText("FRAUD_DETECT", `Assess ${entityType}: "${entity}". Cover: fraud DB appearances, corporate anomalies, financial irregularities, impersonation, social engineering exposure, credential fraud, BEC risk, payment fraud, synthetic identity markers. Risk level per finding. Overall score 0-100.`), sys);
}

export async function geminiGeospatial(location, context) {
  const sys = `You are a geospatial intelligence (GEOINT) analyst specializing in location-based threat assessment, physical security, geographic risk mapping.`;
  return geminiPro(wrapUserText("GEOINT", `Location: "${location}". Context: ${context || "General"}. Analyze: physical threat landscape, conflict/crime proximity, critical infrastructure, protest/unrest indicators, natural disaster exposure, transportation security, communications reliability, emergency services, hostile surveillance risk, safe haven identification. Risk ratings per category. Overall threat level.`), sys);
}

export async function geminiPredictive(sector, assets) {
  const sys = `You are a predictive threat intelligence analyst. Behavioral analysis, trend projection, pattern recognition. Use confidence levels and time horizons. Never speculate without basis.`;
  return geminiPro(wrapUserText("PREDICTIVE_FORECAST", `Sector: "${sector}". Assets: ${assets || "General"}. Cover: emerging cyber threats (30/60/90-day), threat actor targeting, vulnerability exploitation predictions, geopolitical developments, supply chain indicators, insider threat trends, regulatory changes, tech-specific evolution. Confidence (HIGH/MODERATE/LOW), time horizon, impact (1-10), preemptive actions per prediction.`), sys);
}

export async function geminiEvidence(caseDescription) {
  const sys = `You are a digital evidence specialist. Establish chains of evidence with forensic rigor. Best practices with sourcing, timestamps, integrity notes.`;
  return geminiFlash(wrapUserText("EVIDENCE_CHAIN", `Case: "${caseDescription}". Provide: collection methodology, chain of custody template, preservation steps, legal frameworks (GDPR, CCPA, local), documentation standards, integrity verification tools, legal admissibility report template.`), sys);
}

export async function geminiCaseAnalysis(caseData) {
  const sys = `You are a senior case analyst. Review, identify findings, assess status, recommend investigative steps. Formal case management language.`;
  return geminiFlash(wrapUserText("CASE_MANAGEMENT", `Case:\n${caseData}\n\nProvide: summary, key findings, evidence gaps, next steps, priority actions, resource requirements, resolution timeline.`), sys);
}

// Generic analyze — for footprint, docintel, suppress, execprot, threat, insider, cpir, consult
export async function geminiAnalyze(moduleName, query, context = "") {
  const personas = {
    footprint: "You are a digital footprint analyst producing formal exposure assessments. Cover social media, data brokers, public records, corporate filings, web mentions, breach appearances. Exposure score 0-100.",
    docintel: "You are a document intelligence specialist. Analyze document security, metadata exposure, distribution tracking, leak detection approaches, classification recommendations.",
    suppress: "You are a data suppression specialist. Takedown strategy: target identification, legal levers, platform-specific approaches, SEO burial techniques, priority sequencing.",
    execprot: "You are an executive protection analyst. Exposure assessments for high-value individuals: public information exposure, physical security indicators, reputation risks, social engineering vectors, data broker presence, digital attack surface.",
    threat: "You are a threat analyst. Formal threat assessments: threat landscape, sector-specific risks, vulnerability exposure, threat actor interest indicators.",
    consult: "You are a senior intelligence consultant. Provide direct, actionable guidance. No filler. State what you know, what you don't, next steps.",
    insider: "You are an insider threat analyst. Behavioral analysis, access pattern review, risk scoring.",
    cpir: "You are a behavioral intelligence analyst producing Continuous Psychological Indicator Reports. Professional, clinical, evidence-based.",
  };
  const sys = personas[moduleName] || personas.threat;
  return geminiPro(wrapUserText(moduleName.toUpperCase(), query, context), sys);
}

export async function geminiTravel(destination, flight, hotel, dates, purpose) {
  const sys = `You are a travel security analyst. Formal pre-travel briefings for high-value individuals. Specific, actionable.`;
  return geminiPro(wrapUserText("TRAVEL_SECURITY", `Destination: ${destination}. Flight: ${flight || "N/A"}. Hotel: ${hotel || "N/A"}. Dates: ${dates || "N/A"}. Purpose: ${purpose || "Business"}. Cover: kinetic threats, cyber threats (Wi-Fi intercept at hotel/airport, surveillance), geopolitical situation, health/medical, law enforcement reliability, comms security, emergency contacts, safe havens, transportation security, hotel security, cultural/legal considerations.`), sys);
}

export async function geminiSupplyChain(vendorName, vendorDomain) {
  const sys = `You are a supply chain security analyst. Vendor risk assessments with specific findings and risk scores.`;
  return geminiPro(wrapUserText("SUPPLY_CHAIN", `Vendor: ${vendorName || vendorDomain}. Domain: ${vendorDomain}. Analyze: domain security (SSL, DNSSEC, email headers), known vulnerabilities, dark web mentions, breach history, credential exposure, exposed ports/services, compliance (SOC2, ISO 27001, GDPR), financial stability, personnel exposure, risk score 0-100.`), sys);
}

export async function geminiFamily(childName, handles) {
  const sys = `You are a child safety analyst. Safety assessments for parents. Sensitive but thorough. Never reproduce private content. Alert levels (GREEN/YELLOW/RED) per category.`;
  return geminiFlash(wrapUserText("CHILD_SAFETY", `Subject: ${childName || "Minor"}. Accounts: ${handles?.map(h => `${h.platform}: ${h.handle}`).join(", ") || "Not specified"}. Analyze: cyberbullying, predatory contact, toxic interactions, age-inappropriate content, location sharing, contact with unknown adults, mental health warnings, privacy recommendations. Public-facing only.`), sys);
}

export async function geminiSuppression(name, email) {
  const brokers = ["Whitepages", "Spokeo", "BeenVerified", "Intelius", "TruePeopleSearch", "FastPeopleSearch", "ThatsThem", "Radaris", "USSearch", "Pipl", "PeopleFinders", "Experian", "Acxiom", "LexisNexis", "Oracle Data Cloud"];
  const sys = `You are a privacy operations specialist. Specific, step-by-step opt-out instructions. URLs must be accurate.`;
  const result = await geminiFlash(wrapUserText("DATA_SUPPRESSION", `Subject: ${name || "User"}. Email: ${email || "Not provided"}. For each broker: 1) Direct opt-out URL 2) Required data 3) Processing time 4) Follow-up. Brokers: ${brokers.join(", ")}. Include GDPR deletion template, CCPA opt-out template.`), sys);
  return { guide: result, brokers };
}

// CPIR test — generate questions
export async function geminiCPIRQuestions() {
  const sys = `You are a behavioral intelligence expert designing Continuous Psychological Indicator Report (CPIR) assessments. Your questions probe: loyalty, stress indicators, financial pressure, dissatisfaction, access abuse risk, external communication patterns, ideological alignment. Questions must be indirect, non-threatening, appear as legitimate workplace wellness check.`;
  return geminiJSON(`Generate a 15-question CPIR psychological indicator assessment for an employee. Each question should appear as a wellness/engagement question but measure underlying risk dimensions. Return JSON array: [{"id":"q1","text":"question text","dimension":"loyalty|stress|financial|satisfaction|access|external|ideological","scale":"likert_5"}]. Questions must be balanced — some positive, some probing.`, sys);
}

// CPIR test — analyze responses
export async function geminiCPIRAnalyze(questions, answers, employeeName) {
  const sys = `You are a behavioral intelligence analyst producing formal CPIR assessments from questionnaire data. Clinical, evidence-based analysis. Identify risk indicators without speculation.`;
  return geminiPro(wrapUserText("CPIR_ANALYSIS", `Subject: ${employeeName}\n\nQuestionnaire:\n${questions.map((q,i) => `Q${i+1} (${q.dimension}): ${q.text}\nAnswer: ${answers[q.id] || "No answer"}`).join("\n\n")}\n\nProduce: dimension scores (0-100 per dimension: loyalty, stress, financial, satisfaction, access, external, ideological), overall risk score (LOW/MODERATE/ELEVATED/HIGH/CRITICAL), specific indicators observed, recommended management actions, follow-up assessment timeline.`), sys);
}
