// ui/map.js — MapRenderer: Phaser scene for the NYC district map
// Ported from city.html, made data-driven via registry/state.

import { districtEdges } from "../data/entries.js";

const BLOC_COLORS = {
  working:      0x2fc3e8,
  finance:      0x7c8cf8,
  realestate:   0xff6f67,
  progressives: 0xff5fa0,
  labor:        0xffc24d,
};

const HEX_MENU = [
  { id: "visit",   label: "VISIT",   angle: -90,  color: 0x34d399 },
  { id: "listen",  label: "LISTEN",  angle: -30,  color: 0x2fc3e8 },
  { id: "info",    label: "INFO",    angle: 30,   color: 0xffc24d },
  { id: "policy",  label: "POLICY",  angle: 90,   color: 0x7c8cf8 },
  { id: "message", label: "MSG",     angle: 150,  color: 0xff5fa0 },
  { id: "close",   label: "CLOSE",   angle: -150, color: 0x8b94a6 },
];
const HEX_R = 75;
const HEX_SIZE = 19;

export class MapRenderer {
  #bus;
  #state;
  #registry;
  #el;
  #game = null;
  #scene = null;
  #districtSprites = {};
  #mode = "coalition";
  #hexMenu = null;
  #hoverCount = 0;

  constructor(bus, state, registry, el) {
    this.#bus = bus;
    this.#state = state;
    this.#registry = registry;
    this.#el = el;

    bus.on("game.start", () => this.#boot());
    bus.on("policy.resolved", (e) => this.#flashDistricts(e));
    bus.on("hazard.strikes", (e) => this.#onBlizzardStrike(e));
    bus.on("hazard.resolved", (e) => this.#onBlizzardResolved(e));
  }

  #boot() {
    if (typeof Phaser === "undefined") {
      this.#el.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:#8b94a6;padding:30px;text-align:center">Could not load Phaser. Open in a browser with network access.</div>';
      return;
    }

    const self = this;

    class CityScene extends Phaser.Scene {
      preload() {
        // Glow texture
        const g = document.createElement("canvas"); g.width = g.height = 160;
        const gx = g.getContext("2d");
        const grd = gx.createRadialGradient(80, 80, 0, 80, 80, 80);
        grd.addColorStop(0, "rgba(255,255,255,1)");
        grd.addColorStop(.42, "rgba(255,255,255,.5)");
        grd.addColorStop(1, "rgba(255,255,255,0)");
        gx.fillStyle = grd; gx.fillRect(0, 0, 160, 160);
        this.textures.addCanvas("glow", g);

        // Disc texture
        const c = document.createElement("canvas"); c.width = c.height = 64;
        const cx = c.getContext("2d");
        cx.beginPath(); cx.arc(32, 32, 26, 0, Math.PI * 2);
        cx.fillStyle = "#fff"; cx.fill();
        this.textures.addCanvas("disc", c);

        // Ring texture
        const r = document.createElement("canvas"); r.width = r.height = 72;
        const rx = r.getContext("2d");
        rx.beginPath(); rx.arc(36, 36, 31, 0, Math.PI * 2);
        rx.lineWidth = 3.5; rx.strokeStyle = "#fff"; rx.stroke();
        this.textures.addCanvas("ring", r);
      }

      create() {
        self.#scene = this;
        const cam = this.cameras.main;
        cam.setBackgroundColor("#070a0f");
        cam.setBounds(-120, -120, 1264, 940);

        // Draw edges
        const gfx = this.add.graphics();
        gfx.lineStyle(6, 0x223150, 0.9);
        for (const [a, b] of districtEdges) {
          const ea = self.#registry.get(a);
          const eb = self.#registry.get(b);
          if (ea?.position && eb?.position) {
            gfx.beginPath();
            gfx.moveTo(ea.position.x, ea.position.y);
            gfx.lineTo(eb.position.x, eb.position.y);
            gfx.strokePath();
          }
        }
        gfx.lineStyle(2, 0x55749e, 0.75);
        for (const [a, b] of districtEdges) {
          const ea = self.#registry.get(a);
          const eb = self.#registry.get(b);
          if (ea?.position && eb?.position) {
            gfx.beginPath();
            gfx.moveTo(ea.position.x, ea.position.y);
            gfx.lineTo(eb.position.x, eb.position.y);
            gfx.strokePath();
          }
        }

        // Draw districts
        const districtEntries = self.#registry.ofType("district");

        for (const d of districtEntries) {
          const { x, y } = d.position;
          const col = self.#colorFor(d);
          const dr = 9 + d.pop * 3;

          const cont = this.add.container(x, y);
          const glow = this.add.image(0, 0, "glow").setTint(col).setAlpha(.42).setScale((dr * 2.7) / 160).setBlendMode(Phaser.BlendModes.ADD);
          const ring = this.add.image(0, 0, "ring").setTint(0xffffff).setScale((dr * 1.32) / 31).setAlpha(0);
          const disc = this.add.image(0, 0, "disc").setTint(col).setScale(dr / 26);
          const lab = this.add.text(0, dr + 5, d.label, {
            fontFamily: '"Space Grotesk",sans-serif', fontSize: "12px",
            color: "#aeb6c4", fontStyle: "600"
          }).setOrigin(.5, 0);

          cont.add([glow, ring, disc, lab]);

          disc.setInteractive(new Phaser.Geom.Circle(32, 32, 30), Phaser.Geom.Circle.Contains);
          disc.on("pointerover", () => {
            self.#hoverCount++;
            glow.setAlpha(.85); lab.setColor("#fff");
            this.tweens.add({ targets: cont, scale: 1.16, duration: 130, ease: "quad.out" });
            self.#bus.emit("ui.districtHover", { districtId: d.id, label: d.label });
          });
          disc.on("pointerout", () => {
            self.#hoverCount = Math.max(0, self.#hoverCount - 1);
            glow.setAlpha(.42); lab.setColor("#aeb6c4");
            this.tweens.add({ targets: cont, scale: 1, duration: 160, ease: "quad.out" });
            self.#bus.emit("ui.districtUnhover", {});
          });
          disc.on("pointerdown", () => {
            self.#toggleHexMenu(d);
          });

          self.#districtSprites[d.id] = { cont, glow, ring, disc, lab, dr };
        }

        // Pan
        let drag = null;
        this.input.on("pointerdown", p => {
          if (self.#hoverCount > 0) return;
          if (self.#hexMenu) { self.#hideHexMenu(); return; }
          drag = { x: p.x, y: p.y, sx: cam.scrollX, sy: cam.scrollY };
        });
        this.input.on("pointermove", p => {
          if (!drag) return;
          cam.scrollX = drag.sx - (p.x - drag.x) / cam.zoom;
          cam.scrollY = drag.sy - (p.y - drag.y) / cam.zoom;
        });
        this.input.on("pointerup", () => drag = null);
        this.input.on("pointerupoutside", () => drag = null);

        // Zoom
        this.input.on("wheel", (p, o, dx, dy) => {
          const old = cam.zoom;
          const z = Phaser.Math.Clamp(old - dy * 0.0013, 0.6, 2.4);
          const before = cam.getWorldPoint(p.x, p.y);
          cam.zoom = z;
          const after = cam.getWorldPoint(p.x, p.y);
          cam.scrollX += before.x - after.x;
          cam.scrollY += before.y - after.y;
        });

        cam.centerOn(560, 350);
        cam.setZoom(0.92);
        cam.fadeIn(500, 7, 10, 15);

        // Intro animation
        const entries = Object.values(self.#districtSprites);
        entries.forEach((s, i) => {
          s.cont.setScale(0);
          this.tweens.add({
            targets: s.cont, scale: 1,
            delay: 140 + i * 22, duration: 340, ease: "back.out"
          });
        });
      }
    }

    this.#game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this.#el,
      backgroundColor: "#070a0f",
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: "100%", height: "100%" },
      render: { antialias: true },
      scene: CityScene,
    });
  }

  // ── Hex radial menu ──────────────────────────────────

  #toggleHexMenu(districtEntry) {
    if (this.#hexMenu?.districtId === districtEntry.id) {
      this.#hideHexMenu();
      return;
    }
    this.#hideHexMenu();
    this.#showHexMenu(districtEntry);
  }

  #showHexMenu(districtEntry) {
    const scene = this.#scene;
    if (!scene) return;

    const { x, y } = districtEntry.position;
    const sprite = this.#districtSprites[districtEntry.id];

    // Show selection ring
    if (sprite) {
      sprite.ring.setAlpha(0.8);
      scene.tweens.add({
        targets: sprite.ring, alpha: 0.4,
        duration: 800, yoyo: true, repeat: -1, ease: "sine.inOut",
      });
    }

    // Connector lines
    const lineGfx = scene.add.graphics().setDepth(100);

    const items = [];

    HEX_MENU.forEach((opt, i) => {
      const rad = opt.angle * Math.PI / 180;
      const tx = x + HEX_R * Math.cos(rad);
      const ty = y + HEX_R * Math.sin(rad);

      // Connector line
      lineGfx.lineStyle(1.2, opt.color, 0.3);
      lineGfx.beginPath();
      lineGfx.moveTo(x, y);
      lineGfx.lineTo(tx, ty);
      lineGfx.strokePath();

      // Hex item container
      const cont = scene.add.container(x, y).setDepth(101);

      const gfx = scene.add.graphics();
      this.#drawHexShape(gfx, HEX_SIZE, 0x070a0f, 0.94, opt.color, 1, 1.2);

      const label = scene.add.text(0, 0, opt.label, {
        fontFamily: '"Space Mono", monospace',
        fontSize: "8px", fontStyle: "bold", color: "#e9edf3",
      }).setOrigin(0.5);

      cont.add([gfx, label]);
      cont.setInteractive(
        new Phaser.Geom.Circle(0, 0, HEX_SIZE),
        Phaser.Geom.Circle.Contains,
      );

      cont.on("pointerover", () => {
        this.#hoverCount++;
        this.#drawHexShape(gfx, HEX_SIZE, opt.color, 0.95, 0xffffff, 1, 2.2);
        label.setColor("#070a0f");
        scene.tweens.add({ targets: cont, scale: 1.12, duration: 80, ease: "quad.out" });
      });
      cont.on("pointerout", () => {
        this.#hoverCount = Math.max(0, this.#hoverCount - 1);
        this.#drawHexShape(gfx, HEX_SIZE, 0x070a0f, 0.94, opt.color, 1, 1.2);
        label.setColor("#e9edf3");
        scene.tweens.add({ targets: cont, scale: 1, duration: 80, ease: "quad.out" });
      });
      cont.on("pointerdown", () => {
        this.#onHexAction(opt.id, districtEntry);
      });

      // Animate: expand from district center
      cont.setScale(0).setAlpha(0);
      scene.tweens.add({
        targets: cont,
        x: tx, y: ty, scale: 1, alpha: 1,
        duration: 220, ease: "back.out", delay: i * 35,
      });

      items.push(cont);
    });

    // Fade in connector lines
    lineGfx.setAlpha(0);
    scene.tweens.add({ targets: lineGfx, alpha: 1, duration: 200 });

    this.#hexMenu = { districtId: districtEntry.id, items, lineGfx, entry: districtEntry };

    // Also show district detail panel
    this.#bus.emit("ui.districtSelected", { districtId: districtEntry.id });
  }

  #hideHexMenu() {
    if (!this.#hexMenu) return;
    const scene = this.#scene;
    if (!scene) return;

    const { items, lineGfx, districtId, entry } = this.#hexMenu;
    const { x, y } = entry.position;

    // Hide selection ring
    const sprite = this.#districtSprites[districtId];
    if (sprite) {
      scene.tweens.killTweensOf(sprite.ring);
      sprite.ring.setAlpha(0);
    }

    // Collapse items back to center
    items.forEach((cont, i) => {
      cont.removeInteractive();
      scene.tweens.add({
        targets: cont,
        x, y, scale: 0, alpha: 0,
        duration: 150, ease: "quad.in", delay: i * 15,
        onComplete: () => cont.destroy(),
      });
    });

    scene.tweens.add({
      targets: lineGfx, alpha: 0,
      duration: 150,
      onComplete: () => lineGfx.destroy(),
    });

    this.#hexMenu = null;
  }

  #drawHexShape(gfx, size, fillColor, fillAlpha, strokeColor, strokeAlpha, strokeWidth) {
    gfx.clear();
    gfx.fillStyle(fillColor, fillAlpha);
    gfx.lineStyle(strokeWidth, strokeColor, strokeAlpha);
    gfx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 - 30) * Math.PI / 180;
      const px = size * Math.cos(a);
      const py = size * Math.sin(a);
      if (i === 0) gfx.moveTo(px, py);
      else gfx.lineTo(px, py);
    }
    gfx.closePath();
    gfx.fillPath();
    gfx.strokePath();
  }

  #onHexAction(actionId, districtEntry) {
    if (actionId === "info") {
      this.#bus.emit("ui.districtSelected", { districtId: districtEntry.id });
    } else if (actionId !== "close") {
      this.#bus.emit(`ui.${actionId}Requested`, { districtId: districtEntry.id });
    }
    this.#hideHexMenu();
  }

  #colorFor(districtEntry) {
    if (this.#mode === "coalition") {
      return BLOC_COLORS[districtEntry.bloc] || 0xaaaaaa;
    }
    if (this.#mode === "approval") {
      const app = this.#state.get(`districts.${districtEntry.id}.approval`) || 50;
      return heatHex(app);
    }
    if (this.#mode === "hazard") {
      const threatens = this.#registry.outgoing("h_blizzard", "threatens");
      const threat = threatens.find(t => t.entry.id === districtEntry.id);
      const w = threat?.link.weight || 0;
      return heatHex(100 - w * 100);
    }
    return BLOC_COLORS[districtEntry.bloc] || 0xaaaaaa;
  }

  #flashDistricts({ blocEffects, geoModifiers }) {
    if (!this.#scene) return;
    const districtEntries = this.#registry.ofType("district");

    for (const d of districtEntries) {
      const sprite = this.#districtSprites[d.id];
      if (!sprite) continue;

      const blocDelta = blocEffects?.[d.bloc] || 0;
      const geoDelta = geoModifiers?.[d.region] || 0;
      const total = blocDelta + geoDelta;
      if (Math.abs(total) < 0.5) continue;

      const up = total > 0;
      const flashColor = up ? 0x34d399 : 0xff5a52;

      sprite.disc.setTint(flashColor);
      sprite.glow.setTint(flashColor).setAlpha(.85);

      this.#scene.tweens.add({
        targets: sprite.cont, scale: 1.28, duration: 150,
        yoyo: true, ease: "quad.out"
      });

      this.#scene.time.delayedCall(500, () => {
        sprite.glow.setAlpha(.42);
        sprite.disc.setTint(this.#colorFor(d));
        sprite.glow.setTint(this.#colorFor(d));
      });

      // Floating number
      const ft = this.#scene.add.text(d.position.x, d.position.y - sprite.dr, (up ? "+" : "") + Math.round(total), {
        fontFamily: '"Space Mono",monospace', fontSize: "15px", fontStyle: "bold",
        color: up ? "#4ade80" : "#ff7b73"
      }).setOrigin(.5);

      this.#scene.tweens.add({
        targets: ft, y: ft.y - 30, alpha: 0,
        duration: 950, ease: "quad.out",
        onComplete: () => ft.destroy()
      });
    }
  }

  #onBlizzardStrike({ districtDamage }) {
    if (!this.#scene) return;

    for (const [dId, dmg] of Object.entries(districtDamage)) {
      const sprite = this.#districtSprites[dId];
      if (!sprite) continue;

      const entry = this.#registry.get(dId);
      if (!entry) continue;

      if (dmg.protected) {
        // Green shield pulse
        sprite.disc.setTint(0x34d399);
        sprite.glow.setTint(0x34d399).setAlpha(.9);
        this.#scene.tweens.add({
          targets: sprite.cont, scale: 1.2, duration: 300,
          yoyo: true, ease: "quad.out"
        });
      } else if (dmg.value > 2) {
        // Red damage pulse
        sprite.disc.setTint(0xff3333);
        sprite.glow.setTint(0xff3333).setAlpha(.95);
        this.#scene.tweens.add({
          targets: sprite.cont, scale: 1.35, duration: 200,
          yoyo: true, repeat: 2, ease: "quad.out"
        });
      }

      // Reset after animation
      this.#scene.time.delayedCall(1500, () => {
        sprite.glow.setAlpha(.42);
        sprite.disc.setTint(this.#colorFor(entry));
        sprite.glow.setTint(this.#colorFor(entry));
      });
    }
  }

  #onBlizzardResolved() {
    // Repaint all districts to current approval state
    if (!this.#scene) return;
    this.#scene.time.delayedCall(2000, () => {
      for (const [dId, sprite] of Object.entries(this.#districtSprites)) {
        const entry = this.#registry.get(dId);
        if (entry) {
          sprite.disc.setTint(this.#colorFor(entry));
          sprite.glow.setTint(this.#colorFor(entry));
        }
      }
    });
  }

  setMode(mode) {
    this.#mode = mode;
    for (const [dId, sprite] of Object.entries(this.#districtSprites)) {
      const entry = this.#registry.get(dId);
      if (entry) {
        const col = this.#colorFor(entry);
        sprite.disc.setTint(col);
        sprite.glow.setTint(col);
      }
    }
    this.#bus.emit("ui.viewModeChanged", { mode });
  }
}

function heatHex(a) {
  const c1 = [0xff, 0x5a, 0x52], c2 = [0xff, 0xc2, 0x4d], c3 = [0x34, 0xd3, 0x99];
  let A, B, t;
  if (a < 50) { A = c1; B = c2; t = a / 50; }
  else { A = c2; B = c3; t = (a - 50) / 50; }
  const r = Math.round(A[0] + (B[0] - A[0]) * t);
  const g = Math.round(A[1] + (B[1] - A[1]) * t);
  const b = Math.round(A[2] + (B[2] - A[2]) * t);
  return (r << 16) | (g << 8) | b;
}
