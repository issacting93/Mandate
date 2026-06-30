# MANDATE — Changelog

Session-by-session development log. Most recent first.

---

## 2026-06-29 — Svelte Port + Visual Effects

### Svelte + Vite port
- Ported entire game from monolithic `index.html` (5000 lines) to Svelte 5 + Vite
- 13 components, 19 src files
- Existing `systems/` and `data/` imported directly (unchanged)
- Created `engine.js` bridge: EventBus ↔ Svelte stores
- Extracted shared data into `data/districts.js` (DISTRICTS, EDGES, BLOC_COLORS, etc.)
- Build succeeds, dev server runs on port 3001

### 3D map background
- Added MapLibre GL JS with OpenFreeMap tiles (free, no API key)
- Custom dark noir map style matching game aesthetic
- 3D building extrusions at zoom 13+
- Fly-to on district selection (real-world NYC coordinates)
- SVG game board overlays on top

### Snow shader (WebGL)
- 12,000 snow particles + 3,000 dust/ash particles
- Custom vertex/fragment shaders in MapLibre CustomLayerInterface
- Wind drift, wobble, depth-based sizing
- Pauses rendering when not on map tab (GPU optimization)
- Cached uniform/attrib locations

### Blizzard severity system
- `blizzardSeverity` (0.0→1.0) derived from game week
- Slow ramp weeks 1-29, accelerating 30-48
- Drives: fog density, building frost color, snow particle speed/opacity/wind streaks
- Updates every week-end

### Hex menu redesign
- Replaced text labels inside hexagons with Google Material Symbols icons
- Labels moved outside hexagons
- Icons: directions_walk, hearing, info, mail, close
- Dark theme styling for visibility on 3D map

### Optimizations
- Removed unused OSM raster tile source
- Cached WebGL shader locations (9 lookups moved from per-frame to onAdd)
- Paused snow shader when map tab not active
- Fixed `flashNode` stroke color from light theme `#ececea` to dark theme `rgba(0,0,0,0.5)`
- Fixed `updateBlocBar` using wrong CSS class (`bloc-pct` → `bloc-val`)
- `updateMapNodes` now uses cached `districtElements` instead of querySelector
- Removed dead viewBox zoom code (`animateVB`, `zoomToDistrict`, `zoomToOverview`)

### Docs
- Created `docs/` folder and organized design documents
- Added: systems.md, content.md, architecture.md, changelog.md

---

## 2026-06-27 — GDD v0.6

- Added Swift port status, roguelike direction, candidate system design
- Updated roadmap with Phase 5 (roguelike, candidates, bento box)

## 2026-06-27 — Playable prototype

- 3-view shell (Map/Calendar/Social)
- Full blizzard arc (10 events, weeks 4-44)
- LLM-scored posts (Ollama)
- 11 conversation scripts
- GDD v0.5
