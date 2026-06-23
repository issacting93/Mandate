// systems/coalition.js — CoalitionSystem: bloc approval, decay, citywide
// The central resource of the game. Manages approval values and computes citywide.

import { districts as districtEntries, blocs as blocEntries } from "../data/entries.js";

const BLOC_KEYS = Object.keys(blocEntries).map(k => k.replace("b_", ""));
const DECAY_PER_QUARTER = 1.5;

export class CoalitionSystem {
  #bus;
  #state;
  #registry;

  constructor(bus, state, registry) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;

    bus.on("clock.phaseStart", (e) => {
      if (e.phase === "prep") {
        this.#applyDecay();
        this.#applyDeficit();
      }
    });

    bus.on("policy.resolved", (e) => this.#applyPolicyEffects(e));
    bus.on("campaign.resolved", (e) => this.#applyFramingEffects(e));
    bus.on("hazard.resolved", (e) => this.#applyHazardEffects(e));
  }

  #applyDecay() {
    const deltas = {};
    for (const bloc of BLOC_KEYS) {
      const path = `blocs.${bloc}.approval`;
      const old = this.#state.get(path);
      const next = Math.max(0, old - DECAY_PER_QUARTER);
      this.#state.set(path, next);
      deltas[bloc] = -DECAY_PER_QUARTER;
    }
    this.#recomputeCitywide();
    this.#bus.emit("coalition.decayed", { deltas });
  }

  #applyDeficit() {
    const deficit = this.#state.get("operatingDeficit") || 0.4;
    this.#state.update("reserve", v => +(v - deficit).toFixed(2));
  }

  #applyPolicyEffects({ policyId, blocEffects, geoModifiers }) {
    if (!blocEffects) return;

    // Apply bloc-level effects
    for (const [bloc, delta] of Object.entries(blocEffects)) {
      const path = `blocs.${bloc}.approval`;
      const old = this.#state.get(path);
      if (old !== undefined) {
        this.#state.set(path, clamp(old + delta));
      }
    }

    // Apply geographic modifiers to districts
    if (geoModifiers) {
      const districtIds = Object.keys(this.#state.get("districts"));
      for (const dId of districtIds) {
        const entry = this.#registry.get(dId);
        if (!entry) continue;
        const regionMod = geoModifiers[entry.region] || 0;
        if (regionMod !== 0) {
          const path = `districts.${dId}.modifier`;
          this.#state.update(path, v => v + regionMod);
        }
      }
    }

    this.#recomputeDistrictApprovals();
    this.#recomputeCitywide();
  }

  #applyFramingEffects({ framingId, blocEffects }) {
    if (!blocEffects) return;
    for (const [bloc, delta] of Object.entries(blocEffects)) {
      const path = `blocs.${bloc}.approval`;
      const old = this.#state.get(path);
      if (old !== undefined) {
        this.#state.set(path, clamp(old + delta));
      }
    }
    this.#recomputeCitywide();
  }

  #applyHazardEffects({ districtDamage, outcomeEffects }) {
    // Direct approval hits from outcomes
    if (outcomeEffects) {
      for (const { bloc, delta } of outcomeEffects) {
        const path = `blocs.${bloc}.approval`;
        const old = this.#state.get(path);
        if (old !== undefined) {
          this.#state.set(path, clamp(old + delta));
        }
      }
    }

    // Per-district damage
    if (districtDamage) {
      for (const [dId, damage] of Object.entries(districtDamage)) {
        const path = `districts.${dId}.approval`;
        const old = this.#state.get(path);
        if (old !== undefined) {
          this.#state.set(path, clamp(old - damage));
        }
      }
    }

    this.#recomputeCitywide();
  }

  #recomputeDistrictApprovals() {
    // District approval = base bloc approval + local modifier
    const districtIds = Object.keys(this.#state.get("districts"));
    for (const dId of districtIds) {
      const entry = this.#registry.get(dId);
      if (!entry) continue;
      const blocApproval = this.#state.get(`blocs.${entry.bloc}.approval`) || 50;
      const modifier = this.#state.get(`districts.${dId}.modifier`) || 0;
      this.#state.set(`districts.${dId}.approval`, clamp(blocApproval + modifier));
    }
  }

  #recomputeCitywide() {
    let totalWeighted = 0;
    let totalPop = 0;
    const districtIds = Object.keys(this.#state.get("districts"));
    for (const dId of districtIds) {
      const entry = this.#registry.get(dId);
      if (!entry) continue;
      const app = this.#state.get(`districts.${dId}.approval`) || 50;
      totalWeighted += app * entry.pop;
      totalPop += entry.pop;
    }
    const citywide = totalPop > 0 ? Math.round(totalWeighted / totalPop) : 50;
    this.#state.set("citywide", citywide);
    this.#bus.emit("coalition.updated", { citywide });
  }

  applyBlocDelta(bloc, delta) {
    const path = `blocs.${bloc}.approval`;
    const old = this.#state.get(path);
    if (old !== undefined) {
      this.#state.set(path, clamp(old + delta));
      this.#recomputeCitywide();
    }
  }
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
