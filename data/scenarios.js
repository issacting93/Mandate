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
];
