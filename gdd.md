# MANDATE — Game Design Document & Dev Roadmap

*A web-based civic resilience simulation about governing New York City through Human-Centered Design.*

**Status:** Playable prototype · full 48-week loop with 3-view shell, blizzard disaster arc, LLM-scored posts, 3 conversation scripts, cinematic endings
**Platform:** Web (desktop-first, touch-aware)
**Doc version:** 0.5 — reality sync: reflects built systems, reconciles terminology, documents blizzard arc & community assets

---

## 1. High concept

You are the Mayor of New York. You inherit a city, but you don't inherit its vulnerability. Disasters don't care about your budget — they care about basements, power lines, and isolated seniors. Nineteen districts across five boroughs, each with fragilities you can't see from City Hall. Your job is to leave the building, walk the neighborhoods, listen to what people actually tell you, and prepare for the worst based on what you learned. To plan for the disaster, you have to know the people who will face it.

Frostpunk's core feeling, relocated from the frozen frontier to the streets: the pressure never stops climbing, you can never be everywhere at once, and every hour spent in one neighborhood is an hour you didn't spend in another. The twist that makes it *human-centered* rather than generic emergency management is that the scarce resources aren't money or supplies — they're **time** and **knowledge**. You start the game not knowing who's vulnerable or why. You have to go find out. When the crisis hits, what you learned — and what you didn't — determines who survives.

This is a pedagogical simulation of Human-Centered Design (HCD) applied to emergency management. The game teaches that disaster resilience isn't built with sandbags and FEMA trailers — it's built with conversations, trust networks, and closing the loop between what vulnerable people say and what emergency planners do.

### The pitch in one sentence
> A civic resilience game where you prepare NYC for disaster by going to the ground, learning who's vulnerable and why, and building the community trust that saves lives when the crisis hits.

---

## 2. Design pillars

These are the non-negotiables. Every feature is judged against them.

1. **Listening before deciding.** The verbs are *go*, *listen*, *learn*, *respond*. You cannot prepare a city from behind a desk. The fantasy is a leader who builds resilience by showing up, not a technocrat optimizing from above. Intervention follows understanding — never the reverse. This is HCD's *Empathize* phase made into gameplay.

2. **Knowledge is earned, not given.** You start each term not knowing who's vulnerable or why. Fragilities are revealed through conversations on the ground — which basements flood, which seniors live alone, which pharmacies stock insulin. A district you've never visited is a district you'll fail when the crisis hits. The map reflects what you know and don't know: vulnerability mapping as core interface.

3. **Communication closes the loop.** Messaging is not spin — it's situational awareness. When you post publicly, its power comes from how well it reflects what you actually heard. A message grounded in real conversations activates community response networks; a generic talking point falls flat. During a crisis, the feed becomes your 311 system — but only if people trust you enough to report.

4. **Time is the binding constraint.** You cannot be everywhere. Every day spent in the Bronx is a day you didn't spend in Queens. Every listening session is a visit you didn't make. The skill is choosing where your presence matters most *right now* — and accepting that somewhere else is going unheard. This is triage before the emergency.

5. **Authentically New York, earnest and specific.** The people you meet are recognizable NYC characters — the bodega owner, the tenant organizer, the retired nurse, the block association president — treated as subject matter experts on their own survival. Not cynicism, not a civics lecture. The city is stubborn, resourceful, and deeply specific. The tone is gritty and hopeful.

---

## 3. Player fantasy & tone

The player is not a technocrat or a populist. They are a person with limited hours in the day trying to understand a city of eight million people, one conversation at a time, before the disaster hits. The emotional arc of a good run is *"I went to the right places, I listened, I learned who was vulnerable and why, and when the crisis came, nobody died because I knew where to deploy."* The emotional arc of a bad run is *"I never left City Hall — the storm hit a neighborhood I didn't know existed, and people were trapped because I sent resources to the wrong place."*

Tone: **earnest, gritty, and hopeful.** Not cynical, not comic. Characters are resourceful experts on their own survival — the bodega owner who knows which buildings lose power first, the retired nurse who tracks which seniors live alone, the block association president who already has a mutual-aid plan. The player's job is to defer to their lived experience and translate it into institutional response.

Tone references: Frostpunk (moral weight, escalating pressure, the cost of not knowing), *Night in the Woods* (community conversations that reveal systemic problems), *80 Days* (travel-and-talk as core loop, time pressure on routes), and the urgent clarity of real emergency management briefings. The visual world borrows the MTA's design language — transit-map clarity, line bullets — as a native NYC vocabulary.

---

## 4. Core loop

### 4.0 Week 0 — "Your First Day" (onboarding)

The game teaches its own loop by letting the player fail the old way first. No tutorial popups, no "click here" — just a scripted first day that ends with the player understanding why listening matters.

**Beat 1 — The Briefing.** You're sworn in. One screen — a newspaper front page, a camera flash, the oath. Then your Chief of Staff sits you at the desk with the mayoral briefing: citywide stats, budget numbers, abstract problem categories. It all looks manageable from up here. The map is visible behind the briefing but **entirely dim** — every district is gray, unknown. You know nothing specific about anywhere.

**Beat 2 — The Desk.** Your staff puts a policy in front of you — something generic like a citywide housing initiative. Big budget line. The game lets you sign it. If you do, it resolves: mild trust gain everywhere, strong trust gain nowhere, significant money spent. The map barely changes. Your staff moves on: *"Ready for the next one?"* This is the trap — the game is showing you what governing-from-a-desk feels like, and it's not enough.

**Beat 3 — The Interruption.** Before the next policy lands, your scheduler interrupts: *"Mayor — community board meeting tonight in East Harlem. They've been asking for months. Or we can skip it, there's plenty on the desk."* The game steers you toward going (the desk option grays out, or the scheduler is insistent). This is the first real moment: desk or ground.

**Beat 4 — The First Conversation.** You arrive in East Harlem. The district node lights up on the map — one bright dot against 18 dim ones. You meet someone: a tenant organizer, maybe. The conversation plays out — 3–4 exchanges. She tells you the heat's been out in her building for the third winter. The landlord won't fix it. Code enforcement hasn't shown up. She names the street. She's tired. You choose how to respond — and your choices affect how much she opens up. You earn your first **insight**: *"Heat failures in rent-stabilized buildings — East Harlem, high severity."*

**Beat 5 — The Contrast.** Back at City Hall. The game shows your notebook — one insight in it. Then it shows the generic housing policy you signed earlier, side by side. The policy cost $800M and moved trust +2 everywhere. It didn't touch this problem. The game doesn't lecture — it just lets you see the gap. Then, quietly: *"That's day one. You have 47 weeks left. Here's what you know about your city."* The map: one bright node. Eighteen dim ones.

**Beat 6 — Week 1 begins.** The three views unlock. The Calendar appears with 3 empty slots. The Social view opens with a feed already murmuring — vague complaints from districts you haven't visited, a few welcome messages, the city going about its business without you. The Map shows one bright node and 18 dim ones. No guardrails. *Where do you want to go?*

**What Week 0 teaches without tutorials:**
- The map starts dark — understanding is earned
- Generic policies work but weakly — the desk is always an option, just never the best one
- One conversation changes everything — a specific human need reframes abstract policy
- The notebook matters — introduced with one entry, not fifty
- Time is yours — after the scripted day, all three views open and the game begins
- The Social feed is already talking — the city doesn't wait for you to start listening

---

One **week** is the unit of play. Each week has **3–4 time slots**. A term is ~48 weeks.

The game has three views — **Map**, **Calendar**, **Social** — always accessible via a tab bar. The hex menu on the Map is the primary interaction point: it drives labeling, which drives scheduling, which drives the week. Here is the complete user flow.

### The hex menu (the game's central interaction)

The hex menu uses the animated Phaser-style interaction from `index.html`:

- **Click a district node** → a selection ring pulses on the node. Five hexagonal buttons **expand outward** from the node center with staggered delays and `back.out` easing, connected by colored lines. Each hex has its own color:
  - **VISIT** (green) — tag for a Mayor Visit
  - **LISTEN** (cyan) — tag for a Listening Session
  - **MSG** (pink) — jump to Social view with a draft post pre-filled about this district
  - **INFO** (gold) — open the district detail panel (trust, knowledge, concerns, infrastructure)
  - **CLOSE** (gray) — dismiss the menu
