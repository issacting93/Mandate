# MANDATE — Design System v1.0

*Government Briefing Aesthetic. The mayor's desk, not a startup dashboard.*

---

## Design Principles

1. **Document Over Interface** — Every screen should feel like a printed briefing, not a software product. Paper, stamps, section numbers, classification marks.
2. **Restraint as Authority** — Fewer elements, more conviction. White space is confidence. The absence of decoration signals institutional power.
3. **Type Does the Work** — Two typefaces carry the entire visual identity. No icons where a label will do. No color where weight or size will do.
4. **Structure Is Information** — Section numbers, ruled lines, and grid alignment communicate hierarchy before a single word is read.
5. **Faction Color, Not UI Color** — Color enters the palette only to identify political factions on card top-borders. It is never used for UI states, backgrounds, or decoration.
6. **Ambient World-Building** — Watermarks, classified stamps, barcodes, and corner brackets make the world feel present without demanding attention.

---

## Colors

### 1. Surface

| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#F7F5F0` | Primary background. Warm paper. |
| `--paper-card` | `#FDFCF9` | Sidebar, slot backgrounds. Slightly lighter. |
| `--paper-white` | `#FFFFFF` | Raised cards, component panels. |

> **Alias:** `--paper-panel` maps to `--paper-card`.

### 2. Ink Scale

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#111111` | Primary text, headings, dark backgrounds. |
| `--ink-mid` | `#555555` | Body prose, card intel text. |
| `--ink-muted` | `#999999` | Labels, eyebrows, metadata. |
| `--ink-ghost` | `#CCCCCC` | Slot numbers, add buttons, placeholders. |

> **Aliases:** `--ink-soft` maps to `--ink-mid`. `--ink-faint` maps to `--ink-muted`.

### 3. Rules

| Token | Hex | Usage |
|---|---|---|
| `--rule` | `#DEDAD4` | Primary borders, dividers, form rules. Warm tan. |
| `--rule-light` | `#F0EDE8` | Subtle dividers within panels, department row separators. |

> **Aliases:** `--line` maps to `--rule`. `--line-light` maps to `--rule-light`.

### 4. Signal

| Token | Hex | Usage |
|---|---|---|
| `--red` | `#B82A18` | Primary accent. Logo, section numbers, stamps, danger states. The MANDATE red. |
| `--red-light` | `#FEF8F7` | Secondary button background (re-deal, soft actions). |
| `--red-border` | `#F0CECA` | Secondary button border. |
| `--amber` | `#E8A020` | Resilience bar fill, warning states. |

### 5. Faction

Faction colors appear **only** as 2px card top-borders. They are never used for backgrounds, text, buttons, or UI chrome.

| Token | Hex | Faction |
|---|---|---|
| `--purple` | `#7B4FBF` | Labor |
| `--amber` | `#E8A020` | Working Families |
| `--slate` | `#888888` | Business / Real Estate |
| `--green` | `#2A9E5C` | Health / Green |
| `--blue` | `#4B4BFF` | Perceive / Blue |

---

## Typography

Two typefaces, strict roles.

### Bebas Neue — Display

The government stamp face. All-caps by nature. Used for:
- Section numbers (01, 02)
- Card titles, district names
- Budget figures, reserve amount
- Department names
- Week counter
- Logo
- CTA / button labels (primary actions)

**Sizes:** 200px (watermark), 40px (section num), 34px (budget), 26px (week), 22px (card title), 20px (logo), 18px (slot name), 15px (dept name, buttons)

### Space Mono — Body + Data

Monospace body text. The "typed on a government form" feeling. Used for:
- All body text, labels, metadata
- Card intel text (italic for quotes)
- Stat values (bold)
- Footer tags, department codes
- Buttons (non-display)

**Sizes:** 11px (body), 10px (section titles), 9px (stat labels, footer), 8px (micro labels, codes), 7px (tiny tags, costs)

### Retired Typefaces

- **Doto** — removed. Stat values now use Space Mono Bold.
- **Space Grotesk** — removed. Never used.

### Letter-spacing Scale

| Context | Value |
|---|---|
| Watermark (compressed display) | `-6px` |
| Logo, button labels | `3px` |
| Section labels, stat headers | `2px` |
| Sub-labels | `1.5px` |
| Tags, codes, metadata | `1px` |
| Body text | `0` (default) |

---

## Spacing

### Container Padding
- Main content: `20px`
- Sidebar: `20px 16px`
- Cards: `10px`

