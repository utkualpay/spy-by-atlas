# Spy by Atlas — Marketing Strategy & Launch Plan

## Positioning

**One-liner:** Private intelligence platform for individuals and organizations who need to know what's exposed, what's coming, and who's watching.

**Category:** Intelligence-as-a-Service (IaaS) — sits between consumer identity protection (LifeLock, Aura) and enterprise threat intelligence (Recorded Future, Flashpoint). Spy is neither. It is a boutique, high-touch intelligence service wrapped in software.

**Target segments (in priority order):**
1. **High-net-worth individuals** — executives, founders, public figures who have personal exposure risk
2. **SMB security teams** — companies with 20-500 employees who can't afford a full-time threat intel team
3. **Law firms and consultancies** — need competitive intelligence and due diligence tools
4. **Family offices** — protecting principal's digital presence and reputation

**Pricing psychology:** The Observer (free) tier exists to demonstrate capability. The real product starts at Professional ($9.99). The Enterprise tier is intentionally "Contact Us" — it signals that serious clients get bespoke service.

---

## Pre-Launch (Weeks 1-2)

### Technical prep
- [ ] Deploy to atlasspy.com (see DEPLOYMENT.md)
- [ ] Run full QA on all features
- [ ] Set up iyzico payment links, verify payment flow
- [ ] Set up Google Analytics or Plausible (privacy-respecting alternative)
- [ ] Set up Formspree notifications to monitor inbound research requests
- [ ] Create a simple status page (e.g. Instatus free tier)

### Content prep
- [ ] Write 3 long-form blog posts for launch week:
  1. "What Your Email Reveals About You" (OSINT awareness piece, drives demo usage)
  2. "The Insider Threat Your Company Isn't Testing For" (CPIR module awareness)
  3. "Why Executives Need Digital Bodyguards" (exec protection positioning)
- [ ] Create a 90-second product walkthrough video (screen recording with voiceover)
- [ ] Write email templates for:
  - Welcome sequence (signup → onboarding → first scan prompt → upgrade prompt)
  - Weekly intelligence digest (summary of global threat landscape)

### Social presence
- [ ] Set up X/Twitter: @atlasspy
- [ ] Set up LinkedIn company page: Atlas Design Institute → Spy by Atlas
- [ ] Prepare 10 launch week posts (mix of product screenshots, threat intelligence insights, OSINT tips)

---

## Launch (Week 3)

### Day 1: Soft launch
- Post on X/Twitter and LinkedIn
- Share product walkthrough video
- Email existing Atlas contacts and network
- Submit to Product Hunt (schedule for Tuesday or Wednesday, best days for tech products)

### Day 2-3: Community seeding
- Post in relevant communities (do NOT spam — provide value first):
  - r/cybersecurity, r/OSINT, r/netsec (share the awareness blog post, not a direct product pitch)
  - Hacker News (Show HN post)
  - InfoSec Twitter/X community
  - LinkedIn cybersecurity groups
- Offer free Professional tier for 30 days to first 50 signups (creates urgency)

### Day 4-7: Follow-up
- Publish blog posts 2 and 3
- Respond to all comments and feedback
- Collect testimonials from early users
- A/B test landing page headline if traffic allows

---

## Post-Launch Growth (Months 1-3)

### Content marketing (primary channel)
Intelligence content is inherently shareable. Publish weekly:
- **Monday:** Weekly Threat Briefing (free, email + blog, drives awareness)
- **Wednesday:** OSINT tutorial or case study (demonstrates platform capability)
- **Friday:** Curated intelligence digest (global conflicts, cyber threats)

This positions Spy as an authority, not just a tool. People subscribe for the intelligence; they stay for the platform.

### Direct outreach (secondary channel)
- Identify 50 law firms, family offices, and boutique consultancies in Istanbul, London, Dubai
- Send personalized outreach with a free 30-day Professional trial
- Follow up with a 15-minute demo call offer
- Target: 5 enterprise leads per month

### Partnerships
- **Cybersecurity firms:** Offer white-label or referral arrangements with penetration testing firms who don't do ongoing monitoring
- **Legal firms:** Partner with IP/data protection law firms who need OSINT and due diligence tools for clients
- **Executive protection firms:** Physical security firms often lack digital intelligence capability

### SEO (long-term)
Target keywords:
- "OSINT search tool" / "OSINT platform"
- "digital footprint scan"
- "executive digital protection"
- "insider threat assessment"
- "breach monitoring service"
- "intelligence as a service"

Each blog post should target 1-2 of these keywords. Expect SEO results in 3-6 months.

---

## Conversion Funnel

```
atlasspy.com (marketing page)
    ↓
Demo mode (no signup required — let them experience it)
    ↓
Free signup (Observer tier — 5 OSINT searches/month)
    ↓
First scan prompt (email breach check — immediate, tangible value)
    ↓
Usage limit hit → upgrade prompt
    ↓
Professional ($9.99/mo) or Executive ($29.99/mo)
    ↓
Enterprise inquiry (custom pricing, consultancy upsell)
```

**Key metric targets (Month 3):**
- 500+ unique visitors/month to atlasspy.com
- 50+ free signups
- 10+ paid subscribers
- 2+ enterprise leads

---

## Budget (First 3 Months)

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Infrastructure | $15-20 | Vercel + Supabase + Anthropic API |
| Domain | $0.75 | Already paid annually |
| Content creation | $0 | Self-authored or AI-assisted |
| Product Hunt | $0 | Free to launch |
| LinkedIn ads (optional) | $200-500 | Target: cybersecurity professionals, C-suite |
| Total | **$215-520/mo** | Conservative estimate |

**Break-even:** ~22 Professional subscribers or ~8 Executive subscribers covers all costs including optional ads.

---

## Metrics to Track

| Metric | Tool | Target (Month 3) |
|--------|------|-------------------|
| Site visitors | Plausible/GA | 500/mo |
| Demo usage | Internal analytics | 30% of visitors |
| Free signups | Supabase dashboard | 50 |
| Free → Paid conversion | iyzico dashboard | 20% |
| Paid subscribers | iyzico dashboard | 10+ |
| Churn rate | iyzico dashboard | <10%/mo |
| OSINT searches performed | Internal logs | 200/mo |
| Research requests submitted | Formspree | 5/mo |

---

## Brand Guidelines (Brief)

- **Tone:** Authoritative, understated, exclusive. Never salesy. Intelligence professionals don't shout.
- **Visual:** Dark backgrounds, gold accents, serif headings, monospace data. The aesthetic of a classified briefing, not a SaaS dashboard.
- **Language:** "Intelligence," not "data." "Operators," not "users." "Briefing," not "report." The vocabulary reinforces the positioning.
- **Never say:** "AI-powered" in marketing (overused, cheapens the brand). Instead: "analyst-grade intelligence" or "continuous monitoring."
