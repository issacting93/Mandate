# MANDATE — Game Design Document & Dev Roadmap

*A civic resilience simulation about governing New York City through Human-Centered Design.*

**Status:** Playtest-verified Svelte 5 + Vite app · MapLibre 3D map with snow shader, fog, building frost · 17 components, 13 game systems · DepartmentSystem (6 depts, funding 0–4, pattern bonus) · DealSystem (weighted weekly card draft) · dual-metre system (Resilience + Disorder) · Bento Box policy builder with dept-gated tiles · 11 V2 Disco-style conversation scripts (93 interjections, 14 dice checks) · pattern crystallization (cook-time, de-commit) · playtest logger + in-game systems graph · full 48-week loop, blizzard disaster arc, LLM-scored posts, cinematic endings
**Platforms:** Web (desktop-first, touch-aware) · macOS (SwiftUI, App Store target)
**Doc version:** 0.9 — **Calendar as Blue Prince draft board; two-altitude map; Disco-style conversation panel; all systems wired and playtest-verified**

---

> ## What changed in 0.9 (read this first)
>
> Version 0.9 resolves the three views — Calendar, Map, and Conversation panel — and wires every system end-to-end. The 0.8 department spine is now mechanical, not just designed. Summary:
>
> 1. **The Calendar is now a Blue Prince–style draft board (§4.3).** The monthly grid is gone. Each week the game *deals* 5 district cards from a weighted pool; the player drafts up to 3 into meeting slots. Unvisited districts are **face-down** — you see borough, bloc, a vague rumor, and which department lens would read it, but not who or what until you go. **Funding a department makes its colour-coded cards legible before you commit** — perception literally reads the deck. A re-deal costs 1 slot (Blue Prince discipline). Map-labelling becomes "mark as wanted" (raises deal weight, not guaranteed placement).
> 2. **The Map gains a two-altitude model (§5.2).** Zoomed out = flat top-down node-graph where **knowledge is the loud default** (dim = unknown, bright = known). Select a node → camera descends and pitches into a **scoped 3D cityscape** for that one district. 3D is a reward for focusing, not the default. Edges carry diffusion: bright pulse from strong nodes, dark-red drag from weak ones. Four lens modes demote to one primary (Knowledge) + three summoned overlays.
> 3. **The conversation panel is now a right-aligned, full-height side panel (§8.2)** — Disco Elysium–style. The map stays visible on the left. All 11 districts have V2 conversation scripts with department interjections, dice checks, and solution-jump traps (93 interjections, 14 checks total).
> 4. **All 0.8 systems are wired and playtest-verified.** DepartmentSystem (funding 0–4, effective level with pattern bonus), DealSystem (weighted pool, face-up/down, lens legibility), InsightSystem (pattern cook-time, crystallization, costly de-commit), BentoSystem (dept-gated tiles), MetreSystem (dual Resilience + Disorder). The department spine pays off four ways: conversations (interjections), bento (tile gating), deck (card legibility), and patterns (earned lens +1).
>
> **What 0.8 established (still current):** Disco-inspired conversations, DepartmentSystem as the spine, patterns absorb the Thought Cabinet, bento gated by departments, roguelike two-axis reshuffle. See the 0.8 changelog in version history for those decisions — they are unchanged and not repeated here.
>
> **The spine, now with the draft:** *Departments are the lens you fund → the lens reads the deck (which cards you can evaluate before committing) → the lens shapes what you hear in conversation → the lens determines what you can build → ground-truth understanding crystallizes into patterns that permanently sharpen the lens.*

---

## 1. High concept

You are the Mayor of New York. You inherit a city, but you don't inherit its vulnerability. Disasters don't care about your budget — they care about basements, power lines, and isolated seniors. Nineteen districts across five boroughs, each with fragilities you can't see from City Hall. Your job is to leave the building, walk the neighborhoods, listen to what people actually tell you, and prepare for the worst based on what you learned. To plan for the disaster, you have to know the people who will face it.

Frostpunk's core feeling, relocated from the frozen frontier to the streets: the pressure never stops climbing, you can never be everywhere at once, and every hour spent in one neighborhood is an hour you didn't spend in another. The twist that makes it *human-centered* rather than generic emergency management is that the scarce resources aren't money or supplies — they're **time** and **knowledge**. You start the game not knowing who's vulnerable or why. You have to go find out. When the crisis hits, what you learned — and what you didn't — determines who survives.

This is a pedagogical simulation of Human-Centered Design (HCD) applied to emergency management. The game teaches that disaster resilience isn't built with sandbags and FEMA trailers — it's built with conversations, trust networks, and closing the loop between what vulnerable people say and what emergency planners do.

### The pitch in one sentence
> A civic resilience game where you prepare NYC for disaster by going to the ground, learning who's vulnerable and why, and building the community trust that saves lives when the crisis hits.

**Future direction: roguelike replayability.** Each playthrough currently follows a single blizzard arc, but the design supports reshuffling the disaster type, political landscape, available characters, and rewarded department lens between runs. See §§5.12–5.13. Inspired by *Blue Prince* (Dogubomb) — a roguelike where the mansion rearranges itself between runs, rewarding meta-knowledge over memorization.

---

## 2. Design pillars

These are the non-negotiables. Every feature is judged against them.

1. **Listening before deciding.** The verbs are *go*, *listen*, *learn*, *respond*. You cannot prepare a city from behind a desk. Intervention follows understanding — never the reverse. This is HCD's *Empathize* phase made into gameplay. **The conversation system enforces this literally: promising a fix before you've understood is a mechanical failure (§5.5).**

2. **Knowledge is earned, not given.** You start each term not knowing who's vulnerable or why. Fragilities are revealed through conversations on the ground. A district you've never visited is a district you'll fail when the crisis hits. **What you can even perceive is gated by which departments you've funded — knowledge is earned twice over: by showing up, and by having built the lens to hear.**

3. **Spatial Trade-offs (The Blue Prince Influence).** Policy is a spatial puzzle of priorities, not a budget line. Constructing an intervention means dragging limited components into a constrained grid. **The tiles you can draw are gated by your departments and sharpened by your patterns** (§5.7) — so listening translates directly into spatial advantage.

4. **Unrelenting Pressure (The Frostpunk Influence).** The pressure never stops. The disaster is a ticking clock; every week brings new emergencies, eroding trust, and decaying knowledge. **Every dollar is contested three ways — fund a department to hear better, bank reserve to respond, or spend on a policy now.** The balance between Resilience (Hope) and Disorder (Discontent) is a constant knife's edge.

5. **Authentically New York, earnest and specific.** The people you meet are recognizable NYC characters — subject matter experts on their own survival. **Characters stay specific and hand-authored even under the roguelike reshuffle; what varies is which fragility they surface, not who they are (§5.13).**

---

## 3. Player fantasy & tone

The player is not a technocrat or a populist. They are a person with limited hours in the day trying to understand a city of eight million people, one conversation at a time, before the disaster hits. The emotional arc of a good run is *"I went to the right places, I listened, I learned who was vulnerable and why, and when the crisis came, nobody died because I knew where to deploy."* The bad run is *"I never left City Hall — the storm hit a neighborhood I didn't know existed, and people were trapped because I sent resources to the wrong place."*

Tone: **earnest, gritty, and hopeful.** Not cynical, not comic. Characters are resourceful experts on their own survival — the bodega owner who knows which buildings lose power first, the retired nurse who tracks which seniors live alone, the block association president who already has a mutual-aid plan. The player's job is to defer to their lived experience and translate it into institutional response.

**A note on the Disco influence and tone.** We borrow Disco Elysium's *conversation mechanics* — interjecting lenses, checks where failure opens content — but not its interiority. Disco's skill-voices dramatize one man's fracturing psyche. Mandate's department-voices dramatize an *institution's* selective attention: what a government chooses to fund is what it's able to notice. The voices are not unhinged inner monologue; they are the perspective of a Public Health analyst, a Housing caseworker, an Emergency Management planner — competent people whispering the thing you'd miss. (See §5.5 for the one place we deliberately keep Disco's "a lens can be wrong" idea, and where we don't.)

