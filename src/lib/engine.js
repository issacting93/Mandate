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
import { DepartmentSystem, DEPARTMENTS } from '$systems/department.js';
import { DealSystem } from '$systems/deal.js';
import { CommsBentoSystem } from '$systems/comms-bento.js';
import { SCENARIO_EVENTS } from '$data/scenarios.js';
import { CONVERSATIONS as CONVERSATIONS_V1 } from '$data/conversations.js';
import { CONVERSATIONS_V2 } from '$data/conversations_v2.js';
const CONVERSATIONS = { ...CONVERSATIONS_V1, ...CONVERSATIONS_V2 };
import { INTERVENTIONS } from '$data/interventions.js';
import { TILES, SYNERGIES, CONFLICTS } from '$data/tiles.js';
import { DISTRICTS, EDGES, districtMap, ACTION_COLORS, CONCERN_SCORES } from '$data/districts.js';
import { NYC_RUMORS } from '$data/nyc-rumors.js';
import { game, conversationActive, cinematicData, gameEndData, toastMessage, bentoActive, bentoState, commsActive, commsState } from '$lib/stores/game.js';
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
export const deptSys = new DepartmentSystem(bus, state);
export const dealSys = new DealSystem(bus, state, DISTRICTS, districtMap, deptSys);
export const commsSys = new CommsBentoSystem(bus, state, districtMap, CONCERN_SCORES);
bentoSys.setDepartmentSystem(deptSys);
insightSys.setGameStateAccessor(() => get(game));

// ── Conversations ──
export { CONVERSATIONS };

// (Legacy label handler removed — hex menu now uses toggleWanted)

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
  // Mark week as played — schedule cleared on advanceWeek
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
  const g = get(game);
  const hadVisits = g.schedule.some(s => s && s.districtId !== '_redeal');

  game.update(gs => {
    gs.weekStarted = false;
    gs.slotsTotal = 3;
    gs.schedule = [null, null, null];
    // Track consecutive empty weeks for rate limiting
    gs.consecutiveEmptyWeeks = hadVisits ? 0 : (gs.consecutiveEmptyWeeks || 0) + 1;
    // Reserve delta for StatusBar flash
    gs.reserveDelta = -0.08;
    return gs;
  });

  bus.emit('ui.weekAdvanced');

  // Clear delta flash after 2 seconds
  setTimeout(() => {
    game.update(gs => { gs.reserveDelta = null; return gs; });
  }, 2000);

  // Deal fresh hand for next week
  setTimeout(() => dealHand(), 100);
}

