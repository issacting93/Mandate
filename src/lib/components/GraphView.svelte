<script>
  import { onMount, onDestroy } from 'svelte';
  import { game } from '$lib/stores/game.js';
  import { entries } from '$data/entries.js';
  import { links } from '$data/links.js';
  import { districtMap, DISTRICTS } from '$data/districts.js';

  let { visible = false } = $props();
  let canvas;
  let animFrame;

  // ── Node type colors ──
  const TYPES = {
    season:           { label: 'Season',            c: '#8ea2c0' },
    hazard:           { label: 'Hazard',            c: '#ff6b63' },
    concern:          { label: 'Concern',           c: '#e8c547' },
    district:         { label: 'District',          c: '#2fc3e8' },
    infrastructure:   { label: 'Infrastructure',    c: '#2A9E5C' },
    bloc:             { label: 'Bloc',              c: '#ff5fa0' },
    resource:         { label: 'Resource',          c: '#ffc24d' },
    policy:           { label: 'Policy',            c: '#ff9f43' },
    outcome:          { label: 'Outcome',           c: '#c084fc' },
    character:        { label: 'Character',         c: '#f472b6' },
    insight_template: { label: 'Insight',           c: '#a78bfa' },
    tile:             { label: 'Tile',              c: '#38bdf8' },
  };

  const ET = {
    occurs_in:     { bk: 'meta',      c: '#5a6b86', dash: false },
    threatens:     { bk: 'threat',    c: '#ff6b63', dash: false },
    cascades:      { bk: 'threat',    c: '#ff8a5c', dash: true },
    causes:        { bk: 'threat',    c: '#ff6b63', dash: false },
    exposed_to:    { bk: 'threat',    c: '#e06b6b', dash: false },
    mitigates:     { bk: 'defense',   c: '#2A9E5C', dash: false },
    protects:      { bk: 'defense',   c: '#2A9E5C', dash: false },
    requires:      { bk: 'defense',   c: '#cfd6e4', dash: false },
    costs:         { bk: 'meta',      c: '#ffc24d', dash: false },
    builds:        { bk: 'build',     c: '#ff9f43', dash: false },
    targets:       { bk: 'build',     c: '#ff9f43', dash: true },
    affects:       { bk: 'meta',      c: '#c084fc', dash: false },
    cares_about:   { bk: 'concern',   c: '#e8c547', dash: true },
    lives_in:      { bk: 'knowledge', c: '#f472b6', dash: false },
    knows_about:   { bk: 'knowledge', c: '#a78bfa', dash: false },
    discovered_in: { bk: 'knowledge', c: '#a78bfa', dash: true },
    categorized_as:{ bk: 'knowledge', c: '#e8c547', dash: true },
    unlocks:       { bk: 'build',     c: '#38bdf8', dash: false },
    enables:       { bk: 'build',     c: '#ff9f43', dash: true },
    implements:    { bk: 'build',     c: '#38bdf8', dash: false },
    prevents:      { bk: 'defense',   c: '#2A9E5C', dash: false },
    adjacent_to:   { bk: 'spatial',   c: '#4b5563', dash: true },
  };

  const BUCKETS = {
    threat:    { label: 'Threats',    c: '#ff6b63', on: true },
    defense:   { label: 'Defense',    c: '#2A9E5C', on: true },
    build:     { label: 'Build',      c: '#ff9f43', on: true },
    knowledge: { label: 'Knowledge',  c: '#a78bfa', on: true },
    concern:   { label: 'Concerns',   c: '#e8c547', on: false },
    spatial:   { label: 'Spatial',    c: '#4b5563', on: false },
    meta:      { label: 'Meta',       c: '#5a6b86', on: false },
  };

  let filterOn = $state(Object.fromEntries(Object.entries(BUCKETS).map(([k, v]) => [k, v.on])));
  let showDiscovered = $state(true);

  // ── Determine which nodes the player has "discovered" ──
  function isDiscovered(nodeId) {
    const g = $game;
    // Districts: visited
    const d = districtMap[nodeId];
    if (d) return d.lastVisited != null;
    // Characters: visited their district
    const entry = entries[nodeId];
    if (entry?.type === 'character') {
      const dd = districtMap[entry.districtId];
      return dd?.lastVisited != null;
    }
    // Insights: discovered in game state
    if (entry?.type === 'insight_template') {
      return (g.insights || []).some(i => i.text === entry.text || i.districtId === entry.text?.districtId);
    }
    // Everything else: always visible (infrastructure, hazards, policies, etc.)
    return true;
  }

  // ── Build graph from live data ──
  function buildGraph() {
    const allEntries = Object.values(entries);
    const nodes = allEntries.map(e => ({
      id: e.id, label: e.label, type: e.type,
      x: 0, y: 0, vx: 0, vy: 0, deg: 0, pinned: false,
    }));
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    const edges = links
      .filter(l => nodeMap[l.source] && nodeMap[l.target])
      .map(l => ({ s: nodeMap[l.source], t: nodeMap[l.target], type: l.type }));
    edges.forEach(e => { e.s.deg++; e.t.deg++; });

    // Build adjacency
    const adj = {};
    nodes.forEach(n => adj[n.id] = new Set());
    edges.forEach(e => { adj[e.s.id].add(e.t.id); adj[e.t.id].add(e.s.id); });

    // Seeded layout
    let seed = 7;
    const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const W = 1200, H = 860;
    nodes.forEach(n => { n.x = W/2 + (rng()-0.5) * W * 0.7; n.y = H/2 + (rng()-0.5) * H * 0.7; });

    return { nodes, edges, nodeMap, adj, W, H };
  }

  onMount(() => {
    if (!canvas) return;
    const { nodes, edges, nodeMap, adj, W, H } = buildGraph();
    const ctx = canvas.getContext('2d');
    let DPR = 1, VW = 0, VH = 0;
    const T = { x: 0, y: 0, k: 1 };
    let selected = null, hover = null, settle = 320;

    function resize() {
      const r = canvas.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = r.width * DPR; canvas.height = r.height * DPR;
      VW = r.width; VH = r.height;
    }

    function fitView() {
      resize();
      const k = Math.min(VW / W, VH / H) * 0.88;
      T.k = k; T.x = (VW - W * k) / 2; T.y = (VH - H * k) / 2;
    }

    function toWorld(px, py) { return { x: (px - T.x) / T.k, y: (py - T.y) / T.k }; }
    function radiusOf(n) { return 5 + Math.min(8, n.deg * 0.7); }

    function pick(px, py) {
      const w = toWorld(px, py);
      let best = null, bd = 1e9;
      nodes.forEach(n => {
        const d = Math.hypot(n.x - w.x, n.y - w.y);
        if (d < radiusOf(n) + 6 && d < bd) { bd = d; best = n; }
      });
      return best;
    }

    function visibleEdge(e) { const et = ET[e.type]; return et ? filterOn[et.bk] : false; }

    function tick() {
      const REP = 7000, L = 90, KS = 0.016, G = 0.0014;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y, d2 = dx*dx + dy*dy + 0.01, d = Math.sqrt(d2);
          let f = REP / d2; if (f > 5) f = 5;
          const fx = f * dx / d, fy = f * dy / d;
          if (!a.pinned) { a.vx += fx; a.vy += fy; }
          if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
        }
      }
      edges.forEach(e => {
        let dx = e.t.x - e.s.x, dy = e.t.y - e.s.y, d = Math.hypot(dx, dy) + 0.01;
        const f = KS * (d - L), fx = f * dx / d, fy = f * dy / d;
        if (!e.s.pinned) { e.s.vx += fx; e.s.vy += fy; }
        if (!e.t.pinned) { e.t.vx -= fx; e.t.vy -= fy; }
      });
      nodes.forEach(n => {
        if (n.pinned) return;
        n.vx += (W/2 - n.x) * G; n.vy += (H/2 - n.y) * G;
        n.vx *= 0.84; n.vy *= 0.84;
        n.vx = Math.max(-7, Math.min(7, n.vx)); n.vy = Math.max(-7, Math.min(7, n.vy));
        n.x += n.vx; n.y += n.vy;
      });
    }

    function draw() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, VW, VH);
      ctx.save();
      ctx.translate(T.x, T.y); ctx.scale(T.k, T.k);

      const focusSet = selected ? adj[selected.id] : null;

      // Edges
      edges.forEach(e => {
        if (!visibleEdge(e)) return;
        const meta = ET[e.type];
        const inFocus = selected ? (e.s === selected || e.t === selected) : true;
        ctx.globalAlpha = selected ? (inFocus ? 0.9 : 0.04) : 0.3;
        ctx.strokeStyle = meta.c;
        ctx.lineWidth = inFocus && selected ? 2 : 1;
        if (meta.dash) ctx.setLineDash([5, 4]); else ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(e.s.x, e.s.y); ctx.lineTo(e.t.x, e.t.y); ctx.stroke();
      });
      ctx.setLineDash([]); ctx.globalAlpha = 1;

      // Nodes
      nodes.forEach(n => {
        const type = TYPES[n.type];
        if (!type) return;
        const col = type.c;
        const r = radiusOf(n);
        const isSel = selected === n;
        const isNbr = focusSet?.has(n.id);
        const dim = selected && !isSel && !isNbr;
        const discovered = isDiscovered(n.id);
        const hidden = showDiscovered && !discovered;

        ctx.globalAlpha = dim ? 0.1 : hidden ? 0.15 : 1;

        // Glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.4);
        g.addColorStop(0, col + (hidden ? '22' : '66'));
        g.addColorStop(1, col + '00');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.4, 0, 7); ctx.fill();

        // Core
        if (hidden) {
          // Hidden: dashed outline, no fill
          ctx.strokeStyle = col;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.fill();
        }

        if (isSel || n === hover) {
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.stroke();
        }

        // Label
        if (!dim) {
          ctx.globalAlpha = hidden ? 0.2 : (selected && !isSel && !isNbr ? 0.3 : 0.9);
          ctx.font = (isSel ? '600 11px' : '500 10px') + ' "Space Grotesk", sans-serif';
          ctx.fillStyle = hidden ? '#555555' : (isSel ? '#fff' : '#aeb6c4');
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(hidden ? '???' : n.label, n.x + r + 4, n.y);
        }
      });

      ctx.globalAlpha = 1; ctx.restore();
    }

    function frame() {
      if (!visible) { animFrame = requestAnimationFrame(frame); return; }
      if (settle > 0) { for (let s = 0; s < 3; s++) tick(); settle--; }
      draw();
      animFrame = requestAnimationFrame(frame);
    }

    // ── Interaction ──
    let drag = null, pan = null, moved = false, downPt = null;

    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId);
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      downPt = { px, py }; moved = false;
      const n = pick(px, py);
      if (n) { drag = { n }; } else { pan = { px, py, tx: T.x, ty: T.y }; }
    });

    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      if (downPt && Math.hypot(px - downPt.px, py - downPt.py) > 4) moved = true;
      if (drag) {
        const w = toWorld(px, py); drag.n.x = w.x; drag.n.y = w.y;
        drag.n.vx = drag.n.vy = 0; drag.n.pinned = true; settle = Math.max(settle, 40);
      } else if (pan) {
        T.x = pan.tx + (px - pan.px); T.y = pan.ty + (py - pan.py);
      } else {
        hover = pick(px, py);
        canvas.style.cursor = hover ? 'pointer' : 'default';
      }
    });

    canvas.addEventListener('pointerup', () => {
      if (!moved) {
        const n = drag?.n || hover;
        selected = selected === n ? null : n;
      }
      drag = null; pan = null; downPt = null;
    });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const old = T.k, k = Math.max(0.3, Math.min(3, old * (e.deltaY < 0 ? 1.1 : 0.9)));
      T.x = px - (px - T.x) * (k / old); T.y = py - (py - T.y) * (k / old); T.k = k;
    }, { passive: false });

    window.addEventListener('resize', resize);
    fitView();
    frame();
  });

  onDestroy(() => {
    if (animFrame) cancelAnimationFrame(animFrame);
  });

  function toggleFilter(key) {
    filterOn[key] = !filterOn[key];
  }

  function toggleDiscovery() {
    showDiscovered = !showDiscovered;
  }
