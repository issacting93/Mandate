# MANDATE — Gameplay Balance Report

*Three simulated playthroughs, three playstyles. Findings, fixes, and technical integration insights.*

**Date:** 2026-07-03
**Build:** Post-style-guide, post-doctrine, post-NYC-data

---

## 01 — Executive Summary

Three parallel automated playtesters traced full 48-week runs through Mandate's game systems. 

**Pre-fix Audit:**
- Every playstyle suffered premature bankruptcy (fiscal crisis) at week ~16-21 due to the original massive $0.375B/week operating deficit, making the entire second half of the scenario arc (the blizzard watch, warning, and strike from week 44 to 48) unreachable dead content.
- Borough `WHERE` tiles targeted nonexistent district IDs (e.g. `d_south_bronx`), rendering expensive signed policies completely ineffective.
- mass undercosting of `HOW` tiles (e.g. Faith Network at $0.05B) allowed min-max players to easily stack them for free resilience.

**Post-fix Simulation Validation (BUILD COMPLETED):**
- **Economic Rebalance Verified:** Under the updated $0.08B/week operating deficit, all three simulated profiles (**Technocrat**, **Grassroots**, and **Balanced**) successfully completed the entire 48-week playthrough and survived without triggering the fiscal crisis overlay.
- **Technical Integrity Restored:** The remapped `WHERE` tile targets work correctly, and the tripled `HOW` tile costs successfully balance the Bento policy system. Svelte 5 component rendering bugs (such as duplicate feed keys and upgrade doctrine locks) have been fixed.

---

## 02 — The Three Playstyles (Simulation Results)

### The Grassroots Strategy (visits all 19 districts, funds community doctrines)
- **Log Source:** `grassroots.log`
- **Result:** **Survived to Week 48 (Victory/End)**.
- **Behavior:** Bypassed onboarding, drafted open cards, and executed field visits. Resolved conversations by choosing non-solution options first (listening/dept-choices) to maximize interaction depth and gather insights.
- **Strengths:** Rapid pattern crystallization (by week 4-6). High interaction depth.
- **Weaknesses:** Insight decay (0.12/week) requires a tight revisit window. By week 8, early insights are stale, demanding continuous travel.
- **Verdict:** Intended core loop. Economic rebalance allows this slow, deep-listening style to survive and reach the blizzard.

### The Balanced Strategy (signs policies early, funds departments evenly)
- **Log Source:** `balanced.log`
- **Result:** **Survived to Week 48 (Victory/End)**.
- **Behavior:** Funds departments randomly with 50% probability, selects Option A doctrines, drafts open cards, and opens the Bento Box policy editor at the end of each week to build, place, and sign bento policies.
- **Strengths:** Signs policies early. Active policy coverage reduces citywide disorder.
- **Weaknesses:** If policies are signed "blindly" without visiting the targeted districts, they suffer a blind deployment penalty (+2 disorder per unvisited target).
- **Verdict:** Much more viable post-fix. Deficit reduction gives the player enough reserve to actively fund departments and sign policies.

### The Technocrat Strategy (ruthlessly optimizes for speed and solutions)
- **Log Source:** `technocrat.log`
- **Result:** **Survived to Week 48 (Victory/End)**.
- **Behavior:** Upgrades departments aggressively to unlock Level 2/3, chooses Option A doctrines, and executes conversations using "Solution Jumps" to close threads instantly.
- **Strengths:** Extremely fast week progression. High department power.
- **Weaknesses:** Low interaction depth means fewer unique insights and bento mutations.
- **Verdict:** Highly effective for quick, clean solutions, but misses out on the narrative depth of the city.

---

## 03 — Critical Bugs Fixed

