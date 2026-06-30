# MANDATE — Systems Status

Tracks what each game system does, where it lives, and what's working vs broken.

Updated 2026-06-29.

---

## Core Architecture

| System | File | Status | Notes |
|--------|------|--------|-------|
| **EventBus** | `systems/bus.js` | Done | Pub/sub backbone. Wildcard support (`clock.*`). |
| **StateStore** | `systems/state.js` | Done | Dot-path get/set/update. Emits `state.changed`. |
| **EntryRegistry** | `systems/registry.js` | Done | Content graph (nodes + typed edges). Not yet wired to game loop. |
| **ClockSystem** | `systems/clock.js` | Done | Weekly cadence. Checks dual-metre win/lose. Emits `clock.weekStart`/`weekEnd`. |
| **MetreSystem** | `systems/metre.js` | Done | Dual-metre (Resilience + Disorder). Modifier stacks with decay/expiry. Listens to conversations, posts, policies, clock. |
| **TrustSystem** | `systems/trust.js` | Done (legacy) | Per-district modifier stacks. Largely superseded by MetreSystem but still referenced. |
| **ScenarioSystem** | `systems/scenario.js` | Done | Paradox-style condition/effect DSL. Evaluates on `clock.weekStart`. Chains, pools, priorities. |
| **InsightSystem** | `systems/insight.js` | Done | Freshness decay (0.12/week), pattern detection (3+ districts same category). |
| **InterventionSystem** | `systems/intervention.js` | Done | 3-tier: generic (always), informed (2+ insights), pattern (cross-district). Budget checks. |
| **BentoSystem** | `systems/bento.js` | Done | 5x5 spatial policy builder. WHERE/WHAT/HOW/FUNDING tiles. Adjacency synergies/conflicts. |
| **SchemaValidator** | `systems/schema.js` | Done | JSON Schema validation for all content types. Dev tool. |

## Svelte Store Bridge

| Store | File | Bridges to |
|-------|------|-----------|
| `game` | `src/lib/stores/game.js` | Core game state (week, reserve, schedule, insights, posts, feed, DMs) |
| `blizzardSeverity` | `src/lib/stores/game.js` | Derived from `game.week`. Drives fog, building frost, snow shader intensity. |
| `currentView` | `src/lib/stores/game.js` | UI routing (map/calendar/socials) |
| `selectedDistrict` | `src/lib/stores/game.js` | Map selection state |
| `conversationActive` | `src/lib/stores/game.js` | Conversation overlay trigger |
| `cinematicData` | `src/lib/stores/game.js` | Cinematic overlay trigger |
| `gameEndData` | `src/lib/stores/game.js` | Game end overlay trigger |
| `bentoActive` | `src/lib/stores/game.js` | Bento Box overlay trigger |
| `bentoState` | `src/lib/stores/game.js` | Bento Box evaluation and grid state |
| Engine init | `src/lib/engine.js` | Creates bus, state, all systems. Bridges `state.changed` → Svelte stores. |

## Systems NOT Yet Built

| System | GDD Section | Priority | Notes |
|--------|-------------|----------|-------|
| **EngagementSystem** | roadmap 1A | High | Extract label/schedule/execute logic from UI. Currently inline in calendar/map components. |
| **ConversationSystem** | roadmap 1A | High | Extract dialogue state machine. Currently inline in ConversationOverlay.svelte. |
| **KnowledgeSystem** | roadmap 1A | Medium | Per-district knowledge bump/decay. Currently inline in week-end logic. |
| **SocialSystem** | roadmap 1A | Medium | Post pipeline, feed generation, DM logic. Currently inline in SocialView.svelte. |
| **OnboardingSystem** | roadmap 1B | High | Week 0 scripted sequence. Not started. |
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

## Key Gaps (Code vs GDD)

1. **Onboarding (Week 0)** — GDD §4.0 describes a 6-beat scripted first day. Not built.
2. **Conversations for 8 districts** — 11 of 19 have scripts. Missing: Riverdale, UES, Lower Manhattan, LIC, Jamaica, Downtown Brooklyn, Bushwick, Mid-Island.
3. **DM system** — currently one-shot after conversations. GDD wants weekly follow-ups, reply functionality, disaster-phase intel.
4. **Feed intelligence** — vague/specific gradient based on knowledge, disaster-phase urgency scaling. Currently random templates.
5. **Community assets** — ASSET insight category exists but assets aren't active. **Update:** Must provide free 1x1 tiles for the Bento Box Policy Builder to bridge gaps during triage.
6. **Dual-metre UI** — MetreSystem tracks Resilience + Disorder, but UI only shows Resilience. Disorder not surfaced. **Update:** Must explicitly visualize Disorder alongside Resilience in the top bar to enforce moral trade-offs.
7. **Minimap strip** — GDD describes a persistent minimap in Calendar/Social views. Not built.
8. **Notebook drawer** — hotkey N accessible from any view. Built in SocialView sidebar only.
