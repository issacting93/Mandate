# MANDATE — Systems Status

Tracks what each game system does, where it lives, and what's working vs broken.

Updated 2026-07-02.

---

## Core Architecture

| System | File | Status | Notes |
|--------|------|--------|-------|
| **EventBus** | `systems/bus.js` | Done | Pub/sub backbone. Wildcard support (`clock.*`). |
| **StateStore** | `systems/state.js` | Done | Dot-path get/set/update. Emits `state.changed`. |
| **EntryRegistry** | `systems/registry.js` | Done | Content graph (nodes + typed edges). Not yet wired to game loop. |
| **ClockSystem** | `systems/clock.js` | Done | Weekly cadence. Checks dual-metre win/lose. Emits `clock.weekStart`/`weekEnd`. |
| **MetreSystem** | `systems/metre.js` | Wired (Sprint 1) | Dual-metre (Resilience + Disorder). Modifier stacks with decay/expiry. Listens to conversations, posts, policies, clock. Both metres visible in StatusBar. |
| **ScenarioSystem** | `systems/scenario.js` | Done | Paradox-style condition/effect DSL. Evaluates on `clock.weekStart`. Chains, pools, priorities. |
| **InsightSystem** | `systems/insight.js` | Done | Freshness decay (0.12/week), pattern detection (3+ districts same category). |
| **InterventionSystem** | `systems/intervention.js` | Done | 3-tier: generic (always), informed (2+ insights), pattern (cross-district). Budget checks. |
| **BentoSystem** | `systems/bento.js` | Done | 5x5 spatial policy builder. WHERE/WHAT/HOW/FUNDING tiles. Adjacency synergies/conflicts. |
| **SchemaValidator** | `systems/schema.js` | Done | JSON Schema validation for all content types. Dev tool. |
| **DepartmentSystem** | `systems/department.js` | Done | Disco Elysium-style skill lenses. 6 departments (HEALTH, HOUSING, INFRA, SERVICES, SAFETY, COMMUNITY). Levels 1-5, funded from budget. `getEffectiveLevel` includes crystallized thought bonus (+1). Gates conversation interjections, card legibility, dice checks, bento tile mutations. |
| **DealSystem** | `systems/deal.js` | Done | Weekly card deal from weighted pool. Weights: wanted (2.5x), neglect (0.15/wk capped 3.0), feed-hot (1.5x), recency penalty (0.1x within 2 wks). Deals 5 cards, player drafts 3. Face-down legibility gated by dept level >=2. Re-deal costs 1 slot. |
| **DiceSystem** | `systems/dice.js` | Done | Dice check resolution for department-gated skill rolls. |
| **CommsBentoSystem** | `systems/comms-bento.js` | Done | Communications bento board system. |

## Gameplay Chain (engine.js)

Sprint 1 fixed the core gameplay chain so that every step works end-to-end:

| Chain step | Where | Status |
|------------|-------|--------|
| Hex menu VISIT/LISTEN | MapView + HexMenu + engine.js `engagement.started` handler | Working. Toggle labels, toast confirmation. |
| Label → Draft queue | DraftView reads `game.labels` | Working. Card draft from weighted deal. |
| GO → Conversation sequencer | engine.js `executeWeek()` | Working. Plays through scheduled conversations in order. Non-convo districts get direct stat bump. |
| Conversation → Insights | ConversationOverlay.svelte (inline state machine) | Working. Depth meter, insight chips, DM creation. |
| END WEEK → Clock advance | engine.js `advanceWeek()` → ClockSystem | Working. Trust erosion, knowledge decay, deficit, feed chatter, win/lose. |
| Dual-metre updates | MetreSystem listens to bus events | Working. Resilience + Disorder both tracked and displayed. |
| DM follow-ups | engine.js `clock.weekEnd` handler | Working. Characters send follow-ups at 2 and 4 weeks post-visit. Disaster-phase DMs. |
| Community asset activation | engine.js `scenario.triggered` handler | Working. Assets activate on blizzard strike; unvisited districts get disorder spike. |
| Per-district casualty calc | engine.js `clock.weekEnd` handler (week 44+) | Working. Pushes outcomes to GameEndOverlay. |
| Bento policy → DM ack | engine.js `bento.resolved` handler | Working. Characters acknowledge policies targeting their district. |

## Svelte Store Bridge

