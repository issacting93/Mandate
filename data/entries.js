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

// ─── Concern Categories ───────────────────────────────────
// These are the axes each district cares about.
// Scores 0-10: how much this district prioritizes this issue.
// The LLM evaluates posts against these. The graph shows them as weighted edges.
export const concernTypes = {
  c_health:   { id: "c_health",   type: "concern", label: "Health",          desc: "Air quality, asthma, heat illness, medical access, medication supply chains." },
  c_housing:  { id: "c_housing",  type: "concern", label: "Housing",         desc: "Displacement, rent burden, building conditions, basement flooding, landlord neglect." },
  c_transit:  { id: "c_transit",  type: "concern", label: "Transit",         desc: "Commute disruption, stranded workers, bus/subway dependency, road access." },
  c_safety:   { id: "c_safety",   type: "concern", label: "Safety",          desc: "Crime, construction hazards, ice falls, wind debris, emergency response time." },
  c_infra:    { id: "c_infra",    type: "concern", label: "Infrastructure",  desc: "Power grid, water mains, sewers, backup generators, building wiring." },
  c_services: { id: "c_services", type: "concern", label: "Services",        desc: "Schools, pharmacies, food access, senior centers, childcare, sanitation." },
};

// ─── Districts ─────────────────────────────────────────────
// Each district has structured `concerns` (0-10 per category) that:
//   1. The LLM reads to score posts ("does this address what they care about?")
//   2. The game updates when the mayor addresses an issue
//   3. The graph shows as weighted edges from district → concern nodes
// `character` references the conversation contact (from CONVERSATIONS in index.html)
// `boro` matches the inline DISTRICTS array for rendering
export const districts = {
  d_south_bronx: {
    id: "d_south_bronx", type: "district", label: "South Bronx",
    boro: "The Bronx", bloc: "working", region: "bronx", pop: 3, baseResilience: 48,
    position: { x: 560, y: 95 },
    concern: "Asthma corridor near the expressway; basement apartments flood in heavy rain.",
    concerns: { health: 9, housing: 6, transit: 4, safety: 3, infra: 7, services: 5 },
    character: { name: "Maria Delgado", role: "Tenant Organizer", initials: "MD" },
    vulnerabilities: ["snow", "power", "transit"],
  },
  d_riverdale: {
    id: "d_riverdale", type: "district", label: "Riverdale",
    boro: "The Bronx", bloc: "realestate", region: "bronx", pop: 2, baseResilience: 52,
    position: { x: 455, y: 78 },
    concern: "Aging population, many live alone; steep terrain complicates snow evacuation.",
    concerns: { health: 6, housing: 3, transit: 2, safety: 7, infra: 4, services: 5 },
    character: null,
    vulnerabilities: ["snow", "ice"],
  },
  d_washington_hts: {
    id: "d_washington_hts", type: "district", label: "Washington Heights",
    boro: "Manhattan", bloc: "working", region: "mupper", pop: 2, baseResilience: 55,
    position: { x: 472, y: 150 },
    concern: "Hillside walk-ups with no elevators; deep transit reliance and language-isolated elderly.",
    concerns: { health: 5, housing: 7, transit: 8, safety: 3, infra: 4, services: 6 },
    character: null,
    vulnerabilities: ["snow", "transit"],
  },
  d_harlem: {
    id: "d_harlem", type: "district", label: "Harlem",
    boro: "Manhattan", bloc: "progressives", region: "mupper", pop: 3, baseResilience: 57,
    position: { x: 526, y: 200 },
    concern: "NYCHA towers with aging boilers; food deserts worsen when corner stores close in storms.",
    concerns: { health: 6, housing: 8, transit: 3, safety: 4, infra: 7, services: 8 },
    character: { name: "James Washington", role: "Block Association President", initials: "JW" },
    vulnerabilities: ["power", "snow"],
  },
  d_upper_west: {
    id: "d_upper_west", type: "district", label: "Upper West Side",
    boro: "Manhattan", bloc: "progressives", region: "mcore", pop: 2, baseResilience: 54,
    position: { x: 496, y: 266 },
    concern: "High-rise density; elevator-dependent seniors during blackouts.",
    concerns: { health: 5, housing: 3, transit: 2, safety: 4, infra: 6, services: 3 },
    character: null,
    vulnerabilities: ["snow", "power"],
  },
  d_upper_east: {
    id: "d_upper_east", type: "district", label: "Upper East Side",
    boro: "Manhattan", bloc: "finance", region: "mcore", pop: 2, baseResilience: 50,
    position: { x: 566, y: 255 },
    concern: "Private hospitals handle surges, but elderly co-op residents lack emergency contacts.",
    concerns: { health: 4, housing: 2, transit: 2, safety: 6, infra: 3, services: 3 },
    character: null,
    vulnerabilities: ["snow"],
  },
  d_midtown: {
    id: "d_midtown", type: "district", label: "Midtown",
    boro: "Manhattan", bloc: "realestate", region: "mcore", pop: 2, baseResilience: 49,
    position: { x: 546, y: 330 },
    concern: "700K commuters stranded if transit stops; underground infrastructure floods quickly.",
    concerns: { health: 2, housing: 2, transit: 9, safety: 4, infra: 8, services: 3 },
    character: { name: "Diane Kowalski", role: "Building Manager, Midtown Tower", initials: "DK" },
    vulnerabilities: ["transit", "snow"],
  },
  d_les: {
    id: "d_les", type: "district", label: "Lower East Side",
    boro: "Manhattan", bloc: "progressives", region: "mcore", pop: 2, baseResilience: 58,
    position: { x: 600, y: 405 },
    concern: "NYCHA complexes with single-point-of-failure heating; coastal flood zone overlap.",
    concerns: { health: 6, housing: 7, transit: 3, safety: 5, infra: 8, services: 5 },
    character: null,
    vulnerabilities: ["power", "snow", "wind"],
  },
  d_fidi: {
    id: "d_fidi", type: "district", label: "Financial District",
    boro: "Manhattan", bloc: "finance", region: "mcore", pop: 2, baseResilience: 50,
    position: { x: 566, y: 470 },
    concern: "Below-grade substations vulnerable to storm surge; narrow streets trap wind and debris.",
    concerns: { health: 2, housing: 1, transit: 7, safety: 5, infra: 8, services: 2 },
    character: null,
    vulnerabilities: ["transit", "wind"],
  },
  d_astoria: {
    id: "d_astoria", type: "district", label: "Astoria",
    boro: "Queens", bloc: "labor", region: "queens", pop: 2, baseResilience: 55,
    position: { x: 656, y: 250 },
    concern: "Power plant adjacency creates outage cascades; mixed-use buildings with no backup heat.",
    concerns: { health: 4, housing: 6, transit: 5, safety: 3, infra: 8, services: 4 },
    character: { name: "Ramon Vega", role: "Retired MTA Mechanic", initials: "RV" },
    vulnerabilities: ["snow", "transit", "power"],
  },
  d_jackson_hts: {
    id: "d_jackson_hts", type: "district", label: "Jackson Heights",
    boro: "Queens", bloc: "working", region: "queens", pop: 3, baseResilience: 56,
    position: { x: 735, y: 305 },
    concern: "Overcrowded apartments, language barriers for alerts; basement-level retail floods.",
    concerns: { health: 5, housing: 7, transit: 4, safety: 3, infra: 5, services: 8 },
    character: { name: "Fatima Al-Rashid", role: "Bodega Owner, Roosevelt Ave", initials: "FA" },
    vulnerabilities: ["snow", "power"],
  },
  d_flushing: {
    id: "d_flushing", type: "district", label: "Flushing",
    boro: "Queens", bloc: "working", region: "queens", pop: 3, baseResilience: 52,
    position: { x: 862, y: 262 },
    concern: "Car-dependent small businesses; seniors with poor insulation and ice-prone sidewalks.",
    concerns: { health: 5, housing: 4, transit: 3, safety: 6, infra: 4, services: 7 },
    character: { name: "Wei Chen", role: "Pharmacy Owner, Main Street", initials: "WC" },
    vulnerabilities: ["snow", "ice"],
  },
  d_jamaica: {
    id: "d_jamaica", type: "district", label: "Jamaica",
    boro: "Queens", bloc: "labor", region: "queens", pop: 3, baseResilience: 53,
    position: { x: 842, y: 400 },
    concern: "Critical transit hub — failure cascades citywide; medical facilities already at capacity.",
    concerns: { health: 6, housing: 3, transit: 9, safety: 4, infra: 6, services: 5 },
    character: { name: "Yuki Tanaka", role: "Community Health Worker", initials: "YT" },
    vulnerabilities: ["transit", "snow"],
  },
  d_williamsburg: {
    id: "d_williamsburg", type: "district", label: "Williamsburg",
    boro: "Brooklyn", bloc: "progressives", region: "brooklyn", pop: 2, baseResilience: 57,
    position: { x: 664, y: 440 },
    concern: "Waterfront construction = wind hazards; Hasidic community has networks but limited city contact.",
    concerns: { health: 3, housing: 6, transit: 3, safety: 7, infra: 4, services: 4 },
    character: { name: "Sasha Okonkwo", role: "Mutual Aid Coordinator", initials: "SO" },
    vulnerabilities: ["snow", "wind"],
  },
  d_bed_stuy: {
    id: "d_bed_stuy", type: "district", label: "Bed-Stuy",
    boro: "Brooklyn", bloc: "working", region: "brooklyn", pop: 3, baseResilience: 54,
    position: { x: 726, y: 500 },
    concern: "Aging brownstone wiring; tree-lined streets become power-line hazards in ice storms.",
    concerns: { health: 4, housing: 5, transit: 3, safety: 5, infra: 8, services: 5 },
    character: { name: "Pastor David Williams", role: "Greater Faith Church", initials: "DW" },
    vulnerabilities: ["power", "snow", "ice"],
  },
  d_park_slope: {
    id: "d_park_slope", type: "district", label: "Park Slope",
    boro: "Brooklyn", bloc: "progressives", region: "brooklyn", pop: 2, baseResilience: 59,
    position: { x: 640, y: 546 },
    concern: "Ice sheets on sloped sidewalks; schools double as shelters but lack backup generators.",
    concerns: { health: 3, housing: 3, transit: 2, safety: 6, infra: 5, services: 6 },
    character: { name: "Angela Rizzo", role: "School Nurse, PS 31", initials: "AR" },
    vulnerabilities: ["snow", "ice"],
  },
  d_brownsville: {
    id: "d_brownsville", type: "district", label: "Brownsville / East NY",
    boro: "Brooklyn", bloc: "working", region: "brooklyn", pop: 3, baseResilience: 47,
    position: { x: 792, y: 560 },
    concern: "Most medically fragile residents; fewest pharmacies per capita; furthest from hospital surge.",
    concerns: { health: 9, housing: 6, transit: 5, safety: 5, infra: 7, services: 9 },
    character: null,
    vulnerabilities: ["power", "snow", "ice"],
  },
  d_bay_ridge: {
    id: "d_bay_ridge", type: "district", label: "Bay Ridge",
    boro: "Brooklyn", bloc: "working", region: "brooklyn", pop: 2, baseResilience: 49,
    position: { x: 560, y: 606 },
    concern: "Waterfront wind; car-dependent population stranded when roads ice; senior centers lack backup heat.",
    concerns: { health: 5, housing: 3, transit: 4, safety: 6, infra: 5, services: 6 },
    character: null,
    vulnerabilities: ["snow", "ice", "wind"],
  },
  d_staten_island: {
    id: "d_staten_island", type: "district", label: "Staten Island",
    boro: "Staten Island", bloc: "labor", region: "si", pop: 2, baseResilience: 46,
    position: { x: 255, y: 600 },
    concern: "Single bridge/ferry dependency; coastal flood zones; volunteer fire companies stretched thin.",
    concerns: { health: 4, housing: 3, transit: 8, safety: 5, infra: 6, services: 5 },
    character: { name: "Tommy Ferraro", role: "Retired FDNY Captain", initials: "TF" },
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
    desc: "200 plow trucks and salt spreaders stationed across all boroughs. Protects car-dependent outer-borough residents, clears access for ambulances and supply trucks.",
    buildCost: 0.8, maintenanceCost: 0.1, mitigationValue: 20,
    buildTime: 1, tags: ["snow", "ice"],
    visible: true,
  },
  p_salt: {
    id: "p_salt", type: "infrastructure", label: "Salt Reserves",
    desc: "Pre-positioned road salt stockpiles in every borough depot. Prevents black-ice falls among elderly pedestrians and keeps bus routes passable for transit-dependent workers.",
    buildCost: 0.3, maintenanceCost: 0.05, mitigationValue: 10,
    buildTime: 1, tags: ["ice"],
    visible: true,
  },
  p_grid: {
    id: "p_grid", type: "infrastructure", label: "Grid Hardening",
    desc: "Reinforced power lines and backup generators for hospitals, NYCHA towers, and nursing homes. Protects medically fragile residents who depend on electrically powered equipment.",
    buildCost: 1.2, maintenanceCost: 0.15, mitigationValue: 15,
    buildTime: 2, tags: ["power", "wind"],
    visible: false,
  },
  p_shelter: {
    id: "p_shelter", type: "infrastructure", label: "Emergency Shelters",
    desc: "Heated shelters with cots, food, and medical staff in every borough. Primary refuge for unhoused residents, displaced families, and anyone whose home loses heat or power.",
    buildCost: 0.5, maintenanceCost: 0.1, mitigationValue: 10,
    buildTime: 1, tags: ["snow", "power"],
    visible: true,
  },
  p_warning: {
    id: "p_warning", type: "infrastructure", label: "Early Warning System",
    desc: "Multilingual alert network: phone, radio, street signs. Reaches language-isolated communities, hearing-impaired residents, and people without smartphones.",
    buildCost: 0.4, maintenanceCost: 0.05, mitigationValue: 8,
    buildTime: 1, tags: ["snow", "ice", "wind", "power"],
    visible: false,
  },
  p_outreach: {
    id: "p_outreach", type: "infrastructure", label: "Vulnerable-Resident Outreach",
    desc: "Door-to-door checks on elderly, disabled, and unhoused residents. Identifies people who cannot self-evacuate, need medication resupply, or are not receiving alerts.",
    buildCost: 0.3, maintenanceCost: 0.05, mitigationValue: 7,
    buildTime: 1, tags: ["snow", "power"],
    visible: false,
    requires: "p_warning",
  },
};

