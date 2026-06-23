// data/entries.js — All game entries (content nodes) for the Blizzard level
// Each entry has: id, type, label, plus type-specific fields.
// Exported as JS objects (not JSON) so they work as ES modules from file://.

// ─── Seasons ───────────────────────────────────────────────
export const seasons = {
  s_spring: {
    id: "s_spring", type: "season", label: "Spring",
    desc: "Thaw and rain. The city shakes off winter.",
    quarters: [1, 5, 9],
  },
  s_summer: {
    id: "s_summer", type: "season", label: "Summer",
    desc: "Heat, humidity, and long days.",
    quarters: [2, 6, 10],
  },
  s_fall: {
    id: "s_fall", type: "season", label: "Fall",
    desc: "Cooling temps, back-to-school, budget season.",
    quarters: [3, 7, 11],
  },
  s_winter: {
    id: "s_winter", type: "season", label: "Winter",
    desc: "December through February. Snow, ice, nor'easters.",
    quarters: [4, 8, 12],
  },
};

// ─── Hazards ───────────────────────────────────────────────
export const hazards = {
  h_blizzard: {
    id: "h_blizzard", type: "hazard", label: "Blizzard / Nor'easter",
    desc: "A major winter storm bearing down on the five boroughs. Two feet of snow, 50mph gusts, whiteout conditions.",
    baseSeverity: 70,
    rampQuarters: 3,
    strikesAtQuarter: 4,
    tags: ["snow", "ice", "wind", "transit", "power"],
  },
};

