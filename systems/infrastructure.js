// systems/infrastructure.js — InfrastructureSystem: build, maintain, mitigate
// Tracks what the player has built, deducts maintenance, feeds the hazard system.

export class InfrastructureSystem {
  #bus;
  #state;
  #registry;

  constructor(bus, state, registry) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;

    bus.on("clock.phaseStart", (e) => {
      if (e.phase === "prep") this.#maintain();
    });

    bus.on("policy.resolved", (e) => {
      if (e.buildsInfra) this.#beginBuild(e.buildsInfra);
    });
  }

  #maintain() {
    const infra = this.#state.get("infrastructure");
    for (const [id, data] of Object.entries(infra)) {
      if (!data.built) {
        // Advance build progress for in-progress items
        if (data.progress > 0) {
          const entry = this.#registry.get(id);
          const needed = entry?.buildTime || 1;
          const newProgress = data.progress + 1;
          if (newProgress >= needed) {
            this.#state.set(`infrastructure.${id}.built`, true);
            this.#state.set(`infrastructure.${id}.progress`, needed);
            this.#bus.emit("infra.built", { infraId: id, label: entry?.label });

            // Update credit bank if infra is visible
            if (entry?.visible) {
              this.#state.update("creditBank.infrastructureVisible", v => v + 1);
              this.#state.update("creditBank.total", v => v + 1);
            }
          } else {
            this.#state.set(`infrastructure.${id}.progress`, newProgress);
          }
        }
        continue;
      }

      // Deduct maintenance for built infrastructure
      const entry = this.#registry.get(id);
      if (entry?.maintenanceCost) {
        this.#state.update("reserve", v => +(v - entry.maintenanceCost).toFixed(2));
        this.#bus.emit("infra.maintained", { infraId: id, cost: entry.maintenanceCost });
      }
    }
  }

  #beginBuild(infraId) {
    const entry = this.#registry.get(infraId);
    if (!entry) return;

    const current = this.#state.get(`infrastructure.${infraId}`);
    if (current?.built) return; // already built

    // Check prerequisites
    if (entry.requires) {
      const reqState = this.#state.get(`infrastructure.${entry.requires}`);
      if (!reqState?.built) {
        this.#bus.emit("infra.blocked", {
          infraId,
          requires: entry.requires,
          label: entry.label,
        });
        return;
      }
    }

    if (entry.buildTime <= 1) {
      // Instant build
      this.#state.set(`infrastructure.${infraId}.built`, true);
      this.#state.set(`infrastructure.${infraId}.progress`, 1);
      this.#bus.emit("infra.built", { infraId, label: entry.label });

      if (entry.visible) {
        this.#state.update("creditBank.infrastructureVisible", v => v + 1);
        this.#state.update("creditBank.total", v => v + 1);
      }
    } else {
      // Multi-quarter build: start progress
      this.#state.set(`infrastructure.${infraId}.progress`, 1);
      this.#bus.emit("infra.started", {
        infraId,
        label: entry.label,
        quartersRemaining: entry.buildTime - 1,
      });
    }
  }

  isBuilt(infraId) {
    return this.#state.get(`infrastructure.${infraId}.built`) === true;
  }
}
