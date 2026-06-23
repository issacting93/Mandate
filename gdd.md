# MANDATE — Game Design Document & Dev Roadmap

*Working title (provisional). A web-based political survival game about governing New York City.*

**Status:** Pre-production · two prototypes built and balance-tested
**Platform:** Web (desktop-first, touch-aware)
**Doc version:** 0.2 — gameplay pivot to human-centered listening loop

---

## 1. High concept

You are the Mayor of New York. You don't build a city — you inherit one, and you don't understand it yet. Nineteen districts across five boroughs, each with problems you can't see from City Hall. Your job is to leave the building, walk the neighborhoods, listen to what people actually tell you, and then govern based on what you learned. Get it right and trust builds. Get it wrong — or worse, never bother to listen — and you're governing blind, passing policies nobody asked for, losing the city block by block.

Frostpunk's core feeling, relocated from the frozen frontier to the streets: the pressure never stops climbing, you can never be everywhere at once, and every hour spent in one neighborhood is an hour you didn't spend in another. The twist that makes it *human-centered* rather than generic policy-management is that the scarce resources aren't just money or approval — they're **time** and **knowledge**. You start the game not knowing what people need. You have to go find out.

### The pitch in one sentence
> A political listening game where you govern NYC by going to the ground, learning what people actually need, and building trust through policies that prove you heard them.

---

## 2. Design pillars

These are the non-negotiables. Every feature is judged against them.

1. **Listening before deciding.** The verbs are *go*, *listen*, *learn*, *respond*. You cannot govern well from behind a desk. The fantasy is a mayor who earns trust by showing up, not a technocrat optimizing from above. Policy follows understanding — never the reverse.

2. **Knowledge is earned, not given.** You start each term not knowing what each neighborhood needs. Needs are revealed through conversations on the ground. A district you've never visited is a district you're governing blind. The map reflects what you know and don't know.

3. **Communication proves you listened.** Messaging is not spin — it's demonstration. When you craft a public message, its power comes from how well it reflects what you actually heard. A message grounded in real conversations resonates; a generic talking point falls flat. People can tell the difference.

4. **Time is the binding constraint.** You cannot be everywhere. Every day spent in the Bronx is a day you didn't spend in Queens. Every town hall you hold is a visit you didn't make. The skill is choosing where your presence matters most *right now* — and accepting that somewhere else is going unheard.

5. **Authentically New York, lightly comic.** The people you meet are recognizable NYC characters — the bodega owner, the community board chair, the MTA rider, the park activist — treated with affection and a wink. Not cynicism, not a civics lecture. The city is funny and stubborn and specific.

---

## 3. Player fantasy & tone

The player is not a technocrat or a populist. They are a person with limited hours in the day trying to understand a city of eight million people, one conversation at a time. The emotional arc of a good run is *"I went to the right places, I listened, I acted on what I heard, and they trusted me for it."* The emotional arc of a bad run is *"I never left City Hall — I governed a city I didn't understand."*

Tone references: Frostpunk (moral weight, escalating pressure, the cost of not knowing), *Night in the Woods* (community conversations that reveal systemic problems), *80 Days* (travel-and-talk as core loop, time pressure on routes), and the deadpan affection of good local NYC journalism. The visual world borrows the MTA's design language — transit-map clarity, line bullets, the glowing in-car strip — as a native NYC vocabulary.

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

- **Click a district node** → a selection ring pulses on the node. Six hexagonal buttons **expand outward** from the node center with staggered delays and `back.out` easing, connected by colored lines. Each hex has its own color:
  - **VISIT** (green) — tag for a Mayor Visit
  - **LISTEN** (cyan) — tag for a Listening Session
  - **POLICY** (purple) — tag for policy work related to this district's needs
  - **POST** (pink) — jump to Social view with a draft post pre-filled about this district
  - **INFO** (gold) — open the district detail panel (trust, knowledge, concerns, infrastructure)
  - **CLOSE** (gray) — dismiss the menu
