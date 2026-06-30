<script>
  import { onMount, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { selectedDistrict, currentMode, blizzardSeverity, currentView } from '$lib/stores/game.js';
  import { DISTRICTS, EDGES, BLOC_COLORS, DISTRICT_LATLNG, BORO_POS, districtMap } from '$data/districts.js';
  import { createSnowLayer } from '$lib/shaders/snow.js';
  import HexMenu from './HexMenu.svelte';

  let mapContainer;
  let svgEl;
  let map3d;

  // ── Pan/Zoom state ──
  const BASE_VB = { x: 60, y: 50, w: 690, h: 700 };
  let vb = $state({ ...BASE_VB });
  let panState = { active: false, moved: false, startX: 0, startY: 0, vbStart: null };
  let viewBox = $derived(`${vb.x} ${vb.y} ${vb.w} ${vb.h}`);

  function handleWheel(e) {
    e.preventDefault();
    if (!svgEl) return;
    const factor = e.deltaY > 0 ? 1.08 : 0.93;
    const rect = svgEl.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const cx = vb.x + fx * vb.w;
    const cy = vb.y + fy * vb.h;
    const nw = Math.max(200, Math.min(BASE_VB.w * 2.5, vb.w * factor));
    const nh = nw * (BASE_VB.h / BASE_VB.w);
    vb = { x: cx - fx * nw, y: cy - fy * nh, w: nw, h: nh };
  }

  function handleSvgClick(e) {
    // Only deselect if clicking empty space
    if (e.target === svgEl || e.target.tagName === 'svg') {
      selectedDistrict.set(null);
      flyToOverview();
    }
  }

  function handlePointerDown(e) {
    // Only start pan on empty SVG background
    if (e.target !== svgEl && e.target.tagName !== 'svg') return;
    panState = { active: true, moved: false, startX: e.clientX, startY: e.clientY, vbStart: { ...vb } };
  }

  function handlePointerMove(e) {
    if (!panState.active) return;
    const dx = e.clientX - panState.startX;
    const dy = e.clientY - panState.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panState.moved = true;
    if (!panState.moved) return;
    const rect = svgEl.getBoundingClientRect();
    vb = { ...vb, x: panState.vbStart.x - dx * (vb.w / rect.width), y: panState.vbStart.y - dy * (vb.h / rect.height) };
  }

  function handlePointerUp() {
    panState.active = false;
  }

  function selectDist(e, id) {
    e.stopPropagation();
    if ($selectedDistrict === id) {
      selectedDistrict.set(null);
      flyToOverview();
      return;
    }
    selectedDistrict.set(id);
    flyToDistrict(id);
  }

  function flyToDistrict(id) {
    const coords = DISTRICT_LATLNG[id];
    if (!coords || !map3d) return;
    map3d.flyTo({ center: coords, zoom: 14.5, pitch: 60, bearing: -20 + Math.random() * 40, duration: 1800, essential: true });
  }

  function flyToOverview() {
    map3d?.flyTo({ center: [-73.935, 40.730], zoom: 10.8, pitch: 52, bearing: -12, duration: 1400, essential: true });
  }

  // ── Blizzard effects ──
  $effect(() => {
    if (!map3d) return;
    try { if (!map3d.loaded()) return; } catch { return; }
    const s = $blizzardSeverity;
    if (s == null) return;
    try {
      map3d.setFog({
        color: `rgb(${Math.round(26 + s * 60)}, ${Math.round(26 + s * 55)}, ${Math.round(46 + s * 50)})`,
        'horizon-blend': 0.05 + s * 0.15,
        range: [2.0 - s * 1.5, 12.0 - s * 6.0],
      });
      const lerpC = (dark, light) => Math.round(dark + (light - dark) * s * 0.7);
      map3d.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
        'interpolate', ['linear'], ['get', 'render_height'],
        0,   `rgb(${lerpC(26, 140)}, ${lerpC(26, 140)}, ${lerpC(40, 160)})`,
        50,  `rgb(${lerpC(34, 170)}, ${lerpC(34, 165)}, ${lerpC(58, 190)})`,
        150, `rgb(${lerpC(42, 200)}, ${lerpC(42, 195)}, ${lerpC(72, 220)})`,
        300, `rgb(${lerpC(53, 230)}, ${lerpC(53, 225)}, ${lerpC(96, 245)})`,
      ]);
      const bFrost = Math.round(24 + s * 100);
      map3d.setPaintProperty('buildings', 'fill-color', `rgb(${bFrost}, ${bFrost}, ${Math.round(bFrost * 1.1)})`);
    } catch (err) { /* layers not ready yet */ }
  });

  function nodeOpacity(d, mode) {
    if (mode === 'trust') return Math.max(0.2, d.trust / 100);
    if (mode === 'knowledge') return Math.max(0.14, d.know / 100);
    return 1;
  }

  function hexPoints(cx, cy, r) {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 90) * Math.PI / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }).map(p => p.join(',')).join(' ');
  }

  onMount(() => {
    map3d = new maplibregl.Map({
      container: mapContainer,
      style: {
        version: 8,
        sources: {
          openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
        },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#0a0a0f' } },
          { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water', paint: { 'fill-color': '#0d1117' } },
          { id: 'landcover', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover', paint: { 'fill-color': '#10121a', 'fill-opacity': 0.6 } },
          { id: 'park', type: 'fill', source: 'openmaptiles', 'source-layer': 'park', paint: { 'fill-color': '#0f1518', 'fill-opacity': 0.5 } },
          { id: 'roads-highway', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['==', 'class', 'motorway'], paint: { 'line-color': '#1a1a24', 'line-width': 2 } },
          { id: 'roads-major', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['in', 'class', 'trunk', 'primary', 'secondary'], paint: { 'line-color': '#151520', 'line-width': 1 } },
          { id: 'buildings', type: 'fill', source: 'openmaptiles', 'source-layer': 'building', paint: { 'fill-color': '#181822', 'fill-opacity': 0.7 } },
          {
            id: '3d-buildings', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 13,
            filter: ['has', 'render_height'],
            paint: {
              'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 10], 0, '#1a1a28', 50, '#22223a', 150, '#2a2a48', 300, '#353560'],
              'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, ['coalesce', ['get', 'render_height'], 10]],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
              'fill-extrusion-opacity': 0.75,
            },
          },
        ],
      },
      center: [-73.935, 40.730], zoom: 10.8, pitch: 52, bearing: -12,
      antialias: true, interactive: false, attributionControl: false,
    });

    map3d.on('load', () => {
      mapContainer.classList.add('loaded');
      map3d.addLayer(createSnowLayer(map3d, () => $currentView));
      // Apply initial blizzard effects
      const s = $blizzardSeverity;
      if (s > 0) {
        map3d.setFog({
          color: `rgb(${Math.round(26 + s * 60)}, ${Math.round(26 + s * 55)}, ${Math.round(46 + s * 50)})`,
          'horizon-blend': 0.05 + s * 0.15,
          range: [2.0 - s * 1.5, 12.0 - s * 6.0],
        });
      }
    });
  });

  onDestroy(() => {
    map3d?.remove();
  });
</script>

<div class="map-container">
  <div class="map-3d" bind:this={mapContainer}></div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    bind:this={svgEl}
    viewBox={viewBox}
    preserveAspectRatio="xMidYMid meet"
    onwheel={handleWheel}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onclick={handleSvgClick}
  >
    {#each Object.entries(BORO_POS) as [name, pos]}
      <text x={pos.x} y={pos.y} text-anchor="middle" class="boro-label" class:dimmed={$selectedDistrict}>{name.toUpperCase()}</text>
    {/each}

    <g class="edges" class:dimmed={$selectedDistrict}>
      {#each EDGES as [aId, bId]}
        {@const a = districtMap[aId]}
        {@const b = districtMap[bId]}
        {#if a && b}
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.08)" stroke-width="4" stroke-linecap="round" />
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.18)" stroke-width="1.5" stroke-linecap="round" />
        {/if}
      {/each}
    </g>

    {#each DISTRICTS as d (d.id)}
      {@const dimmed = $selectedDistrict && $selectedDistrict !== d.id}
      {@const opacity = nodeOpacity(d, $currentMode)}
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <g class="district-node" class:dimmed style="cursor:pointer; opacity:{dimmed ? undefined : opacity}" onclick={(e) => selectDist(e, d.id)}>
        <circle cx={d.x} cy={d.y} r={d.r * 1.8} fill={BLOC_COLORS[d.bloc]} opacity={dimmed ? 0.1 : 0.3} pointer-events="none" />
        <circle cx={d.x} cy={d.y} r={d.r * 0.6} fill={BLOC_COLORS[d.bloc]} stroke="rgba(0,0,0,0.5)" stroke-width="2" />
      </g>
      <text x={d.x} y={d.y + d.r * 0.6 + 14} text-anchor="middle" class="district-label" class:dimmed>{d.name}</text>
    {/each}

    {#if $selectedDistrict && districtMap[$selectedDistrict]}
      <HexMenu districtId={$selectedDistrict} district={districtMap[$selectedDistrict]} {hexPoints} />
    {/if}
  </svg>

  <div class="view-mode-bar">
    {#each ['coalition', 'trust', 'knowledge', 'needs'] as mode}
      <button class="view-pill" class:active={$currentMode === mode} onclick={() => currentMode.set(mode)}>{mode.toUpperCase()}</button>
    {/each}
  </div>
</div>

<style>
  .map-container { flex: 1; min-width: 0; position: relative; overflow: hidden; }
  .map-3d { position: absolute; inset: 0; z-index: 0; opacity: 0; transition: opacity 1.2s ease; }
  .map-3d :global(.maplibregl-canvas) { outline: none; }
  :global(.map-3d.loaded) { opacity: 1; }

  svg { width: 100%; height: 100%; display: block; position: relative; z-index: 1; cursor: grab; }
  svg:active { cursor: grabbing; }

  .boro-label { font-family: 'Space Grotesk', sans-serif; font-size: 38px; font-weight: 700; fill: #fff; opacity: 0.08; pointer-events: none; transition: opacity 0.3s ease; }
  .boro-label.dimmed { opacity: 0.02; }
  .district-node { transition: opacity 0.3s ease; }
  .district-node.dimmed { opacity: 0.15; }
  .district-label { font-family: 'Space Grotesk', sans-serif; font-size: 10.5px; font-weight: 600; fill: rgba(255,255,255,0.75); pointer-events: none; transition: opacity 0.2s ease; }
  .district-label.dimmed { opacity: 0.18; }
  .edges { transition: opacity 0.3s ease; }
  .edges.dimmed { opacity: 0.08; }

  .view-mode-bar { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 2px; background: rgba(10,10,16,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 3px; z-index: 10; }
  .view-pill { font-family: var(--font-data); font-size: 10px; font-weight: 700; letter-spacing: 0.06em; padding: 5px 14px; border-radius: 16px; border: 1px solid transparent; cursor: pointer; color: rgba(255,255,255,0.55); background: transparent; transition: all 0.15s ease; white-space: nowrap; }
  .view-pill:hover { background: rgba(255,255,255,0.08); }
  .view-pill.active { background: var(--red); color: #fff; border-color: var(--red); }
</style>
