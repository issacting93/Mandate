// systems/trust.js — TrustSystem with modifier stack
// Each district's trust = baseResilience + sum(named modifiers), clamped 0-100.
// Modifiers have source, label, value, decay rate, and optional expiry.
// This replaces the old single-integer trust model with a transparent, debuggable stack.

let _modId = 0;

// ── TrustModifierStack ─────────────────────────────────────────
// One stack per district. Holds base resilience + named modifiers.
export class TrustModifierStack {
  #base;
  #modifiers = [];

  constructor(base) {
    this.#base = base;
  }

  get base() { return this.#base; }
  get modifiers() { return [...this.#modifiers]; }

  get net() {
    const raw = this.#base + this.#modifiers.reduce((s, m) => s + m.value, 0);
    return clamp(Math.round(raw));
  }

  // Push a new modifier onto the stack. Returns the modifier with assigned id.
  push(mod) {
    const entry = { id: `mod_${++_modId}`, ...mod };
    this.#modifiers.push(entry);
    return entry;
  }

  // Remove a specific modifier by id
  remove(modId) {
    const idx = this.#modifiers.findIndex(m => m.id === modId);
    if (idx >= 0) return this.#modifiers.splice(idx, 1)[0];
    return null;
  }

  // Remove all modifiers matching a source
  removeBySource(source) {
    const removed = this.#modifiers.filter(m => m.source === source);
    this.#modifiers = this.#modifiers.filter(m => m.source !== source);
    return removed;
  }

  // Weekly tick: apply decay, remove expired/zeroed modifiers
  tick(currentWeek) {
    this.#modifiers = this.#modifiers.filter(m => {
      // Check expiry
      if (m.expiresWeek != null && currentWeek >= m.expiresWeek) return false;
      // Apply decay
      if (m.decay) {
        m.value += m.decay;
        // Remove if decayed past zero (crossed sign boundary or negligible)
        if (Math.abs(m.value) < 0.05) return false;
        // Positive mod decayed negative — remove
        if (m._sign > 0 && m.value <= 0) return false;
        // Negative mod decayed positive — remove
        if (m._sign < 0 && m.value >= 0) return false;
      }
      return true;
    });
  }

  // Query helpers
  bySource(source) { return this.#modifiers.filter(m => m.source === source); }
  byWeek(week) { return this.#modifiers.filter(m => m.week === week); }

  // Breakdown: { base, modifiers[], net } for UI/dashboard
  breakdown() {
    return {
      base: this.#base,
      modifiers: this.#modifiers.map(m => ({
        id: m.id,
        source: m.source,
        label: m.label,
        value: Math.round(m.value * 10) / 10,
        decay: m.decay || 0,
        week: m.week,
        expiresWeek: m.expiresWeek ?? null,
      })),
      net: this.net,
    };
  }

  toJSON() { return this.breakdown(); }
}


// ── TrustSystem ────────────────────────────────────────────────
// Manages modifier stacks for all districts. Listens to game events,
// pushes modifiers, and syncs net trust back to state.
export class TrustSystem {
  #bus;
  #state;
  #stacks = new Map(); // districtId -> TrustModifierStack
  #districtMeta;       // districtId -> { pop, bloc }

  constructor(bus, state, districtEntries) {
    this.#bus = bus;
    this.#state = state;
    this.#districtMeta = {};

    // Initialize a modifier stack per district
    const entries = Array.isArray(districtEntries)
      ? districtEntries
      : Object.values(districtEntries);

    for (const entry of entries) {
      if (entry.type !== 'district' && !entry.baseResilience) continue;
      const id = entry.id;
      const base = entry.baseResilience ?? 50;
      this.#stacks.set(id, new TrustModifierStack(base));
      this.#districtMeta[id] = {
        pop: entry.pop ?? 1,
        bloc: entry.bloc ?? null,
      };
    }

