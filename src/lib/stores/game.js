import { writable, derived } from 'svelte/store';

// ── Core game state (replaces the global gameState object) ──
export const game = writable({
  week: 1,
  reserve: 5.0,
  slotsTotal: 3,
  schedule: [null, null, null],
  weekStarted: false,
  insights: [],
  patterns: [],
  posts: [],
  feed: [
    { type: 'chatter', text: 'People in Flushing are talking about the bus cuts. Nobody\u2019s been out there.', districtId: 'flushing', time: '2h ago', week: 0 },
    { type: 'news', text: 'Federal infrastructure grants announced \u2014 $2.1B available for transit.', time: '3h ago', week: 0 },
    { type: 'chatter', text: 'Another scaffolding collapse on the Upper East Side. Third one this month.', districtId: 'ues', time: '3h ago', week: 0 },
    { type: 'chatter', text: 'Community board in Crown Heights passed a resolution demanding more police foot patrols.', districtId: 'crown', time: '6h ago', week: 0 },
  ],
  dms: [
    { characterName: 'Maria Delgado', initials: 'MD', districtId: 'southbronx', districtName: 'South Bronx', messages: [], unread: false },
    { characterName: 'James Washington', initials: 'JW', districtId: 'harlem', districtName: 'Harlem', messages: [], unread: false },
  ],
  heardAbout: {},
  citywide: 50,
  citywideDisorder: 10,
  departments: { HEALTH: 1, HOUSING: 1, INFRA: 1, SERVICES: 1, SAFETY: 1, COMMUNITY: 1 },
  doctrines: { HEALTH: null, HOUSING: null, INFRA: null, SERVICES: null, SAFETY: null, COMMUNITY: null },
  thoughts: [],
  hand: [],
  wanted: [],
  consecutiveEmptyWeeks: 0,
  reserveDelta: null,
  deptHintShown: false,
});

// ── UI state (view switching, selections — not persisted) ──
export const currentView = writable('map');
export const currentMode = writable('knowledge');
export const selectedDistrict = writable(null);
export const hexMenuOpen = writable(false);

// ── Onboarding state ──
export const onboardingComplete = writable(false);

// ── Overlay state ──
// Conversation: set to { districtId } to open, null to close
export const conversationActive = writable(null);
// Cinematic: set to { headline, narrative, isDanger } to show, null to dismiss
export const cinematicData = writable(null);
// Game end: set to { message, isWin, resilience, reserve, week } to show, null to hide
export const gameEndData = writable(null);
// Toast: set to { text, color } to show, null to hide
export const toastMessage = writable(null);

// ── Week end debrief ──
export const debriefActive = writable(false);

// ── Bento Box state ──
export const bentoActive = writable(false);
export const bentoState = writable({ available: [], evaluation: null, grid: [] });

// ── Comms Bento state ──
export const commsActive = writable(false);
export const commsState = writable({ available: [], evaluation: null, grid: [] });

// ── Blizzard severity (0.0 → 1.0, derived from week) ──
export const blizzardSeverity = derived(game, ($game) => {
  const t = Math.min($game.week / 48, 1.0);
  const s = t < 0.6 ? t * 0.3 : 0.18 + (t - 0.6) * 2.05;
  return Math.min(s, 1.0);
});

// ── Derived: citywide resilience ──
// (needs DISTRICTS — imported where used, not baked in here)

// ── Helpers to mutate game state ──
export function addFeedItem(item) {
  game.update(g => {
    g.feed.unshift(item);
    return g;
  });
}

export function addInsight(insight) {
  game.update(g => {
    g.insights.push(insight);
    return g;
  });
}
