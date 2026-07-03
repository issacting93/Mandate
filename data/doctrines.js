// data/doctrines.js — Department Doctrine definitions
//
// Each department has two competing philosophies (A and B).
// Choosing one changes perception, policy tiles, bloc trust, and blizzard outcomes.
// Inspired by Frostpunk 2's competing laws + Disco Elysium's thought-as-worldview.

export const DOCTRINES = {
  HEALTH: {
    A: {
      id: 'clinical',
      name: 'Clinical',
      icon: 'local_hospital',
      desc: 'Hospitals, professional staff, epidemiological triage',
      voice: 'Clinical, data-driven. Speaks in case rates and surge capacity.',
      blocBoost: ['business', 'realestate'],
      blocPenalty: ['working', 'progressive'],
      strength: 'Fast hospital surge deployment',
      blindSpot: 'Homebound patients who won\'t or can\'t reach hospitals',
      interjectionStyle: 'epidemiological',
      // Example: "Asthma corridor. 3x city average. Hospital capacity: 40 surge beds."
    },
    B: {
      id: 'community',
      name: 'Community',
      icon: 'groups',
      desc: 'Promotoras, block-level care, local health workers',
      voice: 'Relational, specific. Names people, knows medications and apartment numbers.',
      blocBoost: ['working', 'progressive'],
      blocPenalty: ['business', 'realestate'],
      strength: 'Block-level check-ins on every vulnerable resident',
      blindSpot: 'No mass casualty triage capacity',
      interjectionStyle: 'relational',
      // Example: "One health worker covers 37 homebound residents. She knows every medication schedule."
    },
  },

  HOUSING: {
    A: {
      id: 'enforcement',
      name: 'Enforcement',
      icon: 'gavel',
      desc: 'Code violations, landlord penalties, DOB action',
      voice: 'Regulatory, code-focused. Cites violations and legal obligations.',
      blocBoost: ['progressive', 'labor'],
      blocPenalty: ['realestate'],
      strength: 'Buildings code-compliant, heat violations fixed before winter',
      blindSpot: 'Tenants who never reported — fear of landlord retaliation',
      interjectionStyle: 'regulatory',
      // Example: "Rent-stabilized. Landlord has legal obligation. Third violation this year — actionable."
    },
    B: {
      id: 'advocacy',
      name: 'Advocacy',
      icon: 'handshake',
      desc: 'Tenant support, relocation assistance, mediation',
      voice: 'Empathetic, trust-building. Focuses on people, not code sections.',
      blocBoost: ['working', 'progressive'],
      blocPenalty: ['realestate', 'business'],
      strength: 'High trust — residents call for help when crisis comes',
      blindSpot: 'Buildings still have violations. Heat still fails.',
      interjectionStyle: 'empathetic',
      // Example: "She hasn't reported because last time, the landlord raised her rent. She needs protection first."
    },
  },

  INFRA: {
    A: {
      id: 'centralized',
      name: 'Centralized',
      icon: 'hub',
      desc: 'Grid hardening, utility coordination, capital infrastructure',
      voice: 'Systems-level, efficiency-focused. Speaks in load capacity and restoration timelines.',
      blocBoost: ['business', 'labor'],
      blocPenalty: ['progressive'],
      strength: 'Grid restored faster citywide after failure',
      blindSpot: 'When the grid fails, everything fails at once — single points of failure',
      interjectionStyle: 'systems',
      // Example: "Substation rated for 2-foot surge, built in 1967. Restoration: 72 hours minimum."
    },
    B: {
      id: 'distributed',
      name: 'Distributed',
      icon: 'scatter_plot',
      desc: 'Microgrids, community generators, local resilience',
      voice: 'Resilience-focused. Speaks in islands of function and community capacity.',
      blocBoost: ['working', 'progressive'],
      blocPenalty: ['business'],
      strength: 'Pockets of power survive total grid failure',
      blindSpot: 'Slower restoration, gaps between microgrids, expensive per-unit',
      interjectionStyle: 'resilience',
      // Example: "VFW hall has a generator. Pharmacy has a generator. That's two islands of light in a blackout."
    },
  },

  SERVICES: {
    A: {
      id: 'universal',
      name: 'Universal',
      icon: 'public',
      desc: 'Citywide standardized programs, equal distribution',
      voice: 'Policy-oriented, fairness-focused. Speaks in coverage percentages and equity metrics.',
      blocBoost: ['business', 'realestate'],
      blocPenalty: ['working'],
      strength: 'Every district gets baseline resources — no gaps in coverage',
      blindSpot: 'Resources wasted on areas that don\'t need them, misses culturally specific barriers',
      interjectionStyle: 'policy',
      // Example: "311 response times: 4+ hours here, 45 minutes on the Upper East Side. That's a service equity gap."
    },
    B: {
      id: 'targeted',
      name: 'Targeted',
      icon: 'my_location',
      desc: 'Hyperlocal, culturally specific, language-matched',
      voice: 'Community-aware, specific. Speaks in languages served and barriers identified.',
      blocBoost: ['working', 'progressive'],
      blocPenalty: ['realestate', 'business'],
      strength: 'Perfect fit for communities served — language, culture, trust',
      blindSpot: 'Gaps in communities not profiled. Politically toxic — "why do THEY get special treatment?"',
      interjectionStyle: 'community-aware',
      // Example: "14 languages on this block. Emergency alerts are English-only. That's not a coverage gap — it's a death sentence."
    },
  },

  SAFETY: {
    A: {
      id: 'enforcement',
      name: 'Enforcement',
      icon: 'shield',
      desc: 'NYPD, surveillance, rapid crisis response',
      voice: 'Operational, command-oriented. Speaks in response times and unit deployment.',
      blocBoost: ['realestate', 'business'],
      blocPenalty: ['working', 'progressive'],
      strength: 'Faster emergency dispatch, visible deterrence',
      blindSpot: '30+ residents per district who won\'t call 911 — institution-distrustful, undocumented, or past bad experiences',
      interjectionStyle: 'operational',
      // Example: "Response time: 7 minutes. But only if someone calls. 30 people in this building won't."
    },
    B: {
      id: 'prevention',
      name: 'Prevention',
      icon: 'diversity_3',
      desc: 'Community patrols, social workers, de-escalation',
      voice: 'Relationship-focused. Speaks in trust built and networks mapped.',
      blocBoost: ['working', 'progressive', 'labor'],
      blocPenalty: ['realestate', 'business'],
      strength: 'Community self-rescue activates — people check on each other',
      blindSpot: 'Slower professional response time when seconds matter',
      interjectionStyle: 'relational',
      // Example: "Pastor Williams can reach 30 people in this building by name. NYPD can't get past the lobby."
    },
  },

  COMMUNITY: {
    A: {
      id: 'formalize',
      name: 'Formalize',
      icon: 'integration_instructions',
      desc: 'Integrate mutual aid into city protocols, data-sharing, official coordination',
      voice: 'Institutional, coordination-focused. Speaks in protocols and data pipelines.',
      blocBoost: ['business', 'labor'],
      blocPenalty: ['progressive'],
      strength: 'City knows where mutual aid networks are — can coordinate in crisis',
      blindSpot: 'Networks may stop sharing honestly when city is watching',
      interjectionStyle: 'coordination',
      // Example: "400-member mutual aid network. If we formalize, FEMA can route through them. If we don't, we're flying blind."
    },
    B: {
      id: 'empower',
      name: 'Empower',
      icon: 'volunteer_activism',
      desc: 'Fund independently, let communities self-organize, hands off',
      voice: 'Trust-centered, autonomy-respecting. Speaks in what communities already do.',
      blocBoost: ['working', 'progressive'],
      blocPenalty: ['business'],
      strength: 'Networks operate at full trust and capacity — authentic, not bureaucratic',
      blindSpot: 'City can\'t coordinate with what it can\'t see — mutual aid is invisible to emergency management',
      interjectionStyle: 'trust',
      // Example: "Sasha's network did 60 evacuations in 3 hours during Sandy. FEMA took 3 days. Don't fix what works."
    },
  },
};

// Switching doctrine costs
export const DOCTRINE_SWITCH_COST = 0.3;     // $B
export const DOCTRINE_SWITCH_COOLDOWN = 3;    // weeks
export const DOCTRINE_COOK_TIME = 1;          // weeks before new doctrine activates

// Bloc trust shifts when choosing a doctrine
export const DOCTRINE_BLOC_TRUST_BOOST = 3;   // +trust per district in boosted blocs
export const DOCTRINE_BLOC_TRUST_PENALTY = 2; // -trust per district in penalized blocs