// ─── Districts ─────────────────────────────────────────────
export const districts = {
  d_south_bronx: {
    id: "d_south_bronx", type: "district", label: "South Bronx",
    bloc: "working", region: "bronx", pop: 3, baseApproval: 48,
    position: { x: 560, y: 95 },
    concern: "Wants jobs, services, and safer blocks.",
    vulnerabilities: ["snow", "power"],
  },
  d_riverdale: {
    id: "d_riverdale", type: "district", label: "Riverdale",
    bloc: "realestate", region: "bronx", pop: 2, baseApproval: 52,
    position: { x: 455, y: 78 },
    concern: "Quiet, leafy, and tax-sensitive.",
    vulnerabilities: ["snow", "ice"],
  },
  d_washington_hts: {
    id: "d_washington_hts", type: "district", label: "Washington Heights",
    bloc: "working", region: "mupper", pop: 2, baseApproval: 55,
    position: { x: 472, y: 150 },
    concern: "Overcrowded schools, deep transit reliance.",
    vulnerabilities: ["snow", "transit"],
  },
  d_harlem: {
    id: "d_harlem", type: "district", label: "Harlem",
    bloc: "progressives", region: "mupper", pop: 3, baseApproval: 57,
    position: { x: 526, y: 200 },
    concern: "Fighting displacement and rising rents.",
    vulnerabilities: ["power", "snow"],
  },
  d_upper_west: {
    id: "d_upper_west", type: "district", label: "Upper West Side",
    bloc: "progressives", region: "mcore", pop: 2, baseApproval: 54,
    position: { x: 496, y: 266 },
    concern: "Liberal in theory, NIMBY about towers.",
    vulnerabilities: ["snow"],
  },
  d_upper_east: {
    id: "d_upper_east", type: "district", label: "Upper East Side",
    bloc: "finance", region: "mcore", pop: 2, baseApproval: 50,
    position: { x: 566, y: 255 },
    concern: "Wealthy, low-drama, wants order kept.",
    vulnerabilities: ["snow"],
  },
  d_midtown: {
    id: "d_midtown", type: "district", label: "Midtown",
    bloc: "realestate", region: "mcore", pop: 2, baseApproval: 49,
    position: { x: 546, y: 330 },
    concern: "Offices, tourists, perpetual gridlock.",
    vulnerabilities: ["transit", "snow"],
  },
  d_les: {
    id: "d_les", type: "district", label: "Lower East Side",
    bloc: "progressives", region: "mcore", pop: 2, baseApproval: 58,
    position: { x: 600, y: 405 },
    concern: "Young, rent-burdened, quick to march.",
    vulnerabilities: ["power", "snow"],
  },
  d_fidi: {
    id: "d_fidi", type: "district", label: "Financial District",
    bloc: "finance", region: "mcore", pop: 2, baseApproval: 50,
    position: { x: 566, y: 470 },
    concern: "Wall Street money; allergic to new taxes.",
    vulnerabilities: ["transit", "wind"],
  },
  d_astoria: {
    id: "d_astoria", type: "district", label: "Astoria",
    bloc: "labor", region: "queens", pop: 2, baseApproval: 55,
    position: { x: 656, y: 250 },
    concern: "Union households who live on the train.",
    vulnerabilities: ["snow", "transit"],
  },
  d_jackson_hts: {
    id: "d_jackson_hts", type: "district", label: "Jackson Heights",
    bloc: "working", region: "queens", pop: 3, baseApproval: 56,
    position: { x: 735, y: 305 },
    concern: "Immigrant, working-class, packed tight.",
    vulnerabilities: ["snow", "power"],
  },
  d_flushing: {
    id: "d_flushing", type: "district", label: "Flushing",
    bloc: "working", region: "queens", pop: 3, baseApproval: 52,
    position: { x: 862, y: 262 },
    concern: "Car-dependent small-business corridor.",
    vulnerabilities: ["snow", "ice"],
  },
  d_jamaica: {
    id: "d_jamaica", type: "district", label: "Jamaica",
    bloc: "labor", region: "queens", pop: 3, baseApproval: 53,
    position: { x: 842, y: 400 },
    concern: "Transit hub; city workers commute through.",
    vulnerabilities: ["transit", "snow"],
  },
  d_williamsburg: {
    id: "d_williamsburg", type: "district", label: "Williamsburg",
    bloc: "progressives", region: "brooklyn", pop: 2, baseApproval: 57,
    position: { x: 664, y: 440 },
    concern: "Gentrified, bike-lane, climate-minded.",
    vulnerabilities: ["snow", "wind"],
  },
  d_bed_stuy: {
    id: "d_bed_stuy", type: "district", label: "Bed-Stuy",
    bloc: "working", region: "brooklyn", pop: 3, baseApproval: 54,
    position: { x: 726, y: 500 },
    concern: "Mixed and anxious about being priced out.",
    vulnerabilities: ["power", "snow"],
  },
  d_park_slope: {
    id: "d_park_slope", type: "district", label: "Park Slope",
    bloc: "progressives", region: "brooklyn", pop: 2, baseApproval: 59,
    position: { x: 640, y: 546 },
    concern: "Affluent progressives, stroller brigades.",
    vulnerabilities: ["snow"],
  },
  d_brownsville: {
    id: "d_brownsville", type: "district", label: "Brownsville / East NY",
    bloc: "working", region: "brooklyn", pop: 3, baseApproval: 47,
    position: { x: 792, y: 560 },
    concern: "Underserved, highest need in the city.",
    vulnerabilities: ["power", "snow", "ice"],
  },
  d_bay_ridge: {
    id: "d_bay_ridge", type: "district", label: "Bay Ridge",
    bloc: "working", region: "brooklyn", pop: 2, baseApproval: 49,
    position: { x: 560, y: 606 },
    concern: "Car commuters; moderate, skeptical.",
    vulnerabilities: ["snow", "ice"],
  },
  d_staten_island: {
    id: "d_staten_island", type: "district", label: "Staten Island",
    bloc: "labor", region: "si", pop: 2, baseApproval: 46,
    position: { x: 255, y: 600 },
    concern: "Cops, firefighters, and drivers galore.",
    vulnerabilities: ["snow", "ice", "wind"],
  },
};

// District adjacency edges (for map rendering and diffusion)
export const districtEdges = [
  ["d_riverdale", "d_washington_hts"],
  ["d_south_bronx", "d_washington_hts"],
  ["d_south_bronx", "d_harlem"],
  ["d_washington_hts", "d_harlem"],
  ["d_harlem", "d_upper_west"],
  ["d_harlem", "d_upper_east"],
  ["d_upper_west", "d_upper_east"],
  ["d_upper_west", "d_midtown"],
  ["d_upper_east", "d_midtown"],
  ["d_midtown", "d_les"],
  ["d_les", "d_fidi"],
  ["d_upper_east", "d_astoria"],
  ["d_astoria", "d_jackson_hts"],
  ["d_jackson_hts", "d_flushing"],
  ["d_jackson_hts", "d_jamaica"],
  ["d_flushing", "d_jamaica"],
  ["d_astoria", "d_williamsburg"],
  ["d_les", "d_williamsburg"],
  ["d_fidi", "d_williamsburg"],
  ["d_williamsburg", "d_bed_stuy"],
  ["d_bed_stuy", "d_park_slope"],
  ["d_bed_stuy", "d_brownsville"],
  ["d_jamaica", "d_brownsville"],
  ["d_park_slope", "d_bay_ridge"],
  ["d_fidi", "d_bay_ridge"],
  ["d_fidi", "d_staten_island"],
  ["d_bay_ridge", "d_staten_island"],
];

