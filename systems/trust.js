// systems/trust.js — TrustSystem: per-district community resilience, bloc aggregates, citywide
// Replaces coalition.js. Community resilience is the central resource.
// "Trust" in code = "Community Resilience" in UI.

export class TrustSystem {
  #bus;
  #state;

  constructor(bus, state) {
    this.#bus = bus;
    this.#state = state;

    bus.on("conversation.ended", (e) => this.#onConversation(e));
    bus.on("policy.resolved", (e) => this.#onPolicy(e));
    bus.on("post.published", (e) => this.#onPost(e));
    bus.on("clock.weekStart", () => this.#recomputeAggregates());
  }

  #onConversation({ districtId, trustDelta }) {
    if (!districtId || !trustDelta) return;
    this.#applyDelta(districtId, trustDelta);
  }

  #onPolicy({ targets, trustEffect }) {
    if (!trustEffect) return;
    // Targeted trust for specific districts
    if (targets && trustEffect.targeted) {
      for (const id of targets) {
        this.#applyDelta(id, trustEffect.targeted);
      }
    }
    // Citywide bonus spread across all districts
    if (trustEffect.citywide) {
      const districts = this.#state.get("districts");
      if (districts) {
        for (const id of Object.keys(districts)) {
          this.#applyDelta(id, trustEffect.citywide);
        }
      }
    }
  }

  #onPost({ groundingScore, districtId }) {
    if (!districtId) return;
    // Grounded posts build trust, hollow posts erode slightly
    const delta = groundingScore > 0.5 ? 2 : -1;
    this.#applyDelta(districtId, delta);
  }

  #applyDelta(districtId, delta) {
    const path = `districts.${districtId}.trust`;
    const old = this.#state.get(path);
    if (old === undefined) return;
    this.#state.set(path, clamp(old + delta));
    this.#recomputeAggregates();
    this.#bus.emit("trust.updated", { districtId, delta, newValue: this.#state.get(path) });
  }

  #recomputeAggregates() {
    const districts = this.#state.get("districts");
    if (!districts) return;

    // Citywide = population-weighted average
    let totalWeighted = 0, totalPop = 0;
    const blocTotals = {};
    const blocCounts = {};

    for (const [id, d] of Object.entries(districts)) {
      const trust = d.trust ?? 40;
      const pop = d.pop ?? 1;
      totalWeighted += trust * pop;
      totalPop += pop;

      // Bloc aggregation
      const bloc = d.bloc;
      if (bloc) {
        blocTotals[bloc] = (blocTotals[bloc] || 0) + trust;
        blocCounts[bloc] = (blocCounts[bloc] || 0) + 1;
      }
    }

    this.#state.set("citywide", totalPop > 0 ? Math.round(totalWeighted / totalPop) : 40);

    // Update bloc averages
    for (const [bloc, total] of Object.entries(blocTotals)) {
      this.#state.set(`blocs.${bloc}.trust`, Math.round(total / blocCounts[bloc]));
    }
  }
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
