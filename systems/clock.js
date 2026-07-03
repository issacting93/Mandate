// systems/clock.js — ClockSystem: weekly cadence, player-driven
// The week is the unit of play. Player acts freely, then advances.
// ~30 weeks of data-gathering -> ~18 weeks of escalating disaster arc.
//
// Dual-metre win/lose conditions (Frostpunk influence):
// - Disorder ≥ 85 at any point → POLITICAL CRISIS (ouster/gridlock)
// - Resilience < 20 mid-term → EVACUATION FAILURE
// - Reserve < -$3B → FISCAL CRISIS (state takeover)
// - At week 48: Resilience ≥ 75 → RESILIENT CITY
//                Resilience ≥ 50 → HELD TOGETHER
//                Resilience < 50 → BLIND RESPONSE
//
// Erosion and trust manipulation moved to MetreSystem via clock.weekEnd.

const WEEKLY_DEFICIT = 0.08; // $3.84B total over 48 weeks. Player has ~$1.2B discretionary from $5B start.

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

    // Operating deficit
    this.#state.update("reserve", v => +(v - WEEKLY_DEFICIT).toFixed(2));

    // Signal end of week — MetreSystem handles erosion, decay, and recompute
    this.#bus.emit("clock.weekEnd", { week });

    // Advance
    const next = week + 1;
    this.#state.set("week", next);

    // Read dual metres (updated synchronously by MetreSystem)
    const citywide = this.#state.get("citywide");
    const disorder = this.#state.get("citywideDisorder") || 0;
    const reserve = this.#state.get("reserve");

    // ── DISORDER CRISIS ─────────────────────────────────
    // Frostpunk moment: disorder too high → political breaking point
    if (disorder >= 85) {
      this.#state.set("gameOver", true);
      this.#state.set("gameResult", "political_crisis");
      this.#bus.emit("game.lose", {
        type: "political_crisis",
        week: next, citywide, disorder, reserve,
        message: "The city has turned against you. Strikes, gridlock, and a vote of no confidence end your administration before the storm arrives.",
      });
      return;
    }

    // ── RESILIENCE COLLAPSE ─────────────────────────────
    if (citywide < 20) {
      this.#state.set("gameOver", true);
      this.#state.set("gameResult", "evacuation_failure");
      this.#bus.emit("game.lose", {
        type: "evacuation_failure",
        week: next, citywide, disorder, reserve,
      });
      return;
    }

    // ── FISCAL CRISIS ───────────────────────────────────
    if (reserve < -3.0) {
      this.#state.set("gameOver", true);
      this.#state.set("gameResult", "fiscal_crisis");
      this.#bus.emit("game.lose", {
        type: "fiscal_crisis",
        week: next, citywide, disorder, reserve,
      });
      return;
    }

    // ── TERM END ────────────────────────────────────────
    if (next >= 48) {
      this.#state.set("gameOver", true);
      if (citywide >= 75 && disorder < 50) {
        this.#state.set("gameResult", "resilient_city");
        this.#bus.emit("game.win", { type: "resilient_city", citywide, disorder, reserve });
      } else if (citywide >= 50) {
        this.#state.set("gameResult", "held_together");
        this.#bus.emit("game.win", { type: "held_together", citywide, disorder, reserve });
      } else {
        this.#state.set("gameResult", "blind_response");
        this.#bus.emit("game.lose", { type: "blind_response", citywide, disorder, reserve });
      }
      return;
    }

    this.#bus.emit("clock.weekStart", { week: next });
  }
}
