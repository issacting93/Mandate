#!/usr/bin/env node
// run_simulations.js — Run 10 Playwright game simulations in parallel (concurrency: 3)
//
// Requires: dev server running on localhost:8000 (npx vite --port 8000)
// Usage: node run_simulations.js
//

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

// ═══════════════════════════════════════════════════
// 10 simulation configs
// ═══════════════════════════════════════════════════

const SIMULATIONS = [
  { id: 1,  strategy: 'grassroots', label: 'Grassroots #1' },
  { id: 2,  strategy: 'grassroots', label: 'Grassroots #2' },
  { id: 3,  strategy: 'grassroots', label: 'Grassroots #3' },
  { id: 4,  strategy: 'technocrat', label: 'Technocrat #1' },
  { id: 5,  strategy: 'technocrat', label: 'Technocrat #2' },
  { id: 6,  strategy: 'technocrat', label: 'Technocrat #3' },
  { id: 7,  strategy: 'balanced',   label: 'Balanced #1' },
  { id: 8,  strategy: 'balanced',   label: 'Balanced #2' },
  { id: 9,  strategy: 'neglect',    label: 'Neglect' },
  { id: 10, strategy: 'focused',    label: 'Focused (5 districts deep)' },
];

const BASE_URL = 'http://localhost:8000';
const MAX_WEEKS = 48;

// ═══════════════════════════════════════════════════
// Strategy behaviors
// ═══════════════════════════════════════════════════

async function preDraftActions(page, strategy, week) {
  // Handle doctrine choices that may be pending
  const doctrineBtns = page.locator('.w-doctrine-btn');
  if (await doctrineBtns.first().isVisible().catch(() => false)) {
    // Grassroots/focused → pick B (community), others → pick A (institutional)
    const pick = (strategy === 'grassroots' || strategy === 'focused') ? 1 : 0;
    const btns = await doctrineBtns.count().catch(() => 0);
    if (btns > pick) {
      await doctrineBtns.nth(pick).click().catch(() => {});
      await page.waitForTimeout(200);
    }
  }

  if (strategy === 'neglect') {
    return;
  }

  // Fund departments based on strategy
  const plusButtons = page.locator('.w-dept-ctrl button:has-text("+")');
  const count = await plusButtons.count().catch(() => 0);

  if (strategy === 'technocrat') {
    // Aggressively fund — try 3 upgrades per week
    for (let k = 0; k < 3 && count > 0; k++) {
      const idx = Math.floor(Math.random() * count);
      const btn = plusButtons.nth(idx);
      try {
        if (await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(150);
          // Handle doctrine
          if (await doctrineBtns.first().isVisible().catch(() => false)) {
            await doctrineBtns.first().click().catch(() => {});
            await page.waitForTimeout(200);
          }
        }
      } catch {}
    }
  } else if (strategy === 'grassroots') {
    // Fund 1 per week early game, then slow down
    if (week <= 10 && count > 0 && Math.random() < 0.7) {
      const idx = Math.floor(Math.random() * count);
      try {
        const btn = plusButtons.nth(idx);
        if (await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(150);
          if (await doctrineBtns.first().isVisible().catch(() => false)) {
            await doctrineBtns.nth(1).click().catch(() => {}); // Pick B (community)
            await page.waitForTimeout(200);
          }
        }
      } catch {}
    }
  } else if (strategy === 'balanced') {
    // 50% chance per week
    if (count > 0 && Math.random() < 0.5) {
      const idx = Math.floor(Math.random() * count);
      try {
        const btn = plusButtons.nth(idx);
        if (await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(150);
          if (await doctrineBtns.first().isVisible().catch(() => false)) {
            await doctrineBtns.first().click().catch(() => {});
            await page.waitForTimeout(200);
          }
        }
      } catch {}
    }
  } else if (strategy === 'focused') {
    // Fund 2 specific depts aggressively
    if (week <= 15 && count > 0) {
      for (let k = 0; k < 2; k++) {
        const btn = plusButtons.nth(k % count);
        try {
          if (await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
            await btn.click();
            await page.waitForTimeout(150);
            if (await doctrineBtns.first().isVisible().catch(() => false)) {
              await doctrineBtns.nth(1).click().catch(() => {}); // Pick B
              await page.waitForTimeout(200);
            }
          }
        } catch {}
      }
    }
  }
}