// ─── Community Assets (discovered via PAR) ────────────────
// These unlock during Listening Sessions when community members
// reveal existing resources: backup generators, accessible spaces,
// mutual-aid networks, medical professionals, etc.
// To be populated in Phase 1C content pass.

// ─── Blocs ─────────────────────────────────────────────────
export const blocs = {
  b_working: {
    id: "b_working", type: "bloc", label: "Working Families",
    desc: "Most exposed to infrastructure failures; basement apartments, transit-dependent, wage-loss during closures.",
    color: { css: "var(--working)", hex: 0x2fc3e8 },
    wants: ["affordability", "safety", "services"],
    disasterExposure: "high",
  },
  b_finance: {
    id: "b_finance", type: "bloc", label: "Business & Finance",
    desc: "Economic continuity concerns; business interruption insurance gaps, commuter workforce stranded.",
    color: { css: "var(--finance)", hex: 0x7c8cf8 },
    wants: ["continuity", "infrastructure", "stability"],
    disasterExposure: "moderate",
  },
  b_realestate: {
    id: "b_realestate", type: "bloc", label: "Real Estate",
    desc: "Property damage exposure; flood zones, construction liability, tenant displacement costs.",
    color: { css: "var(--realestate)", hex: 0xff6f67 },
    wants: ["building codes", "insurance", "property values"],
    disasterExposure: "moderate",
  },
  b_progressives: {
    id: "b_progressives", type: "bloc", label: "Progressives",
    desc: "Environmental justice advocates; climate adaptation, equitable resource distribution, community organizing capacity.",
    color: { css: "var(--progressives)", hex: 0xff5fa0 },
    wants: ["equity", "climate action", "community power"],
    disasterExposure: "variable",
  },
  b_labor: {
    id: "b_labor", type: "bloc", label: "Labor Unions",
    desc: "First responders and essential workers; personal exposure during crises, family separation, overtime fatigue.",
    color: { css: "var(--labor)", hex: 0xffc24d },
    wants: ["worker safety", "staffing", "hazard pay"],
    disasterExposure: "high",
  },
};