### Gap Scale
- `4px` — micro (barcode bars, tiny inline)
- `6px` — tight (dept controls, card footer)
- `8px` — standard (grid gaps, card grid, slot grid)
- `10px` — moderate (section headers, dept rows)
- `12px` — comfortable (section padding)
- `16px` — spacious (major sections)
- `20px` — container (top-level layout)
- `28px` — wide (logo to stats)

### Border Radius

- `0` — **the only value**. Sharp edges everywhere. Government forms don't have rounded corners.
- `50%` — circles only (avatars, dots, badges). The sole exception.

No 2px. No 8px. Zero is the default for every card, button, overlay, modal, track, and panel.

---

## Components

### Buttons

**Primary** — `--ink` background, `--paper` text, Bebas Neue, letter-spacing 3px. On hover: `--red` background.

**Secondary** — `--red-light` background, `--red` text, `--red-border` 1px border, Space Mono.

**Ghost** — transparent background, `--rule` 1px border, `--ink-muted` text, Space Mono.

### Slots (Draft Board)
- 1px solid `--rule` border
- Corner brackets: 7px `--red` L-shapes at each corner
- Content centered, Bebas Neue number + Space Mono label
- Filled state: `--paper-white` background, district name in Bebas, character in Space Mono
- Pulsing state (week 1): border animates between `--rule` and `--red`

### Cards (Field Briefings)
- `--paper-white` background, 1px solid `--rule` border
- 2px top border in faction color
- Bebas Neue title, Space Mono intel text
- Intel text: 8px italic, left-border 2px `--rule`, padding-left 6px
- Barcode decoration: 0.1 opacity, `#111` bars, 6px height
- Footer: lens dot (5px square, dept color) + Space Mono tag + `+` button
- Drafted state: 0.35 opacity, scale(0.98)
- Wanted ribbon: `--red` background, top-right positioned

### Department Rows (Sidebar)
- Bebas Neue name (15px), Space Mono code/alloc
- Track: 2px height, `--rule-light` background, colored fill
- Stepper buttons: 14px square, 1px `--rule` border, Space Mono +/-
- Cost: 7px Space Mono, right-aligned

---

## Microdetail

Ambient elements that make the world feel present without demanding attention.

### Watermark
- Bebas Neue 200px
- `rgba(0,0,0,0.03)` (3% opacity)
- Centered in main content area
- Shows `WK XX / 48`

### Classified Stamp
- Position: absolute, bottom-right
- Rotation: `-2.5deg`
- Text: 7px, letter-spacing 3px, `rgba(184,42,24,0.18)` (18% opacity red)
- Border: 1px solid `rgba(184,42,24,0.12)`
- pointer-events: none

### Corner Brackets
- 7px L-shapes in `--red` at slot corners
- Created with pseudo-elements (border-top + border-left, etc.)
- Appear on empty and filled slots

### Barcode Strip
- Variable-width `<span>` elements at 10% opacity
- `#111` background, 6px height
- Placed at card bottom
- Gap: 4px between bars

---

## Patterns

### Section Headers
```
+------------------------------+
| 01   DRAFT YOUR WEEK         |
|      DIRECTIVE // FIELD MEETINGS |
|                  Three slots  |
+------------------------------+
```
- Section number: Bebas Neue 40px, `--red`
- Title: Space Mono 10px, letter-spacing 3px, uppercase
- Subtitle: Space Mono 8px, `--ink-muted`, letter-spacing 1px
- Right-aligned meta: Space Mono 8px, `--ink-muted`
- Bottom border: 1px solid `--rule`

### Budget Bar
- 3px height, flex row with gap 1px
- Segments: `--blue` (perceive), `--green` (reserve), `--rule` (spent)
- Legend: 7px Space Mono, colored 6px square dots

### Stat Tracks
- 64px wide, 2px height, `--rule` background
- Fill: 2px, colored by metric
- Value: 11px Space Mono bold, `--ink`

---

## Don'ts

- Don't use Doto (retired)
- Don't use Space Grotesk (retired)
- Don't use `#ff2d2d` (old red, replaced by `#B82A18`)
- Don't round ANY corner (except `50%` for circles)
- Don't use box-shadow for depth — use borders and background shifts
- Don't use gradients
- Don't use emoji in UI elements
- Don't use faction colors for anything other than card top-borders
- Don't mix Bebas Neue into body text — it's display only
