# MANDATE — §4.3 The Calendar (Draft Board)

*GDD section, v0.8.1 — replaces the prior "Calendar view (prioritize + commit)" text. This is the full specification for the Calendar, Mandate's planning surface, rebuilt as a Blue Prince–style draft.*

---

## 4.3.0 What the Calendar is

The Calendar is where the week is decided. It answers a single question — *what do I spend this week?* — across the game's three contested resources: **time** (which districts you actually visit), **money** (which department lenses you fund and which policies you build), and, implicitly, **attention** (which districts you leave unheard). The Map is read-only context; the Social view is communication; the Calendar is the only surface where the player *commits resources*.

It is built as a **draft**. Every week the game deals the player a hand of district cards drawn from a weighted pool. The player drafts up to three of them into their meeting slots, lives with the ones they leave behind, and funds departments on the same screen. The design borrows its core feeling from *Blue Prince*: you choose from a small dealt hand under uncertainty, the choice has real opportunity cost, and you don't fully know what you've picked until you commit to it.

The screen is divided into **two zones**, left and right, because the two decisions read as distinct:

- **Zone ① — Draft your week (left).** The dealt hand of district cards, the three meeting slots, and the small week clock. This is the *time* decision.
- **Zone ② — Fund & spend (right).** The six department funding rows, the three-way money budget, and the GO / Policy Builder / End Week actions. This is the *money* decision.

The two zones are deliberately not merged into one budget. Time is spent in slots; money is spent in dollars; conflating them obscures both. They share the screen because the player's real strategic question lives *between* them — *do I fund a lens to read this hand better, or save the money and draft blind?*

---

## 4.3.1 Zone ① — The draft (time)

### The week clock

A slim header strip: current week (e.g. `WK 01/48`), a thin progress track toward the disaster, and the season/countdown (`January · Blizzard in 47 wks`). This is intentionally demoted — it is a clock, not the surface. The old full-month calendar grid is **removed**; it implied the unit of decision was the *day*, when in fact it is the *week's draft*. Days never carried meaning, so they are gone.

### The slots (what you've committed)

Three slots sit across the top of the zone — the mayor's available meetings for the week. (3 is the baseline; some events or upgrades may grant a 4th.)

- An **empty slot** shows a dashed outline, its number, and "Open slot."
- A **filled slot** shows the drafted district as a compact, face-up card: borough · bloc, district name, the assigned person (name + role), the action type (Visit / Listen) and the district's current trust. A small `×` clears it back to the hand.
- Slots are filled by **dragging a card up from the hand**, or by clicking a card to commit it to the next open slot. A caption tracks progress: *"1 of 3 slots drafted."*

The slots are always face-up and fully detailed — once you've committed, you can see exactly who you're about to meet. The uncertainty lives in the *hand*, before you commit.

### The hand (what you've been dealt)

Below the slots, the dealt hand: **five district cards** this week (the deal size is tunable; see §4.3.4). Cards come in two states.

**Face-up cards — districts you've visited.** Fully legible. They show:
- Borough · bloc, district name, and a freshness line (*"Visited wk 6, knowledge fading"*).
- The current **trust** value (large, top-right).
- A **rumor quote** in the assigned character's voice, pulled from the district's recent state (*"The heat thing is spreading to our block now."*) — a live hook, often a reason to return.
- The **assigned person** (avatar, name, role), so you know who this meeting will be with.

A face-up card is a known quantity. You return to it for follow-through, trust maintenance, or because its rumor signals the fragility is escalating.

**Face-down cards — districts you've never visited.** Rendered with a dark hatched back, signalling "you don't know who's here yet." This is the heart of the Blue Prince borrow: the *first* visit to any district is a leap. But a face-down card is **never blank** — a blank card makes the draft a coinflip, not a decision. It still shows:
- Borough · bloc (you know roughly *where* and *which coalition*).
- District name.
- A **vague feed rumor** (*"Something about the buses, the feed says."*) — atmospheric, low-information, but directional.
- A **lens indicator** — which department lens *would* read this card if funded (see §4.3.3). This is the card's most important tell.

The player drafts a face-down card knowing the borough, the bloc, a rumor, and which lens governs it — but not the person, not the specific fragility, and not the insight tier on offer. Those reveal only when they commit the slot and go.

### "Wanted" markers