// ─── Infrastructure ────────────────────────────────────────
export const infrastructure = {
  p_plows: {
    id: "p_plows", type: "infrastructure", label: "Snow-Removal Fleet",
    desc: "200 plow trucks and salt spreaders stationed across all boroughs.",
    buildCost: 0.8, maintenanceCost: 0.1, mitigationValue: 20,
    buildTime: 1, tags: ["snow", "ice"],
    visible: true,
  },
  p_salt: {
    id: "p_salt", type: "infrastructure", label: "Salt Reserves",
    desc: "Pre-positioned road salt stockpiles in every borough depot.",
    buildCost: 0.3, maintenanceCost: 0.05, mitigationValue: 10,
    buildTime: 1, tags: ["ice"],
    visible: true,
  },
  p_grid: {
    id: "p_grid", type: "infrastructure", label: "Grid Hardening",
    desc: "Reinforced power lines, backup generators for critical facilities.",
    buildCost: 1.2, maintenanceCost: 0.15, mitigationValue: 15,
    buildTime: 2, tags: ["power", "wind"],
    visible: false,
  },
  p_shelter: {
    id: "p_shelter", type: "infrastructure", label: "Emergency Shelters",
    desc: "Heated shelters with cots, food, and medical staff in every borough.",
    buildCost: 0.5, maintenanceCost: 0.1, mitigationValue: 10,
    buildTime: 1, tags: ["snow", "power"],
    visible: true,
  },
  p_warning: {
    id: "p_warning", type: "infrastructure", label: "Early Warning System",
    desc: "Multilingual alert network: phone, radio, street signs.",
    buildCost: 0.4, maintenanceCost: 0.05, mitigationValue: 8,
    buildTime: 1, tags: ["snow", "ice", "wind", "power"],
    visible: false,
  },
  p_outreach: {
    id: "p_outreach", type: "infrastructure", label: "Vulnerable-Resident Outreach",
    desc: "Door-to-door checks on elderly, disabled, and homeless residents.",
    buildCost: 0.3, maintenanceCost: 0.05, mitigationValue: 7,
    buildTime: 1, tags: ["snow", "power"],
    visible: false,
    requires: "p_warning",
  },
};

// ─── Blocs ─────────────────────────────────────────────────
export const blocs = {
  b_working: {
    id: "b_working", type: "bloc", label: "Working Families",
    desc: "Outer-borough, immigrant, wage-earning.",
    color: { css: "var(--working)", hex: 0x2fc3e8 },
    wants: ["affordability", "safety", "services"],
    preparednessStance: "skeptical",
  },
  b_finance: {
    id: "b_finance", type: "bloc", label: "Business & Finance",
    desc: "Wall Street, employers, downtown interests.",
    color: { css: "var(--finance)", hex: 0x7c8cf8 },
    wants: ["low taxes", "order", "stability"],
    preparednessStance: "cost-conscious",
  },
  b_realestate: {
    id: "b_realestate", type: "bloc", label: "Real Estate",
    desc: "Developers, landlords, property interests.",
    color: { css: "var(--realestate)", hex: 0xff6f67 },
    wants: ["permits", "deregulation", "property values"],
    preparednessStance: "opposed",
  },
  b_progressives: {
    id: "b_progressives", type: "bloc", label: "Progressives",
    desc: "Activists, younger renters, climate-conscious.",
    color: { css: "var(--progressives)", hex: 0xff5fa0 },
    wants: ["equity", "climate action", "reform"],
    preparednessStance: "supportive",
  },
  b_labor: {
    id: "b_labor", type: "bloc", label: "Labor Unions",
    desc: "MTA, teachers, FDNY/NYPD, trades.",
    color: { css: "var(--labor)", hex: 0xffc24d },
    wants: ["jobs", "wages", "headcount"],
    preparednessStance: "supportive",
  },
};

// ─── Resources / Meters ────────────────────────────────────
export const resources = {
  r_reserve: {
    id: "r_reserve", type: "resource", label: "City Reserve",
    desc: "The municipal operating budget. Goes below -$3B and the state takes over.",
  },
  r_approval: {
    id: "r_approval", type: "resource", label: "Citywide Approval",
    desc: "Population-weighted average approval across all blocs.",
  },
};

