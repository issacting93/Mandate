// data/scenarios.js — Blizzard arc scenario events (weeks 4-44)
// Conditions evaluated against gameState each week. Effects applied on first match.

export const SCENARIO_EVENTS = [
  {
    id: 'evt_long_range_forecast',
    headline: 'Long-Range Winter Outlook',
    narrative: 'The National Weather Service flags above-average snowfall probability for the Northeast this winter. Nobody is paying attention yet.',
    conditions: [{ type: 'week', value: 4 }],
    effects: [{ type: 'feed_item', text: 'NWS long-range forecast: elevated blizzard risk this winter.', feedType: 'news' }],
  },
  {
    id: 'evt_infrastructure_report',
    headline: 'Infrastructure Report Card',
    narrative: 'A city comptroller audit reveals aging snow-removal equipment and depleted salt reserves. "We are not ready for a serious winter storm," the report concludes.',
    conditions: [{ type: 'week', value: 10 }],
    effects: [{ type: 'feed_item', text: 'Comptroller: city snow infrastructure rated "poor." Salt reserves at 40%.', feedType: 'news' }],
  },
  {
    id: 'evt_heat_stress',
    headline: 'Summer Heat Stress',
    narrative: 'A brutal July heat wave sends 200 people to ERs. Districts you\'ve visited handle it better — cooling centers were pre-positioned based on your field data.',
    conditions: [{ type: 'weekRange', min: 14, max: 18 }],
    effects: [
      { type: 'feed_item', text: 'Heat wave: 200+ ER visits. Community networks activated in visited districts.', feedType: 'news' },
    ],
  },
  {
    id: 'evt_models_converge',
    headline: 'Models Converge',
    narrative: 'Weather models solidify: 70% chance of a major nor\'easter this winter. The window for infrastructure work is narrowing.',
    conditions: [{ type: 'week', value: 22 }],
    effects: [{ type: 'feed_item', text: 'BREAKING: 70% chance of major winter storm. Models converging.', feedType: 'news' }],
  },
  {
    id: 'evt_october_squall',
    headline: 'Early Snow Squall Hits Queens',
    narrative: 'An unexpected October squall dumps 3 inches on outer boroughs. A preview of what\'s coming.',
    conditions: [{ type: 'weekRange', min: 28, max: 32 }],
    effects: [
      { type: 'trust', district: 'flushing', delta: -3 },
      { type: 'trust', district: 'jackson', delta: -2 },
      { type: 'feed_item', text: 'October squall: 3 inches in Queens. Flushing streets unplowed for 18 hours.', feedType: 'news' },
    ],
  },
  {
    id: 'evt_salt_spike',
    headline: 'Salt Prices Spike Nationwide',
    narrative: 'A nationwide shortage drives salt prices up 40%. Cities that didn\'t stockpile early are scrambling.',
    conditions: [{ type: 'weekRange', min: 30, max: 34 }],
    effects: [
      { type: 'reserve', delta: -0.3 },
      { type: 'disorderScope', scope: 'all', delta: 3, label: 'Salt shortage anger' },
      { type: 'feed_item', text: 'Road salt prices surge 40%. Emergency procurement costs $300M more than planned.', feedType: 'news' },
    ],
  },
  {
    id: 'evt_blizzard_watch',
    headline: 'BLIZZARD WATCH ISSUED',
    narrative: 'The NWS issues a blizzard watch for all five boroughs. Major nor\'easter expected within 3 weeks. This is your last chance for emergency measures.',
    conditions: [{ type: 'week', value: 36 }],
    effects: [
      { type: 'disorderScope', scope: 'all', delta: 4, label: 'Pre-storm anxiety' },
      { type: 'feed_item', text: '\u26a0 BLIZZARD WATCH: Major nor\'easter expected. All five boroughs.', feedType: 'news' },
    ],
  },
  {
    id: 'evt_union_demands',
    headline: 'Sanitation Union Demands Storm Pay',
    narrative: 'With the blizzard approaching, the sanitation workers union demands guaranteed overtime or they\'ll slow-walk the response.',
    conditions: [{ type: 'weekRange', min: 37, max: 40 }],
    effects: [
      { type: 'reserve', delta: -0.5 },
      { type: 'disorderScope', scope: 'all', delta: 5, label: 'Union standoff' },
      { type: 'feed_item', text: 'Sanitation union secures emergency overtime deal: $500M committed.', feedType: 'news' },
    ],
  },
  {
    id: 'evt_blizzard_warning',
    headline: 'BLIZZARD WARNING',
    narrative: 'Two feet of snow, 50mph gusts, whiteout conditions forecast for all five boroughs. The question now is: did you prepare?',
    conditions: [{ type: 'week', value: 42 }],
    effects: [
      { type: 'flag', value: 'blizzard_imminent' },
      { type: 'disorderScope', scope: 'all', delta: 6, label: 'Blizzard panic' },
      { type: 'feed_item', text: '\ud83c\udf28 BLIZZARD WARNING: Dangerous conditions expected. Stay indoors.', feedType: 'news' },
    ],
  },
  {
    id: 'evt_blizzard_strikes',
    headline: 'THE BLIZZARD',
    narrative: 'It\'s here. Power outages across the outer boroughs. Transit shut down. The districts you listened to have activated their community networks. The ones you didn\'t are calling 911.',
    conditions: [{ type: 'week', value: 44 }],
    effects: [
      { type: 'flag', value: 'blizzard_struck' },
      { type: 'disorderScope', scope: 'unvisited', delta: 10, label: 'Neglected districts in crisis' },
      { type: 'disorderScope', scope: 'all', delta: 3, label: 'Citywide emergency stress' },
      { type: 'feed_item', text: '\ud83c\udf28 BLIZZARD: 26 inches and counting. Citywide emergency declared.', feedType: 'news' },
    ],
  },

  // ═══ BETWEEN-BEAT EVENTS (fill gaps in blizzard arc) ═══
  {
    id: 'evt_water_main_break',
    headline: 'Water Main Break in Jamaica',
    narrative: 'DEP crews scrambling. Boil water advisory for southeastern Queens.',
    conditions: [{ type: 'weekRange', min: 6, max: 8 }],
    effects: [
      { type: 'feed_item', text: '48-inch water main burst in Jamaica. 20,000 residents without water for 72 hours.', feedType: 'news' },
      { type: 'trust', district: 'jamaica', delta: -3, condition: 'unvisited' },
      { type: 'trust', district: 'flushing', delta: -3, condition: 'unvisited' },
      { type: 'disorderScope', scope: 'all', delta: 3, label: 'Water main emergency' },
    ],
  },
  {
    id: 'evt_heat_wave',
    headline: 'Extreme Heat Advisory',
    narrative: 'Heat index 108°F. Three hospitals reporting surge admissions.',
    conditions: [{ type: 'week', value: 12 }],
    effects: [
      { type: 'feed_item', text: 'Extreme heat in South Bronx, Harlem, Crown Heights. No cooling center intelligence in unvisited districts.', feedType: 'news' },
      { type: 'trust', district: 'southbronx', delta: -2, condition: 'unvisited' },
      { type: 'trust', district: 'harlem', delta: -2, condition: 'unvisited' },
      { type: 'trust', district: 'crown', delta: -2, condition: 'unvisited' },
      { type: 'disorderScope', scope: 'all', delta: 2, label: 'Heat wave strain' },
    ],
  },
  {
    id: 'evt_signal_failure',
    headline: 'MTA Signal System Failure',
    narrative: 'Signal infrastructure from 1937. Replacement timeline: 2031.',
    conditions: [{ type: 'weekRange', min: 16, max: 20 }],
    effects: [
      { type: 'feed_item', text: 'MTA signal system failure shuts down 4/5/6 line. Commuter chaos in the Bronx and Midtown.', feedType: 'news' },
      { type: 'trust', district: 'fordham', delta: -3 },
      { type: 'trust', district: 'midtown', delta: -3 },
      { type: 'disorderScope', scope: 'all', delta: 2, label: 'Transit breakdown anger' },
    ],
  },
  {
    id: 'evt_housing_court',
    headline: 'Housing Court Backlog Crisis',
    narrative: 'Tenants waiting 18 months for heat violation hearings. Landlords know it.',
    conditions: [{ type: 'weekRange', min: 24, max: 26 }],
    effects: [
      { type: 'feed_item', text: 'Housing court backlog hits 18-month wait. Tenants losing faith in the system.', feedType: 'news' },
      { type: 'trust', district: 'harlem', delta: -2 },
      { type: 'trust', district: 'fordham', delta: -2 },
      { type: 'trust', district: 'bushwick', delta: -2 },
      { type: 'disorderScope', scope: 'all', delta: 2, label: 'Housing court frustration' },
    ],
  },
  {
    id: 'evt_restaurant_scandal',
    headline: 'Restaurant Inspection Scandal',
    narrative: 'DOHMH inspector falsified 200+ scores. Flushing, Jackson Heights hardest hit.',
    conditions: [{ type: 'week', value: 27 }],
    effects: [
      { type: 'feed_item', text: 'Falsified restaurant inspection scores exposed. 200+ restaurants affected in Flushing and Jackson Heights.', feedType: 'news' },
      { type: 'trust', district: 'flushing', delta: -3 },
      { type: 'trust', district: 'jackson', delta: -3 },
      { type: 'disorderScope', scope: 'all', delta: 3, label: 'Inspection scandal outrage' },
    ],
  },
  {
    id: 'evt_grid_stress',
    headline: 'Power Grid Stress Test Failure',
    narrative: 'Three substations built for 2-foot surge in a 6-foot surge zone.',
    conditions: [{ type: 'weekRange', min: 32, max: 35 }],
    effects: [
      { type: 'feed_item', text: 'Con Ed stress test: 3 substations below surge threshold. Grid vulnerable to winter storm.', feedType: 'news' },
      { type: 'trust', district: 'ues', delta: -2 },
      { type: 'trust', district: 'midtown', delta: -2 },
      { type: 'trust', district: 'lowerman', delta: -2 },
      { type: 'disorderScope', scope: 'all', delta: 2, label: 'Grid vulnerability fear' },
    ],
  },
  {
    id: 'evt_shelter_overflow',
    headline: 'Homeless Shelter Overflow',
    narrative: 'Right to Shelter mandate vs. physical capacity. Something has to give.',
    conditions: [{ type: 'week', value: 38 }],
    effects: [
      { type: 'feed_item', text: 'DHS shelters at 102% capacity. Right to Shelter mandate under pressure.', feedType: 'news' },
      { type: 'trust', district: 'midtown', delta: -3 },
      { type: 'trust', district: 'dtbk', delta: -3 },
      { type: 'disorderScope', scope: 'all', delta: 4, label: 'Shelter crisis panic' },
    ],
  },
  {
    id: 'evt_early_freeze',
    headline: 'Early Freeze — Pipes Burst',
    narrative: 'Pre-war plumbing wasn\'t built for this. Three boroughs reporting burst pipes.',
    conditions: [{ type: 'weekRange', min: 40, max: 41 }],
    effects: [
      { type: 'feed_item', text: 'Pipes bursting in older buildings across South Bronx, Crown Heights, Riverdale. Emergency repair mobilized.', feedType: 'news' },
      { type: 'trust', district: 'southbronx', delta: -4, condition: 'unvisited' },
      { type: 'trust', district: 'crown', delta: -4, condition: 'unvisited' },
      { type: 'trust', district: 'riverdale', delta: -4, condition: 'unvisited' },
      { type: 'reserve', delta: -0.2 },
      { type: 'disorderScope', scope: 'all', delta: 3, label: 'Burst pipe emergency' },
    ],
  },

  // ═══ FISCAL WARNINGS (teach reserve drain) ═══
  {
    id: 'evt_fiscal_60pct',
    headline: 'Comptroller Flags Reserve',
    narrative: 'The Comptroller\'s office reports operating reserves have dropped below 60%. Standard fiscal prudence calls for maintaining at least $3B.',
    conditions: [{ type: 'reserveBelow', value: 3.0 }],
    effects: [{ type: 'feed_item', text: 'Comptroller: operating reserve below 60%. "Fiscal caution advised."', feedType: 'news' }],
  },
  {
    id: 'evt_fiscal_downgrade',
    headline: 'Bond Rating Warning',
    narrative: 'Rating agencies issue a downgrade warning. The city\'s borrowing costs will rise if reserves continue to fall.',
    conditions: [{ type: 'reserveBelow', value: 1.5 }],
    effects: [{ type: 'feed_item', text: 'BREAKING: Bond agencies issue downgrade warning. Reserve critically low.', feedType: 'news' }],
  },
  {
    id: 'evt_fiscal_deficit',
    headline: 'Deficit Spending Begins',
    narrative: 'The city has entered deficit spending. Emergency borrowing is authorized, but every dollar now costs more than it should.',
    conditions: [{ type: 'reserveBelow', value: 0 }],
    effects: [{ type: 'feed_item', text: 'City enters deficit spending. Emergency borrowing authorized at penalty rates.', feedType: 'news' }],
  },
  {
    id: 'evt_fiscal_oversight',
    headline: 'State Oversight Looms',
    narrative: 'The state legislature is considering an emergency financial oversight board — the fiscal equivalent of losing your mandate.',
    conditions: [{ type: 'reserveBelow', value: -1.5 }],
    effects: [{ type: 'feed_item', text: 'Albany threatens emergency oversight board. "The mayor has lost fiscal control."', feedType: 'news' }],
  },

  // ═══ STAFF POLICY NUDGE (teach bento box) ═══
  {
    id: 'evt_staff_policy_nudge',
    headline: 'Deputy Mayor Asks About Policy',
    narrative: 'Your Deputy Mayor catches you between meetings: "We have insights. We have data. But we haven\'t built a single targeted policy. The Policy Builder is where listening becomes action."',
    conditions: [
      { type: 'weekRange', min: 6, max: 10 },
      { type: 'insightCount', value: 3 },
    ],
    effects: [{ type: 'feed_item', text: 'Deputy Mayor: "When are we going to build a real policy from what we\'ve learned?"', feedType: 'chatter' }],
  },
];