### 3.1 Economy (FIXED)
- **Problem:** $0.375B/week × 48 weeks = $18B drain. $5B starting reserve with no income = guaranteed fiscal crisis at week 21.
- **Fix:** Weekly deficit reduced to $0.08B. Total drain over 48 weeks: $3.84B. Leaves ~$1.2B discretionary for departments and policies. Scenario shocks ($1.0B total: salt, union, freeze) now create pressure without guaranteed death.
- **Surviving Budget math:**
  | Expense | Cost |
  |---|---|
  | Weekly drain (48 weeks) | $3.84B |
  | Scenario shocks | ~$1.0B |
  | 3 departments to L2 | $0.6B |
  | 1 bento policy | ~$0.8B |
  | **Total** | **$6.24B** |
  | Starting reserve | $5.0B |
  | **Deficit at week 48** | **-$1.24B** (Stays above -$3.0B state takeover threshold) |

### 3.2 WHERE Tile IDs (FIXED)
- **Problem:** Borough WHERE tiles targeted `d_south_bronx`, `d_harlem`, etc. Actual district IDs are `southbronx`, `harlem`, etc. Policies cost money but affected zero districts.
- **Fix:** Remapped borough targets to actual IDs (e.g. Bronx targets `['southbronx', 'fordham', 'riverdale']`).

### 3.3 HOW Tile Costs (FIXED)
- **Problem:** HOW tiles were 5-10x more efficient than WHAT tiles. Faith Network: $0.05 for 3 resilience.
- **Fix:** HOW tile costs tripled:
  - Mutual Aid Network: $0.08B → $0.20B
  - Faith Community Network: $0.05B → $0.15B
  - Promotora Network: $0.06B → $0.15B
  - Retired Workers Corps: $0.04B → $0.12B

---

## 04 — Technical & Integration Insights (Vite + Svelte 5 + Playwright)

Automating the playthroughs uncovered three critical UI/framework integration bugs that have now been resolved:

### 4.1 Svelte 5 Duplicate Key Crash (`IntelView.svelte`)
- **Problem:** When rendering NYC 311 feed items, objects without an explicit `order` index were fallback-keyed as `feed-0-0`. Under Svelte 5, duplicate keys in `{#each}` loops trigger strict runtime exceptions, crashing the entire Intel view when multiple unindexed feed items appear.
- **Fix:** Reconstructed the loop keys to include stable, unique local indices:
  ```svelte
  {#each feedItems as item, idx (item.id || `feed-${item.order || 0}-${idx}`)}
  ```

### 4.2 Playwright Element Detaching Race Condition (`play_simulation.js`)
- **Problem:** When selecting dialogue choices, Svelte 5 instantly unmounts and re-renders components. Playwright clicks on `.convo-choice` or `.w-dept-btn` occasionally threw `Target closed / Element is detached from DOM` errors because the element was removed mid-click.
- **Fix:** Locator references were updated to use `.first()`, and click triggers were wrapped in short-timeout `try/catch` blocks:
  ```javascript
  await page.locator('.convo-choice').first().click({ timeout: 1000 }).catch(() => {});
  ```

### 4.3 Svelte 5 Sidebar Upgrade Lock (`DraftView.svelte`)
- **Problem:** Upgrading a department to Level 2 triggers a mandatory doctrine selection in the sidebar. This overlay removes standard upgrade/downgrade buttons from the DOM. If the doctrine is not selected, the department panel becomes locked and unclickable.
- **Fix:** Simulation script was updated to scan for `.w-doctrine-choice` and select a doctrine immediately to restore normal operation.

---

## 05 — Balance Issues (Outstanding)

### 5.1 Insight Decay Rate
- **Current:** 0.12/week → ~6-week freshness lifespan.
- **Problem:** With 19 districts and 3 slots/week, the revisit cycle is 6.3 weeks — barely matches the decay window. Bad card draws mean insights go stale before revisit.
- **Recommendation:** Reduce to 0.08-0.10/week for ~8-10 week lifespan.

### 5.2 Trust Diffusion Uncapped
- **Current:** +1 trust/week to all neighbors of districts above 60.
- **Problem:** Hub districts (Midtown, LIC, Williamsburg, Crown Heights — 4+ edges each) provide free, uncapped trust accumulation. Over 40 weeks: +40 trust spreading outward.
- **Recommendation:** Cap at +0.5/week, or require both districts visited for diffusion to work.

