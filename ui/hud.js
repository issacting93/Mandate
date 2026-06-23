// ui/hud.js — HUD: Frostpunk-style top bar + bloc bar + left objective panel
// Top bar: scenario name, quarter, resources, weather
// Left panel: blizzard countdown, infrastructure checklist

import { QUARTER_NARRATIVES } from "../data/blizzard.js";

const BLOC_META = {
  working:      { name: "Working",  short: "WORK", css: "var(--working)" },
  finance:      { name: "Business", short: "BIZ",  css: "var(--finance)" },
  realestate:   { name: "Real Est", short: "RE",   css: "var(--realestate)" },
  progressives: { name: "Progress", short: "PROG", css: "var(--progressives)" },
  labor:        { name: "Labor",    short: "LAB",  css: "var(--labor)" },
};

const INFRA_LABELS = {
  p_plows:    "Snow-Removal Fleet",
  p_salt:     "Salt Reserves",
  p_grid:     "Grid Hardening",
  p_shelter:  "Emergency Shelters",
  p_warning:  "Early Warning System",
  p_outreach: "Vulnerable Outreach",
};

export class HUD {
  #bus;
  #state;
  #el;

  constructor(bus, state, el) {
    this.#bus = bus;
    this.#state = state;
    this.#el = el;
    this.#render();

    bus.on("state.changed", () => this.#update());
    bus.on("coalition.updated", () => this.#update());
    bus.on("coalition.decayed", () => this.#update());
    bus.on("clock.quarterStart", () => this.#update());
    bus.on("hazard.warning", (e) => this.#updateWeather(e));
    bus.on("hazard.approaching", (e) => this.#updateWeather(e));
    bus.on("infra.built", () => this.#update());
  }

  #render() {
    this.#el.innerHTML = `
      <!-- TOP BAR -->
      <div class="topbar">
        <div class="topbar-left">
          <span class="topbar-scenario">Mandate</span>
          <span class="topbar-time" id="hud-time">WEEK: 1 &middot; Q1</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-res" id="hud-approval-res">
            <span class="icon">&#9733;</span>
            <span id="hud-approval-val">52%</span>
          </div>
          <div class="topbar-res" id="hud-reserve-res">
            <span class="icon">&#9670;</span>
            <span>$</span><span id="hud-reserve-val">5.0</span><span>B</span>
          </div>
        </div>
        <div class="topbar-right">
          <span class="topbar-weather-icon" id="hud-weather-icon">&#10052;</span>
          <span class="topbar-temp" id="hud-temp"></span>
        </div>
      </div>

      <!-- BLOC BAR -->
      <div class="blocbar" id="hud-blocs"></div>

      <!-- LEFT OBJECTIVE PANEL -->
      <div class="objectives" id="hud-objectives"></div>

      <!-- DISTRICT DETAIL (right side, hidden until click) -->
      <div class="district-panel" id="hud-district"></div>
    `;
    this.#update();
  }

  #update() {
    const q = this.#state.get("quarter") || 1;
    const citywide = this.#state.get("citywide") || 50;
    const reserve = this.#state.get("reserve") || 0;
    const narr = QUARTER_NARRATIVES[q];
    const season = narr?.season || "spring";

    // Top bar time
    const timeEl = document.getElementById("hud-time");
    if (timeEl) {
      const seasonCap = season.charAt(0).toUpperCase() + season.slice(1);
      timeEl.innerHTML = `${seasonCap} &middot; Q${q}`;
    }

    // Approval
    const appEl = document.getElementById("hud-approval-val");
    const appRes = document.getElementById("hud-approval-res");
    if (appEl) appEl.textContent = `${citywide}%`;
    if (appRes) {
      appRes.className = "topbar-res " + (citywide < 35 ? "bad" : citywide < 50 ? "warn" : "good");
    }

    // Reserve
    const resEl = document.getElementById("hud-reserve-val");
    const resRes = document.getElementById("hud-reserve-res");
    if (resEl) resEl.textContent = reserve.toFixed(1);
    if (resRes) {
      resRes.className = "topbar-res " + (reserve < 0 ? "bad" : reserve < 1 ? "warn" : "");
    }

    // Bloc bar
    const blocsEl = document.getElementById("hud-blocs");
    if (blocsEl) {
      const blocs = this.#state.get("blocs");
      blocsEl.innerHTML = Object.entries(blocs).map(([key, data]) => {
        const meta = BLOC_META[key];
        return `<div class="blocbar-item">
          <span class="blocbar-dot" style="background:${meta.css}"></span>
          <span class="blocbar-name">${meta.name}</span>
          <span class="blocbar-val">${Math.round(data.approval)}%</span>
        </div>`;
      }).join("");
    }

    // Objectives panel
    this.#updateObjectives(q);
  }

  #updateObjectives(quarter) {
    const el = document.getElementById("hud-objectives");
    if (!el) return;

    const quartersLeft = 4 - quarter;
    const infra = this.#state.get("infrastructure");
    const hazard = this.#state.get("hazard");
    const creditBank = this.#state.get("creditBank");

    // Countdown
    let countdownHtml = "";
    if (!hazard.struck) {
      const urgency = quartersLeft <= 1 ? "var(--bad)" : quartersLeft <= 2 ? "var(--warn)" : "var(--frost)";
      countdownHtml = `
        <div class="obj-countdown">
          <div class="obj-countdown-label">
            <span class="icon">&#10052;</span> Blizzard arriving in
          </div>
          <div class="obj-countdown-value" style="color:${urgency}">
            ${quartersLeft > 0 ? quartersLeft + " QUARTER" + (quartersLeft > 1 ? "S" : "") : "NOW"}
          </div>
          <div class="obj-countdown-sub">
            Severity: ${hazard.currentSeverity} / ${hazard.baseSeverity}
          </div>
        </div>
      `;
    } else {
      countdownHtml = `
        <div class="obj-countdown">
          <div class="obj-countdown-label">
            <span class="icon">&#10052;</span> Blizzard
          </div>
          <div class="obj-countdown-value" style="color:var(--frost)">PASSED</div>
        </div>
      `;
    }

    // Infrastructure checklist
    const infraItems = Object.entries(INFRA_LABELS).map(([id, label]) => {
      const data = infra[id];
      const built = data?.built;
      const inProgress = data?.progress > 0 && !built;
      const cls = built ? "done" : "";
      const bulletCls = built ? "done" : "";
      const statusText = built ? "" : inProgress ? " (building...)" : "";
      return `<div class="obj-item ${cls}">
        <span class="obj-bullet ${bulletCls}"></span>
        <span class="obj-text">${label}${statusText}</span>
      </div>`;
    }).join("");

    // Credit bank
    const creditTotal = creditBank?.total || 0;
    const creditMax = 10;
    const creditPips = Array.from({length: 5}, (_, i) => {
      const filled = creditTotal >= (i + 1) * 2;
      const half = creditTotal >= (i * 2) + 1 && !filled;
      return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 1px;
        background:${filled ? 'var(--accent)' : half ? 'rgba(201,164,76,.4)' : 'rgba(255,255,255,.08)'};
        border:1px solid ${filled || half ? 'var(--accent)' : 'var(--line)'}"></span>`;
    }).join("");

    el.innerHTML = `
      ${countdownHtml}
      <div class="obj-section">
        <div class="obj-section-head">
          <span class="icon">&#9881;</span> Prepare for the blizzard
        </div>
        ${infraItems}
      </div>
      <div class="obj-section">
        <div class="obj-section-head">
          <span class="icon">&#9733;</span> Public credit
        </div>
        <div style="display:flex;align-items:center;gap:8px;padding-left:2px">
          ${creditPips}
          <span style="font-family:'Space Mono',monospace;font-size:10px;color:var(--accent);font-weight:700">${creditTotal}</span>
        </div>
        <div style="font-size:10px;color:var(--mut);margin-top:4px;padding-left:2px">
          Can the public see your preparation?
        </div>
      </div>
    `;
  }

  #updateWeather({ quartersUntil, currentSeverity }) {
    const iconEl = document.getElementById("hud-weather-icon");
    const tempEl = document.getElementById("hud-temp");
    if (tempEl) {
      if (quartersUntil !== undefined && quartersUntil > 0) {
        tempEl.textContent = `Storm: ${quartersUntil}Q`;
        tempEl.style.color = quartersUntil <= 1 ? "var(--bad)" : "var(--warn)";
      } else {
        tempEl.textContent = "IMMINENT";
        tempEl.style.color = "var(--bad)";
      }
    }
    if (iconEl) {
      iconEl.style.color = quartersUntil <= 1 ? "var(--bad)" : "var(--warn)";
    }
  }

  showDistrict(districtEntry, state, registry) {
    const el = document.getElementById("hud-district");
    if (!el || !districtEntry) { el?.classList.remove("show"); return; }

    const approval = state.get(`districts.${districtEntry.id}.approval`) || 50;
    const blocKey = districtEntry.bloc;
    const blocMeta = BLOC_META[blocKey];
    const appColor = approval >= 60 ? "var(--good)" : approval >= 45 ? "var(--ink)" : "var(--bad)";

    // Check what infrastructure protects this district
    const protectors = registry.incoming(districtEntry.id, "protects");
    const protHtml = protectors.map(({ entry }) => {
      const built = state.get(`infrastructure.${entry.id}.built`);
      return `<div class="district-prot-item ${built ? 'active' : 'inactive'}">
        ${built ? '&#9679;' : '&#9675;'} ${entry.label}
      </div>`;
    }).join("");

    el.innerHTML = `
      <div class="district-title">${districtEntry.label}</div>
      <div class="district-body">
        <div class="district-bloc">
          <span class="dot" style="background:${blocMeta.css}"></span>
          ${blocMeta.name} lean
        </div>
        <div class="district-approval" style="color:${appColor}">${Math.round(approval)}%</div>
        <div class="district-approval-label">Local Approval</div>
        <div class="district-concern">${districtEntry.concern}</div>
        ${protHtml ? `<div class="district-protection">
          <div class="district-prot-label">Protection</div>
          ${protHtml}
        </div>` : ""}
      </div>
    `;
    el.classList.add("show");
  }

  hideDistrict() {
    document.getElementById("hud-district")?.classList.remove("show");
  }
}
