// ui/cards.js — CardUI: Frostpunk-style bottom card tray
// Policy cards and framing cards slide up from the bottom.

export class CardUI {
  #bus;
  #state;
  #registry;
  #el;

  constructor(bus, state, registry, el) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;
    this.#el = el;

    bus.on("policy.available", (e) => this.#showPolicies(e));
    bus.on("campaign.available", (e) => this.#showFramings(e));
  }

  #showPolicies({ policies }) {
    const container = this.#makeContainer();
    container.innerHTML = `
      <div class="card-header">
        <span class="card-phase-label">Decision</span>
        <span class="card-prompt">Choose a policy</span>
      </div>
      <div class="card-options">${policies.map(p => this.#renderPolicy(p)).join("")}</div>
    `;
    requestAnimationFrame(() => container.classList.add("show"));
    this.#bindClicks(container, "policy.chosen", "policyId");
  }

  #showFramings({ framings }) {
    const container = this.#makeContainer();
    container.innerHTML = `
      <div class="card-header">
        <span class="card-phase-label">Campaign</span>
        <span class="card-prompt">How do you sell it?</span>
      </div>
      <div class="card-options">${framings.map(f => this.#renderFraming(f)).join("")}</div>
    `;
    requestAnimationFrame(() => container.classList.add("show"));
    this.#bindClicks(container, "campaign.chosen", "framingId");
  }

  #renderPolicy(p) {
    const pos = p.budgetDelta >= 0;
    const budgetStr = (pos ? "+$" : "-$") + Math.abs(p.budgetDelta).toFixed(1) + "B";
    const budgetClass = pos ? "pos" : "neg";

    const names = { working: "Work", finance: "Biz", realestate: "RE", progressives: "Prog", labor: "Labor" };
    const arrows = Object.entries(p.blocEffects || {}).map(([bloc, val]) => {
      if (val === 0) return "";
      const cls = val > 0 ? "arr-up" : "arr-down";
      return `<span class="arr ${cls}">${names[bloc]} ${val > 0 ? "&#9650;" : "&#9660;"}</span>`;
    }).filter(Boolean).join("");

    const infraTag = p.buildsInfra
      ? `<span class="card-tag infra-tag">&#9881; ${this.#registry.get(p.buildsInfra)?.label || p.buildsInfra}</span>`
      : "";

    return `
      <button class="card policy-card" data-id="${p.id}">
        <div class="card-title">${p.label}</div>
        <div class="card-desc">${p.desc}</div>
        <div class="card-budget ${budgetClass}">${budgetStr} reserve</div>
        <div class="card-arrows">${arrows}</div>
        ${infraTag}
      </button>
    `;
  }

  #renderFraming(f) {
    const costStr = f.reserveCost > 0 ? `-$${f.reserveCost.toFixed(2)}B` : "Free";
    const costClass = f.reserveCost > 0 ? "neg" : "pos";

    const creditDots = Array.from({length: 3}, (_, i) => {
      const filled = f.creditMultiplier >= (i + 1) * 0.5;
      return `<span style="color:${filled ? 'var(--accent)' : 'var(--line)'}">&#9679;</span>`;
    }).join("");

    return `
      <button class="card framing-card" data-id="${f.id}">
        <div class="card-title">${f.label}</div>
        <div class="card-pitch">"${f.pitch}"</div>
        <div class="card-budget ${costClass}">${costStr}</div>
        <div class="card-credit">Credit: ${creditDots}</div>
      </button>
    `;
  }

  #makeContainer() {
    const old = document.getElementById("card-tray");
    if (old) old.remove();
    const el = document.createElement("div");
    el.id = "card-tray";
    el.className = "card-tray";
    this.#el.appendChild(el);
    return el;
  }

  #bindClicks(container, eventName, idKey) {
    container.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        container.classList.remove("show");
        setTimeout(() => container.remove(), 350);
        this.#bus.emit(eventName, { [idKey]: id });
      });
    });
  }
}
