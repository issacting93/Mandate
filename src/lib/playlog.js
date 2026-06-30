// playlog.js — Records every game event for playtest analysis and save/export
// Subscribes to the EventBus and logs all events with timestamps.
// Export as JSON for replay analysis or bug reporting.

import { bus } from '$lib/engine.js';
import { get } from 'svelte/store';
import { game } from '$lib/stores/game.js';
import { DISTRICTS } from '$data/districts.js';

const log = [];
const startTime = Date.now();

// ── Record every bus event ──
const ALL_EVENTS = [
  'game.start',
  'clock.weekStart', 'clock.weekEnd',
  'engagement.started',
  'conversation.ended',
  'post.scored',
  'scenario.triggered',
  'bento.resolved', 'bento.resolveFailed',
  'metre.aggregateUpdated',
  'state.changed',
  'game.win', 'game.lose',
];

ALL_EVENTS.forEach(channel => {
  bus.on(channel, (data) => {
    // Skip noisy state.changed events for non-essential paths
    if (channel === 'state.changed') {
      const skip = ['citywide', 'citywideDisorder', 'weekStarted'];
      if (skip.includes(data.path)) return;
    }

    log.push({
      t: Date.now() - startTime,
      event: channel,
      week: get(game).week,
      data: sanitize(data),
    });
  });
});

// ── Also log UI actions that don't go through the bus ──
export function logAction(action, detail = {}) {
  log.push({
    t: Date.now() - startTime,
    event: `ui.${action}`,
    week: get(game).week,
    data: detail,
  });
}

// Strip circular refs and large objects
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === '_ts' || k === 'channel') continue;
    if (typeof v === 'function') continue;
    if (Array.isArray(v) && v.length > 10) {
      clean[k] = `[${v.length} items]`;
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = sanitize(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

// ── Snapshot the full game state ──
function snapshot() {
  const g = get(game);
  return {
    week: g.week,
    reserve: g.reserve,
    resilience: Math.round(DISTRICTS.reduce((s, d) => s + d.trust, 0) / DISTRICTS.length),
    disorder: g.citywideDisorder ?? 0,
    insightCount: g.insights?.length ?? 0,
    patternCount: g.patterns?.length ?? 0,
    postCount: g.posts?.length ?? 0,
    visitedDistricts: DISTRICTS.filter(d => d.lastVisited != null).map(d => d.id),
    schedule: g.schedule,
    labels: g.labels,
    districts: DISTRICTS.map(d => ({
      id: d.id, trust: d.trust, know: d.know, lastVisited: d.lastVisited,
    })),
  };
}

// ── Export the full playlog ──
export function exportPlaylog() {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    duration: Date.now() - startTime,
    finalState: snapshot(),
    events: log,
    summary: {
      totalEvents: log.length,
      weeksPlayed: get(game).week,
      conversationsHad: log.filter(e => e.event === 'conversation.ended').length,
      postsPublished: log.filter(e => e.event === 'post.scored').length,
      scenariosFired: log.filter(e => e.event === 'scenario.triggered').length,
      policiesResolved: log.filter(e => e.event === 'bento.resolved').length,
    },
  };

  return data;
}

// ── Download as JSON file ──
export function downloadPlaylog() {
  const data = exportPlaylog();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mandate-playlog-wk${data.finalState.week}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return data;
}

// ── Console access ──
if (typeof window !== 'undefined') {
  window.__playlog = { log, exportPlaylog, downloadPlaylog, snapshot };
}
