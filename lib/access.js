// Tier-based access control matrix
// observer = hard paywall on everything except teaser UI
// personal_pro = standard OSINT + suppression
// business = everything + supply chain + seats + honeytokens
// executive = everything + white glove

export const ACCESS = {
  // Module access by tier
  modules: {
    dash: ["observer", "personal_pro", "business", "executive"],
    brief: ["personal_pro", "business", "executive"],
    warroom: ["personal_pro", "business", "executive"],
    intel: ["observer", "personal_pro", "business", "executive"], // teaser for observer
    map: ["observer", "personal_pro", "business", "executive"],
    osint: ["personal_pro", "business", "executive"],
    linkmap: ["personal_pro", "business", "executive"],
    identity: ["personal_pro", "business", "executive"],
    fraud: ["business", "executive"],
    breaches: ["personal_pro", "business", "executive"],
    darkweb: ["business", "executive"],
    footprint: ["personal_pro", "business", "executive"],
    social: ["personal_pro", "business", "executive"],
    imagescan: ["personal_pro", "business", "executive"],
    geospatial: ["business", "executive"],
    docintel: ["business", "executive"],
    suppress: ["personal_pro", "business", "executive"],
    decoy: ["business", "executive"],
    execprot: ["business", "executive"],
    evidence: ["business", "executive"],
    predict: ["personal_pro", "business", "executive"],
    predictive: ["business", "executive"],
    insider: ["business", "executive"],
    cpir: ["business", "executive"],
    cases: ["business", "executive"],
    reports: ["personal_pro", "business", "executive"],
    travel: ["personal_pro", "business", "executive"],
    supplychain: ["business", "executive"],
    family: ["personal_pro", "business", "executive"],
    honeytokens: ["business", "executive"],
    invisible: ["personal_pro", "business", "executive"],
    ipscan: ["personal_pro", "business", "executive"],
    membership: ["observer", "personal_pro", "business", "executive"],
    consult: ["observer", "personal_pro", "business", "executive"],
    capabilities: ["observer", "personal_pro", "business", "executive"],
    settings: ["observer", "personal_pro", "business", "executive"],
    guide: ["observer", "personal_pro", "business", "executive"],
    seats: ["business", "executive"],
  },

  // Check if a user can access a module
  canAccess(tier, module) {
    const allowed = this.modules[module];
    if (!allowed) return true; // unknown modules default to open
    return allowed.includes(tier || "observer");
  },

  // Check if subscription is active (trial or paid)
  isActive(profile) {
    if (!profile) return false;
    const s = profile.subscription_status;
    if (s === "active") return true;
    if (s === "trial" && profile.trial_ends_at) {
      return new Date(profile.trial_ends_at) > new Date();
    }
    return false;
  },

  // Get tier label
  tierLabel(tier) {
    return { observer: "Observer", personal_pro: "Personal Pro", business: "Business Premium", executive: "Executive" }[tier] || "Observer";
  },

  // Features that require specific account types
  accountTypeModules: {
    family: ["family"],
    supplychain: ["business"],
    seats: ["business"],
    honeytokens: ["business"],
  },

  canAccessByType(accountType, module) {
    const required = this.accountTypeModules[module];
    if (!required) return true;
    return required.includes(accountType);
  }
};
