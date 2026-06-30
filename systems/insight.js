// systems/insight.js — InsightSystem: freshness tracking, pattern detection, queries
// Listens to conversation.ended (gain insights) and clock.weekEnd (decay + patterns).

const DECAY_RATE = 0.12;
const FRESH_THRESHOLD = 0.3;
const PATTERN_MIN_DISTRICTS = 3;

export class InsightSystem {
  #bus;
  #gameState;
  #districtMap;

  constructor(bus, gameState, districtMap) {
    this.#bus = bus;
    this.#gameState = gameState;
    this.#districtMap = districtMap;

    bus.on('conversation.ended', (e) => this.#onConversationEnded(e));
    bus.on('clock.weekEnd', () => this.#onWeekEnd());
  }

  #onConversationEnded({ insights, districtId }) {
    if (!insights || !insights.length) return;
    for (const ins of insights) {
      // Insight may already be in gameState (pushed by shell for immediate UI).
      // Only emit the event for downstream listeners.
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
  }

  #decayFreshness() {
    let staleCount = 0, deadCount = 0;
    for (const ins of this.#gameState.insights) {
      if (ins.freshness <= 0) { deadCount++; continue; }
      ins.freshness = Math.max(0, +(ins.freshness - DECAY_RATE).toFixed(2));
      if (ins.freshness <= 0) deadCount++;
      else if (ins.freshness <= FRESH_THRESHOLD) staleCount++;
    }
    this.#bus.emit('insight.decayed', {
      staleCount,
      deadCount,
      total: this.#gameState.insights.length,
    });
  }

  #detectPatterns() {
    const catDistricts = {};
    for (const ins of this.#gameState.insights) {
      if (ins.freshness <= 0) continue;
      if (!catDistricts[ins.category]) catDistricts[ins.category] = new Set();
      catDistricts[ins.category].add(ins.districtId);
    }

    for (const [cat, districts] of Object.entries(catDistricts)) {
      if (districts.size < PATTERN_MIN_DISTRICTS) continue;
      if (this.#gameState.patterns.some(p => p.category === cat)) continue;

      const districtNames = Array.from(districts).map(
        id => this.#districtMap[id]?.name || id
      );
      const pattern = {
        category: cat,
        districts: Array.from(districts),
        text: `Cross-district ${cat} pattern: ${districtNames.join(', ')}`,
        week: this.#gameState.week,
      };
      this.#gameState.patterns.push(pattern);

      this.#bus.emit('pattern.discovered', pattern);
    }
  }

  // ── Public queries ───────────────────────────────────────

  getFresh() {
    return this.#gameState.insights.filter(i => i.freshness > FRESH_THRESHOLD);
  }

  getStale() {
    return this.#gameState.insights.filter(i => i.freshness > 0 && i.freshness <= FRESH_THRESHOLD);
  }

  getDead() {
    return this.#gameState.insights.filter(i => i.freshness <= 0);
  }

  getByDistrict(districtId) {
    return this.#gameState.insights.filter(i => i.districtId === districtId);
  }

  getByCategory(category) {
    return this.#gameState.insights.filter(i => i.category === category);
  }

  countFreshByCategory(category) {
    const districts = new Set();
    for (const ins of this.#gameState.insights) {
      if (ins.category === category && ins.freshness > FRESH_THRESHOLD) {
        districts.add(ins.districtId);
      }
    }
    return districts.size;
  }

  getPatterns() {
    return this.#gameState.patterns;
  }
}