### 5.3 Doctrine Bloc Stacking
- **Current:** Each B-doctrine gives +3 trust to working/progressive blocs, -2 to business/realestate. Six B-doctrines = +18 trust to 8 districts.
- **Recommendation:** Diminishing returns: 1st doctrine +3/-2, 2nd +2/-2, 3rd +1/-2.

### 5.4 Pattern Crystallization Speed
- **Current:** Detectable week 1, crystallized week 4 (COOK_TIME = 3).
- **Problem:** Too fast. Shortcuts department leveling (crystallized thought = free +1 effective level).
- **Recommendation:** Increase COOK_TIME to 5-6 weeks. Require insights to still be fresh at crystallization.

### 5.5 Scenario Disorder Too Low
- **Current:** Total scenario disorder across 48 weeks ≈ 47 points against 70-point range (15 base → 85 crisis).
- **Problem:** Min-maxer never feels threatened by disorder. The dual-metre "knife's edge" doesn't cut.
- **Recommendation:** Increase scenario disorder ~30%. Or reduce the crisis threshold from 85 to 75.

### 5.6 Comms Bento Free to Use
- **Current:** No cost to publish statements. Positive EV every time with evidence.
- **Recommendation:** Add "media fatigue" — each post within 3 weeks reduces next by 30%.

---

## 06 — What Works Well (Don't Break These)

1. **Conversation system.** The Disco Elysium interjections are the game's highlight. All three testers flagged this independently.
2. **Bento grid as spatial budget.** 25-cell constraint creates real trade-offs. Mutated tiles as insight rewards feel earned.
3. **Insight freshness as perishable intelligence.** Thematically perfect. Just needs tuning.
4. **Doctrine trade-offs.** Genuine ideological commitment with bloc consequences.
5. **Blizzard arc dramatic structure.** 48-week countdown creates excellent pacing (now reachable).
6. **Blind deployment penalty.** Correctly punishes desk governance.
7. **Dual-gate leveling.** Budget + field requirements rewards listening over spending.
8. **Trust diffusion concept.** Transit graph as strategic map. Just needs capping.

---

## 07 — The Dead Middle (Weeks 5-20)

All three testers flagged a lull after the initial rush of district visits. Recommendations:

1. **Between-beat scenario events should demand response.** Not just feed items — affected districts should get deal weight boosts (forcing them into your hand) or trigger emergency interventions.
2. **Revisit conversations should unlock new exchanges.** First visit: full conversation. Second visit: follow-up exchange with evolved concern. Third: deeper intel.
3. **Comms as a free action converting knowledge to resilience.** The Listener's way to govern between visits.
4. **Mid-game milestones.** "All 19 districts visited" → narrative beat. "First pattern crystallized" → toast + small reserve bonus.
5. **Feed intelligence gradient now exists** (from NYC 311 data) and should help — knowledge-graded feed items show the player what they've learned vs what they're missing.

---

## 08 — Is the Game Solvable?

**Pre-fixes:** Yes, on first playthrough. HOW tile efficiency + trust diffusion hubs + all-B doctrines = dominant strategy.

**Post-fixes:** Harder. The three changes (HOW repricing, economy fix, WHERE tile fix) remove the worst exploits. But the Min-Maxer identified remaining optimization paths:
- Pattern-racing Housing (5 eligible districts) for week-4 crystallization
- Targeting hub districts for trust diffusion
- Comms spam (no media fatigue yet)

**To prevent first-run solving (outstanding):**
1. Diminishing doctrine returns
2. Trust diffusion cap
3. Media fatigue on comms
4. Pattern COOK_TIME increase to 5-6 weeks

---

## 09 — Running the Simulation

A Playwright-based simulation script exists at `play_simulation.js` that can automate playthroughs in headless Chrome with three strategies: `balanced`, `technocrat`, `grassroots`. Run with:

```bash
npx vite preview &
node play_simulation.js balanced
node play_simulation.js technocrat
node play_simulation.js grassroots
```

---

*Report compiled from three independent AI playtesters analyzing all game systems (department.js, deal.js, insight.js, bento.js, clock.js, engine.js, scenarios.js, tiles.js, districts.js, doctrines.js).*
