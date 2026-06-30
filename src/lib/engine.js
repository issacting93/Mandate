// engine.js — Game engine initialization and Svelte store bridge
// Creates all systems, wires EventBus ↔ Svelte stores

import { EventBus } from '$systems/bus.js';
import { StateStore } from '$systems/state.js';
import { ClockSystem } from '$systems/clock.js';
import { ScenarioSystem } from '$systems/scenario.js';
import { InsightSystem } from '$systems/insight.js';
import { InterventionSystem } from '$systems/intervention.js';
import { BentoSystem } from '$systems/bento.js';
import { MetreSystem } from '$systems/metre.js';
import { SCENARIO_EVENTS } from '$data/scenarios.js';
import { CONVERSATIONS } from '$data/conversations.js';
import { INTERVENTIONS } from '$data/interventions.js';
import { TILES, SYNERGIES, CONFLICTS } from '$data/tiles.js';
import { DISTRICTS, districtMap, ACTION_COLORS } from '$data/districts.js';
import { game, conversationActive, cinematicData, gameEndData, toastMessage, bentoActive, bentoState } from '$lib/stores/game.js';
import { get } from 'svelte/store';

// ── Singleton instances ──
export const bus = new EventBus();

// Debug mode
if (typeof location !== 'undefined' && location.search?.includes('debug')) {
  const _emit = bus.emit.bind(bus);
  bus.emit = (ch, data) => { console.log(`[bus] ${ch}`, data); return _emit(ch, data); };
}

// Initial state for the StateStore
const INITIAL_STATE = {
  week: 1,
  reserve: 5.0,
  slotsTotal: 3,
  labels: [],
  schedule: [null, null, null],
  weekStarted: false,
  insights: [],
  patterns: [],
  posts: [],
  feed: [],
  dms: [],
  gameOver: false,
  gameResult: null,
  citywide: 50,
  citywideDisorder: 10,
  heardAbout: {},
};

export const state = new StateStore(bus, INITIAL_STATE);

// ── Systems ──
export const clockSys = new ClockSystem(bus, state);
export const scenarioSys = new ScenarioSystem(bus, state, districtMap, SCENARIO_EVENTS);
export const insightSys = new InsightSystem(bus, state, districtMap);
export const interventionSys = new InterventionSystem(bus, state, districtMap, insightSys, INTERVENTIONS);
export const bentoSys = new BentoSystem(bus, state, TILES, SYNERGIES, CONFLICTS);

// MetreSystem: dual-metre (Resilience + Disorder). Supersedes TrustSystem.
// Map DISTRICTS to the format MetreSystem expects (needs baseResilience + type).
const districtEntries = DISTRICTS.map(d => ({
  id: d.id, type: 'district',
  baseResilience: d.trust, baseDisorder: 15,
  pop: parseFloat(d.pop) || 1, bloc: d.bloc,
}));
export const metreSys = new MetreSystem(bus, state, districtEntries);

// ── Conversations ──
export { CONVERSATIONS };

// ══════════════════════════════════════════════════════════════
// FIX #1: Engagement handler — VISIT/LISTEN → labels
// ══════════════════════════════════════════════════════════════
bus.on('engagement.started', ({ action, districtId }) => {
  if (action === 'close' || action === 'info' || action === 'message') return;

  game.update(g => {
    // Toggle: if already labeled with same action, remove it
    const existing = g.labels.findIndex(l => l.districtId === districtId);
    if (existing >= 0 && g.labels[existing].action === action) {
      // Remove label and any schedule entry
      g.labels.splice(existing, 1);
      g.schedule = g.schedule.map(s => s && s.districtId === districtId ? null : s);
      return g;
    }
    // Replace or add label
    if (existing >= 0) {
      g.labels[existing].action = action;
    } else {
      g.labels.push({ districtId, action, labeledAt: g.week });
    }
    return g;
  });

  // Toast + visual feedback
  const d = districtMap[districtId];
  if (d) {
    const color = ACTION_COLORS[action] || '#34d399';
    showToast(`${d.name} → ${action.toUpperCase()}`, color);
  }
});

