// systems/policy.js — PolicySystem: decision cards, budget effects
// Presents available policies per quarter, validates choices, applies effects.

import { QUARTER_POLICIES } from "../data/blizzard.js";

export class PolicySystem {
  #bus;
  #state;
  #registry;
  #chosenPolicy = null;

  constructor(bus, state, registry) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;

    bus.on("clock.phaseStart", (e) => {
      if (e.phase === "decision") this.#presentPolicies(e.quarter);
    });

    bus.on("policy.chosen", (e) => this.#onChosen(e));

    // Resolve fires after both policy + framing are chosen
    bus.on("campaign.resolved", () => this.#resolvePolicy());
  }

  #presentPolicies(quarter) {
    const policyIds = QUARTER_POLICIES[quarter] || [];
    const policies = [];

    for (const id of policyIds) {
      const entry = this.#registry.get(id);
      if (!entry) continue;

      // Check if this policy requires infra that isn't built
      if (entry.requires) {
        const reqState = this.#state.get(`infrastructure.${entry.requires}`);
        if (!reqState?.built) continue; // skip: prereq not met
      }

      // Check if infra it builds is already built
      if (entry.buildsInfra) {
        const infraState = this.#state.get(`infrastructure.${entry.buildsInfra}`);
        if (infraState?.built) continue; // skip: already built
      }

      policies.push(entry);
    }

    this.#bus.emit("policy.available", { quarter, policies });
  }

  #onChosen({ policyId }) {
    const entry = this.#registry.get(policyId);
    if (!entry) return;

    this.#chosenPolicy = entry;

    // Deduct budget immediately
    if (entry.budgetDelta) {
      this.#state.update("reserve", v => +(v + entry.budgetDelta).toFixed(2));
    }

    // Set flags for scenario events
    if (policyId === "pol_overtime") {
      const flags = this.#state.get("flags") || [];
      if (!flags.includes("overtime_approved")) {
        this.#state.set("flags", [...flags, "overtime_approved"]);
      }
    }
  }

  #resolvePolicy() {
    if (!this.#chosenPolicy) return;
    const entry = this.#chosenPolicy;

    this.#bus.emit("policy.resolved", {
      policyId: entry.id,
      label: entry.label,
      budgetDelta: entry.budgetDelta,
      blocEffects: entry.blocEffects,
      geoModifiers: entry.geoModifiers,
      buildsInfra: entry.buildsInfra,
    });

    // Record in history
    const history = this.#state.get("history") || [];
    history.push({
      quarter: this.#state.get("quarter"),
      type: "policy",
      id: entry.id,
      label: entry.label,
    });
    this.#state.set("history", history);

    this.#chosenPolicy = null;
  }
}
