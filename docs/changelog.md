# MANDATE — Changelog

Session-by-session development log. Most recent first.

---

## 2026-07-03 — Balance Tuning & Playwright Parallelization

### Game balance tuning parameters
* **Insight decay rate reduction:** Tuned from `0.12` to `0.09` per week in `insight.js` to allow a wider window of effectiveness for players visiting multiple districts.
* **Capped trust diffusion:** Diffusion over transit edges is capped at `+0.5` (high-trust neighbor boost) and `-0.5` (low-trust neighbor drag) per week in `engine.js` to mitigate runaway positive/negative feedback loops.
* **Increased pattern cook time:** Extended `COOK_TIME` from `3` to `5` weeks in `insight.js` to balance fast early-game crystallization.
* **Diminishing doctrine returns:** Introduced dynamic scaling for the same-branch doctrine choices (+3 for first, +2 for second, +1 for third and subsequent) in `engine.js` to reward multi-dimensional strategies.

### Batch simulation optimization
* **Parallel simulation runner:** Optimized `run_simulations.js` to run up to 3 Playwright runs concurrently, drastically decreasing time required for 10-run batch iterations.
* **Actionability safeguards:** Refined clicks and checks to verify element visibility first, avoiding standard 1.5s Playwright auto-wait timeouts on hidden selectors.

---

## 2026-07-01 — Style Guide Application + Mayor's Cabinet

### Design language overhaul
- Rewrote `global.css` with Style Guide v1.0 token system
- New token naming: `--ink-mid`, `--ink-ghost`, `--paper-card`, `--paper-white`, `--rule`, `--rule-light`, `--red-light`, `--red-border`, `--amber`, `--purple`, `--green`, `--blue`, `--slate`
- Retired Doto font — `--font-data` now aliases to Space Mono Bold
- Retired Space Grotesk font
- Updated `index.html` font imports: Bebas Neue + Space Mono (with italic) + Material Symbols only
- Two typefaces only: Bebas Neue (display) and Space Mono (body + data)

### Style guide applied to all 18 components
- Replaced ~200+ hardcoded hex color values with CSS custom properties
- Removed all non-50% `border-radius` (zero border-radius per style guide)
- Replaced all hardcoded font-family strings with `var(--font-display)` / `var(--font-body)`
- Corrected old red values (`#ff2d2d`, `#ff4444`) → `#B82A18`
- Corrected old green/amber values to match token hex

### Onboarding overlay redesign
- Dark void → A4-ratio paper document modal on semi-transparent backdrop
- Corner brackets on document edges
- All text switched from light-on-dark to ink-on-paper
- Buttons switched to style guide CTA patterns (ink bg, Bebas Neue, red hover)
- Headlines use Bebas Neue display instead of bold Space Mono

### New components (since last changelog)
- DraftView.svelte — Draft board (replaces CalendarView)
- IntelView.svelte — Intelligence view (replaces SocialView)
- NotebookOverlay.svelte — Insight notebook (N key)
- WeekEndOverlay.svelte — Week debrief
- CommsBento.svelte — Communications bento

### Removed components
- CalendarView.svelte, SocialView.svelte, BlocBar.svelte

### New systems
- DepartmentSystem (`systems/department.js`) — 6 departments, levels 1-5, fund/defund, effective level with crystallized thought bonus
- DealSystem (`systems/deal.js`) — Weekly card deal, weighted pool, face-down legibility, re-deal mechanic

### Removed systems
- TrustSystem (`systems/trust.js`), PolicySystem (`systems/policy.js`)

### Naming
- Conversation/chat system is now called "The Mayor's Cabinet"
- Views renamed: Map / Draft / Intel (was Map / Calendar / Socials)

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