// ─── Resources / Meters ────────────────────────────────────
export const resources = {
  r_reserve: {
    id: "r_reserve", type: "resource", label: "City Reserve",
    desc: "The municipal operating budget. Goes below -$3B and the state takes over.",
  },
  r_resilience: {
    id: "r_resilience", type: "resource", label: "Community Resilience",
    desc: "Population-weighted measure of trust, preparedness, and social cohesion across all districts.",
  },
};

// ─── Policies (Emergency Intervention Cards) ──────────────
export const policies = {
  pol_plow_fleet: {
    id: "pol_plow_fleet", type: "policy", label: "Expand Snow-Removal Fleet",
    desc: "Purchase 200 new plows and pre-position them in outer boroughs. Prioritizes transit-dependent neighborhoods where ambulance access fails first.",
    tier: "generic",
    budgetDelta: -0.8,
    trustEffect: { targeted: +5, citywide: +1 },
    targets: ["d_south_bronx", "d_jackson_hts", "d_flushing", "d_brownsville", "d_bay_ridge", "d_staten_island"],
    buildsInfra: "p_plows",
  },
  pol_grid_harden: {
    id: "pol_grid_harden", type: "policy", label: "Harden the Power Grid",
    desc: "Bury vulnerable lines and install backup generators at hospitals, NYCHA towers, and nursing homes. Prevents cascading outages that endanger medically fragile residents.",
    tier: "informed",
    budgetDelta: -1.2,
    trustEffect: { targeted: +6, citywide: +2 },
    targets: ["d_harlem", "d_les", "d_south_bronx", "d_jackson_hts", "d_bed_stuy", "d_brownsville"],
    buildsInfra: "p_grid",
  },
  pol_business_continuity: {
    id: "pol_business_continuity", type: "policy", label: "Small-Business Continuity Grants",
    desc: "Fund emergency preparedness kits, backup power, and business interruption plans for businesses under 50 employees. Keeps pharmacies, bodegas, and laundromats open during storms.",
    tier: "generic",
    budgetDelta: -0.6,
    trustEffect: { targeted: +3, citywide: +2 },
    targets: ["d_midtown", "d_flushing", "d_jackson_hts"],
    buildsInfra: null,
  },
  pol_salt_reserve: {
    id: "pol_salt_reserve", type: "policy", label: "Stockpile Road Salt",
    desc: "Fill every borough depot to capacity. Cheap and visible — prevents pedestrian falls and keeps bus routes clear for transit-dependent workers.",
    tier: "generic",
    budgetDelta: -0.3,
    trustEffect: { targeted: +3, citywide: +1 },
    targets: ["d_staten_island", "d_riverdale", "d_bay_ridge", "d_flushing", "d_brownsville"],
    buildsInfra: "p_salt",
  },
  pol_shelters: {
    id: "pol_shelters", type: "policy", label: "Open Emergency Shelters",
    desc: "Staff and supply heated shelters in every borough. ADA-accessible, stocked with medications, and staffed with multilingual workers.",
    tier: "generic",
    budgetDelta: -0.5,
    trustEffect: { targeted: +6, citywide: +3 },
    targets: ["d_south_bronx", "d_brownsville", "d_harlem", "d_bed_stuy"],
    buildsInfra: "p_shelter",
  },
  pol_resilience_hubs: {
    id: "pol_resilience_hubs", type: "policy", label: "Establish Resilience Hubs",
    desc: "Convert community centers into year-round resilience hubs with backup power, medical supplies, and communication equipment. Builds long-term neighborhood capacity.",
    tier: "informed",
    budgetDelta: -0.4,
    trustEffect: { targeted: +5, citywide: +2 },
    targets: ["d_south_bronx", "d_brownsville", "d_harlem", "d_jackson_hts", "d_bed_stuy"],
    buildsInfra: null,
  },
  pol_warning_sys: {
    id: "pol_warning_sys", type: "policy", label: "Deploy Early Warning System",
    desc: "Multilingual phone alerts, radio broadcasts, LED street signs. Reaches people who don't have smartphones or speak English.",
    tier: "generic",
    budgetDelta: -0.4,
    trustEffect: { targeted: +2, citywide: +3 },
    targets: [],
    buildsInfra: "p_warning",
  },
  pol_outreach: {
    id: "pol_outreach", type: "policy", label: "Door-to-Door Outreach Program",
    desc: "Send workers to check on elderly, disabled, and unhoused residents before the storm. Identifies who cannot self-evacuate and who needs medication resupply.",
    tier: "informed",
    budgetDelta: -0.3,
    trustEffect: { targeted: +7, citywide: +2 },
    targets: ["d_south_bronx", "d_harlem", "d_brownsville", "d_bed_stuy"],
    buildsInfra: "p_outreach",
    requires: "p_warning",
  },
  pol_overtime: {
    id: "pol_overtime", type: "policy", label: "Authorize Essential-Worker Overtime",
    desc: "Pre-authorize overtime for sanitation, transit, and emergency workers. Ensures adequate staffing through multi-day storms but strains workers and families.",
    tier: "generic",
    budgetDelta: -0.6,
    trustEffect: { targeted: +4, citywide: +1 },
    targets: [],
    buildsInfra: null,
  },
  pol_deploy_manhattan: {
    id: "pol_deploy_manhattan", type: "policy", label: "Prioritize Manhattan Clearing",
    desc: "Send plows to clear Midtown and FiDi first. Keeps hospitals and transit hubs accessible, but outer boroughs wait — where the most vulnerable residents live.",
    tier: "generic",
    budgetDelta: -0.3,
    trustEffect: { targeted: +3, citywide: -4 },
    targets: ["d_midtown", "d_fidi"],
    buildsInfra: null,
  },
  pol_deploy_outer: {
    id: "pol_deploy_outer", type: "policy", label: "Prioritize Outer Boroughs",
    desc: "Clear residential streets first. Reaches transit-dependent workers, basement-apartment families, and isolated seniors before hypothermia sets in.",
    tier: "informed",
    budgetDelta: -0.3,
    trustEffect: { targeted: +6, citywide: +1 },
    targets: ["d_south_bronx", "d_washington_hts", "d_jackson_hts", "d_flushing", "d_brownsville", "d_bay_ridge", "d_staten_island"],
    buildsInfra: null,
  },
  pol_deploy_equal: {
    id: "pol_deploy_equal", type: "policy", label: "Equal Coverage, Slower Everywhere",
    desc: "Spread resources evenly. Nobody is first, nobody is forgotten. Slower response everywhere but no neighborhood is sacrificed.",
    tier: "generic",
    budgetDelta: -0.4,
    trustEffect: { targeted: +1, citywide: +2 },
    targets: [],
    buildsInfra: null,
  },
};

