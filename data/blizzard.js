// data/blizzard.js — Blizzard scenario: initial state + event script
// This is the "level file" for the first playable scenario.

export const BLIZZARD_INITIAL_STATE = {
  scenario: "blizzard",
  quarter: 1,
  season: "spring",
  phase: "prep",       // prep -> decision -> resolve -> react

  reserve: 5.0,
  operatingDeficit: 0.4,

  blocs: {
    working:      { approval: 52 },
    finance:      { approval: 50 },
    realestate:   { approval: 48 },
    progressives: { approval: 55 },
    labor:        { approval: 53 },
  },

  districts: {
    d_south_bronx:     { approval: 48, modifier: 0 },
    d_riverdale:       { approval: 52, modifier: 0 },
    d_washington_hts:  { approval: 55, modifier: 0 },
    d_harlem:          { approval: 57, modifier: 0 },
    d_upper_west:      { approval: 54, modifier: 0 },
    d_upper_east:      { approval: 50, modifier: 0 },
    d_midtown:         { approval: 49, modifier: 0 },
    d_les:             { approval: 58, modifier: 0 },
    d_fidi:            { approval: 50, modifier: 0 },
    d_astoria:         { approval: 55, modifier: 0 },
    d_jackson_hts:     { approval: 56, modifier: 0 },
    d_flushing:        { approval: 52, modifier: 0 },
    d_jamaica:         { approval: 53, modifier: 0 },
    d_williamsburg:    { approval: 57, modifier: 0 },
    d_bed_stuy:        { approval: 54, modifier: 0 },
    d_park_slope:      { approval: 59, modifier: 0 },
    d_brownsville:     { approval: 47, modifier: 0 },
    d_bay_ridge:       { approval: 49, modifier: 0 },
    d_staten_island:   { approval: 46, modifier: 0 },
  },

  infrastructure: {
    p_plows:    { built: false, progress: 0 },
    p_salt:     { built: false, progress: 0 },
    p_grid:     { built: false, progress: 0 },
    p_shelter:  { built: false, progress: 0 },
    p_warning:  { built: false, progress: 0 },
    p_outreach: { built: false, progress: 0 },
  },

  hazard: {
    id: "h_blizzard",
    announced: false,
    strikesAtQuarter: 4,
    baseSeverity: 70,
    currentSeverity: 70,
    struck: false,
    resolved: false,
  },

  creditBank: {
    narrativeBuilt: 0,
    publicAwareness: 0,
    infrastructureVisible: 0,
    total: 0,
  },

  flags: [],
  history: [],
  citywide: 52,
  gameOver: false,
  gameResult: null,
};

// ─── Season mapping ────────────────────────────────────────
export const SEASONS = {
  1: "spring",
  2: "summer",
  3: "fall",
  4: "winter",
};

// ─── Quarter descriptions ──────────────────────────────────
export const QUARTER_NARRATIVES = {
  1: {
    season: "spring",
    headline: "Spring — 9 Months Out",
    briefing: "The National Weather Service issues a long-range winter outlook: above-average snowfall probability for the Northeast. Nobody's paying attention yet.",
    weatherNote: "Long-range forecast: elevated blizzard risk this winter.",
  },
  2: {
    season: "summer",
    headline: "Summer — 6 Months Out",
    briefing: "Weather models solidify. A major nor'easter is increasingly likely. The window for infrastructure is narrowing.",
    weatherNote: "Models converging: 70% chance of major winter storm.",
  },
  3: {
    season: "fall",
    headline: "Fall — 3 Months Out",
    briefing: "Blizzard watch issued for the five boroughs. This is your last chance for emergency measures. Whatever you haven't built, you probably won't.",
    weatherNote: "BLIZZARD WATCH: Major nor'easter expected within 90 days.",
  },
  4: {
    season: "winter",
    headline: "Winter — The Storm Hits",
    briefing: "It's here. Two feet of snow, 50mph gusts, whiteout conditions across all five boroughs. The question now is: did you prepare?",
    weatherNote: "BLIZZARD WARNING: Dangerous conditions. Stay indoors.",
  },
};

// ─── Policy availability per quarter ───────────────────────
export const QUARTER_POLICIES = {
  1: ["pol_plow_fleet", "pol_grid_harden", "pol_tax_cut"],
  2: ["pol_salt_reserve", "pol_shelters", "pol_housing_push"],
  3: ["pol_warning_sys", "pol_outreach", "pol_overtime"],
  4: ["pol_deploy_manhattan", "pol_deploy_outer", "pol_deploy_equal"],
};

// ─── Scenario events (triggers/conditions/effects) ─────────
// These fire during the REACT phase based on game state.
export const SCENARIO_EVENTS = [
  // Q2: Early snow preview
  {
    id: "evt_early_snow",
    quarter: 2,
    phase: "react",
    headline: "Early Snow Squall Hits Queens",
    narrative: "An unexpected October squall dumps 3 inches on outer boroughs. A preview of what's coming.",
    conditions: [],
    effects: [
      { type: "bloc_approval", bloc: "working", delta: -2 },
      { type: "bloc_approval", bloc: "labor", delta: -1 },
    ],
    // If plows are built, the event is handled well
    conditionalEffects: {
      if: { infraBuilt: "p_plows" },
      then: {
        narrative: "An October squall dumps 3 inches — but the new plow fleet clears it by morning. Barely a story.",
        effects: [
          { type: "bloc_approval", bloc: "working", delta: +2 },
          { type: "bloc_approval", bloc: "labor", delta: +1 },
        ],
      },
    },
  },

  // Q3: Union demands
  {
    id: "evt_union_demands",
    quarter: 3,
    phase: "react",
    headline: "Sanitation Union Demands Storm Pay",
    narrative: "With the blizzard approaching, the sanitation workers union demands guaranteed overtime. Refuse and they might slow-walk the response.",
    conditions: [],
    effects: [
      { type: "bloc_approval", bloc: "labor", delta: -3 },
    ],
    conditionalEffects: {
      if: { flag: "overtime_approved" },
      then: {
        narrative: "The union's already got their overtime deal. They're ready to work.",
        effects: [],
      },
    },
  },

  // Q3: Supply shortage
  {
    id: "evt_supply_shortage",
    quarter: 3,
    phase: "react",
    headline: "Salt Prices Spike Nationwide",
    narrative: "A nationwide shortage drives salt prices up 40%. Cities that didn't stockpile early are scrambling.",
    conditions: [],
    effects: [
      { type: "reserve", delta: -0.2 },
    ],
    conditionalEffects: {
      if: { infraBuilt: "p_salt" },
      then: {
        narrative: "Salt prices spike — but you stockpiled early. The city's covered.",
        effects: [],
      },
    },
  },
];

// ─── Blizzard damage calculation ───────────────────────────
// Severity thresholds determine which outcomes fire
export const SEVERITY_THRESHOLDS = {
  catastrophic: 55,  // >= 55 remaining severity: all outcomes fire
  high: 40,          // >= 40: casualties, displacement, transit, property
  medium: 25,        // >= 25: displacement, transit, property
  low: 10,           // >= 10: transit disruption only
  mitigated: 0,      // < 10: invisible success
};

// ─── Credit bank thresholds ────────────────────────────────
export const CREDIT_THRESHOLDS = {
  strong: 7,    // "Mayor's preparation saved the city" — big approval boost
  moderate: 4,  // Mixed response — small boost
  weak: 0,      // "Why did we spend all that money?" — approval drops
};
