// ui/shell.js — Boot: wires Phaser + DOM, initializes all systems
// This is the entry point. It creates the bus, state, registry,
// all game systems, and all UI systems.

import { EventBus } from "../systems/bus.js";
import { StateStore } from "../systems/state.js";
import { EntryRegistry } from "../systems/registry.js";
import { ClockSystem } from "../systems/clock.js";
import { HazardSystem } from "../systems/hazard.js";
import { InfrastructureSystem } from "../systems/infrastructure.js";
import { CoalitionSystem } from "../systems/coalition.js";
import { PolicySystem } from "../systems/policy.js";
import { CampaignSystem } from "../systems/campaign.js";
import { ScenarioSystem } from "../systems/scenario.js";

import { entries } from "../data/entries.js";
import { links } from "../data/links.js";
import { BLIZZARD_INITIAL_STATE } from "../data/blizzard.js";

import { MapRenderer } from "./map.js";
import { CardUI } from "./cards.js";
import { HUD } from "./hud.js";
import { OverlayUI } from "./overlay.js";

export function boot() {
  // 1. Core infrastructure
  const bus = new EventBus();
  const state = new StateStore(bus, BLIZZARD_INITIAL_STATE);
  const registry = new EntryRegistry(entries, links);

  // Validate the content graph
  const errors = registry.validate();
  if (errors.length > 0) {
    console.warn("Registry validation errors:", errors);
  }

  // 2. Game systems
  const clock = new ClockSystem(bus, state);
  const hazard = new HazardSystem(bus, state, registry);
  const infra = new InfrastructureSystem(bus, state, registry);
  const coalition = new CoalitionSystem(bus, state, registry);
  const policy = new PolicySystem(bus, state, registry);
  const campaign = new CampaignSystem(bus, state, registry);
  const scenario = new ScenarioSystem(bus, state, registry);

  // 3. UI
  const mapEl = document.getElementById("game");
  const overlayEl = document.getElementById("overlay");
  const hudEl = document.getElementById("hud");

  const map = new MapRenderer(bus, state, registry, mapEl);
  const cards = new CardUI(bus, state, registry, overlayEl);
  const hud = new HUD(bus, state, hudEl);
  const overlay = new OverlayUI(bus, state, overlayEl);

  // Wire district selection into HUD's detail panel
  bus.on("ui.districtSelected", ({ districtId }) => {
    const entry = registry.get(districtId);
    if (entry) hud.showDistrict(entry, state, registry);
  });
  bus.on("ui.districtUnhover", () => {
    // Don't hide on unhover — only hide when clicking empty space
  });

  // Expose for debugging
  window.__mandate = { bus, state, registry, clock, hazard, infra, coalition, policy, campaign, scenario };

  // 4. Start
  bus.emit("game.start", { scenarioId: "blizzard" });
}