// ─── Outcomes ──────────────────────────────────────────────
export const outcomes = {
  o_casualties: {
    id: "o_casualties", type: "outcome", label: "Preventable Deaths",
    desc: "People died in the storm — from hypothermia, medical equipment failure, or inability to evacuate. These deaths were preventable with better data and pre-positioning.",
    resilienceEffect: -12,
  },
  o_displacement: {
    id: "o_displacement", type: "outcome", label: "Displacement",
    desc: "Thousands forced from their homes by power loss or structural damage. Shelters fill; the most vulnerable end up in the least accessible overflow sites.",
    resilienceEffect: -8,
  },
  o_transit_shutdown: {
    id: "o_transit_shutdown", type: "outcome", label: "Transit Shutdown",
    desc: "Subways and buses halted. Essential workers cannot reach hospitals, shelters, or water treatment plants. Transit-dependent residents are stranded.",
    resilienceEffect: -6,
  },
  o_property_damage: {
    id: "o_property_damage", type: "outcome", label: "Property Damage",
    desc: "Collapsed roofs, burst pipes, flooded basements. Renters lose belongings with no insurance; small businesses lose inventory and close permanently.",
    resilienceEffect: -5,
    reserveEffect: -0.8,
  },
  o_invisible_success: {
    id: "o_invisible_success", type: "outcome", label: "Invisible Success",
    desc: "The storm was mitigated. Nothing happened — because preparation worked. Hard to prove what you prevented, but zero preventable casualties is the goal.",
    resilienceEffect: -2,
    withCreditClaim: +10,
  },
  o_blackout: {
    id: "o_blackout", type: "outcome", label: "Power Outage",
    desc: "Hundreds of thousands lose power. NYCHA towers go dark — elevators stop, electric heat dies, medical equipment fails. People on oxygen have hours, not days.",
    resilienceEffect: -9,
  },
};

