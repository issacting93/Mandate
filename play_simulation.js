import { chromium } from 'playwright';

const strategy = process.argv[2] || 'balanced';
console.log(`Starting simulation with strategy: ${strategy}`);

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set default timeout for all actions to 1 second to avoid 30s hangs
  page.setDefaultTimeout(1000);
  
  // Set window size
  await page.setViewportSize({ width: 1280, height: 800 });

  // Load game
  console.log('Navigating to http://localhost:8000...');
  await page.goto('http://localhost:8000');
  await page.waitForLoadState('networkidle');

  // Handle onboarding (skip if possible)
  console.log('Checking for onboarding...');
  try {
    const skipBtn = page.locator('.skip-btn').first();
    await skipBtn.waitFor({ state: 'visible', timeout: 4000 });
    await skipBtn.click();
    console.log('Onboarding skipped.');
  } catch (e) {
    console.log('No onboarding skip button found or timed out. Proceeding...');
  }

  await page.waitForTimeout(500);

  let week = 1;
  let gameOver = false;

  while (week <= 48 && !gameOver) {
    console.log(`\n--- Week ${week} ---`);

    // Check for cinematic events overlay
    const dismissBtn = page.locator('.dismiss-btn:has-text("I see")').first();
    if (await dismissBtn.isVisible()) {
      console.log('Cinematic overlay visible. Dismissing...');
      await dismissBtn.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Check if game over overlay is visible
    const endOverlay = page.locator('.game-end-overlay').first();
    if (await endOverlay.isVisible()) {
      console.log('Game over overlay detected!');
      gameOver = true;
      break;
    }

    // Navigate to Draft View if not already there
    const draftTab = page.locator('.nav-tab:has-text("DRAFT")').first();
    if (await draftTab.isVisible()) {
      await draftTab.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // STRATEGY ACTIONS (PRE-GO)
    if (strategy === 'technocrat') {
      // Fund random department
      const plusButtons = page.locator('.w-dept-ctrl button:has-text("+")');
      const count = await plusButtons.count().catch(() => 0);
      if (count > 0) {
        // Try upgrading 3 times if budget allows
        for (let k = 0; k < 3; k++) {
          const randomIndex = Math.floor(Math.random() * count);
          const btn = plusButtons.nth(randomIndex);
          try {
            if (await btn.isVisible() && await btn.isEnabled()) {
              console.log(`Technocrat funding department ${randomIndex}...`);
              await btn.click();
              await page.waitForTimeout(150);
              
              // Handle doctrine choice if it appears immediately
              const doctrineBtns = page.locator('.w-doctrine-btn');
              if (await doctrineBtns.first().isVisible()) {
                console.log('Doctrine choice surfaced. Clicking option A...');
                await doctrineBtns.first().click();
                await page.waitForTimeout(200);
              }
            }
          } catch (e) {
            // Safe to ignore if button missing/disabled
          }
        }
      }
    } else if (strategy === 'balanced') {
      // Balanced: fund department with lowest level or random
      const plusButtons = page.locator('.w-dept-ctrl button:has-text("+")');
      const count = await plusButtons.count().catch(() => 0);
      if (count > 0 && Math.random() < 0.5) { // 50% chance to upgrade
        const randomIndex = Math.floor(Math.random() * count);
        const btn = plusButtons.nth(randomIndex);
        try {
          if (await btn.isVisible() && await btn.isEnabled()) {
            console.log(`Balanced funding department ${randomIndex}...`);
            await btn.click();
            await page.waitForTimeout(150);
            
            // Handle doctrine choice
            const doctrineBtns = page.locator('.w-doctrine-btn');
            if (await doctrineBtns.first().isVisible()) {
              console.log('Doctrine choice surfaced. Clicking option A...');
              await doctrineBtns.first().click();
              await page.waitForTimeout(200);
            }
          }
        } catch (e) {}
      }
    }

    // DRAFT CARDS
    const openSlots = page.locator('.w-slot:has-text("Open Slot")');
    const openSlotsCount = await openSlots.count().catch(() => 0);
    console.log(`Drafting cards. Open slots: ${openSlotsCount}`);
    
    for (let i = 0; i < openSlotsCount; i++) {
      const cards = page.locator('.w-cards .w-card:not([disabled])');
      const cardsCount = await cards.count().catch(() => 0);
      if (cardsCount > 0) {
        let cardToDraft = cards.first();
        if (strategy === 'grassroots') {
          // Grassroots tries to draft character card if visible
          for (let j = 0; j < cardsCount; j++) {
            const card = cards.nth(j);
            const text = await card.innerText().catch(() => '');
            if (text.includes('lens active') || text.includes('lens')) {
              cardToDraft = card;
              break;
            }
          }
        }
        console.log('Selecting card to draft...');
        await cardToDraft.click().catch(() => {});
        await page.waitForTimeout(150);
      }
    }

    // EXECUTE WEEK
    console.log('Executing week...');
    const goBtn = page.locator('button.w-go:not([disabled])').first();
    if (await goBtn.isVisible()) {
      await goBtn.click().catch(() => {});
      await page.waitForTimeout(200);
    } else {
      console.log('No Execute Week button visible/enabled.');
    }

    // PLAY CONVERSATIONS
    console.log('Waiting for conversations...');
    let conversationsDone = false;
    let safeguard = 0;
    while (!conversationsDone && safeguard < 500) {
      safeguard++;
      const convoActive = await page.locator('.convo-panel').first().isVisible().catch(() => false);
      if (convoActive) {
        // Check for close button
        const closeBtn = page.locator('.convo-choice.close-btn').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          console.log('Ending conversation...');
          await closeBtn.click().catch(() => {});
          await page.waitForTimeout(400); // Wait for transition
          continue;
        }

        // Check for dialogue choices
        const choices = page.locator('.convo-choice');
        const count = await choices.count().catch(() => 0);
        if (count > 0) {
          if (strategy === 'technocrat') {
            // Technocrat: jump to solution immediately if possible
            const solChoice = page.locator('.convo-choice.solution-choice').first();
            if (await solChoice.isVisible().catch(() => false)) {
              console.log('Technocrat choosing Solution Jump...');
              await solChoice.click().catch(() => {});
            } else {
              console.log('Technocrat choosing first option...');
              await choices.first().click().catch(() => {});
            }
          } else {
            // Grassroots / Balanced: listen! Use dept options and avoid solution options
            const deptChoice = page.locator('.convo-choice.dept-choice').first();
            if (await deptChoice.isVisible().catch(() => false)) {
              console.log('Listening via Department Lens Option...');
              await deptChoice.click().catch(() => {});
            } else {
              // Find a non-solution choice
              let clicked = false;
              for (let j = 0; j < count; j++) {
                const choice = choices.nth(j);
                const classes = await choice.evaluate(el => el.className).catch(() => '');
                if (!classes.includes('solution-choice')) {
                  console.log(`Choosing non-solution option ${j}...`);
                  await choice.click().catch(() => {});
                  clicked = true;
                  break;
                }
              }
              if (!clicked) {
                console.log('No safe option found, choosing first option...');
                await choices.first().click().catch(() => {});
              }
            }
          }
          await page.waitForTimeout(200);
        } else {
          // Wait for typing indicator
          await page.waitForTimeout(100);
        }
      } else {
        // Gap check: wait 2000ms to see if next conversation starts (600ms transition delay + buffer)
        await page.waitForTimeout(2000);
        if (!(await page.locator('.convo-panel').first().isVisible().catch(() => false))) {
          conversationsDone = true;
          console.log('All conversations for this week completed.');
        }
      }
    }

    // DISMISS POST-CONVO CINEMATICS (e.g. Blizzard watch)
    const dismissBtnAfter = page.locator('.dismiss-btn:has-text("I see")').first();
    if (await dismissBtnAfter.isVisible().catch(() => false)) {
      await dismissBtnAfter.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Navigate to Draft View to end week
    console.log('Navigating to DRAFT view to end week...');
    if (await draftTab.isVisible()) {
      await draftTab.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // END WEEK
    console.log('Ending week...');
    const endWeekBtn = page.locator('button.w-end:not([disabled])').first();
    if (await endWeekBtn.isVisible()) {
      await endWeekBtn.click().catch(() => {});
      await page.waitForTimeout(400);
    }

    // WEEKEND DEBRIEF SCREEN
    const debrief = page.locator('.debrief-panel').first();
    if (await debrief.isVisible().catch(() => false)) {
      console.log('Debrief screen active.');

      // Balanced: build a bento policy if possible
      if (strategy === 'balanced' && Math.random() < 0.4) {
        const policyBtn = page.locator('.debrief-btn.policy-btn').first();
        if (await policyBtn.isVisible().catch(() => false)) {
          console.log('Balanced player opening Bento Box to build policy...');
          await policyBtn.click().catch(() => {});
          await page.waitForTimeout(300);

          // Place first tile if available
          const tiles = page.locator('.tile-card');
          if (await tiles.count().catch(() => 0) > 0) {
            await tiles.first().click().catch(() => {});
            await page.waitForTimeout(100);
            const cells = page.locator('.grid-cell');
            if (await cells.count().catch(() => 0) > 12) {
              await cells.nth(12).click().catch(() => {}); // center tile
              await page.waitForTimeout(150);
            }
            // Try to sign
            const signBtn = page.locator('.btn-sign:not([disabled])').first();
            if (await signBtn.isVisible().catch(() => false) && await signBtn.isEnabled().catch(() => false)) {
              console.log('Signing policy...');
              await signBtn.click().catch(() => {});
              await page.waitForTimeout(300);
            }
          }

          // Close bento if still open
          const closeBento = page.locator('.builder .close-btn').first();
          if (await closeBento.isVisible().catch(() => false)) {
            await closeBento.click().catch(() => {});
            await page.waitForTimeout(200);
          }
        }
      }

      // Proceed to next week
      const nextBtn = page.locator('.debrief-btn.next-btn').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click().catch(() => {});
        await page.waitForTimeout(400);
      }
    }

    // Read current week from UI or increment
    const weekNumText = await page.locator('.w-wk-num').first().innerText().catch(() => '');
    const parsedWeek = parseInt(weekNumText);
    if (!isNaN(parsedWeek) && parsedWeek > week) {
      week = parsedWeek;
    } else {
      week++;
    }

    // Double check game over overlay
    if (await page.locator('.game-end-overlay').first().isVisible().catch(() => false)) {
      console.log('Game over overlay detected!');
      gameOver = true;
    }
  }

  // GAME OVER - EXTRACT RESULTS
  console.log('\n================================');
  console.log('Simulation complete! Gathering results...');
  console.log('================================');
  
  const endOverlay = page.locator('.game-end-overlay').first();
  if (await endOverlay.isVisible().catch(() => false)) {
    const result = await page.locator('.result-label').first().innerText().catch(() => 'UNKNOWN');
    const title = await page.locator('.result-title').first().innerText().catch(() => 'UNKNOWN');
    const subtitle = await page.locator('.result-subtitle').first().innerText().catch(() => 'UNKNOWN');
    const stats = await page.locator('.stat-value');
    
    let resilience = 'N/A';
    let reserve = 'N/A';
    let endWeek = 'N/A';
    
    if (await stats.count().catch(() => 0) >= 3) {
      resilience = await stats.nth(0).innerText().catch(() => 'N/A');
      reserve = await stats.nth(1).innerText().catch(() => 'N/A');
      endWeek = await stats.nth(2).innerText().catch(() => 'N/A');
    }

    console.log(JSON.stringify({
      strategy,
      result,
      title,
      subtitle,
      resilience,
      reserve,
      week: endWeek
    }, null, 2));
  } else {
    console.log('Game did not trigger game over overlay.');
  }

  await browser.close();
}

run().catch(err => {
  console.error('Error during simulation:', err);
  process.exit(1);
});
