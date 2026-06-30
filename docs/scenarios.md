# MANDATE — Scenario Posts & System Traces

Updated 2026-06-27.

Post → LLM scores per-district (0-10) based on concern weights → trust deltas → bloc averages →
  citywide resilience → outcome prevention

  Each post activates concern nodes (c_health, c_transit, etc.), which connect to districts via
  cares_about edges (weight ≥ 4 shown in graph). Districts connect to blocs, blocs to hazard exposure,
  and trust levels determine which outcomes materialize during the disaster phase.

  **Note:** The 20 scenario posts below are written for the **blizzard arc** specifically — the first
  and default disaster type. The concern graph, district vulnerabilities, and scoring mechanics apply
  equally to other disaster types (hurricane, heat wave, pandemic, infrastructure collapse), but the
  specific post content, infrastructure references, and seasonal framing are blizzard-specific. See
  the "Multi-Disaster Roguelike" section at the end of this document for how the same graph structure
  serves different disasters.

  ---
  The 20 Scenario Posts — Full System Traces (Blizzard Arc)

  POST 1: "We're pre-positioning plows in every outer borough tonight."

  Tone: URGENT | Phase: Before (week ~28) | Primary concern: c_transit, c_safety

  Graph path:
  Post → c_transit + c_safety
    → HIGH resonance: d_midtown (transit:9), d_jamaica (transit:9), d_washington_hts (transit:8),
  d_staten_island (transit:8), d_fidi (transit:7)
    → MODERATE: d_astoria (transit:5), d_south_bronx (safety:3 — low), d_riverdale (safety:7)
    → Bloc shift: b_working ↑ (transit-dependent), b_labor ↑ (plow crews), b_finance ~neutral
    → Infrastructure activated: p_plows → mitigates h_blizzard (value:20)
    → p_plows → protects [d_south_bronx, d_washington_hts, d_jackson_hts, d_flushing, d_brownsville,
  d_bay_ridge, d_staten_island]
    → Outcome prevention: h_blizzard →(cascades)→ o_transit_shutdown REDUCED
    → Reserve: signals pol_plow_fleet (-$0.8B)
  Net: Strong transit signal. Outer-borough districts see +trust. But misses health/housing concerns
  entirely — South Bronx and Brownsville (highest vulnerability) only weakly resonated because their
  top concerns are health:9 and services:9.

  ---
  POST 2: "Asthma rates in the South Bronx are 3x the city average. We can't let a blizzard turn a
  health crisis into a death toll."

  Tone: CONCERNED | Phase: Before (week ~10, post-insight)

  Graph path:
  Post → c_health (primary), c_infra (secondary)
    → HIGH resonance: d_south_bronx (health:9), d_brownsville (health:9), d_harlem (health:6),
  d_jamaica (health:6), d_les (health:6)
    → Bloc shift: b_working ↑↑ (directly named), b_progressives ↑ (equity signal)
    → District concern edge: d_south_bronx → c_health (weight:9) — maximum activation
    → Trust path: post.published → trust.js #onPost → groundingScore > 0.5 → +2 trust to d_south_bronx
    → If insights exist for South Bronx health: LLM scores higher → larger per-district delta
    → Infrastructure relevance: p_grid (protects d_south_bronx — medical equipment), p_outreach
  (protects d_south_bronx)
    → Outcome prevention: reduces path h_blizzard → o_casualties (condition: severity_high)
  Net: Extremely grounded if player has South Bronx health insight. Resonates deeply with the two most
  vulnerable districts. Weak in transit-heavy districts (Midtown, FiDi, Jamaica score low).

  ---
  POST 3: "Every pharmacy, bodega, and laundromat deserves a backup power plan. Small businesses keep
  neighborhoods alive."

  Tone: OPTIMISTIC | Phase: Before (week ~15)

  Graph path:
  Post → c_services (primary), c_infra (secondary)
    → HIGH resonance: d_brownsville (services:9), d_jackson_hts (services:8), d_harlem (services:8),
  d_flushing (services:7)
    → MODERATE: d_washington_hts (services:6), d_park_slope (services:6), d_bay_ridge (services:6)
    → Bloc shift: b_working ↑ (bodega communities), b_finance ↑ (business continuity), b_realestate
  ~neutral
    → Policy connection: pol_business_continuity (targets d_midtown, d_flushing, d_jackson_hts, -$0.6B)
    → Infrastructure: p_grid (backup power) → mitigates h_blizzard (value:15)
    → Outcome prevention: o_blackout path weakened (businesses as warming points)
  Net: Broad moderate resonance. Hits the services axis hard — an underserved concern in most posts.
  Jackson Heights (Fatima Al-Rashid, bodega owner) would generate a strong DM reaction. Weak on transit
   and safety axes.

  ---
  POST 4: "If the power goes out in NYCHA towers, people on oxygen have hours, not days. We're
  installing backup generators now."

  Tone: URGENT | Phase: Before (week ~25)

  Graph path:
  Post → c_infra (primary), c_health (secondary)
    → HIGH resonance: d_astoria (infra:8), d_midtown (infra:8), d_les (infra:8), d_bed_stuy (infra:8),
  d_fidi (infra:8), d_south_bronx (infra:7), d_harlem (infra:7), d_brownsville (infra:7)
    → Bloc shift: b_working ↑↑ (NYCHA residents), b_progressives ↑ (equity), b_labor ↑ (first
  responders)
    → Infrastructure: p_grid → mitigates h_blizzard (value:15), protects [d_harlem, d_les,
  d_south_bronx, d_jackson_hts, d_bed_stuy, d_brownsville]
    → Policy: pol_grid_harden (tier:informed, -$1.2B, trust: targeted+6, citywide+2)
    → Cascade prevention: h_blizzard →(cascades)→ o_blackout →(affects)→ r_resilience (-9) BLOCKED
    → Outcome chain: o_blackout → o_casualties path severed
  Net: One of the highest-impact posts possible. Touches 8 districts at high resonance via the
  infrastructure concern axis. Directly maps to the most expensive but most protective policy. The
  NYCHA framing activates both health AND infra concern nodes simultaneously.

  ---
  POST 5: "Midtown will be cleared first. Hospitals and transit hubs are the priority."

  Tone: MATTER-OF-FACT | Phase: During (week ~36)

  Graph path:
  Post → c_transit (primary), c_infra (secondary)
    → HIGH resonance: d_midtown (transit:9, infra:8), d_fidi (transit:7, infra:8)
    → LOW/HOSTILE: d_south_bronx, d_brownsville, d_jackson_hts, d_staten_island — all transit-dependent
   but explicitly deprioritized
    → Bloc shift: b_finance ↑, b_realestate ↑, b_working ↓↓, b_labor ↓, b_progressives ↓↓
    → Policy: pol_deploy_manhattan (trust: targeted+3, citywide-4) — NET NEGATIVE
    → Outer-borough erosion: 12 districts see trust DECREASE
    → Outcome: o_casualties risk INCREASES in outer boroughs
    → r_resilience drops via trust erosion → citywide metric tanks
  Net: The classic political trap. Two districts love it, 17 feel abandoned. The -4 citywide trust on
  pol_deploy_manhattan is devastating. This is the post that can trigger evacuation_failure if citywide
   drops below 20. The graph shows exactly why: the threatens edges from h_blizzard to outer-borough
  districts (weight 0.7-0.9) are all UNMITIGATED.

  ---
  POST 6: "I spoke with Maria Delgado from the South Bronx. Her building hasn't had consistent heat in
  three winters."

  Tone: CONCERNED | Phase: Before (week ~8, post-conversation)

  Graph path:
  Post → c_housing (primary), c_health (secondary)
    → HIGH resonance: d_harlem (housing:8), d_jackson_hts (housing:7), d_washington_hts (housing:7),
  d_les (housing:7)
    → STRONG: d_south_bronx (housing:6) — directly named, character referenced
    → Grounding bonus: references specific insight + character → LLM scores significantly higher
    → Trust path: groundingScore likely >0.7 → trust.js applies +2 to d_south_bronx specifically
    → DM trigger: Maria Delgado sends follow-up ("Thank you for listening")
    → Bloc shift: b_working ↑↑, b_progressives ↑
    → Feed: resident reactions from housing-concerned districts
  Net: This is how the insight→post→trust loop works. The conversation with Maria (character in
  entries.js) generated a health/housing insight. Referencing it in the post creates a grounded score.
  The 7 districts with housing ≥ 6 all respond. But no infrastructure or transit signal — doesn't help
  with the blizzard directly.

  ---
  POST 7: "We're stockpiling road salt in every borough depot. Simple, visible, effective."

  Tone: MATTER-OF-FACT | Phase: Before (week ~20)

  Graph path:
  Post → c_safety (primary), c_transit (secondary)
    → MODERATE resonance: d_riverdale (safety:7), d_williamsburg (safety:7), d_flushing (safety:6),
  d_upper_east (safety:6), d_park_slope (safety:6), d_bay_ridge (safety:6)
    → Infrastructure: p_salt → mitigates h_blizzard (value:10)
    → p_salt → protects [d_riverdale, d_flushing, d_bay_ridge, d_staten_island, d_brownsville]
    → Policy: pol_salt_reserve (-$0.3B, trust: targeted+3, citywide+1) — CHEAP
    → Reserve impact: minimal drain
    → Bloc shift: b_working ↑ (modest), b_realestate ↑ (property protection)
  Net: Low-cost, broad-but-shallow impact. Salt is the cheapest infrastructure ($0.3B). It protects 5
  districts but only mitigates blizzard by 10 points. Good for maintaining reserve while keeping trust
  stable. Doesn't hit the high-vulnerability districts hard enough (Brownsville health:9, services:9
  don't match salt messaging).

  ---
  POST 8: "Every community center will become a resilience hub — backup power, medical supplies,
  communication equipment."

  Tone: OPTIMISTIC | Phase: Before (week ~22)

  Graph path:
  Post → c_infra (primary), c_services (secondary), c_health (tertiary)
    → HIGH resonance: d_brownsville (infra:7, services:9), d_harlem (infra:7, services:8),
  d_south_bronx (infra:7, services:5), d_astoria (infra:8), d_jackson_hts (services:8)
    → Policy: pol_resilience_hubs (tier:informed, -$0.4B, trust: targeted+5, citywide+2)
    → Targets: [d_south_bronx, d_brownsville, d_harlem, d_jackson_hts, d_bed_stuy]
    → Bloc shift: b_working ↑↑, b_progressives ↑↑, b_labor ↑
    → Feed: positive reactions from 5 target districts
    → Outcome prevention: strengthens community self-organization during disaster phase
  Net: Excellent cost/benefit ratio at $0.4B. Hits 5 high-vulnerability districts. The triple-concern
  activation (infra+services+health) is rare — most posts only activate 1-2 axes. This one maps to the
  informed tier policy, meaning it requires insights to unlock.

  ---
  POST 9: "Transit workers are heroes. We're authorizing overtime and hazard pay for every essential
  worker through the storm."

  Tone: URGENT | Phase: During (week ~37)

  Graph path:
  Post → c_transit (primary), c_safety (secondary)
    → HIGH resonance: d_jamaica (transit:9), d_midtown (transit:9), d_washington_hts (transit:8),
  d_staten_island (transit:8)
    → Bloc shift: b_labor ↑↑↑ (directly addressed), b_working ↑ (essential workers = their neighbors)
    → Policy: pol_overtime (-$0.6B, trust: targeted+4, citywide+1)
    → Bloc exposure: b_labor → h_blizzard (exposed_to weight:0.7) — reduces personal exposure narrative
    → Feed: Ramon Vega (Astoria, retired MTA mechanic) DM reaction
    → Outcome: o_transit_shutdown severity reduced (staffing)
  Net: Strong labor play. The b_labor bloc has the highest personal-exposure narrative ("first
  responders and essential workers"). Naming them directly maps to the exposed_to edge in the graph.
  Jamaica and Midtown transit hubs are the cascade points — if transit fails there, o_transit_shutdown
  fires and hits r_resilience for -6.

  ---
  POST 10: "We failed. Brownsville lost power for 72 hours and we didn't have enough generators. I'm
  sorry."

  Tone: CONCERNED | Phase: After (week ~43)

  Graph path:
  Post → c_infra (primary), c_health (secondary)
    → COMPLEX resonance: Brownsville (infra:7, health:9) — directly named
    → Honesty signal: LLM may score higher for accountability (depends on insight grounding)
    → Trust path: RISKY — acknowledgement of failure can go either way
      → If grounded (player had insights, tried but infrastructure wasn't built): moderate positive
      → If hollow (player never visited Brownsville): negative — seen as empty words
    → Outcome materialized: o_blackout → r_resilience (-9) already applied
    → Bloc shift: b_progressives complex (accountability valued), b_working ↓ (anger at neglect)
    → Feed: angry reactions from unvisited districts, empathetic from visited ones
  Net: This is the post-disaster accountability moment. The graph shows o_blackout → r_resilience at
  -9. If Brownsville was never visited (know = 0), the post is hollow — trust erodes further. If
  visited and the grid simply wasn't built in time, the honesty may slightly recover trust. The
  o_invisible_success node (resilience -2, but +10 with credit claim) is the alternative path the
  player missed.

  ---
  POST 11: "Door-to-door check-ins start tomorrow. If your neighbor is elderly or disabled, let us
  know."

  Tone: URGENT | Phase: Before (week ~30, warning phase)

  Graph path:
  Post → c_health (primary), c_services (secondary)
    → HIGH resonance: d_south_bronx (health:9), d_brownsville (health:9, services:9), d_harlem
  (services:8)
    → Infrastructure: p_outreach → mitigates h_blizzard (value:7), protects [d_south_bronx, d_harlem,
  d_brownsville, d_bed_stuy]
    → PREREQUISITE: p_outreach requires p_warning — if early warning not built, outreach can't deploy
    → Policy: pol_outreach (tier:informed, -$0.3B, trust: targeted+7, citywide+2) — HIGHEST TARGETED
  TRUST
    → Bloc shift: b_working ↑↑, b_progressives ↑↑
    → Outcome prevention: directly blocks h_blizzard → o_casualties path
  Net: The highest targeted trust gain (+7) of any policy, and only costs $0.3B. But it's informed tier
   (requires insights) AND requires p_warning infrastructure as a prerequisite. The graph.html edge
  p_outreach → p_warning [requires] makes this a two-step unlock. If the player didn't build the
  warning system first, this post is pure rhetoric.

  ---
  POST 12: "Property values don't matter if the building collapses. We're mandating flood-proofing
  retrofits."

  Tone: MATTER-OF-FACT | Phase: Before (week ~18)

  Graph path:
  Post → c_housing (primary), c_infra (secondary)
    → HIGH resonance: d_harlem (housing:8), d_jackson_hts (housing:7), d_washington_hts (housing:7),
  d_les (housing:7), d_williamsburg (housing:6), d_south_bronx (housing:6)
    → Bloc shift: b_realestate ↓↓ (mandates = cost), b_progressives ↑↑ (equity), b_working ↑
    → Graph edge: c_mandate → b_re [angers] — directly mapped
    → Graph edge: c_climate → b_re [angers] — reinforces
    → Graph edge: c_justice → b_prog [pleases] — activated
    → Policy connection: maps to informed/pattern tier interventions
    → Feed: Real Estate bloc pushback, Progressive praise
  Net: A politically polarizing post. The graph.html explicitly has c_mandate → b_re [angers] as an
  edge. Real estate bloc trust drops. But housing-concerned districts (6 of them at weight ≥ 6) all
  gain trust. This is the equity-vs-economy tradeoff the game is built around. If b_realestate trust
  drops too low, it affects reserve via property tax revenue.

  ---
  POST 13: "Schools will double as emergency shelters. Every parent should know their nearest safe
  point."

  Tone: MATTER-OF-FACT | Phase: Before (week ~28)

  Graph path:
  Post → c_safety (primary), c_services (secondary)
    → HIGH resonance: d_park_slope (safety:6, services:6), d_riverdale (safety:7), d_brownsville
  (safety:5, services:9), d_bay_ridge (safety:6, services:6)
    → Infrastructure: p_shelter → mitigates h_blizzard (value:10), protects [d_south_bronx,
  d_brownsville, d_harlem, d_bed_stuy]
    → PREREQUISITE: p_shelter requires p_evac [in graph.html: p_shelter → p_evac [requires]]
    → Policy: pol_shelters (-$0.5B, trust: targeted+6, citywide+3) — BEST CITYWIDE TRUST
    → Bloc shift: b_working ↑ (families), b_progressives ↑
    → Outcome prevention: o_displacement reduced (shelter capacity)
  Net: pol_shelters has the highest citywide trust bonus (+3). The school-as-shelter framing hits the
  services axis (underutilized by most posts). Park Slope (Angela Rizzo, school nurse) would generate a
   character DM. The shelter→evacuation prerequisite chain means evacuation plans must exist first.

  ---
  POST 14: "The models just converged. A major nor'easter will hit in 5 days. This is not a drill."

  Tone: URGENT | Phase: Warning (week ~33)

  Graph path:
  Post → c_safety (primary)
    → BROAD resonance: all 19 districts respond to safety threat
    → But shallow: safety scores vary widely (riverdale:7, upper_east:6, south_bronx:3)
    → Infrastructure: p_warning → mitigates h_blizzard (value:8)
    → If p_warning NOT built: this post has no infrastructure backing — pure fear signal
    → Bloc shift: all blocs ↑ (unified threat), but temporary
    → Feed: generates urgent chatter in ALL districts
    → Scenario system: aligns with inlined blizzard-arc event at ~week 33
  Net: A pure urgency post. Wide reach but shallow depth. The critical variable is whether p_warning
  (Early Warning System) infrastructure exists. With it: the post amplifies a real system. Without it:
  the LLM will score it as hollow panic. The graph shows p_warning connecting to 5 districts for
  protection — if it's built, this post activates that entire protection network.

  ---
  POST 15: "We're clearing residential streets first. Outer boroughs go before Midtown."

  Tone: URGENT | Phase: During (week ~37)

  Graph path:
  Post → c_transit (primary), c_safety (secondary)
    → HIGH resonance: d_staten_island (transit:8), d_washington_hts (transit:8), d_jamaica (transit:9),
   d_midtown (transit:9 — but NEGATIVE)
    → Policy: pol_deploy_outer (tier:informed, -$0.3B, trust: targeted+6, citywide+1)
    → Targets: [d_south_bronx, d_washington_hts, d_jackson_hts, d_flushing, d_brownsville, d_bay_ridge,
   d_staten_island]
    → Bloc shift: b_working ↑↑↑, b_labor ↑, b_finance ↓ (Midtown deprioritized), b_realestate ↓
    → vs. POST 5 (Manhattan first): OPPOSITE bloc reaction
    → Outcome prevention: o_casualties in outer boroughs reduced
    → o_transit_shutdown partially — Jamaica hub still accessible
  Net: The mirror of Post 5. Seven outer-borough districts gain +6 targeted trust. Finance/realestate
  blocs lose trust but they're lower-vulnerability. This maps directly to the game's central design
  question: who gets resources first? The informed tier means the player needed insights to even unlock
   this option.

  ---
  POST 16: "Staten Island: I know you feel forgotten. The ferry will run extra shifts and we have
  generators staged at all three fire houses."

  Tone: OPTIMISTIC | Phase: Warning (week ~31)

  Graph path:
  Post → c_transit (primary), c_infra (secondary)
    → VERY HIGH resonance: d_staten_island (transit:8, infra:6) — directly named
    → WEAK elsewhere: most districts don't share Staten Island's specific isolation
    → Character: Tommy Ferraro (retired FDNY captain) → DM reaction
    → Bloc: b_labor ↑ (fire companies, ferry workers)
    → Infrastructure: p_grid (generators) — if built, backs up the claim
    → Vulnerability: d_staten_island has baseResilience:46 (lowest in game) and weight:0.9 blizzard
  threat
    → Trust: concentrated boost to one district, minimal citywide
  Net: Hyper-targeted. Staten Island is the most isolated district (single bridge/ferry) with the
  lowest base resilience (46). A targeted post like this can prevent it from cratering during the
  disaster. But 18 other districts get nothing. The graph shows h_blizzard → d_staten_island at weight
  0.9 — one of the three highest threat edges.

  ---
  POST 17: "The budget is tight. We can't do everything. But we can do the most important things
  first."

  Tone: MATTER-OF-FACT | Phase: Before (week ~20)

  Graph path:
  Post → NO specific concern axis activated
    → LOW resonance across all districts: vague, no concrete signal
    → LLM scoring: likely HOLLOW (avg < 4) — no grounding in any insight
    → Trust: minimal or negative. trust.js #onPost → groundingScore < 0.5 → -1 trust
    → Bloc shift: b_finance ↑ slight (fiscal restraint), b_progressives ↓ (austerity signal)
    → Graph edges activated: c_fiscal → b_biz [pleases], c_fiscal → b_prog [angers]
    → No infrastructure, no policy, no outcome prevention
  Net: The hollow-post trap. It sounds mayoral but says nothing. The LLM has no insight text to match
  against, no district to score highly, no concern axis to activate. This is what HOLLOW rating looks
  like — generic engagement, no resident quotes. The -1 trust from trust.js's groundingScore < 0.5 path
   erodes the district it's nominally about.

  ---
  POST 18: "Bed-Stuy: your brownstone wiring is a fire hazard in ice storms. We're sending inspectors
  this week."

  Tone: CONCERNED | Phase: Before (week ~14)

  Graph path:
  Post → c_infra (primary), c_safety (secondary)
    → VERY HIGH: d_bed_stuy (infra:8, safety:5) — directly named with specific vulnerability
    → HIGH: d_astoria (infra:8), d_les (infra:8), d_midtown (infra:8), d_fidi (infra:8)
    → Character: Pastor David Williams (Bed-Stuy) → DM reaction
    → Grounding: references specific vulnerability from entries.js ("Aging brownstone wiring;
  tree-lined streets become power-line hazards in ice storms")
    → Infrastructure: p_grid → protects d_bed_stuy
    → Bloc shift: b_working ↑ (Bed-Stuy = working bloc)
    → Outcome prevention: reduces o_blackout path for Bed-Stuy specifically
  Net: Highly grounded — it echoes the exact concern text in the district entry. The LLM should score
  this very high for Bed-Stuy. The infra:8 axis also resonates with 5 other districts. This is the
  ideal post pattern: name a district, reference a specific vulnerability, and connect it to
  infrastructure.

  ---
  POST 19: "We've identified cross-district patterns: NYCHA towers in Harlem, LES, and South Bronx all
  share the same heating failure mode. One fix reaches three neighborhoods."

  Tone: OPTIMISTIC | Phase: Before (week ~26)

  Graph path:
  Post → c_infra (primary), c_housing (secondary), c_health (tertiary)
    → HIGH resonance: d_harlem (infra:7, housing:8), d_les (infra:8, housing:7), d_south_bronx
  (infra:7, housing:6, health:9)
    → PATTERN SIGNAL: references cross-district pattern discovery
    → Policy tier unlock: `pattern` tier policies require pattern discovery
    → Infrastructure: p_grid → protects all three named districts
    → Grounding: maximum — references insights + pattern + specific infrastructure
    → Trust: d_harlem (James Washington) + d_south_bronx (Maria Delgado) DM reactions
    → Bloc shift: b_working ↑↑↑, b_progressives ↑↑
    → Outcome prevention: o_blackout + o_casualties paths reduced across 3 districts simultaneously
  Net: The pattern-discovery payoff post. This is what the entire insight→pattern→intervention pipeline
   builds toward. The pattern tier in policy.js is the highest unlock level. Referencing a
  cross-district pattern should trigger the highest possible LLM scores for grounding. Three
  high-vulnerability districts are covered in one move.

  ---
  POST 20: "Nothing happened last night. The storm hit, and nothing happened. That's not luck — that's
  preparation."

  Tone: OPTIMISTIC | Phase: After (week ~42)

  Graph path:
  Post → Maps to outcome: o_invisible_success
    → o_invisible_success → r_resilience (affects, value:-2) — base penalty for "nothing happened"
    → BUT: o_invisible_success.withCreditClaim = +10 — THIS POST IS THE CREDIT CLAIM
    → If preparation was real (infra built, insights gathered, patterns found):
      → LLM scores high → groundingScore > 0.5 → +2 trust per grounded district
      → Residents in visited districts confirm: "We had generators. We were ready."
      → r_resilience net: -2 + 10 = +8 (massive positive swing)
    → If preparation was hollow:
      → LLM scores low → "What preparation?" reactions
      → r_resilience: -2 with no credit offset
    → Bloc shift: all blocs ↑ if grounded, neutral/negative if hollow
    → This is the endgame scoring post — determines final resilience %
  Net: The most consequential post in the game. The o_invisible_success node in outcomes has a unique
  dual structure: -2 resilience by default (nobody notices what didn't happen), but +10 if you claim
  credit with evidence. This post IS the credit claim. The entire game arc — insights, infrastructure,
  trust — feeds into whether this post lands as RESONATING or HOLLOW. It's the exam.

  ---
  System-Wide Impact Summary

  ┌─────┬────────────────┬──────────┬───────────┬───────────┬────────┬────────────────────────┐
  │ Pos │    Primary     │ District │   Bloc    │   Bloc    │ Reserv │                        │
  │  t  │    Concern     │  s Hit   │  Winners  │  Losers   │ e Cost │     Key Graph Path     │
  │     │                │   (≥7)   │           │           │        │                        │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 1   │ transit        │        5 │ working,  │ —         │ -$0.8B │ p_plows → h_blizzard   │
  │     │                │          │ labor     │           │        │                        │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 2   │ health         │        2 │ working,  │ —         │ —      │ d_south_bronx →        │
  │     │                │          │ prog      │           │        │ c_health (9)           │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 3   │ services       │        4 │ working,  │ —         │ -$0.6B │ pol_business_continuit │
  │     │                │          │ finance   │           │        │ y                      │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │     │                │          │ working,  │           │        │ p_grid → o_blackout    │
  │ 4   │ infra          │        8 │ prog,     │ —         │ -$1.2B │ blocked                │
  │     │                │          │ labor     │           │        │                        │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │     │                │          │ finance,  │ working,  │        │ pol_deploy_manhattan   │
  │ 5   │ transit        │        2 │ realestat │ prog      │ -$0.3B │ (citywide -4)          │
  │     │                │          │ e         │           │        │                        │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 6   │ housing        │        4 │ working,  │ —         │ —      │ insight grounding loop │
  │     │                │          │ prog      │           │        │                        │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 7   │ safety         │        6 │ working   │ —         │ -$0.3B │ p_salt (cheapest       │
  │     │                │          │           │           │        │ infra)                 │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 8   │ infra+services │        5 │ working,  │ —         │ -$0.4B │ pol_resilience_hubs    │
  │     │                │          │ prog      │           │        │                        │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 9   │ transit        │        4 │ labor     │ —         │ -$0.6B │ b_labor exposed_to     │
  │     │                │          │           │           │        │ reduction              │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 10  │ infra          │        1 │ —         │ working   │ —      │ o_blackout already     │
  │     │                │          │           │           │        │ materialized           │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 11  │ health         │        3 │ working,  │ —         │ -$0.3B │ p_outreach (highest    │
  │     │                │          │ prog      │           │        │ targeted +7)           │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 12  │ housing        │        6 │ prog      │ realestat │ —      │ c_mandate → b_re       │
  │     │                │          │           │ e         │        │ [angers]               │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 13  │ safety+service │        4 │ working   │ —         │ -$0.5B │ pol_shelters (best     │
  │     │ s              │          │           │           │        │ citywide +3)           │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤
  │ 14  │ safety         │ 19 (shal │ all       │ —         │ -$0.4B │ p_warning              │
  │     │                │     low) │ (temp)    │           │        │ amplification          │
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤        
  │     │                │          │ working,  │ finance,  │        │ pol_deploy_outer       │        
  │ 15  │ transit        │        7 │ labor     │ realestat │ -$0.3B │ (mirror of #5)         │        
  │     │                │          │           │ e         │        │                        │        
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤        
  │ 16  │ transit+infra  │        1 │ labor     │ —         │ —      │ d_staten_island        │        
  │     │                │          │           │           │        │ (lowest resilience)    │        
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤        
  │ 17  │ none           │        0 │ finance   │ prog      │ —      │ HOLLOW — no graph      │        
  │     │                │          │ (slight)  │           │        │ activation             │        
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤        
  │ 18  │ infra          │        5 │ working   │ —         │ —      │ p_grid → d_bed_stuy    │        
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤        
  │ 19  │ infra+housing  │        3 │ working,  │ —         │ —      │ pattern tier unlock    │        
  │     │                │          │ prog      │           │        │                        │        
  ├─────┼────────────────┼──────────┼───────────┼───────────┼────────┼────────────────────────┤        
  │ 20  │ meta           │  0 or 19 │ all or    │ —         │ —      │ o_invisible_success    │        
  │     │                │          │ none      │           │        │ credit claim           │        
  └─────┴────────────────┴──────────┴───────────┴───────────┴────────┴────────────────────────┘        
                                                                                                       
  Key Findings for the Graph                                                                           
                                                                                                       
  1. Infrastructure concern (c_infra) is the most connected axis — 8 districts score ≥ 7, and it maps  
  directly to p_grid, the strongest mitigation node                                                    
  2. Posts 5 vs 15 are the central design tension — Manhattan-first vs outer-boroughs-first, with      
  opposite bloc reactions and citywide trust effects                                                   
  3. The prerequisite chain matters — p_outreach requires p_warning; p_shelter requires p_evac. Posts  
  that reference dependent infrastructure are hollow if the prerequisite isn't built                   
  4. Post 17 (vague) vs Post 18 (specific) demonstrates the grounding mechanic — same concern axis     
  (infra), radically different LLM scores                                                              
  5. Post 20 is the exam — o_invisible_success is the only outcome node with a positive path, and it   
  requires the credit-claim post to activate

  ---
  Multi-Disaster Roguelike — How the Concern Graph Serves Different Disasters

  The 20 posts above are blizzard-specific, but the underlying concern graph (c_health, c_transit,
  c_infra, c_housing, c_safety, c_services) is disaster-agnostic. Each disaster type shifts which
  concern axes are most activated and which districts are most exposed.

  **Hurricane:**
  - Primary axes: c_infra (flooding, power), c_transit (evacuation routes), c_safety (storm surge)
  - Most exposed districts: d_staten_island (coastal, isolated), d_les (low-lying), d_bed_stuy
    (aging infrastructure), d_bay_ridge (waterfront), d_brownsville (flood-prone basements)
  - Concern weight shifts: d_south_bronx c_health stays high (respiratory + flooding mold),
    d_midtown c_transit drops (Manhattan has more evacuation options), d_staten_island c_safety
    spikes to 9 (storm surge is existential for the island)
  - Infrastructure: p_shelter and p_evac become more important than p_plows and p_salt
  - Timeline: shorter warning window (~2 weeks vs. blizzard's ~20 weeks), but more abrupt onset

  **Heat wave:**
  - Primary axes: c_health (heat stroke, dehydration), c_services (cooling centers, water),
    c_infra (grid strain, AC demand)
  - Most exposed: d_south_bronx (asthma + heat island), d_brownsville (no AC in NYCHA),
    d_harlem (aging buildings, poor ventilation), d_jackson_hts (overcrowded housing)
  - Community assets matter most: mosques with AC, pharmacies with backup power, retired nurses
    who check on seniors. The listening-session mechanic is critical here.
  - Infrastructure: p_grid (power demand) and p_outreach (door-to-door wellness checks) dominate
  - Timeline: full 48 weeks, but the crisis is diffuse — no single strike moment, just cumulative
    heat stress. The "exam" is whether cooling centers were pre-positioned.

  **Pandemic:**
  - Primary axes: c_health (infection, hospitals), c_services (testing, vaccination access),
    c_transit (spread vector)
  - Every district is affected — the question is which ones have community trust to coordinate
  - Trust and knowledge matter more than infrastructure. A district with trust > 60 reports
    symptoms and follows guidance. A district with trust < 30 ignores mandates.
  - Timeline: starts at week 1 with no warning phase. The entire term is the crisis.

  **Infrastructure collapse:**
  - Primary axes: c_infra (cascading failure), c_transit (system shutdown), c_services (utility loss)
  - Most exposed: districts with high c_infra concern weights (d_astoria:8, d_midtown:8, d_les:8,
    d_bed_stuy:8, d_fidi:8)
  - Timeline: compressed to ~30 weeks with abrupt onset

  ---
  Hurricane Scenario Posts — Examples

  These posts show how the same graph structure and scoring mechanics serve a different disaster type.
  The concern axes, district scores, and infrastructure references shift, but the grounding mechanic
  works identically.

  HURRICANE POST 1: "Storm surge maps are in. Red Hook, the Rockaways, and South Shore Staten Island
  are in the highest-risk zone. We're pre-staging sandbags and pumps tonight."

  Tone: URGENT | Phase: Warning (week ~30)

  Graph path:
  Post → c_safety (primary), c_infra (secondary)
    → HIGH resonance: d_staten_island (safety spike to 9 in hurricane mode),
  d_bay_ridge (waterfront exposure), d_les (low-lying)
    → Infrastructure: p_flood_barriers → mitigates h_hurricane (value:18)
    → Bloc shift: b_working ↑ (outer-borough communities named), b_labor ↑ (sanitation crews)
    → Outcome prevention: h_hurricane → o_flooding REDUCED in named districts
  Net: Hyper-targeted and grounded if the player has visited these coastal districts. The hurricane
  reweights d_staten_island from transit-isolation (blizzard) to storm-surge exposure (hurricane) —
  same district, different vulnerability. Posts that worked for blizzards (plows, salt) are irrelevant.

  HURRICANE POST 2: "Every basement apartment in a flood zone needs an escape plan. If you live below
  grade, your landlord is required to post evacuation routes. We're enforcing starting today."

  Tone: CONCERNED | Phase: Before (week ~18)

  Graph path:
  Post → c_housing (primary), c_safety (secondary)
    → HIGH resonance: d_jackson_hts (housing:7, many basement apartments), d_les (housing:7,
  flood-prone), d_harlem (housing:8), d_washington_hts (housing:7)
    → Grounding: references specific vulnerability (basement apartments) from district insights
    → Bloc shift: b_working ↑↑ (basement renters), b_realestate ↓ (enforcement mandate)
    → Outcome prevention: h_hurricane → o_casualties path reduced for below-grade residents
  Net: The housing axis activates differently for hurricanes vs. blizzards. In a blizzard, housing
  concerns are about heat failure. In a hurricane, they're about flooding and escape routes. The same
  concern weight (d_jackson_hts housing:7) maps to different vulnerabilities depending on disaster type.

  HURRICANE POST 3: "The MTA will suspend all subway service 12 hours before landfall. If you need to
  evacuate and don't have a car, call 311 now."

  Tone: URGENT | Phase: Warning (week ~32)

  Graph path:
  Post → c_transit (primary)
    → HIGH resonance: d_jamaica (transit:9), d_midtown (transit:9), d_washington_hts (transit:8)
    → But DIFFERENT meaning: in blizzard, transit concern = snow clearance. In hurricane, transit
  concern = evacuation capacity. Same axis, different operational content.
    → Infrastructure: p_evac → mitigates h_hurricane (value:15)
    → Bloc shift: b_working ↑ (car-free commuters), b_labor ↑↑ (MTA workers named)
    → Outcome prevention: o_transit_shutdown becomes o_evacuation_failure if transit stops too late
  Net: Transit is critical in both disasters but for opposite reasons. Blizzard: keep routes clear.
  Hurricane: shut routes down safely and provide alternatives. The LLM scoring works identically —
  it matches post text against district concern weights — but the semantic content that scores high
  is completely different.

  HURRICANE POST 4: "Mrs. Chen's building on 138th survived Sandy because the block association had
  a mutual-aid plan. We're funding every block association that submits an evacuation plan by Friday."

  Tone: OPTIMISTIC | Phase: Before (week ~22)

  Graph path:
  Post → c_services (primary), c_safety (secondary)
    → References community asset (block association mutual-aid plan) — maximum grounding
    → HIGH resonance: d_harlem (services:8), d_brownsville (services:9), d_jackson_hts (services:8)
    → Grounding bonus: specific character + specific asset + specific action = highest LLM score
    → Bloc shift: b_working ↑↑, b_progressives ↑↑ (community empowerment)
    → Outcome prevention: community self-organization during hurricane = fewer casualties
  Net: This is the community-asset payoff post adapted for hurricane. The asset (block association plan)
  was discovered through a listening session. Referencing it in the post activates the full
  insight→post→trust loop. The same mechanic works for any disaster — the assets just map to different
  protective functions.   