- **Hover a hex** → it scales up, fill inverts to the action color, label goes dark. The interaction is tactile and alive.
- **Click VISIT, LISTEN, or POLICY** → the district gets **labeled**. The hex menu collapses back to center (`quad.in` easing). The district node now shows a persistent colored badge (a small hex chip in the action's color). A subtle animation pulses outward to confirm. The label flows into the Calendar queue automatically.
- **Click POST** → the hex menu collapses, the view **transitions to Social** with a draft post pre-filled: the district name, its top concern (if known), and a blank claim for you to complete. This is the fastest path from "I see a problem on the map" to "I'm talking about it publicly."
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
- **Labeled districts** show colored hex badges next to the node (green V, cyan L, purple P). Multiple districts can be labeled simultaneously. The map becomes a planning surface — you can see your intentions laid out spatially.
- **View mode tabs** at the bottom switch how nodes render: Trust (red/gray/green), Knowledge (dim/bright), Coalition (bloc colors), Needs (category chips on visited nodes).
- **Left panel:** objective card, infrastructure checklist, map legend.
- **Right panel:** district detail (appears on INFO or selection) — name, borough, bloc, trust (large number), knowledge bar, concern quote, infrastructure status.
- **Events and crises** appear as pulsing nodes, red badges, or a news ticker at the top.

### Calendar view (prioritize + commit)

Two zones side by side:

**Left — the label queue.** Every district you've tagged on the Map, shown as cards. Each card shows: district name, action type (colored hex icon), trust level, knowledge freshness, top concern (if known, or "Unknown — never visited"). Cards are ordered by when you labeled them but can be reordered by drag. Tapping a card's district name jumps to Map with that district selected (for re-examination).

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

### 5.1 Trust (the central resource)

Each of the 19 districts has a **trust** value (0–100). Trust is not approval of a specific policy — it's the district's belief that the mayor understands them and acts on that understanding. Citywide trust is the population-weighted average.

Trust is built through a chain: **show up → listen → understand → act → communicate authentically**. Skip a step and the chain breaks. Act without understanding and trust erodes. Understand but never act and trust stagnates. The player is always managing this chain across many districts simultaneously, with not enough time.

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

The map is the first of three views (see §4 and §8 for full UX). It has **four view modes** (echoing the MTA map's tabs):
- **Knowledge** — bright (recently visited, well-understood) to dim (unknown, stale). The default and primary view.
- **Trust** — red→green heat map of district trust levels.
- **Coalition** — color by dominant bloc.
- **Needs** — icons showing discovered insights (only visible for districts you've visited).

The map's job: **knowledge-made-visible**. The dim districts are the ones that should worry you — not because they're angry, but because you don't know if they are. The map also serves as a persistent minimap strip in the Calendar and Social views, keeping the spatial context always present.

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

When insights from multiple districts reveal the same underlying problem, the player discovers a **pattern** — and better, more targeted policy options unlock.

### 5.4 Engagements (the time system)

The mayor has **3–4 time slots per week**. Engagements are planned in two steps: **label** on the Map (hex menu tags a district with an intent) and **schedule** on the Calendar (drag labels into time slots). You can label more districts than you have slots — the overflow is the game's core tension made visible. Each scheduled engagement costs one slot:

| Engagement | What happens | Knowledge gain | Trust gain | Tradeoff |
|---|---|---|---|---|
| **Mayor Visit** | You go to a specific district. Interactive conversation with 1–2 locals. | High — 1–3 specific insights, deep understanding | Moderate — "the mayor came here" | Narrow: one district only |
| **The Mayor is Listening** | Open session at a location. People from nearby districts show up. | Medium — broader but shallower, 2–4 insights across multiple districts | Low–moderate — less personal | Wide but noisy: you don't control who comes or what they say |
| **Policy work** | Dedicate time to designing or refining a policy response. | None (uses existing insights) | None until enacted | Necessary to unlock better policy options |

Note: posting on social media does **not** cost a time slot — you can post any time. But good posts require insights, which require visits, which cost slots. Communication is free; having something real to communicate is not.

The core tension: you need to listen to govern well, but listening takes time away from governing. And while you're in the Bronx, Brooklyn isn't waiting.

### 5.5 Conversations (the interaction layer)

When you visit a district or hold a listening session, you don't just receive a card — you have a **short conversation**. 3–5 exchanges where you choose:

- **What to ask about** — dig into housing? Transit? Safety? You might miss the thing they most care about if you don't ask the right questions. But you can also just *let them talk* and see where they lead.
- **How to respond** — empathy, curiosity, promises, deflection. Your responses affect how much the person opens up. Someone who feels heard shares more. Someone who feels like a campaign prop clams up.
- **When to move on** — you have limited time. Stay longer and learn more from this person, or move on to hear from someone else?

Conversations are **procedurally assembled** from the district's active concerns, the person's background, and what you've already learned. Repeat visits to the same district surface new people and updated concerns — the neighborhood is alive.

### 5.6 Social media (the communication system)

The Social view is the player's primary communication tool — both outbound (posts) and inbound (feed, DMs). It replaces the old "campaign framing" system with something that feels native and legible.

**Posts** are the outbound mechanic. Composing a post means choosing:
- **Claim** — what you say you understand ("Families in East Harlem are going without heat.")
- **Tone** — empathetic, urgent, celebratory, matter-of-fact. Tone affects who resonates with it (a celebratory tone on a crisis reads as out-of-touch).
- **Policy announcement** (optional) — attach a policy you're enacting to the post.

Posts are scored on **grounding** — is this backed by real insights? The scoring drives visible, diegetic feedback:
- A grounded post gets likes, shares, supportive quote-posts from the districts where you listened. Trust jumps.
- A hollow post (no insights behind it) gets low engagement or gets ratio'd. Mild trust gain at best.
- A contradictory post (you visited, misread the room, and claimed the opposite) gets called out in the replies. Trust damage.

**The feed** is the inbound mechanic. It surfaces:
- Reactions to your posts (the grounding score made visible as engagement)
- District chatter — vague for unvisited districts ("people in Queens are frustrated"), specific for visited ones ("the L train broke down again today in Bushwick")
- Breaking news and events
- Emerging problems you haven't visited yet (early warning if you're paying attention)

**DMs / Chat** are relationship maintenance. Characters you've met in person can message you. Their DMs reference your previous conversations and whether things changed. You can reply — but DMs don't generate new insights. They maintain or erode existing trust. To learn something new, you have to go back in person.

The social view makes the communication pillar tangible: you can see your message land (or not), watch the feed shift as you act (or don't), and feel the difference between speaking from knowledge and speaking from nothing.

### 5.7 Policies (shaped by understanding)

Policies are no longer cards dealt to you. They emerge from your insight map:

- **Generic policies** are always available — blunt instruments that cost more and achieve less. ("Citywide housing initiative" — expensive, unfocused, mild trust gain everywhere, strong trust gain nowhere.)
- **Informed policies** unlock when you've gathered enough insights about a specific problem. The more districts you've heard the same complaint from, the sharper and more effective the policy you can craft. ("Targeted heat enforcement in rent-stabilized buildings in East Harlem, Bushwick, and the South Bronx" — cheaper, focused, strong trust gain in those districts.)
- **Pattern policies** unlock when you discover cross-district links — the highest-value policies, addressing root causes rather than symptoms.

This is pillar #1 in mechanical form: listening before deciding isn't just flavor — it's the system. You literally cannot access the best tools without doing the ground work.

### 5.8 The cost of governing (the Frostpunk clock)

Pressure that never stops:
- **Knowledge decay:** insights go stale. What you learned four weeks ago may not be current. Districts drift, new problems emerge, old ones shift. You have to keep going back.
- **Trust erosion:** districts you haven't visited or acted on slowly lose trust. Silence reads as neglect.
- **Operating deficit:** the city spends ~$1.5B/month just to run. Reserve erodes unless you generate revenue or make hard cuts.
- **Emerging crises:** new problems surface whether you're looking or not. A district you've never visited might be in crisis — and you won't know until you go there or it makes the news (by which point trust has already cratered).

Together these create the knife's-edge: you can never rest, you can never know enough, and the city is always one step ahead of your understanding.

### 5.9 Events

Breaking-news interjections between weeks (~30% chance): a water main break, a viral video, a federal funding announcement, a heat wave. Events can:
- **Reveal** hidden crises in districts you haven't visited (the news tells you, but the district's trust is already damaged because you weren't there first)
- **Validate** your work (you invested in flood prep and the storm passed without damage — but only your visited districts know to credit you)
- **Disrupt** your plans (a crisis in one borough pulls you away from another)

### 5.10 Win / lose

| Outcome | Trigger |
|---|---|
| Re-elected ("Four More Years") | Survive the term with citywide trust ≥ 50% |
| Primaried Out | Survive the term but finish < 50% trust |
| Recalled ("Out of Touch") | Citywide trust drops below 20% mid-term |
| Fiscal Crisis (state takeover) | Reserve falls below −$3.0B |
| The Mandate | Finish with trust ≥ 75% — you didn't just survive, you *earned* it |

### 5.11 Difficulty & balance

The previous simulator validated the old loop's balance. The new loop requires a new balance model centered on:

- **Coverage pressure:** can a player who visits randomly win? (Should be hard but possible — ~25%)
- **Listening pressure:** does a player who visits strategically but never acts win? (Should fail — knowledge without action stalls trust)
- **Governing-blind penalty:** does a player who never visits but sets good generic policies win? (Should be very hard — ~15%)
- **Optimal play:** strategic visiting + informed policies + grounded messaging (~80% win rate)

The balance harness should be rebuilt to model these new dynamics as a first-class dev tool.

---

## 6. Content scope (current → target)

| Content type | Built | First-release target |
|---|---|---|
| Districts | 19 | 19 (depth over breadth — each needs a rich concern pool) |
| Insight templates per district | 0 | 8–12 per district (~150–230 total) |
| Conversation characters | 0 | 3–5 per district (~60–95 total, procedurally assembled) |
| Conversation fragments (lines, topics, reactions) | 0 | 300–400 (mix-and-match across characters) |
| Policy templates (generic) | 0 | 15–20 |
| Policy templates (informed, requiring insights) | 0 | 40–60 |
| Cross-district patterns | 0 | 10–15 |
| Event cards | 8 | 25–30 |
| Post claim templates | 0 | 20–30 (grounded claims tied to insight categories) |
| Feed chatter templates | 0 | 80–120 (district-specific, mood-varied, vague↔specific) |
| DM templates per character | 0 | 3–5 per character (follow-ups, check-ins, escalations) |
| Feed reaction templates | 0 | 30–40 (likes/ratio/callout responses to post types) |

---

## 7. Prototypes already built (Phase 0)

Three prototypes, progressively refining toward the current design:

- **The card loop** (`city-hall.html`): the decision + framing layer with the coalition model, cost-of-governing, events, and all four win/lose states. Validates that communication-as-mechanic works and the difficulty gradient holds. The campaign framing system is the ancestor of the new social/resonance system.
- **The spatial layer** (`city-map.html`): a Phaser district map with pan/zoom, hover/select, three view modes, and policy ripples. Validates that consequence-on-map reads clearly and feels good. Superseded by the Mandate Board's SVG approach.
- **The Mandate Board** (`Mandate Board.html`): the **design foundation** for the game. A polished, interactive SVG map with 19 districts, four view modes (Coalition, Trust, Knowledge, Needs), hexagonal radial action menus, glassmorphic panels, district detail cards, and the complete visual language (light cream theme, red accent, Space Grotesk + Doto typography). This is the reference implementation for the Map view and the visual DNA for all other views.

The Mandate Board establishes the visual identity, interaction patterns, and SVG-based map architecture. The new gameplay systems (conversations, insights, knowledge state, social media) will be built on top of its design language.

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

The panel uses the Mandate Board's glassmorphic treatment: dark header with character name and role, exchanges in Space Grotesk, key statements highlighted with the red left-border accent. Player choices are 2–3 response options that feel natural ("Tell me more about that," "That sounds rough," "I'll look into it") — not strategic menus.

Discovered insights animate in as chips (Doto monospace, colored by category) that fly to the notebook pull-tab. The conversation ends, the panel slides away, the district node pulses brighter (knowledge just increased). If another engagement is scheduled, the map pans to the next district. After all engagements complete, the player is on the Map with fresh insights.

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

### 10.1 Principles (unchanged)

- **Data-driven content.** Districts, insights, characters, conversation fragments, policies, messages, and events are data (entries + links), not code. New content = new entries. The balance harness reads the same data.
- **SVG + DOM, no game engine.** The map is an SVG element with reactive data binding (nodes, edges, glows, opacity). All panels, conversations, and views are plain DOM. No Phaser dependency — the Mandate Board prototype proves SVG handles the map beautifully. CSS handles animations (transitions, keyframes); SVG filters handle glow effects.
- **Save/restore.** Storage-agnostic state layer. In-memory for embedded artifacts; `localStorage` or backend once deployed.
- **Balance simulator** as a maintained CLI tool (Node) — rebuild for the new loop.

### 10.2 Existing systems (carry forward)

These systems survive the pivot with modifications:

| System | Status | Changes needed |
|---|---|---|
| `bus.js` (EventBus) | **Keep as-is** | None — pub/sub backbone for all new systems |
| `state.js` (StateStore) | **Keep as-is** | New state shape (see §10.4), same API |
| `registry.js` (EntryRegistry) | **Keep as-is** | New entry types + link types added to data/ |
| `clock.js` (ClockSystem) | **Rework** | Quarter → week cadence; player-driven, not phase-locked |
| `coalition.js` (CoalitionSystem) | **Rework → TrustSystem** | Bloc approval → per-district trust; decay logic adapts to weekly cadence |
| `policy.js` (PolicySystem) | **Rework** | Policies unlock from insights, not quarter gates; generic/informed/pattern tiers |
| `campaign.js` (CampaignSystem) | **Rework → SocialSystem** | Framing menu → social media posts with grounding-scored engagement |
| `hazard.js` | **Defer** | Disasters fold into the event/crisis system later |
| `infrastructure.js` | **Defer** | Build system paused until core loop is validated |
| `scenario.js` | **Adapt** | Trigger engine reused for weekly events + emerging crises |

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
Assembles and runs conversations. Picks characters from the target district, selects topics from active concerns, branches on player responses. Tracks how much the character opens up (depth meter). Emits discovered insights.

| Listens to | Emits |
|---|---|
| `engagement.started` (visit/listening) | `conversation.loaded` (character, topics) |
| `ui.conversationChoice` | `conversation.exchange` (response, depth change) |
| | `conversation.ended` (insights gained, trust delta) |
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
  gameResult: null,            // "reelected"|"primaried"|"recalled"|"bankrupt"|"mandate"
  
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
                 └─ ui.conversationChoice → conversation.exchange (×3–5)
                 └─ conversation.ended {insights, trustDelta}
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

- **Conversation depth vs. pace:** how long should a single conversation be? Too short and it feels like a menu click. Too long and you only talk to one person per visit. Sweet spot is probably 3–5 exchanges, but needs playtesting.
- **Insight staleness curve:** how fast should knowledge decay? Too fast and the player feels they can never keep up (frustrating). Too slow and there's no pressure to revisit (boring). Probably district-dependent — fast-changing neighborhoods decay faster.
- **Posting frequency:** should there be any cost or limit to posting, or is the constraint purely "you need insights to post well"? Too many posts could feel spammy; too few could make the Social view feel dead. Maybe a soft limit — your media team flags if you're over-posting.
- **Feed as gameplay vs. flavor:** how much of the feed is mechanically significant (early warnings, actionable intel) vs. atmosphere (funny complaints, NYC color)? Both matter, but the ratio affects whether players learn to read the feed strategically.
- **DM depth:** how much back-and-forth should DM conversations support? One reply ("Thanks, I hear you") or multi-turn threads? More depth = more relationship maintenance gameplay, but also more content to write.
- **Lying and spin:** can the player deliberately post about places they haven't visited? The current design says yes, but it backfires (ratio'd). How punishing should the backfire be? Should the game even allow it, or is the option itself the interesting choice?
- **Recurring characters:** should the same people show up when you revisit a district? ("Oh, you're back. That thing I told you about last month? Still broken.") Powerful for emotional weight, adds content complexity. DMs make this more natural — they message you between visits.
- **The notebook as UI:** how much of the insight system is visible to the player as an explicit notebook vs. baked into the map and social view? An explicit notebook is legible but risks feeling like homework. The social feed partially replaces it as a "what do I know" surface.
- **Advisors:** do per-bloc constituency leaders who filter/interpret insights for you add meaningful texture, or do they undercut the "go see for yourself" pillar?
- **Difficulty ramp:** Week 0 is scripted and gentle. But how quickly does complexity scale after that? Should Week 1–4 have fewer active concerns per district (easing in), or should the city already be messy from day one (more Frostpunk)?

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
**Exit (met):** spatial layer proven; coalition model validated; visual language established. The new gameplay direction preserves the map and district model but replaces the card loop with conversations and insights.

### Phase 1 — The listening loop: *"One Week, Playable"* · ~4–6 wks
The single most important phase. Build the three-view shell, the core systems, and the onboarding.

**Shell & views:**
- Build the **tab router** and **status bar** on top of the Mandate Board's existing layout (top bar, bloc bar already built).
- Promote the Mandate Board from static prototype to **live Map view** — wire its SVG nodes, panels, and hex menu to the game state and event bus. The visual design is done; the work is connecting it to systems.
- Build the **Calendar view** in the Mandate Board's visual language: glassmorphic panels, Doto monospace for data, cream background, red accent for active states.
- Build the **Social view** (minimal) in the same language: post composer, feed panel, DM thread list. Grounding scoring simplified for Phase 1 (binary: grounded or not).
- Build the **notebook** as a slide-out drawer accessible from any view, using the left-panel glassmorphic treatment from the Mandate Board.

**Systems:**
- Define the content schema for insights, conversation fragments, characters, and knowledge state (§10.5).
- Rework `ClockSystem` for weekly cadence — player-driven, not phase-locked.
- Build **EngagementSystem**: Mayor Visit and Mayor is Listening, with time-slot budgeting via Calendar.
- Build **ConversationSystem**: procedurally assembled short dialogues from character + district concerns + player choices.
- Build **InsightSystem**: discoveries, notebook integration, freshness decay, cross-district pattern detection.
- Build **KnowledgeSystem**: per-district knowledge state, decay, map brightness integration.
- Rework **CoalitionSystem → TrustSystem**: per-district trust, weekly erosion, citywide computation.
- Build **SocialSystem** (minimal): post composition, basic grounding scoring, feed generation from district concerns.
- Build **OnboardingSystem**: the scripted Week 0 sequence (§4.0), beats 1–6, view unlock at Beat 6.

**Wiring:**
- Trust chain: visits → insights → policy → posts → trust deltas → map update.
- Calendar → Engagement → Conversation → Insight pipeline.
- Social → Post → Grounding → Trust pipeline.

**Content (minimal):**
- Onboarding: 1 district (East Harlem), 1 character (Maria), 1 conversation, 1 insight, 1 generic desk policy.
- Post-onboarding: 4–6 more districts with characters and insights (enough to play a few weeks).
- Feed content: initial city chatter templates, reaction templates for grounded/hollow posts.

**Exit:** a tester plays Week 0 through at least Week 8; the onboarding teaches the three views without tutorials; conversations yield insights; posts generate visible engagement in the feed; trust rises and falls on the map.

### Phase 2 — Conversation depth & social resonance · ~4–6 wks
Make the two signature systems feel alive. **Pick a subset — do not build all at once.**

- **Recurring characters** — named people who remember you, DM you between visits, update you on whether things changed. The DM thread becomes a relationship you maintain.
- **Full grounding scoring** — nuanced resonance that rewards tone-matched, insight-backed posts and generates realistic engagement patterns (ratio'd posts, viral grounded posts, quote-post callouts).
- **Feed intelligence** — the feed becomes a real signal layer: early warnings from unvisited districts (vague), reaction threads on your posts, emerging narrative arcs across weeks.
- **Trust diffusion** across the transit graph — neglected districts drag their neighbors; trust is contagious in both directions.
- **Per-district crises** that fire on the map and demand in-person response (the flood in the Rockaways, the rent strike in Bushwick).

**Exit:** conversations feel like conversations, not menus; the Social view feels alive and responsive; posts have real mechanical teeth; at least one depth system shipped and legible.

### Phase 3 — Content & authenticity · ~4–6 wks
- Fill out the insight pool toward 150+ unique insights across all 19 districts.
- Expand conversation characters to 3–5 per district with distinct voices.
- Cross-district patterns and the informed/pattern policy unlock tree.
- Events bank toward 25–30.
- Accessibility pass; copy polish; onboarding tuning based on playtest data.
- Optional: real NYC geography via GeoJSON neighborhoods rendered in Phaser.

**Exit:** a full run rarely repeats conversations; the city reads as NYC, not as an abstract graph; a new player can learn the loop unaided.

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
Term length         ~48 weeks (compressed 4-year term)
Time slots/week      3–4
Start reserve        $5.0B
Start trust          40 (all districts — you're new, they're skeptical)
Start knowledge      0 (all districts — you know nothing yet)
Trust erosion        ~1 pt/district/week if unvisited
Knowledge decay      insights go stale after ~6–8 weeks
Operating deficit    ~$1.5B/month
Recall threshold     citywide trust < 20%
Insolvency           reserve < −$3.0B
Re-election          citywide trust ≥ 50% at term end
The Mandate          citywide trust ≥ 75% at term end
Target win rates     ~15% (governing blind) / ~25% (random visits) / ~60% (strategic visits) / ~80% (full loop mastery)
```

## Appendix B — Files

- `city-hall.html` — Phase 0 card-loop prototype (decision + campaign + coalition + win/lose).
- `city-map.html` — Phase 0 spatial prototype (Phaser district map, policy ripples, view modes).
- `Mandate Board.html` — **Design foundation.** Interactive SVG map with 19 districts, hex action menu, glassmorphic panels, four view modes. Defines the visual language for the entire game.
- `gdd.md` — this document.