// systems/policy.js — InterventionSystem: insight-gated emergency intervention tiers
// Interventions unlock from field discoveries, not calendar gates.
// Three tiers: generic (always), informed (requires insights), pattern (requires cross-district patterns).

export class PolicySystem {
  #bus;
  #state;
  #registry;

  constructor(bus, state, registry) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;

    bus.on("engagement.started", (e) => {
      if (e.action === "policy") this.#presentPolicies(e.districtId);
    });
    bus.on("ui.policyChosen", (e) => this.#resolve(e));
  }

  #presentPolicies(districtId) {
    const insights = this.#state.get("insights") || [];
    const patterns = this.#state.get("patterns") || [];
    const policies = this.#registry.ofType("policy");

    const available = { generic: [], informed: [], pattern: [] };

    for (const pol of policies) {
      const tier = pol.tier || "generic";

      if (tier === "generic") {
        available.generic.push(pol);
      } else if (tier === "informed") {
        // Check if required insights are discovered
        const required = pol.requiredInsights || [];
        const met = required.every(insId =>
          insights.some(i => i.id === insId)
        );
        if (met) available.informed.push(pol);
      } else if (tier === "pattern") {
        // Check if the pattern is discovered
        const met = patterns.some(p => p.id === pol.requiredPattern);
        if (met) available.pattern.push(pol);
      }
    }

    this.#bus.emit("policy.available", { districtId, ...available });
  }

  #resolve({ policyId }) {
    const entry = this.#registry.get(policyId);
    if (!entry) return;

    // Budget
    if (entry.budgetDelta) {
      this.#state.update("reserve", v => +(v + entry.budgetDelta).toFixed(2));
    }

    // Record
    const policies = this.#state.get("policies") || [];
    policies.push({
      id: entry.id,
      week: this.#state.get("week"),
      tier: entry.tier || "generic",
      targets: entry.targets || [],
    });
    this.#state.set("policies", policies);

    this.#bus.emit("policy.resolved", {
      policyId: entry.id,
      label: entry.label,
      budgetDelta: entry.budgetDelta,
      targets: entry.targets,
      trustEffect: entry.trustEffect,
    });
  }
}
