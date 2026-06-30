// systems/scenario.js — ScenarioSystem: Paradox-style condition/effect DSL
// Evaluates scenario events each week using a rich condition language with
// AND/OR/NOT combinators, scoped targeting, and event chains.
//
// Conditions: temporal, trust, resource, flag, insight, district, policy, combinators
// Effects: trust modifiers, reserve, flags, feed items, knowledge, queued events
// Pools: multiple events per pool, one selected randomly per evaluation
// Chains: effects can queue future events with a delay

export class ScenarioSystem {
  #bus;
  #state;
  #districtMap;
  #events;
  #fired = new Set();
  #queued = [];    // { eventId, firesAtWeek }

  constructor(bus, state, districtMap, events) {
    this.#bus = bus;
    this.#state = state;
    this.#districtMap = districtMap;
    this.#events = events;

    bus.on('clock.weekStart', ({ week }) => this.#evaluate(week));
  }

  // ── Public API ───────────────────────────────────────────

  // Add events at runtime (e.g., loaded from authoring tool)
  addEvents(events) {
    this.#events.push(...events);
  }

  // Get all events and their status
  getEventStatus() {
    return this.#events.map(e => ({
      id: e.id,
      headline: e.headline,
      phase: e.phase,
      pool: e.pool,
      fired: this.#fired.has(e.id),
    }));
  }

  // Check if a specific event has fired
  hasFired(eventId) {
    return this.#fired.has(eventId);
  }

  // Manually fire an event (for testing/debugging)
  fireEvent(eventId) {
    const evt = this.#events.find(e => e.id === eventId);
    if (evt) this.#triggerEvent(evt);
  }

  // ── Core Evaluation Loop ─────────────────────────────────

  #evaluate(week) {
    const ctx = this.#buildContext(week);

    // 1. Fire any queued events whose time has come
    const ready = this.#queued.filter(q => q.firesAtWeek <= week);
    this.#queued = this.#queued.filter(q => q.firesAtWeek > week);
    for (const q of ready) {
      const evt = this.#events.find(e => e.id === q.eventId);
      if (evt && !this.#fired.has(evt.id)) {
        this.#triggerEvent(evt);
      }
    }

    // 2. Group events by pool for random selection
    const pooled = new Map();  // pool -> [event]
    const unpooled = [];

    for (const evt of this.#events) {
      if (this.#fired.has(evt.id) && !evt.repeatable) continue;
      if (!this.#checkConditions(evt.conditions, ctx)) continue;

      if (evt.pool) {
        if (!pooled.has(evt.pool)) pooled.set(evt.pool, []);
        pooled.get(evt.pool).push(evt);
      } else {
        unpooled.push(evt);
      }
    }

    // 3. Sort unpooled by priority (higher first)
    unpooled.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // 4. Fire unpooled events
    for (const evt of unpooled) {
      this.#triggerEvent(evt);
    }

    // 5. For each pool, pick one event randomly (weighted by priority)
    for (const [, poolEvents] of pooled) {
      const selected = this.#weightedRandom(poolEvents);
      if (selected) this.#triggerEvent(selected);
    }
  }

  #triggerEvent(evt) {
    this.#fired.add(evt.id);

    // Apply effects
    if (evt.effects) {
      for (const eff of evt.effects) {
        this.#applyEffect(eff);
      }
    }

    // Queue chained events
    if (evt.chains) {
      const currentWeek = this.#state.get('week') || 0;
      for (const chain of evt.chains) {
        this.#queued.push({
          eventId: chain.eventId,
          firesAtWeek: currentWeek + chain.delay,
        });
      }
    }

    this.#bus.emit('scenario.triggered', {
      eventId: evt.id,
      headline: evt.headline,
      narrative: evt.narrative,
      phase: evt.phase,
    });
  }

  // ── Context Builder ──────────────────────────────────────

  #buildContext(week) {
    const gs = typeof this.#state.get === 'function'
      ? this.#state
      : this.#state; // support both StateStore and raw gameState

    const get = (path) => {
      if (typeof gs.get === 'function') return gs.get(path);
      return path.split('.').reduce((o, k) => o?.[k], gs);
    };

    // Build district trust + disorder map
    const districts = {};
    if (this.#districtMap) {
      for (const [id, d] of Object.entries(this.#districtMap)) {
        districts[id] = {
          trust: d.trust ?? get(`districts.${id}.trust`) ?? 40,
          disorder: d.disorder ?? get(`districts.${id}.disorder`) ?? 15,
          know: d.know ?? 0,
          lastVisited: d.lastVisited ?? null,
          bloc: d.bloc ?? null,
        };
      }
    }

    return {
      week,
      citywide: get('citywide') ?? 40,
      citywideDisorder: get('citywideDisorder') ?? 15,
      reserve: get('reserve') ?? 5.0,
      flags: get('flags') || [],
      insights: get('insights') || [],
      patterns: get('patterns') || [],
      policies: get('policies') || [],
      districts,
    };
  }

  // ── Condition Evaluator ──────────────────────────────────

  #checkConditions(conditions, ctx) {
    if (!conditions || conditions.length === 0) return true;
    // Default: ALL conditions must be true (implicit AND)
    return conditions.every(c => this.#evalCondition(c, ctx));
  }

  #evalCondition(cond, ctx) {
    switch (cond.type) {

      // ── Temporal ──────────────────────────────────
      case 'week':
        return ctx.week === cond.value;

      case 'weekRange':
        return ctx.week >= (cond.min || 0) && ctx.week <= (cond.max || 48);

      case 'weekAfter':
        return ctx.week > cond.value;

      case 'weekBefore':
        return ctx.week < cond.value;

      // ── Trust ─────────────────────────────────────
      case 'trustBelow':
        return this.#evalTrustCondition(ctx, cond, (trust, val) => trust < val);

      case 'trustAbove':
        return this.#evalTrustCondition(ctx, cond, (trust, val) => trust >= val);

      // ── Disorder (dual metre) ────────────────────
      case 'disorderAbove':
        return this.#evalDisorderCondition(ctx, cond, (d, val) => d >= val);

      case 'disorderBelow':
        return this.#evalDisorderCondition(ctx, cond, (d, val) => d < val);

      // ── Resources ─────────────────────────────────
      case 'reserveBelow':
        return ctx.reserve < cond.value;

      case 'reserveAbove':
        return ctx.reserve >= cond.value;

      // ── Flags ─────────────────────────────────────
      case 'flag':
        return ctx.flags.includes(cond.value);

      case 'notFlag':
        return !ctx.flags.includes(cond.value);

      // ── Knowledge ─────────────────────────────────
      case 'insightCount':
        return ctx.insights.length >= cond.value;

      case 'insightCategory':
        return ctx.insights.filter(i => i.category === cond.category).length >= (cond.count || 1);

      case 'patternExists':
        return ctx.patterns.some(p => p.category === cond.category);

      // ── District ──────────────────────────────────
      case 'districtVisited':
        return ctx.districts[cond.district]?.lastVisited != null;

      case 'districtNotVisited':
        return ctx.districts[cond.district]?.lastVisited == null;

      case 'visitedCount': {
        const count = Object.values(ctx.districts).filter(d => d.lastVisited != null).length;
        return count >= cond.value;
      }

      // ── Policy ────────────────────────────────────
      case 'policyActive':
        return ctx.policies.some(p => p.id === cond.value);

      // ── Combinators ───────────────────────────────
      case 'AND':
        return (cond.conditions || []).every(c => this.#evalCondition(c, ctx));

      case 'OR':
        return (cond.conditions || []).some(c => this.#evalCondition(c, ctx));

      case 'NOT':
        return cond.condition ? !this.#evalCondition(cond.condition, ctx) : true;

      default:
        console.warn(`ScenarioSystem: unknown condition type '${cond.type}'`);
        return false;
    }
  }

  #evalTrustCondition(ctx, cond, comparator) {
    const val = cond.value;
    const scope = cond.scope || (cond.district ? 'district' : 'citywide');

    switch (scope) {
      case 'citywide':
        return comparator(ctx.citywide, val);
      case 'district':
        return cond.district ? comparator(ctx.districts[cond.district]?.trust || 0, val) : false;
      case 'any':
        return Object.values(ctx.districts).some(d => comparator(d.trust, val));
      case 'all':
        return Object.values(ctx.districts).every(d => comparator(d.trust, val));
      default:
        return false;
    }
  }

  #evalDisorderCondition(ctx, cond, comparator) {
    const val = cond.value;
    const scope = cond.scope || (cond.district ? 'district' : 'citywide');

    switch (scope) {
      case 'citywide':
        return comparator(ctx.citywideDisorder || 0, val);
      case 'district':
        return cond.district ? comparator(ctx.districts[cond.district]?.disorder || 0, val) : false;
      case 'any':
        return Object.values(ctx.districts).some(d => comparator(d.disorder || 0, val));
      case 'all':
        return Object.values(ctx.districts).every(d => comparator(d.disorder || 0, val));
      default:
        return false;
    }
  }

  // ── Effect Applier ───────────────────────────────────────

  #applyEffect(effect) {
    switch (effect.type) {

      case 'trust': {
        // Direct trust delta on a specific district
        const d = this.#districtMap[effect.district];
        if (d) {
          d.trust = clamp(d.trust + effect.delta);
          this.#bus.emit('trust.updated', {
            districtId: effect.district,
            delta: effect.delta,
            newValue: d.trust,
          });
        }
        break;
      }

      case 'trustScope': {
        // Scoped trust: apply modifier to districts matching scope
        const targets = this.#resolveScope(effect);
        for (const id of targets) {
          const mod = effect.modifier || {
            source: 'scenario',
            label: 'Scenario event',
            value: effect.delta || 0,
            decay: 0,
          };
          this.#bus.emit('trust.addModifier', {
            districtId: id,
            modifier: { ...mod, week: this.#state.get('week') || 0 },
          });
        }
        break;
      }

      case 'addModifier': {
        // Push a modifier directly to a district
        if (effect.district && effect.modifier) {
          this.#bus.emit('trust.addModifier', {
            districtId: effect.district,
            modifier: { ...effect.modifier, week: this.#state.get('week') || 0 },
          });
        }
        break;
      }

      case 'reserve': {
        const gs = this.#getGameState();
        if (gs) {
          gs.reserve = +(gs.reserve + effect.delta).toFixed(2);
        }
        break;
      }

      case 'flag': {
        const gs = this.#getGameState();
        if (gs) {
          if (!gs.flags) gs.flags = [];
          if (!gs.flags.includes(effect.value)) gs.flags.push(effect.value);
        }
        break;
      }

      case 'removeFlag': {
        const gs = this.#getGameState();
        if (gs && gs.flags) {
          gs.flags = gs.flags.filter(f => f !== effect.value);
        }
        break;
      }

      case 'feed_item':
        this.#bus.emit('feed.item', {
          text: effect.text,
          type: effect.feedType || 'news',
        });
        break;

      case 'disorder': {
        // Direct disorder delta on a specific district
        if (effect.district) {
          this.#bus.emit('metre.addDisorder', {
            districtId: effect.district,
            modifier: {
              source: 'scenario', label: 'Scenario event',
              value: effect.delta || 0, decay: effect.decay || -0.15,
              week: this.#state.get('week') || 0,
            },
          });
        }
        break;
      }

      case 'disorderScope': {
        // Scoped disorder: apply to districts matching scope
        const targets = this.#resolveScope(effect);
        for (const id of targets) {
          this.#bus.emit('metre.addDisorder', {
            districtId: id,
            modifier: {
              source: 'scenario', label: effect.label || 'Scenario event',
              value: effect.delta || 0, decay: effect.decay || -0.15,
              week: this.#state.get('week') || 0,
            },
          });
        }
        break;
      }

      case 'knowledge': {
        // Modify district knowledge
        const d = this.#districtMap[effect.district];
        if (d) {
          d.know = clamp(d.know + (effect.delta || 0));
        }
        break;
      }

      case 'queueEvent': {
        // Queue a future event
        const week = this.#state.get('week') || 0;
        this.#queued.push({
          eventId: effect.eventId,
          firesAtWeek: week + (effect.delay || 1),
        });
        break;
      }

      default:
        console.warn(`ScenarioSystem: unknown effect type '${effect.type}'`);
    }
  }

  // ── Scope Resolver ───────────────────────────────────────
  // Resolves a scope descriptor to a list of district IDs

  #resolveScope(effect) {
    const districts = this.#districtMap;
    if (!districts) return [];

    const entries = Object.entries(districts);
    const scope = effect.scope || 'all';

    switch (scope) {
      case 'all':
        return entries.map(([id]) => id);

      case 'lowest_trust':
        return entries
          .sort(([, a], [, b]) => (a.trust || 0) - (b.trust || 0))
          .slice(0, effect.count || 1)
          .map(([id]) => id);

      case 'highest_trust':
        return entries
          .sort(([, a], [, b]) => (b.trust || 0) - (a.trust || 0))
          .slice(0, effect.count || 1)
          .map(([id]) => id);

      case 'all_below':
        return entries
          .filter(([, d]) => (d.trust || 0) < (effect.threshold || 40))
          .map(([id]) => id);

      case 'all_above':
        return entries
          .filter(([, d]) => (d.trust || 0) >= (effect.threshold || 60))
          .map(([id]) => id);

      case 'bloc':
        return entries
          .filter(([, d]) => d.bloc === effect.bloc)
          .map(([id]) => id);

      case 'visited':
        return entries
          .filter(([, d]) => d.lastVisited != null)
          .map(([id]) => id);

      case 'unvisited':
        return entries
          .filter(([, d]) => d.lastVisited == null)
          .map(([id]) => id);

      default:
        return [];
    }
  }

  // ── Helpers ──────────────────────────────────────────────

  #getGameState() {
    if (typeof this.#state.get === 'function') {
      return this.#state.get('');
    }
    return this.#state;
  }

  #weightedRandom(events) {
    if (events.length === 0) return null;
    const weights = events.map(e => (e.priority || 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < events.length; i++) {
      r -= weights[i];
      if (r <= 0) return events[i];
    }
    return events[events.length - 1];
  }
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