    // Event listeners
    bus.on('conversation.ended', (e) => this.#onConversation(e));
    bus.on('policy.resolved', (e) => this.#onPolicy(e));
    bus.on('post.scored', (e) => this.#onPost(e));
    bus.on('clock.weekEnd', (e) => this.#onWeekEnd(e));
    bus.on('clock.weekStart', () => this.#recomputeAggregates());

    // Direct modifier API — other systems can push modifiers via event
    bus.on('trust.addModifier', ({ districtId, modifier }) => {
      this.addModifier(districtId, modifier);
    });
  }

  // ── Public API ───────────────────────────────────────────

  // Push a modifier to a district's stack and sync trust
  addModifier(districtId, modifier) {
    const stack = this.#stacks.get(districtId);
    if (!stack) return null;

    // Tag with sign for decay-past-zero detection
    const mod = stack.push({
      ...modifier,
      _sign: modifier.value >= 0 ? 1 : -1,
    });

    this.#syncDistrict(districtId);
    return mod;
  }

  // Remove a specific modifier
  removeModifier(districtId, modId) {
    const stack = this.#stacks.get(districtId);
    if (!stack) return;
    stack.remove(modId);
    this.#syncDistrict(districtId);
  }

  // Get the full breakdown for one district
  getStack(districtId) {
    return this.#stacks.get(districtId)?.breakdown() ?? null;
  }

  // Get breakdowns for all districts
  getAllStacks() {
    const result = {};
    for (const [id, stack] of this.#stacks) {
      result[id] = stack.breakdown();
    }
    return result;
  }

  // Get net trust for a district
  getTrust(districtId) {
    return this.#stacks.get(districtId)?.net ?? 0;
  }

  // ── Event Handlers ───────────────────────────────────────

  #onConversation({ districtId, trustDelta, characterName }) {
    if (!districtId || !trustDelta) return;
    this.addModifier(districtId, {
      source: 'conversation',
      label: characterName ? `Listened to ${characterName}` : 'Community conversation',
      value: trustDelta,
      decay: -0.3,
      week: this.#state.get('week') || 1,
    });
  }

  #onPolicy({ policyId, label, targets, trustEffect }) {
    if (!trustEffect) return;
    const week = this.#state.get('week') || 1;

    // Targeted trust for specific districts
    if (targets && trustEffect.targeted) {
      for (const id of targets) {
        this.addModifier(id, {
          source: 'policy',
          label: label || policyId,
          value: trustEffect.targeted,
          decay: 0,
          week,
        });
      }
    }

    // Citywide bonus spread
    if (trustEffect.citywide) {
      for (const id of this.#stacks.keys()) {
        this.addModifier(id, {
          source: 'policy_citywide',
          label: label || policyId,
          value: trustEffect.citywide,
          decay: 0,
          week,
        });
      }
    }
  }

  #onPost({ groundingScore, perDistrictScores }) {
    const week = this.#state.get('week') || 1;

    if (perDistrictScores) {
      // Apply per-district trust from LLM scoring
      for (const [districtId, score] of Object.entries(perDistrictScores)) {
        if (!this.#stacks.has(districtId)) continue;
        const delta = score >= 5 ? Math.round(score / 3) : (score < 3 ? -1 : 0);
        if (delta === 0) continue;
        this.addModifier(districtId, {
          source: 'post',
          label: delta > 0 ? 'Grounded post resonated' : 'Hollow post fell flat',
          value: delta,
          decay: delta > 0 ? -0.5 : 0.25,
          week,
        });
      }
    } else if (groundingScore != null) {
      // Fallback: single grounding score, no per-district data
      const delta = groundingScore > 0.5 ? 2 : -1;
      for (const id of this.#stacks.keys()) {
        this.addModifier(id, {
          source: 'post',
          label: delta > 0 ? 'Grounded post' : 'Hollow post',
          value: delta * 0.3, // small citywide effect
          decay: delta > 0 ? -0.3 : 0.15,
          week,
        });
      }
    }
  }

  #onWeekEnd({ week }) {
    // 1. Tick all stacks (decay existing modifiers, expire old ones)
    for (const stack of this.#stacks.values()) {
      stack.tick(week + 1);
    }

    // 2. Add erosion modifiers for unvisited districts
    for (const [id, stack] of this.#stacks) {
      const lastVisited = this.#state.get(`districts.${id}.lastVisited`);
      if (lastVisited !== week) {
        stack.push({
          source: 'erosion',
          label: `Unvisited week ${week}`,
          value: -1,
          decay: 0,
          week,
          expiresWeek: week + 12, // erosion fades over time
          _sign: -1,
        });
      }
    }

    // 3. Recompute and sync all trust values
    this.#recomputeAggregates();
  }

  // ── Internal ─────────────────────────────────────────────

  #syncDistrict(districtId) {
    const stack = this.#stacks.get(districtId);
    if (!stack) return;
    const newValue = stack.net;
    const old = this.#state.get(`districts.${districtId}.trust`);
    if (old !== undefined) {
      this.#state.set(`districts.${districtId}.trust`, newValue);
    }
    this.#bus.emit('trust.updated', {
      districtId,
      delta: newValue - (old || 0),
      newValue,
      modifiers: stack.modifiers,
    });
  }

  #recomputeAggregates() {
    // Sync all district trust values from stacks
    for (const id of this.#stacks.keys()) {
      this.#syncDistrict(id);
    }

    // Citywide = population-weighted average
    let totalWeighted = 0, totalPop = 0;
    const blocTotals = {};
    const blocCounts = {};

    for (const [id, stack] of this.#stacks) {
      const trust = stack.net;
      const meta = this.#districtMeta[id] || {};
      const pop = meta.pop || 1;
      totalWeighted += trust * pop;
      totalPop += pop;

      const bloc = meta.bloc;
      if (bloc) {
        blocTotals[bloc] = (blocTotals[bloc] || 0) + trust;
        blocCounts[bloc] = (blocCounts[bloc] || 0) + 1;
      }
    }

    this.#state.set('citywide', totalPop > 0 ? Math.round(totalWeighted / totalPop) : 40);

    for (const [bloc, total] of Object.entries(blocTotals)) {
      this.#state.set(`blocs.${bloc}.trust`, Math.round(total / blocCounts[bloc]));
    }
  }
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
