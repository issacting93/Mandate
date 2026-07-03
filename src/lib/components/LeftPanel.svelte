<script>
  import { game } from '$lib/stores/game.js';
  import { DISTRICTS } from '$data/districts.js';

  const BLIZZARD_WEEK = 48;
  const TOTAL_CREDIT = 7;

  let weeksLeft = $derived(Math.max(0, BLIZZARD_WEEK - $game.week));

  let countdownColor = $derived(
    $game.week >= BLIZZARD_WEEK ? '#B82A18'
    : weeksLeft <= 8 ? '#B82A18'
    : weeksLeft <= 20 ? '#E8A020'
    : '#fff'
  );

  let countdownText = $derived(
    $game.week >= BLIZZARD_WEEK ? 'NOW'
    : weeksLeft === 1 ? '1 WEEK'
    : `${weeksLeft} WEEKS`
  );

  let countdownSub = $derived(
    $game.week >= BLIZZARD_WEEK ? 'The storm is here.'
    : weeksLeft <= 8 ? 'Time is running out.'
    : weeksLeft <= 20 ? 'Models converging. Prepare now.'
    : 'Listen to the city before the storm does.'
  );

  // Preparation checklist items
  let visitedCount = $derived(DISTRICTS.filter(d => d.lastVisited !== null).length);
  let insightCount = $derived($game.insights.length);
  let patternCount = $derived($game.patterns.length);
  let citywide = $derived(Math.round(DISTRICTS.reduce((sum, d) => sum + d.trust, 0) / DISTRICTS.length));

  let prepItems = $derived([
    { done: visitedCount >= 5, text: `Visit 5+ districts (${visitedCount}/5)` },
    { done: insightCount >= 3, text: `Discover 3 insights (${insightCount}/3)` },
    { done: patternCount >= 1, text: `Identify a cross-district pattern (${patternCount}/1)` },
    { done: citywide >= 50, text: `Build resilience above 50% (${citywide}%)` },
  ]);

  // Public credit: filled dots based on how many prep items are done + base 3
  let filledCredits = $derived(Math.min(TOTAL_CREDIT, 3 + prepItems.filter(i => i.done).length));
</script>

<aside class="panel left-panel">
  <!-- Current Objective -->
  <div>
    <div class="section-title">CURRENT OBJECTIVE</div>
    <div class="obj-title">Build Resilience Before the Storm</div>
    <div class="obj-desc">
      Every conversation maps vulnerabilities the city can't see from City Hall.
    </div>
  </div>

  <div class="divider"></div>

  <!-- Blizzard Countdown -->
  <div class="clock">
    <div class="clock-label">&#10052; BLIZZARD ARRIVING IN</div>
    <div class="clock-time" style:color={countdownColor}>{countdownText}</div>
    <div class="clock-sub">{countdownSub}</div>
  </div>

  <div class="divider"></div>

  <!-- Preparation Checklist -->
  <div>
    <div class="section-title">PREPARATION</div>
    <ul class="checklist">
      {#each prepItems as item}
        <li>
          <span class="check" class:done={item.done}>
            {#if item.done}&#10003;{/if}
          </span>
          {item.text}
        </li>
      {/each}
    </ul>
  </div>

  <div class="divider"></div>

  <!-- Public Credit -->
  <div>
    <div class="section-title">PUBLIC CREDIT</div>
    <div class="credit-dots">
      {#each Array(TOTAL_CREDIT) as _, i}
        <span class="credit-dot" class:filled={i < filledCredits}></span>
      {/each}
    </div>
  </div>
</aside>

<style>
  .left-panel {
    width: 280px;
    padding: 20px 18px;
    background: var(--panel-bg);
    backdrop-filter: blur(12px);
    border-right: 1px solid var(--panel-border);
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow-y: auto;
  }

  .section-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .obj-title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
    margin-bottom: 4px;
  }

  .obj-desc {
    font-size: 12px;
    color: var(--secondary);
    line-height: 1.5;
  }

  .divider {
    height: 1px;
    background: var(--divider);
  }

  /* Clock */
  .clock {
    background: var(--dark);
    border-radius: 0;
    padding: 12px 14px;
    color: #fff;
  }
  .clock-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 6px;
  }
  .clock-time {
    font-family: var(--font-display);
    font-size: 32px;
    letter-spacing: 2px;
  }
  .clock-sub {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 4px;
  }

  /* Checklist */
  .checklist {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    margin: 0;
  }
  .checklist li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12px;
    color: var(--secondary);
    line-height: 1.4;
  }
  .check {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1.5px solid var(--panel-border);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    margin-top: 1px;
  }
  .check.done {
    background: var(--dark);
    border-color: var(--dark);
    color: #fff;
  }

  /* Credit dots */
  .credit-dots {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }
  .credit-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1.5px solid var(--panel-border);
  }
  .credit-dot.filled {
    background: var(--red);
    border-color: var(--red);
  }
</style>
