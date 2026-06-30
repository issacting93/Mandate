// systems/intervention.js — InterventionSystem: insight-gated policy tiers
// Generic (always), Informed (2+ insights in category), Pattern (pattern discovered).

export class InterventionSystem {
  #bus;
  #gameState;
  #districtMap;
  #insightSystem;
  #interventions;
  #executed = new Set();

  constructor(bus, gameState, districtMap, insightSystem, interventions) {
    this.#bus = bus;
    this.#gameState = gameState;
    this.#districtMap = districtMap;
    this.#insightSystem = insightSystem;
    this.#interventions = interventions;

    bus.on('ui.interventionRequested', () => this.#present());
    bus.on('ui.interventionChosen', ({ interventionId }) => this.#execute(interventionId));
  }

  #present() {
    const available = this.getAvailable();
    this.#bus.emit('intervention.available', available);
  }

  #execute(interventionId) {
    const intervention = this.#interventions.find(i => i.id === interventionId);
    if (!intervention) return;
    if (!intervention.repeatable && this.#executed.has(interventionId)) return;
    if (!this.#checkUnlock(intervention)) return;
    if (this.#gameState.reserve < intervention.cost) return;

    // Deduct cost
    this.#gameState.reserve = +(this.#gameState.reserve - intervention.cost).toFixed(2);
    this.#executed.add(interventionId);

    // Determine target districts
    const targets = this.#resolveTargets(intervention);

    // Apply trust effects
    const trustDeltas = [];
    for (const districtId of targets) {
      const d = this.#districtMap[districtId];
      if (!d) continue;
      const delta = intervention.trustEffect.targeted;
      d.trust = Math.min(100, d.trust + delta);
      trustDeltas.push({ districtId, delta });
    }

    // Apply citywide trust
    if (intervention.trustEffect.citywide > 0) {
      const DISTRICTS = Object.values(this.#districtMap);
      for (const d of DISTRICTS) {
        d.trust = Math.min(100, d.trust + intervention.trustEffect.citywide);
      }
    }

    // Apply concern effects
    const concernDeltas = [];
    if (intervention.concernEffect) {
      for (const districtId of targets) {
        const concerns = window.CONCERN_SCORES?.[districtId];
        if (!concerns) continue;
        for (const [concern, delta] of Object.entries(intervention.concernEffect)) {
          if (concerns[concern] !== undefined) {
            concerns[concern] = Math.max(1, concerns[concern] + delta);
            concernDeltas.push({ districtId, concern, delta });
          }
        }
      }
    }

    this.#bus.emit('intervention.executed', {
      id: intervention.id,
      name: intervention.name,
      tier: intervention.tier,
      cost: intervention.cost,
      targets,
      trustDeltas,
      concernDeltas,
    });
  }

  #checkUnlock(intervention) {
    switch (intervention.tier) {
      case 'generic':
        return true;
      case 'informed':
        return this.#insightSystem.countFreshByCategory(intervention.requiredCategory)
          >= (intervention.requiredCount || 2);
      case 'pattern':
        return this.#insightSystem.getPatterns()
          .some(p => p.category === intervention.requiredPattern);
      default:
        return false;
    }
  }

  #resolveTargets(intervention) {
    switch (intervention.target) {
      case 'citywide':
        return Object.keys(this.#districtMap);
      case 'single':
        // For single-target interventions, target the lowest-trust visited district
        return Object.values(this.#districtMap)
          .filter(d => d.lastVisited != null)
          .sort((a, b) => a.trust - b.trust)
          .slice(0, 1)
          .map(d => d.id);
      case 'category': {
        // Target districts where player has insights in the required category
        const districts = new Set();
        for (const ins of this.#gameState.insights) {
          if (ins.category === intervention.requiredCategory && ins.freshness > 0) {
            districts.add(ins.districtId);
          }
        }
        return Array.from(districts);
      }
      case 'pattern': {
        // Target all districts in the matching pattern
        const pattern = this.#insightSystem.getPatterns()
          .find(p => p.category === intervention.requiredPattern);
        return pattern ? pattern.districts : [];
      }
      default:
        return [];
    }
  }

  // ── Public queries ───────────────────────────────────────

  getAvailable() {
    const generic = [], informed = [], pattern = [];
    for (const intervention of this.#interventions) {
      const unlocked = this.#checkUnlock(intervention);
      const executed = this.#executed.has(intervention.id);
      const affordable = this.#gameState.reserve >= intervention.cost;
      const entry = { ...intervention, unlocked, executed, affordable };

      if (!intervention.repeatable && executed) continue;

      switch (intervention.tier) {
        case 'generic': generic.push(entry); break;
        case 'informed': informed.push(entry); break;
        case 'pattern': pattern.push(entry); break;
      }
    }
    return { generic, informed, pattern };
  }

  isExecuted(id) {
    return this.#executed.has(id);
  }
}