</script>

{#if visible}
  <div class="graph-view">
    <div class="graph-header">
      <span class="graph-title">SYSTEMS GRAPH</span>
      <span class="graph-count">{Object.keys(entries).length} entries · {links.length} links</span>
    </div>

    <div class="graph-canvas-wrap">
      <canvas bind:this={canvas}></canvas>

      <!-- Legend -->
      <div class="graph-panel legend">
        <div class="panel-label">NODES</div>
        {#each Object.entries(TYPES) as [key, t]}
          <div class="legend-item">
            <span class="legend-dot" style="background:{t.c}"></span>
            <span>{t.label}</span>
          </div>
        {/each}
      </div>

      <!-- Filters -->
      <div class="graph-panel filters">
        <div class="panel-label">EDGES</div>
        {#each Object.entries(BUCKETS) as [key, b]}
          <button
            class="filter-chip"
            class:off={!filterOn[key]}
            onclick={() => toggleFilter(key)}
          >
            <span class="filter-line" style="background:{b.c}"></span>
            {b.label}
          </button>
        {/each}
        <div class="panel-divider"></div>
        <button
          class="filter-chip discovery-toggle"
          class:off={!showDiscovered}
          onclick={toggleDiscovery}
        >
          <span class="filter-line" style="background:#fff"></span>
          {showDiscovered ? 'DISCOVERED' : 'SHOW ALL'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .graph-view {
    position: fixed;
    inset: 0;
    z-index: 500;
    background: #070a0f;
    display: flex;
    flex-direction: column;
  }

  .graph-header {
    height: 42px;
    background: #0a0d13;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 12px;
    flex-shrink: 0;
  }

  .graph-title {
    font-family: var(--font-data);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.15em;
    color: var(--red);
  }

  .graph-count {
    font-family: var(--font-data);
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.08em;
  }

  .graph-canvas-wrap {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .graph-panel {
    position: absolute;
    background: rgba(16,20,28,0.9);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 0;
    backdrop-filter: blur(8px);
    padding: 10px 12px;
  }

  .panel-label {
    font-family: var(--font-data);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.3);
    margin-bottom: 8px;
  }

  .legend {
    top: 12px;
    left: 12px;
    width: 140px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10px;
    color: rgba(255,255,255,0.6);
    margin: 3px 0;
    font-family: var(--font-ui);
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 0;
    flex-shrink: 0;
  }

  .filters {
    top: 12px;
    right: 12px;
    width: 140px;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.6);
    font-family: var(--font-ui);
    font-size: 10px;
    padding: 5px 8px;
    border-radius: 0;
    margin: 3px 0;
    cursor: pointer;
    transition: 0.12s;
  }

  .filter-chip:hover { background: rgba(255,255,255,0.08); }
  .filter-chip.off { opacity: 0.25; }

  .filter-line {
    width: 14px;
    height: 3px;
    border-radius: 0;
    flex-shrink: 0;
  }

  .panel-divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 6px 0;
  }

  .discovery-toggle {
    border-color: rgba(255,255,255,0.15);
  }
</style>