- **Hover a hex** → it scales up, fill inverts to the action color, label goes dark. The interaction is tactile and alive.
- **Click VISIT or LISTEN** → the district gets **labeled**. The hex menu collapses back to center (`quad.in` easing). The district node now shows a persistent colored badge (a dashed ring with a V or L dot in the action's color). A toast confirms ("South Bronx → VISIT") and the node flashes the action color for 600ms. The label flows into the Calendar queue automatically.
- **Click MSG** → the hex menu collapses, the view **transitions to Social** with a draft post pre-filled: the district name and its top concern (if known). This is the fastest path from "I see a problem on the map" to "I'm talking about it publicly."
- **Click INFO** → the right panel slides in with district detail. The hex menu stays open — INFO doesn't dismiss it.
- **Click a labeled district again** → the hex menu reopens. The previously selected action's hex is filled (active state). Click it again to **clear the label**, or click a different action to **relabel**.
- **Click empty map / CLOSE** → hex menu collapses back to center, selection ring fades.

Labels are **free and unlimited**. You can label every district on the map if you want. The constraint comes in the Calendar, where you only have 3–4 slots.

### View transitions

The three views share a persistent **status bar** at the top (trust, reserve, week clock) and a persistent **minimap strip** below it. The minimap shows the full district graph at small scale — labeled districts show their colored badges, crises pulse, knowledge brightness is visible. Tapping a district on the minimap jumps to the Map view with that district selected.

**Map → Calendar:** Tap the `C` tab, or — when you've labeled at least one district — a floating **"Plan your week →"** prompt appears at the bottom of the Map. The transition slides the map upward into the minimap strip, and the Calendar slides in from below. Your labels are already there in the queue.

**Map → Social:** Tap the `S` tab, or click POST in the hex menu. The POST path pre-fills a draft. The tab path opens the feed. Transition slides the map up into the minimap; Social slides in.

**Calendar → Map:** Tap the `M` tab, or tap any district in the label queue — jumps to Map with that district selected and hex menu open. This lets you re-examine a district before committing a slot to it.

**Calendar → "Go":** When you've filled at least one slot and hit **"Go"**, the view transitions to Map. The first scheduled engagement begins: the map zooms/pans to the target district, the conversation panel overlays the map. After each conversation ends, if there's another slot, the map pans to the next district. After all engagements complete, the player is back on the Map with fresh insights and badges cleared from completed engagements.

**Calendar → "End Week":** Available after "Go" has been pressed (or if you choose to skip engagements). Shows a confirmation overlay: what will happen (knowledge decay, trust erosion, operating costs, unscheduled labels carry over). Confirm advances the clock.

**Social → Map:** Tap the `M` tab, or tap a district name mentioned in a feed post or DM — jumps to Map with that district selected.

### Map view (understand + label)

The full-bleed map canvas. Nineteen district nodes on the transit-style graph, with pan and scroll-to-zoom.

- **Knowledge brightness** is the default visual: nodes range from full opacity (recently visited) to ~14% opacity (never visited / stale). This is the primary signal — dim districts should worry you.
- **Labeled districts** show colored hex badges next to the node (green V for Visit, cyan L for Listen). Multiple districts can be labeled simultaneously. The map becomes a planning surface — you can see your intentions laid out spatially.
- **View mode tabs** at the bottom switch how nodes render: Trust (red/gray/green), Knowledge (dim/bright), Coalition (bloc colors), Needs (category chips on visited nodes).
- **Left panel:** objective card, infrastructure checklist, map legend.
- **Right panel:** district detail (appears on INFO or selection) — name, borough, bloc, trust (large number), knowledge bar, concern quote, infrastructure status.
- **Events and crises** appear as pulsing nodes, red badges, or a news ticker at the top.

### Calendar view (prioritize + commit)

Two zones side by side:

**Left — the label queue.** Every district you've tagged on the Map, shown as cards. Each card shows: district name, action type (colored hex icon), **assigned character** (name + role, chosen from the district's character pool), trust level, knowledge freshness, top concern (if known, or "Unknown — never visited"). Cards are ordered by when you labeled them but can be reordered by drag. Tapping a card's district name jumps to Map with that district selected (for re-examination).

**Right — time slots.** 3–4 horizontal blocks. Drag cards from the queue into slots, or tap a card then tap a slot to assign. Filled slots show the district name and action icon. Empty slots show a dashed outline and "Open." Slots can be cleared by dragging the card back out.

**Below the slots:**
- **Borough coverage strip** — which boroughs you're hitting this week, which you're not. Visual at a glance.
- **Commitments / events** — "Maria expects you back" (from DMs), upcoming crises, scheduled events.
- **"Go" button** — plays out scheduled engagements. Transitions to Map for conversations.
- **"End Week" button** — appears after Go, or if you choose to skip. Advances the clock.

**Queue overflow** is the game's core tension made visible. 6 labels, 3 slots. The unscheduled cards sit below the fold, grayed slightly, with a count: *"3 unscheduled — will carry to next week."*

### Social view (communicate + listen)

Two panes:

**Left — your posts.** A compose box at the top (claim, tone selector, optional policy attachment). Published posts below in reverse-chronological order. Each post shows its engagement metrics: likes, shares, replies, ratio indicator. Grounded posts glow with strong engagement. Hollow posts show low numbers or a visible ratio. Contradictory posts show callout replies pinned to the top.

**Right — the feed.** A scrolling timeline of city chatter:
- **District chatter** — vague for unvisited places ("People in Queens are frustrated"), specific for visited ones ("The L train broke down again in Bushwick today"). Reading the feed is how you pick up early signals about where to go next.
- **Reactions to your posts** — engagement, quote-posts, criticism.
- **Breaking news and events** — crises, funding announcements, weather.
- **DMs** — notification badges on character threads. Tap to open an inline chat. Characters reference your previous conversations. You can reply (maintains trust) but can't learn new insights without visiting in person.

**Social → Map bridges:** District names in feed posts and DMs are tappable — they jump to Map with that district selected, hex menu ready. This lets the feed drive your planning: you read about a problem in Bushwick, tap the name, label it for a visit, and it flows into your Calendar.

---

## 5. Systems & mechanics

### 5.1 Community resilience (the central resource)

Each of the 19 districts has a **resilience** value (0–100). Resilience is not approval — it's the neighborhood's confidence that their needs are understood and that collective action works. High resilience means neighbors check on each other when the power goes out, the block association has a plan, and people trust the city enough to report emergencies in real time. Low resilience means isolation, distrust, and silence when it matters most.

Resilience is built through a chain: **show up → listen → understand → act → communicate authentically**. Skip a step and the chain breaks. Act without understanding and resilience erodes. Understand but never act and resilience stagnates. The player is always managing this chain across many districts simultaneously, with not enough time. When the disaster hits, resilience is the difference between coordinated response and chaos.

(In the codebase and state model, resilience is still stored as `trust` for simplicity. The UI displays it as "Community Resilience" or "Resilience.")

The five constituency blocs still exist as lenses on the data — they represent shared identities and concerns that cross district lines — but the primary unit of relationship is the **district**, not the bloc.

| Bloc | Identity | Typical concerns | Color |
|---|---|---|---|
| Working Families | Outer-borough, immigrant, wage-earning | Rent, transit, school quality, safety | Cyan |
| Business & Finance | Midtown, FiDi, employers | Taxes, regulation, order, talent pipeline | Indigo |
| Real Estate | Developers, landlords, co-op boards | Permits, zoning, property values | Red |
| Progressives | Activists, younger renters, organizers | Climate, equity, police reform, housing | Pink |
| Labor Unions | MTA, teachers, FDNY/NYPD, trades | Jobs, wages, benefits, headcount | Amber |

### 5.2 The map (one of three views)

Nineteen NYC districts across all five boroughs, positioned roughly geographically, wired together by a transit-style network graph. Each district carries: dominant bloc, trust level, population weight, and — crucially — a **knowledge state** that reflects how well the mayor currently understands what's happening there.

