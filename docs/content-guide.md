# MANDATE — Content Authoring Guide

**Classification:** Internal Reference — Content Authors  
**Document version:** 1.0  
**Last updated:** 2026-07-01  
**Scope:** Conversations, scenarios, interventions, tiles, district profiles  

This document codifies all conventions, structures, and standards required to author game content for Mandate. It is the single source of truth for anyone writing dialogue, designing interjections, defining insights, building scenario events, or profiling new districts. If a convention is not documented here, it does not exist.

Read this before writing anything. Refer to it while writing everything.

---

## 01 — Voice & Tone

Mandate is not a game manual. It is not a novel. It is a government briefing that leaks humanity through the cracks.

**The institutional voice.** Feed items, scenario headlines, and system text are written in bureaucratic shorthand. Short declarative sentences. No exclamation marks. No editorializing. If a city comptroller would not write it in a press release, it does not belong in the feed.

> *Comptroller: operating reserve below 60%. "Fiscal caution advised."*  
> *October squall: 3 inches in Queens. Flushing streets unplowed for 18 hours.*  
> *Sanitation union secures emergency overtime deal: $500M committed.*

**The human voice.** NPCs speak as people who have been doing this work — living in this neighborhood, managing this building, running this pharmacy — for years. They are tired, specific, and unsentimental. They do not explain their expertise; they demonstrate it by knowing things the city's data systems have never captured. They do not perform emotion; emotion surfaces in the details they choose to share.

> *"Heat's been out since November. Third winter in a row. The landlord says he filed for parts. The city says they sent an inspector. Nobody came."*

**The department voice.** Department interjections are terse, observational, and institutional. They read the room the way a trained analyst reads a room — not with feeling, but with pattern recognition. They are the perspective of competent public servants whispering the thing the player would miss. They never address the player directly. They never use first person. They observe.

> *Asthma corridor. 3x city average.*  
> *She mentioned the kids by apartment number. She knows everyone.*  
> *Third winter of cold exposure. Hypothermia risk compounds.*

**What this voice is not.** It is not sarcastic. It is not cynical. It is not comic. It is not inspirational. Characters are not plucky underdogs or corrupt villains. They are resourceful experts on their own survival, dealing with systems that have failed them in specific, documentable ways.

---

## 02 — Character Design

Every NPC contact in Mandate is a domain expert whose expertise comes from lived experience, not credentials. They know things because they have been present — in the building, on the block, at the pharmacy counter — for years.

### 02.1 — Design Principles

- **Expertise through presence.** A school nurse who sees 600 kids a year has better vulnerability data than the census. A retired FDNY captain who walked every hydrant on his route has spatial infrastructure knowledge that did not survive his retirement. Write characters who know things the city does not know it does not know.

- **Skepticism with a door ajar.** Every NPC has been failed by a previous administration, a previous promise, a previous official who took notes and never called back. They are not hostile. They are calibrated. They will share if asked correctly — if the player demonstrates that they are listening, not performing.

- **Concrete, specific asks.** Each character has something they want that can be expressed in a dollar amount, a piece of equipment, a protocol change, or a headcount. Vague asks ("we need more support") are not permitted. Specificity is how the game signals that these are real people with real solutions the city has not implemented.

  > *"Three more health workers and a radio. That's a $180,000 ask."*  
  > *"A generator. One generator. $8,000."*  
  > *"15 retired CDL drivers. I have the names."*

- **Voice shaped by profession.** A tenant organizer is exhaustive — she knows every apartment number, every violation, every inspector who did not show. A retired city worker is institutional — dry, procedural, aware of which form to file and which office to call. A faith leader is relational — he knows people by name and by what they need, not by unit number. A business owner is transactional — she wants to know what it costs, what it takes, and when it is done.

### 02.2 — Required Fields

Every character entry in `CONVERSATIONS_V2` must include:

| Field | Type | Description |
|---|---|---|
| `name` | string | Full name. First and last. |
| `role` | string | Functional role, not title. "Tenant Organizer" not "Community Advocate." |
| `initials` | string | Two-letter initials for the conversation UI avatar. |

Additionally, every character must have a **one-sentence worldview** documented in the conversation file's comment header. This sentence captures how they see the relationship between the city and the people it serves.

> *// Maria Delgado — "The city sends inspectors. The building sends cold."*  
> *// James Washington — "The ones who stayed are the ones who matter."*  
> *// Tommy Ferraro — "I don't need the city to fix the seawall. I need it to have a plan."*

### 02.3 — Emotional Arc

Each character has a three-exchange emotional trajectory:

| Exchange | Character State | Player Signal |
|---|---|---|
| 1 | **Guarded.** Presents the problem. Tests whether the player will listen or immediately promise a fix. | Player who listens advances. Player who solution-jumps receives a `solutionJump: true` flag on their choice. |
| 2 | **Testing.** Shares something more vulnerable — a specific name, a specific fear, a specific failure by a previous official. A skill check gates deeper trust. | Pass: the character opens up. Fail: the character references a previous betrayal and closes the door slightly. |
| 3 | **Trusting or disappointed.** Reveals the community asset — the network, the space, the people who are ready. Or, if trust has not been earned, offers a diminished version that the player must work harder to access. | The ASSET insight is the payoff for listening well. |