function shouldDraft(strategy, week, slotIndex) {
  if (strategy === 'neglect') {
    return slotIndex === 0 && Math.random() < 0.2;
  }
  if (strategy === 'focused') {
    return true;
  }
  if (strategy === 'technocrat') return true;
  if (strategy === 'grassroots') return true;
  if (strategy === 'balanced') return slotIndex < 2 || Math.random() < 0.6;
  return true;
}

function chooseConversationOption(strategy) {
  if (strategy === 'technocrat') return 'solution';
  if (strategy === 'neglect') return 'first';
  return 'listen';
}

// ═══════════════════════════════════════════════════
// Single simulation run
// ═══════════════════════════════════════════════════

async function runSimulation(browser, config) {
  const { id, strategy, label } = config;
  const startTime = Date.now();
  console.log(`  RUN ${id}/10 [START]: ${label} (strategy: ${strategy})`);

  const page = await browser.newPage();
  page.setDefaultTimeout(1000); // Fail fast
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Skip onboarding
  try {
    const skipBtn = page.locator('.skip-btn').first();
    await skipBtn.waitFor({ state: 'visible', timeout: 3000 });
    await skipBtn.click();
  } catch {}
  await page.waitForTimeout(500);

  let week = 1;
  let gameOver = false;
  let conversationsHad = 0;
  let policiesSigned = 0;

  while (week <= MAX_WEEKS && !gameOver) {
    // Dismiss cinematics
    const dismissBtn = page.locator('.dismiss-btn:has-text("I see")').first();
    if (await dismissBtn.isVisible().catch(() => false)) {
      await dismissBtn.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Check game over
    const endOverlay = page.locator('.game-end-overlay').first();
    if (await endOverlay.isVisible().catch(() => false)) {
      gameOver = true;
      break;
    }

    // Go to Draft view
    const draftTab = page.locator('.nav-tab:has-text("DRAFT")').first();
    if (await draftTab.isVisible().catch(() => false)) {
      await draftTab.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Pre-draft actions (funding, doctrine)
    await preDraftActions(page, strategy, week);

    // Draft cards
    const openSlots = page.locator('.w-slot:has-text("Open Slot")');
    const openSlotsCount = await openSlots.count().catch(() => 0);
    for (let i = 0; i < openSlotsCount; i++) {
      if (!shouldDraft(strategy, week, i)) continue;
      const cards = page.locator('.w-cards .w-card:not([disabled])');
      const cardsCount = await cards.count().catch(() => 0);
      if (cardsCount > 0) {
        let cardToDraft = cards.first();
        if (strategy === 'focused' && cardsCount > 1) {
          cardToDraft = cards.nth(Math.min(i, cardsCount - 1));
        } else if (strategy === 'grassroots') {
          for (let j = 0; j < cardsCount; j++) {
            const card = cards.nth(j);
            const text = await card.innerText().catch(() => '');
            if (text.includes('lens active') || text.includes('lens')) {
              cardToDraft = card;
              break;
            }
          }
        }
        await cardToDraft.click().catch(() => {});
        await page.waitForTimeout(150);
      }
    }

    // Execute week
    const goBtn = page.locator('button.w-go:not([disabled])').first();
    if (await goBtn.isVisible().catch(() => false)) {
      await goBtn.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Play conversations
    let conversationsDone = false;
    let safeguard = 0;
    while (!conversationsDone && safeguard < 500) {
      safeguard++;
      const convoActive = await page.locator('.convo-panel').first().isVisible().catch(() => false);
      if (convoActive) {
        // Close button
        const closeBtn = page.locator('.convo-choice.close-btn').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click().catch(() => {});
          conversationsHad++;
          await page.waitForTimeout(400);
          continue;
        }

        // Choices
        const choices = page.locator('.convo-choice');
        const count = await choices.count().catch(() => 0);
        if (count > 0) {
          const mode = chooseConversationOption(strategy);
          if (mode === 'solution') {
            const sol = page.locator('.convo-choice.solution-choice').first();
            if (await sol.isVisible().catch(() => false)) {
              await sol.click().catch(() => {});
            } else {
              await choices.first().click().catch(() => {});
            }
          } else {
            const dept = page.locator('.convo-choice.dept-choice').first();
            if (await dept.isVisible().catch(() => false)) {
              await dept.click().catch(() => {});
            } else {
              let clicked = false;
              for (let j = 0; j < count; j++) {
                const choice = choices.nth(j);
                const classes = await choice.evaluate(el => el.className).catch(() => '');
                if (!classes.includes('solution-choice')) {
                  await choice.click().catch(() => {});
                  clicked = true;
                  break;
                }
              }
              if (!clicked) await choices.first().click().catch(() => {});
            }
          }
          await page.waitForTimeout(200);
        } else {
          await page.waitForTimeout(100);
        }
      } else {
        // Gap check
        await page.waitForTimeout(2000);
        if (!(await page.locator('.convo-panel').first().isVisible().catch(() => false))) {
          conversationsDone = true;
        }
      }
    }

    // Dismiss post-conversation cinematics
    const dismissBtnAfter = page.locator('.dismiss-btn:has-text("I see")').first();
    if (await dismissBtnAfter.isVisible().catch(() => false)) {
      await dismissBtnAfter.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Go to Draft to end week
    if (await draftTab.isVisible().catch(() => false)) {
      await draftTab.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // End Week
    const endWeekBtn = page.locator('button.w-end:not([disabled])').first();
    if (await endWeekBtn.isVisible().catch(() => false)) {
      await endWeekBtn.click().catch(() => {});
      await page.waitForTimeout(400);
    }

    // Handle debrief
    const debrief = page.locator('.debrief-panel').first();
    if (await debrief.isVisible().catch(() => false)) {
      // Balanced: build a bento policy
      if (strategy === 'balanced' && Math.random() < 0.4) {
        const policyBtn = page.locator('.debrief-btn.policy-btn').first();
        if (await policyBtn.isVisible().catch(() => false)) {
          await policyBtn.click().catch(() => {});
          await page.waitForTimeout(300);

          const tiles = page.locator('.tile-card');
          if (await tiles.count().catch(() => 0) > 0) {
            await tiles.first().click().catch(() => {});
            await page.waitForTimeout(100);
            const cells = page.locator('.grid-cell');
            if (await cells.count().catch(() => 0) > 12) {
              await cells.nth(12).click().catch(() => {});
              await page.waitForTimeout(150);
            }
            const signBtn = page.locator('.btn-sign:not([disabled])').first();
            if (await signBtn.isVisible().catch(() => false) && await signBtn.isEnabled().catch(() => false)) {
              await signBtn.click().catch(() => {});
              await page.waitForTimeout(300);
              policiesSigned++;
            }
          }

          const closeBento = page.locator('.builder .close-btn').first();
          if (await closeBento.isVisible().catch(() => false)) {
            await closeBento.click().catch(() => {});
            await page.waitForTimeout(200);
          }
        }
      }

      const nextBtn = page.locator('.debrief-btn.next-btn').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click().catch(() => {});
        await page.waitForTimeout(400);
      }
    }

    // Track week
    const weekText = await page.locator('.w-wk-num').first().innerText().catch(() => '');
    const parsed = parseInt(weekText);
    if (!isNaN(parsed) && parsed > week) week = parsed;
    else week++;

    // Game over check
    if (await page.locator('.game-end-overlay').first().isVisible().catch(() => false)) {
      gameOver = true;
    }

    // Progress indicator every 10 weeks
    if (week % 10 === 0) console.log(`    Run ${id} [Progress]: Week ${week}...`);
  }

  // Extract results
  const result = { id, label, strategy, week, duration: Date.now() - startTime };

  const endOverlayFinal = page.locator('.game-end-overlay').first();
  if (await endOverlayFinal.isVisible().catch(() => false)) {
    result.outcome = await page.locator('.result-label').first().innerText().catch(() => 'UNKNOWN');
    result.title = await page.locator('.result-title').first().innerText().catch(() => 'UNKNOWN');
    const stats = page.locator('.stat-value');
    const statCount = await stats.count().catch(() => 0);
    if (statCount >= 3) {
      result.resilience = await stats.nth(0).innerText().catch(() => 'N/A');
      result.reserve = await stats.nth(1).innerText().catch(() => 'N/A');
      result.endWeek = await stats.nth(2).innerText().catch(() => 'N/A');
    }
  } else {
    result.outcome = gameOver ? 'GAME OVER (no overlay)' : `Survived to week ${week}`;
  }

  result.conversations = conversationsHad;
  result.policies = policiesSigned;

  console.log(`  RUN ${id}/10 [DONE]: ${result.outcome} | Week ${result.endWeek || week} | Resilience: ${result.resilience || 'N/A'} | Reserve: ${result.reserve || 'N/A'}`);

  await page.close();
  return result;
}

// ═══════════════════════════════════════════════════
// Main: run with concurrency limit of 3
// ═══════════════════════════════════════════════════

async function main() {
  console.log('MANDATE — 10-Run Simulation Batch');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Strategies: ${[...new Set(SIMULATIONS.map(s => s.strategy))].join(', ')}`);
  console.log(`Max weeks: ${MAX_WEEKS}`);
  console.log(`Running in parallel with a concurrency limit of 3...\n`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  const queue = [...SIMULATIONS];

  async function worker() {
    while (queue.length > 0) {
      const config = queue.shift();
      try {
        const result = await runSimulation(browser, config);
        results.push(result);
      } catch (err) {
        console.error(`  ✗ Run ${config.id} failed: ${err.message}`);
        results.push({
          id: config.id,
          label: config.label,
          strategy: config.strategy,
          outcome: 'ERROR',
          error: err.message,
          week: 'N/A',
          resilience: 'N/A',
          reserve: 'N/A',
          conversations: 0,
          policies: 0,
          duration: 0
        });
      }
    }
  }

  // Start 3 concurrent workers
  const workers = Array.from({ length: 3 }, () => worker());
  await Promise.all(workers);

  await browser.close();

  // Sort results by ID
  results.sort((a, b) => a.id - b.id);

  // Write JSON results
  writeFileSync('simulation_results.json', JSON.stringify(results, null, 2));
  console.log('\n✓ Results saved to simulation_results.json');

  // Print summary table
  console.log('\n' + '═'.repeat(110));
  console.log('  SUMMARY');
  console.log('═'.repeat(110));
  console.log(`${'Run'.padEnd(6)} ${'Label'.padEnd(28)} ${'Outcome'.padEnd(22)} ${'Week'.padEnd(8)} ${'Resil'.padEnd(8)} ${'Reserve'.padEnd(10)} ${'Convos'.padEnd(8)} ${'Policies'.padEnd(10)} ${'Time'.padEnd(8)}`);
  console.log('─'.repeat(110));

  for (const r of results) {
    const time = r.duration ? `${Math.round(r.duration / 1000)}s` : '?';
    console.log(
      `${String(r.id).padEnd(6)} ${(r.label || '').padEnd(28)} ${(r.outcome || '?').slice(0, 20).padEnd(22)} ${String(r.endWeek || r.week || '?').padEnd(8)} ${String(r.resilience || '?').padEnd(8)} ${String(r.reserve || '?').padEnd(10)} ${String(r.conversations || 0).padEnd(8)} ${String(r.policies || 0).padEnd(10)} ${time.padEnd(8)}`
    );
  }

  console.log('═'.repeat(110));

  // Write markdown summary
  let md = '# Simulation Results (10 runs with balance tuning)\n\n';
  md += `**Date:** ${new Date().toISOString().slice(0, 10)}\n\n`;
  md += '| Run | Strategy | Outcome | Week | Resilience | Reserve | Conversations | Policies | Time |\n';
  md += '|---|---|---|---|---|---|---|---|---|\n';
  for (const r of results) {
    const time = r.duration ? `${Math.round(r.duration / 1000)}s` : '?';
    md += `| ${r.id} | ${r.label} | ${r.outcome || '?'} | ${r.endWeek || r.week || '?'} | ${r.resilience || '?'} | ${r.reserve || '?'} | ${r.conversations || 0} | ${r.policies || 0} | ${time} |\n`;
  }
  writeFileSync('simulation_results.md', md);
  console.log('✓ Markdown summary saved to simulation_results.md');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