// ─── Policies (Decision Cards) ─────────────────────────────
export const policies = {
  // Q1 policies — long-range, expensive, low urgency
  pol_plow_fleet: {
    id: "pol_plow_fleet", type: "policy", label: "Expand Snow-Removal Fleet",
    desc: "Buy 200 new plows and pre-position them in outer boroughs. Union jobs, visible trucks.",
    quarter: 1,
    budgetDelta: -0.8,
    blocEffects: { working: +3, finance: -2, realestate: -1, progressives: +1, labor: +5 },
    geoModifiers: { bronx: +2, queens: +2, brooklyn: +1, si: +3, mcore: -1 },
    buildsInfra: "p_plows",
  },
  pol_grid_harden: {
    id: "pol_grid_harden", type: "policy", label: "Harden the Power Grid",
    desc: "Bury vulnerable lines, install backup generators at hospitals and shelters.",
    quarter: 1,
    budgetDelta: -1.2,
    blocEffects: { working: +2, finance: -3, realestate: -2, progressives: +4, labor: +3 },
    geoModifiers: { bronx: +1, brooklyn: +1, queens: +1 },
    buildsInfra: "p_grid",
  },
  pol_tax_cut: {
    id: "pol_tax_cut", type: "policy", label: "Small-Business Tax Relief",
    desc: "Cut taxes for businesses under 50 employees. Popular now, costs later.",
    quarter: 1,
    budgetDelta: -0.6,
    blocEffects: { working: +2, finance: +6, realestate: +4, progressives: -5, labor: -2 },
    geoModifiers: { mcore: +2, queens: +1 },
    buildsInfra: null,
  },

  // Q2 policies — medium urgency
  pol_salt_reserve: {
    id: "pol_salt_reserve", type: "policy", label: "Stockpile Road Salt",
    desc: "Fill every borough depot to capacity. Cheap, partial, visible.",
    quarter: 2,
    budgetDelta: -0.3,
    blocEffects: { working: +2, finance: 0, realestate: +1, progressives: -1, labor: +2 },
    geoModifiers: { si: +2, bronx: +1, queens: +1 },
    buildsInfra: "p_salt",
  },
  pol_shelters: {
    id: "pol_shelters", type: "policy", label: "Open Emergency Shelters",
    desc: "Staff and supply heated shelters in every borough. Visible, humane, not cheap.",
    quarter: 2,
    budgetDelta: -0.5,
    blocEffects: { working: +4, finance: -2, realestate: -1, progressives: +5, labor: +3 },
    geoModifiers: { bronx: +2, brooklyn: +2 },
    buildsInfra: "p_shelter",
  },
  pol_housing_push: {
    id: "pol_housing_push", type: "policy", label: "Fast-Track Affordable Housing",
    desc: "Spend political capital on housing permits. Popular with renters, not with landlords.",
    quarter: 2,
    budgetDelta: -0.4,
    blocEffects: { working: +6, finance: -1, realestate: -7, progressives: +6, labor: +2 },
    geoModifiers: { brooklyn: +2, bronx: +2, queens: +1 },
    buildsInfra: null,
  },

  // Q3 policies — high urgency, last chance
  pol_warning_sys: {
    id: "pol_warning_sys", type: "policy", label: "Deploy Early Warning System",
    desc: "Multilingual phone alerts, radio broadcasts, LED street signs. The invisible backbone.",
    quarter: 3,
    budgetDelta: -0.4,
    blocEffects: { working: +1, finance: 0, realestate: 0, progressives: +2, labor: +1 },
    geoModifiers: {},
    buildsInfra: "p_warning",
  },
  pol_outreach: {
    id: "pol_outreach", type: "policy", label: "Door-to-Door Outreach Program",
    desc: "Send workers to check on elderly, disabled, and homeless residents before the storm.",
    quarter: 3,
    budgetDelta: -0.3,
    blocEffects: { working: +3, finance: -1, realestate: 0, progressives: +4, labor: +3 },
    geoModifiers: { bronx: +2, brooklyn: +2 },
    buildsInfra: "p_outreach",
    requires: "p_warning",
  },
  pol_overtime: {
    id: "pol_overtime", type: "policy", label: "Approve Union Overtime Pay",
    desc: "Pre-authorize overtime for sanitation, transit, and emergency workers. Expensive but ready.",
    quarter: 3,
    budgetDelta: -0.6,
    blocEffects: { working: +1, finance: -4, realestate: -2, progressives: 0, labor: +8 },
    geoModifiers: {},
    buildsInfra: null,
  },

  // Q4 policies — emergency response during the blizzard
  pol_deploy_manhattan: {
    id: "pol_deploy_manhattan", type: "policy", label: "Prioritize Manhattan Clearing",
    desc: "Send plows to clear Midtown and FiDi first. Business stays open, outer boroughs wait.",
    quarter: 4,
    budgetDelta: -0.3,
    blocEffects: { working: -5, finance: +6, realestate: +4, progressives: -6, labor: 0 },
    geoModifiers: { mcore: +5, bronx: -3, queens: -3, brooklyn: -2, si: -4 },
    buildsInfra: null,
  },
  pol_deploy_outer: {
    id: "pol_deploy_outer", type: "policy", label: "Prioritize Outer Boroughs",
    desc: "Clear residential streets first. Working families get home safe, Manhattan waits.",
    quarter: 4,
    budgetDelta: -0.3,
    blocEffects: { working: +6, finance: -4, realestate: -3, progressives: +3, labor: +2 },
    geoModifiers: { mcore: -3, bronx: +4, queens: +3, brooklyn: +3, si: +4 },
    buildsInfra: null,
  },
  pol_deploy_equal: {
    id: "pol_deploy_equal", type: "policy", label: "Equal Coverage, Slower Everywhere",
    desc: "Spread resources evenly. Nobody's first, nobody's forgotten. Slower for everyone.",
    quarter: 4,
    budgetDelta: -0.4,
    blocEffects: { working: +1, finance: -1, realestate: -1, progressives: +2, labor: +1 },
    geoModifiers: {},
    buildsInfra: null,
  },
};

