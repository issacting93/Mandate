# MANDATE — Roadmap

Updated 2026-06-29. Tasks derived from `interactions.md` system specification.

---

## What exists now

```
Mandate/
├── index.html              ← Vite entry (minimal shell)
├── index-legacy.html       ← Original monolith prototype (preserved, 5000+ lines)
├── vite.config.js          ← Svelte + Vite config with $lib/$data/$systems aliases
├── package.json            ← Dependencies: svelte 5, maplibre-gl, vite
├── src/                    ← Svelte application (13 components, 19 files)
│   ├── main.js             ← Entry: mounts App, boots engine
│   ├── App.svelte          ← Shell: StatusBar + views + overlays + BottomNav
│   └── lib/
│       ├── engine.js       ← Game init: creates bus/state/systems, bridges to Svelte stores
│       ├── stores/game.js  ← All reactive state (game, UI, blizzard, overlays)
│       ├── shaders/snow.js ← WebGL snow particle shader (15K particles, severity-driven)
│       └── components/     ← 13 Svelte 5 components (MapView, CalendarView, SocialView, etc.)
├── systems/                ← Game logic (11 pure ES modules, framework-agnostic)
│   ├── bus.js, state.js, registry.js, clock.js, metre.js, trust.js
│   ├── scenario.js, insight.js, intervention.js, bento.js, schema.js
├── data/                   ← Game content (7 ES modules)
│   ├── districts.js        ← DISTRICTS, EDGES, BLOC_COLORS, CONCERN_SCORES, latlng
│   ├── entries.js, links.js, conversations.js, scenarios.js, interventions.js, tiles.js
├── tools/author.html       ← Scenario authoring tool
├── docs/                   ← Design & tracking documents
│   ├── gdd.md, roadmap.md, interactions.md, scenarios.md
│   ├── systems.md, content.md, architecture.md, changelog.md
└── MandateSwift/           ← Native macOS port (SwiftUI, ~80% feature parity)
```

### Built and wired

- [x] **Svelte 5 + Vite port** — 13 components, reactive stores, engine bridge, hot reload
- [x] **3D NYC map** — MapLibre GL JS + OpenFreeMap (dark noir style, 3D building extrusions, fly-to on select)
- [x] **Snow/particle shader** — 12K snow + 3K dust, WebGL vertex/fragment shaders in MapLibre CustomLayerInterface
- [x] **Blizzard severity system** — 0.0→1.0 ramp, drives fog, building frost, snow wind/opacity/streaks
- [x] SVG map: 19 nodes, 26 edges, 4 view modes, pan, zoom (ported to Svelte reactive viewBox)
- [x] Hex radial menu: 5 actions with Material Symbols icons, animated expand/collapse
- [x] Labeling: VISIT/LISTEN → badge on node → calendar queue chip
- [x] Calendar: monthly grid, day cells, agenda entries, queue strip, drag-to-schedule, sidebar context
- [x] GO: executes schedule → conversation overlay (if content exists) or direct stat bump
- [x] Conversations: 11 scripts (11 districts), typing indicator, depth meter, insight chips
- [x] END WEEK: trust erosion, knowledge decay, deficit, feed chatter, win/lose
- [x] Social: compose bar, LLM-scored posts (Ollama), feed timeline, DM sidebar, insight notebook
- [x] Status bar: week/reserve/storm severity reactive to stores
- [x] Bloc bar: recomputes averages after trust changes
- [x] District detail panel: trust, knowledge bar, concern bars, character contact
- [x] Blizzard countdown + preparation checklist in left panel
- [x] Cinematic overlays for major scenario events + game end screen
- [x] Toast notifications
- [x] EventBus ↔ Svelte store bridge (engine.js)
- [x] All 11 systems wired via engine.js (clock, scenario, insight, intervention, metre, trust, bento)
- [x] **Bento Box Policy Builder UI** — 5x5 spatial grid puzzle, tiles, and real-time evaluations wired