The map is the first of three views (see §4 and §8 for full UX). It has **four view modes**:
- **Vulnerability** (default) — bright (recently visited, well-understood) to dim (unknown, stale). This is vulnerability mapping: dim districts are the ones where you don't know who's fragile. The primary view.
- **Resilience** — color-coded by community resilience levels. Red = low, vulnerable to crisis. Dark = high, community is self-organizing.
- **Coalition** — color by dominant bloc (the social structure lens).
- **Needs** — icons showing discovered insights and community assets (only visible for districts you've visited).

The map's job: **vulnerability-made-visible**. The dim districts are the ones that should terrify you — not because they're angry, but because when the crisis hits, you won't know where to deploy. The map also serves as a persistent minimap strip in the Calendar and Social views, keeping the spatial context always present.

### 5.3 Insights (the knowledge system)

**Insights** are the atoms of understanding. They are specific, concrete, named problems that people in a district are dealing with right now. They are *not* visible until the mayor visits or holds a listening session.

Each insight has:
- A **district** it belongs to
- A **category** (housing, transit, safety, jobs, environment, services, cost-of-living)
- A **severity** (how much it matters to the people experiencing it)
- A **freshness** (decays over time — neighborhoods change, and old intel goes stale)
- An optional **cross-district link** (the same problem shows up in multiple places — discovering this is a key "aha" moment)

Examples:
- *East Harlem*: "Landlords aren't fixing heat. Third winter in a row." (housing, high severity)
- *Sunset Park*: "The grocery store on 5th closed. Nearest one is a 20-minute bus ride." (services, medium severity)
- *Jamaica, Queens*: "Every time it rains hard, the underpass on Archer Ave floods. Buses reroute for hours." (transit/infrastructure, medium severity)

When insights from multiple districts reveal the same underlying problem, the player discovers a **pattern** — this is HCD's systems thinking in action. Moving from "this building has no heat" to "rent-stabilized buildings citywide have a systemic maintenance failure." Patterns unlock the highest-value interventions: structural fixes instead of band-aids.

### 5.3a Community assets (the hidden resilience)

**Community assets** are a special category of insight — they represent existing neighborhood capacity that the mayor didn't build and can't buy, only *discover*. They are the game's way of encoding HCD's core claim: the people closest to the problem are closest to the solution.

Examples:
- *"The pharmacy on 138th has a backup generator and stores insulin for the block."* → During a blackout, this block's medically vulnerable residents survive without city intervention — if the mayor knows to route resources elsewhere instead of duplicating effort here.
- *"Mrs. Chen is a retired nurse. She checks on every senior in the building every morning."* → During a blizzard, this building's elderly population is monitored without city outreach workers — freeing them for buildings without a Mrs. Chen.
- *"The mosque on Atlantic Ave has AC capacity for 200 and the imam already has a heat-emergency plan."* → During a heatwave, this is a cooling center the city didn't have to build.

**How assets change outcomes:**

Assets are discovered primarily through **Listening Sessions** (the community meeting format surfaces collective knowledge that individuals don't volunteer in one-on-one visits). When the disaster hits:

- **Known assets activate automatically.** The game's crisis resolution checks which community assets the player discovered in each district. Known assets reduce casualty risk and resource cost in their district — the neighborhood self-organizes around capacity the city now knows exists.
- **Unknown assets are wasted.** The pharmacy generator still exists whether or not the mayor knows about it. But without coordination, the insulin storage doesn't connect to the people who need it. The system represents this: undiscovered assets don't fire during the crisis.
- **Assets can be amplified by interventions.** If the player discovers the pharmacy generator AND pre-positions additional medical supplies there (an informed intervention), the asset's protective radius doubles. This is the highest-efficiency move in the game: city resources multiplied by community capacity.

This is pillar #2 in its purest form. The city's resilience already exists in fragments across neighborhoods. Your job isn't to build it from scratch — it's to find it, connect it, and amplify it.

### 5.4 Engagements (the time system)

The mayor has **3–4 time slots per week**. Engagements are planned in two steps: **label** on the Map (hex menu tags a district with an intent) and **schedule** on the Calendar (drag labels into time slots). You can label more districts than you have slots — the overflow is the game's core tension made visible. Each scheduled engagement costs one slot:

| Engagement | HCD Method | What happens | Knowledge gain | Resilience gain | Tradeoff |
|---|---|---|---|---|---|
| **Mayor Visit** | Empathy Interview / Contextual Inquiry | You meet a specific person in their district. The LLM plays the character; you type freely. The depth of your listening determines what gets revealed. | High — 1–3 specific insights, deep understanding of vulnerabilities | Moderate — "the mayor came here" | Narrow: one district, one person's perspective |
| **The Mayor is Listening** | Participatory Action Research | Open session at a location. The LLM runs a community meeting with 2–3 characters. You hear complaints *and* discover community assets (a retired nurse, a block association with radios, a church with AC). | Medium — broader but shallower, 2–4 insights across the district. Primary way to discover **community assets** that unlock crisis response options | Low–moderate — less personal | Wide but noisy: you don't control who comes or what they say |
| **Intervention planning** | Ideate / Prototype | Dedicate time to designing or refining an emergency intervention based on gathered insights. | None (uses existing insights) | None until enacted | Necessary to unlock targeted interventions |

Note: posting on social media does **not** cost a time slot — you can post any time. But good posts require insights, which require visits, which cost slots. Situational awareness is free; having real intelligence to share is not.

The core tension: you need to listen to prepare well, but listening takes time away from preparing. And while you're in the Bronx, Brooklyn isn't waiting.

### 5.5 Conversations (the interaction layer)

When you visit a district or hold a listening session, you don't just receive a card — you have a **real conversation** with a named character, powered by the local LLM.

**How meetings work:**

When you label a district on the Map and drag it into a Calendar slot, the game assigns a **character** — someone with a name, role, and knowledge domain. The Calendar slot shows the person, not just the place: *"Maria Delgado — Tenant Organizer, East Harlem"*. This is who you're meeting this week.

When GO fires, the conversation panel opens and the **LLM plays the character**. The system prompt includes the character's profile, their district's concerns, what you already know (your insight history), and the current game state (week number, approaching disaster, trust level). The character speaks in their own voice — Maria is direct and tired; Tommy Ferraro is gruff and practical; Pastor Williams is measured and community-minded.

**The player types freely.** No multiple-choice menus. You ask what you want, respond how you want. The LLM evaluates your responses for:

- **Active listening quality** — did you ask follow-up questions, show empathy, let them talk? Or did you jump to solutions, deflect, or talk about yourself? The depth of your listening determines what gets revealed.
- **Relevance** — did you ask about things this character actually knows about? Maria knows about heat failures and tenant organizing, not transit infrastructure. Asking the right person about the right topic yields deeper insights.
- **Follow-through** — on repeat visits, did you act on what they told you last time? Characters remember. "You said you'd look into the heat. Did anything change?"

**What conversations reveal:**

A good conversation yields **insights** — specific, concrete vulnerability data:
- *"The pharmacy on 138th needs a backup generator — they store insulin for the whole block."* (community asset)
- *"Every time it rains hard, the underpass on Archer Ave floods. Buses reroute for hours."* (infrastructure vulnerability)
- *"There are at least fifteen seniors in my building who live alone. Nobody checks on them."* (population vulnerability)

A surface-level conversation — where you talk more than you listen, or jump to promises — yields less. The character may shut down: *"Look, I appreciate you coming, but I've heard this before."*

**After the conversation, the LLM returns structured data:**

```json
{
  "insights": [
    { "category": "HEALTH", "text": "Insulin storage at corner pharmacy requires backup power", "severity": 0.8 },
    { "category": "ASSET", "text": "Block association has a mutual-aid phone tree for 200 residents", "severity": 0.6 }
  ],
  "trustDelta": 4,
  "depth": 7,
  "characterReaction": "She seemed cautious at first, but opened up when you asked about her neighbors.",
  "followUpHook": "Maria mentioned Mrs. Gutierrez on the 4th floor — oxygen-dependent, lives alone."
}
```

This feeds directly into the game state: insights are recorded, trust updates, knowledge brightens on the map, and the character becomes available for DMs between visits.

**The symmetry:** The LLM serves two roles that mirror each other:
- **Inbound (conversations):** You talk *to* people. The LLM evaluates your listening → insights + trust.
- **Outbound (posts):** You talk *about* the city. The LLM evaluates your knowledge → resonance + trust.

Both reward the same thing: genuine engagement with what real people actually said. The player who listens well in conversations has the material to write grounded posts. The player who doesn't listen has nothing to say.

**Fallback behavior:** When Ollama is unavailable, conversations fall back to the scripted dialogue trees (3–5 exchanges with multiple-choice responses and a depth meter). These are hand-authored per character and serve as the baseline experience. The LLM path is richer but the game is fully playable without it.

**Listening sessions** work similarly but with a twist: instead of one character, you hear from 2–3 people in sequence, each speaking briefly. The LLM receives all their profiles and generates a community-meeting dynamic — people build on what others say, disagree, surface concerns that a private conversation wouldn't. Listening sessions reveal **breadth** (more insights, shallower depth) and are the primary way to discover **community assets** ("the mosque has AC for 200 people," "the retired nurse on our block checks on seniors every morning").

### 5.6 Social media (the communication system)

The Social view is the player's primary communication tool — both outbound (posts) and inbound (feed, DMs). It replaces the old "campaign framing" system with something that feels native and legible.

**Posts** are the outbound mechanic. The player writes free-form text in the compose bar — no manual grounding chip selection. The writing itself is the mechanic: what you say reveals whether you actually listened.

Posts are scored by an **LLM (Ollama, default model `llama3.2`)** that evaluates the player's text against all discovered insights. The LLM receives the full insight context and returns:
- **Per-district scores (0–10)** — how well the post resonates with each district's concerns
- **Resident reaction quotes** — named residents respond to the post in-character
- **Trust deltas** — applied per district based on scores

The scoring drives visible, diegetic feedback:
- A **resonating** post (high LLM scores) gets likes, shares, and supportive resident quotes in the feed. Trust jumps in the districts whose concerns you addressed.
- A **noticed** post (moderate scores) gets mild engagement. Some districts respond, others don't.
- A **hollow** post (low scores, no insight alignment) gets low engagement or gets ratio'd. Minimal trust gain.

Post cards in the feed show per-district score breakdowns and an overall rating badge (RESONATING / NOTICED / HOLLOW).

**Fallback behavior:** When Ollama is unavailable (offline, no model loaded), the system falls back to keyword matching against insight text — simpler but functional. The model is configurable via the `OLLAMA_MODEL` constant in `index.html`.

**The feed** is the inbound mechanic — your real-time situational awareness system. It surfaces:
- Reactions to your posts (the grounding score made visible as engagement)
- District chatter — vague for unvisited districts ("people in Queens are frustrated"), specific for visited ones ("the L train broke down again today in Bushwick"). During a crisis, this becomes your 311 system — but only districts that trust you will report
- Breaking news and events, including disaster warnings
- Emerging vulnerabilities you haven't assessed yet (early warning if you're paying attention)
- Community asset reports from visited districts ("the bodega on 5th has a backup generator and is offering to store insulin")

**DMs / Chat** are relationship maintenance. Characters you've met in person can message you. Their DMs reference your previous conversations and whether things changed. You can reply — but DMs don't generate new insights. They maintain or erode existing trust. To learn something new, you have to go back in person.

The social view makes the communication pillar tangible: you can see your message land (or not), watch the feed shift as you act (or don't), and feel the difference between speaking from knowledge and speaking from nothing.

### 5.7 Emergency interventions (shaped by understanding)

Interventions are not cards dealt to you. They emerge from your insight map — what you know about who's vulnerable and why:

- **Generic interventions** are always available — one-size-fits-all disaster kits that cost more and achieve less. ("Citywide emergency preparedness initiative" — expensive, unfocused. Like mailing flashlights to every address without knowing who has basement apartments.)
- **Informed interventions** unlock when you've gathered enough insights about a specific vulnerability. The more districts you've heard the same problem from, the sharper your pre-positioning. ("Deliver portable AC units and backup generators to rent-stabilized buildings with elderly populations in East Harlem, Bushwick, and the South Bronx" — cheaper, targeted, dramatically more effective.)
- **Pattern interventions** unlock when you discover cross-district links — the highest-value deployments, addressing root causes. ("Citywide landlord heat-failure reporting system" — moves from band-aid to structural fix.)

This is pillar #1 in mechanical form: listening before deciding isn't just flavor — it's the system. You literally cannot access the best emergency response tools without doing the ground work. HCD's principle that the people closest to the problem are closest to the solution is encoded directly into the unlock structure.

### 5.8 The cost of governing (the Frostpunk clock)

Pressure that never stops:
- **Knowledge decay:** insights go stale. What you learned four weeks ago may not be current. Districts drift, new problems emerge, old ones shift. You have to keep going back.
- **Trust erosion:** districts you haven't visited or acted on slowly lose trust. Silence reads as neglect.
- **Operating deficit:** the city spends ~$1.5B/month just to run. Reserve erodes unless you generate revenue or make hard cuts.
- **Emerging crises:** new problems surface whether you're looking or not. A district you've never visited might be in crisis — and you won't know until you go there or it makes the news (by which point trust has already cratered).

Together these create the knife's-edge: you can never rest, you can never know enough, and the city is always one step ahead of your understanding.

### 5.9 Disasters & events (the primary antagonist)

Disasters are not random 30% interruptions — they are the **final exam**. The entire 48-week term follows a single escalating crisis arc: a major winter nor'easter that the player can see coming from week 4 onward. The left panel shows a countdown ("BLIZZARD ARRIVING IN X WEEKS") and a preparation checklist that tracks districts visited, insights gathered, patterns found, and citywide resilience. The disaster never surprises you — but how ready you are is entirely up to you.

#### The blizzard arc (10 scripted events)

**Distant signals (weeks 1–20):**

| Week | Event | What happens |
|---|---|---|
| 4 | **Long-Range Winter Outlook** | NWS flags elevated blizzard risk. Feed item. Nobody's paying attention yet. |
| 10 | **Infrastructure Report Card** | Comptroller audit: aging plows, depleted salt reserves. "We are not ready." |
| ~14–18 | **Summer Heat Stress** | A heat wave sends 200 to ERs — a preview. Districts you've visited handle it better (cooling centers pre-positioned from your field data). |

**Escalation (weeks 20–35):**

| Week | Event | What happens |
|---|---|---|
| 22 | **Models Converge** | 70% chance of major nor'easter. Infrastructure work window narrowing. |
| ~28–32 | **Early Snow Squall** | 3 inches in Queens. Flushing streets unplowed for 18 hours. Trust −3 Flushing, −2 Jackson Heights. |
| ~30–34 | **Salt Prices Spike** | Nationwide shortage. −$0.3B reserve hit. Cities that didn't stockpile early are scrambling. |

**Crisis (weeks 36–48):**

| Week | Event | What happens |
|---|---|---|
| 36 | **BLIZZARD WATCH** | NWS issues watch for all five boroughs. Cinematic overlay. Last chance for emergency measures. |
| ~37–40 | **Sanitation Union Demands Storm Pay** | Union demands guaranteed overtime. −$0.5B reserve. |
| 42 | **BLIZZARD WARNING** | Two feet of snow, 50mph gusts forecast. Cinematic overlay. Flag: `blizzard_imminent`. "Did you prepare?" |
| 44 | **THE BLIZZARD** | It hits. Cinematic overlay. Power outages in outer boroughs. Transit shut down. Visited districts activate community networks. Unvisited districts call 911. Flag: `blizzard_struck`. |

Major events (watch, warning, strike) trigger **cinematic Frostpunk-style dark overlays** with the event headline and an "I SEE" dismiss button — the game pauses to make you feel the weight.

#### The three phases of disaster

**Before (~weeks 1–35):** Your insights reveal pre-existing conditions — which basements flood, which communities lack AC, which seniors live alone, which pharmacies have backup generators. The map's Knowledge view is vulnerability mapping. Every conversation is reconnaissance. The preparation checklist in the left panel is your score: are you ready?

**During (~weeks 36–44):** When the blizzard hits, the game doesn't just ask for money. It asks: *"Do you know where to deploy?"* If you listened, you know the pharmacy on 138th needs generator fuel for insulin storage. If you didn't visit, you route resources blind. The feed floods with emergency reports — specific and actionable from districts that trust you, silent from districts you neglected. Community assets you discovered activate automatically. Assets you never found are wasted.

**After (~weeks 44–48):** Recovery isn't press releases — it's following up. Did Maria get her heat fixed before the next cold snap? The DM system becomes your check-in mechanism. Districts where you did the work recover faster. Districts you neglected are still in crisis. The final resilience score determines your ending.

#### Smaller events

Between the main arc events, the game fires smaller disruptions:
- **Reveal** hidden vulnerabilities in districts you haven't visited (the news tells you, but resilience is already damaged because you weren't there first)
- **Validate** your preparation (you pre-positioned generators and the blackout was contained — visited districts credit you)
- **Disrupt** your plans (a crisis in one borough pulls you away from another)

### 5.10 Win / lose

| Outcome | Trigger |
|---|---|
| **The Resilient City** | Finish with citywide resilience ≥ 75% — zero preventable casualties. Community trust is high enough that neighborhoods self-organize during the crisis. You earned it. |
| **Held Together** | Survive the term with citywide resilience ≥ 50% — losses occurred but the system bent without breaking. |
| **The Blind Response** | Finish < 50% resilience — preventable casualties in districts you never visited. Resources misallocated because you didn't know who was vulnerable. |
| **Evacuation Failure** | Citywide resilience drops below 20% mid-term — a disaster hits a neighborhood you've never visited, people are trapped because you didn't know their mobility constraints. |
| **Fiscal Crisis** (state takeover) | Reserve falls below −$3.0B |

### 5.11 Difficulty & balance

The previous simulator validated the old loop's balance. The new loop requires a new balance model centered on:

- **Coverage pressure:** can a player who visits randomly survive the disaster? (Should be hard but possible — ~25%)
- **Listening pressure:** does a player who visits strategically but never acts on what they learn survive? (Should fail — knowledge without intervention stalls resilience)
- **Blind-response penalty:** does a player who never visits but sets good generic interventions survive? (Should be very hard — ~15%. One-size-fits-all disaster kits don't save the insulin-dependent senior.)
- **Optimal play:** strategic visiting + informed interventions + grounded communication (~80% survival rate)

The balance harness should be rebuilt to model these new dynamics as a first-class dev tool.

---

## 6. Content scope (current → target)

| Content type | Built | First-release target | Notes |
|---|---|---|---|
| Districts | 19 | 19 | Complete with concerns, blocs, vulnerability tags, positions |
| Characters with scripted conversations | 3 | 19 (1 per district minimum) | South Bronx, Harlem, Midtown done. LLM generates dynamic conversations from character profiles, reducing the need for hand-authored scripts. |
| Character profiles (for LLM conversations) | 3 | 3–5 per district (~60–95) | Name, role, traits, knowledge domain. Lightweight to author — the LLM does the dialogue. |
| Insight templates per district | ~6–9 (via conversations) | 8–12 per district (~150–230) | LLM conversations generate insights dynamically from district concerns + character knowledge |
| Concern weights per district | 19 | 19 | All districts have 6-category concern scores (0–10). Drives LLM scoring. |
| Policy/intervention templates | 6 (in data graph) | 15–20 generic + 40–60 informed | Infrastructure policies defined in entries.js; informed/pattern tiers designed but not wired |
| Cross-district patterns | 0 | 10–15 | Schema designed, detection not implemented |
| Scenario events (blizzard arc) | 10 | 15–20 (add smaller disruptions) | Full blizzard arc implemented with cinematic overlays |
| LLM system prompts | 2 | 3–4 | Post scoring prompt done. Conversation prompt designed. Listening session prompt needed. |
| Feed chatter templates | ~10 | 80–120 (district-specific, vague↔specific) | Basic templates; needs knowledge-graded detail |
| DM templates per character | 1 (post-conversation) | 3–5 per character | Weekly follow-ups, disaster updates, reply system needed |

---

## 7. Development history

Three prototypes built progressively; the third became the foundation for the current game shell:

- **The card loop** (retired): the decision + framing layer with the coalition model, cost-of-governing, events, and win/lose states. Validated that communication-as-mechanic works and the difficulty gradient holds. The campaign framing system evolved into the current social/resonance system.
- **The spatial layer** (retired): a Phaser district map with pan/zoom, hover/select, three view modes, and policy ripples. Validated that consequence-on-map reads clearly. Superseded by the Mandate Board's SVG approach.
- **The Mandate Board** (`Mandate Board.html`): the **design reference** — a polished, interactive SVG map with 19 districts, four view modes, hexagonal radial action menus, glassmorphic panels, and the complete visual language (light cream theme, red accent, Space Grotesk + Doto typography). Still in the repo as a read-only design reference.
- **The game shell** (`index.html`): the current playable prototype. Built on the Mandate Board's visual DNA, it implements the full 48-week loop: three-view shell (Map/Calendar/Social), hex menu, drag-to-schedule Calendar, LLM-scored posts, 3 conversation scripts, 10-event blizzard arc with cinematic overlays, and all five end-states. ~4,800 lines, all inline.

---

## 8. UX & interface

The full user flow — hex menu, three views, and all transitions — is documented in §4. This section covers visual treatment and the pieces that sit across views.

### 8.1 Persistent elements

Across all three views:
- **Tab bar** — `M` `C` `S` styled as MTA-line bullets, bottom of screen. Active tab filled, inactive outlined. Notification badges: Social badges on new DMs or ratio'd posts; Map badges on emerging crises; Calendar badges on due commitments.
- **Status bar** (top) — citywide trust %, city reserve, week/term clock, active crisis indicator. Always visible. Uses the Mandate Board's layout: MANDATE logotype left, data center, crisis right.
- **Minimap strip** (below status bar, visible in Calendar and Social views) — compressed SVG of the full district graph. Shows knowledge brightness, labeled districts with colored hex badges, pulsing crisis nodes. Tap any district on the minimap to jump to Map view with that district selected.
- **The notebook** — slide-out drawer accessible from any view (hotkey `N` or pull-tab at right edge). Collects insights organized by district and category. Cross-district patterns highlight automatically when discovered. This is the player's intelligence — the thing that powers good posts and informed policies.

### 8.2 Conversation UI

When "Go" fires on the Calendar, the view transitions to Map. The map pans/zooms to the first scheduled district. A conversation panel overlays the map — the map dims, the target district node stays bright and pulsed.

The panel uses the Mandate Board's glassmorphic treatment: dark header with character name, role, and district tag. NPC text in Space Grotesk, key statements highlighted with the red left-border accent.

**With LLM (primary path):** The player types freely in a text input. The LLM plays the character and responds in their voice. No menus — the quality of your questions and empathy determines what gets revealed. A subtle depth indicator shows how open the character is becoming.

**Without LLM (fallback):** Player choices are 2–3 response options that feel natural ("Tell me more about that," "That sounds rough," "I'll look into it") — not strategic menus. A depth meter tracks active listening quality.

In both modes: discovered insights animate in as chips (Doto monospace, colored by category) that fly to the notebook pull-tab. The conversation ends, the panel slides away, the district node pulses brighter (knowledge just increased). If another engagement is scheduled, the map pans to the next district. After all engagements complete, the player is on the Map with fresh insights.

### 8.3 Quality floor

Responsive to mobile (views stack vertically on small screens), keyboard-focusable controls, `prefers-reduced-motion` respected (disables hex menu animations, crossfades instead). The map renders on all modern browsers without a game engine dependency.

---

## 9. Art direction & audio

### 9.1 Visual foundation — the Mandate Board

The visual identity is established by the **Mandate Board** prototype (`Mandate Board.html`), a polished interactive SVG map with panels and a hexagonal action menu. The design language is:

**Palette:**
- **Background:** warm cream/off-white (`#ececea`) with subtle radial gradient. Light, airy, civic — not dark.
- **Accent:** a single red (`#ff2d2d`) used for: the MANDATE logotype, trust warnings, active selections, the hexagonal action menu highlight, danger states. Red is the only chromatic color in the entire UI.
- **Neutrals:** everything else is grayscale. Blocs are distinguished by value (`#1a1a1a` through `#777777`), not hue. Text is near-black on cream. Panels are semi-transparent white with backdrop blur.
- **Knowledge brightness:** unvisited districts fade to ~14% opacity on the map — a literal dimming. Visited districts are solid. This single visual trick makes the knowledge system immediately legible.

**Typography:**
- **Space Grotesk** (400–700) — display face for labels, headings, body text.
- **Doto** (500–900) — monospace pixel-grid face for all data: trust percentages, budget, week counters, countdown timers, category chips. Replaces Space Mono from earlier spec.

**Layout pattern:**
- Full-bleed SVG map as the canvas.
- **Top bar:** `MANDATE` logotype (red, letterspaced), week/quarter counter, approval/trust %, reserve, crisis indicator.
- **Bloc bar:** five constituency dots with labels and percentages, centered below the top bar.
- **Left panel:** objective card, countdown timer, infrastructure checklist, public credit dots, map legend. Glassmorphic: `rgba(250,250,248,0.94)` with `backdrop-filter: blur(12px)`, 1px border, `border-radius: 10px`.
- **Right panel:** district detail — selected district name (white on dark header), bloc, local trust (large Doto number, colored by trust level), population weight, concern quote (red left-border), knowledge progress bar, infrastructure status.
- **Bottom bar:** view mode switcher (Coalition, Trust, Knowledge, Needs) as pill buttons. Active = red fill, white text. Inactive = transparent, gray text.

**Interaction patterns:**
- **Hexagonal radial menu** (reference: `index.html` Phaser implementation): click a district node → six hex buttons **expand outward** from the node center with staggered delays and `back.out` easing. Each hex has its own color (VISIT=green, LISTEN=cyan, POLICY=purple, POST=pink, INFO=gold, CLOSE=gray). Connected by per-color lines. On hover: hex scales 1.12x, fill inverts to action color, label goes dark. On dismiss: items **collapse back to center** with `quad.in` easing. Clicking an action hex labels the district (persistent badge on node), then collapses the menu.
- **Node selection:** selected district gets a pulsing ring; all other labels dim to 18% opacity so focus narrows. Labeled (but unselected) districts show a small colored hex badge so you can see your planning marks across the map.
- **View mode switching:** bottom pill bar, one active at a time. Each mode recolors the map nodes (coalition = bloc grays, trust = red/gray/black by trust level, knowledge = opacity by freshness, needs = category chip icons on visited nodes).

### 9.2 Extending the language to Calendar and Social views

The Mandate Board defines the Map view. Calendar and Social must share the same visual DNA:

- **Calendar:** Same glassmorphic panels. Week slots as horizontal blocks (Doto labels for week numbers). Engagement cards styled like the district detail panel. The map minimap strip at top uses the same SVG rendering at reduced scale.
- **Social:** Post composer as a card with the glassmorphic treatment. Feed items as stacked cards. Engagement metrics (likes, shares) in Doto monospace. DM threads in the same chat-bubble style as conversations. The feed background is the same cream. Red accent for notification badges, ratio indicators, and viral posts.

### 9.3 Audio

(Later): a low ambient city hum; distinct stings for trust gained vs. lost; a heavier motif when a fail-state nears. Restraint over spectacle.

---

## 10. Technical architecture

**Runtime pattern:** a thin app shell with a **tab router** between three views — Map (SVG + DOM panels), Calendar (DOM), and Social (DOM). A persistent status bar sits above the active view; the minimap strip renders a scaled-down SVG in Calendar/Social. The notebook is a slide-out drawer accessible from any view. Conversations overlay the Map view as a DOM panel.

The Mandate Board prototype (`Mandate Board.html`) establishes the reference implementation for the Map view. It uses **SVG for the map** (not Phaser/Canvas), which simplifies the stack significantly: no game engine dependency, native text rendering, CSS animations, better accessibility, and trivial DOM overlay integration. The 19-node district graph does not need Canvas performance — SVG handles it cleanly.

### 10.0a EventBus bridge (inline in index.html)

An inline `EventBus` class is defined in `index.html` and emits events at key lifecycle points: `ui.weekAdvanced`, `clock.weekStart`, `engagement.started`, `conversation.ended`, `post.published`, `game.start`. A **state bridge** wraps `gameState` and `DISTRICTS` with a dot-path `get`/`set`/`update` API, allowing the modular systems (`clock.js`, `trust.js`, `policy.js`, `scenario.js`) to be wired via the bus without direct state imports.

### 10.0b Ollama integration (LLM as game engine)

The local LLM (Ollama at `localhost:11434`, configurable via `OLLAMA_MODEL`, default `llama3.2`) serves as the game's intelligence layer in two symmetric roles:

**1. Conversations (inbound — player listens to the city)**
When a scheduled engagement fires, the LLM receives a system prompt with:
- The character's profile (name, role, district, traits, knowledge domain)
- The district's concerns and current state (trust, knowledge, recent events)
- The player's existing insights (what they already know — the LLM avoids repeating)
- The game clock (week number, disaster proximity, crisis phase)
- Conversation history (for recurring visits — "last time you said X")

The LLM plays the character in a multi-turn conversation. The player types freely. After the conversation ends (player closes, or 5+ exchanges), the LLM returns structured JSON: insights discovered, trust delta, depth score, character reaction, and a follow-up hook for DMs.

**2. Post scoring (outbound — player speaks to the city)**
`handlePost()` is async and sends the player's post text plus all discovered insights as context. The LLM returns per-district scores (0–10) and resident reaction quotes. Trust deltas are applied per district based on scores.

**Fallback behavior:** When Ollama is unavailable, conversations fall back to scripted dialogue trees (multiple-choice, depth meter). Posts fall back to keyword matching against insight text. The game is fully playable in offline/fallback mode — the LLM path is richer, not required.

### 10.1 Principles (unchanged)

- **Data-driven content.** Districts, insights, characters, conversation fragments, policies, messages, and events are data (entries + links), not code. New content = new entries. The balance harness reads the same data.
- **SVG + DOM, no game engine.** The map is an SVG element with reactive data binding (nodes, edges, glows, opacity). All panels, conversations, and views are plain DOM. No Phaser dependency — the Mandate Board prototype proves SVG handles the map beautifully. CSS handles animations (transitions, keyframes); SVG filters handle glow effects.
- **Save/restore.** Storage-agnostic state layer. In-memory for embedded artifacts; `localStorage` or backend once deployed.
- **Balance simulator** as a maintained CLI tool (Node) — rebuild for the new loop.

### 10.2 Existing systems (carry forward)

These systems survive the pivot with modifications:

| System | File | Status | Notes |
|---|---|---|---|
| EventBus | `bus.js` | **Done** | Pub/sub backbone with wildcard patterns. Also inlined in index.html. |
| StateStore | `state.js` | **Done** | Dot-path get/set/update, snapshot/restore. Also inlined. |
| EntryRegistry | `registry.js` | **Done** | Content graph queries. Not yet populated/used in shell. |
| ClockSystem | `clock.js` | **Done** | Weekly cadence, deficit, erosion, win/lose. Logic duplicated inline in index.html. |
| TrustSystem | `trust.js` | **Done** | Per-district resilience, bloc aggregates, citywide. Logic duplicated inline. |
| PolicySystem | `policy.js` | **Partial** | Insight-gated tiers designed. Not wired into shell. |
| ScenarioSystem | `scenario.js` | **Partial** | Condition-based event engine. 10 blizzard events are hardcoded inline instead. |
| CoalitionSystem | `coalition.js` | **Retired** | Replaced by TrustSystem. File deleted. |
| CampaignSystem | `campaign.js` | **Retired** | Replaced by inline Social view + LLM scoring. File deleted. |
| HazardSystem | `hazard.js` | **Retired** | Folded into scenario events. File deleted. |
| InfrastructureSystem | `infrastructure.js` | **Deferred** | Data exists in entries.js/links.js; build system paused. |

### 10.3 New systems

Each is a standalone file in `systems/`, communicating only through the bus. No system imports another.

**EngagementSystem** (`systems/engagement.js`)
Manages the label→schedule→execute pipeline. Labels come from the hex menu on the Map (free, no limit). The Calendar displays the label queue and lets the player drag labels into time slots. When the player hits "Go", scheduled engagements execute in order.

| Listens to | Emits |
|---|---|
| `ui.districtLabeled` | `label.added` (updates queue, node badge) |
| `ui.districtUnlabeled` | `label.removed` |
| `ui.labelScheduled` | `engagement.scheduled` (slot filled) |
| `clock.weekStart` | `engagement.available` (slots for this week) |
| `ui.weekStarted` ("Go") | `engagement.started` / `engagement.ended` (per slot) |

**ConversationSystem** (`systems/conversation.js`)
Manages character conversations via two paths. **LLM path (primary):** sends character profile, district state, player insight history, and conversation history to Ollama. The LLM plays the character; the player types freely. After the conversation, the LLM returns structured JSON with insights, trust delta, depth score, and follow-up hooks. **Fallback path:** scripted dialogue trees with multiple-choice responses and a depth meter.

| Listens to | Emits |
|---|---|
| `engagement.started` (visit/listening) | `conversation.loaded` (character, topics) |
| `ui.conversationMessage` (player typed text) | `conversation.exchange` (LLM response, depth change) |
| `ui.conversationChoice` (fallback mode) | `conversation.exchange` (scripted response) |
| `ui.conversationEnd` | `conversation.ended` (insights gained, trust delta) |
| | `insight.discovered` (per insight) |

**InsightSystem** (`systems/insight.js`)
Manages the knowledge graph. Stores discovered insights per district, tracks freshness, detects cross-district patterns when the same category+problem appears in multiple places, and unlocks informed/pattern policy tiers.

| Listens to | Emits |
|---|---|
| `insight.discovered` | `insight.recorded` |
| `clock.phaseStart` (advance) | `insight.staled` (freshness decay) |
| | `pattern.discovered` (cross-district link found) |
| | `policy.tierUnlocked` (informed/pattern policy now available) |

**KnowledgeSystem** (`systems/knowledge.js`)
Per-district knowledge state — how well the mayor currently understands each place. Driven by visits (brightens) and time (dims). Feeds the Knowledge view mode on the map.

| Listens to | Emits |
|---|---|
| `conversation.ended` | `knowledge.updated` (district brightens) |
| `clock.phaseStart` (advance) | `knowledge.decayed` (weekly dimming) |

**SocialSystem** (`systems/social.js`)
Replaces the old campaign/framing system. Manages the social media view: post composition, grounding scoring, feed generation, DM threads. Posts are scored against the player's actual insight history — grounded posts generate engagement, hollow posts get ratio'd. The feed is procedurally generated from district concerns, post reactions, events, and character DMs.

| Listens to | Emits |
|---|---|
| `ui.postComposed` | `post.published` (grounding score, reach) |
| `post.published` | `feed.reaction` (per-district engagement response) |
| `conversation.ended` | `dm.available` (character can now DM you) |
| `clock.weekAdvance` | `feed.updated` (new district chatter, mood shifts) |
| `ui.dmSent` | `dm.replied` (trust maintenance delta) |

**OnboardingSystem** (`systems/onboarding.js`)
Manages the scripted Week 0 sequence. Tracks which beat the player is on, gates certain actions (e.g., forces the first visit), and hands off to the normal loop after Beat 6. Listens for player actions to advance beats. Emits UI cues for the shell to render the briefing, desk policy, interruption, and contrast screens.

| Listens to | Emits |
|---|---|
| `game.start` | `onboarding.beat` (beat number, narrative, UI cue) |
| `ui.onboardingAction` (player advances) | `onboarding.complete` (normal loop begins) |
| `policy.resolved` (Beat 2 desk policy) | |
| `conversation.ended` (Beat 4 first conversation) | |

### 10.4 State model (new)

```javascript
{
  // Clock
  week: 0,                    // 0 = onboarding, 1–48 = term
  slotsTotal: 3,
  
  // Label queue (from hex menu on Map → flows to Calendar)
  labels: [
    // { districtId: "d_east_harlem", action: "visit", labeledAt: 1 }
  ],
  
  // Scheduled engagements (labels dragged into Calendar slots)
  schedule: [
    // { slot: 0, districtId: "d_east_harlem", action: "visit" }
    // { slot: 1, districtId: null, action: "policy" }
  ],
  
  // Onboarding
  onboarding: {
    active: true,
    beat: 1,                  // 1–6
    deskPolicySigned: false,
    firstConversationDone: false,
  },

  // Resources
  reserve: 5.0,              // $B
  operatingDeficit: 1.5,     // $B/month (applied weekly as ~0.375)

  // Per-district (19 entries)
  districts: {
    d_east_harlem: {
      trust: 40,              // 0–100
      knowledge: 0,           // 0–100 (freshness of understanding)
      lastVisited: null,      // week number or null
      bloc: "working",
      pop: 120000,
      concerns: ["housing", "safety"],  // active concern categories
    },
    // ... 18 more
  },

  // Insights (discovered by player)
  insights: [
    // {
    //   id: "ins_eh_heat",
    //   district: "d_east_harlem",
    //   category: "housing",
    //   severity: 0.8,
    //   freshness: 1.0,        // decays toward 0
    //   discoveredAt: 0,       // week
    //   description: "Heat failures in rent-stabilized buildings",
    //   crossLink: null,       // or pattern ID
    // }
  ],

  // Patterns (auto-detected cross-district links)
  patterns: [],

  // Blocs (aggregate lens, computed from districts)
  blocs: {
    working:      { trust: 40 },
    finance:      { trust: 40 },
    realestate:   { trust: 40 },
    progressives: { trust: 40 },
    labor:        { trust: 40 },
  },

  // Policies enacted
  policies: [],               // { id, week, type: "generic"|"informed"|"pattern", targets }

  // Social media
  posts: [],                  // { id, week, claim, tone, policyId?, groundingScore, engagement: {likes, shares, replies} }
  feed: [],                   // { id, week, type: "chatter"|"reaction"|"news", district?, text, mood }
  dms: [],                    // { id, characterId, district, messages: [{sender, text, week}], trust_delta }

  // Aggregate
  citywide: 40,               // population-weighted trust
  gameOver: false,
  gameResult: null,            // "resilient_city"|"held_together"|"blind_response"|"evacuation_failure"|"fiscal_crisis"
  
  // History (for telemetry + end-card)
  history: [],                // { week, type, id, label, details }
}
```

### 10.5 Content graph extensions

New entry types added to `data/entries.js`:

```javascript
// Characters — people you meet in districts
{ id: "c_eh_maria", type: "character", label: "Maria Delgado",
  role: "Tenant organizer", district: "d_east_harlem",
  traits: ["direct", "tired", "knowledgeable"],
  portrait: "maria_delgado" }

// Insight templates — possible discoveries per district
{ id: "ins_eh_heat", type: "insight", label: "Heat failures",
  description: "Landlords aren't fixing heat in rent-stabilized buildings.",
  district: "d_east_harlem", category: "housing", baseSeverity: 0.8,
  crossLinkPattern: "pat_housing_neglect" }

// Conversation fragments — reusable dialogue pieces
{ id: "cf_heat_opener", type: "fragment", label: "Heat complaint opener",
  speaker: "npc", text: "Third winter in a row, no heat past 10pm.",
  topic: "housing", mood: "frustrated",
  reveals: "ins_eh_heat",         // discovering this insight
  followups: ["cf_heat_dig", "cf_heat_empathy", "cf_heat_deflect"] }

// Patterns — cross-district problem themes
{ id: "pat_housing_neglect", type: "pattern",
  label: "Systemic housing neglect",
  description: "Landlords across multiple neighborhoods failing to maintain rent-stabilized units.",
  requiredInsights: 3,            // from different districts
  category: "housing",
  unlocksPolicy: "pol_targeted_heat_enforcement" }

// Informed policies — unlocked by insights
{ id: "pol_targeted_heat_enforcement", type: "policy",
  label: "Targeted heat enforcement in rent-stabilized buildings",
  tier: "informed",               // generic | informed | pattern
  requiredInsights: ["ins_eh_heat"],  // minimum to unlock
  budgetDelta: -0.3,
  trustEffect: { targeted: +12, citywide: +1 },
  description: "Deploy code enforcement to specific buildings..." }
```

New link types added to `data/links.js`:

```javascript
// Character → District
{ source: "c_eh_maria", target: "d_east_harlem", type: "lives_in" }

// Character → Insight (can reveal)
{ source: "c_eh_maria", target: "ins_eh_heat", type: "knows_about" }

// Fragment → Fragment (conversation branching)
{ source: "cf_heat_opener", target: "cf_heat_dig", type: "leads_to", value: "curious" }
{ source: "cf_heat_opener", target: "cf_heat_empathy", type: "leads_to", value: "empathetic" }

// Insight → Pattern (contributes to)
{ source: "ins_eh_heat", target: "pat_housing_neglect", type: "contributes_to" }

// Pattern → Policy (unlocks)
{ source: "pat_housing_neglect", target: "pol_targeted_heat_enforcement", type: "unlocks" }
```

### 10.6 Event flow — one week (steady state)

The week is **player-driven**, not phase-locked. The player freely switches between Map, Calendar, and Social views. Events fire in response to player actions, not a fixed sequence.

```
clock.weekStart {week}
  └─ knowledge.decayed (all districts dim slightly)
  └─ insight.staled (old insights lose freshness)
  └─ feed.updated (new district chatter, DMs from characters)
  └─ engagement.available {slots: 3}
  └─ scenario.evaluate (events, emerging crises → map alerts, feed items)

── PLAYER-DRIVEN (no enforced order) ──

Map labeling (free, no slot cost):
  └─ ui.districtLabeled {districtId, action: "visit"|"listen"|"policy"|"message"}
       └─ label.added {districtId, action}  → node shows badge, Calendar queue updates
  └─ ui.districtUnlabeled {districtId}
       └─ label.removed {districtId}  → badge clears, Calendar queue updates

Calendar scheduling:
  └─ ui.labelScheduled {slot, districtId, action}  (drag from queue to slot)
  └─ ui.labelUnscheduled {slot}                     (remove from slot)
  └─ ui.weekStarted (player clicks "Go" — plays out scheduled engagements)
       └─ FOR EACH scheduled slot:
            └─ engagement.started {districtId, action}
            └─ IF visit/listening:
                 └─ [MAP VIEW] conversation overlay
                 └─ conversation.loaded {character, topics}
                 └─ LLM PATH: ui.conversationMessage → Ollama → conversation.exchange (multi-turn)
                    FALLBACK: ui.conversationChoice → conversation.exchange (×3–5)
                 └─ conversation.ended {insights[], trustDelta, depth, followUpHook}
                 └─ insight.discovered (×1–3)
                 └─ knowledge.updated
            └─ IF policy:
                 └─ policy.available {generic, informed, pattern}
                 └─ ui.policyChosen → policy.resolved {trustDeltas, budgetDelta}
            └─ engagement.ended
            └─ label consumed (removed from queue and node badge)

Social actions (any time, no slot cost):
  └─ ui.postComposed {claim, tone, policyId?}
       └─ post.published {groundingScore, reach}
       └─ feed.reaction (per-district engagement responses appear in feed)
  └─ ui.dmSent {characterId, text}
       └─ dm.replied {trust_delta}

── WEEK END ──

  └─ ui.weekAdvanced (player clicks "End Week" on Calendar)
       └─ trust erosion for unvisited/unacted districts
       └─ apply operating deficit (~$0.375B)
       └─ unscheduled labels persist in queue (carry over to next week)
       └─ check win/lose conditions
       └─ clock.weekStart {week + 1}
```

### 10.7 Event flow — Week 0 (onboarding)

During onboarding, only the Map view is active. Calendar and Social tabs are visible but locked (dimmed, with a subtle "Week 1" label). This focuses the player on the map and the first conversation before revealing the full interface.

```
game.start
  └─ onboarding.beat {beat: 1, type: "briefing"}
       └─ [MAP VIEW] newspaper splash overlay, oath, dim map behind
       └─ ui.onboardingAction (player dismisses)
  └─ onboarding.beat {beat: 2, type: "desk_policy"}
       └─ [MAP VIEW] generic housing policy card overlaid on map
       └─ ui.policyChosen → policy.resolved (mild trust, big budget hit)
       └─ map barely changes — the gap is visible
       └─ state: onboarding.deskPolicySigned = true
       └─ ui.onboardingAction
  └─ onboarding.beat {beat: 3, type: "interruption"}
       └─ [MAP VIEW] scheduler dialogue overlay, "East Harlem is asking"
       └─ East Harlem node pulses on the dim map
       └─ ui.onboardingAction (player agrees to go)
  └─ onboarding.beat {beat: 4, type: "first_conversation"}
       └─ [MAP VIEW] conversation panel overlays map, East Harlem node glows
       └─ engagement.started {type: "mayor_visit", district: "d_east_harlem"}
       └─ conversation.loaded → normal conversation flow
       └─ conversation.ended → insight.discovered
       └─ state: onboarding.firstConversationDone = true
  └─ onboarding.beat {beat: 5, type: "contrast"}
       └─ [MAP VIEW] notebook slides out (1 insight) next to desk policy summary
       └─ "That's day one. 47 weeks left. Here's what you know."
       └─ Map: one bright node, 18 dim
       └─ ui.onboardingAction
  └─ onboarding.beat {beat: 6, type: "handoff"}
       └─ Calendar and Social tabs unlock (animate in, badge with "NEW")
       └─ Social feed populates with initial city chatter
       └─ state: onboarding.active = false
       └─ onboarding.complete
       └─ clock.weekStart {week: 1}  ← normal loop begins, all views active
```

---

## 11. Open design questions

### Answered by implementation

- ~~**Conversation depth vs. pace:**~~ Implemented as free-form LLM conversations (no fixed exchange count). Scripted fallback uses 3–5 exchanges with depth meter. Playtesting will determine if conversations need a soft time limit.
- ~~**Posting frequency:**~~ No limit. The constraint is entirely "you need insights to post well." LLM scoring naturally punishes hollow posts with low engagement and trust erosion. No artificial cap needed.
- ~~**Lying and spin:**~~ Allowed. The LLM detects it — posts about unvisited districts get low scores and get ratio'd in the feed. The option to lie is itself the interesting choice; the system punishes it naturally.
- ~~**Difficulty ramp:**~~ The blizzard arc starts signaling at week 4 (distant forecast). Complexity is present from day one — 19 districts, all unknown. The countdown creates urgency without artificial gating.

### Still open

- **LLM conversation quality floor:** How do we ensure the LLM stays in character and doesn't hallucinate NYC facts? The system prompt needs guardrails — character profile, district concerns, and explicit "do not invent locations or statistics" instructions. What's the minimum model size that produces good conversations? `llama3.2` (3B) may be too small for multi-turn roleplay.
- **Conversation length control:** With free-form LLM conversations, what stops a player from interrogating one character for 20 turns? Options: (a) the character gets tired and ends it ("I've got to go, Mayor"), (b) a soft timer in the UI ("You have other meetings today"), (c) diminishing insight returns after 5–6 exchanges.
- **Insight staleness curve:** How fast should knowledge decay? Too fast = frustrating ("I can never keep up"). Too slow = no pressure to revisit. Current code applies −4 knowledge/week. Probably district-dependent — fast-changing neighborhoods decay faster.
- **Feed as gameplay vs. flavor:** How much of the feed is mechanically significant (early warnings, actionable intel) vs. atmosphere? The ratio determines whether players learn to read the feed strategically.
- **DM depth:** One reply ("Thanks, I hear you") or multi-turn threads? With LLM-powered conversations, DMs could also be LLM-generated — characters message you with updates, you reply freely. But this risks making DMs a second conversation channel that competes with visits.
- **Recurring characters:** With LLM conversations, revisiting a district can naturally surface the same character with memory of your last conversation. The LLM system prompt includes conversation history. But how much history is too much context? Should the game limit repeat visits to the same character to encourage meeting new people?
- **The notebook as UI:** How much of the insight system is visible as an explicit notebook vs. baked into the map and social view? The notebook risks feeling like homework. The social feed partially replaces it as a "what do I know" surface.
- **Community asset amplification:** When a discovered asset meets a pre-positioned intervention, the asset's protective radius should double. But what's the right multiplier? Too high and assets feel overpowered. Too low and the discovery doesn't feel meaningful.
- **Listening session dynamics:** With 2–3 characters in a single LLM conversation, how do we prevent the meeting from becoming incoherent? The LLM needs structure: each character speaks in turn, they build on each other's points, disagreements surface real tensions. This is harder than 1-on-1 conversations.
- **Model selection & performance:** `llama3.2` (3B) is fast but may lack the nuance for in-character roleplay. `llama3.1:8b` is better but slower. Should the game offer a model selector, or should it auto-detect what's available? What's the latency budget for a conversation turn? (>3 seconds breaks immersion.)

---

## 12. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Conversations feel repetitive or shallow | High | Procedural assembly from fragments; recurring characters with memory; playtest conversation fatigue early |
| Politically charged content reads as partisan or preachy | Med | Keep blocs as game factions, not real parties; comedy + evenhandedness; playtest with mixed audiences |
| Insight system feels like busywork ("homework before the fun part") | Med | Make conversations intrinsically enjoyable, not just data-gathering; insights should feel like discoveries, not checkboxes |
| Knowledge/trust model is too opaque (pillar #2 breaks) | Med | Every system must answer "does the player understand why trust went up/down?"; the notebook and map views must make the chain legible |
| Content volume is daunting (60+ characters, 150+ insights) | High | Prioritize 5–7 districts for Phase 1; use procedural assembly over hand-authored scripts; template system for conversations |
| Balance breaks as content scales | Med | Maintained simulator in CI; playtest coverage/trust curves regularly |
| SVG perf on low-end mobile with many animated nodes | Low | 19 nodes is well within SVG performance budget; reduce glow filters on low-end; `prefers-reduced-motion` disables animations |
| Scope creep (conversations + insights + messages + recurring chars all at once) | High | Strict phase gating; ship the listening loop before adding message resonance depth |

---

## 13. Success metrics & playtesting

Because this is being built by an HCI researcher, instrument it like one.

- **Completion:** % of players who finish a full term; where dropoff clusters by week.
- **Engagement with listening:** do players choose to visit districts, or do they skip to generic policies? Time spent in conversations vs. time spent governing. If players skip the conversations, the design has failed.
- **Coverage patterns:** how many of the 19 districts does a player visit in a run? Do they cluster or spread? Where do they go first and why?
- **Social behavior:** do players craft posts based on insights they gathered, or do they spray generic claims? Do they read the feed? Do they reply to DMs? Does grounding correlate with trust outcomes? How often do they check Social vs. Map vs. Calendar?
- **Legibility:** post-run, can players name what a specific district needed? Can they explain why trust went up or down? (The pillar-2 test.)
- **Replay:** runs per session; do players try different coverage strategies across runs (geographic, bloc-focused, crisis-driven)?
- **Lightweight telemetry** + a structured think-aloud protocol for qualitative passes. Key events to log: district visits, conversation choices, insights discovered, messages crafted, policy selections, trust deltas. Keep raw event logs so balance and UX can be analyzed together.

---

# Dev roadmap

Phases are gated: don't start a phase until the prior phase's exit criteria are met. Effort is rough and assumes a solo dev or very small team; treat the ranges as relative, not promises.

### Phase 0 — Prototypes · **DONE**
Two balance-tested slices: the card loop and the spatial map.
**Exit (met):** spatial layer proven; coalition model validated; visual language established.

### Phase 1 — The listening loop: *"One Week, Playable"* · **~80% COMPLETE**

**Done:**
- [x] Three-view shell with tab router, status bar, bloc bar
- [x] Live Map view: SVG nodes, edges, 4 view modes, pan/zoom, hex menu with animated expand/collapse
- [x] Label → Queue → Schedule pipeline (hex menu tags flow to Calendar, drag to slots)
- [x] Calendar view: monthly grid, 3 slots/week, drag-to-schedule, undo via ×/click
- [x] Social view: compose bar, LLM-scored posts (Ollama), feed timeline, DM sidebar, insight list
- [x] Conversation overlay: typing indicator, NPC text, player choices, depth meter, insight chips (3 scripted districts)
- [x] GO execution: plays scheduled engagements in order, triggers conversations
- [x] END WEEK: trust erosion, knowledge decay (−4/week), operating deficit (−$0.375B), feed chatter, win/lose checks
- [x] Trust chain: visits → insights → posts → trust deltas → map update
- [x] Blizzard scenario arc: 10 events (weeks 4–44), cinematic overlays, preparation checklist
- [x] All five end-states with cinematic Frostpunk-style ending screen
- [x] EventBus bridge with state bridge (dot-path get/set/update API)
- [x] Modular systems written (bus, state, registry, clock, trust, policy, scenario) — not yet wired into shell

**Remaining:**
- [ ] **LLM-powered conversations** — wire Ollama to generate dynamic conversations from character profiles (the biggest remaining feature; solves the content bottleneck)
- [ ] **Character profiles for all 19 districts** — name, role, traits, knowledge domain (lightweight authoring; LLM generates the dialogue)
- [ ] **Onboarding / Week 0** — scripted first day (§4.0, beats 1–6)
- [ ] **Notebook drawer** — slide-out panel showing all insights, accessible from any view
- [ ] **Insight freshness decay** — insights go stale after ~6–8 weeks, stop grounding posts
- [ ] **Pattern detection** — same category in 3+ districts → pattern → unlocks informed interventions
- [ ] **DM system** — weekly character follow-ups, player replies, trust maintenance
- [ ] **Feed intelligence** — vague/specific gradient based on district knowledge level
- [ ] **Extract systems from shell** — move inline logic to bus-connected modules
- [ ] **Reconcile data sources** — DISTRICTS array in index.html vs. data/entries.js → single source of truth

**Exit:** a tester plays Week 0 through the blizzard; onboarding teaches all views; LLM conversations yield insights; posts are grounded or hollow with visible consequences; all five end-states reachable.

### Phase 2 — Conversation depth & social resonance · ~4–6 wks
Make the LLM conversation system feel alive. **Pick a subset — do not build all at once.**

- **Conversation memory** — the LLM receives previous conversation history on revisits. Characters remember what you said, whether you followed through, how things changed. ("You said you'd look into the heat. That was six weeks ago.")
- **Community asset activation** — ASSET-type insights discovered in listening sessions unlock crisis response options during the blizzard. The pharmacy generator stores insulin; the mosque becomes a warming center; the block association phone tree mobilizes 200 people.
- **Full grounding scoring** — nuanced resonance that rewards tone-matched, insight-backed posts and generates realistic engagement patterns (ratio'd posts, viral grounded posts, quote-post callouts).
- **Feed intelligence** — the feed becomes a real signal layer: early warnings from unvisited districts (vague), specific intel from visited ones, reaction threads on your posts.
- **Trust diffusion** across the transit graph — neglected districts drag their neighbors; trust is contagious in both directions.

**Exit:** conversations feel like relationships, not data extraction; the Social view feels alive and responsive; community assets change disaster outcomes; at least one depth system shipped and legible.

### Phase 3 — Content & authenticity · ~4–6 wks
- Expand character profiles to 3–5 per district with distinct voices, traits, and knowledge domains. (LLM generates dialogue from profiles — authoring is lightweight.)
- Cross-district patterns and the informed/pattern intervention unlock tree (10–15 patterns).
- Events bank toward 25–30 (smaller disruptions between the main blizzard arc).
- LLM prompt tuning: ensure characters stay in voice, don't hallucinate, and reveal insights at the right depth.
- Accessibility pass; copy polish; onboarding tuning based on playtest data.

**Exit:** a full run produces varied, authentic conversations; the city reads as NYC; a new player learns the loop unaided; the disaster feels different depending on preparation.

### Phase 4 — Meta, polish & retention · ~3–4 wks
- **Daily seeded challenge** — same city, same problems, compare trust scores and coverage.
- Shareable end-cards ("You governed NYC. Trust: 62%. Districts never visited: 4. The Bronx remembers.").
- Run history and stats; audio pass; "juice" (screen feedback, conversation animations, map transitions); settings.

**Exit:** a shippable web build with a reason to return tomorrow.

### Cross-cutting (every phase)
- Rebuild and maintain the balance simulator for the new loop.
- Playtest at the end of each phase against the §13 metrics; feed findings back into tuning.
- Maintain the design-pillar test: any new feature that fails pillar #2 (knowledge is earned) or pillar #4 (time is the constraint) gets cut or redesigned.

---

## Appendix A — Reference constants (target)

```
Blocs                5 (Working, Business, Real Estate, Progressives, Labor)
Districts            19 across 6 regions (bronx, mupper, mcore, queens, brooklyn, si)
Term length         ~48 weeks (compressed term)
Disaster arc         Before (~wk 1-30) → During (~wk 30-42) → After (~wk 42-48)
Time slots/week      3–4
Start reserve        $5.0B
Start resilience     40 (all districts — you're new, they're skeptical)
Start knowledge      0 (all districts — you know nothing yet)
Resilience erosion   ~1 pt/district/week if unvisited
Knowledge decay      insights go stale after ~6–8 weeks
Operating deficit    ~$1.5B/month
Evac failure         citywide resilience < 20%
Insolvency           reserve < −$3.0B
Held Together        citywide resilience ≥ 50% at term end
The Resilient City   citywide resilience ≥ 75% at term end (zero preventable casualties)
Target survival      ~15% (blind response) / ~25% (random visits) / ~60% (strategic visits) / ~80% (full HCD loop mastery)
```

## Appendix B — Files

### Game
- `index.html` — **Game shell.** ~4,800 lines. SVG map, hex menu, three-view tabs (Map/Calendar/Social), conversation overlay, LLM-scored posts, blizzard scenario arc, cinematic endings. All systems inline.
- `Mandate Board.html` — **Design reference.** Bundled interactive SVG prototype. Read-only visual DNA.

### Data
- `data/entries.js` — Content graph nodes: 19 districts (with concern weights, vulnerability tags), hazards, infrastructure, blocs, policies, outcomes.
- `data/links.js` — Content graph edges: threatens, mitigates, protects, costs, cascades.

### Systems (modular, bus-connected — built but not yet wired into shell)
- `systems/bus.js` — EventBus with wildcard patterns.
- `systems/state.js` — StateStore with dot-path get/set/update, snapshot/restore.
- `systems/registry.js` — EntryRegistry for content graph traversal.
- `systems/clock.js` — ClockSystem: weekly cadence, deficit, erosion, win/lose.
- `systems/trust.js` — TrustSystem: per-district resilience, bloc aggregates, citywide.
- `systems/policy.js` — InterventionSystem: insight-gated policy tiers (stub).
- `systems/scenario.js` — ScenarioSystem: condition-based weekly events (stub).

### Dev tools
- `graph.html` — Content graph visualizer with D3 force layout.
- `test-llm.html` — Ollama post-scoring test harness.

### Documentation
- `gdd.md` — This document.
- `roadmap.md` — Implementation roadmap with phase checklist.
- `interactions.md` — Interaction specification: every player action traced from input to state change to visual feedback.
- `scenarios.md` — 20 scenario posts with full system traces through the content graph.