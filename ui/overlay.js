// ui/overlay.js — Cinematic overlays in Frostpunk's "LAW PASSED" style
// Dark vignette backdrop, centered text, decorative rules, pill buttons.

import { QUARTER_NARRATIVES } from "../data/blizzard.js";

export class OverlayUI {
  #bus;
  #state;
  #el;

  constructor(bus, state, el) {
    this.#bus = bus;
    this.#state = state;
    this.#el = el;

    bus.on("clock.quarterStart", (e) => this.#showQuarterIntro(e));
    bus.on("scenario.triggered", (e) => this.#showEvent(e));
    bus.on("hazard.strikes", (e) => this.#showBlizzardStrike(e));
    bus.on("hazard.resolved", (e) => this.#showBlizzardResult(e));
    bus.on("game.win", (e) => this.#showEndScreen(e, true));
    bus.on("game.lose", (e) => this.#showEndScreen(e, false));
    bus.on("infra.built", (e) => this.#showInfraBuilt(e));
  }

  // ─── Quarter Intro ───────────────────────────────────────
  #showQuarterIntro({ quarter, narrative }) {
    const seasonEmoji = { spring: "&#127800;", summer: "&#9728;", fall: "&#127810;", winter: "&#10052;" };
    const emoji = seasonEmoji[narrative.season] || "";

    this.#showCinematic({
      badge: `Quarter ${quarter}`,
      title: narrative.headline,
      titleClass: quarter === 4 ? "frost" : "",
      body: narrative.briefing,
      weatherTag: narrative.weatherNote,
      btnText: "I see",
      btnClass: quarter >= 3 ? "golden" : "",
      onDismiss: () => this.#bus.emit("ui.quarterIntroDismissed", {}),
    });
  }

  // ─── Scenario Event ──────────────────────────────────────
  #showEvent({ headline, narrative }) {
    this.#showCinematic({
      badge: "Breaking News",
      title: headline,
      titleClass: "golden",
      body: narrative,
      btnText: "I see",
      onDismiss: () => this.#bus.emit("ui.eventDismissed", {}),
    });
  }

  // ─── Blizzard Strike ─────────────────────────────────────
  #showBlizzardStrike({ finalSeverity, mitigation, outcomes }) {
    const sevLabel = finalSeverity >= 55 ? "CATASTROPHIC"
      : finalSeverity >= 40 ? "SEVERE"
      : finalSeverity >= 25 ? "MODERATE"
      : finalSeverity >= 10 ? "MINOR"
      : "MITIGATED";

    const sevClass = finalSeverity >= 40 ? "danger" : finalSeverity >= 25 ? "golden" : "success";

    const outcomesHtml = outcomes.map(o => {
      const cls = o.approvalHit < -5 ? "bad" : o.id === "o_invisible_success" ? "good" : "warn";
      return `<span class="ov-outcome ${cls}">${o.label}</span>`;
    }).join("");

    this.#showCinematic({
      badge: "&#10052; The Blizzard",
      title: sevLabel,
      titleClass: sevClass,
      body: `Base severity ${70} &mdash; Mitigation ${mitigation} &mdash; Final ${finalSeverity}`,
      extraHtml: `<div class="ov-outcomes">${outcomesHtml}</div>`,
      btnText: "See the aftermath",
      btnClass: "golden",
      onDismiss: () => {},
    });
  }

  // ─── Blizzard Aftermath ──────────────────────────────────
  #showBlizzardResult({ creditResult, finalSeverity }) {
    setTimeout(() => {
      const type = creditResult.type;
      const titleClass = type === "credit_claimed" ? "success"
        : type === "credit_partial" ? "golden"
        : type === "credit_missed" ? "danger"
        : "danger";

      // Apply credit result to all blocs
      if (creditResult.approvalDelta) {
        const blocs = this.#state.get("blocs");
        for (const key of Object.keys(blocs)) {
          const path = `blocs.${key}.approval`;
          const old = this.#state.get(path);
          this.#state.set(path, Math.max(0, Math.min(100, old + creditResult.approvalDelta)));
        }
      }

      const deltaHtml = creditResult.approvalDelta
        ? `<div style="font-family:'Space Mono',monospace;font-size:22px;font-weight:700;margin:10px 0;color:${creditResult.approvalDelta > 0 ? 'var(--good)' : 'var(--bad)'}">${creditResult.approvalDelta > 0 ? '+' : ''}${creditResult.approvalDelta} Approval</div>`
        : "";

      this.#showCinematic({
        badge: "The Aftermath",
        title: creditResult.headline || "Damage Report",
        titleClass,
        body: creditResult.subhead || "",
        extraHtml: deltaHtml,
        btnText: "Continue",
        onDismiss: () => this.#bus.emit("ui.eventDismissed", {}),
      });
    }, 600);
  }

  // ─── End Screen ──────────────────────────────────────────
  #showEndScreen(event, isWin) {
    setTimeout(() => {
      const citywide = this.#state.get("citywide");
      const reserve = this.#state.get("reserve");
      const history = this.#state.get("history") || [];
      const type = event.type || (isWin ? "reelected" : "primaried");

      const titles = {
        reelected: "Four More Years",
        primaried: "Primaried Out",
        recalled: "Recalled",
        bankrupt: "State Takeover",
      };
      const descriptions = {
        reelected: "The blizzard came and went. You kept the coalition together and the budget intact. New York re-elects you.",
        primaried: "You survived the term, but the city wasn't convinced. Your own party runs someone else.",
        recalled: "Approval cratered. The city council triggers a recall vote. You're out.",
        bankrupt: "The city's coffers ran dry. Albany sends in a fiscal control board.",
      };

      const titleClass = isWin ? "golden" : "danger";

      const statsHtml = `
        <div class="end-stats">
          <div class="end-stat">
            <span class="end-stat-label">Final Approval</span>
            <span class="end-stat-val" style="color:${citywide >= 50 ? 'var(--good)' : 'var(--bad)'}">${citywide}%</span>
          </div>
          <div class="end-stat">
            <span class="end-stat-label">City Reserve</span>
            <span class="end-stat-val" style="color:${reserve >= 0 ? 'var(--good)' : 'var(--bad)'}">$${reserve.toFixed(1)}B</span>
          </div>
          <div class="end-stat">
            <span class="end-stat-label">Decisions</span>
            <span class="end-stat-val">${history.filter(h => h.type === "policy").length}</span>
          </div>
        </div>
      `;

      this.#showCinematic({
        badge: isWin ? "Victory" : "Defeat",
        title: titles[type] || type,
        titleClass,
        body: descriptions[type] || "",
        extraHtml: statsHtml,
        btnText: "Play Again",
        btnClass: "golden",
        onDismiss: () => location.reload(),
      });
    }, 1000);
  }

  // ─── Infrastructure Toast ────────────────────────────────
  #showInfraBuilt({ label }) {
    const toast = document.createElement("div");
    toast.className = "toast infra-toast show";
    toast.innerHTML = `&#9679; <b>${label}</b> completed`;
    this.#el.appendChild(toast);
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 2500);
  }

  // ─── Shared Cinematic Builder ────────────────────────────
  #showCinematic({ badge, title, titleClass = "", body, weatherTag, extraHtml, btnText, btnClass = "", onDismiss }) {
    // Clear previous
    this.#el.innerHTML = "";

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "overlay-backdrop";
    this.#el.appendChild(backdrop);

    // Panel
    const panel = document.createElement("div");
    panel.className = "overlay-panel";

    const weatherHtml = weatherTag ? `<div class="ov-weather-tag">${weatherTag}</div>` : "";
    const extraBlock = extraHtml || "";

    panel.innerHTML = `
      <div class="ov-badge">${badge}</div>
      <div class="ov-rule"><span class="diamond"></span></div>
      <div class="ov-title ${titleClass}">${title}</div>
      <div class="ov-rule"><span class="diamond"></span></div>
      ${body ? `<div class="ov-body">${body}</div>` : ""}
      ${weatherHtml}
      ${extraBlock}
      <div><button class="ov-btn ${btnClass}" id="ov-dismiss">${btnText}</button></div>
    `;
    this.#el.appendChild(panel);

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add("show");
      panel.classList.add("show");
    });

    // Dismiss
    document.getElementById("ov-dismiss").addEventListener("click", () => {
      backdrop.classList.remove("show");
      panel.classList.remove("show");
      setTimeout(() => {
        backdrop.remove();
        panel.remove();
        if (onDismiss) onDismiss();
      }, 400);
    });
  }
}
