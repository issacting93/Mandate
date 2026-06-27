# MANDATE — Interactions & Systems Specification

How every player action flows through the system. Each interaction is traced from input to state change to visual feedback.

---

## 1. The Three-View Shell

The game runs in a single page with three views — MAP, CALENDAR, SOCIAL — accessed via a bottom tab bar. A persistent status bar sits above all views. The views are not isolated screens; they are lenses on the same state. Actions in one view produce visible changes in the others.

### Status bar (always visible)
| Element | Source | Updates when |
|---|---|---|
| Week counter | `gameState.week` | `handleEndWeek()` advances week |
| Resilience % | Computed: population-weighted average of `district.trust` across all 19 districts | Any trust change (visit, post, erosion) |
| Reserve | `gameState.reserve` | Policy enacted, operating deficit, event effect |
| Crisis indicator | `gameState.feed` filtered for type `crisis` | Scenario system fires crisis event |

### Tab switching
| From → To | Trigger | What happens |
|---|---|---|
| Any → Map | Click M tab | Map view shows, panels restore, hex menu state preserved |
| Any → Calendar | Click C tab | Calendar renders from `gameState.labels` and `gameState.schedule` |
| Any → Social | Click S tab | Social renders from `gameState.posts`, `gameState.feed`, `gameState.insights`, `gameState.dms` |
| Map → Calendar | "Plan your week →" prompt (appears when labels exist) | Same as tab click, but with visual slide transition |
| Map → Social | Hex menu POST action | Switches to Social with compose input pre-filled with district name + concern |
| Calendar → Map | Click any district name | Switches to Map, selects that district, opens hex menu |
| Social → Map | Click any district name in feed/DMs | Same as Calendar → Map |

---

## 2. Map View — Interactions

### 2.1 District node click → Hex menu
```
Player clicks district node
  → selectDistrict(districtId)
    → closeHexMenu() if another menu is open
    → dimLabels(districtId): all other nodes fade to 15% opacity, edges to 8%
    → openHexMenu(districtId): 5 hexagons expand from center with staggered back.out animation
    → showDistrictPanel(districtId): right panel populates with district detail
```

### 2.2 Hex menu actions

| Action | What happens | State change | Visual feedback |
|---|---|---|---|
| **VISIT** | Labels district for a Mayor Visit | `gameState.labels.push({districtId, action:'visit'})` | Toast: "South Bronx → VISIT". Node flash: green for 600ms. Dashed ring badge + V dot on node. Calendar tab gets red count badge. Calendar queue updates. |
| **LISTEN** | Labels district for a Listening Session | `gameState.labels.push({districtId, action:'listen'})` | Toast: "South Bronx → LISTEN". Node flash: cyan for 600ms. Dashed ring badge + L dot on node. Calendar tab gets red count badge. Calendar queue updates. |
| **INFO** | Shows district detail panel | None | Right panel slides in with trust, knowledge bar, concern, bloc |
| **MSG** | Switches to Social with draft | Switches active tab | Social view activates, compose input pre-filled with district context |
| **CLOSE** | Dismisses hex menu | None | Hexagons collapse to center, selection ring fades, `clearDimLabels()` called after close animation restores node opacity |

**Hex menu bug fix:** The SVG global click handler was closing the hex menu on the same event the hex item was handling. The pan system's `pointerdown` guard didn't recognize hex menu elements (class was `hex-menu-group` not `hex-menu`). Both fixed — hex menu clicks now work reliably.

### 2.3 Labeling toggle
```
Player clicks VISIT on an already-VISIT-labeled district
  → toggleLabel(districtId, 'visit')
    → Same action? Remove label from gameState.labels
    → Also remove from gameState.schedule if scheduled
    → renderMapBadges(): badge removed from node
    → renderCalendar(): card removed from queue

Player clicks LISTEN on a VISIT-labeled district
  → toggleLabel(districtId, 'listen')
    → Action differs: update label.action to 'listen'
    → Badge color changes on map node
    → Calendar card updates
```

### 2.4 View modes
| Mode | Node rendering | Legend |
|---|---|---|
| **Vulnerability** (default) | Opacity = `max(0.14, district.know / 100)`. Dim = blind spot. | Fresh / Stale / Blind |
| **Resilience** | Color by trust: >= 60 dark, >= 45 gray, < 45 red | High / Mixed / Low |
| **Coalition** | Color by bloc (monochrome grays) | 5 bloc names |
| **Needs** | Bloc color, but unvisited at 32% opacity. Visited show insight category chip | Category codes (H/T/S/J/V) |