// ─── Characters ───────────────────────────────────────────
export const characters = {
  ch_delgado:   { id: "ch_delgado",   type: "character", label: "Maria Delgado",        role: "Tenant Organizer",                initials: "MD", districtId: "d_south_bronx" },
  ch_washington: { id: "ch_washington", type: "character", label: "James Washington",     role: "Block Association President",      initials: "JW", districtId: "d_harlem" },
  ch_kowalski:  { id: "ch_kowalski",  type: "character", label: "Diane Kowalski",       role: "Building Manager, Midtown Tower",  initials: "DK", districtId: "d_midtown" },
  ch_vega:      { id: "ch_vega",      type: "character", label: "Ramon Vega",           role: "Retired MTA Mechanic",             initials: "RV", districtId: "d_astoria" },
  ch_tanaka:    { id: "ch_tanaka",    type: "character", label: "Yuki Tanaka",          role: "Community Health Worker",           initials: "YT", districtId: "d_jamaica" },
  ch_alrashid:  { id: "ch_alrashid",  type: "character", label: "Fatima Al-Rashid",     role: "Bodega Owner, Roosevelt Ave",      initials: "FA", districtId: "d_jackson_hts" },
  ch_okonkwo:   { id: "ch_okonkwo",   type: "character", label: "Sasha Okonkwo",        role: "Mutual Aid Coordinator",           initials: "SO", districtId: "d_williamsburg" },
  ch_williams:  { id: "ch_williams",  type: "character", label: "Pastor David Williams", role: "Greater Faith Church",             initials: "DW", districtId: "d_bed_stuy" },
  ch_chen:      { id: "ch_chen",      type: "character", label: "Wei Chen",             role: "Pharmacy Owner, Main Street",       initials: "WC", districtId: "d_flushing" },
  ch_ferraro:   { id: "ch_ferraro",   type: "character", label: "Tommy Ferraro",        role: "Retired FDNY Captain",              initials: "TF", districtId: "d_staten_island" },
  ch_rizzo:     { id: "ch_rizzo",     type: "character", label: "Angela Rizzo",         role: "School Nurse, PS 31",               initials: "AR", districtId: "d_park_slope" },
};

