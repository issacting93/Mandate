# MANDATE — Content Tracker

What content exists, what's missing, and what needs writing.

Updated 2026-06-29.

---

## Conversations (NPC Scripts)

19 districts, 11 have conversation scripts, 8 need writing.

| District | Borough | Has Script | Character | Insights |
|----------|---------|-----------|-----------|----------|
| South Bronx | Bronx | Yes | Maria Delgado (tenant organizer) | HEALTH, ASSET |
| Fordham | Bronx | Yes | | |
| Riverdale | Bronx | **No** | — | — |
| Harlem Heights | Manhattan | Yes | James Washington | |
| Upper East Side | Manhattan | **No** | — | — |
| Midtown | Manhattan | Yes | | |
| Lower Manhattan | Manhattan | **No** | — | — |
| Astoria | Queens | Yes | | |
| Long Island City | Queens | **No** | — | — |
| Jackson Heights | Queens | Yes | | |
| Flushing | Queens | Yes | | |
| Jamaica | Queens | **No** | — | — |
| Williamsburg | Brooklyn | Yes | | |
| Downtown Brooklyn | Brooklyn | **No** | — | — |
| Bushwick | Brooklyn | **No** | — | — |
| Crown Heights | Brooklyn | Yes | | |
| Bay Ridge | Brooklyn | Yes | | |
| North Shore | Staten Island | Yes | | |
| Mid-Island | Staten Island | **No** | — | — |

**Total: 11/19 done. 8 to write.**

Each conversation should reveal:
- At least 1 vulnerability insight
- At least 1 community asset (ASSET category)
- Categories: HEALTH, HOUSING, INFRA, SERVICES, SAFETY, ASSET

---

## Scenario Events (Blizzard Arc)

10 events scripted in `data/scenarios.js`:

| # | Week | Event | Type |
|---|------|-------|------|
| 1 | 4 | Long-range winter outlook | Feed item |
| 2 | 10 | Infrastructure report card | Feed + trust delta |
| 3 | 14-18 | Summer heat stress | Trust test |
| 4 | 22 | Models converge | Cinematic |
| 5 | 28-32 | October squall | Trust delta |
| 6 | 30-34 | Salt prices spike | Reserve hit |
| 7 | 36 | Blizzard watch | Cinematic |
| 8 | 37-40 | Union demands storm pay | Reserve hit |
| 9 | 42 | Blizzard warning | Cinematic |
| 10 | 44 | Blizzard strikes | Cinematic + flags |

**Target: 15-20 events (add smaller disruptions between arc beats)**

---

## Interventions

Defined in `data/interventions.js`:

| Tier | Count | Examples |
|------|-------|---------|
| Generic | 2 | Emergency Supply Cache ($0.6B), Public Awareness ($0.3B) |
| Informed | 4 | Community Generator, Health Worker Network, Multilingual Alerts, Basement Flood Registry |
| Pattern | 2 | Mutual Aid Data Bridge, Emergency Transit Network |

**Target: 15-20 generic + 40-60 informed**

---

## Bento Tiles

Defined in `data/tiles.js`:

| Type | Count | Notes |
|------|-------|-------|
| WHERE | 6 | Borough + citywide scoping |
| WHAT (base) | 5 | Plows, generators, shelters, medical, alerts |
| WHAT (mutated) | 5 | Insight-unlocked efficient variants |
| HOW | 6 | Mutual aid, local leaders, youth corps, etc. |
| FUNDING | 3 | Small/medium/large budget |
| Synergies | 7 | |
| Conflicts | 4 | |

---

## Feed Chatter Templates

**Current: ~10 basic templates**
**Target: 80-120 (district-specific, knowledge-graded vague→specific)**

---

## DM Templates

**Current: 1 per character (post-conversation only)**
**Target: 3-5 per character (follow-ups, check-ins, disaster updates, reply system)**
