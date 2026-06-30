// systems/metre.js — Dual Metre System: Resilience (Hope) + Disorder (Discontent)
//
// Frostpunk-inspired dual axes that replace the single trust integer.
//
// RESILIENCE (Hope): community's capacity to self-organize, share intel,
//   and survive crisis. Built through presence, listening, understanding,
//   and authentic communication. When the disaster hits, Resilience is the
//   difference between coordinated response and chaos.
//
// DISORDER (Discontent): political instability, unrest, institutional friction.
//   Rises from neglect, unpopular policies, heavy-handed interventions,
//   fiscal mismanagement, and media criticism. Max Disorder triggers political
//   crisis (strikes, gridlock, ouster) BEFORE the disaster even arrives.
//
// The knife's edge: some actions boost Resilience but spike Disorder (eminent
// domain shelters). Others calm Disorder but don't build Resilience (PR campaigns).
// You can never optimize both — every decision is a compromise.
//
// Both metres use modifier stacks (same architecture as the trust system):
// named modifiers with source, label, value, decay, and expiry.

let _modId = 0;

// ── ModifierStack ──────────────────────────────────────────────
// Reusable stack: works for both Resilience and Disorder.
export class ModifierStack {
  #base;
  #modifiers = [];
  #floor;
  #ceiling;

  constructor(base, floor = 0, ceiling = 100) {
    this.#base = base;
    this.#floor = floor;
    this.#ceiling = ceiling;
  }

  get base() { return this.#base; }
  get modifiers() { return [...this.#modifiers]; }

  get net() {
    const raw = this.#base + this.#modifiers.reduce((s, m) => s + m.value, 0);
    return Math.max(this.#floor, Math.min(this.#ceiling, Math.round(raw)));
  }

  push(mod) {
    const entry = {
      id: `mod_${++_modId}`,
      _sign: mod.value >= 0 ? 1 : -1,
      ...mod,
    };
    this.#modifiers.push(entry);
    return entry;
  }

  remove(modId) {
    const idx = this.#modifiers.findIndex(m => m.id === modId);
    if (idx >= 0) return this.#modifiers.splice(idx, 1)[0];
    return null;
  }

  removeBySource(source) {
    const removed = this.#modifiers.filter(m => m.source === source);
    this.#modifiers = this.#modifiers.filter(m => m.source !== source);
    return removed;
  }

  tick(currentWeek) {
    this.#modifiers = this.#modifiers.filter(m => {
      if (m.expiresWeek != null && currentWeek >= m.expiresWeek) return false;
      if (m.decay) {
        m.value += m.decay;
        if (Math.abs(m.value) < 0.05) return false;
        if (m._sign > 0 && m.value <= 0) return false;
        if (m._sign < 0 && m.value >= 0) return false;
      }
      return true;
    });
  }

  bySource(source) { return this.#modifiers.filter(m => m.source === source); }

  breakdown() {
    return {
      base: this.#base,
      modifiers: this.#modifiers.map(m => ({
        id: m.id, source: m.source, label: m.label,
        value: Math.round(m.value * 10) / 10,
        decay: m.decay || 0, week: m.week,
        expiresWeek: m.expiresWeek ?? null,
      })),
      net: this.net,
    };
  }

  toJSON() { return this.breakdown(); }
}


// ── DistrictMetres ─────────────────────────────────────────────
// Holds both stacks for one district.
class DistrictMetres {
  resilience; // ModifierStack
  disorder;   // ModifierStack

  constructor(baseResilience, baseDisorder = 15) {
    this.resilience = new ModifierStack(baseResilience, 0, 100);
    this.disorder = new ModifierStack(baseDisorder, 0, 100);
  }
}


// ── MetreSystem ────────────────────────────────────────────────
// Manages dual metres for all 19 districts. Listens to game events,
// pushes modifiers to appropriate stacks, syncs state, checks thresholds.
export class MetreSystem {
  #bus;
  #state;
  #districts = new Map(); // districtId -> DistrictMetres
  #meta = {};             // districtId -> { pop, bloc }