| Store | File | Bridges to |
|-------|------|-----------|
| `game` | `src/lib/stores/game.js` | Core game state (week, reserve, schedule, insights, posts, feed, DMs, citywide, citywideDisorder) |
| `blizzardSeverity` | `src/lib/stores/game.js` | Derived from `game.week`. Drives fog, building frost, snow shader intensity. |
| `currentView` | `src/lib/stores/game.js` | UI routing (map/draft/intel) |
| `debriefActive` | `src/lib/stores/game.js` | Week-end debrief overlay trigger |
| `selectedDistrict` | `src/lib/stores/game.js` | Map selection state |
| `conversationActive` | `src/lib/stores/game.js` | Conversation overlay trigger |
| `cinematicData` | `src/lib/stores/game.js` | Cinematic overlay trigger |
| `gameEndData` | `src/lib/stores/game.js` | Game end overlay trigger |
| `bentoActive` | `src/lib/stores/game.js` | Bento Box overlay trigger |
| `bentoState` | `src/lib/stores/game.js` | Bento Box evaluation and grid state |
| `onboardingComplete` | `src/lib/stores/game.js` | Onboarding overlay control |
| Engine init | `src/lib/engine.js` | Creates bus, state, all systems. Bridges `state.changed` -> Svelte stores. |

## Dev / Playtest Tools

| Tool | File | Status |
|------|------|--------|
| **Playtest logger** | `src/lib/playlog.js` | Done. Records all bus events with timestamps. Export via Ctrl+Shift+L or console. |
| **Systems graph** | `src/lib/components/GraphView.svelte` | Done. Canvas-rendered force-directed graph of all 117 entries + 332 links. Toggle with G key. |
| **Scenario author** | `tools/author.html` | Done. Standalone HTML tool for authoring scenario events. |
| **NYC data builder** | `tools/build-nyc.mjs` | Done. Build script for NYC geographic data. |
| **Schema validator** | `systems/schema.js` | Done. JSON Schema validation for all content types. |

## Components (18 Svelte 5)

| Component | File | Notes |
|-----------|------|-------|
| StatusBar | `StatusBar.svelte` | Week, reserve, dual-metre bars (Resilience + Disorder). |
| LeftPanel | `LeftPanel.svelte` | Objective card, blizzard countdown, prep checklist. |
| RightPanel | `RightPanel.svelte` | District detail: trust, knowledge, concerns, character. |
| MapView | `MapView.svelte` | MapLibre 3D map + SVG overlay. 4 view modes. |
| HexMenu | `HexMenu.svelte` | Radial action menu. VISIT/LISTEN/MSG/INFO/CLOSE. |
| DraftView | `DraftView.svelte` | Draft board: slots, field briefing cards, department funding, budget bar. Government briefing aesthetic. |
| IntelView | `IntelView.svelte` | Intelligence view: insights, patterns, DMs. |
| BottomNav | `BottomNav.svelte` | View tab bar (map/draft/intel). |
| ConversationOverlay | `ConversationOverlay.svelte` | The Mayor's Cabinet dialogue state machine, typing indicator, depth meter, insight chips. |
| CinematicOverlay | `CinematicOverlay.svelte` | Frostpunk-style dark overlay for major events. |
| GameEndOverlay | `GameEndOverlay.svelte` | Final stats, per-district outcomes, 5 end states. |
| OnboardingOverlay | `OnboardingOverlay.svelte` | 6-beat scripted Week 0. Functional (built, skippable). |
| NotebookOverlay | `NotebookOverlay.svelte` | Insight notebook, accessible from any view via N key. |
| WeekEndOverlay | `WeekEndOverlay.svelte` | Week debrief with stats/changes. |
| BentoBox | `BentoBox.svelte` | 5x5 spatial policy builder with tile placement + evaluation. |
| CommsBento | `CommsBento.svelte` | Communications/comms bento view. |
| GraphView | `GraphView.svelte` | Canvas force-directed systems graph (117 nodes, 332 links). |
| Toast | `Toast.svelte` | Notification toasts. |

## Systems NOT Yet Built

| System | GDD Section | Priority | Notes |
|--------|-------------|----------|-------|
| **EngagementSystem** | roadmap 1A | Medium | Extract label/schedule/execute logic from UI. Currently inline in engine.js + draft/map components. Functional but not modular. |
| **ConversationSystem** | roadmap 1A | Medium | Extract The Mayor's Cabinet dialogue state machine. Currently inline in ConversationOverlay.svelte. Functional but not modular. |
| **KnowledgeSystem** | roadmap 1A | Medium | Per-district knowledge bump/decay. Currently inline in week-end logic. Functional but not modular. |
| **CandidateSystem** | GDD 5.12 | Low (Phase 5) | Rival candidate reactions in feed. Design only. |

## Shader / Visual Systems