Districts the player has flagged on the Map (the old "label" action, §4.2) carry a **★ Wanted** ribbon when they appear in the hand. Wanting a district does **not** place it in the hand directly — it raises its **weight in the deal** (§4.3.4), so wanted districts surface more often. This preserves the Map's labelling loop while making the deal, not the player, the final authority on what's available. You can want a district for weeks and have the deal keep withholding it — which is itself a pressure (the neglected district drifting further out of reach).

### Re-dealing

A **re-deal** control sits above the hand: *"↻ Re-deal costs 1 slot."* If the hand is bad, the player can discard it and draw a fresh one — but it costs one of the week's three slots. This is the Blue Prince discipline: you generally live with the draw, and escaping a bad draw means sacrificing time you can't get back. Re-deal cost (and whether it's available at all in the early game) is tunable; the default makes it a real, rarely-correct option rather than a free reroll.

---

## 4.3.2 Zone ② — Fund & spend (money)

The right zone is the money decision. It carries forward the cleaned-up department panel and adds the policy entry point, so that **all spending lives in one place** — the Map has no spend controls.

### The three-way budget

A single bar at the top of the zone shows reserve allocated across the three competing homes for money:
- **Perceive** — dollars sunk into department funding (lenses).
- **Reserve** — banked, unspent, available for the disaster response.
- **Spent** — committed to enacted policies.

The bar's job is to dramatise the central economic tension: every dollar into "perceive" is a dollar out of "reserve," and a player who over-funds perception arrives at the blizzard broke. At week 1 the bar is almost entirely reserve; it shifts visibly as the player funds lenses, making the trade-off legible in real time.

### The department rows

Six departments, each a compact horizontal row (Health, Housing, Infrastructure, Services, Safety, Community — mapped to NYC agencies). Each row shows, left to right:
- **Name + agency tag** (Health · DOHMH). The agency tag is flavour, kept small.
- **The 0–4 funding meter — the hero of the row.** Four pips fill with the department's colour as you fund it. A vertical **competence notch** sits after the second pip: at or past it, the lens reads reliably; below it, the lens is unreliable (it may surface misleading interjections in conversation, §5.5, and reads the deck poorly, §4.3.3). The meter carries the status, so the truncated "below competence — unreliable reads" sentence that cluttered the old cards is gone — a below-competence row simply gets a coloured left-rule and, optionally, a tiny corner tag.
- **The funding value** (`2/4`) in the data face.
- **A stepper** (`− $0.3B +`) to raise or lower funding, with the next level's cost inline.

Departments are funded from **reserve** — the same reserve drained by the operating deficit and by enacted policies. Funding is the act that moves money from "reserve" into "perceive" on the budget bar. A crystallised **pattern** (§5.3b) of a department's category glows on that department's row, showing the earned lens sharpening the active one.

### The actions

Beneath the department rows, stacked:
- **GO — play out this week.** Commits the drafted slots and plays out each meeting in order (transitions to the Map, conversations overlay). Disabled until at least one slot is drafted.
- **▦ Policy Builder.** Opens the Bento Box (§5.7). Policy construction lives here, in the money zone — not on the Map, where it used to sit as a duplicate entry point.
- **End Week.** Advances the clock (available after GO, or if the player chooses to skip meetings). Triggers knowledge decay, trust erosion, operating deficit, and carries unscheduled wants forward.

---

## 4.3.3 The lens reads the deck (the spine's payoff on the draft)

This is the mechanic that binds the two zones together, and the single most important reason departments and the draft share a screen.

A face-down card is governed by **one department lens** (shown by the lens indicator). How much of that card's back is legible *before the player commits a slot* depends on whether that lens is funded:

- **Lens not funded (or below competence):** the indicator is dim. The card reveals only the base layer — borough, bloc, vague rumor. *"Infrastructure lens would read this"* (greyed). You draft it nearly blind.
- **Lens funded to competence or above:** the indicator is lit, the card gains a coloured outline, and an extra **reveal line** appears — a fragility hint that turns the draft from a guess into an informed read: *"Your Safety lens reads: likely an at-risk-residents fragility — high-value if you go."*

So funding a department pays off **three times** on the same spine: it determines which lenses interject in conversation (§5.5), which efficient tiles you can draw in the Bento Box (§5.7), and now **how well you can read the dealt hand before committing**. Perception you paid for literally improves your draft information. A player who funds Safety doesn't just hear better in Safety conversations — they can *see which face-down cards are worth the slot.* This makes the perceive/bank/act decision in Zone ② immediately, visibly consequential in Zone ①.

It also creates a clean strategic loop: a rumor in the feed hints at a fragility type → the player funds the matching lens → the next deal's matching cards become legible → they draft the high-value one with confidence. The lens turns noise into signal.

---

## 4.3.4 The deal (a new system)

The draft requires the game to decide *what surfaces each week*. This is a genuine system addition, not just UI — call it the **DealSystem** (it may live as a mode of ScenarioSystem rather than a separate file).

Each week, the hand is drawn from a **weighted pool** of all 19 districts. Weights are raised by:
- **Wanted markers** — districts the player flagged on the Map draw with higher weight (but never guaranteed placement).
- **Feed heat** — districts generating chatter or emerging-crisis signals in the feed surface more often, so the feed becomes a leading indicator of the deal.
- **Neglect drift** — districts unvisited for many weeks gain weight over time, so the city eventually *pushes* its ignored corners into your hand (you can avoid a district, but not forever).
- **Scenario pressure** — the active disaster arc can force specific districts into the deal at scripted beats (the early snow squall surfaces Queens districts, etc.).

Weights are lowered by **recency** — a district you visited last week is less likely to be re-dealt immediately, encouraging spread over fixation.

**Deal size** defaults to five cards for three slots — enough that the draft is a real choice (you leave two behind), not so many that it's overwhelming. Tunable per difficulty and per phase (a crisis week might deal fewer, tighter cards).

**The late-game question (open).** As the player visits more of the city, more cards flip face-up and the mystery drains out of the draft. This is partly intended — late in a term the draft *should* shift from "what's behind this door" to "who needs me back, whose trust is decaying, whose rumor just escalated." But it risks the draft going inert once everything's visited. Two mitigations, both flagged for playtest: (a) knowledge decay re-darkens stale districts (a district unvisited long enough partially flips face-down again — you no longer know it as well), and (b) the roguelike reshuffle (§5.13) deals *new fragilities* into known districts, so a face-up card can still surprise. Whether the draft needs active re-mystifying, or whether the late-game freshness/trust layer is enough, is unresolved.

---

## 4.3.5 Transitions

- **Map → Calendar.** Tap the `C` tab, or — when at least one district is wanted — a floating *"Plan your week →"* prompt at the bottom of the Map. The map slides up into the persistent minimap strip; the Calendar slides in. Wanted districts are already weighted into the deal.
- **Calendar → Map.** Tap the `M` tab, or tap a card's district name to jump to the Map with that district selected (to re-examine before committing a slot).
- **Calendar → GO.** With ≥1 slot drafted, GO transitions to the Map; the first drafted meeting begins (map pans to the district, conversation overlays). After each conversation, the map pans to the next drafted slot. After all play out, the player lands on the Map with fresh insights and the drafted cards consumed from the hand.
- **Calendar → Policy Builder.** Opens the Bento Box overlay (§5.7) over the Calendar.
- **Calendar → End Week.** A confirmation overlay summarises what advancing costs (knowledge decay, trust erosion, operating deficit, wanted districts carried forward), then advances the clock and deals the next week's hand.

---

## 4.3.6 What this changes elsewhere in the GDD

For cross-reference, the draft-board Calendar touches these sections:

- **§4.2 (Map):** the "label" action is reframed as **"want"** — it raises deal weight rather than directly queuing a meeting. The Map loses its department list and policy button (now both on the Calendar).
- **§5.4 (Engagements):** the label→schedule→execute pipeline becomes **want→deal→draft→execute**. Time scarcity is unchanged (3 slots); what changed is that the *set of available options is dealt, not freely chosen*.
- **§5.5a (DepartmentSystem):** gains a third query — *"how legible is this dealt card?"* — alongside conversation interjections and bento-tile gating.
- **New DealSystem (§4.3.4):** weighted weekly deal; consumes wanted markers, feed heat, neglect drift, scenario pressure.
- **§10.4 (state model):** add `hand[]` (this week's dealt cards with face-up/down state), `wanted[]` (raised-weight districts), and per-district `lastDealtWeek` for recency weighting.
- **§8 (UX):** the two-zone Calendar layout, the compact meter-forward department row, and the face-down card spec replace the old calendar UI description.

---

## 4.3.7 Design intent, in one paragraph

The Calendar makes the game's central truth physical: **you cannot hear the whole city, and you don't get to choose everything you're offered.** The deal imposes the city's own agenda on you; the three slots force triage; the face-down cards make the first visit a genuine risk; and the funded lens — bought with money you could have banked — is what turns that risk into a read. Every week is a small, legible Blue Prince draw layered over the Frostpunk clock: *here is the hand the city dealt you, here is what you can afford to see clearly, now choose who gets heard before the storm.*
