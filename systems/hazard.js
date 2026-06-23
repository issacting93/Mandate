// systems/hazard.js — HazardSystem: disaster progression, severity, damage
// The blizzard approaches over quarters, strikes in Q4, damage based on mitigation.

import { SEVERITY_THRESHOLDS, CREDIT_THRESHOLDS } from "../data/blizzard.js";

export class HazardSystem {
  #bus;
  #state;
  #registry;

  constructor(bus, state, registry) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;

    bus.on("clock.phaseStart", (e) => {
      if (e.phase === "prep") this.#checkWarnings(e.quarter);
    });

    // Check for strike after scenario events are processed
    bus.on("scenario.reactDone", (e) => this.#checkStrike(e.quarter));
  }

  #checkWarnings(quarter) {
    const hazard = this.#state.get("hazard");
    if (hazard.struck || hazard.resolved) return;

    const quartersUntil = hazard.strikesAtQuarter - quarter;

    // Recalculate current severity based on mitigation
    const mitigation = this.#registry.totalMitigation(hazard.id, this.#state);
    const currentSeverity = Math.max(0, hazard.baseSeverity - mitigation);
    this.#state.set("hazard.currentSeverity", currentSeverity);

    if (quartersUntil > 0) {
      this.#bus.emit("hazard.warning", {
        hazardId: hazard.id,
        quartersUntil,
        currentSeverity,
        mitigation,
      });
    } else if (quartersUntil === 0) {
      this.#state.set("hazard.announced", true);
      this.#bus.emit("hazard.approaching", {
        hazardId: hazard.id,
        currentSeverity,
        mitigation,
      });
    }
  }

  #checkStrike(quarter) {
    const hazard = this.#state.get("hazard");
    if (hazard.struck || quarter !== hazard.strikesAtQuarter) return;

    // Calculate final severity
    const mitigation = this.#registry.totalMitigation(hazard.id, this.#state);
    const finalSeverity = Math.max(0, hazard.baseSeverity - mitigation);

    this.#state.set("hazard.struck", true);
    this.#state.set("hazard.currentSeverity", finalSeverity);

    // Determine which outcomes fire based on severity
    const outcomes = this.#computeOutcomes(finalSeverity);

    // Compute per-district damage
    const districtDamage = this.#computeDistrictDamage(finalSeverity);

    // Handle invisible success / credit
    const creditResult = this.#resolveCredit(finalSeverity);

    this.#bus.emit("hazard.strikes", {
      hazardId: hazard.id,
      finalSeverity,
      mitigation,
      outcomes,
      districtDamage,
      creditResult,
    });

    // Apply budget cost from property damage
    const propDmg = outcomes.find(o => o.id === "o_property_damage");
    if (propDmg) {
      this.#state.update("reserve", v => +(v - 0.8).toFixed(2));
    }

    this.#state.set("hazard.resolved", true);
    this.#bus.emit("hazard.resolved", {
      hazardId: hazard.id,
      finalSeverity,
      outcomes,
      districtDamage,
      creditResult,
    });
  }

  #computeOutcomes(severity) {
    const outcomes = [];

    if (severity >= SEVERITY_THRESHOLDS.catastrophic) {
      outcomes.push(
        { id: "o_casualties", label: "Casualties", approvalHit: -12 },
        { id: "o_displacement", label: "Displacement", approvalHit: -8 },
        { id: "o_transit_shutdown", label: "Transit Shutdown", approvalHit: -6 },
        { id: "o_property_damage", label: "Property Damage", approvalHit: -5 },
        { id: "o_blackout", label: "Power Outage", approvalHit: -9 },
      );
    } else if (severity >= SEVERITY_THRESHOLDS.high) {
      outcomes.push(
        { id: "o_casualties", label: "Casualties", approvalHit: -8 },
        { id: "o_displacement", label: "Displacement", approvalHit: -6 },
        { id: "o_transit_shutdown", label: "Transit Shutdown", approvalHit: -5 },
        { id: "o_property_damage", label: "Property Damage", approvalHit: -4 },
      );
    } else if (severity >= SEVERITY_THRESHOLDS.medium) {
      outcomes.push(
        { id: "o_displacement", label: "Displacement", approvalHit: -4 },
        { id: "o_transit_shutdown", label: "Transit Shutdown", approvalHit: -4 },
        { id: "o_property_damage", label: "Property Damage", approvalHit: -3 },
      );
    } else if (severity >= SEVERITY_THRESHOLDS.low) {
      outcomes.push(
        { id: "o_transit_shutdown", label: "Transit Disruption", approvalHit: -3 },
      );
    } else {
      outcomes.push(
        { id: "o_invisible_success", label: "Invisible Success", approvalHit: 0 },
      );
    }

    return outcomes;
  }

  #computeDistrictDamage(severity) {
    const damage = {};
    const threatens = this.#registry.outgoing("h_blizzard", "threatens");

    for (const { entry, link } of threatens) {
      // Base damage from severity * threat weight
      let baseDamage = (severity / 10) * (link.weight || 0.5);

      // Check if any built infrastructure protects this district
      const protectors = this.#registry.incoming(entry.id, "protects");
      let protected_ = false;
      for (const { entry: infra } of protectors) {
        if (this.#state.get(`infrastructure.${infra.id}.built`)) {
          baseDamage *= 0.4; // 60% damage reduction per protector
          protected_ = true;
        }
      }

      damage[entry.id] = {
        value: Math.round(baseDamage * 10) / 10,
        protected: protected_,
        weight: link.weight,
      };
    }

    return damage;
  }

  #resolveCredit(severity) {
    const creditBank = this.#state.get("creditBank");
    const total = creditBank.total || 0;

    // Only relevant for low-severity outcomes (good preparation)
    if (severity >= SEVERITY_THRESHOLDS.medium) {
      return { type: "damage_visible", approvalDelta: 0, headline: null };
    }

    if (total >= CREDIT_THRESHOLDS.strong) {
      return {
        type: "credit_claimed",
        approvalDelta: +10,
        headline: "SNOW PLAN WORKS: City Barely Blinks",
        subhead: "Mayor's preparation credited with saving lives and keeping the city running.",
      };
    } else if (total >= CREDIT_THRESHOLDS.moderate) {
      return {
        type: "credit_partial",
        approvalDelta: +3,
        headline: "Storm Passes Without Major Incident",
        subhead: "Some credit the mayor's planning. Others say the storm wasn't that bad.",
      };
    } else {
      return {
        type: "credit_missed",
        approvalDelta: -3,
        headline: "Was the Blizzard Budget a Waste?",
        subhead: "Opposition questions millions spent on a storm that 'wasn't even that bad.'",
      };
    }
  }
}