// ─── Framings (Campaign Cards) ─────────────────────────────
export const framings = {
  f_fiscal: {
    id: "f_fiscal", type: "framing", label: "Fiscal Responsibility",
    pitch: "We protect every taxpayer dollar.",
    reserveCost: 0.1,
    blocEffects: { working: 0, finance: +4, realestate: +3, progressives: -3, labor: -2 },
    creditMultiplier: 0.5,
    creditTags: [],
  },
  f_justice: {
    id: "f_justice", type: "framing", label: "Justice & Equity",
    pitch: "Fairness for all New Yorkers — especially those who need it most.",
    reserveCost: 0.1,
    blocEffects: { working: +3, finance: -3, realestate: -2, progressives: +4, labor: +2 },
    creditMultiplier: 0.8,
    creditTags: ["equity"],
  },
  f_safety: {
    id: "f_safety", type: "framing", label: "Safety & Preparedness",
    pitch: "A city that plans ahead keeps every family safe.",
    reserveCost: 0.15,
    blocEffects: { working: +3, finance: +1, realestate: 0, progressives: +1, labor: +2 },
    creditMultiplier: 1.5,
    creditTags: ["preparedness"],
  },
  f_unity: {
    id: "f_unity", type: "framing", label: "One City, Together",
    pitch: "Whatever your borough, we rise as one.",
    reserveCost: 0.2,
    blocEffects: { working: +1, finance: +1, realestate: +1, progressives: +1, labor: +1 },
    creditMultiplier: 1.0,
    creditTags: ["unity"],
  },
  f_quiet: {
    id: "f_quiet", type: "framing", label: "Keep It Quiet",
    pitch: "No press conference. Just sign it.",
    reserveCost: 0,
    blocEffects: { working: -1, finance: 0, realestate: 0, progressives: -1, labor: 0 },
    creditMultiplier: 0.0,
    creditTags: [],
  },
};

// ─── Outcomes ──────────────────────────────────────────────
export const outcomes = {
  o_casualties: {
    id: "o_casualties", type: "outcome", label: "Casualties",
    desc: "People died in the storm. The city mourns.",
    approvalEffect: -12,
  },
  o_displacement: {
    id: "o_displacement", type: "outcome", label: "Displacement",
    desc: "Thousands forced from their homes by power loss or structural damage.",
    approvalEffect: -8,
  },
  o_transit_shutdown: {
    id: "o_transit_shutdown", type: "outcome", label: "Transit Shutdown",
    desc: "Subways and buses halted. The city freezes in place.",
    approvalEffect: -6,
  },
  o_property_damage: {
    id: "o_property_damage", type: "outcome", label: "Property Damage",
    desc: "Collapsed roofs, burst pipes, flooded basements.",
    approvalEffect: -5,
    reserveEffect: -0.8,
  },
  o_invisible_success: {
    id: "o_invisible_success", type: "outcome", label: "Invisible Success",
    desc: "The storm was mitigated. Nothing happened. No one notices.",
    approvalEffect: -2,
    withCreditClaim: +10,
  },
  o_blackout: {
    id: "o_blackout", type: "outcome", label: "Power Outage",
    desc: "Hundreds of thousands lose power. NYCHA towers go dark.",
    approvalEffect: -9,
  },
};

// ─── Combined export ───────────────────────────────────────
export const entries = {
  ...seasons,
  ...hazards,
  ...districts,
  ...infrastructure,
  ...blocs,
  ...resources,
  ...policies,
  ...framings,
  ...outcomes,
};