// ─── Insight Templates ────────────────────────────────────
// Discovered during listening sessions — each tied to a character, district, and concern.
export const insightTemplates = {
  // Maria Delgado — South Bronx
  it_delgado_1:   { id: "it_delgado_1",   type: "insight_template", label: "Asthma corridor near Bruckner",               category: "HEALTH",   text: "Asthma corridor near Bruckner Expressway — 3x city average" },
  it_delgado_2:   { id: "it_delgado_2",   type: "insight_template", label: "Isolated seniors without AC",                  category: "HOUSING",  text: "Isolated seniors in rent-stabilized buildings — no AC, no emergency contacts" },
  it_delgado_3:   { id: "it_delgado_3",   type: "insight_template", label: "Pharmacy generator on 138th",                  category: "ASSET",    text: "Pharmacy at 138th has generator — stores insulin; community can self-organize with 3 more" },

  // James Washington — Harlem
  it_washington_1: { id: "it_washington_1", type: "insight_template", label: "High-rise walk-up blackout trap",              category: "INFRA",    text: "High-rise walk-ups during blackouts — elevator-dependent residents trapped above 6th floor" },
  it_washington_2: { id: "it_washington_2", type: "insight_template", label: "Block association vulnerable registry",        category: "ASSET",    text: "Block association maintains vulnerable-resident registry — 14 mobility-limited, medical volunteers available" },

  // Diane Kowalski — Midtown
  it_kowalski_1:  { id: "it_kowalski_1",  type: "insight_template", label: "311 response failure in large buildings",       category: "SERVICES", text: "311 response failure in large residential buildings — 3-day heat outage, 23 elderly units affected" },

  // Ramon Vega — Astoria (Fordham conversation)
  it_vega_1:      { id: "it_vega_1",      type: "insight_template", label: "Bx12 bus cuts strand communities",              category: "INFRA",    text: "Bx12 bus cuts — 45min headways, children missing school, seniors stranded" },
  it_vega_2:      { id: "it_vega_2",      type: "insight_template", label: "Transit-dependent seniors and cooling centers", category: "ASSET",    text: "Transit-dependent seniors can\u2019t reach cooling centers during blackouts — need local shuttle network" },
  it_vega_3:      { id: "it_vega_3",      type: "insight_template", label: "VFW hall emergency capacity",                   category: "ASSET",    text: "VFW hall on Jerome Ave — generator, AC, 200-person capacity, offered after Sandy, never contacted" },

  // Yuki Tanaka — Jamaica (Astoria conversation)
  it_tanaka_1:    { id: "it_tanaka_1",    type: "insight_template", label: "Homebound residents can't evacuate",            category: "HEALTH",   text: "11 homebound residents can\u2019t evacuate — 8 on oxygen, elevator-dependent, no emergency contact system" },
  it_tanaka_2:    { id: "it_tanaka_2",    type: "insight_template", label: "Health worker network scalable",                category: "ASSET",    text: "Health worker network — 1 person covers 37 homebound residents; 3 more + radios covers full zip code for $180K" },

  // Fatima Al-Rashid — Jackson Heights
  it_alrashid_1:  { id: "it_alrashid_1",  type: "insight_template", label: "Emergency alerts English-only",                category: "SERVICES", text: "Emergency alerts English-only — 14 languages on one block, residents rely on word-of-mouth" },
  it_alrashid_2:  { id: "it_alrashid_2",  type: "insight_template", label: "Bodega emergency broadcast network",           category: "ASSET",    text: "Bodega network as informal emergency broadcast — Roosevelt Ave has 6 shops that could be official info hubs" },
  it_alrashid_3:  { id: "it_alrashid_3",  type: "insight_template", label: "Illegal basement apartment flood risk",        category: "HOUSING",  text: "~200 illegal basement apartments on one block — flood death traps, residents fear deportation if reported" },

  // Sasha Okonkwo — Williamsburg
  it_okonkwo_1:   { id: "it_okonkwo_1",   type: "insight_template", label: "Mutual aid network since COVID",               category: "ASSET",    text: "Mutual aid network — 400 members, organized block-by-block, runs grocery/meds/wellness since COVID" },
  it_okonkwo_2:   { id: "it_okonkwo_2",   type: "insight_template", label: "Block captain evacuation model",               category: "ASSET",    text: "Block captain model — 60 evacuations in 3 hours during Sandy, vs FEMA 3 days. Replicable structure." },
  it_okonkwo_3:   { id: "it_okonkwo_3",   type: "insight_template", label: "Mutual aid needs city data access",            category: "INFRA",    text: "Mutual aid needs city data access — evacuation routes, shelter capacity, hospital status. Two-way channel." },

  // Pastor David Williams — Bed-Stuy
  it_williams_1:  { id: "it_williams_1",  type: "insight_template", label: "Greater Faith Church as emergency hub",        category: "ASSET",    text: "Greater Faith Church — 300 seats, kitchen, generator, 40 volunteers. Fed 200 during last blackout. Not in city registry." },
  it_williams_2:  { id: "it_williams_2",  type: "insight_template", label: "Pharmacy desert on Crown Street",              category: "HEALTH",   text: "Pharmacy desert — Crown St pharmacy closed, nearest is 20min by bus. Insulin and inhaler supply chain broken." },
  it_williams_3:  { id: "it_williams_3",  type: "insight_template", label: "Institution-distrustful residents",            category: "SAFETY",   text: "30 institution-distrustful residents known by name — won\u2019t go to shelters, need door-to-door outreach during crisis" },

  // Wei Chen — Flushing
  it_chen_1:      { id: "it_chen_1",      type: "insight_template", label: "Single pharmacy med supply fragility",         category: "HEALTH",   text: "Single pharmacy serves 400/day — $200K in temperature-sensitive meds, 4hr backup before total loss" },
  it_chen_2:      { id: "it_chen_2",      type: "insight_template", label: "Pharmacy as emergency med distribution hub",   category: "ASSET",    text: "Pharmacy can be emergency med distribution hub — needs $8K generator, willing to serve as community resource" },

  // Tommy Ferraro — Staten Island
  it_ferraro_1:   { id: "it_ferraro_1",   type: "insight_template", label: "Belt Parkway flood cuts ambulance access",     category: "INFRA",    text: "Belt Parkway floods at Shore Road during nor\u2019easters — cuts off ambulance access to southern Bay Ridge" },
  it_ferraro_2:   { id: "it_ferraro_2",   type: "insight_template", label: "CERT team of retired first responders",        category: "ASSET",    text: "CERT team — 15 retired first responders with radios and drills. Ready to deploy before official response." },

  // Angela Rizzo — Park Slope
  it_rizzo_1:     { id: "it_rizzo_1",     type: "insight_template", label: "Unsupervised children during school closures", category: "SAFETY",   text: "School closures during emergencies leave 40+ children unsupervised — empty houses, no food backup" },
  it_rizzo_2:     { id: "it_rizzo_2",     type: "insight_template", label: "PS 31 as emergency shelter",                   category: "ASSET",    text: "PS 31 has full kitchen, nurse, gym — can shelter 200. School nurse maintains vulnerable family list (43 at-risk children)" },
  it_rizzo_3:     { id: "it_rizzo_3",     type: "insight_template", label: "Ferry shutdown isolates Staten Island",        category: "INFRA",    text: "Ferry shutdown strands 9,000 commuters — no bus bridge protocol, Staten Island fully isolated during storms" },
};