---

## Phase 1 — "One Week, Playable"

### 1A. Extract Systems from Shell ✅ (completed via Svelte port)

The monolith was ported to Svelte 5 + Vite. Game logic lives in `systems/` (pure ES modules), UI in `src/lib/components/` (Svelte), bridged by `src/lib/engine.js`. Some game logic is still inline in components (engagement, conversation state machine, social post pipeline) — these should eventually be extracted to systems/ but are functional.

- [x] Svelte port: 13 components, stores, engine bridge
- [x] Wire systems via engine.js (bus, state, clock, scenario, insight, intervention)
- [x] Reconcile DISTRICTS into `data/districts.js` — single source of truth
- [ ] Create `systems/engagement.js` — label/schedule/execute logic (currently inline in CalendarView + MapView)
- [ ] Create `systems/conversation.js` — dialogue state machine (currently inline in ConversationOverlay)
- [ ] Create `systems/social.js` — post pipeline, feed generation (currently inline in SocialView)
- [ ] Create `systems/knowledge.js` — per-district knowledge bump/decay (currently inline in week-end logic)

### 1B. Onboarding — Week 0

The scripted first day that teaches the loop without tutorials (see interactions.md §4, GDD §4.0).

- [ ] Create `systems/onboarding.js`
  - Listens: `game.start`, `ui.onboardingAction`, `policy.resolved`, `conversation.ended`
  - Emits: `onboarding.beat`, `onboarding.complete`
- [ ] Beat 1 — Briefing: newspaper splash overlay, oath, dim map behind
- [ ] Beat 2 — Desk Triage: A localized emergency forces a choice (e.g., "Bronx vs. Midtown"). Player must triage limited resources. Introduces unrelenting pressure without blinding draining the budget.
- [ ] Beat 3 — Interruption: scheduler dialogue — "East Harlem is asking." Node pulses on dim map.
- [ ] Beat 4 — First conversation: map pans to East Harlem, conversation overlay with Maria Delgado, 1 insight discovered
- [ ] Beat 5 — Contrast: notebook (1 insight) vs. desk intervention side-by-side. "That's day one. 47 weeks left."
- [ ] Beat 6 — Handoff: Calendar + Social tabs unlock (animate in). Feed populates with initial chatter. Week 1 begins.
- [ ] During onboarding: Calendar and Social tabs visible but locked (dimmed, "Week 1" label)

### 1C. Conversation Content — 8 More Districts

11 conversations exist in web (11 districts), 10 ported to Swift (missing Bay Ridge). Need 8 more for full 19-district coverage.

- [x] Write conversation scripts for 11 districts — 1 character, 3-5 exchanges, 2-3 insights each
- [ ] Write conversation scripts for remaining 8 districts
- [ ] Each character framed as subject matter expert on their own survival (per GDD S3)
- [ ] Each conversation reveals at least 1 vulnerability insight + 1 community asset
- [ ] Insight categories: HEALTH, HOUSING, INFRA, SERVICES, SAFETY, ASSET
- [ ] Add character entries to `data/entries.js` (type: "character", with lives_in links)
- [ ] Add insight template entries to `data/entries.js` (type: "insight", with contributes_to links)
- [ ] Add conversation fragment entries to `data/entries.js` (type: "fragment", with leads_to links)
- [ ] Port Bay Ridge conversation to Swift

Remaining districts (no conversation yet):
1. [ ] Riverdale (Bronx)
2. [ ] Upper East Side (Manhattan)
3. [ ] Lower Manhattan (Manhattan)
4. [ ] Long Island City (Queens)
5. [ ] Jamaica (Queens)
6. [ ] Downtown Brooklyn (Brooklyn)
7. [ ] Bushwick (Brooklyn)
8. [ ] Mid-Island (Staten Island)

### 1D. Insight System — Freshness & Patterns

