# MANDATE — Roadmap

Updated 2026-06-22. Tasks derived from `interactions.md` system specification.

---

## What exists now

```
Mandate/
├── index.html              ← Game shell: SVG map, hex menu, calendar grid, social feed,
│                              conversation overlay, drag-and-drop, all wired to gameState
├── Mandate Board.html      ← Design reference (bundled prototype, read-only)
├── graph.html              ← Dev tool — content graph visualizer
├── gdd.md                  ← Game design document (HCD + disaster resilience framing)
├── interactions.md         ← Interaction & systems specification
├── roadmap.md              ← This file
├── Visual Reference/       ← MTA + brand design references
├── data/
│   ├── entries.js          ← Content graph nodes (districts, infra, blocs, policies, outcomes)
│   └── links.js            ← Content graph edges (threatens, mitigates, protects, etc.)
└── systems/
    ├── bus.js              ← EventBus (done)
    ├── state.js            ← StateStore (done)
    ├── registry.js         ← EntryRegistry (done)
    ├── clock.js            ← ClockSystem — weekly cadence, win/lose (done, inline duplicate)
    ├── trust.js            ← TrustSystem — per-district resilience (done, inline duplicate)
    ├── policy.js           ← InterventionSystem — insight-gated tiers (done, not yet wired)
    └── scenario.js         ← ScenarioSystem — weekly events (done, not yet wired)
```

### Built and wired (all inline in index.html)

- [x] SVG map: 19 nodes, 26 edges, 4 view modes (coalition/resilience/vulnerability/needs), pan, zoom
- [x] Hex radial menu: 5 actions, animated expand/collapse, map fades to 15% on open
- [x] Hex menu bug fix: SVG global click handler no longer closes menu on same event; pan system recognizes `hex-menu-group` class
- [x] Labeling: VISIT/LISTEN → hex badge on node → calendar queue chip
- [x] Visual feedback for VISIT/LISTEN: toast notification, node flash (green/cyan 600ms), dashed ring badge + V/L dot, calendar tab red count badge, clearDimLabels() after hex menu close
- [x] Calendar: monthly grid, day cells, agenda entries, queue strip, drag-to-schedule, sidebar context
- [x] Calendar undo: x buttons on sidebar schedule cards, x buttons on queue chips, click calendar agenda items to unschedule, drag dead-zone fix (6px threshold)
- [x] Calendar ↔ Map linking: click district name → navigateToDistrict() → map view + hex menu
- [x] GO: executes schedule → conversation overlay (if content exists) or direct stat bump
- [x] Conversations: 3 scripts (South Bronx, Harlem, Midtown), typing indicator, depth meter, insight chips
- [x] END WEEK: trust erosion (-1/unvisited), knowledge decay (-4), deficit (-$0.375B), feed chatter, win/lose
- [x] Social: dynamic compose bar, LLM-scored posts (Ollama), feed timeline, DM sidebar, insight list
- [x] LLM post scoring: async handlePost() calls Ollama → per-district scores + resident reactions → trust deltas + feed reactions; keyword fallback when offline
- [x] Status bar: week/resilience/reserve reactive to state
- [x] Bloc bar: recomputes averages after any trust change
- [x] District detail panel: trust, knowledge bar, concern, bloc
- [x] EventBus bridge: inline EventBus class emitting lifecycle events; state bridge with dot-path get/set/update API
- [x] Scenario events (inlined): 10 blizzard-arc events (weeks 4-44) firing on clock.weekStart with cinematic Frostpunk-style dark overlays
- [x] Blizzard countdown + preparation checklist: left panel shows "BLIZZARD ARRIVING IN X WEEKS", tracks districts visited, insights, patterns, resilience
- [x] Cinematic game end screen: Frostpunk-style dark overlay with final stats, color coding, "Play Again" button (replaces alert() calls)

---

## Phase 1 — "One Week, Playable"

### 1A. Extract Systems from Shell

The game logic currently lives inline in index.html (~800 lines of JS). Extract into bus-connected modules so systems are testable and composable.

- [ ] Create `systems/engagement.js` — extract `toggleLabel()`, `renderMapBadges()`, scheduling logic
  - Listens: `ui.districtLabeled`, `ui.labelScheduled`, `ui.weekStarted`
  - Emits: `label.added`, `label.removed`, `engagement.started`, `engagement.ended`
- [ ] Create `systems/conversation.js` — extract `startConversation()`, `showExchange()`, `selectChoice()`, `endConversation()`, `CONVERSATIONS` data
  - Listens: `engagement.started`
  - Emits: `conversation.loaded`, `conversation.ended`, `insight.discovered`
- [ ] Create `systems/insight.js` — extract insight push logic from `endConversation()`
  - Listens: `insight.discovered`, `clock.weekStart`
  - Emits: `insight.recorded`, `insight.staled`, `pattern.discovered`
  - Adds: freshness tracking (insights decay toward 0 over 6-8 weeks)
  - Adds: pattern detection (same category in 3+ districts → pattern → unlocks intervention)
- [ ] Create `systems/knowledge.js` — extract knowledge bump/decay from `handleGo()`/`handleEndWeek()`
  - Listens: `conversation.ended`, `clock.weekStart`
  - Emits: `knowledge.updated`, `knowledge.decayed`
