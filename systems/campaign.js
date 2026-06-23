// systems/campaign.js — CampaignSystem: framing, credit bank, invisible success
// How you SELL the decision matters as much as the decision itself.
// The credit bank determines whether invisible success earns or costs approval.

import { framings as framingEntries } from "../data/entries.js";

const FRAMING_IDS = Object.keys(framingEntries);

export class CampaignSystem {
  #bus;
  #state;
  #registry;
  #chosenFraming = null;

  constructor(bus, state, registry) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;

    bus.on("policy.chosen", () => this.#presentFramings());
    bus.on("campaign.chosen", (e) => this.#onChosen(e));
  }

  #presentFramings() {
    const available = FRAMING_IDS.map(id => this.#registry.get(id)).filter(Boolean);
    this.#bus.emit("campaign.available", { framings: available });
  }

  #onChosen({ framingId }) {
    const entry = this.#registry.get(framingId);
    if (!entry) return;

    this.#chosenFraming = entry;

    // Deduct reserve cost
    if (entry.reserveCost) {
      this.#state.update("reserve", v => +(v - entry.reserveCost).toFixed(2));
    }

    // Update credit bank
    if (entry.creditMultiplier > 0) {
      this.#state.update("creditBank.narrativeBuilt", v => v + 1);
      this.#state.update("creditBank.total", v => v + 1);
    }

    if (entry.creditTags?.includes("preparedness")) {
      this.#state.update("creditBank.publicAwareness", v => v + 2);
      this.#state.update("creditBank.total", v => v + 2);
    } else if (entry.creditTags?.length > 0) {
      this.#state.update("creditBank.publicAwareness", v => v + 1);
      this.#state.update("creditBank.total", v => v + 1);
    }

    // Record in history
    const history = this.#state.get("history") || [];
    history.push({
      quarter: this.#state.get("quarter"),
      type: "framing",
      id: entry.id,
      label: entry.label,
    });
    this.#state.set("history", history);

    // Resolve: apply framing effects and signal clock to advance
    this.#bus.emit("campaign.resolved", {
      framingId: entry.id,
      label: entry.label,
      blocEffects: entry.blocEffects,
      creditMultiplier: entry.creditMultiplier,
    });

    this.#chosenFraming = null;
  }
}
