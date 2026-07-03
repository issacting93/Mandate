// systems/insight.js — InsightSystem: freshness tracking, pattern detection, queries
// Listens to conversation.ended (gain insights) and clock.weekEnd (decay + patterns).
//
// Pattern crystallization (v0.8): Discovered patterns start "forming" and
// crystallize after COOK_TIME weeks. Crystallized patterns boost the matching
// department's effective level (+1) via the DepartmentSystem.getEffectiveLevel
// check on state.thoughts. Patterns can be abandoned at a reserve cost.
//
// NOTE: This system reads insights/patterns/thoughts from the Svelte game store
// via a getter function, not from the StateStore directly. This is because
// ConversationOverlay pushes insights directly to the game store.

const DECAY_RATE = 0.09;
const FRESH_THRESHOLD = 0.3;
const PATTERN_MIN_DISTRICTS = 3;
const COOK_TIME = 5; // weeks to crystallize
const ABANDON_RESERVE_COST = 0.3; // $B cost to abandon a crystallized pattern
const RECOOK_PENALTY = 3; // weeks before a new pattern of same category can start

export class InsightSystem {
  #bus;
  #state;
  #districtMap;
  #getGameState; // () => game store value

  constructor(bus, state, districtMap) {
    this.#bus = bus;
    this.#state = state;
    this.#districtMap = districtMap;
    this.#getGameState = null;

    bus.on('conversation.ended', (e) => this.#onConversationEnded(e));
    bus.on('clock.weekEnd', () => this.#onWeekEnd());
    bus.on('pattern.abandon', ({ category }) => this.#abandonPattern(category));
  }

  // Called from engine.js after game store is available
  setGameStateAccessor(fn) {
    this.#getGameState = fn;
  }

  // Access game state arrays — falls back to StateStore if accessor not set
  #insights() {
    if (this.#getGameState) return this.#getGameState().insights || [];
    return this.#state.get('insights') || [];
  }

  #patterns() {
    if (this.#getGameState) return this.#getGameState().patterns || [];
    return this.#state.get('patterns') || [];
  }

  #thoughts() {
    if (this.#getGameState) return this.#getGameState().thoughts || [];
    return this.#state.get('thoughts') || [];
  }

  #week() {
    if (this.#getGameState) return this.#getGameState().week || 1;
    return this.#state.get('week') || 1;
  }

  #onConversationEnded({ insights, districtId }) {
    if (!insights || !insights.length) return;
    for (const ins of insights) {
      this.#bus.emit('insight.gained', {
        districtId,
        category: ins.category,
        text: ins.text,
      });
    }
  }