This arc is not optional. Every conversation must move through these three emotional registers in this order.

---

## 03 — Conversation Structure

All new conversations use the V2 format defined in `data/conversations_v2.js`. The V1 format (flat dialogue trees) is deprecated. Do not author new content in V1.

### 03.1 — Architecture

Each conversation consists of exactly **3 exchanges**. Each exchange contains NPC dialogue, department interjections, free choices, optional skill checks, and optional insights.

```
district_id: {
  character: { name, role, initials },
  exchanges: [
    { /* Exchange 1 */ },
    { /* Exchange 2 */ },
    { /* Exchange 3 */ },
  ],
}
```

### 03.2 — Exchange Template

```javascript
{
  // NPC's spoken dialogue. 2-4 sentences. Specific, grounded, no abstractions.
  npc: "Dialogue text here.",

  // Department interjections. See Section 04 for voice rules.
  interjections: [
    {
      dept: 'HEALTH',        // HEALTH | HOUSING | INFRA | SERVICES | SAFETY | COMMUNITY
      minLevel: 1,           // 1 = always visible, 2 = funded, 3 = well-funded
      text: "Interjection.",  // Terse observation. No verbs addressing the player.
      followUp: "Question?",  // Optional. Suggests a deeper question the player could ask.
    },
    // 1-3 interjections per exchange
  ],

  // Player's available responses. Exactly 3 per exchange.
  freeChoices: [
    { text: "Response text.", depth: 1 },                          // Surface
    { text: "Response text.", depth: 2 },                          // Engaged
    { text: "Response text.", depth: 3 },                          // Deep — references something NPC said
    // One choice may have: solutionJump: true (premature fix)
    // One choice may have: depth: 0, solutionJump: true (the trap)
  ],

  // Skill check. 0-1 per exchange. Typically in exchange 2.
  checks: [
    {
      dept: 'HEALTH',        // Which department skill is tested
      difficulty: 12,        // Target number, range 10-13
      pass: {
        insight: {
          category: 'HEALTH', // HEALTH | HOUSING | INFRA | SERVICES | SAFETY | ASSET
          text: 'Specific, actionable intelligence.',
        },
        npcReaction: "Character response on pass — they open up.",
      },
      fail: {
        text: "Character response on fail — they reference past betrayal.",
        trustInsight: "Meta-observation about why trust was not given.",
      },
    },
  ],

  // Automatic insight (not gated by check). 0-1 per exchange.
  insight: {
    category: 'HOUSING',
    text: 'Specific vulnerability or pattern observed.',
  },
}
```

### 03.3 — Exchange Pacing