- [x] `systems/insight.js`: freshness decay (0.12/week), pattern detection (3+ districts same category)
- [x] `systems/intervention.js`: 3-tier insight-gated policies (generic/informed/pattern)
- [x] Notebook in SocialView sidebar: insights grouped by district with freshness bars, patterns section
- [ ] Notebook drawer accessible from ANY view (hotkey N) — currently only in SocialView
- [ ] Visual: stale insights in Social grounding chips shown as dimmed/strikethrough

### 1E. Disaster Arc — Weeks 30-48

The disaster is the final exam. 10 blizzard-arc scenario events (weeks 4-44) are now inlined in index.html, firing on `clock.weekStart` with cinematic Frostpunk-style overlays. The left panel shows a blizzard countdown and preparation checklist. Still needed: extract to data entries, wire the modular scenario.js, and expand coverage.

- [x] Inline blizzard-arc scenario events (10 events, weeks 4-44, with cinematic overlays and "I SEE" dismiss buttons)
- [x] Blizzard countdown in left panel + preparation checklist (districts visited, insights, patterns, resilience)
- [x] Cinematic game end screen (Frostpunk-style dark overlay, final stats, "Play Again")
- [ ] Add event entries to `data/entries.js` (type: "event") with conditions and effects
- [ ] Wire `systems/scenario.js` into the game loop (currently inlined, needs extraction)
- [ ] **Warning phase (weeks 30-35)**: feed generates weather warnings, status bar shows crisis indicator, DMs from characters express concern, calendar disaster-zone tint intensifies
- [ ] **During phase (weeks 36-40)**: disaster strikes. Feed floods with emergency reports. For visited districts: specific actionable data ("Power out on 138th, pharmacy generator holding"). For unvisited: silence or vague panic. Knowledge determines deployment accuracy. Interventions trigger or fail.
- [ ] **After phase (weeks 41-48)**: recovery DMs. Characters update on outcomes. Trust rebounds in prepared districts, craters in neglected ones.
- [ ] Outcome depends on insight coverage: player who gathered vulnerability data + pre-positioned resources → zero casualties. Player who governed blind → preventable deaths.
- [ ] 3-5 scripted disaster events per phase (heatwave, storm surge, blackout, nor'easter sequence)

### 1F. DM System

Currently DMs are one-shot messages after conversations. They need to be a living relationship channel.

- [ ] Weekly DM generation: characters from visited districts send follow-ups based on whether their concern was addressed
  - Addressed: "The generators arrived. Mrs. Gutierrez says thank you."
  - Not addressed: "Still no heat. Third week."
  - Disaster approaching: "If the power goes out, we're not ready."
- [ ] DM reply: player can type a short reply → trust maintenance delta (+1 if replied, -1 if ignored for 2+ weeks)
- [ ] During disaster: real-time DMs with emergency intel from trusted districts
- [ ] DM → Map bridge: tapping a character name in DMs navigates to their district on the map

### 1G. Feed Intelligence

Currently feed generates random chatter from a template. It needs to be a real situational awareness system.

- [ ] Vague/specific gradient: unvisited districts generate vague chatter ("People in Queens are frustrated"). Visited districts with high knowledge generate specific intel ("The L train is down again at Myrtle-Wyckoff").
- [ ] Frequency scales with crisis: pre-disaster feed is 2-3 items/week. During disaster: 8-10 items/week, mostly emergency reports.
- [ ] Reaction threads: grounded posts generate positive cascades. Hollow posts generate callout replies. Contradictory posts (claiming knowledge about unvisited districts) generate ratio.
- [ ] Early warnings: districts where trust > 60 and knowledge > 50 generate specific warnings 2-3 weeks before disaster ("Mrs. Chen says the basement floods every nor'easter. If the surge comes, she needs evac."). This is the reward for listening.

### 1H. Intervention Planning

Currently policies are static entries in entries.js. They need to unlock from insight patterns.

- [ ] Generic interventions always available (expensive, untargeted): "Citywide emergency preparedness initiative"
- [ ] Informed interventions unlock when player has 2+ insights in same category: "Deploy portable AC to rent-stabilized buildings in [specific districts]"
- [ ] Pattern interventions unlock when pattern.discovered fires: "Citywide landlord heat-failure reporting system"
- [ ] Intervention UI: when player schedules an "intervention" time slot, a panel shows available options filtered by insight tier
- [ ] Cost/effect: generic = expensive + mild. Informed = cheap + targeted. Pattern = moderate + structural fix.
- [ ] Wire `systems/policy.js` to gameState.insights and gameState.patterns

**Phase 1 exit criteria:** A tester plays Week 0 through Week 42 (through the disaster). Onboarding teaches all views. 8+ districts have conversations. Insights decay and form patterns. Posts are grounded or hollow with visible consequences. The disaster tests whether listening translated to effective deployment. All five end-states reachable.

---

## Phase 2 — Depth & Resonance

Pick a subset — do not build all at once.

- [ ] **Recurring characters**: same people on revisit ("Oh, you're back. That thing I told you about? Still broken."). Conversation tree branches based on prior visits.
- [x] **Bento Box Policy Builder**: Replaces static policy cards with a spatial 5x5 grid puzzle.
  - [x] WHERE/WHAT/HOW tiles and FUNDING blocks.
  - [x] Adjacency synergies and conflicts.
- [x] **Community asset activation**: ASSET-type insights unlock free 1x1 tiles in the Bento Box (e.g., a local generator), rewarding listening with high-efficiency puzzle pieces.
- [ ] **Trust diffusion**: neglected districts drag neighbors. Trust is contagious across the transit graph in both directions. Walking edges from `data/links.js`.
- [ ] **Full grounding scoring**: nuanced resonance — tone matching (urgent tone on urgent concern = bonus), multi-insight posts, ratio mechanics for hollow/contradictory posts.
- [ ] **Notebook as intelligence brief**: insights cross-reference with community assets. Patterns visualized as connecting lines. "What I know" becomes a strategic planning surface.

**Exit criteria:** Conversations feel like relationships, not transactions. The Bento Box transforms budgeting into a tactical puzzle. Community assets bridge gaps in policies. At least one depth system shipped and legible.

---

## Phase 3 — Content & Authenticity

- [ ] 150+ unique insights across all 19 districts (8-12 per district)
- [ ] 3-5 conversation characters per district with distinct voices and expertise
- [ ] Cross-district patterns and informed/pattern intervention unlock tree (10-15 patterns)
- [ ] 25-30 event entries for the disaster arc
- [ ] Community asset entries (3-5 per district, discovered through Listening Sessions)
- [ ] Feed chatter templates (80-120): district-specific, mood-varied, vague↔specific
- [ ] DM templates per character (3-5 each): follow-ups, check-ins, escalations
- [ ] Accessibility pass, copy polish, onboarding tuning from playtest data

**Exit criteria:** A full run rarely repeats conversations. The city reads as NYC. A new player learns the loop unaided. The disaster feels different depending on preparation.

---

## Phase 4 — Meta, Polish & Retention

- [ ] Daily seeded challenge — same city, same disaster, compare resilience scores and coverage
- [ ] Shareable end-cards ("You governed NYC. Resilience: 62%. Districts never visited: 4. The Bronx remembers.")
- [ ] Run history and stats: coverage heatmap, insight timeline, trust graph over 48 weeks
- [ ] Audio pass: ambient city hum, trust gained/lost stings, disaster motif
- [ ] Screen feedback: conversation animations, map transitions, calendar drag juice
- [ ] Save/restore via localStorage

**Exit criteria:** A shippable web build with a reason to return tomorrow.

---

## Swift Port Status

The native macOS port (`MandateSwift/`) is at ~80% feature parity with the web prototype. It serves as the release target for App Store distribution.

### Built
- [x] 7 core systems: EventBus, GameState, GameEngine, ContentGraph, ClockSystem, TrustSystem, PolicySystem, ScenarioSystem
- [x] All 61 content graph entries and 170+ links as static Swift data
- [x] 10 scenario events (full blizzard arc)
- [x] 10 NPC conversation scripts (web has 11; Bay Ridge not yet ported)
- [x] Canvas-based hex map with radial menu and 4 view modes
- [x] Calendar with scheduling and week advancement
- [x] Social feed with compose bar, feed timeline, DM sidebar
- [x] LLM integration via Ollama HTTP (PostScorer + FallbackScorer)
- [x] Centralized design token system (Theme enum)
- [x] Game end overlay with all 5 outcomes
- [x] Three-view shell with tab router, status bar, bloc bar

### Missing vs. web
- [ ] Pattern detection (cross-district insight linking)
- [ ] Chatter generation (procedural feed content based on district knowledge level)
- [ ] 3 of 8 post pipeline steps (full grounding chain)
- [ ] Pan/zoom gestures on map canvas
- [ ] Drag-to-schedule on calendar (currently click-to-assign)
- [ ] Initial feed and DM seeding on game start
- [ ] Node flashing animation on VISIT/LISTEN label
- [ ] Map badge rendering for labeled districts

### Future: MLX Swift
The key advantage of the native port is self-contained LLM inference. MLX Swift (Apple's ML framework) would allow the game to embed a local model in the `.app` bundle — no Ollama dependency, no server, just a single download. This is the gating feature for zero-friction App Store distribution.

---

## Phase 5 — Roguelike & Political Depth

Three new systems that transform Mandate from a single-arc experience into a replayable political survival game. Design in web first, then port to Swift.

### 5A. Roguelike Run Variation
- [ ] Disaster type selection: blizzard (default/tutorial), hurricane, heat wave, pandemic, infrastructure collapse
- [ ] Concern weight reshuffling per run (district concern scores vary within bounds)
- [ ] Character rotation: core characters always present, secondary characters drawn from pool
- [ ] Variable timeline pressure (48 weeks for blizzard/heat, 30 for infrastructure collapse)
- [ ] Starting bloc hostility variation
- [ ] Legacy score: cumulative cross-run measure (cosmetic, no mechanical advantage)
- [ ] Run history with coverage heatmaps and disaster outcomes

### 5B. Candidates & Political Opposition
- [ ] 2-3 rival candidates per run with bloc alignments and platforms
- [ ] Candidate feed reactions: LLM-generated responses to player posts and policies
- [ ] Approval rating alongside resilience score
- [ ] Candidates exploit player posts (grounded posts get twisted, hollow posts get fact-checked)
- [ ] Election outcome as second win/lose axis
- [ ] Candidate profiles as data entries (name, platform, bloc, rhetorical style)

**Exit criteria:** Three distinct runs feel meaningfully different. Candidates add political tension. A player who's done 5 runs understands the system but can't predict the city.

---

## Cross-cutting (every phase)

- Rebuild balance simulator for the new loop (CLI tool, reads same data)
- Playtest at each phase gate against GDD S13 metrics
- Design-pillar test: features that fail pillar #2 (knowledge is earned) or #4 (time is the constraint) get cut
- Data is now in `data/districts.js` (single source of truth, no more inline duplication)
- **Platform strategy:** Iterate design in web prototype first (zero-friction playtesting). Port finalized features to Swift before each release milestone. Don't maintain both in parallel — the web version leads, the Swift version follows.
- **Ollama requirement:** LLM post scoring requires Ollama running locally at `localhost:11434` with a model loaded (default: `llama3.2`). Game is fully playable without it (keyword fallback), but the LLM path is the intended experience. Both web and Swift use the same Ollama HTTP endpoint.
- **Docs maintenance:** Run `/update-docs` to sync all docs/ files with the current codebase state.
- **MLX Swift path:** For App Store distribution, replace Ollama dependency with MLX Swift native inference. This is the gating feature for self-contained distribution — a single `.app` bundle with embedded model.