// ─── Combined export ───────────────────────────────────────
export const entries = {
  ...seasons,
  ...hazards,
  ...concernTypes,
  ...districts,
  ...infrastructure,
  ...blocs,
  ...resources,
  ...policies,
  ...outcomes,
  ...characters,
  ...insightTemplates,
  // tileEntries added via Object.assign below (defined after export for readability)
};

// ── Tile entries (WHAT + HOW tiles from Bento Box) ───────────
const tileEntries = {
  tl_plow_fleet:        { id: "tl_plow_fleet",        type: "tile", label: "Snow-Removal Fleet",     tileType: "WHAT", size: [2,2], cost: 0.8 },
  tl_generator_bank:    { id: "tl_generator_bank",    type: "tile", label: "Generator Bank",          tileType: "WHAT", size: [2,2], cost: 0.6 },
  tl_emergency_shelter: { id: "tl_emergency_shelter", type: "tile", label: "Emergency Shelter",       tileType: "WHAT", size: [2,2], cost: 0.5 },
  tl_medical_cache:     { id: "tl_medical_cache",     type: "tile", label: "Medical Supply Cache",    tileType: "WHAT", size: [2,1], cost: 0.4 },
  tl_warning_system:    { id: "tl_warning_system",    type: "tile", label: "Alert System",            tileType: "WHAT", size: [1,2], cost: 0.4 },
  tl_road_salt:         { id: "tl_road_salt",         type: "tile", label: "Salt Stockpile",          tileType: "WHAT", size: [1,1], cost: 0.3 },
  tl_med_power_cache:   { id: "tl_med_power_cache",   type: "tile", label: "Medical Power Cache",     tileType: "WHAT", size: [1,2], cost: 0.3, mutatesFrom: "tl_generator_bank" },
  tl_community_shelter: { id: "tl_community_shelter", type: "tile", label: "Community Shelter Hub",   tileType: "WHAT", size: [1,2], cost: 0.3, mutatesFrom: "tl_emergency_shelter" },
  tl_multilingual:      { id: "tl_multilingual",      type: "tile", label: "Multilingual Alert Net",  tileType: "WHAT", size: [1,1], cost: 0.15, mutatesFrom: "tl_warning_system" },
  tl_targeted_plows:    { id: "tl_targeted_plows",    type: "tile", label: "Precision Plow Routes",   tileType: "WHAT", size: [1,2], cost: 0.5, mutatesFrom: "tl_plow_fleet" },
  tl_basement_registry: { id: "tl_basement_registry", type: "tile", label: "Basement Flood Registry", tileType: "WHAT", size: [1,1], cost: 0.1 },
  tl_mutual_aid:        { id: "tl_mutual_aid",        type: "tile", label: "Mutual Aid Network",      tileType: "HOW",  size: [1,2], cost: 0.08 },
  tl_local_leaders:     { id: "tl_local_leaders",     type: "tile", label: "Local Leader Liaisons",   tileType: "HOW",  size: [1,1], cost: 0.1 },
  tl_youth_corps:       { id: "tl_youth_corps",       type: "tile", label: "Emergency Youth Corps",   tileType: "HOW",  size: [1,1], cost: 0.12 },
  tl_city_workers:      { id: "tl_city_workers",      type: "tile", label: "City Worker Deployment",  tileType: "HOW",  size: [2,1], cost: 0.5 },
  tl_police:            { id: "tl_police",            type: "tile", label: "Police Enforcement",      tileType: "HOW",  size: [1,1], cost: 0.3 },
  tl_health_workers:    { id: "tl_health_workers",    type: "tile", label: "Community Health Workers", tileType: "HOW", size: [1,1], cost: 0.18 },
  tl_faith_network:     { id: "tl_faith_network",     type: "tile", label: "Faith Community Network", tileType: "HOW",  size: [1,1], cost: 0.05 },
};
Object.assign(entries, tileEntries);