  constructor(bus, state, districtEntries) {
    this.#bus = bus;
    this.#state = state;

    const entries = Array.isArray(districtEntries)
      ? districtEntries
      : Object.values(districtEntries);

    for (const entry of entries) {
      if (entry.type !== 'district' && !entry.baseResilience) continue;
      const id = entry.id;
      // Disorder starts low — you're new, they're watching, not angry yet
      const baseDisorder = entry.baseDisorder ?? 15;
      this.#districts.set(id, new DistrictMetres(entry.baseResilience ?? 50, baseDisorder));
      this.#meta[id] = { pop: entry.pop ?? 1, bloc: entry.bloc ?? null };
    }

    // ── Event Listeners ──────────────────────────────────────
    bus.on('conversation.ended', (e) => this.#onConversation(e));
    bus.on('policy.resolved', (e) => this.#onPolicy(e));
    bus.on('post.scored', (e) => this.#onPost(e));
    bus.on('clock.weekEnd', (e) => this.#onWeekEnd(e));
    bus.on('clock.weekStart', () => this.#recomputeAggregates());

    // Direct modifier API
    bus.on('metre.addResilience', ({ districtId, modifier }) => {
      this.addResilience(districtId, modifier);
    });
    bus.on('metre.addDisorder', ({ districtId, modifier }) => {
      this.addDisorder(districtId, modifier);
    });

    // Bento box resolution
    bus.on('bento.resolved', (e) => this.#onBentoResolved(e));
  }

  // ── Public API ───────────────────────────────────────────

  addResilience(districtId, modifier) {
    const dm = this.#districts.get(districtId);
    if (!dm) return null;
    const mod = dm.resilience.push({ ...modifier, _sign: modifier.value >= 0 ? 1 : -1 });
    this.#syncDistrict(districtId);
    return mod;
  }

  addDisorder(districtId, modifier) {
    const dm = this.#districts.get(districtId);
    if (!dm) return null;
    const mod = dm.disorder.push({ ...modifier, _sign: modifier.value >= 0 ? 1 : -1 });
    this.#syncDistrict(districtId);
    return mod;
  }

  getMetres(districtId) {
    const dm = this.#districts.get(districtId);
    if (!dm) return null;
    return {
      resilience: dm.resilience.breakdown(),
      disorder: dm.disorder.breakdown(),
    };
  }

  getAllMetres() {
    const result = {};
    for (const [id, dm] of this.#districts) {
      result[id] = {
        resilience: dm.resilience.breakdown(),
        disorder: dm.disorder.breakdown(),
      };
    }
    return result;
  }

  getResilience(districtId) {
    return this.#districts.get(districtId)?.resilience.net ?? 0;
  }

  getDisorder(districtId) {
    return this.#districts.get(districtId)?.disorder.net ?? 0;
  }

  // ── Event Handlers ───────────────────────────────────────

  #onConversation({ districtId, trustDelta, characterName, depth }) {
    if (!districtId) return;
    const week = this.#state.get('week') || 1;
    const rDelta = trustDelta || (2 + (depth || 0));

    // Listening builds Resilience
    this.addResilience(districtId, {
      source: 'conversation',
      label: characterName ? `Listened to ${characterName}` : 'Community conversation',
      value: rDelta,
      decay: -0.3,
      week,
    });

    // Presence reduces Disorder (people feel heard)
    this.addDisorder(districtId, {
      source: 'conversation',
      label: characterName ? `Mayor met ${characterName}` : 'Mayor visited',
      value: -(rDelta * 0.5), // calming effect
      decay: 0.15,            // disorder recovers slowly
      week,
    });
  }

  #onPolicy({ policyId, label, targets, trustEffect, disorderEffect, tier }) {
    const week = this.#state.get('week') || 1;

    // Resilience effects
    if (trustEffect) {
      if (targets && trustEffect.targeted) {
        for (const id of targets) {
          this.addResilience(id, {
            source: 'policy', label: label || policyId,
            value: trustEffect.targeted, decay: 0, week,
          });
        }
      }
      if (trustEffect.citywide) {
        for (const id of this.#districts.keys()) {
          this.addResilience(id, {
            source: 'policy_citywide', label: label || policyId,
            value: trustEffect.citywide, decay: 0, week,
          });
        }
      }
    }

    // Disorder effects — policies have political costs
    if (disorderEffect) {
      if (targets && disorderEffect.targeted) {
        for (const id of targets) {
          this.addDisorder(id, {
            source: 'policy', label: `${label || policyId} (political cost)`,
            value: disorderEffect.targeted, decay: -0.2, week,
          });
        }
      }
      if (disorderEffect.citywide) {
        for (const id of this.#districts.keys()) {
          this.addDisorder(id, {
            source: 'policy_citywide', label: `${label || policyId} (political cost)`,
            value: disorderEffect.citywide, decay: -0.2, week,
          });
        }
      }
    } else if (tier === 'generic') {
      // Generic (uninformed) policies generate mild disorder citywide
      // "The mayor is throwing money without understanding the problem"
      for (const id of this.#districts.keys()) {
        this.addDisorder(id, {
          source: 'generic_policy',
          label: `Generic intervention: ${label || policyId}`,
          value: 1.5,
          decay: -0.1,
          week,
        });
      }
    }
  }

  #onPost({ groundingScore, perDistrictScores }) {
    const week = this.#state.get('week') || 1;

    if (perDistrictScores) {
      for (const [districtId, score] of Object.entries(perDistrictScores)) {
        if (!this.#districts.has(districtId)) continue;

        // Grounded posts build Resilience AND calm Disorder
        if (score >= 5) {
          const rDelta = Math.round(score / 3);
          this.addResilience(districtId, {
            source: 'post', label: 'Grounded post resonated',
            value: rDelta, decay: -0.5, week,
          });
          this.addDisorder(districtId, {
            source: 'post', label: 'Authentic communication',
            value: -1, decay: 0.1, week,
          });
        }

        // Hollow posts spike Disorder (ratio'd, perceived as out-of-touch)
        if (score < 3) {
          this.addDisorder(districtId, {
            source: 'post', label: 'Hollow post — ratio\'d',
            value: 2, decay: -0.15, week,
          });
          this.addResilience(districtId, {
            source: 'post', label: 'Empty rhetoric erodes trust',
            value: -0.5, decay: 0.1, week,
          });
        }
      }
    }
  }

  #onBentoResolved({ tiles, synergies, conflicts, targets, effects }) {
    const week = this.#state.get('week') || 1;

    // Synergies boost Resilience in targeted districts
    for (const syn of (synergies || [])) {
      for (const id of (targets || [])) {
        this.addResilience(id, {
          source: 'bento_synergy',
          label: syn.label || 'Policy synergy',
          value: syn.resilienceBonus || 3,
          decay: 0, week,
        });
      }
    }

    // Conflicts spike Disorder
    for (const con of (conflicts || [])) {
      for (const id of this.#districts.keys()) {
        this.addDisorder(id, {
          source: 'bento_conflict',
          label: con.label || 'Policy conflict',
          value: con.disorderCost || 4,
          decay: -0.2, week,
        });
      }
    }

    // Apply direct effects
    for (const eff of (effects || [])) {
      if (eff.resilience) {
        for (const id of (eff.targets || targets || [])) {
          this.addResilience(id, {
            source: 'bento', label: eff.label || 'Policy effect',
            value: eff.resilience, decay: 0, week,
          });
        }
      }
      if (eff.disorder) {
        for (const id of (eff.targets || [])) {
          this.addDisorder(id, {
            source: 'bento', label: eff.label || 'Policy effect',
            value: eff.disorder, decay: -0.15, week,
          });
        }
      }
    }
  }

  #onWeekEnd({ week }) {
    for (const [id, dm] of this.#districts) {
      // 1. Tick both stacks (decay + expire)
      dm.resilience.tick(week + 1);
      dm.disorder.tick(week + 1);

      // 2. Erosion: unvisited districts lose Resilience AND gain Disorder
      const lastVisited = this.#state.get(`districts.${id}.lastVisited`);
      if (lastVisited !== week) {
        dm.resilience.push({
          source: 'erosion', label: `Unvisited week ${week}`,
          value: -1, decay: 0, week, expiresWeek: week + 12, _sign: -1,
        });
        // Neglect breeds discontent — but slower than erosion
        dm.disorder.push({
          source: 'neglect', label: `No contact week ${week}`,
          value: 0.5, decay: -0.05, week, expiresWeek: week + 16, _sign: 1,
        });
      }
    }

    this.#recomputeAggregates();
  }

  // ── Sync & Aggregation ───────────────────────────────────

  #syncDistrict(districtId) {
    const dm = this.#districts.get(districtId);
    if (!dm) return;

    const resilience = dm.resilience.net;
    const disorder = dm.disorder.net;

    // Write to state
    const oldR = this.#state.get(`districts.${districtId}.trust`);
    if (oldR !== undefined) {
      this.#state.set(`districts.${districtId}.trust`, resilience);
    }
    this.#state.set(`districts.${districtId}.disorder`, disorder);

    // Emit for UI
    this.#bus.emit('trust.updated', {
      districtId,
      delta: resilience - (oldR || 0),
      newValue: resilience,
    });
    this.#bus.emit('metre.updated', {
      districtId, resilience, disorder,
      resilienceModifiers: dm.resilience.modifiers,
      disorderModifiers: dm.disorder.modifiers,
    });
  }

  #recomputeAggregates() {
    for (const id of this.#districts.keys()) {
      this.#syncDistrict(id);
    }

    let totalWeightedR = 0, totalWeightedD = 0, totalPop = 0;
    const blocTotals = {};
    const blocCounts = {};

    for (const [id, dm] of this.#districts) {
      const r = dm.resilience.net;
      const d = dm.disorder.net;
      const meta = this.#meta[id] || {};
      const pop = meta.pop || 1;

      totalWeightedR += r * pop;
      totalWeightedD += d * pop;
      totalPop += pop;

      const bloc = meta.bloc;
      if (bloc) {
        if (!blocTotals[bloc]) blocTotals[bloc] = { r: 0, d: 0 };
        if (!blocCounts[bloc]) blocCounts[bloc] = 0;
        blocTotals[bloc].r += r;
        blocTotals[bloc].d += d;
        blocCounts[bloc]++;
      }
    }

    const citywideR = totalPop > 0 ? Math.round(totalWeightedR / totalPop) : 40;
    const citywideD = totalPop > 0 ? Math.round(totalWeightedD / totalPop) : 15;

    this.#state.set('citywide', citywideR);
    this.#state.set('citywideDisorder', citywideD);

    for (const [bloc, totals] of Object.entries(blocTotals)) {
      const count = blocCounts[bloc];
      this.#state.set(`blocs.${bloc}.trust`, Math.round(totals.r / count));
      this.#state.set(`blocs.${bloc}.disorder`, Math.round(totals.d / count));
    }

    // Emit aggregate update
    this.#bus.emit('metre.aggregateUpdated', {
      citywide: { resilience: citywideR, disorder: citywideD },
    });
  }
}
