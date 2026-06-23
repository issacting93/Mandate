# MANDATE — Design Prompt

## What this is

A web-based political survival game about governing New York City. You're the mayor. You don't build the city — you inherit it, and you don't understand it yet. The core verb is *listening*: you go to neighborhoods, talk to people, learn what they need, and then govern based on what you heard. Get it right and trust builds. Get it wrong — or never bother to listen — and you're governing blind.

The feeling is Frostpunk relocated to the streets: the pressure never stops climbing, you can never be everywhere at once, and every hour spent in one neighborhood is an hour you didn't spend in another. The twist is that the scarce resources aren't just money or approval — they're **time** and **knowledge**. You start the game not knowing what people need. You have to go find out.

---

## The design problem

The game needs a UI that does three things simultaneously:

1. **Shows the city as a living map** — 19 districts across five boroughs, connected by a transit-style network graph. The map is always present underneath everything. It carries two layers of information: how much each district *trusts* you, and how well you *understand* each place. Bright nodes are well-known; dim nodes are blind spots. The map is the conscience of the game.

2. **Surfaces decisions as layered panels** — The player moves through a weekly loop: plan your day, go to the ground, have conversations, set policy, craft your public message. Each phase presents choices that float over the map as modal panels, cards, or conversation interfaces. Resolving a choice animates *down onto* the map — consequence made visible.

3. **Maintains persistent readouts** — Citywide trust, city reserve, the term clock, and the five constituency blocs are always legible. The player should never have to hunt for the state of the game.

The challenge is density without clutter. The game has a lot of state (19 districts, 5 blocs, insights, policies, messages, a budget, a clock) but the interface should feel clean, dark, and focused — never dashboardy. Information reveals on interaction; the resting state is calm.

---

## Visual identity

The visual language blends three references into one system:

### 1. MTA transit map
The NYC subway map's colored route lines and circle-bullet station markers. Districts are nodes on a network, connected by soft transit-style corridors. The map reads like a system diagram, not a geographic rendering. Line bullets (the colored circles with route numbers) are the direct ancestor of the district nodes — glowing colored discs tinted by constituency bloc, sized by population weight.

### 2. In-car strip display
The LED strip above subway car doors — high-contrast glowing text on a near-black ground. This is the reference for all HUD elements: the top resource bar, the bloc coalition strip, the objective panel. Dark panel backgrounds with bright, sparse data. Information as light against darkness.

### 3. Faction-colored territory board
Frostpunk's building-bar and resource-corner framing. Each district belongs to a constituency bloc with a distinct color. The map is a territory board where color tells you who lives where. Resource readouts are pinned to screen edges — always present, never intrusive.

### The result
A **dark, transit-native board**. Near-black background (`#080b10`). Neighborhoods as glowing nodes tinted by bloc color. Corridors as soft transit lines. Panels as frosted-glass overlays with thin borders. Cinematic overlays for major moments (quarter transitions, crises, end screens) in Frostpunk's dramatic "LAW PASSED" style — centered text, decorative horizontal rules with diamond midpoints, pill-shaped action buttons.

---

## Color system

### Background & surface
| Token | Value | Use |
|---|---|---|
| `--bg` | `#080b10` | Canvas, deepest background |
| `--panel` | `rgba(12,16,22,.92)` | Floating panels, frosted glass |
| `--panel-solid` | `#0e1218` | Solid panel variant |
| `--line` | `rgba(255,255,255,.08)` | Dividers, borders, structural lines |
| `--line-bright` | `rgba(255,255,255,.15)` | Hover-state borders, emphasis lines |

### Text
| Token | Value | Use |
|---|---|---|
| `--ink` | `#dce2ec` | Primary text |
| `--ink-bright` | `#f0f3f8` | Emphasized text, titles |
| `--mut` | `#5e6b80` | Muted labels, secondary text |
| `--mut-light` | `#7d8a9e` | Body text in panels, descriptions |

### Constituency blocs (the five factions)
| Bloc | Color | Hex | Identity |
|---|---|---|---|
| Working Families | Cyan | `#2fc3e8` | Outer-borough, immigrant, wage-earning |
| Business & Finance | Indigo | `#7c8cf8` | Midtown, FiDi, employers |
| Real Estate | Red | `#ff6f67` | Developers, landlords, co-op boards |
| Progressives | Pink | `#ff5fa0` | Activists, younger renters, organizers |
| Labor Unions | Amber | `#ffc24d` | MTA, teachers, trades, public sector |

### Semantic
| Token | Value | Use |
|---|---|---|
| `--good` | `#34d399` | Trust gained, positive outcomes, protection |
| `--bad` | `#ff5a52` | Trust lost, damage, danger |
| `--warn` | `#e8a83e` | Caution, approaching threats |
| `--accent` | `#c9a44c` | Gold — achievement, "The Mandate", campaign framing |
| `--frost` | `#7eb8d4` | Weather, environmental threat |