Tone references: Frostpunk (moral weight, escalating pressure, the cost of not knowing), Disco Elysium (conversation-as-mechanic, perception gated by what you've invested in), *Night in the Woods* (community conversations that reveal systemic problems), *80 Days* (travel-and-talk as core loop, time pressure on routes). The visual world borrows the MTA's design language.

---

## 4. Core loop

*(0.9 restructures the engagement pipeline from label→schedule→execute to **want→deal→draft→execute**. The three-view shell remains (Map, Calendar, Socials), but the Calendar is now a draft board (§4.3), the Map gains a two-altitude model (§5.2), and department funding lives on the Calendar's money zone. The conversation mechanics from 0.8 slot into the draft execution unchanged.)*

### 4.0 Week 0 — "Your First Day" (onboarding)

The game teaches its own loop by letting the player fail the old way first. No tutorial popups — a scripted first day that ends with the player understanding why listening matters.

**Beat 1 — The Briefing.** You're sworn in. Newspaper front page, camera flash, the oath. Your Chief of Staff sits you at the desk with the mayoral briefing: citywide stats, budget numbers, abstract problem categories. It all looks manageable from up here. The map behind the briefing is **entirely dim** — every district gray, unknown.

**Beat 2 — The Desk.** Staff puts a generic citywide housing policy in front of you. Big budget line. The game lets you sign it: mild trust everywhere, strong trust nowhere, significant money spent. The map barely changes. *"Ready for the next one?"* This is the trap.

**Beat 3 — The Interruption.** Your scheduler interrupts: *"Mayor — community board meeting tonight in East Harlem. They've been asking for months. Or we can skip it, there's plenty on the desk."* The game steers you toward going. Desk or ground.

**Beat 4 — The First Conversation.** East Harlem lights up — one bright dot against 18 dim ones. You meet Maria, a tenant organizer. The conversation plays out. **One department lens (Public Health, pre-funded for the tutorial) interjects once** — a single highlighted follow-up that teaches the mechanic by example: *"[PUBLIC HEALTH] Third winter of cold exposure — ask who's elderly in that building."* You take it or type your own. You earn your first **insight**, and if you took the interjection, your first **check insight** (Mrs. Gutierrez, 4th floor, oxygen-dependent). She names the street. She's tired.

**Beat 5 — The Contrast.** Back at City Hall. Your notebook: one or two insights. Beside it, the generic housing policy you signed — $800M, +2 trust everywhere, touched none of this. The game doesn't lecture; it shows the gap. *"That's day one. 47 weeks left. Here's what you know about your city."* One bright node. Eighteen dim.

**Beat 6 — Week 1 begins.** The three views unlock. Calendar shows 3 empty slots **and the department-funding panel (§5.5a), with one department funded and the rest dark** — the same "earn your perception" lesson the map teaches spatially. Social opens with a murmuring feed. *Where do you want to go?*

**What Week 0 teaches without tutorials:**
- The map starts dark — understanding is earned.
- Generic policies work but weakly — the desk is always an option, never the best one.
- One conversation changes everything — and a *lens* changed what you could hear in it.
- The notebook matters — introduced with one entry, not fifty.
- Departments start dark too — perception is something you fund.
- The Social feed is already talking — the city doesn't wait for you.

### 4.3 The Calendar (Draft Board) — *Blue Prince–inspired*

The Calendar is where the week is decided. It answers *what do I spend this week?* across the game's three contested resources: **time** (which districts you visit), **money** (which lenses you fund and which policies you build), and **attention** (which districts you leave unheard).

It is built as a **draft**. Every week the game deals the player a hand of district cards from a weighted pool. The player drafts up to three into meeting slots, lives with the ones they leave behind, and funds departments on the same screen.

**Two zones, left and right:**

- **Zone ① — Draft your week (left).** The dealt hand of district cards, three meeting slots, the week clock. Cards come in two states: **face-up** (visited before — full detail, character, trust, rumor) and **face-down** (never visited — shows borough, bloc, a vague feed rumor, and which department lens would read it). A face-down card whose coded lens is funded to competence gains a **reveal line** — a fragility hint that turns the draft from a guess into an informed read. This is the spine's payoff on the draft: **funding a department literally lets you read the deck.**
- **Zone ② — Fund & spend (right).** Six department funding rows (compact horizontal, stepper controls), the three-way budget bar (perceive/reserve/spent), and GO / Policy Builder / End Week actions. All spending lives here — the Map has no spend controls.

**The deal (DealSystem).** Each week, 5 cards are drawn from a weighted pool of 19 districts. Weights raised by: **wanted markers** (map-labelling raises odds, not guaranteed), **feed heat** (districts with recent chatter), **neglect drift** (unvisited districts gain weight over time). Weights lowered by **recency** (recently visited districts less likely to re-deal). Deal size and weights are tunable.

**Re-deal.** A re-deal discards the hand and draws fresh — but costs 1 of the week's 3 slots. You generally live with the draw.

**Map-labelling → wanting.** The Map's label action is reframed as **"want"** — it raises a district's weight in the deal rather than directly queuing a meeting. The deal, not the player, is the final authority on what's available.

*(Full specification in `mandate-calendar-spec.md`. The late-game question — what fills the hand when everything is visited — is flagged for playtest; mitigations include knowledge-decay re-darkening and the roguelike reshuffle dealing new fragilities.)*

---

## 5. Systems & mechanics

### 5.1 Community resilience (the central resource)
*(Unchanged from 0.7.)* Each of the 19 districts has a **resilience** value (0–100) — not approval, but the neighborhood's confidence that their needs are understood and that collective action works. Built through the chain **show up → listen → understand → act → communicate authentically**. Stored as `trust` in code; displayed as "Resilience." The five constituency blocs (Working Families, Business & Finance, Real Estate, Progressives, Labor) remain as cross-district lenses on the data.

### 5.2 The map — two altitudes, one view

The Map has two altitudes, driven by selection — not a toggle.

**Overview (zoomed out, nothing selected).** Flat top-down node-graph. **Knowledge is the loud default** — the strongest visual encoding the view has. Node brightness ramps near-black→white with knowledge; node size grows with confidence. A dim, small node reads instantly as "I know nothing here." This is the thinking surface — where you read the city and decide where to go.

**Detail (node selected).** Camera descends and pitches (~55°) into a **scoped 3D cityscape** for that one district. The hex menu lives here, at the altitude where you act on a place. 3D is a *reward for focusing*, not the default — which fixes the legibility problem of floating nodes over a whole-city 3D render. The transition between overview and detail is the view's signature moment.

**Edges carry diffusion.** A well-understood, high-trust district sends a flowing bright pulse along its edges to neighbors (knowledge/trust diffusion). A collapsing district shows a dark-red drag. The transit graph is now mechanical, not decorative. *(Honest caveat: edges should render neutral until the TrustSystem actually diffuses across them — animated edges without mechanical backing would be lying.)*

**Lens modes.** Knowledge is the primary, always-on encoding. Resilience, Escalation, and Coalition are **summoned overlays**, not co-equal pills — demoted because they're less decision-relevant for finding vulnerability. The default view has exactly one variable.

*(Full visual specification in the two-altitude map mockup. Implementation: one MapLibre map animating pitch + zoom, with the flat node-graph as a symbol layer that fades as 3D building extrusions rise.)*

### 5.3 Insights (the knowledge system)

**Insights** are the atoms of understanding — specific, concrete, named problems people are dealing with right now. Not visible until you visit or hold a listening session. Each has a district, category, severity, freshness (decays over time), and an optional cross-district link.

**0.8 adds an insight *tier*, determined by how it was surfaced in conversation (§5.5):**

| Tier | How surfaced | Cost to get | Typical content |
|---|---|---|---|
| **Surface** | Stated by the character unprompted | Free — anyone who shows up gets these | "Heat's been out since November." |
| **Lens** | A funded **department** interjected and you followed the thread | Requires the relevant department funded | The rent-stabilization legal angle; the cold-exposure health risk |
| **Check** | Behind a roll: `department funding + die vs. difficulty` | Requires the lens *and* a passed (or interestingly-failed) check | **Community assets** and named vulnerable residents — the highest-value disaster intel |

This is not a new currency — it's a **difficulty gradient on the insight pipeline you already had.** It naturally gates your most decisive disaster intel (assets, §5.3a) behind the deepest listening, which is pillar #2 made mechanical.

When insights from multiple districts reveal the same underlying problem, the player discovers a **pattern** (§5.3b).

### 5.3a Community assets (the hidden resilience)
*(Unchanged from 0.7, with one clarification.)* Community assets are a special insight category: existing neighborhood capacity the mayor didn't build and can't buy, only *discover* — the pharmacy generator storing insulin, the retired nurse checking on seniors, the mosque with AC and a heat-emergency plan. Known assets activate automatically during the disaster; unknown assets are wasted; discovered-and-amplified assets double their protective radius.

**0.8 clarification:** community assets are almost always **Check-tier insights (§5.3)**. They sit behind a department-gated roll, and listening sessions (which surface collective knowledge) give the best odds. This is deliberate: the single most outcome-determining intel in the game is the hardest to hear, and you can only hear it if you funded the lens *and* did the deep listening.

### 5.3b Patterns — the earned lens (this is our Thought Cabinet)

> **Design decision (0.8):** We do **not** build a separate Thought Cabinet. Disco's Thought Cabinet does three jobs — slow-cook commitment, a passive shift in how future dialogue reads, and a soft identity system. Patterns already do the first; departments already do the third. So we give **patterns** the two Thought-Cabinet properties they were missing — cook-time and a citywide perceptual effect — plus a costly de-commit. One spine, no parallel track. The thematic win: convictions feel *institutional and earned-from-the-ground*, not like one person's private psyche.

A **pattern** is a cross-district conviction about how the city actually works — "Systemic Housing Neglect," "Transit Deserts in the Outer Boroughs," "Aging Grid Fragility." Patterns are discovered, not chosen, when enough insights from different districts point the same way (default: 3 insights, same category, different districts).

**Patterns now behave like Thoughts:**

1. **Cook-time.** A newly discovered pattern is *forming*, not active. It crystallizes over **~5 weeks** of game time. During cooking it shows in the notebook as in-progress, with a faint hint of what it might unlock — but no effect yet. (This is Disco's "internalizing a thought," and the delayed, slightly-uncertain payoff is the point.)
2. **Citywide perceptual effect on crystallization.** Once crystallized, the pattern's lens **interjects harder everywhere.** "Systemic Housing Neglect" makes the Housing department's interjections fire more often and at lower funding thresholds in *every* conversation citywide — you now *can't stop* seeing housing fragility, because you understand it as systemic. This is the mechanical heart of the Thought-Cabinet borrow: a conviction changes perception, permanently, until you let it go.
3. **It unlocks/mutates building capacity** — see §5.7. (Replaces the old "pattern unlocks a policy card.")
4. **Costly de-commit.** You can **abandon** a crystallized pattern. This is the one genuinely good Thought-Cabinet idea our old pattern system lacked: commitment is reversible but *costs* something (a chunk of reserve and a few weeks of a "re-cooking" penalty where neither the old nor a new pattern of that category is active). Why you'd do it: a run's real story turns out to be a flood, not housing — you committed your perception to the wrong systemic read, and now you pay to re-aim. This makes the roguelike reshuffle (§5.13) bite: the pattern you'd internalize on instinct from last run may be the wrong lens this run.

**Departments vs. patterns, stated plainly:**
- **Departments** are the **active** lens — what you fund *this term* to hear, adjustable week to week.
- **Patterns** are the **earned** lens — what the ground has *taught* you, slow to gain, costly to drop, citywide in effect.

### 5.4 Engagements (the time system) — *now deal→draft→execute*

*(0.9 replaces label→schedule→execute with the draft pipeline.)* 3 time slots/week (baseline). The engagement pipeline is now: **want** a district on the Map (raises its deal weight) → the **deal** surfaces 5 cards at week start → you **draft** up to 3 into slots → **GO** executes them in order (conversations, stat bumps). Overflow tension remains: you leave 2 cards behind every week. Mayor Visit (deep, one person), The Mayor is Listening (broad, 2–3 people, best for community assets), Intervention planning. Posting is free of slot cost but requires insight to land.

### 5.5 Conversations (the interaction layer) — *Disco Elysium–inspired*

When you visit a district or hold a listening session, you have a **real conversation** with a named character, powered by the local LLM (scripted fallback below). The conversation is where insight is mined — and 0.8 reshapes it around three Disco-derived mechanics, each mapped onto a system you already have.

#### 5.5.1 Departments interject (skills as voices)

In Disco, your skills are voices that butt in — Empathy tells you the man is about to cry, Logic catches the contradiction — and *which skills you've invested in changes what you perceive in the same scene.* In Mandate, **your funded departments are those voices.**

As a character speaks, your funded departments evaluate the line and may **interject** — surfacing a follow-up thread the player would otherwise miss. An interjection renders as a special, visually-marked dialogue option (Doto monospace, department color, bracketed source tag) sitting alongside the free-text input:

> Maria: *"Heat's been out since November. Third winter. Landlord won't return calls."*
>
> — `[HOUSING]` *"Rent-stabilized? Then he's in violation — ask if she's filed with HPD."*
> — `[PUBLIC HEALTH]` *"Third winter of cold exposure. Ask who in the building is elderly or sick."*
> — *(or type your own response)*

Two players with different department funding see **different interjections** in the identical conversation. The Housing player pulls the legal/enforcement thread; the Public Health player pulls the vulnerable-resident thread (which leads toward a Check-tier community asset). This is the core of why listening can't be optimized blind: *the right follow-ups are offered to you by the lenses you chose to build.*

Crucially, **interjections are pre-vetted good listening.** Each one is, by construction, specific, on-topic, a genuine follow-up, and never a jump-to-solution. So taking an interjection is mechanically *safe* listening; free-typing is *riskier* (you might hit a thread no department covers — a real reward — or you might stumble, see §5.5.3). This is how we make "active listening quality" legible instead of an opaque LLM score: good listening is literally the set of options your lenses surface, plus the one rule below.

#### 5.5.2 Checks where failure opens content

Following a thread — especially toward a Check-tier insight (§5.3) — triggers a **check**:

```
roll = department_funding_level + die(1..6)
pass if roll >= insight.difficulty
```

- **Pass:** the character gives up the rare insight — the named vulnerable senior, the pharmacy generator, the block phone tree.
- **Fail — and this is the Disco rule — opens content, never blocks it.** On a failed push, the character *closes that specific thread* but reveals **why**: *"I've told three of you people this. Nothing changed."* That line is itself a (Surface-tier) insight about the district's trust history — and a hook that a *previous administration already knew this and did nothing*, which colors later events. You always learn *something*; failure surfaces *different* knowledge.

Department funding raises your check odds, which is the second reason funding a lens matters: it doesn't just *open* threads (5.5.1), it makes you *succeed* on them.

**Retry rules (borrowed from Disco's white/red distinction):**
- Most checks are **white** — retryable on a later visit, or after you raise the relevant department's funding (you come back with more weight behind the lens).
- A few high-stakes checks are **red** — one shot per term. Fail the red check with a guarded character and that asset stays hidden until next run. Red checks are reserved for the most decisive community assets, to make deep listening feel genuinely consequential.

#### 5.5.3 The one hard rule: don't solve, listen

In both LLM and fallback modes, **promising a fix or proposing a solution before the character has fully opened up is a soft failure.** Depth drops, threads close, and the character deflates: *"...Right. Sure. We'll see."* This is the HCD lesson encoded as the single non-negotiable conversational fail-state — and, not coincidentally, the Mayor-who-promises-everyone-everything is a recognizable, slightly funny civic archetype. It's the one place we hard-code listening quality rather than leaving it to lens-interjections.

#### 5.5.4 Can a lens be wrong?

Disco's low-level skills *lie* — Inland Empire says something unhinged; a weak skill gives a confidently wrong read. We adopt a **narrow, legible** version: a department funded **below a competence threshold** can occasionally surface a **plausible-but-misleading interjection** — a thread that *sounds* right and leads to a low-value or dead-end insight, costing you the exchange. This models real institutional thin-staffing (an under-resourced department gives bad reads) and rewards funding lenses to competence rather than spreading dollars thin. **We deliberately cap it:** above the competence threshold, lenses are reliable. We will not make the player distrust *funded* departments — that would muddy the pedagogy. Wrong reads are a symptom of *underfunding*, surfaced honestly. *(Tunable; defaults in §5.5.7. Flagged in §11 for playtest — if it frustrates more than it teaches, it gets cut.)*

#### 5.5.5 What a single conversation looks like, end to end

1. **Opening.** Character states their surface concern in voice (LLM from profile + this run's live fragility, §5.13). → a **Surface insight**.
2. **Interjections fire.** 1–3 department lenses offer follow-up threads (§5.5.1), alongside free-text input.
3. **You probe.** Take an interjection (safe, lens-gated) or type your own (risky, can reach uncovered threads).
4. **Checks resolve.** Pushing toward rare intel rolls `funding + die` (§5.5.2). Pass → Check insight. Fail → why-they're-guarded insight + closed thread.
5. **The no-solution rule polices your *mode*** (§5.5.3) throughout.
6. **Close.** Character reacts to the whole exchange; insights animate to the notebook; knowledge brightens; the character becomes available for DMs.

#### 5.5.6 LLM integration & the structured return

The LLM plays the character; the player types freely. **Departments and checks are computed deterministically by the game, not by the LLM** — the engine decides which lenses interject (from funding state + the line's topic tags), rolls the checks, and applies the no-solution rule. The LLM's jobs are narrower and more reliable: (a) speak the character in voice, (b) phrase the interjection threads naturally when taken, (c) deliver the pass/fail dialogue. This split is deliberate — it keeps the *mechanically load-bearing* parts (what you can perceive, what you roll, whether you solved-too-early) out of the LLM's hands, which directly addresses the "LLM quality floor" risk (§11): the model handles *prose*, the engine handles *rules*.

After the conversation, the engine assembles the structured result (the LLM contributes the prose fields):

```json
{
  "insights": [
    { "tier": "surface", "category": "HOUSING", "text": "Heat out since November, landlord unresponsive", "severity": 0.6 },
    { "tier": "lens", "source_dept": "public_health", "category": "HEALTH", "text": "Cold-exposure risk concentrated in elderly tenants", "severity": 0.7 },
    { "tier": "check", "source_dept": "public_health", "check": { "difficulty": 7, "roll": 8, "passed": true, "type": "white" },
      "category": "ASSET", "text": "Mrs. Gutierrez, 4F — oxygen-dependent, lives alone", "severity": 0.9 }
  ],
  "trustDelta": 4,
  "depth": 7,
  "soloViolation": false,
  "characterReaction": "Guarded at first; opened up when you asked about her neighbors instead of promising repairs.",
  "followUpHook": "She mentioned a phone tree the block association runs — worth a listening session."
}
```

#### 5.5.7 Fallback behavior (no LLM)

The Disco mechanics are **fully present in fallback mode**, because the load-bearing parts are deterministic. With Ollama unavailable, the character speaks from **scripted dialogue trees**; interjections, checks, and the no-solution rule operate identically (they were always engine-side). The only thing lost is generative prose variety — the *mechanics* are unchanged. This is a meaningful robustness win over 0.7, where fallback was a visibly poorer experience.

**Default tunables (all flagged for the balance harness):** competence threshold for reliable lenses = funding level 2 of 4; below-competence misleading-interjection chance = 15%; white-check retry allowed after +1 funding or next visit; red checks = 1/term, reserved for top-severity assets; pattern cook-time = 5 weeks; pattern de-commit cost = reserve hit + 3-week re-cook.

#### 5.5.8 Listening sessions

Unchanged in purpose (2–3 characters, breadth over depth, primary source of community assets), now with the department layer: **multiple lenses can interject across multiple speakers**, and the cross-talk is where the best Check-tier asset rolls appear (one resident mentions the nurse; your Public Health lens pushes; the check lands). The §11 risk of incoherent multi-character LLM scenes is mitigated the same way as 5.5.6 — the *structure* (who speaks, which lens interjects, what rolls) is engine-driven; the LLM only voices it.

#### 5.5.9 The inbound/outbound symmetry (preserved)

The LLM still serves two mirrored roles: **inbound** (conversations → insights) and **outbound** (posts → resonance, §5.6). The player who listened well has grounded material to post; the player who didn't has nothing to say. 0.8 sharpens the inbound side without touching the outbound side.

### 5.5a DepartmentSystem (new — the game's spine)

Departments existed in 0.7 only as a word ("lenses"). 0.8 makes them a first-class system, because the conversation rework requires funding state, and because departments turn out to be the hub tying conversations, insights, patterns, the bento box, and the roguelike reshuffle together.

**The departments (first-release set — 6, mapped to NYC agencies):**

| Department | NYC analog | Interjects on (topic tags) | Gates bento tiles (§5.7) |
|---|---|---|---|
| **Housing** | HPD | rent, heat, eviction, code, overcrowding | Shelter, warming-center, code-enforcement tiles |
| **Public Health** | DOHMH | elderly, chronic illness, medication, isolation | Medical-cache, clinic, outreach-team tiles |
| **Emergency Mgmt** | NYCEM | flooding, power, evacuation, comms | Generator, evac-route, comms-hub tiles |
| **Transportation** | DOT/MTA liaison | transit, access, road, plows | Plow, access-route, transit-priority tiles |
| **Social Services** | HRA/DFTA | food, childcare, benefits, mutual aid | Liaison/mutual-aid HOW tiles, food-distribution tiles |
| **Sanitation/Infra** | DSNY/DEP | salt, debris, water, grid | Salt-stockpile, grid-hardening, debris tiles |

**Funding.** Each department has a funding level **0–4**. Funding is bought from **reserve** — the *same* reserve drained by the operating deficit (§5.8) and by enacted policies. This is the new economic tension 0.8 introduces:

> Every dollar has three competing homes: **fund a lens** (hear the crisis coming), **bank reserve** (afford to respond when it does), or **enact a policy now** (act on what you already know). You cannot max all three. A player who over-funds perception arrives at the blizzard broke; a player who hoards reserve arrives deaf.

**What funding level does:**
- **0** — dark. The lens never interjects. You are blind in that domain.
- **1** — interjects on the strongest-signal lines only; checks get +1; below competence (misleading-interjection risk active).
- **2** — **competence threshold.** Reliable interjections; checks +2; misleading-interjection risk off.
- **3–4** — interjects readily; checks +3/+4; unlocks the department's efficient bento tiles (§5.7); crystallized patterns of that category push effective level higher still (§5.3b).

**Wiring (events):** see §10.3. In brief: DepartmentSystem owns funding state, answers "which lenses interject on this line and at what check bonus" for ConversationSystem, and answers "which tiles can this player draw" for the bento builder. It imports nothing; it communicates over the bus.

### 5.5b Department Doctrines — The Mayor's Cabinet Skill Tree

*(New in 1.0. Combines Frostpunk 2's competing-law structure with Disco Elysium's thought-as-worldview-shift. The core idea: departments don't just have levels — they have philosophies. Choosing a philosophy changes what you perceive, what you can build, who trusts you, and where your blind spots are when the blizzard hits.)*

**The design problem this solves.** Currently, department leveling is purely transactional — spend money, get better. There's no strategic depth, no political cost, no "this choice will haunt me." The department system is the game's spine (§5.5a), but the spine has no vertebrae.

**The references:**

- **Frostpunk 2:** Laws come in opposing pairs. You pass Tradition or Progress, never both. The faction you sided against radicalizes. Over time, your accumulated choices define an ideology with escalating consequences.
- **Disco Elysium:** Internalizing a thought doesn't just give +1 to a stat — it changes *what you notice*. "Cop of the Apocalypse" makes you see law enforcement everywhere. The thought IS a worldview. You can forget it, but it costs a skill point and leaves a scar.

**How Doctrines work:**

Each of the 6 departments has **two competing doctrines** — mutually exclusive philosophies of how that arm of government should operate. The player chooses when funding a department to level 2. The choice is permanent within a playthrough unless deliberately reversed (costly).

| Dept | Doctrine A | Doctrine B | The Real NYC Tension |
|---|---|---|---|
| **Health** | **Clinical** — hospitals, professional staff, epidemiological triage | **Community** — promotoras, block-level care, local health workers | Scale vs. trust. Clinical deploys faster in crisis but misses who won't go to a hospital. Community knows every patient by name but can't handle mass casualty. |
| **Housing** | **Enforcement** — code violations, landlord penalties, DOB action | **Advocacy** — tenant support, relocation assistance, mediation | Justice vs. safety. Enforcement fixes buildings but tenants fear retaliation for reporting. Advocacy builds trust but landlords face no consequences. |
| **Infra** | **Centralized** — grid hardening, utility coordination, top-down capital | **Distributed** — microgrids, community generators, local resilience | Efficiency vs. fragility. Centralized is cheaper per-unit but creates single points of failure. Distributed is expensive but survives cascading outages. |
| **Safety** | **Enforcement** — NYPD, surveillance, rapid crisis response | **Prevention** — community patrols, social workers, de-escalation | Speed vs. trust. Enforcement responds in minutes but alienates institution-distrustful populations. Prevention builds the relationships that make people call for help — but takes months to establish. |
| **Services** | **Universal** — citywide standardized programs, fair and equal | **Targeted** — hyperlocal, culturally specific, language-matched | Equity vs. efficiency. Universal treats everyone the same but wastes resources on areas that don't need it and misses communities with specific barriers. Targeted serves real need but is politically toxic ("why do THEY get special treatment?"). |
| **Community** | **Formalize** — integrate mutual aid into city protocols, data-sharing agreements, official coordination | **Empower** — fund independently, let communities self-organize, hands off | Coordination vs. autonomy. Formalize makes mutual aid visible to emergency management but communities lose independence and may stop trusting the city with their data. Empower preserves grassroots trust but when the blizzard hits, the city doesn't know what resources exist or where. |

**Mechanical effects of choosing a doctrine:**

1. **Perception (interjections).** Same conversation, different department voice. A Clinical Health lens in South Bronx says: *"Asthma corridor. 3x city average. Hospital capacity: 40 surge beds."* A Community Health lens says: *"One health worker covers 37 homebound residents. She knows every medication schedule."* Both are true. Neither sees the whole picture.

2. **Card legibility (deal system).** Doctrine A and B reveal different aspects of face-down cards. Centralized Infra reveals infrastructure vulnerability ("power substation rated for 2ft surge, built in 1967"). Distributed Infra reveals community capacity ("VFW hall has a generator and 15 vets with training").

3. **Policy tiles (bento).** Each doctrine unlocks its own set of mutated tiles. Enforcement Housing unlocks "Code Strike Force" (expensive, fast results, disorder +3). Advocacy Housing unlocks "Tenant Liaison Network" (cheap, slow results, disorder -2). You can't build both — the tiles are gated by your doctrine choice.

4. **Bloc trust shifts.** Each doctrine is preferred by specific political blocs:

| Bloc | Prefers Doctrine A (Institutional) | Prefers Doctrine B (Community) |
|---|---|---|
| Working Families | — | Health-Community, Services-Targeted, Community-Empower |
| Progressives | — | Safety-Prevention, Housing-Advocacy, Community-Empower |
| Business Coalition | Infra-Centralized, Services-Universal | — |
| Real Estate | Housing-Enforcement, Safety-Enforcement | — |
| Labor | Infra-Centralized (union jobs) | Health-Community (worker solidarity) |

Choosing a doctrine gives **+3 trust with aligned blocs** and **-2 trust with opposed blocs** per district in those blocs. Over a 48-week game, a player who consistently sides with institutional approaches will have high Business/Real Estate trust but low Working Families/Progressive trust — which affects which districts are cooperative vs hostile.

5. **Blizzard outcomes.** When the blizzard hits, each doctrine has a specific **strength** and **blind spot**:

| Doctrine | Strength in crisis | Blind spot |
|---|---|---|
| Clinical Health | Fast hospital surge deployment | Homebound patients who won't/can't reach hospitals |
| Community Health | Block-level check-ins on vulnerable residents | No mass casualty triage capacity |
| Enforcement Housing | Buildings code-compliant, heat violations fixed | Tenants who never reported (fear of retaliation) |
| Advocacy Housing | High trust, residents call for help | Buildings still have code violations — heat still fails |
| Centralized Infra | Grid restored faster citywide | When the grid fails, everything fails at once |
| Distributed Infra | Pockets of power survive grid failure | Slower restoration, gaps between microgrids |
| Enforcement Safety | Faster emergency vehicle dispatch | 30+ residents per district who won't call 911 |
| Prevention Safety | Community self-rescue activates | Slower professional response time |
| Universal Services | Every district gets baseline resources | Resources wasted on areas that don't need them |
| Targeted Services | Perfect fit for communities served | Gaps in communities not profiled |
| Formalize Community | City knows where mutual aid networks are | Networks may have stopped sharing honestly |
| Empower Community | Networks operate at full trust and capacity | City can't coordinate with what it can't see |

**Choosing and switching:**

- **Level 1:** No doctrine. Both branches visible as "potential." Department interjections are generic.
- **Level 2:** Player must choose A or B. Choice is highlighted in the department row on the Draft view sidebar. The chosen doctrine "cooks" for 1 week (Disco's internalization delay) — during this week the department operates at effective level 1 (temporary penalty, like Disco's research debuff).
- **Level 3-5:** Deepens the chosen doctrine. Interjections become more specific, tiles become more powerful, bloc effects compound.
- **Switching:** Costs $0.3B + resets department to level 2 + 3-week cooldown before the new doctrine activates (during which the department operates at level 1). This mirrors Disco's "forgetting a thought" — painful, deliberate, and it leaves a gap. A player who switches doctrine mid-game pays a real price in perception and budget.

**Interaction with patterns (§5.3b):**

Crystallized patterns still give +1 effective level. But the bonus now also respects doctrine: a crystallized HOUSING pattern under Enforcement doctrine strengthens enforcement-specific interjections; under Advocacy, it strengthens advocacy-specific ones. The pattern is the same systemic insight — "Systemic Housing Neglect" — but what you *do* with that understanding depends on your doctrine. Same data, different worldview.

**Why this matters for the game's thesis:**

The doctrines embody the central tension of real civic governance: institutional competence vs. community trust. Neither side is wrong. Clinical health saves more lives per dollar in a mass casualty event. Community health saves the lives that clinical health can't see. The player who tries to have both is spread too thin. The player who picks one and commits discovers both its power and its blind spots — and the blizzard reveals what they chose not to see.

This is Frostpunk's moral weight married to Disco's perceptual consequence. Your cabinet isn't just funded — it has a philosophy. And that philosophy has a cost.

### 5.6 Social media (the communication system)
*(Unchanged from 0.7.)* Outbound posts scored by the LLM against discovered insights (RESONATING / NOTICED / HOLLOW); inbound feed graded vague→specific by district knowledge; DMs for relationship maintenance. The player who listened has grounded material; the player who didn't gets ratio'd. *(One small future hook: a crystallized pattern could let you post at the **systemic** level — "this is a citywide pattern, not one building" — and resonate across every affected district at once. Flagged, not yet built.)*

### 5.7 Emergency interventions (now gated by departments) — *Bento Box*

> **Design decision (0.8):** 0.7 had two unreconciled "spend understanding to act" mechanics — insight-gated **policy cards** (§10.5) and the spatial **bento box**. We cut the card system entirely. The bento box is the *only* policy interface, and **what you can build flows through departments, not a parallel insight-unlock tree.** One hub.

Interventions are constructed by placing component **tiles** into a fixed **5×5 grid** (your political capital and budget). The three influences resolve cleanly:

- **Which tiles you can draw is gated by department funding (§5.5a).** Generic tiles (bulky, inefficient) are always available. A department at level **3+** unlocks its **efficient** tiles — the Public Health lens that helped you *hear* about the insulin-dependent senior is the same lens that lets you draw the compact "Medical Cache" tile to *help* her. Listening and building run through one system.
- **Crystallized patterns mutate tiles (§5.3b).** A live "Aging Grid Fragility" pattern shrinks your bulky 2×2 "Citywide Generator" into a 1×2 "Medical Power Cache," freeing grid space. Patterns are how *systemic understanding* (not just per-district insight) pays off spatially.
- **Adjacency synergies and conflicts (Blue Prince).** "Medical Cache" next to "Backup Generator" → "Cold-Storage Clinic" (amplified trust, halved casualties). "Police Enforcement" next to "Community Mutual Aid" → friction (lower score, anger on the feed). The 5×5 constraint spatializes triage: adding an outreach team to a fourth borough means physically removing the medical cache from the first.

This makes the spine legible end to end: **fund Public Health → hear the vulnerable-senior thread in conversation → draw the efficient Medical Cache tile → pack it adjacent to a Generator for the Cold-Storage Clinic synergy → that block survives the blackout.** Every step is the same lens paying off again.

*(Grid-size and synergy-communication questions remain open — §11.)*

### 5.8 The cost of governing (Frostpunk)
*(Updated for the three-way economy.)* Dual metre (Resilience/Hope must stay high, Disorder/Discontent must stay low; max Disorder = political breaking point before the disaster even arrives). Brutal moral trade-offs on major policies. Knowledge decay. Trust erosion for neglected districts. Operating deficit (~$1.5B/month). **New in 0.8: department funding is a standing draw on reserve** — the three-way contest (perceive / bank / act) is now the central budget decision, replacing 0.7's simpler reserve-vs-policy tension.

### 5.9 Disasters & events (the primary antagonist)
*(Unchanged from 0.7.)* The disaster is the final exam, not a random interruption. The 48-week blizzard arc (10 scripted events, cinematic overlays, weeks 4–44) is the first fully built scenario; hurricane / heat wave / pandemic / infrastructure-collapse are designed for roguelike variation. **0.8 note:** which disaster a run draws becomes one of two reshuffle axes (§5.13), the other being which department lens the run rewards. Cascading failures; policies as circuit breakers; the three phases (Before = reconnaissance, During = "do you know where to deploy?", After = follow-up).

### 5.10 Win / lose
*(Unchanged from 0.7.)* The Resilient City (≥75%), Held Together (≥50%), The Blind Response (<50%), Evacuation Failure (<20% mid-term), Fiscal Crisis (reserve < −$3.0B). **0.8 note:** Fiscal Crisis is now easier to walk into via over-funding departments — intentional; perception has a price.

### 5.11 Difficulty & balance
*(Extended.)* The 0.7 axes hold (coverage pressure, listening pressure, blind-response penalty, optimal play ~80%). 0.8 adds:
- **Perception pressure:** a player who over-funds departments to hear everything but banks no reserve should fail at the disaster (deaf-but-broke is as bad as blind). Target: over-funding perception ≥3 departments to level 3+ before week 30 risks Fiscal Crisis.
- **Lens-match pressure (roguelike):** a player who funds last run's winning lens without re-listening this run should underperform — the rewarded lens reshuffled (§5.13).
- **Check-economy:** Check-tier assets should be gettable with ~2 well-funded relevant departments + deep listening, not require maxing all six.

### 5.12 Candidates & political opposition (future)
*(Unchanged from 0.7.)* 2–3 rival candidates per run, reactive in the feed, approval-vs-resilience as a second axis. *(0.8 hook: a candidate could attack your department-funding mix — "the Mayor poured millions into 'listening' while reserves ran dry" — turning the perceive/bank/act tension into political content. Flagged.)*

### 5.13 Roguelike structure (future) — *now two reshuffle axes*

Inspired by *Blue Prince*: the rooms rearrange, but the rules don't. The 0.8 conversation rework gives the reshuffle a cleaner, stronger shape by separating **what's constant** from **what varies** more sharply than 0.7 did.

**What stays constant (the rules, and the people):**
- **Characters stay specific and hand-authored.** Maria is always Maria, in her own voice. *We do not procedurally swap the cast* — that was the 0.7 plan and it fights pillar #5 (specificity). Knowing "go to Maria" is fine; it shouldn't tell you what she'll surface.
- The conversation rules, the department system, the spine.

**What reshuffles (two primary axes + supporting):**
1. **Which fragility each character surfaces.** Same Maria — but this run her building's live crisis is heat; next run it's a flood-prone basement; next run a broken elevator stranding shut-in seniors. *Same person, same voice, different thing to discover by listening.* This defeats memorization without sacrificing specificity, because the **insight** is what varies, not the **character**.
2. **Which department lens the run rewards.** A blizzard run rewards Emergency Mgmt + Sanitation/Infra + Public Health; a heat-wave run rewards Public Health + Social Services; a pandemic rewards Public Health + Social Services + Housing (overcrowding). So between runs, the *same character* surfaces a *different fragility*, **and** the *departments worth funding to perceive it* shift. A returning player who reflexively funds last run's lens, or who re-commits last run's pattern (§5.3b), is aiming an old lens at a new city — and pays the de-commit cost to re-aim.
3. *(Supporting, from 0.7:)* disaster type, district concern weights, starting bloc hostility, timeline pressure.

**What persists across runs:** meta-knowledge (the *rules* — that lenses gate perception, that listening sessions surface assets, that solving-too-early fails); a cosmetic legacy score; unlocked disaster types. **No mechanical carryover** — no permanent funding, no kept patterns. Each run you re-fund, re-listen, re-learn the city. That's the point: HCD's empathy phase made mechanically un-skippable.

**Why these two axes are the right ones:** they're orthogonal (fragility varies *what's true*; lens-reward varies *how to perceive it*), they're both expressed through systems you already built (insights and departments), and together they make the *Blue Prince* promise literal — the player who's done five runs understands the **system** deeply but genuinely **cannot predict the city**.

---

## 6. Content scope (current → target)

| Content type | Built | First-release target | Notes |
|---|---|---|---|
| Districts | 19 | 19 | Complete |
| V2 conversation scripts (Disco-style) | **11** | 19 (1+ per district) | **93 interjections, 14 dice checks across 31 exchanges** |
| Characters w/ conversations | **11** | 19 | 8 districts have no conversation (direct stat bump on visit) |
| Department definitions | **6** | 6 | Funding 0–4, interjection rules, tile-gating, effective level with pattern bonus |
| Dice checks (difficulty, white/red) | **14** | ~30–50 | Gating community assets + named vulnerable residents |
| Insight templates / district | ~6–9 | 8–12 (~150–230) | Tiered surface/lens/check (§5.3) |
| Concern weights / district | 19 | 19 | Drives scoring + deal weights |
| Bento tiles (generic + dept-gated) | **27** | 30–40 | **7 tiles dept-gated (level 2–3 required), card tiers cut (§5.7)** |
| Synergy rules | **7** | 10–15 | Adjacency-based, amplify resilience |
| Conflict rules | **4** | 8–12 | Adjacency-based, spike disorder |
| Cross-district patterns | 0 (auto-detected) | 10–15 | Cook-time + crystallization + de-commit wired (§5.3b) |
| Scenario events (blizzard) | 10 | 15–20 | Full arc built |
| LLM system prompts | 2 | 3–4 | Conversation prompt *prose-only* (rules are engine-side) |
| Feed chatter templates | ~10 | 80–120 | Knowledge-graded |
| DM templates / character | 1 | 3–5 | |

---

## 7. Development history
*(Unchanged from 0.7.)* The card loop (retired) → the spatial layer (retired) → the Mandate Board (design reference) → the game shell (`index.html`, current playable prototype). 0.8 is a design revision; no prototype history change.

---

## 8. UX & interface

*(0.7 §8 remains current for persistent elements, visual treatment, and quality floor. 0.8 adds two interface pieces.)*

### 8.2 Conversation UI — right-aligned Disco panel

The conversation panel is a **right-aligned, full-height side panel** — Disco Elysium–style. It slides in from the right edge with 16px margin and rounded corners; the map stays visible on the left through a semi-transparent overlay. 420px wide (capped at 40vw). NPC text in Space Grotesk; key statements with the red left-border accent. **Interjections and checks:**
- **Interjection options** render distinctly from free-text: Doto monospace, a bracketed department source tag (`[PUBLIC HEALTH]`), and the department's color as a left border. They sit *above* the always-present free-text input — visible as offered threads, not forced choices.
- **Checks** show a brief, legible roll moment: the department's funding contribution + the die, against the difficulty. Pass and fail both animate; **fail visibly opens the "why they're guarded" line** rather than greying out — reinforcing that failure is content.
- **A misleading interjection** (underfunded lens, §5.5.4) looks identical to a real one *in the moment* — the cost is paid when it dead-ends. (Legible in retrospect via the notebook, which tags the dead-end to the underfunded department, teaching "fund to competence.")
- **The no-solution soft-fail** surfaces as the character's deflation line and a small depth-drop indicator — never a modal scold.

### 8.4 Calendar as draft board (replaces the monthly grid)

Two-zone layout. **Left zone (draft):** slim week clock (WK 01/48 + progress track + season label), 3 draft slots across the top (filled slots show district/character/trust, empty show dashed outline), the dealt hand below as a card grid (3 columns). Face-up cards: white background, trust number, character avatar, italicized rumor quote. Face-down cards: dark hatched background, ⌖ marker, vague rumor, lens indicator (dim if unfunded, lit + outlined if funded to competence with a fragility reveal line). Wanted cards carry a red ★ ribbon. Re-deal button above the hand. **Right zone (money):** three-way budget bar (perceive / reserve / spent), six department rows (horizontal, compact: name + agency tag, 4-pip meter with competence notch after pip 2, funding value, stepper with inline cost), then GO / Policy Builder / End Week stacked.

### 8.5 Map — two-altitude transition

Overview: flat top-down SVG node-graph, knowledge-brightness encoding (near-black→white), borough labels, edge diffusion animations, lens switcher (Knowledge primary, Resilience/Escalation/Coalition as summoned overlays), knowledge legend. Detail: on node select, camera pitches to ~55° and zooms into scoped 3D building extrusions for that district, hex radial menu appears, back button returns to overview. Right panel shows district detail (trust, knowledge bar, rumor/hint, wanted status). The transition is pitch+zoom on a single MapLibre map, not two renderers.

---

## 9. Art direction & audio
*(Unchanged from 0.7.)* Mandate Board visual language: warm cream (`#ececea`), single red accent (`#ff2d2d`), grayscale neutrals, knowledge-brightness dimming, Space Grotesk + Doto. **0.8 note:** department colors are the one sanctioned expansion of the palette beyond red — used *only* for interjection tags and the funding panel, where distinguishing six lenses by hue is load-bearing. Everywhere else the grayscale-plus-red discipline holds.

---

## 10. Technical architecture

*(0.7 §§10.0–10.2 remain current: Svelte/Vite shell, SVG/MapLibre map, EventBus bridge, Ollama integration with the inbound/outbound split, data-driven content, save/restore. The key 0.8 architectural principle is stated in §5.5.6 and reinforced here:)*

> **0.8 architectural rule — rules are engine-side, prose is LLM-side.** Everything mechanically load-bearing in a conversation — which departments interject, the topic-tag matching, check rolls, the no-solution detection, insight tiering — is computed deterministically by game systems. The LLM only generates *prose* (character voice, naturally-phrased interjection threads, pass/fail lines). This is what makes the Disco mechanics survive fallback mode intact (§5.5.7) and directly retires the "LLM quality floor" risk for anything that affects outcomes.

### 10.3 New & changed systems

**DepartmentSystem** (`systems/department.js`) — **new, the hub**
Owns per-department funding state (0–4). Answers two queries for other systems and emits funding events. Imports nothing.

| Listens to | Emits |
|---|---|
| `ui.departmentFunded {dept, level}` | `department.funded {dept, level, reserveDelta}` |
| `conversation.lineSpoken {topicTags}` (query) | `department.interjections {dept, threads[], checkBonus, misleadingRisk}` |
| `pattern.crystallized {category}` | `department.lensSharpened {dept, effectiveBonus}` |
| `bento.draftStarted` (query) | `department.availableTiles {tiles[]}` |

**ConversationSystem** (`systems/conversation.js`) — **substantially revised**
Now orchestrates the interjection/check loop. On each NPC line, it tags the line's topics, asks DepartmentSystem which lenses interject, renders those threads alongside free-text, resolves checks deterministically, enforces the no-solution rule, and tiers the resulting insights. The LLM is called only for prose.

| Listens to | Emits |
|---|---|
| `engagement.started` | `conversation.loaded {character, fragility}` |
| `conversation.lineSpoken` → (queries DepartmentSystem) | `conversation.interjectionsOffered {threads[]}` |
| `ui.conversationMessage` / `ui.interjectionTaken` | `conversation.exchange {response, depthDelta, checkResult?}` |
| `ui.conversationEnd` | `conversation.ended {insights[tiered], trustDelta, soloViolation}` |
| | `insight.discovered {tier, source_dept?}` (per insight) |

**InsightSystem** (`systems/insight.js`) — **revised for tiers + Thought-Cabinet patterns**
Stores tiered insights; tracks freshness; detects patterns. **New:** patterns now *cook* (delayed crystallization), emit a citywide perceptual effect on crystallization, and support costly de-commit.

| Listens to | Emits |
|---|---|
| `insight.discovered {tier}` | `insight.recorded` |
| `clock.weekStart` | `insight.staled`; `pattern.cooking {progress}`; `pattern.crystallized {category}` |
| `ui.patternAbandoned {patternId}` | `pattern.abandoned {reserveDelta, recookWeeks}` |

**Bento/PolicySystem** (`systems/policy.js`) — **revised: card tiers removed, department-gated**
The insight-gated *card* tiers from 0.7 §10.5 are cut. Tile availability now comes from DepartmentSystem; pattern crystallization mutates tiles. Adjacency synergy/conflict resolution on the 5×5 grid is unchanged in spirit.

| Listens to | Emits |
|---|---|
| `bento.draftStarted` → (queries DepartmentSystem) | `bento.tilesAvailable` |
| `pattern.crystallized` | `bento.tileMutated {from, to}` |
| `ui.bentoPlaced {tile, cell}` | `bento.synergy {type}` / `bento.conflict {type}` |
| `ui.bentoEnacted` | `policy.resolved {trustDeltas, budgetDelta, casualtyMods}` |

**DealSystem** (`systems/deal.js`) — **new in 0.9**
Deals 5 district cards per week from a weighted pool. Weights: wanted markers (+), feed heat (+), neglect drift (+), recency (−). Determines face-up/down state from district visit history. Queries DepartmentSystem for lens legibility on face-down cards.

| Listens to | Emits |
|---|---|
| `clock.weekEnd` (triggers next deal) | `deal.dealt {hand[]}` |
| (queries DepartmentSystem for legibility) | |

*(EngagementSystem, KnowledgeSystem, SocialSystem, OnboardingSystem, ScenarioSystem carry forward from 0.7 with no structural change. ConversationSystem's revision is the largest; DepartmentSystem and DealSystem are the genuinely new files.)*

### 10.4 State model (additions for 0.8)

```javascript
{
  // ...all 0.7 state carries forward...

  // NEW: department funding (the active lens)
  departments: {
    housing:        { level: 0 },   // 0–4
    public_health:  { level: 1 },   // tutorial starts this at 1
    emergency_mgmt: { level: 0 },
    transportation: { level: 0 },
    social_services:{ level: 0 },
    sanitation:     { level: 0 },
  },

  // REVISED: insights now carry a tier + source
  insights: [
    // { id, district, category, severity, freshness, discoveredAt,
    //   tier: "surface" | "lens" | "check",
    //   source_dept: "public_health" | null,
    //   check: { difficulty, roll, passed, type: "white"|"red" } | null,
    //   description }
  ],

  // REVISED: patterns are now Thought-Cabinet-like
  patterns: [
    // { id, category, requiredInsights, contributingInsights[],
    //   state: "cooking" | "crystallized",
    //   cookProgress: 0..1,           // advances ~1/5 per week
    //   crystallizedAt: null | week,
    //   citywideLensBonus: 0 | n,     // applied to source dept's interjection freq + check bonus
    //   recookUntil: null | week }    // set on abandon
  ],

  // bento: tile availability is DERIVED from departments + patterns (not stored as unlock flags)

  // NEW in 0.9: draft board state
  hand: [
    // { districtId, name, boro, bloc, trust, faceUp, wanted,
    //   lensId, legible, rumor, lensReveal, lastVisited, know }
  ],
  wanted: [],   // district IDs marked on the map — raises deal weight
}
```

### 10.5 ~~Insight-gated policy cards~~ — **REMOVED in 0.8**
The 0.7 `tier: generic|informed|pattern` policy-card schema is cut. Policy construction is the bento box only (§5.7), with tiles gated by DepartmentSystem and mutated by crystallized patterns. The content-graph `policy` entries become **tile** definitions tagged with a gating department and an optional pattern-mutation target.

### 10.6 Event flow — one conversation (0.8 detail)

```
engagement.started {district, action}
  └─ conversation.loaded {character, thisRunFragility}
  └─ LOOP per NPC line:
       └─ conversation.lineSpoken {topicTags}
            └─ DepartmentSystem → which funded lenses match topicTags?
                 └─ for each: roll misleadingRisk if dept < competence(2)
                 └─ conversation.interjectionsOffered {threads[] (1–3), free_text}
       └─ player picks an interjection OR types
            └─ IF interjection toward check-tier insight:
                 └─ roll = dept.level (+ pattern bonus) + die(1..6)
                 └─ pass → insight.discovered {tier:"check"}
                 └─ fail → insight.discovered {tier:"surface", "why-guarded"}; thread closes
                    (white: retry next visit / after +funding; red: locked this term)
            └─ IF player typed a SOLUTION before depth threshold:
                 └─ soloViolation = true; depthDelta negative; threads close
            └─ ELSE free-text on-topic → possible lens/surface insight
  └─ conversation.ended {insights[tiered], trustDelta, depth, soloViolation, followUpHook}
       └─ knowledge.updated; dm.available
       └─ InsightSystem checks: did this complete a pattern's requiredInsights?
            └─ if yes → pattern.cooking {progress:0} (crystallizes ~5 weeks later)
```

### 10.8 Swift/macOS port
*(Carries forward from 0.7. 0.8 impact: the Swift port must add `DepartmentSystem.swift` and revise `ConversationSystem`/insight models to match. Because the Disco mechanics are engine-side and deterministic, they port cleanly — no reliance on LLM behavior. The card-tier policy code is removed to match the web cut.)*

---

## 11. Open design questions

### Resolved in 0.8
- ~~**Conversation system design.**~~ Disco-inspired: department interjections + content-opening checks + the no-solution rule (§5.5).
- ~~**Listening-quality opacity.**~~ Replaced by lens-surfaced options (safe listening) + the single hard no-solution rule. No black-box scoring of "good listening."
- ~~**Thought Cabinet — build it or not?**~~ Not separately. Patterns absorb the role (cook-time + citywide perception + costly de-commit, §5.3b). Departments are the active lens; patterns the earned lens.
- ~~**Bento vs. card duplication.**~~ Cards cut. Bento is the only policy interface, gated by departments (§5.7).
- ~~**LLM quality floor for outcomes.**~~ Mechanics are engine-side; LLM is prose-only (§5.5.6, §10.3). Fallback keeps the mechanics intact.
- ~~**Conversation length control.**~~ Interjection threads are finite and checks resolve threads; combined with the no-solution rule and character fatigue, conversations self-limit without an artificial turn cap.
- ~~**Roguelike: specificity vs. anti-memorization.**~~ Characters stay constant; their *fragility* and the *rewarded lens* reshuffle (§5.13).

### Still open
- **Department count & granularity.** Six feels right for legibility, but does it cover the disaster types? A pandemic run leans heavily on Public Health + Social Services — are two lenses enough to make that run feel distinct, or does it need a 7th (e.g., a "Communications/Trust" lens)? Playtest per disaster type.
- **Can-a-lens-be-wrong (§5.5.4) — keep or cut?** The underfunded-lens misleading interjection is pedagogically honest (thin-staffed agencies give bad reads) but risks frustration. Default 15% below competence; **must playtest whether it teaches "fund to competence" or just feels unfair.** Cut-bar: if testers distrust *funded* lenses, remove entirely.
- **Red checks — how many, how punishing?** One-shot locked-until-next-run assets create real stakes but also real feel-bad on a failed roll. What share of community assets should be red vs. retryable white? Probably very few (the most decisive 2–3 per run).
- **Pattern cook-time & de-commit cost.** 5 weeks / reserve-hit-plus-3-week-recook are guesses. Cook-time too long and patterns never pay off in a 48-week term; de-commit too cheap and the roguelike lens-reshuffle loses its bite.
- **Three-way economy balance.** Perceive / bank / act is the central new tension. Where are the failure cliffs? (Over-funding → Fiscal Crisis; under-funding → deaf at the disaster.) The balance harness must model all three explicitly.
- **Interjection volume.** 1–3 lenses per line — does a fully-funded player drown in bracketed options? Cap per line? Prioritize by severity/relevance? Risk: the safe lens-options crowd out free-typing, and players stop writing.
- **Surfacing the "why" of a misleading dead-end.** The notebook tags dead-ends to the underfunded department — is that legible enough to teach, or do players just feel cheated and not connect it to funding?
- **(Carried from 0.7, still live):** insight staleness curve; feed as gameplay vs. flavor; DM depth; listening-session coherence; model selection/latency; candidate AI quality; bento grid size; approval-vs-resilience coupling.

---

## 12. Risks
*(0.7 risks carry forward. 0.8 adds/sharpens:)*

| Risk | Likelihood | Mitigation |
|---|---|---|
| **Players drown in interjection options, stop free-typing** | Med | Cap interjections/line; keep free-text always primary in layout; playtest the option-vs-typing ratio |
| **Underfunded-lens "wrong reads" feel unfair, not instructive** | Med | Cap to below-competence only; notebook attribution; hard cut-bar if it backfires (§11) |
| **Three-way economy too punishing — players feel they can't afford to perceive** | Med | Tune funding costs; ensure level-2 competence is reachable for 2–3 depts by mid-term on careful play |
| **Department system adds cognitive load on top of an already-rich loop** | Med | The funding panel is one screen; departments *replace* the vague "lenses" hand-wave rather than adding a wholly new concept; onboarding funds one for you |
| **Removing policy cards strands existing content** | Low | 0.7 policy entries convert to bento tiles with a gating-department tag; mechanical, not creative, rework |
| Conversations feel repetitive/shallow | Med | Interjections + fragility-reshuffle keep the *same* character fresh across runs; engine-side variety |
| LLM hallucination affecting outcomes | **Low (down from Med)** | **Outcomes are engine-side; LLM is prose-only (§5.5.6)** |

---

## 13. Success metrics & playtesting
*(0.7 metrics carry forward. 0.8 adds:)*
- **Lens-driven listening:** do players fund departments *before* visiting, and does funded-lens coverage correlate with Check-tier insight discovery? (If players ignore departments and still succeed, the spine isn't load-bearing — redesign.)
- **The three-way economy:** distribution of reserve across perceive/bank/act at week 30. Are players finding the tension, or defaulting to one strategy?
- **Pattern commitment:** do players let patterns crystallize and feel the citywide perceptual shift? Do they ever pay to de-commit? (De-commit usage is the tell that the roguelike lens-reshuffle is biting.)
- **No-solution rule legibility:** post-run, can players articulate *why* a conversation went cold? (The pillar-1 test — did they learn that solving-too-early fails?)
- **Wrong-lens teaching (if kept):** do players connect dead-end interjections to underfunding, and respond by funding to competence?

---

# Dev roadmap

*(Phases 0–5 from 0.7 carry forward. 0.8 inserts the conversation/department rework as the spine of Phase 1's remaining work and reorders two items. Only the changed parts are shown.)*

### Phase 1 — The listening loop · **~80% → revised target**

**Phase 1 status as of 0.9 — the spine is wired.** What's done and what remains:

**Done:**
1. ✅ **DepartmentSystem** — funding 0–4, effective level with pattern bonus, tile gating, conversation interjections
2. ✅ **V2 conversation system** — 11 districts with Disco-style interjections, dice checks, solution-jump traps
3. ✅ **Department funding UI** — integrated into Calendar draft board (Zone ②)
4. ✅ **Pattern crystallization** — cook-time (5 weeks), crystallization (+1 dept effective level), costly de-commit
5. ✅ **Bento gating** — 7 tiles require dept level 2–3; insight + dept requirements checked together
6. ✅ **Calendar draft board** — DealSystem, face-up/face-down cards, lens legibility, re-deal mechanic
7. ✅ **Conversation panel** — right-aligned, full-height Disco-style side panel

**Remaining:**
- **Two-altitude map** — knowledge-as-default encoding, select-to-descend transition, edge diffusion (designed, not built)
- **Onboarding Week 0** — 6-beat tutorial (designed in §4.0, `onboardingComplete` hardcoded true)
- **8 remaining district conversations** — UES, LIC, Lower Manhattan, Downtown Brooklyn, Bushwick, Jamaica, Mid-Island, Riverdale have no conversation scripts
- **Misleading interjections** (§5.5.4) — below-competence departments giving plausible-but-wrong reads
- **Pattern/Notebook UI** — players can't yet view forming/crystallized patterns or abandon them
- **Listening sessions** (§5.5.8) — multi-character variant
- **Feed intelligence** — graded vague→specific by district knowledge
- **LLM conversation mode** — Ollama integration for free-form dialogue (scripted fallback works)

**Revised exit:** a tester plays Week 0 → blizzard; deals and drafts each week on the draft board; funds departments and *feels* the perceive/bank/act tension; sees face-down cards become legible as lenses are funded; sees different interjections based on funding; passes/fails checks where failure still teaches; commits a pattern and feels the citywide lens sharpen; builds a department-gated bento policy; reaches all five end-states.

### Phase 5 — Roguelike, candidates & bento · **revised**
The bento box is **no longer introduced here** — it moves into Phase 1 as the (now department-gated) policy interface. Phase 5 keeps: roguelike run variation (now explicitly the **two-axis** reshuffle — fragility + rewarded lens, §5.13), legacy/persistence (meta-knowledge only), candidates (with the optional department-funding-attack hook), and the cross-disaster-type balance pass (now including per-disaster lens-reward tuning).

### Cross-cutting (every phase)
*(Unchanged, plus:)* maintain the **engine-side-rules / LLM-prose-only** discipline as a hard architectural invariant — any feature that pushes outcome logic into the LLM gets redesigned. Maintain the design-pillar test; the new spine must always answer "does the player understand why they could or couldn't perceive/build this?"

---

## Appendix A — Reference constants (0.8 additions)

```
Departments              6 (Housing, Public Health, Emergency Mgmt, Transportation, Social Services, Sanitation/Infra)
Department funding range  0–4 (2 = competence threshold; 3 = unlocks efficient bento tiles)
Misleading-interjection   15% chance below competence (level < 2); 0% at/above   [TUNABLE]
Check formula             dept_level (+ pattern bonus) + die(1..6) >= difficulty
Check types               white (retryable after +1 funding or next visit) / red (1 per term)
Insight tiers             surface (free) / lens (dept-gated) / check (dept-gated + roll)
Pattern cook-time         ~5 weeks to crystallize                               [TUNABLE]
Pattern de-commit cost    reserve hit + 3-week re-cook penalty                  [TUNABLE]
Three-way economy         reserve funds: department levels | banked reserve | enacted policies
--- (0.7 constants below, unchanged) ---
Districts 19 · Term ~48 wks · Slots 3–4/wk · Start reserve $5.0B · Start resilience 40 · Start knowledge 0
Operating deficit ~$1.5B/mo · Evac failure <20% · Insolvency <−$3.0B · Held Together ≥50% · Resilient City ≥75%
```

## Appendix B — Files (0.9 current)

```
SYSTEMS (13):
  systems/bus.js               ← EventBus: pub/sub for inter-system communication
  systems/state.js             ← StateStore: dot-path get/set, emits state.changed
  systems/clock.js             ← ClockSystem: weekly cadence, dual-metre win/lose checks
  systems/metre.js             ← MetreSystem: dual Resilience + Disorder, modifier stacks
  systems/trust.js             ← TrustSystem: legacy per-district stacks (superseded by MetreSystem)
  systems/scenario.js          ← ScenarioSystem: Paradox-style condition/effect DSL
  systems/insight.js           ← InsightSystem: freshness decay, pattern detection, cook-time crystallization, de-commit
  systems/intervention.js      ← InterventionSystem: 3-tier policy execution
  systems/bento.js             ← BentoSystem: 5×5 spatial policy builder, dept-gated tiles, synergies/conflicts
  systems/department.js        ← DepartmentSystem: funding 0–4, effective level with pattern bonus, tile gating
  systems/deal.js              ← DealSystem: weighted weekly card draft, face-up/down, lens legibility (NEW 0.9)
  systems/dice.js              ← Dice checks: dept_level × 3 + 2d6 vs difficulty
  systems/schema.js            ← SchemaValidator: JSON Schema for content types (dev tool)
  systems/policy.js            ← PolicySystem: insight-gated tiers (exists, not wired to engine)

COMPONENTS (17 Svelte 5):
  StatusBar, BlocBar, LeftPanel, RightPanel
  MapView, CalendarView (draft board, 0.9), SocialView
  ConversationOverlay (right-aligned Disco panel, 0.9), CinematicOverlay, GameEndOverlay
  HexMenu, BottomNav, Toast, OnboardingOverlay
  BentoBox, GraphView, DepartmentPanel

DATA (7 modules, 117 entries, 332 links):
  districts.js, entries.js, links.js, scenarios.js, interventions.js, tiles.js
  conversations.js (V1 legacy) + conversations_v2.js (11 Disco-style scripts, 93 interjections, 14 checks)

DESIGN SPECS:
  mandate-calendar-spec.md     ← Full Calendar draft board specification
  mandate-calendar-draft.html  ← Interactive Calendar mockup
  (two-altitude map mockup)    ← Interactive Map mockup
```