// ══════════════════════════════════════════════════════════════
// FIX #5: GO → Conversation sequencer
// When GO is pressed, play through scheduled conversations
// ══════════════════════════════════════════════════════════════
let conversationQueue = [];
let conversationRunning = false;

export function executeWeek() {
  const g = get(game);
  const scheduled = g.schedule.filter(Boolean);

  // Mark week as started
  game.update(g => { g.weekStarted = true; return g; });

  if (scheduled.length === 0) {
    // No engagements — just advance
    bus.emit('ui.weekAdvanced');
    return;
  }

  // Build conversation queue
  conversationQueue = scheduled.map(s => ({
    districtId: s.districtId,
    action: s.action,
    hasConvo: !!CONVERSATIONS[s.districtId],
  }));

  // Process districts without conversations immediately (direct stat bump)
  conversationQueue.forEach(slot => {
    if (!slot.hasConvo) {
      const d = districtMap[slot.districtId];
      if (d) {
        d.trust = Math.min(100, d.trust + 3);
        d.know = Math.min(100, d.know + 25);
        d.lastVisited = get(game).week;
      }
    }
  });

  // Filter to only districts with conversations
  conversationQueue = conversationQueue.filter(s => s.hasConvo);

  if (conversationQueue.length === 0) {
    // All direct bumps, no conversations to play
    finishWeekEngagements();
    return;
  }

  // Start first conversation
  playNextConversation();
}

function playNextConversation() {
  if (conversationQueue.length === 0) {
    finishWeekEngagements();
    return;
  }

  const next = conversationQueue.shift();
  conversationRunning = true;
  startConversation(next.districtId);
}

function finishWeekEngagements() {
  conversationRunning = false;
  // Clear schedule and consumed labels
  game.update(g => {
    const scheduledIds = new Set(g.schedule.filter(Boolean).map(s => s.districtId));
    g.labels = g.labels.filter(l => !scheduledIds.has(l.districtId));
    g.schedule = [null, null, null];
    return g;
  });
}

// When a conversation ends, play the next one (or finish)
bus.on('conversation.ended', () => {
  if (conversationRunning) {
    setTimeout(() => playNextConversation(), 600);
  }
});

// ══════════════════════════════════════════════════════════════
// FIX #2: advanceWeek — properly advances via ClockSystem
// ══════════════════════════════════════════════════════════════
export function advanceWeek() {
  // Reset weekStarted for next week's planning
  game.update(g => { g.weekStarted = false; return g; });
  bus.emit('ui.weekAdvanced');
}

// ── Bridge: StateStore changes → Svelte game store ──
bus.on('state.changed', ({ path, newValue }) => {
  const topKey = path.split('.')[0];
  const syncKeys = ['week', 'reserve', 'weekStarted', 'insights', 'patterns', 'posts', 'feed', 'dms', 'labels', 'schedule', 'heardAbout'];
  if (syncKeys.includes(topKey)) {
    game.update(g => {
      g[topKey] = newValue;
      return g;
    });
  }
  // Sync dual-metre values
  if (path === 'citywide') {
    game.update(g => { g.citywide = newValue; return g; });
  }
  if (path === 'citywideDisorder') {
    game.update(g => { g.citywideDisorder = newValue; return g; });
  }
});

// ── Bridge: Bento events ──
bus.on('bento.presented', (data) => {
  bentoState.set(data);
});
bus.on('bento.placed', (data) => {
  bentoState.update(s => ({ ...s, evaluation: data.evaluation, grid: bentoSys.getGrid().toGrid() }));
});
bus.on('bento.removed', (data) => {
  bentoState.update(s => ({ ...s, evaluation: data.evaluation, grid: bentoSys.getGrid().toGrid() }));
});
bus.on('bento.cleared', () => {
  bentoState.update(s => ({ ...s, evaluation: bentoSys.evaluate(), grid: bentoSys.getGrid().toGrid() }));
});
bus.on('bento.resolved', (data) => {
  bentoActive.set(false);
  showToast(`Policy Signed: $${data.totalCost}B allocated`, '#34d399');
});
bus.on('bento.resolveFailed', (data) => {
  showToast(`Cannot sign: ${data.reason}`, '#ef4444');
});
bus.on('bento.placeFailed', (data) => {
  showToast(`Cannot place tile here.`, '#ef4444');
});