---

## Typography

Two faces from the Space family. No others.

- **Space Grotesk** (400, 500, 600, 700) — All UI text: labels, titles, body, buttons. Geometric, clean, modern. The workhorse.
- **Space Mono** (400, 700) — All numbers, data readouts, countdowns, budget figures, approval percentages. Monospaced for tabular alignment. The precision voice.

### Type scale conventions
- **Micro labels:** 9px, `letter-spacing: .18em`, uppercase, `--mut`, weight 600. Used for category badges, phase labels, section heads. The Frostpunk ALL-CAPS whisper.
- **Body:** 11-12.5px, `--mut-light`, weight 400-500, `line-height: 1.4-1.55`. Panel descriptions, conversation text, card descriptions.
- **Data values:** Space Mono, 10-22px depending on hierarchy, weight 700. Approval percentages, budget figures, countdown numbers.
- **Overlay titles:** 22px, weight 700, `letter-spacing: .06em`, uppercase, `--ink-bright` or semantic color. The dramatic voice for quarter intros and events.
- **Card titles:** 12px, weight 700, `letter-spacing: .02em`. Compact emphasis.

---

## Layout architecture

```
+---------------------------------------------------+
|  TOP BAR  — scenario name | time | approval | $   |  38px, pinned top
|  BLOC BAR — 5 constituency dots with %            |  26px, below topbar
+----------+----------------------------+-----------+
|          |                            |           |
| LEFT     |                            | RIGHT     |
| PANEL    |       PHASER CANVAS        | PANEL     |
| objectives|      (the map)            | district  |
| countdown|      always underneath     | detail    |
| checklist|                            | on select |
|          |                            |           |
+----------+----------------------------+-----------+
|                                                   |
|  BOTTOM CARD TRAY  — slides up for decisions      |
|  policy cards / framing cards / conversation UI    |
+---------------------------------------------------+

   CINEMATIC OVERLAY — full-screen radial vignette
   centered content, for quarter intros / events / end
```

- **Map (z-index 1):** Phaser canvas, always present, always interactive when not occluded. Pan + zoom. Near-black background with colored district nodes and transit-line edges.
- **HUD (z-index 5):** Pointer-events only on child elements — the map shows through the gaps. Top bar, bloc bar, left objective panel, right district detail.
- **Overlay (z-index 20):** Cards slide up from bottom. Cinematics cover everything with a vignette backdrop.

---

## Component inventory

### The map
- **District nodes:** Colored discs (by bloc), sized by population (radius 9 + pop * 3). Each has a glow halo (additive blend, 42% opacity resting, 85% on hover), an optional selection ring, and a label below.
- **Transit edges:** Double-stroked lines connecting adjacent districts. Outer stroke 6px at `#223150` 90% opacity; inner stroke 2px at `#55749e` 75% opacity. Reads as a schematic transit connection, not a road.
- **View modes:** Coalition (bloc colors), Trust (red-yellow-green heat map), Knowledge (bright = recently visited, dim = unknown/stale), Needs (insight icons on visited districts only).
- **Feedback animations:** On policy resolve, affected districts pulse and scale up (1.28x), flash green or red, then settle. Floating +/- numbers rise and fade. On blizzard strike, damaged districts pulse red, protected districts pulse green with a shield effect.

### Top bar
- 38px tall, full width, gradient fade to transparent at bottom.
- Left: "MANDATE" label (9px caps, muted) + season/quarter (Space Mono, 11px, bright).
- Center: Approval star icon + percentage; Reserve diamond icon + dollar amount. Color-coded by threshold (good/warn/bad).
- Right: Weather icon + threat indicator.

### Bloc bar
- 26px tall, directly below top bar. Five items centered, each: colored dot (6px) + name (10px, muted) + approval % (Space Mono, 10px, bright).

### Left objective panel
- 280px wide, pinned top-left below bars. Frosted glass panel (`--panel` with `backdrop-filter: blur(12px)`).
- Sections separated by `--line` borders: countdown timer, infrastructure checklist (hollow circles fill green on completion), public credit pips.
- Scrollable if content overflows.

### Right district detail
- 260px wide, pinned top-right. Hidden by default, slides in on district click (`translateY(8px)` to `none`, 250ms).
- Shows: district name (caps, centered, with subtle background), bloc affiliation (colored dot + name), approval % (large Space Mono number), local concern (italic), and infrastructure protection status.

### Bottom card tray
- Full width, slides up from below on decision phase. Gradient fade to transparent at top.
- Header: phase label (micro caps) + prompt text.
- Cards: flex row, centered, 200-260px each. Dark glass with thin border, hover lifts 4px with shadow. Top accent line appears on hover. Policy cards show title, description, budget delta (green/red), bloc effect arrows, and optional infrastructure tag. Framing cards show title, pitch quote (italic), cost, credit dots.

