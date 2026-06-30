# MANDATE — Architecture

How the codebase is organized after the Svelte port.

Updated 2026-06-29.

---

## Directory Structure

```
Mandate/
├── index.html              ← Vite entry (minimal HTML shell)
├── index-legacy.html       ← Original monolith (5000-line prototype, preserved)
├── vite.config.js          ← Vite + Svelte config, path aliases ($lib, $data, $systems)
├── package.json            ← Dependencies: svelte, maplibre-gl, vite
│
├── src/                    ← Svelte application
│   ├── main.js             ← Entry: mounts App, boots engine
│   ├── global.css          ← Design tokens, reset
│   ├── App.svelte          ← Shell: StatusBar + views + overlays + BottomNav
│   └── lib/
│       ├── engine.js       ← Game init: creates bus/state/systems, bridges to stores
│       ├── stores/
│       │   └── game.js     ← All Svelte stores (game state, UI state, overlays)
│       ├── shaders/
│       │   └── snow.js     ← WebGL snow particle shader (vertex + fragment)
│       └── components/
│           ├── StatusBar.svelte
│           ├── BlocBar.svelte
│           ├── MapView.svelte       ← MapLibre 3D + SVG board + pan/zoom + blizzard effects
│           ├── HexMenu.svelte       ← Hex actions with Material icons
│           ├── LeftPanel.svelte     ← Objectives, blizzard countdown, prep checklist
│           ├── RightPanel.svelte    ← District detail, concern bars, character contact
│           ├── CalendarView.svelte  ← Month grid, schedule slots, GO/END WEEK
│           ├── SocialView.svelte    ← Feed, compose, DMs, insight notebook
│           ├── BottomNav.svelte     ← View switching (map/calendar/socials)
│           ├── ConversationOverlay.svelte
│           ├── CinematicOverlay.svelte
│           ├── GameEndOverlay.svelte
│           └── Toast.svelte
│
├── systems/                ← Game logic (pure ES modules, framework-agnostic)
│   ├── bus.js              ← EventBus (pub/sub)
│   ├── state.js            ← StateStore (dot-path reactive state)
│   ├── registry.js         ← EntryRegistry (content graph)
│   ├── clock.js            ← ClockSystem (weekly cadence, win/lose)
│   ├── metre.js            ← MetreSystem (Resilience + Disorder dual metres)
│   ├── trust.js            ← TrustSystem (legacy, per-district modifier stacks)
│   ├── scenario.js         ← ScenarioSystem (condition/effect DSL, event chains)
│   ├── insight.js          ← InsightSystem (freshness decay, pattern detection)
│   ├── intervention.js     ← InterventionSystem (3-tier insight-gated policies)
│   ├── bento.js            ← BentoSystem (5x5 spatial policy grid)
│   └── schema.js           ← SchemaValidator (content validation)
│
├── data/                   ← Game content (static data, ES module exports)
│   ├── districts.js        ← DISTRICTS, EDGES, BLOC_COLORS, CONCERN_SCORES, latlng, etc.
│   ├── entries.js          ← Content graph nodes (seasons, hazards, concerns, districts)
│   ├── links.js            ← Content graph edges (threatens, mitigates, protects)
│   ├── conversations.js    ← NPC conversation scripts (11 districts)
│   ├── scenarios.js        ← Blizzard arc events (10 events, weeks 4-44)
│   ├── interventions.js    ← Intervention definitions (3 tiers)
│   └── tiles.js            ← Bento box tiles, synergies, conflicts
│
├── tools/
│   └── author.html         ← Scenario authoring tool (standalone)
│
└── docs/                   ← Design & tracking documents
    ├── gdd.md              ← Game Design Document
    ├── roadmap.md          ← Development roadmap (phases 1-5)
    ├── interactions.md     ← Interaction & systems specification
    ├── systems.md          ← Systems status tracker
    ├── content.md          ← Content tracker (conversations, events, templates)
    ├── architecture.md     ← This file
    └── changelog.md        ← Session-by-session development log
```

## Data Flow

```
Player action (click, type, drag)
    ↓
Svelte component (MapView, CalendarView, etc.)
    ↓
engine.js helper (emitEngagement, advanceWeek, etc.)
    ↓
EventBus (bus.emit)
    ↓
Systems (ClockSystem, ScenarioSystem, InsightSystem, etc.)
    ↓
StateStore (state.set/update → emits state.changed)
    ↓
engine.js bridge (state.changed → game store update)
    ↓
Svelte stores ($game, $blizzardSeverity, etc.)
    ↓
Reactive component re-render
```

## Key Design Decisions

1. **Systems are framework-agnostic.** All systems/ files are pure ES modules with no Svelte dependency. They communicate via EventBus. This means the Swift port can reimplement the same interfaces.

2. **engine.js is the bridge.** It's the only file that knows about both Svelte stores and the EventBus. Components never import systems directly — they go through engine.js exports.

3. **DISTRICTS is mutable shared state.** The DISTRICTS array in `data/districts.js` has mutable fields (trust, know, lastVisited). This is a known architectural debt — ideally trust/know would live in the StateStore and DISTRICTS would be immutable. Kept for compatibility with existing systems.

4. **The legacy monolith is preserved.** `index-legacy.html` contains the full working prototype with all inline code, the 3D map, snow shaders, and blizzard effects. It can be opened directly in a browser without a build step.

## Path Aliases

Configured in `vite.config.js`:

| Alias | Resolves to |
|-------|-------------|
| `$lib` | `./src/lib` |
| `$data` | `./data` |
| `$systems` | `./systems` |
