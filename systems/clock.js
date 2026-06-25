// systems/clock.js — ClockSystem: weekly cadence, player-driven
// The week is the unit of play. Player acts freely, then advances.
// ~30 weeks of data-gathering → ~18 weeks of escalating disaster arc.

const WEEKLY_DEFICIT = 0.375; // ~$1.5B/month ÷ 4 weeks
const TRUST_EROSION = 1;     // per unvisited district per week

export class ClockSystem {
  #bus;
  #state;

  constructor(bus, state) {
    this.#bus = bus;
    this.#state = state;

    bus.on("game.start", () => this.#startWeek());
    bus.on("ui.weekAdvanced", () => this.#advanceWeek());
  }

  #startWeek() {
    const week = this.#state.get("week") || 0;
    this.#bus.emit("clock.weekStart", { week });
  }

  #advanceWeek() {
    if (this.#state.get("gameOver")) return;

    const week = this.#state.get("week") || 0;
    const next = week + 1;

    // Apply operating deficit
    this.#state.update("reserve", v => +(v - WEEKLY_DEFICIT).toFixed(2));

    // Apply trust erosion for unvisited districts
    const districts = this.#state.get("districts");
    if (districts) {
      for (const [id, d] of Object.entries(districts)) {
        if (d.lastVisited !== next - 1) {
          const path = `districts.${id}.trust`;
          const old = this.#state.get(path) || 40;
          this.#state.set(path, Math.max(0, old - TRUST_EROSION));
        }
      }
    }

    // Advance
    this.#state.set("week", next);

    // Check win/lose
    this.#recomputeCitywide();
    const citywide = this.#state.get("citywide");
    const reserve = this.#state.get("reserve");

    if (citywide < 20) {
      this.#state.set("gameOver", true);
      this.#state.set("gameResult", "evacuation_failure");
      this.#bus.emit("game.lose", { type: "evacuation_failure", week: next, citywide, reserve });
      return;
    }
    if (reserve < -3.0) {
      this.#state.set("gameOver", true);
      this.#state.set("gameResult", "fiscal_crisis");
      this.#bus.emit("game.lose", { type: "fiscal_crisis", week: next, citywide, reserve });
      return;
    }
    if (next >= 48) {
      this.#state.set("gameOver", true);
      if (citywide >= 75) {
        this.#state.set("gameResult", "resilient_city");
        this.#bus.emit("game.win", { type: "resilient_city", citywide, reserve });
      } else if (citywide >= 50) {
        this.#state.set("gameResult", "held_together");
        this.#bus.emit("game.win", { type: "held_together", citywide, reserve });
      } else {
        this.#state.set("gameResult", "blind_response");
        this.#bus.emit("game.lose", { type: "blind_response", citywide, reserve });
      }
      return;
    }

    this.#bus.emit("clock.weekStart", { week: next });
  }

  #recomputeCitywide() {
    const districts = this.#state.get("districts");
    if (!districts) return;
    let totalWeighted = 0, totalPop = 0;
    for (const d of Object.values(districts)) {
      const trust = d.trust ?? 40;
      const pop = d.pop ?? 1;
      totalWeighted += trust * pop;
      totalPop += pop;
    }
    this.#state.set("citywide", totalPop > 0 ? Math.round(totalWeighted / totalPop) : 40);
  }
}