### 2.5 Pan & Zoom
- Scroll wheel: zoom in/out toward cursor, clamped to 0.3x–2.5x range
- Click-drag on empty space: pan (doesn't trigger district selection or hex menu close)
- `panState.moved` flag prevents accidental hex menu close after a pan gesture
- 6px drag dead-zone threshold: pointer must move at least 6px before a drag is recognized, preventing clicks from being swallowed as micro-drags
- Pan system's `pointerdown` guard recognizes `hex-menu-group` class to avoid interfering with hex menu clicks

---

## 3. Calendar View — Interactions

### 3.1 Calendar structure
- 48-week term mapped to Jan 6 – Dec 21, 2025
- Calendar displays one month at a time, navigable with ◀ ▶ arrows
- Current game week highlighted with red tint
- "Today" = Monday of current week, shown with red circle
- Disaster zone (weeks 30–48) has warm tint
- Past weeks muted, out-of-month days very faded

### 3.2 Time slots
3 slots per week, mapped to Monday / Wednesday / Friday of the current week. Each slot can hold one engagement (a district + action pair).

### 3.3 Scheduling flow
```
1. Player labels districts on Map (hex menu VISIT/LISTEN)
   → Labels appear in Calendar queue strip as chips

2. Player drags a queue chip onto a current-week day cell
   → gameState.schedule[slotIndex] = {districtId, action}
   → Agenda entry appears in the day cell
   → Chip in queue dims to 35% opacity (scheduled)
   → Sidebar updates with slot detail

   OR: Player clicks a queue chip, then clicks an empty slot
   → Same result (click fallback for touch devices)

3. Player drags a filled slot back to the queue area
   → gameState.schedule[slotIndex] = null
   → Agenda entry removed from day cell
   → Queue chip restores full opacity

4. Player clicks a district name anywhere in calendar
   → navigateToDistrict(districtId)
   → Tab switches to Map, district selected, hex menu opens
```

### 3.3a Calendar undo interactions
```
Unschedule via sidebar card × button:
  → Player clicks × on a sidebar schedule card
  → gameState.schedule[slotIndex] = null
  → Agenda entry removed from day cell
  → Queue chip restores full opacity

Unschedule via queue chip × button:
  → Player clicks × on a queue chip
  → Label removed from gameState.labels
  → If scheduled, also removed from gameState.schedule
  → Map badge removed, calendar queue updated

Unschedule via calendar agenda click:
  → Player clicks an agenda item in a calendar day cell
  → gameState.schedule[slotIndex] = null
  → Same unschedule flow as sidebar × button

Drag dead-zone fix:
  → 6px movement threshold before a drag gesture is recognized
  → Prevents clicks from being swallowed as micro-drags
  → Clicks on agenda items and queue chips now register reliably
```

### 3.4 GO — Execute the week
```
Player clicks GO (requires at least 1 scheduled engagement)
  → gameState.weekStarted = true
  → Tab switches to Map view
  → For each scheduled slot:
    → If conversation content exists for that district:
      → startConversation(districtId): conversation overlay slides up
      → Typing indicator → NPC message → player choices → insight chips
      → endConversation(): insights pushed to gameState.insights,
        DM added to gameState.dms, feed item added, trust + knowledge bumped
    → If no conversation content:
      → Direct stat bump: trust +3, knowledge +25
  → Scheduled labels consumed (removed from gameState.labels)
  → Schedule cleared (all slots → null)
  → Map badges, status bar, calendar, social all re-render
```

### 3.5 END WEEK — Advance the clock
```
Player clicks END WEEK
  → For each district:
    → If not visited this week: trust -= 1 (resilience erosion)
    → If knowledge > 0 and not visited: knowledge -= 4 (decay)
  → gameState.reserve -= 0.375 (weekly operating deficit)
  → gameState.week++
  → Generate new feed chatter from neglected districts
  → Check win/lose conditions:
    → resilience < 20% → EVACUATION FAILURE
    → reserve < -$3B → FISCAL CRISIS
    → week > 48 + resilience >= 75% → THE RESILIENT CITY
    → week > 48 + resilience >= 50% → HELD TOGETHER
    → week > 48 + resilience < 50% → THE BLIND RESPONSE
  → All views re-render
  → Calendar navigates to the month containing the new current week
```

### 3.6 Sidebar context
| State | Sidebar shows |
|---|---|
| No day selected | Week summary: slots status, borough coverage, GO button, END WEEK button, commitments (DM reminders) |
| Day selected (current week) | Day name, slot detail (filled or empty), district trust/concern if filled, "Remove" option |
| Day selected (past week) | Read-only: what was done that week (from history) |

---

## 4. Conversation System — Interactions

### 4.1 Conversation structure
Each conversation has:
- **Character**: name, role, initials (avatar), district
- **Exchanges**: 3–5 sequential exchanges, each with:
  - NPC statement (text)
  - 2–3 player response choices, each with a **depth value** (0, 1, or 2)
  - Optional **insight** revealed during this exchange

### 4.2 Conversation flow
```
startConversation(districtId)
  → Overlay slides up over map (dark scrim, glassmorphic panel)
  → Header shows character name, role, district tag
  → Depth meter starts at 0%

showExchange(index)
  → Typing indicator (3 bouncing dots, 600-1400ms)
  → Typing indicator replaced with NPC message (slide-in animation)
  → If exchange has insight: chip pops in below message (scale animation)
  → After 400ms: choice buttons appear below

selectChoice(exchangeIdx, choiceIdx, choice)
  → Unchosen buttons fade out, chosen highlights
  → Player message appears as right-aligned bubble
  → Depth meter advances: width = (totalDepth / maxDepth) * 100%
  → After 500ms: next exchange loads

endConversation() (after final exchange)
  → Summary message: "N insights discovered"
  → Close button: "Thank you. I need to go."
  → On close:
    → district.know += 25 + (depth * 3)
    → district.trust += 2 + depth
    → Each insight pushed to gameState.insights
    → DM from character added to gameState.dms
    → Feed reaction added to gameState.feed
    → All views re-render
```

### 4.3 Depth system (active listening)
The depth meter measures how well the player listened. Higher depth = more information revealed, more trust gained.

| Choice type | Depth value | Example |
|---|---|---|
| Active listening / follow-up question | +2 | "Tell me more about the heat situation specifically." |
| Empathetic / curious | +1 | "Have you reported the landlords to code enforcement?" |
| Generic / deflecting / jumping to solutions | +0 | "That's unacceptable. We'll look into it." |

Depth affects outcomes:
- **Knowledge gain**: `25 + (depth * 3)` — max depth conversation gives ~43 knowledge vs. 25 for surface
- **Trust gain**: `2 + depth` — max depth gives ~10 trust vs. 2 for surface
- **Insight quality**: Higher depth may unlock additional insights in future (not yet implemented)

### 4.4 Insight discovery
Insights are the atoms of understanding. Each has:
```javascript
{
  category: 'HEALTH',           // HEALTH, HOUSING, INFRA, SERVICES, SAFETY, ASSET
  text: 'Asthma corridor near Bruckner Expressway — 3x city average',
  districtId: 'southbronx',
  week: 3,                      // when discovered
}
```

**ASSET** is a special category: community assets discovered through conversations (generators, medical volunteers, mutual-aid networks). These unlock targeted intervention options during the disaster phase.

---

## 5. Social View — Interactions

The Social view will also surface **candidate reactions** (see S11) once the candidates system is built. Rival candidates respond to the player's posts and policies in the feed, creating a second layer of social dynamics beyond district chatter and resident reactions.

### 5.1 Compose & Post
```
Player types in compose input
  → Selects tone pill (CONCERNED / OPTIMISTIC / URGENT / MATTER-OF-FACT)
  → Clicks POST
  (No manual grounding chip selection — the writing IS the mechanic)

handlePost() [async, calls Ollama LLM]
  → System prompt constructed with all player insights as context
  → Player's post text sent to Ollama at localhost:11434 (model: OLLAMA_MODEL const, default llama3.2)
  → LLM returns JSON:
    → Per-district scores (0-10): how well the post resonates with each district's concerns
    → Resident reaction quotes: named residents respond in-character
  → Trust deltas applied per district based on LLM scores
  → Post added to gameState.posts with per-district score breakdown
  → Post card shows overall rating badge:
    → RESONATING (high scores): strong engagement, resident quotes in feed
    → NOTICED (moderate scores): mild engagement, some reactions
    → HOLLOW (low scores): lukewarm engagement, generic reactions
  → Feed shows resident reactions with names and quotes
  → bus.emit('post.published', ...)
  → Social view re-renders (new post at top, reactions in feed)
  → Status bar updates

FALLBACK (Ollama unavailable):
  → Keyword matching against insight text replaces LLM scoring
  → Binary grounded/hollow determination
  → Generic engagement metrics (no per-district breakdown)
  → Game remains fully playable
```

### 5.2 Feed
The feed is a reverse-chronological timeline mixing:

| Type | Source | Visual |
|---|---|---|
| **Player post** | `gameState.posts` | Red dot, text, engagement metrics, GROUNDED/HOLLOW badge |
| **Chatter** | `gameState.feed` type `chatter` | Dark dot, district-specific text (vague if unvisited), DISTRICT CHATTER label |
| **Reaction** | `gameState.feed` type `reaction` | Red dot, response to player's post, REACTION label |
| **News** | `gameState.feed` type `news` | Gray dot, citywide event, NEWS label |
| **DM notification** | `gameState.feed` type `dm` | Dark dot, character name + preview, REPLY link |

**Feed generation**: New chatter is added by `handleEndWeek()` — picks a random neglected district (low knowledge, not recently visited) and generates a complaint from templates. During the disaster phase (weeks 30–48), feed chatter becomes more urgent and specific for visited districts, vaguer for unvisited ones.

### 5.3 DMs
DMs appear in the sidebar. Each thread shows:
- Character avatar (initials circle), name, district tag
- Message history (NPC messages left-aligned, player replies right-aligned)
- Unread badge if new messages

**DM triggers:**
- After a conversation ends: character sends a follow-up DM
- After a week passes without visiting: character may send a reminder ("The heat still isn't fixed")
- During disaster phase: characters in visited districts send real-time updates ("The power is out, Mrs. Gutierrez is okay for now")

### 5.4 District name linking
All district names in the feed, DMs, and post text are rendered as tappable links. Clicking one:
```
navigateToDistrict(districtId)
  → Switch to Map tab
  → selectDistrict(districtId): opens hex menu on that district
  → Player can immediately label it for a visit
```
This is the Social → Map bridge: reading about a problem leads directly to planning a response.

---

## 6. Event Bus — Complete Event Flow

### 6.1 One week (steady state)

The inline EventBus in `index.html` emits events at key lifecycle points. The modular systems (`clock.js`, `trust.js`, `policy.js`, `scenario.js`) can be wired via the bus. A state bridge wraps `gameState` + `DISTRICTS` with a dot-path `get`/`set`/`update` API.

```
game.start                              ← bus event: game initialization
  └── onboarding or normal loop begins

clock.weekStart {week}                   ← bus event
  ├── knowledge.decayed (all districts dim)
  ├── insight.staled (old insights lose freshness)
  ├── feed.updated (new chatter, DMs)
  ├── engagement.available {slots: 3}
  └── scenario.evaluate (blizzard-arc events fire on clock.weekStart,
      apply effects: trust, reserve, flags, feed items;
      major events show cinematic Frostpunk-style dark overlays with "I SEE" dismiss)

── PLAYER-DRIVEN (no enforced order) ──

Map labeling (free, no slot cost):
  ui.districtLabeled {districtId, action}
    └── label.added → node badge, calendar queue, toast, node flash, calendar tab badge

Calendar scheduling:
  ui.labelScheduled {slot, districtId, action}
  ui.labelUnscheduled {slot}             ← via × buttons or click-to-unschedule
  ui.weekStarted ("Go")
    └── FOR EACH scheduled slot:
         engagement.started {districtId, action}   ← bus event
         IF visit/listen + conversation exists:
           conversation.loaded → exchanges → conversation.ended   ← bus event
           insight.discovered (×1-3)
           knowledge.updated
         IF intervention:
           policy.available → ui.policyChosen → policy.resolved

Social actions (free, no slot cost):
  ui.postComposed {text, tone}
    └── post.published {perDistrictScores, reactions}   ← bus event
        └── feed.reaction (LLM-scored engagement, resident quotes)
  ui.dmSent {characterId, text}
    └── dm.replied {trustDelta}

── WEEK END ──

  ui.weekAdvanced ("End Week")           ← bus event
    ├── trust erosion (-1/district/week if unvisited)
    ├── knowledge decay (-4/district/week if unvisited)
    ├── operating deficit (-$0.375B)
    ├── unscheduled labels carry over
    ├── check win/lose conditions
    └── clock.weekStart {week + 1}
```

### 6.2 Disaster phase (weeks 30–48)
The disaster arc is scripted through the scenario system:

| Week range | Phase | What changes |
|---|---|---|
| 1–29 | Before | Normal play. Feed chatter is vague for unvisited districts. Insights reveal pre-existing vulnerabilities. |
| 30–35 | Warning | Feed generates weather warnings. Status bar shows crisis indicator. Disaster-zone tint on calendar. DMs from visited characters express concern. |
| 36–40 | During | Disaster strikes. Feed floods with emergency reports — specific from visited districts, silence from unvisited. Knowledge determines whether interventions deploy correctly. Resilience determines community self-organization. |
| 41–48 | After | Recovery. DMs shift to follow-up ("Did you fix it?"). Resilience rebounds in visited districts, craters in neglected ones. Final score computes from total resilience across all 19 districts. |

### 6.3 LLM post scoring flow (Ollama)
```
Player writes post text → clicks POST
  → handlePost() [async]
  → Constructs system prompt:
    - Role: "You are evaluating a mayor's social media post"
    - Context: all player insights (category, text, district, week) serialized
    - Task: score how well the post addresses each district's concerns
  → Sends to Ollama (localhost:11434, model: OLLAMA_MODEL const, default llama3.2)
  → LLM returns JSON response:
    {
      scores: { districtId: 0-10, ... },
      reactions: [ { district, name, quote }, ... ]
    }
  → Per-district trust deltas applied based on scores
  → Post card rendered with:
    - Per-district score breakdown
    - Overall rating: RESONATING (avg >= 7) / NOTICED (avg >= 4) / HOLLOW (avg < 4)
  → Feed items added: resident reactions with names and quotes
  → bus.emit('post.published', ...)

FALLBACK (Ollama unavailable / fetch fails):
  → Keyword matching: post text compared against insight text
  → Binary grounded/hollow scoring
  → Generic trust delta (+2 per matched district or +0)
  → Generic feed reaction (no per-district breakdown, no resident quotes)
```

### 6.4 Blizzard scenario arc (inlined events)
```
10 blizzard-arc scenario events inlined in index.html, weeks 4-44:
  → Fire on clock.weekStart when gameState.week matches event week
  → Each event applies effects: trust deltas, reserve changes, flags, feed items
  → Major events (blizzard watch, warning, strike, models converge)
    show cinematic Frostpunk-style dark overlays with "I SEE" dismiss buttons

Left panel shows:
  → "BLIZZARD ARRIVING IN X WEEKS" countdown (replaces generic briefing timer)
  → Preparation checklist (updates dynamically each week):
    - Districts visited: X/5+ required
    - Insights discovered: X/3+ required
    - Patterns found: X/1+ required
    - Resilience above 50%: yes/no
```

### 6.5 Visual feedback for VISIT/LISTEN
```
Player clicks VISIT or LISTEN on hex menu:
  → Toast notification appears: "{District Name} → VISIT" (or LISTEN)
  → Node flash: district node turns green (VISIT) or cyan (LISTEN) for 600ms
  → Dashed ring badge appears around node + small V or L dot
  → Calendar tab gets red count badge showing queue length
  → clearDimLabels() called after hex menu close animation completes
```

### 6.6 Cinematic game end screen
```
Game end condition met (resilience threshold or week > 48):
  → Dark overlay slides in (Frostpunk-style, replaces old alert() calls)
  → Final stats displayed with color coding:
    - Resilience %
    - Reserve
    - Week reached
  → "Play Again" button reloads the page
```

---

## 7. State Model

```javascript
gameState = {
  week: 1,                           // 1-48
  reserve: 5.0,                      // $B
  slotsTotal: 3,
  weekStarted: false,

  labels: [                           // from hex menu
    { districtId, action, labeledAt }
  ],

  schedule: [null, null, null],       // 3 slots, each {districtId, action} or null

  insights: [                         // from conversations
    { category, text, districtId, week }
  ],

  posts: [                            // from compose
    { text, tone, grounded, groundedInsights[], engagement: {likes, shares, replies}, week }
  ],

  feed: [                             // generated + reactive
    { type, text, districtId?, time, week }
  ],

  dms: [                              // from conversations + weekly generation
    { characterName, initials, districtId, districtName, messages: [{text, sent}], unread }
  ],
}
```

District data lives on the `DISTRICTS` array (not in gameState), with mutable fields:
```javascript
{
  id, name, boro, bloc,               // static
  x, y, r,                            // position (static)
  trust,                              // 0-100, mutable (resilience)
  know,                               // 0-100, mutable (knowledge/vulnerability mapping)
  lastVisited,                        // week number or null
  pop, concern, cat,                  // content (static)
}
```

---

## 8. Systems Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  index.html (shell)                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ Map View │ │ Calendar │ │ Social   │   ← UI renderers   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘                   │
│       │             │            │                          │
│  ┌────▼─────────────▼────────────▼─────┐                   │
│  │         gameState (in-memory)        │   ← single truth │
│  └────┬─────────────┬────────────┬─────┘                   │
│       │             │            │                          │
│  ┌────▼────┐  ┌─────▼────┐ ┌────▼─────┐                   │
│  │ render  │  │ render   │ │ render   │   ← reactive       │
│  │ MapBadge│  │ Calendar │ │ Social   │     re-renders     │
│  │ Nodes   │  │          │ │          │                     │
│  └─────────┘  └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘

EventBus bridge + state bridge now inline in index.html.
Modular systems can wire via bus. Future extraction:

┌────────────────────────────────────────────────────────────┐
│  systems/ (bus-connected, no imports between systems)      │
│                                                            │
│  bus.js ──────── EventBus (pub/sub backbone)               │
│  state.js ────── StateStore (reactive, dot-path get/set)   │
│  registry.js ─── EntryRegistry (content graph queries)     │
│  clock.js ────── ClockSystem (weekly cadence, win/lose)    │
│  trust.js ────── TrustSystem (per-district resilience)     │
│  policy.js ───── InterventionSystem (insight-gated tiers)  │
│  scenario.js ─── ScenarioSystem (weekly events, disasters) │
│                                                            │
│  TO BUILD:                                                 │
│  engagement.js ─ EngagementSystem (label→schedule→execute) │
│  conversation.js ConversationSystem (dialogue + insights)  │
│  insight.js ──── InsightSystem (freshness, patterns)       │
│  knowledge.js ── KnowledgeSystem (per-district brightness) │
│  social.js ───── SocialSystem (posts, grounding, feed)     │
│  onboarding.js ─ OnboardingSystem (Week 0 sequence)        │
│  candidate.js ── CandidateSystem (rival reactions, approval)│
│  policybuilder.js PolicyBuilderSystem (bento box grid)     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  data/ (content graph — entries + links)                   │
│                                                            │
│  entries.js ──── districts, infrastructure, blocs,         │
│                  resources, outcomes, policies             │
│                  TO ADD: characters, insights, fragments,  │
│                  patterns, events, community assets        │
│  links.js ────── threatens, mitigates, protects, etc.      │
│                  TO ADD: lives_in, knows_about, leads_to,  │
│                  contributes_to, unlocks                   │
└────────────────────────────────────────────────────────────┘
```

---

## 9. What's Built vs. What's Next

### Built and wired (in index.html)
- [x] SVG map with 19 nodes, 26 edges, 4 view modes, pan/zoom
- [x] Hex radial menu with 5 actions, animated expand/collapse
- [x] Hex menu bug fix (SVG global click handler + pan system `hex-menu-group` class recognition)
- [x] Labeling system (VISIT/LISTEN → badge on node → calendar queue)
- [x] Visual feedback for VISIT/LISTEN (toast, node flash, dashed ring badge + V/L dot, calendar tab red count badge)
- [x] Calendar grid (monthly view, agenda entries, queue strip, drag-and-drop scheduling)
- [x] Calendar undo (x on sidebar cards, x on queue chips, click agenda to unschedule, 6px drag dead-zone)
- [x] Calendar → Map linking (click district name → navigateToDistrict)
- [x] GO → conversation overlay (typing indicator, choices, depth meter, insight chips)
- [x] 10 conversation scripts (10 districts, also ported to Swift)
- [x] END WEEK (trust erosion, knowledge decay, deficit, feed generation, win/lose checks)
- [x] Social view with dynamic rendering (compose bar, LLM-scored posts, feed, DMs, insights)
- [x] LLM post scoring (async Ollama at localhost:11434, per-district scores + resident reactions, keyword fallback)
- [x] District detail panel (trust, knowledge bar, concern, bloc)
- [x] Status bar reactive to state changes
- [x] EventBus bridge (inline EventBus class, state bridge with dot-path get/set/update API)
- [x] Scenario events inlined (10 blizzard-arc events, weeks 4-44, cinematic overlays)
- [x] Blizzard countdown + preparation checklist in left panel
- [x] Cinematic game end screen (Frostpunk-style overlay, final stats, "Play Again")

### Next priorities (Phase 1 remaining)
- [ ] Extract game logic from index.html into systems/ modules (bus-connected, EventBus bridge already inline)
- [ ] Wire systems/ to the shell via ES module imports
- [ ] Build remaining conversation scripts (9 more districts)
- [ ] Build OnboardingSystem (Week 0 scripted sequence)
- [ ] Build InsightSystem (freshness decay, cross-district pattern detection)
- [x] Blizzard-arc scenario events inlined (10 events, weeks 4-44) — still needs extraction to data entries + scenario.js wiring
- [ ] Feed generation improvements (vague↔specific based on knowledge, disaster-phase urgency)
- [ ] DM system: weekly character messages, reply functionality
- [ ] Notebook drawer (slide-out panel showing all insights, accessible from any view)
- [ ] Intervention planning: informed/pattern tiers unlocked from insight patterns

---

## 10. Bento Box Policy Builder (future)

Spatial policy construction that replaces the current policy card selection. The player builds interventions by dragging component tiles into a fixed-size grid.

### 10.1 Grid structure
The bento box is a fixed-size grid (target: 4x4 or 5x5, pending playtesting). Each cell can hold one tile. The grid's total area represents the budget constraint — you can't place more tiles than the grid has cells.

### 10.2 Tile types

| Tile | Size | Color | Function |
|---|---|---|---|
| **WHERE** | 1x1 | Blue | Targets a borough or specific district. Must be placed before WHAT tiles can be assigned to that area. |
| **WHAT** | 1x1 or 2x2 | Green | Infrastructure type: plows, generators, shelters, outreach teams, medical caches. Generic WHAT tiles are 2x2; insight-unlocked versions shrink to 1x1. |
| **HOW** | 1x1 | Purple | Deployment strategy modifier. Applies to adjacent WHAT tiles: prioritize density, vulnerability index, or equal spread. |
| **FUNDING** | 1x1 | Gold | Each block = $0.2B. Required adjacent to WHAT tiles to activate them. More funding blocks = wider coverage. |

### 10.3 Placement rules
```
Player drags a WHERE tile onto an empty grid cell
  → Cell fills with borough/district color
  → Adjacent empty cells highlight as valid WHAT placement zones

Player drags a WHAT tile adjacent to a WHERE tile
  → Snaps into place with haptic feedback
  → If generic (no insight): occupies 2x2 (4 cells)
  → If informed (insight-unlocked): occupies 1x1 (1 cell)
  → Cost indicator updates: shows FUNDING blocks needed to activate

Player drags a HOW tile adjacent to a WHAT tile
  → Modifier applied: deployment strategy text appears on WHAT tile
  → Synergy glow if compatible (e.g., "vulnerability" HOW + outreach WHAT)
  → Conflict rejection if incompatible (e.g., "density" HOW + rural WHERE)
    → Tile bounces back to tray with shake animation

Player drags a FUNDING block adjacent to a WHAT tile
  → Reserve decreases by $0.2B
  → WHAT tile activation meter fills
  → When fully funded: tile glows, intervention is queued for enactment
```

### 10.4 Synergies and conflicts
```
Adjacent compatible tiles → synergy:
  → Visual: golden connecting line between tiles, both pulse
  → Mechanical: combined effect > sum of individual effects
  → Example: generator WHAT + medical cache WHAT adjacent = backup power for insulin
    storage, protecting medically vulnerable residents automatically

Adjacent incompatible tiles → conflict:
  → Visual: red X between tiles, placement rejected
  → Tile bounces back to tray
  → Example: "prioritize density" HOW + Staten Island WHERE = contradiction
    (low density borough can't benefit from density-first strategy)
```

### 10.5 Insight-unlocked efficiency
```
Player discovers insight about specific vulnerability (e.g., "pharmacy on 138th needs generator")
  → Generic "generator" WHAT tile (2x2) gets an informed variant (1x1) in the tile tray
  → Informed variant: same effect, quarter the grid space
  → More efficient tiles = more interventions in the same budget
  → This is how listening translates directly into better policy design
```

### 10.6 State changes
```
Player finalizes bento box and clicks ENACT
  → For each fully-funded WHAT tile:
    → policy.resolved {type, targets, strategy, cost}
    → Trust deltas applied to targeted districts
    → Infrastructure effects registered for disaster phase
    → Reserve reduced by total FUNDING blocks * $0.2B
  → Bento box clears
  → Feed: "Mayor announces [intervention description]"
  → Map: targeted district nodes flash with policy color
```

**Status:** Design concept. Not yet prototyped. Grid size, tile inventory, and synergy/conflict rules need playtesting.

---

## 11. Candidate Feed Reactions (future)

Rival political candidates appear in the Social view's feed, reacting to the player's posts and policies. They add political tension without new views or interaction modes — everything happens within the existing feed.

### 11.1 Candidate presence in feed

| Feed item type | Trigger | Visual |
|---|---|---|
| **Candidate post** | Player publishes a post | Candidate avatar (colored border matching their bloc alignment), name, reaction text. "CANDIDATE" label. |
| **Candidate attack** | Player enacts a policy that hurts the candidate's aligned blocs | More aggressive tone. "OPPOSITION" label with red tint. |
| **Candidate exploit** | Player posts a hollow or contradictory message | Candidate quotes the player's post and rebuts it. "FACT CHECK" label. |
| **Candidate platform** | Periodic (every 4-6 weeks) | Candidate announces their own policy position. Not reactive — proactive. |

### 11.2 Candidate reaction flow
```
Player publishes a post
  → post.published event fires
  → CandidateSystem receives post text + candidate profiles
  → For each candidate:
    → LLM prompt: candidate profile + player's post + recent game context
    → LLM generates a reaction in the candidate's voice
    → Reaction added to gameState.feed with type "candidate_reaction"
    → Feed renders reaction 1-2 items below the player's post (slight delay for realism)

Player enacts a policy (via bento box or current policy card)
  → policy.resolved event fires
  → CandidateSystem evaluates policy against candidate's bloc alignment
  → If policy hurts candidate's blocs: generate attack post
  → If policy helps candidate's blocs: candidate stays silent or grudgingly agrees
  → Approval rating adjusts based on bloc trust shifts
```

### 11.3 Candidate profiles (data)
```javascript
{
  id: "cand_chen",
  name: "David Chen",
  role: "City Council President",
  bloc: "finance",                    // primary alignment
  secondaryBloc: "realestate",
  platform: "Fiscal responsibility and business recovery",
  style: "measured",                  // rhetorical style for LLM prompting
  attackStyle: "fact-based",          // how they attack: "fact-based", "populist", "moral"
  portrait: "chen"
}
```

### 11.4 Approval rating
```
Approval = f(bloc trust weighted by candidate opposition)
  → When player's trust increases with a bloc that opposes the leading candidate,
     approval increases
  → When player's trust decreases with a key bloc, approval decreases
  → Displayed alongside resilience in status bar: "Resilience: 62% | Approval: 48%"
  → Election outcome determined by approval at term end (separate from resilience outcome)
  → Possible to win the city (high resilience) but lose the election (low approval), or vice versa
```

### 11.5 Interaction limits
Candidates are **read-only** in the feed. The player cannot:
- Reply to candidate posts (no direct debate mechanic)
- DM candidates
- Visit candidates on the map

The player's only response to candidates is to **govern well** — make grounded posts, enact informed policies, build trust in the districts that matter. The candidate system creates pressure through the media layer, not through new interaction modes.

**Status:** Design concept. CandidateSystem not yet built. Requires LLM prompt design for candidate voice generation and approval rating math.
