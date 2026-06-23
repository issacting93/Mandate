// systems/clock.js — ClockSystem: quarter/phase advancement
// Drives the turn structure: PREP -> DECISION -> RESOLVE -> REACT -> next quarter

import { SEASONS, QUARTER_NARRATIVES } from "../data/blizzard.js";

const PHASES = ["prep", "decision", "resolve", "react"];
const GOODWILL_DECAY = 1.5;

export class ClockSystem {
  #bus;
  #state;

  constructor(bus, state) {
    this.#bus = bus;
    this.#state = state;

    bus.on("game.start", () => this.#startGame());
    bus.on("policy.resolved", () => this.#advanceToResolve());
    bus.on("react.complete", () => this.#advanceQuarter());
  }

  #startGame() {
    const quarter = this.#state.get("quarter");
    this.#bus.emit("clock.quarterStart", {
      quarter,
      season: SEASONS[quarter],
      narrative: QUARTER_NARRATIVES[quarter],
    });
    // Prep runs immediately (decay, deficit, maintenance, warnings)
    this.#runPhase("prep");
    // Decision phase waits for player to dismiss the quarter intro
    this.#bus.once("ui.quarterIntroDismissed", () => {
      this.#runPhase("decision");
    });
  }

  #runPhase(phase) {
    this.#state.set("phase", phase);
    this.#bus.emit("clock.phaseStart", { phase, quarter: this.#state.get("quarter") });
  }

  // After policy + framing are both resolved, advance to the resolve phase
  // which triggers map animations, then to react phase
  #advanceToResolve() {
    if (this.#state.get("phase") === "decision") {
      this.#runPhase("resolve");
      // After a brief pause for animations, advance to react
      setTimeout(() => this.#runPhase("react"), 1200);
    }
  }

  #advanceQuarter() {
    if (this.#state.get("gameOver")) return;

    const quarter = this.#state.get("quarter");

    // Check win/lose
    const citywide = this.#state.get("citywide");
    const reserve = this.#state.get("reserve");

    if (citywide < 25) {
      this.#state.set("gameOver", true);
      this.#state.set("gameResult", "recalled");
      this.#bus.emit("game.lose", { type: "recalled", quarter, citywide, reserve });
      return;
    }

    if (reserve < -3.0) {
      this.#state.set("gameOver", true);
      this.#state.set("gameResult", "bankrupt");
      this.#bus.emit("game.lose", { type: "bankrupt", quarter, citywide, reserve });
      return;
    }

    if (quarter >= 4) {
      // End of the blizzard scenario
      this.#state.set("gameOver", true);
      if (citywide >= 50) {
        this.#state.set("gameResult", "reelected");
        this.#bus.emit("game.win", { type: "reelected", citywide, reserve });
      } else {
        this.#state.set("gameResult", "primaried");
        this.#bus.emit("game.lose", { type: "primaried", citywide, reserve });
      }
      return;
    }

    // Advance to next quarter
    const next = quarter + 1;
    this.#state.set("quarter", next);
    this.#state.set("season", SEASONS[next]);

    this.#bus.emit("clock.quarterStart", {
      quarter: next,
      season: SEASONS[next],
      narrative: QUARTER_NARRATIVES[next],
    });

    this.#runPhase("prep");
    this.#bus.once("ui.quarterIntroDismissed", () => {
      if (!this.#state.get("gameOver")) {
        this.#runPhase("decision");
      }
    });
  }

  // Called by UI to advance from decision -> resolve after player acts
  advanceFromDecision() {
    if (this.#state.get("phase") === "decision") {
      this.#runPhase("resolve");
    }
  }

  // Called by UI to advance from resolve -> react after animations
  advanceFromResolve() {
    if (this.#state.get("phase") === "resolve") {
      this.#runPhase("react");
    }
  }
}