| Exchange | Content Requirements |
|---|---|
| **1** | Introduction + primary concern. The NPC states the problem. 1-2 department interjections (at least one at `minLevel: 1`). 1 obvious insight (vulnerability category matching the district's highest concern score). One `solutionJump` trap choice. |
| **2** | Deeper investigation. The NPC shares a specific person, a specific failure, a specific risk. 1 skill check (difficulty 10-13). Pass reveals a hidden vulnerability or names a specific person. Fail teaches a trust lesson — the NPC references a previous official who promised and did not deliver. 2-3 interjections at varying `minLevel` values (1, 2, and/or 3). |
| **3** | Community asset reveal. The NPC describes what already exists — the network, the space, the people. Solution-oriented. 1 ASSET insight (always the final insight of the conversation). Department interjections synthesize — they connect what the NPC said to systemic patterns. At least one interjection at `minLevel: 3` that maps the asset to a citywide opportunity. |

### 03.4 — Free Choice Design

Each exchange offers exactly 3 free choices with assigned depth values:

| Depth | Meaning | Player Behavior |
|---|---|---|
| 0 | **Premature fix.** The player offers a solution before understanding the problem. Always paired with `solutionJump: true`. | "We'll get someone out there." / "I'll make some calls." |
| 1 | **Surface.** The player acknowledges but does not dig deeper. | "Tell me more about what's happening." |
| 2 | **Engaged.** The player asks a specific follow-up that shows attention. | "Walk me through what that day looked like." |
| 3 | **Deep.** The player references something the NPC said earlier — a name, a number, a detail. | "You said Mrs. Gutierrez is on oxygen. What happens when the power goes?" |

**Rules:**

- One choice per exchange should reference something the NPC said in a previous exchange (depth 2 or 3).
- At most one `solutionJump` per exchange. It should be phrased as a well-intentioned but premature promise.
- Solution-jump choices should never be mocking or obviously wrong — they are the thing a busy, well-meaning mayor would say if they were not actually listening.

---

## 04 — Department Interjections

Department interjections are the Disco Elysium-style "skill voices" of Mandate. Each department has a distinct analytical perspective. They observe; they do not advise. They notice; they do not recommend.

### 04.1 — Department Voices

**HEALTH** — Clinical, epidemiological. Reads bodies, patterns of illness, compound vulnerabilities. Speaks in medical and public health shorthand.

> *"Asthma corridor. 3x city average."*  
> *"Oxygen-dependent, elevator building — she's trapped if power goes."*  
> *"Third winter of cold exposure — some of those tenants are elderly. Hypothermia risk compounds."*  
> *"Heat plus diabetes plus no transit equals preventable death. This is a compound vulnerability."*

**HOUSING** — Regulatory, code-focused. Reads buildings, tenancy status, legal obligations, compliance history. Speaks in the language of violations and statutes.

> *"Rent-stabilized. Landlord has legal obligation."*  
> *"That's a code violation."*  
> *"Rent-stabilized building. Landlord has a legal obligation to provide heat. This is actionable."*  
> *"200 basement apartments. One block. Those aren't housing — they're flood zones with beds."*

**INFRA** — Systems-level, failure-chain thinking. Reads networks, dependencies, single points of failure. Sees how one broken thing causes the next thing to break.

> *"Single point of failure. Generator goes, insulin goes."*  
> *"Loading dock, freight elevators, backup power — three single points of failure. One storm takes all three."*  
> *"Four-day blackout, high-rise, no elevator — this is a systematic failure."*  
> *"No bus during a blackout means no evacuation corridor. The transit gap becomes a life-safety gap."*

**SERVICES** — Equity-focused, gap-identifying. Reads access, response times, systemic exclusions. Measures who the system serves and who it does not.

> *"311 response: 4+ hours here. 45 minutes uptown."*  
> *"English-only alerts in a 14-language neighborhood. That's not communication — it's noise."*  
> *"She's comparing $180K to $800M. The ratio speaks for itself."*  
> *"Nobody reported it as a crisis. Because there's no reporting mechanism for a pharmacy closure."*

**SAFETY** — Risk assessment, population-level. Reads threat exposure, institutional distrust, who dies in disasters and why. Connects individual stories to mortality patterns.

> *"30 institution-distrustful residents. They won't call 911."*  
> *"Basement apartments plus flooding equals the Ida death toll."*  
> *"He's describing the exact population that dies in every disaster — isolated, distrustful, invisible to systems."*  
> *"15 retired first responders with radios and drill discipline. This is a deployable asset sitting idle."*

**COMMUNITY** — Network-mapping, asset-identifying. Reads relationships, mutual aid structures, who knows whom. Sees the invisible infrastructure of trust.

> *"She knows everyone by apartment number. Community sentinel."*  
> *"'We look out for each other' — this is organized mutual aid, not just neighborliness."*  
> *"A vulnerable-resident registry, maintained by one person. This is exactly what emergency management needs."*  
> *"A mutual aid network that survived COVID and kept going. Most collapsed. Hers scaled. Find out why."*

### 04.2 — Interjection Levels

The `minLevel` field determines when an interjection becomes visible, based on the player's department funding level:

| Level | Gate | Voice Quality | Example |
|---|---|---|---|
| 1 | Always visible | **Vague observation.** Names the category but not the implication. | *"That's a code violation."* |
| 2 | Department funded (level 2+) | **Specific read.** Names the regulation, the statistic, the mechanism. | *"Rent-stabilized building. Landlord has legal obligation to provide heat."* |
| 3 | Department well-funded (level 3+) | **Systemic connection.** Links this observation to a pattern, a cascade, or a citywide implication. | *"Third winter of cold exposure. Hypothermia risk compounds."* |

**Rules:**

- Every exchange must have at least one `minLevel: 1` interjection.
- Level 3 interjections should feel like a revelation — the thing only a well-funded analyst would notice.
- Interjections from multiple departments in the same exchange are encouraged. A single NPC statement about a pharmacy should trigger HEALTH (medication), INFRA (single point of failure), and COMMUNITY (mutual aid network) observations simultaneously.
- Interjections never address the player. No "You should..." or "Consider..." — only observations.

### 04.3 — Follow-Up Questions

Each interjection may include an optional `followUp` field — a question the player could ask, suggested by the department's perspective. Follow-ups are phrased as direct questions and should push the conversation deeper.

> *followUp: "How many people on this block are diabetic and transit-dependent?"*  
> *followUp: "Would residents cooperate with an evacuation plan if we guaranteed no enforcement?"*

---

## 05 — Insight Design

Insights are the atomic unit of intelligence in Mandate. They represent specific, actionable knowledge gained from conversations. They are perishable. They are the bridge between listening and policy.

### 05.1 — Insight Categories

| Category | What It Captures | Example |
|---|---|---|
| `HEALTH` | Medical vulnerabilities, epidemiological patterns, compound health risks | *"Mrs. Gutierrez, 4th floor, oxygen-dependent, lives alone."* |
| `HOUSING` | Building conditions, tenancy violations, displacement patterns | *"Heat failures in rent-stabilized buildings — systemic, not isolated. Third winter."* |
| `INFRA` | Infrastructure dependencies, failure chains, single points of failure | *"Single-point-of-failure: one pharmacy generator protects insulin supply for 12+ residents."* |
| `SERVICES` | Access gaps, response time disparities, language barriers | *"Emergency alerts English-only — 14 languages on one block."* |
| `SAFETY` | At-risk populations, institutional distrust, mortality risk factors | *"30 institution-distrustful residents — won't go to shelters, need door-to-door outreach."* |
| `ASSET` | Community resources — people, spaces, networks, equipment | *"VFW hall on Jerome Ave — generator, AC, 200-person capacity, 12 active vets."* |

### 05.2 — Rules

1. **One vulnerability insight per conversation.** Its category must match the district's highest concern score in `CONCERN_SCORES` (defined in `data/districts.js`). If a district's top concern is `health: 9`, the vulnerability insight must be category `HEALTH`.

2. **One ASSET insight per conversation.** This is the community resource — the person, the space, the network, the equipment that already exists and that the city does not know about. ASSET insights are always revealed in Exchange 3 or behind a skill check.

3. **ASSET insights are the most specific.** They must include at least two of: names, addresses, capacities, dollar amounts, headcounts, equipment lists, timelines.

   > *Good: "Pharmacy at 138th has generator — stores insulin for 12 residents. Carlos coordinates with 3 block captains."*  
   > *Bad: "There's a pharmacy with a generator nearby."*

4. **Insights decay.** Freshness starts at 1.0 and decays at a rate of 0.09 per week. At freshness 0.3, an insight is considered stale. At 0.0, it is dead. Dead insights no longer count toward pattern detection or tile gating. This means intelligence gathered in Week 1 is irrelevant by Week 9 unless reinforced.

5. **Insight-to-pattern pipeline.** When 3 or more fresh insights of the same category exist across 3 or more different districts, a pattern begins forming. After 5 weeks of cook time, the pattern crystallizes and grants a permanent +1 effective level to the matching department. (See `systems/insight.js` for the `PATTERN_MIN_DISTRICTS` and `COOK_TIME` constants.)

6. **Skill-check insights vs. automatic insights.** Automatic insights (the `insight` field on an exchange) are always granted. Skill-check insights (inside `checks[].pass.insight`) are conditional — the player must pass the department check to receive them. Failed checks yield a `trustInsight` instead, which is narrative-only and does not count toward patterns.

### 05.3 — Insight Text Standards

- Use present tense.
- Begin with the specific noun: a person, a building, an address, a system.
- Include at least one quantitative detail (a number, a dollar amount, a time duration).
- Do not editorialize. State the fact. Let the game systems assign meaning.

> *Correct: "11 homebound residents can't evacuate — 8 on oxygen, elevator-dependent, no emergency contact system."*  
> *Incorrect: "Tragically, many elderly residents are at risk during power outages."*

---

## 06 — Scenario Events

Scenario events are scripted narrative beats that fire based on game state conditions. They create the pressure curve of the blizzard arc and inject fiscal, political, and environmental challenges between major beats.

### 06.1 — Blizzard Arc Timeline

The primary arc follows this sequence:

| Week | Event | Function |
|---|---|---|
| 4 | Long-Range Forecast | First signal. No mechanical effect. Feed item only. |
| 10 | Infrastructure Report | Raises awareness. Feed item. |
| 14-18 | Summer Heat Stress | Tests community networks. Visited districts perform better. |
| 22 | Models Converge | 70% probability signal. Narrows preparation window. |
| 28-32 | October Squall | Preview event. Trust delta in outer-borough districts. |
| 30-34 | Salt Spike | Reserve drain (-$0.3B). Citywide disorder +3. |
| 36 | Blizzard Watch | Citywide disorder +4. Last preparation window. |
| 37-40 | Union Demands | Reserve drain (-$0.5B). Disorder +5. |
| 42 | Blizzard Warning | Flag set. Disorder +6. The clock is at zero. |
| 44 | The Blizzard | Unvisited districts: disorder +10. All districts: +3. |

### 06.2 — Between-Beat Events

Between-beat events should be authored to fill the gaps in the arc timeline. They test specific departments, affect 1-3 districts, and create feed items that add texture to the news cycle.

**Design rules for between-beat events:**

- Test one specific department's relevance (e.g., a water main break tests INFRA; a measles cluster tests HEALTH).
- Affect 1-3 districts, not citywide.
- Create at least one feed item.
- Visited vs. unvisited districts should have different outcomes — visited districts can activate community networks; unvisited districts suffer blind.
- Fiscal events should create budget pressure that competes with department funding.

### 06.3 — Event Data Structure

```javascript
{
  id: 'evt_unique_identifier',          // Unique string ID
  headline: 'Short Headline Text',      // Feed headline, ≤60 chars
  narrative: 'Longer narrative text.',   // Displayed in event overlay, 1-3 sentences

  // Conditions: ALL must be true for the event to fire.
  conditions: [
    { type: 'week', value: 10 },                 // Fires on exactly week 10
    { type: 'weekRange', min: 14, max: 18 },      // Fires on any week in range
    { type: 'reserveBelow', value: 3.0 },          // Fires when reserve < $3.0B
    { type: 'insightCount', value: 3 },            // Fires when player has ≥3 insights
    // Additional condition types may be defined in systems/scenario.js
  ],

  // Effects: Applied when event fires.
  effects: [
    { type: 'feed_item', text: 'Feed text.', feedType: 'news' },  // 'news' or 'chatter'
    { type: 'trust', district: 'flushing', delta: -3 },           // Per-district trust change
    { type: 'reserve', delta: -0.3 },                              // Budget impact ($B)
    { type: 'disorderScope', scope: 'all', delta: 3, label: 'Label' },      // scope: 'all' | 'unvisited'
    { type: 'flag', value: 'blizzard_imminent' },                  // Game state flag
  ],
}
```

### 06.4 — Fiscal Event Guidelines

Fiscal events create the three-way resource tension at the heart of the game: fund departments (perception), bank reserve (response capacity), or spend on policy (intervention). Every fiscal event should make the player feel that tension.

| Reserve Level | Event | Tone |
|---|---|---|
| Below $3.0B | Comptroller warning | Advisory. "Fiscal caution advised." |
| Below $1.5B | Bond rating warning | Threatening. Borrowing costs rise. |
| Below $0.0B | Deficit spending | Punitive. Emergency borrowing at penalty rates. |
| Below -$1.5B | State oversight | Terminal. "The mayor has lost fiscal control." |

---

## 07 — Interventions & Bento Tiles

The Bento Box policy builder is a Blue Prince-inspired spatial puzzle. Policy is not a menu selection — it is a physical arrangement of tiles on a 5x5 grid. The grid is the budget constraint made visible.

### 07.1 — Tile Types

| Type | Role | Examples |
|---|---|---|
| **WHERE** | Geographic scope. Required for WHAT/HOW to have a target. | The Bronx, Queens, Citywide, Single District |
| **WHAT** | The intervention itself. Infrastructure, supplies, systems. | Snow-Removal Fleet, Generator Bank, Emergency Shelter, Alert System |
| **HOW** | Who carries it out. Community integration method. | Mutual Aid Network, Local Leader Liaisons, City Worker Deployment, Police Enforcement |
| **FUNDING** | Filler. Pure monetary injection. Always available. Low efficiency. | Budget Allocation, Emergency Fund, Major Appropriation |

### 07.2 — Intervention Tiers

**Generic interventions** — always available. Bulky tiles (2x2). Expensive. Broad coverage, standard efficiency. These are what a mayor builds when operating blind.

> *Snow-Removal Fleet: [2,2], cost $0.8B, resilience 3*  
> *Generator Bank: [2,2], cost $0.6B, resilience 3*

**Informed interventions (mutated tiles)** — require 2+ fresh insights in the relevant category AND a department funded to level 3. Smaller footprint (1x2 or 1x1). Better effects. These represent what a mayor builds when they have listened.

> *Medical Power Cache: [1,2], cost $0.3B, resilience 5 — mutates from Generator Bank*  
> *Multilingual Alert Net: [1,1], cost $0.15B, resilience 3, disorder -1 — mutates from Alert System*

**Pattern interventions** — require a crystallized cross-district pattern. These are the cheapest and most effective tiles. They represent systemic understanding translated into policy.

> *Basement Flood Registry: [1,1], cost $0.1B, resilience 3, disorder -1*

### 07.3 — Tile Data Structure

```javascript
{
  id: 'x_tile_id',                      // Unique string ID
  type: 'WHAT',                          // WHERE | WHAT | HOW | FUNDING
  label: 'Human-Readable Label',        // Shown in UI
  size: [1, 2],                          // [columns, rows] on the 5x5 grid
  cost: 0.3,                             // Cost in $B
  resilience: 5,                         // Resilience points added
  disorder: 0,                           // Disorder points added (negative = reduces)
  tags: ['power', 'medical'],            // For synergy/conflict matching
  desc: 'Description text.',             // Tooltip

  // Mutation fields (for informed/pattern tiles only):
  mutatesFrom: 'x_parent_tile_id',       // ID of the generic tile this replaces
  requiredInsightCategory: 'ASSET',       // Insight category required
  requiredInsightCount: 2,                // Minimum fresh insights needed
  requiredDept: { id: 'HEALTH', level: 3 }, // Department level gate
}
```

### 07.4 — Synergy Rules

Synergies fire when two tiles are placed adjacent (sharing a grid edge). They amplify effects — the whole becomes greater than its parts. Synergies reward combining community methods with institutional resources.

| Synergy | Tiles | Effect |
|---|---|---|
| Cold-Storage Clinic | Medical Cache + Generator Bank | +5 resilience, -1 disorder |
| Community-Run Shelter | Emergency Shelter + Mutual Aid | +4 resilience, -3 disorder |
| Medical Outreach Network | Medical Cache + Health Workers | +6 resilience, -1 disorder |
| Sanctuary Shelter | Emergency Shelter + Faith Network | +4 resilience, -2 disorder |
| Locally-Guided Plowing | Plow Fleet + Local Leaders | +3 resilience, -1 disorder |
| Bodega Alert Network | Warning System + Local Leaders | +3 resilience, -2 disorder |
| Door-to-Door Wellness | Youth Corps + Health Workers | +4 resilience, -1 disorder |

### 07.5 — Conflict Rules

Conflicts fire when two tiles are placed adjacent. They reduce effectiveness and spike disorder. Conflicts punish combining enforcement with community trust.

| Conflict | Tiles | Effect |
|---|---|---|
| Community Distrust | Police Enforcement + Mutual Aid | -3 resilience, +5 disorder |
| Sanctuary Violation | Police Enforcement + Faith Network | -2 resilience, +4 disorder |
| Fiscal Bloat | Major Appropriation + City Workers | +0 resilience, +4 disorder |
| Youth Intimidation | Police Enforcement + Youth Corps | -2 resilience, +3 disorder |

### 07.6 — Knowledge Multiplier

When a bento policy is resolved, each target district's fresh insight count modifies the resilience output:

```
multiplier = 1 + (freshInsightCount * 0.15)
```

Districts with zero fresh insights receive a **blind deployment penalty** of +2 disorder per blind district. This is the mechanical consequence of not listening before acting.

---

## 08 — NYC Data Integration

Mandate's content draws on real New York City open data. This is not decoration — it is the foundation of authenticity. Every district maps to a real community board, and real complaint patterns inform the game's concern profiles.

### 08.1 — District-to-Community Board Mapping

Each district in `data/districts.js` has a `cb` field identifying its real NYC community board:

| District ID | Game Name | Community Board |
|---|---|---|
| `riverdale` | Riverdale | 08 BRONX |
| `fordham` | Fordham | 07 BRONX |
| `southbronx` | South Bronx | 01 BRONX |
| `harlem` | Harlem Heights | 10 MANHATTAN |
| `ues` | Upper East Side | 08 MANHATTAN |
| `midtown` | Midtown | 05 MANHATTAN |
| `lowerman` | Lower Manhattan | 01 MANHATTAN |
| `astoria` | Astoria | 01 QUEENS |
| `lic` | Long Island City | 02 QUEENS |
| `jackson` | Jackson Heights | 03 QUEENS |
| `flushing` | Flushing | 07 QUEENS |
| `jamaica` | Jamaica | 12 QUEENS |
| `williamsburg` | Williamsburg | 01 BROOKLYN |
| `dtbk` | Downtown Brooklyn | 02 BROOKLYN |
| `bushwick` | Bushwick | 04 BROOKLYN |
| `crown` | Crown Heights | 08 BROOKLYN |
| `bayridge` | Bay Ridge | 10 BROOKLYN |
| `northshore` | North Shore | 01 STATEN ISLAND |
| `midisland` | Mid-Island | 02 STATEN ISLAND |

### 08.2 — How to Use Real Data

1. **Concern scores.** The `CONCERN_SCORES` object in `data/districts.js` merges real 311 complaint-type distributions with hardcoded transit scores (which 311 does not capture). When authoring a conversation, consult the district's concern scores to determine which vulnerability category should dominate the dialogue.

2. **HPD violation text.** For housing interjections, HPD violation descriptions can be used verbatim. They are government language already — terse, regulatory, specific. The game's housing department voice matches naturally.

3. **311 descriptor counts.** The `NYC_RUMORS` data in `data/nyc-rumors.js` provides three tiers of rumor specificity drawn from real 311 complaint descriptors. Tier 1 (vague) feeds face-down card rumors. Tier 2 (statistical) feeds funded-department lens reveals. Tier 3 (violation-specific) feeds well-funded lens reveals.

4. **Characters should reference real patterns.** If a district's community board shows high HEATING complaint volumes, the NPC in that district should talk about heat. If noise complaints dominate, the NPC should mention construction or nightlife disruption. The data should shape the character's world, not the reverse.

---

## 09 — The 8 Missing Districts

The following 8 districts have map presence and concern scores but lack V2 conversation scripts. Each profile below includes the character specification, the ASSET they reveal, and a voice sample to guide dialogue authoring.

---

### 09.1 — Riverdale (`riverdale`)

| Field | Value |
|---|---|
| Character | Helen Park |
| Role | Flood Insurance Agent |
| Initials | HP |
| Worldview | "Everybody thinks floods happen to other people. I have the actuarial tables that say otherwise." |
| Primary Concern | Housing / flooding near the Harlem River |
| Community Board | 08 BRONX |
| ASSET | 12 co-op board presidents with coordinated flood-prep protocol |
| Voice | Precise, data-driven, frustrated by denial |

**Voice sample:**

"I've been writing flood insurance policies in Riverdale for 11 years. You know what the most common thing people say when I tell them they're in a flood zone? 'That can't be right.' I pull up the FEMA map. I show them the elevation certificate. They look at it and say, 'But it's never flooded here.' And I say, 'Ma'am, it flooded here in 2012, 2018, and 2021. Your basement had three feet of water. You filed the claim yourself.' People don't deny the data because they're stupid. They deny it because accepting it means spending money they don't have."

---

### 09.2 — Upper East Side (`ues`)

| Field | Value |
|---|---|
| Character | Martin Calloway |
| Role | Scaffolding Inspector (ret.) |
| Initials | MC |
| Worldview | "Every piece of scaffolding in this city tells a story. Most of them say: nobody's coming back to finish." |
| Primary Concern | Safety / construction hazards and scaffolding |
| Community Board | 08 MANHATTAN |
| ASSET | 40-super building managers association with emergency coordination protocol |
| Voice | Institutional knowledge, dry humor, precise about codes |

**Voice sample:**

"I inspected scaffolding for DOB for 22 years. You want to know the Upper East Side's dirty secret? There are 147 active scaffolding permits on this community board. Forty-three of them have been up for more than three years. That's not construction — that's abandonment with a permit number. The sidewalk sheds block sightlines for emergency vehicles, they create wind tunnels in nor'easters, and half of them have structural deficiencies I flagged before I retired. My successor has a caseload of 400. She's not getting to them."

---

### 09.3 — Lower Manhattan (`lowerman`)

| Field | Value |
|---|---|
| Character | Priya Sharma |
| Role | Climate Resilience Planner, CB1 |
| Initials | PS |
| Worldview | "We've had the data since Sandy. What we don't have is the political will to act on it before the next one." |
| Primary Concern | Infrastructure / flood prep stalled since Sandy |
| Community Board | 01 MANHATTAN |
| ASSET | Battery Park resilience hub — 500-person capacity, generator, pre-positioned supplies |
| Voice | Technocratic, urgency masked by competence |

**Voice sample:**

"I've been the climate resilience planner for CB1 since 2018. I can tell you the surge height projections for every block south of Canal Street. I can show you the evacuation models. I can show you where the electrical switchgear is still in basements — below the flood line — eight years after Sandy. The BPC resilience hub has 500-person capacity, a generator that runs 72 hours, and pre-positioned medical supplies. We drill every quarter. But it's not in any city emergency plan. I send the documentation every year. I get an acknowledgment email and nothing else."

---

### 09.4 — Long Island City (`lic`)

| Field | Value |
|---|---|
| Character | Derek Osei |
| Role | Union Electrician, IBEW Local 3 |
| Initials | DO |
| Worldview | "Every luxury tower they put up is one permit waiver away from going dark in a storm." |
| Primary Concern | Housing / no backup power in new construction |
| Community Board | 02 QUEENS |
| ASSET | 20-electrician emergency response team, union-dispatched, can restore power to critical buildings in 4 hours |
| Voice | Blue-collar expertise, union solidarity, technical precision |

**Voice sample:**

"I've been pulling wire in this neighborhood for 16 years. Used to be warehouses and light industrial — honest buildings, simple electrical. Now it's glass towers, 40 stories, and the developers got permit waivers on backup generator requirements because somebody at DOB owed somebody a favor. You know what happens to a 40-story building with no backup power in an ice storm? Elevators stop. Water pumps stop. Heat stops. You've got 800 people trapped above the 10th floor with no water pressure and no way down. My local has 20 guys who live within three subway stops of here. We've run our own emergency protocol since Sandy. Four hours, we can get critical power back to any building in the district. Nobody's ever asked us."

---

### 09.5 — Jamaica (`jamaica`)

| Field | Value |
|---|---|
| Character | Claudette Desmond |
| Role | Transit Rider, Q111 Bus Captain |
| Initials | CD |
| Worldview | "They'll spend a billion dollars on a Manhattan subway station and tell us the Q111 doesn't have the ridership to justify a shelter at the stop." |
| Primary Concern | Infrastructure / transit desert |
| Community Board | 12 QUEENS |
| ASSET | 300-person commuter text chain with real-time transit disruption reporting |
| Voice | Exhausted, organized anger, specific demands with dollar figures |

**Voice sample:**

"I ride the Q111 every day. I've ridden it for nine years. I organized a text chain because the MTA's real-time data is a joke — the app says the bus is five minutes away and it's actually 35 minutes or not coming. Three hundred people are on that chain now. We report delays, cancellations, broken shelters, drivers who skip stops. I have nine years of data the MTA doesn't have because they don't ride their own buses. You want to know what Jamaica needs? A bus shelter at Archer and Sutphin that isn't a roof with no walls. That's $40,000. The MTA spent $2 million on a countdown clock in Grand Central that tells people what they can already see."

---

### 09.6 — Downtown Brooklyn (`dtbk`)

| Field | Value |
|---|---|
| Character | Amir Hassan |
| Role | Small Business Owner, Atlantic Ave |
| Initials | AH |
| Worldview | "When the emergency happens, the city sends help to the residents. Nobody asks if the businesses survived." |
| Primary Concern | Safety / emergency access blocked by arena traffic |
| Community Board | 02 BROOKLYN |
| ASSET | 30-shop merchant shelter network — coordinated lockdown/opening protocol, cash reserves for emergency supplies, 200-person sheltering capacity across storefronts |
| Voice | Transactional, protective of his block, concrete about costs |

**Voice sample:**

"I've had this shop for 14 years. Every Barclays event, Atlantic Avenue becomes a parking lot. Ambulances can't get through. Fire trucks can't get through. Last February during the nor'easter, there was a gas leak on 4th Avenue and the fire department took 22 minutes because of arena traffic. Twenty-two minutes for a gas leak. I organized the merchants on this block — 30 shops — into a mutual protection agreement. Storm comes, we open our doors. We can shelter 200 people between us. We've stockpiled blankets, water, first-aid kits. Cost us $8,000 out of our own pockets. Nobody from the city has ever asked what we have. They don't even know we exist."

---

### 09.7 — Bushwick (`bushwick`)

| Field | Value |
|---|---|
| Character | Luz Mendoza |
| Role | Promotora (Community Health Worker) |
| Initials | LM |
| Worldview | "The people I serve don't call 311 because they don't believe anyone will come. And they're right." |
| Primary Concern | Services / language barriers, undocumented residents invisible to city systems |
| Community Board | 04 BROOKLYN |
| ASSET | 8-person bilingual health worker network covering 200 families, trusted access to undocumented population |
| Voice | Quiet authority, protective of undocumented residents, precise about who she serves |

**Voice sample:**

"I'm a promotora. You probably don't know what that is. I go door to door in Bushwick and I check on families — mostly undocumented, mostly Spanish-speaking, some Mixtec. I know 200 families. I know which ones have children with lead exposure. I know which ones have grandmothers who are diabetic. I know which ones won't open the door if you look official. I have eight other promotoras in my network, and together we cover from Myrtle to Flushing, Bushwick Ave to Broadway. The city's emergency notification system doesn't reach any of these people. Not because of technology — because of trust. If you want to reach them in a crisis, you come through me. But I need to know you won't hand their addresses to ICE."

---

### 09.8 — Mid-Island (`midisland`)

| Field | Value |
|---|---|
| Character | Frank DiNapoli |
| Role | DSNY Sanitation Supervisor (ret.) |
| Initials | FD |
| Worldview | "Nobody remembers Staten Island until the garbage piles up. Then they remember real fast." |
| Primary Concern | Infrastructure / plowing, forgotten-borough syndrome |
| Community Board | 02 STATEN ISLAND |
| ASSET | 15 retired CDL drivers with personal equipment (plows, salt spreaders), ready to deploy within 2 hours |
| Voice | Gruff, institutional memory, aggrieved but competent, dry Staten Island humor |

**Voice sample:**

"I drove a plow for Sanitation for 31 years. Every storm, same thing: Manhattan first, Brooklyn second, Queens third, Bronx fourth, Staten Island whenever they get around to it. The last blizzard, my street wasn't plowed for 38 hours. I live on a bus route. A bus route. I called my old supervisor and he said, 'Frank, we don't have the trucks.' You know what I said? 'I have 15 retired guys with CDLs and their own pickups with plow attachments. Give us salt and we'll do your job for you.' He said he'd have to check with legal. Legal. We're buried under two feet of snow and he's checking with legal. Those 15 guys plowed 40 blocks that night anyway. Nobody asked us to. Nobody paid us. Nobody said thank you."

---

## 10 — Content Checklist

Before submitting any piece of content — conversation, scenario event, tile definition, or district profile — verify every item on this list. If any item is unchecked, the content is not ready.

### 10.1 — Conversation Checklist

- [ ] Character has `name`, `role`, `initials`, and a worldview sentence in the file comment header
- [ ] Exactly 3 exchanges
- [ ] Each exchange has exactly 3 `freeChoices`
- [ ] Free choices include depth values 1, 2, and 3 (with depth 0 reserved for `solutionJump` traps)
- [ ] At least one `solutionJump: true` choice across the 3 exchanges
- [ ] At least one depth-2 or depth-3 choice references something the NPC said in a prior exchange
- [ ] At least 2 insights total: 1 vulnerability (matching district concern profile) + 1 ASSET
- [ ] At least 1 skill check with `difficulty` between 10 and 13
- [ ] Department interjections at levels 1, 2, and 3 represented across the conversation
- [ ] Interjections from at least 2 different departments
- [ ] ASSET insight includes specific capacity: people, dollars, equipment, or timeline
- [ ] Dialogue references real NYC data from the district's community board
- [ ] Character voice is consistent across all 3 exchanges
- [ ] No interjection addresses the player directly
- [ ] NPC dialogue uses no abstractions — every claim is specific and verifiable

### 10.2 — Scenario Event Checklist

- [ ] Unique `id` beginning with `evt_`
- [ ] `headline` is 60 characters or fewer
- [ ] `narrative` is 1-3 sentences
- [ ] At least one condition defined
- [ ] At least one effect defined
- [ ] If the event affects districts, visited vs. unvisited outcomes differ
- [ ] If the event drains reserve, the drain amount is documented in `effects`

### 10.3 — Tile Checklist

- [ ] Unique `id` with type prefix (`w_`, `x_`, `h_`, `f_`)
- [ ] `size` fits within 5x5 grid constraints
- [ ] `cost` is in billions (0.1 = $100M)
- [ ] If mutated, `mutatesFrom` points to a valid parent tile ID
- [ ] If gated, `requiredInsightCategory`, `requiredInsightCount`, and `requiredDept` are all specified
- [ ] `desc` explains what the tile represents in one sentence

---

*End of document. This guide is maintained alongside the codebase. If the data structures change, update this document first.*