| System | File | Status |
|--------|------|--------|
| **Snow particles** | `src/lib/shaders/snow.js` | Done. 15K particles, severity-driven wind/opacity/streak. |
| **3D NYC map** | MapView.svelte (inline) | Done. MapLibre + OpenFreeMap. Dark noir style. |
| **Blizzard effects** | MapView.svelte (inline) | Done. Fog, building frost, all driven by `blizzardSeverity`. |
| **Fog** | MapView `applyBlizzardEffects()` | Done. Thickens with severity. |
| **Snow-capped buildings** | MapView `applyBlizzardEffects()` | Done. fill-extrusion-color lerps toward white. |

---

## GDD vs Code Audit (2026-06-30)

| GDD Section | Status | Notes |
|-------------|--------|-------|
| **SS4.0 Onboarding (Week 0)** | Built | 6-beat OnboardingOverlay.svelte: newspaper, desk policy, interruption, first conversation (simulated), contrast, handoff. Functional with skip button. |
| **SS5.1 Community resilience** | Built and wired | MetreSystem tracks per-district resilience via modifier stacks. StatusBar shows dual metre. Bloc bar recomputes. Trust erosion on neglect. |
| **SS5.2 The map** | Built and wired | MapLibre 3D + SVG overlay. 4 view modes (coalition, trust, knowledge, needs). Knowledge brightness. Hex menu. Fly-to on select. |
| **SS5.3 Insights (freshness, patterns)** | Built and wired | InsightSystem: freshness decay 0.12/week, pattern detection 3+ districts same category. Notebook accessible via N key (NotebookOverlay). |
| **SS5.3a Community assets** | Partially built | ASSET insight category exists. Assets activate on blizzard strike (engine.js handler). Asset tiles exist in Bento data. Missing: asset discovery via listening sessions (only scripted conversations). |
| **SS5.4 Engagements (time system)** | Built (inline) | Label/schedule/execute chain works end-to-end via engine.js. 3 time slots. Not extracted to a standalone system. |
| **SS5.5 Conversations (The Mayor's Cabinet)** | Built (11/19 districts) | Disco Elysium-style dialogue with department interjections, dice checks, depth meter + insight chips. 11 districts have scripts (conversations_v2.js). DepartmentSystem gates interjections and legibility. |
| **SS5.6 Social media / Intel** | Rebuilt | IntelView replaces SocialView. Insights, patterns, DMs. Feed intelligence (vague/specific gradient) not implemented. |
| **SS5.7 Emergency interventions / Bento Box** | Built and wired | BentoSystem: 5x5 grid, WHERE/WHAT/HOW/FUNDING tiles, adjacency synergies/conflicts. InterventionSystem: 3-tier insight-gated. Tile mutations from insights designed in data. |
| **SS5.8 Cost of governing (dual metres)** | Built and wired | MetreSystem tracks Resilience + Disorder. Both visible in StatusBar. Knowledge decay, trust erosion, operating deficit all functional. |
| **SS5.9 Disasters & events** | Built and wired | 10 blizzard-arc scenario events via ScenarioSystem. Cinematic overlays. Blizzard severity ramp. Community asset activation. Per-district casualty calculation. |
| **SS5.10 Win/lose** | Built and wired | 5 end states reachable. GameEndOverlay with per-district outcomes (Survived/Damaged/Critical). Fiscal crisis trigger. |
| **SS5.12 Candidates (future)** | Not built | Design only in GDD. No code. Phase 5. |
| **SS5.13 Roguelike (future)** | Not built | Design only in GDD. Concern graph supports variable weights. No run variation, character rotation, or persistence. Phase 5. |

## Key Gaps (Code vs GDD)

1. **Conversations for 8 districts** -- 11 of 19 have scripts. Missing: Riverdale, UES, Lower Manhattan, LIC, Jamaica, Downtown Brooklyn, Bushwick, Mid-Island.
2. **DM system** -- basic follow-ups work (2-week and 4-week checks, disaster-phase DMs, policy acknowledgments). Missing: player reply functionality, full weekly generation cycle.
3. **Feed intelligence** -- vague/specific gradient based on knowledge, disaster-phase urgency scaling. Currently template-based.
4. **LLM conversation path** -- free-form conversation with LLM playing character. Designed but not wired. Currently scripted fallback only.
5. **Minimap strip** -- GDD describes a persistent minimap in Draft/Intel views. Not built.
6. **System extraction** -- Engagement, Conversation, Knowledge logic functional but inline in components/engine.js rather than extracted to standalone systems/.
7. **Trust diffusion** -- GDD wants trust to spread across transit graph edges. Not implemented.

## Playtest Verification (2026-06-30)

Core loop verified via playtest logger: 2 conversations completed, 4 insights discovered, trust and disorder updated correctly. Engagement handler, conversation sequencer, and dual-metre system all confirmed working end-to-end.