// ── Bridge: Svelte UI actions → bus events ──
export function startGame() {
  bus.emit('game.start');
}

export function emitEngagement(action, districtId) {
  bus.emit('engagement.started', { action, districtId });
}

export function emitConversationEnd(districtId, insights) {
  bus.emit('conversation.ended', { districtId, insights });
}

export function emitPost(post) {
  bus.emit('post.scored', post);
}

export function openBento() {
  bentoActive.set(true);
  bus.emit('ui.bentoOpen');
}

export function closeBento() {
  bentoActive.set(false);
}

// ── Bridge: scenario events → cinematic overlay ──
const CINEMATIC_EVENTS = ['evt_blizzard_watch', 'evt_blizzard_warning', 'evt_blizzard_strikes', 'evt_models_converge'];
bus.on('scenario.triggered', ({ eventId, headline, narrative }) => {
  if (!CINEMATIC_EVENTS.includes(eventId)) return;
  cinematicData.set({
    headline,
    narrative,
    isDanger: eventId.includes('blizzard'),
  });
});

// ── Bridge: game end ──
export function showGameEnd(message, isWin) {
  const currentGame = get(game);
  let total = 0, count = 0;
  DISTRICTS.forEach(d => { total += d.trust; count++; });
  const resilience = count > 0 ? Math.round(total / count) : 50;
  gameEndData.set({
    message, isWin, resilience,
    reserve: currentGame?.reserve ?? 0,
    week: currentGame?.week ?? 0,
  });
}

// ── Bridge: conversation trigger ──
export function startConversation(districtId) {
  const convo = CONVERSATIONS[districtId];
  const d = districtMap[districtId];
  if (!convo || !d) return false;
  conversationActive.set({ districtId });
  return true;
}

// ── Bridge: toast ──
export function showToast(text, color) {
  toastMessage.set({ text, color });
}

// ══════════════════════════════════════════════════════════════
// SPRINT 2: Consequence systems
// ══════════════════════════════════════════════════════════════

// ── 2.1: Community asset activation on blizzard strike ──
bus.on('scenario.triggered', ({ eventId }) => {
  if (eventId !== 'evt_blizzard_strikes') return;

  const g = get(game);
  const insights = g.insights || [];

  DISTRICTS.forEach(d => {
    const districtAssets = insights.filter(
      i => i.districtId === d.id && i.category === 'ASSET' && (i.freshness ?? 1) > 0
    );

    if (districtAssets.length > 0) {
      // Assets activate — resilience boost, positive feed
      bus.emit('metre.addResilience', {
        districtId: d.id,
        modifier: {
          source: 'asset', label: `Community networks activated (${districtAssets.length} assets)`,
          value: 3 * districtAssets.length, decay: 0, week: g.week,
        },
      });
      game.update(gs => {
        gs.feed.unshift({
          type: 'news', week: g.week,
          text: `${d.name}: Community networks activated. ${districtAssets.length} asset(s) deployed.`,
          districtId: d.id,
        });
        return gs;
      });
    } else if (d.lastVisited == null) {
      // Never visited — disorder spike, negative feed
      bus.emit('metre.addDisorder', {
        districtId: d.id,
        modifier: {
          source: 'disaster', label: 'No community contacts',
          value: 5, decay: -0.3, week: g.week,
        },
      });
      game.update(gs => {
        gs.feed.unshift({
          type: 'chatter', week: g.week,
          text: `${d.name}: No community coordinator. 911 overwhelmed. Residents on their own.`,
          districtId: d.id,
        });
        return gs;
      });
    }
  });
});

