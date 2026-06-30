---
name: update-docs
description: Update all game design and tracking documents in docs/ to reflect the current state of the codebase. Syncs systems status, content counts, architecture, changelog, and roadmap checkboxes.
user_invocable: true
---

# Update Docs

Audit the codebase and update all documents in `docs/` to reflect what actually exists.

## Steps

1. **Scan the codebase** — read key files to understand current state:
   - `src/lib/components/*.svelte` — what components exist
   - `src/lib/engine.js` — what systems are wired
   - `src/lib/stores/game.js` — what stores exist
   - `src/lib/shaders/` — what visual effects exist
   - `systems/*.js` — what game systems exist
   - `data/*.js` — what content data exists (count conversations, scenarios, interventions, tiles)
   - `package.json` — dependencies
   - `vite.config.js` — build config

2. **Update `docs/systems.md`** — for each system in `systems/`, verify status (done/partial/not started). Check if it's actually imported and wired in `engine.js`. Update the "Systems NOT Yet Built" and "Key Gaps" sections.

3. **Update `docs/content.md`** — count actual conversations in `data/conversations.js`, scenarios in `data/scenarios.js`, interventions in `data/interventions.js`, tiles in `data/tiles.js`. Update the conversation table (which districts have scripts). Update counts vs targets.

4. **Update `docs/architecture.md`** — verify the directory tree matches reality. Update component list. Check data flow description is accurate.

5. **Update `docs/roadmap.md`** — check each `[ ]` and `[x]` item against the codebase. If something marked `[ ]` is now done, check it off `[x]`. If something marked `[x]` has regressed or been removed, uncheck it. Update the "What exists now" tree. Update file paths if they've changed.

6. **Update `docs/changelog.md`** — add a new entry at the top with today's date and a summary of what changed since the last entry. Keep it concise (bullet points, not paragraphs).

## Rules

- Only update facts that can be verified by reading the code. Don't speculate about what "should" exist.
- Preserve all design intent, future plans, and GDD content — only update status/progress tracking.
- Don't modify `docs/gdd.md` — that's the design vision, not a status tracker.
- Don't modify `docs/interactions.md` — that's the interaction spec.
- Don't modify `docs/scenarios.md` — that's test traces.
- Keep the same markdown formatting and structure in each file.
- Use today's date (from the system) for changelog entries.