### Cinematic overlay
- Full-screen radial vignette backdrop (85% center to 97% edges).
- Centered panel: badge (micro caps) > decorative rule (gradient line + rotated diamond) > title (22px caps, colored by type) > decorative rule > body text > optional extras > pill button.
- Button: 20px border-radius pill, transparent background, thin border, caps text. Gold variant for achievement/campaign. Hover fills slightly.

### Toast notifications
- Centered top, appears below the bloc bar. Small frosted panel with colored left border (green for infrastructure). Fades in/out.

---

## Interaction patterns

- **Hover district:** Glow intensifies (42% to 85%), label brightens, node scales to 1.16x. District detail panel appears on the right if clicked.
- **Click district:** Emits selection event, detail panel populates and slides in. Clicking empty space or another district dismisses.
- **Pan map:** Click-drag on empty canvas. Camera bounds enforced.
- **Zoom map:** Scroll wheel, clamped 0.6x to 2.4x, zooms toward cursor position.
- **Card selection:** Click a card, tray slides down and removes. Choice emits to game systems.
- **Cinematic dismiss:** Single pill button. Panel and backdrop fade out (400ms), then remove.

---

## The new systems to design (Phase 1)

The game is transitioning from a card-based decision loop to a **conversation-and-listening** loop. The following UI components need to be designed from scratch, using the existing visual language:

### 1. The morning planner
The start of each week. The player sees the map with districts at varying brightness (knowledge state). They allocate 3-4 time slots to engagements:
- **Mayor Visit** — pick a specific district, go there in person
- **The Mayor is Listening** — hold an open session, broader but shallower
- **Media planning** — spend time with comms team
- **Policy work** — refine a policy response

This could be a bottom tray with slot tokens to drag/assign, a side panel with a schedule grid, or a map-first interaction where you click districts to assign visits. The constraint: it must feel like planning your day on the subway, not filling out a spreadsheet.

### 2. The conversation interface
When you visit a district, you have a short conversation (3-5 exchanges) with a local character. This is the emotional core of the game. The UI needs:
- A character identity (name, role, neighborhood)
- Their opening statement (what's on their mind)
- Player response choices (2-3 options: what to ask about, how to respond, when to move on)
- Revealed insights (specific, concrete problems that surface during conversation)
- A sense of place (the district's character should come through)

This should feel like a conversation, not a dialogue tree menu. It happens *over* the map — the city is still visible behind it. Compact, warm, human. Think Night in the Woods' dialogue beats meets the in-car strip's typographic clarity.

### 3. The notebook / insight tracker
As the player gathers insights from conversations, they accumulate in a notebook. Each insight has a district, category, severity, and freshness (decays over time). When insights from multiple districts reveal the same problem, the player discovers a **pattern**.

This could be a dedicated panel, a layer on the map, or integrated into the district detail view. The key question: how much is an explicit "notebook" vs. baked into the map? An explicit notebook risks feeling like homework; a pure map layer risks being invisible. The answer is probably both — insights show as icons on visited districts, with a pullout panel for the full list.

### 4. The message composer
After gathering insights, the player crafts public messages through their media team. A message has a **claim** (what you say you understand), a **scope** (district / borough / citywide), and an **action** (what you'll do). The power of a message depends on whether it's grounded in real insights you gathered.

This is the resonance test. The UI should make it viscerally clear whether your message matches what you actually heard. A well-grounded message should *feel* solid — perhaps showing the specific conversations that back it up. A hollow message should feel thin, exposed.

### 5. The knowledge layer on the map
A new view mode: districts glow bright when recently visited and well-understood, dim when unknown or stale. Knowledge decays over time — what you learned four weeks ago fades. This is the map's new primary anxiety: not "who's angry" but "where am I governing blind?"

The brightness/dimness should be dramatic. A district you've never visited should feel like a void — not just slightly dimmer, but genuinely unknown. A freshly-visited district should feel warm and alive. The decay should be visible week-to-week as brightness fades.

---

## Tone notes

- **Not cynical, not a civics lecture.** The city is funny and stubborn and specific. The people you meet are recognizable NYC characters treated with affection and a wink.
- **The aesthetic is the subway at night.** Glowing information on a dark field. The feeling of reading the strip map while the train moves beneath you. Calm, legible, a little lonely.
- **Restraint over spectacle.** Animations are functional — they communicate state changes (trust up, trust down, crisis incoming). Juice exists to make feedback feel responsive, not to be decorative.
- **The pressure is in what you can't see.** The dim districts, the stale insights, the conversations you didn't have. The UI should make absence feel heavy. Silence is the threat, not noise.
