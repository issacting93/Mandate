// systems/scenario.js — ScenarioSystem: trigger/condition/effect engine
// Evaluates scenario events during the REACT phase based on game state.

import { SCENARIO_EVENTS } from "../data/blizzard.js";

export class ScenarioSystem {
  #bus;
  #state;
  #registry;
  #firedEvents = new Set();

  constructor(bus, state, registry) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;

    bus.on("clock.phaseStart", (e) => {
      if (e.phase === "react") this.#evaluate(e.quarter);
    });

    bus.on("ui.eventDismissed", () => {
      const quarter = this.#state.get("quarter");
      this.#bus.emit("react.complete", { quarter });
    });
  }

  #evaluate(quarter) {
    const events = SCENARIO_EVENTS.filter(evt =>
      evt.quarter === quarter && !this.#firedEvents.has(evt.id)
    );

    for (const evt of events) {
      // Check base conditions
      if (!this.#checkConditions(evt.conditions)) continue;

      this.#firedEvents.add(evt.id);

      // Check for conditional (branching) effects
      let narrative = evt.narrative;
      let effects = evt.effects;

      if (evt.conditionalEffects) {
        const cond = evt.conditionalEffects;
        if (this.#checkBranch(cond.if)) {
          narrative = cond.then.narrative;
          effects = cond.then.effects;
        }
      }

      // Apply effects
      for (const effect of effects) {
        this.#applyEffect(effect);
      }

      // Emit for UI
      this.#bus.emit("scenario.triggered", {
        eventId: evt.id,
        headline: evt.headline,
        narrative,
        effects,
      });

      // Record
      const history = this.#state.get("history") || [];
      history.push({
        quarter,
        type: "event",
        id: evt.id,
        headline: evt.headline,
      });
      this.#state.set("history", history);
    }

    // Signal that scenario processing is done; hazard system can now check for strike
    this.#bus.emit("scenario.reactDone", { quarter, eventsFired: events.length });

    // If no events fired and hazard hasn't struck, react is complete
    const hazardStruck = this.#state.get("hazard.struck");
    if (events.length === 0 && !hazardStruck) {
      this.#bus.emit("react.complete", { quarter });
    }
    // Otherwise, overlay/hazard dismissal will trigger react.complete via ui.eventDismissed
  }

  #checkConditions(conditions) {
    if (!conditions || conditions.length === 0) return true;

    for (const cond of conditions) {
      if (cond.type === "flag") {
        const flags = this.#state.get("flags") || [];
        if (!flags.includes(cond.value)) return false;
      }
      if (cond.type === "infraBuilt") {
        if (!this.#state.get(`infrastructure.${cond.value}.built`)) return false;
      }
      if (cond.type === "quarter") {
        if (this.#state.get("quarter") !== cond.value) return false;
      }
    }
    return true;
  }

  #checkBranch(condition) {
    if (condition.infraBuilt) {
      return this.#state.get(`infrastructure.${condition.infraBuilt}.built`) === true;
    }
    if (condition.flag) {
      const flags = this.#state.get("flags") || [];
      return flags.includes(condition.flag);
    }
    if (condition.minApproval) {
      return (this.#state.get("citywide") || 0) >= condition.minApproval;
    }
    return false;
  }

  #applyEffect(effect) {
    switch (effect.type) {
      case "bloc_approval": {
        const path = `blocs.${effect.bloc}.approval`;
        const old = this.#state.get(path);
        if (old !== undefined) {
          this.#state.set(path, Math.max(0, Math.min(100, old + effect.delta)));
        }
        break;
      }
      case "reserve": {
        this.#state.update("reserve", v => +(v + effect.delta).toFixed(2));
        break;
      }
      case "flag": {
        const flags = this.#state.get("flags") || [];
        if (!flags.includes(effect.value)) {
          this.#state.set("flags", [...flags, effect.value]);
        }
        break;
      }
    }
  }
}