  #onWeekEnd() {
    this.#decayFreshness();
    this.#detectPatterns();
    this.#cookPatterns();
  }

  #decayFreshness() {
    const insights = this.#insights();
    let staleCount = 0, deadCount = 0;
    for (const ins of insights) {
      if (ins.freshness <= 0) { deadCount++; continue; }
      ins.freshness = Math.max(0, +(ins.freshness - DECAY_RATE).toFixed(2));
      if (ins.freshness <= 0) deadCount++;
      else if (ins.freshness <= FRESH_THRESHOLD) staleCount++;
    }
    this.#bus.emit('insight.decayed', {
      staleCount,
      deadCount,
      total: insights.length,
    });
  }

  #detectPatterns() {
    const insights = this.#insights();
    const patterns = this.#patterns();
    const thoughts = this.#thoughts();
    const week = this.#week();

    const catDistricts = {};
    for (const ins of insights) {
      if (ins.freshness <= 0) continue;
      if (!catDistricts[ins.category]) catDistricts[ins.category] = new Set();
      catDistricts[ins.category].add(ins.districtId);
    }

    for (const [cat, districts] of Object.entries(catDistricts)) {
      if (districts.size < PATTERN_MIN_DISTRICTS) continue;
      // Skip if pattern already exists (forming, crystallized, or cooling)
      if (patterns.some(p => p.category === cat)) continue;
      // Skip if this category is in recook cooldown
      const abandoned = thoughts.find(t => t.category === cat && t.abandoned);
      if (abandoned && week < (abandoned.abandonedWeek + RECOOK_PENALTY)) continue;

      const districtNames = Array.from(districts).map(
        id => this.#districtMap[id]?.name || id
      );
      const pattern = {
        category: cat,
        districts: Array.from(districts),
        text: `Cross-district ${cat} pattern: ${districtNames.join(', ')}`,
        week,
        forming: true,
        crystallized: false,
        cookStart: week,
      };
      patterns.push(pattern);

      this.#bus.emit('pattern.discovered', pattern);
    }
  }

  // Advance cook-time on forming patterns; crystallize when ready
  #cookPatterns() {
    const patterns = this.#patterns();
    const thoughts = this.#thoughts();
    const week = this.#week();
    let changed = false;

    for (const pattern of patterns) {
      if (!pattern.forming || pattern.crystallized) continue;

      const cooked = week - pattern.cookStart;
      if (cooked >= COOK_TIME) {
        pattern.forming = false;
        pattern.crystallized = true;
        pattern.crystallizedWeek = week;
        changed = true;

        // Add to thoughts (used by DepartmentSystem.getEffectiveLevel for +1 bonus)
        thoughts.push({
          category: pattern.category,
          crystallized: true,
          week,
          text: pattern.text,
        });

        this.#bus.emit('pattern.crystallized', {
          category: pattern.category,
          text: pattern.text,
          districts: pattern.districts,
        });
      }
    }

    if (changed) {
      // Sync thoughts to state for department system
      this.#state.set('thoughts', thoughts);
    }
  }

  // Abandon a crystallized pattern — costly de-commit
  #abandonPattern(category) {
    const patterns = this.#patterns();
    const thoughts = this.#thoughts();
    const week = this.#week();

    const pattern = patterns.find(
      p => p.category === category && p.crystallized
    );
    if (!pattern) return;

    const reserve = this.#state.get('reserve') || 0;
    if (reserve < ABANDON_RESERVE_COST) {
      this.#bus.emit('pattern.abandonFailed', {
        category,
        reason: `Need $${ABANDON_RESERVE_COST}B reserve`,
      });
      return;
    }

    // Deduct cost
    this.#state.update('reserve', v => +(v - ABANDON_RESERVE_COST).toFixed(2));

    // Remove from patterns
    const idx = patterns.indexOf(pattern);
    if (idx >= 0) patterns.splice(idx, 1);

    // Mark thought as abandoned (blocks immediate re-cook)
    const thought = thoughts.find(
      t => t.category === category && t.crystallized
    );
    if (thought) {
      thought.crystallized = false;
      thought.abandoned = true;
      thought.abandonedWeek = week;
    }

    this.#state.set('thoughts', thoughts);

    this.#bus.emit('pattern.abandoned', {
      category,
      cost: ABANDON_RESERVE_COST,
      recookAfter: week + RECOOK_PENALTY,
    });
  }

  // ── Public queries ───────────────────────────────────────

  getFresh() {
    return this.#insights().filter(i => i.freshness > FRESH_THRESHOLD);
  }

  getStale() {
    return this.#insights().filter(i => i.freshness > 0 && i.freshness <= FRESH_THRESHOLD);
  }

  getDead() {
    return this.#insights().filter(i => i.freshness <= 0);
  }

  getByDistrict(districtId) {
    return this.#insights().filter(i => i.districtId === districtId);
  }

  getByCategory(category) {
    return this.#insights().filter(i => i.category === category);
  }

  countFreshByCategory(category) {
    const districts = new Set();
    for (const ins of this.#insights()) {
      if (ins.category === category && ins.freshness > FRESH_THRESHOLD) {
        districts.add(ins.districtId);
      }
    }
    return districts.size;
  }

  getPatterns() {
    return this.#patterns();
  }

  getCrystallizedPatterns() {
    return this.#patterns().filter(p => p.crystallized);
  }

  getFormingPatterns() {
    return this.#patterns().filter(p => p.forming && !p.crystallized);
  }
}
