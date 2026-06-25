// systems/scenario.js — ScenarioSystem: weekly event + disaster evaluation
// Triggers events from the registry based on conditions against game state.
// Disasters are the primary antagonist — the final exam for HCD preparation.
// Before (~wk 1-30): data-gathering events. During (~wk 30-42): escalating crisis. After (~wk 42-48): recovery.

export class ScenarioSystem {
  #bus;
  #state;
  #registry;
  #firedEvents = new Set();

  constructor(bus, state, registry) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;

    bus.on("clock.weekStart", (e) => this.#evaluate(e.week));
  }

  #evaluate(week) {
    const events = this.#registry.ofType("event");
    const triggered = [];

    for (const evt of events) {
      if (this.#firedEvents.has(evt.id)) continue;
      if (!this.#checkConditions(evt.conditions, week)) continue;

      this.#firedEvents.add(evt.id);

      // Apply effects
      if (evt.effects) {
        for (const effect of evt.effects) {
          this.#applyEffect(effect);
        }
      }

      triggered.push(evt);

      this.#bus.emit("scenario.triggered", {
        eventId: evt.id,
        headline: evt.headline || evt.label,
        narrative: evt.narrative || evt.desc,
        effects: evt.effects,
      });
    }

    this.#bus.emit("scenario.evaluated", { week, count: triggered.length });
  }

  #checkConditions(conditions, week) {
    if (!conditions || conditions.length === 0) return true;

    for (const cond of conditions) {
      switch (cond.type) {
        case "weekRange":
          if (week < (cond.min || 0) || week > (cond.max || 48)) return false;
          break;
        case "week":
          if (week !== cond.value) return false;
          break;
        case "trustBelow":
          if ((this.#state.get(`districts.${cond.district}.trust`) ?? 100) >= cond.value) return false;
          break;
        case "insightCount":
          if ((this.#state.get("insights") || []).length < cond.value) return false;
          break;
        case "patternDiscovered":
          if (!(this.#state.get("patterns") || []).some(p => p.id === cond.value)) return false;
          break;
        case "flag":
          if (!(this.#state.get("flags") || []).includes(cond.value)) return false;
          break;
      }
    }
    return true;
  }

  #applyEffect(effect) {
    switch (effect.type) {
      case "trust": {
        const path = `districts.${effect.district}.trust`;
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
      case "feed_item": {
        this.#bus.emit("feed.item", { text: effect.text, type: effect.feedType || "news" });
        break;
      }
    }
  }
}