// ── 2.3: DM follow-ups on week end ──
bus.on('clock.weekEnd', ({ week }) => {
  game.update(g => {
    const blizzardStruck = week >= 44;

    g.dms.forEach(dm => {
      if (!dm.messages || dm.messages.length === 0) return;
      const d = districtMap[dm.districtId];
      if (!d || d.lastVisited == null) return;

      const weeksSinceVisit = week - d.lastVisited;
      const convo = CONVERSATIONS[dm.districtId];
      const charName = dm.characterName || convo?.character?.name || 'A resident';

      // Disaster-phase DMs
      if (blizzardStruck) {
        const assets = (g.insights || []).filter(
          i => i.districtId === dm.districtId && i.category === 'ASSET' && (i.freshness ?? 1) > 0
        );
        if (assets.length > 0) {
          dm.messages.push({ text: `We're activated. The network is holding. Thank you for listening.`, sent: false });
        } else {
          dm.messages.push({ text: `Nobody came. We're on our own out here.`, sent: false });
        }
        dm.unread = true;
        return;
      }

      // Regular follow-ups (only fire once per threshold)
      if (weeksSinceVisit === 2) {
        dm.messages.push({ text: `Any news on what we talked about? — ${charName}`, sent: false });
        dm.unread = true;
      } else if (weeksSinceVisit === 4) {
        dm.messages.push({ text: `Starting to feel like just another photo op. — ${charName}`, sent: false });
        dm.unread = true;
        // Disorder bump for neglect
        bus.emit('metre.addDisorder', {
          districtId: dm.districtId,
          modifier: { source: 'dm_neglect', label: `${charName} feels ignored`, value: 2, decay: -0.15, week },
        });
      }
    });

    return g;
  });
});

// ── 2.3b: DM acknowledgment when Bento policy targets a visited district ──
bus.on('bento.resolved', ({ targets }) => {
  if (!targets || targets.length === 0) return;
  const g = get(game);

  game.update(gs => {
    targets.forEach(districtId => {
      const dm = gs.dms.find(d => d.districtId === districtId);
      if (!dm || !dm.messages || dm.messages.length === 0) return;
      const convo = CONVERSATIONS[districtId];
      const charName = dm.characterName || convo?.character?.name || 'A resident';
      dm.messages.push({ text: `I heard about the policy. That's what we asked for. — ${charName}`, sent: false });
      dm.unread = true;
    });

    // Resilience bump for follow-through
    targets.forEach(districtId => {
      const d = districtMap[districtId];
      if (d && d.lastVisited != null) {
        bus.emit('metre.addResilience', {
          districtId,
          modifier: { source: 'policy_followthrough', label: 'Policy matched community request', value: 3, decay: -0.2, week: gs.week },
        });
      }
    });

    return gs;
  });
});

// ── 2.5: Per-district casualty calculation at game end ──
bus.on('clock.weekEnd', ({ week }) => {
  if (week < 44) return; // Only after blizzard

  const g = get(game);
  const insights = g.insights || [];
  const outcomes = {};

  DISTRICTS.forEach(d => {
    const resilience = metreSys.getResilience(d.id);
    const disorder = metreSys.getDisorder(d.id);
    const assetCount = insights.filter(
      i => i.districtId === d.id && i.category === 'ASSET' && (i.freshness ?? 1) > 0
    ).length;
    const assetBonus = assetCount >= 2 ? 100 : assetCount === 1 ? 50 : 0;

    const score = Math.round(resilience * 0.4 + (100 - disorder) * 0.3 + assetBonus * 0.3);
    let status, color;
    if (score >= 70) { status = 'Survived'; color = '#34d399'; }
    else if (score >= 40) { status = 'Damaged'; color = '#e8a83e'; }
    else { status = 'Critical'; color = '#ff2d2d'; }

    outcomes[d.id] = { name: d.name, boro: d.boro, score, status, color, resilience, disorder, assetCount };
  });

  // Push to state for GameEndOverlay
  game.update(gs => { gs.disasterOutcomes = outcomes; return gs; });
});

// ── Expose for debugging ──
if (typeof window !== 'undefined') {
  window.__bus = bus;
  window.__state = state;
  window.__scenarioSys = scenarioSys;
  window.__insightSys = insightSys;
  window.__interventionSys = interventionSys;
  window.__bentoSys = bentoSys;
  window.__metreSys = metreSys;
  window.__districts = DISTRICTS;
}