// ── Bridge: StateStore changes → Svelte game store ──
bus.on('state.changed', ({ path, newValue }) => {
  const topKey = path.split('.')[0];
  const syncKeys = ['week', 'reserve', 'weekStarted', 'insights', 'patterns', 'posts', 'feed', 'dms', 'schedule', 'heardAbout', 'thoughts', 'departments', 'doctrines'];
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
  if (path === 'departments') {
    game.update(g => { g.departments = newValue; return g; });
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

// ── Bridge: Comms Bento events ──
bus.on('comms.presented', (data) => { commsState.set(data); });
bus.on('comms.placed', (data) => { commsState.update(s => ({ ...s, evaluation: data.evaluation, grid: data.grid })); });
bus.on('comms.removed', (data) => { commsState.update(s => ({ ...s, evaluation: data.evaluation, grid: data.grid })); });
bus.on('comms.cleared', () => { commsState.update(s => ({ ...s, evaluation: commsSys.evaluate([]), grid: commsSys.getGrid().toGrid() })); });
bus.on('comms.resolved', (data) => {
  commsActive.set(false);
  showToast(`Statement published: ${data.scores.length} district(s) reached`, '#2A9E5C');
  // Push post into game state for feed display
  game.update(g => {
    g.posts.push(data.post);
    return g;
  });
});
bus.on('comms.resolveFailed', (data) => { showToast(`Cannot publish: ${data.reason}`, '#B82A18'); });

// ── Bridge: Doctrine bloc trust shifts ──
bus.on('doctrine.blocShift', ({ deptId, boost, penalty, boostAmount, penaltyAmount }) => {
  const doctrines = deptSys.getAllDoctrines();
  const currentBranch = doctrines[deptId]; // 'A' or 'B'
  
  // Count how many total departments have chosen this branch
  let count = 0;
  for (const b of Object.values(doctrines)) {
    if (b === currentBranch) {
      count++;
    }
  }

  // Diminishing returns: 1st doctrine: +3, 2nd: +2, 3rd+: +1
  let finalBoost = boostAmount;
  if (currentBranch) {
    if (count === 2) {
      finalBoost = Math.max(1, boostAmount - 1);
    } else if (count >= 3) {
      finalBoost = Math.max(1, boostAmount - 2);
    }
  }

  for (const d of DISTRICTS) {
    if (boost.includes(d.bloc)) {
      d.trust = Math.min(100, d.trust + finalBoost);
    }
    if (penalty.includes(d.bloc)) {
      d.trust = Math.max(0, d.trust - penaltyAmount);
    }
  }
  // Update citywide
  game.update(g => {
    g.citywide = Math.round(DISTRICTS.reduce((s, d) => s + d.trust, 0) / DISTRICTS.length);
    return g;
  });
});

bus.on('department.doctrineChosen', ({ deptId, doctrine }) => {
  showToast(`${doctrine.name} doctrine — ${DEPARTMENTS[deptId]?.label || deptId}`, DEPARTMENTS[deptId]?.color || '#999');
  game.update(g => {
    g.doctrines = deptSys.getAllDoctrines();
    return g;
  });
});

bus.on('department.doctrineSwitched', ({ deptId, doctrine, cost }) => {
  showToast(`Switched to ${doctrine.name} — $${cost}B, reset to level 2`, '#B82A18');
  game.update(g => {
    g.doctrines = deptSys.getAllDoctrines();
    g.departments = deptSys.getAllLevels();
    return g;
  });
});

// ── Bridge: Svelte UI actions → bus events ──
export function startGame() {
  bus.emit('game.start');
}

export function fundDepartment(deptId) {
  bus.emit('department.fund', { deptId });
}

export function defundDepartment(deptId) {
  bus.emit('department.defund', { deptId });
}

export function chooseDoctrine(deptId, branch) {
  bus.emit('department.chooseDoctrine', { deptId, branch });
}

export function switchDoctrine(deptId, branch) {
  bus.emit('department.switchDoctrine', { deptId, branch });
}

// ── Deal system ──
export function dealHand() {
  const g = get(game);
  const hand = dealSys.deal(g);
  game.update(gs => { gs.hand = hand; return gs; });
}

export function draftCard(districtId) {
  game.update(g => {
    const openIdx = g.schedule.indexOf(null);
    if (openIdx < 0) return g;
    const card = g.hand.find(c => c.districtId === districtId);
    if (!card) return g;
    g.schedule[openIdx] = { districtId, action: 'visit' };
    return g;
  });
}

export function undraftCard(slotIdx) {
  game.update(g => {
    g.schedule[slotIdx] = null;
    return g;
  });
}

export function redeal() {
  game.update(g => {
    // Re-deal costs 1 slot — fill a slot with null permanently
    const openSlots = g.schedule.filter(s => s === null).length;
    if (openSlots <= 0) return g;
    // Mark one slot as "spent" by reducing slotsTotal
    g.slotsTotal = Math.max(1, g.slotsTotal - 1);
    // Also null out the last open slot
    for (let i = g.schedule.length - 1; i >= 0; i--) {
      if (g.schedule[i] === null) {
        g.schedule[i] = { districtId: '_redeal', action: 'skip' };
        break;
      }
    }
    // Deal a fresh hand
    g.hand = dealSys.deal(g);
    return g;
  });
  showToast('Re-dealt — lost 1 slot', '#f59e0b');
}

export function toggleWanted(districtId) {
  game.update(g => {
    if (!g.wanted) g.wanted = [];
    const idx = g.wanted.indexOf(districtId);
    if (idx >= 0) {
      g.wanted.splice(idx, 1);
    } else {
      g.wanted.push(districtId);
    }
    return g;
  });
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

// ── Comms Bento ──
export function openComms() {
  commsActive.set(true);
  bus.emit('ui.commsOpen');
}

export function closeComms() {
  commsActive.set(false);
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
        const msg2 = `Any news on what we talked about? — ${charName}`;
        dm.messages.push({ text: msg2, sent: false });
        dm.unread = true;
        showToast(`${charName} sent you a message`, '#8b5cf6');
      } else if (weeksSinceVisit === 4) {
        const msg4 = `Starting to feel like just another photo op. — ${charName}`;
        dm.messages.push({ text: msg4, sent: false });
        dm.unread = true;
        showToast(`${charName}: "${msg4.split('—')[0].trim()}"`, '#e8a83e');
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

// ── Early neglect feed injection (week 3+) ──
bus.on('clock.weekStart', ({ week }) => {
  if (week === 3) {
    const visitedCount = DISTRICTS.filter(d => d.lastVisited !== null).length;
    if (visitedCount <= 3) {
      game.update(g => {
        g.feed.unshift({
          type: 'chatter', week,
          text: 'District leaders are asking: is the new mayor only going to visit once?',
        });
        return g;
      });
    }
  }
});

// ── Trust diffusion across transit graph (§5.2) ──
bus.on('clock.weekEnd', ({ week }) => {
  for (const [aId, bId] of EDGES) {
    const a = districtMap[aId];
    const b = districtMap[bId];
    if (!a || !b) continue;
    // High-trust districts boost neighbors (capped at +0.5/week)
    if (a.trust > 60) b.trust = Math.min(100, b.trust + 0.5);
    if (b.trust > 60) a.trust = Math.min(100, a.trust + 0.5);
    // Low-trust districts drag neighbors (capped at -0.5/week)
    if (a.trust < 30) b.trust = Math.max(0, b.trust - 0.5);
    if (b.trust < 30) a.trust = Math.max(0, a.trust - 0.5);
  }
  // Update citywide
  game.update(g => {
    g.citywide = Math.round(DISTRICTS.reduce((s, d) => s + d.trust, 0) / DISTRICTS.length);
    return g;
  });
});

// ── Feed intelligence gradient (§5.6) ──

bus.on('clock.weekEnd', ({ week }) => {
  // Generate 2-3 feed items from real NYC data, graded by district knowledge
  const feedDistricts = DISTRICTS
    .filter(() => Math.random() < 0.15) // ~3 districts per week
    .slice(0, 3);

  game.update(g => {
    for (const d of feedDistricts) {
      const concerns = CONCERN_SCORES[d.id] || {};
      const topDept = Object.entries(concerns).sort((a, b) => b[1] - a[1])[0]?.[0] || 'safety';
      const rumors = NYC_RUMORS[d.id]?.[topDept];
      if (!rumors) continue;

      let text;
      if (d.know >= 60 && rumors.tier3?.length) {
        text = rumors.tier3[Math.floor(Math.random() * rumors.tier3.length)];
      } else if (d.know >= 20 && rumors.tier2?.length) {
        text = rumors.tier2[Math.floor(Math.random() * rumors.tier2.length)];
      } else if (rumors.tier1?.length) {
        text = rumors.tier1[Math.floor(Math.random() * rumors.tier1.length)];
      }

      if (text) {
        g.feed.unshift({ type: 'chatter', week, text, districtId: d.id });
      }
    }
    return g;
  });
});

// ── Pattern events → feed + toast ──
bus.on('pattern.discovered', ({ category, text }) => {
  game.update(g => {
    g.feed.unshift({
      type: 'news', week: g.week,
      text: `Pattern forming: ${text}. Crystallizes in ~3 weeks.`,
    });
    return g;
  });
  showToast(`Pattern forming: ${category}`, '#8b5cf6');
});

bus.on('pattern.crystallized', ({ category, text }) => {
  game.update(g => {
    g.feed.unshift({
      type: 'news', week: g.week,
      text: `Pattern crystallized: ${text}. Department lens sharpened.`,
    });
    return g;
  });
  showToast(`${category} pattern crystallized — lens +1`, '#22c55e');
});

bus.on('pattern.abandoned', ({ category, cost, recookAfter }) => {
  showToast(`Abandoned ${category} pattern — $${cost}B`, '#ef4444');
});

// ── Initial deal ──
dealHand();

// ── Expose for debugging ──
if (typeof window !== 'undefined') {
  window.__bus = bus;
  window.__state = state;
  window.__scenarioSys = scenarioSys;
  window.__insightSys = insightSys;
  window.__interventionSys = interventionSys;
  window.__bentoSys = bentoSys;
  window.__metreSys = metreSys;
  window.__deptSys = deptSys;
  window.__dealSys = dealSys;
  window.__districts = DISTRICTS;
}