- [ ] Create `systems/social.js` — extract `handlePost()`, feed generation, DM logic (note: handlePost is now async with Ollama LLM integration)
  - Listens: `ui.postComposed`, `conversation.ended`, `clock.weekStart`
  - Emits: `post.published`, `feed.reaction`, `dm.available`, `feed.updated`
- [ ] Wire `index.html` as thin shell: imports systems, constructs bus/state/registry, renders UI from state change events (EventBus bridge and state bridge already inline)
- [ ] Reconcile `DISTRICTS` array in index.html with `data/entries.js` — single source of truth

### 1B. Onboarding — Week 0

The scripted first day that teaches the loop without tutorials (see interactions.md §4, GDD §4.0).

- [ ] Create `systems/onboarding.js`
  - Listens: `game.start`, `ui.onboardingAction`, `policy.resolved`, `conversation.ended`
  - Emits: `onboarding.beat`, `onboarding.complete`
- [ ] Beat 1 — Briefing: newspaper splash overlay, oath, dim map behind
- [ ] Beat 2 — Desk: generic intervention card over map. Player signs it. Mild trust, big budget hit. Map barely changes.
- [ ] Beat 3 — Interruption: scheduler dialogue — "East Harlem is asking." Node pulses on dim map.
- [ ] Beat 4 — First conversation: map pans to East Harlem, conversation overlay with Maria Delgado, 1 insight discovered
- [ ] Beat 5 — Contrast: notebook (1 insight) vs. desk intervention side-by-side. "That's day one. 47 weeks left."
- [ ] Beat 6 — Handoff: Calendar + Social tabs unlock (animate in). Feed populates with initial chatter. Week 1 begins.
- [ ] During onboarding: Calendar and Social tabs visible but locked (dimmed, "Week 1" label)

### 1C. Conversation Content — 16 More Districts

3 conversations exist (South Bronx, Harlem, Midtown). Need 16 more for full map coverage.

- [ ] Write conversation scripts for each district — 1 character, 3-5 exchanges, 2-3 insights each
- [ ] Each character framed as subject matter expert on their own survival (per GDD §3)
- [ ] Each conversation reveals at least 1 vulnerability insight + 1 community asset
- [ ] Insight categories: HEALTH, HOUSING, INFRA, SERVICES, SAFETY, ASSET
- [ ] Add character entries to `data/entries.js` (type: "character", with lives_in links)
- [ ] Add insight template entries to `data/entries.js` (type: "insight", with contributes_to links)
- [ ] Add conversation fragment entries to `data/entries.js` (type: "fragment", with leads_to links)

Priority districts (diverse borough coverage for early playtesting):
1. [ ] Fordham (Bronx, labor)
2. [ ] Astoria (Queens, progressive)
3. [ ] Jackson Heights (Queens, working)
4. [ ] Williamsburg (Brooklyn, progressive)
5. [ ] Crown Heights (Brooklyn, working)
6. [ ] Flushing (Queens, working)
7. [ ] Bay Ridge (Brooklyn, realestate)
8. [ ] Staten Island — North Shore (labor)

### 1D. Insight System — Freshness & Patterns

Currently insights are just pushed to an array. They need to decay and connect.

- [ ] Freshness: each insight gets a `freshness` value (1.0 at discovery, decays by 0.12/week). At 0.3: "stale" indicator. At 0: insight no longer grounds posts.
- [ ] Pattern detection: when 3+ insights share the same `category` across different districts, emit `pattern.discovered`
- [ ] Patterns unlock informed/pattern intervention tiers (wire to `systems/policy.js`)
- [ ] Notebook drawer: slide-out panel accessible from any view (hotkey N or pull-tab), showing all insights grouped by district, with freshness bars and pattern highlights
- [ ] Visual: stale insights in the Social grounding chips show as dimmed/strikethrough

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
- [ ] **Community asset activation**: ASSET-type insights unlock crisis response options (e.g., "The pharmacy generator can store insulin for the block" → during heatwave, that block self-organizes, resilience holds).
- [ ] **Trust diffusion**: neglected districts drag neighbors. Trust is contagious across the transit graph in both directions. Walking edges from `data/links.js`.
- [ ] **Full grounding scoring**: nuanced resonance — tone matching (urgent tone on urgent concern = bonus), multi-insight posts, ratio mechanics for hollow/contradictory posts.
- [ ] **Notebook as intelligence brief**: insights cross-reference with community assets. Patterns visualized as connecting lines. "What I know" becomes a strategic planning surface.

**Exit criteria:** Conversations feel like relationships, not transactions. The notebook is useful. Community assets change disaster outcomes. At least one depth system shipped and legible.

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

## Cross-cutting (every phase)

- Rebuild balance simulator for the new loop (CLI tool, reads same data)
- Playtest at each phase gate against GDD §13 metrics
- Design-pillar test: features that fail pillar #2 (knowledge is earned) or #4 (time is the constraint) get cut
- Reconcile index.html inline data with data/entries.js as single source of truth
- **Ollama requirement:** LLM post scoring requires Ollama running locally at `localhost:11434` with a model loaded (default: `llama3.2`). Game is fully playable without it (keyword fallback), but the LLM path is the intended experience. Configure model via `OLLAMA_MODEL` const in `index.html`.
