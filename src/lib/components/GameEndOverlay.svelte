<script>
  import { gameEndData, game } from '$lib/stores/game.js';

  function restart() {
    location.reload();
  }
</script>

{#if $gameEndData}
  {@const data = $gameEndData}
  {@const message = data.message || ''}
  {@const isWin = data.isWin}
  {@const titleText = message.includes('\u2014') ? message.split('\u2014')[0].trim() : message}
  {@const subtitleText = message.includes('\u2014') ? message.split('\u2014')[1].trim() : ''}
  {@const resilience = data.resilience ?? 0}
  {@const reserve = data.reserve ?? 0}
  {@const week = data.week ?? 0}

  <div class="game-end-overlay">
    <div class="game-end-content">
      <div class="result-label">
        {isWin ? 'Victory' : 'Defeat'}
      </div>

      <div class="divider"></div>

      <div class="result-title" class:win={isWin} class:lose={!isWin}>
        {titleText}
      </div>

      <div class="divider"></div>

      {#if subtitleText}
        <div class="result-subtitle">
          {subtitleText}
        </div>
      {/if}

      <div class="stats-row">
        <div class="stat">
          <div class="stat-label">Resilience</div>
          <div class="stat-value" class:good={resilience >= 50} class:bad={resilience < 50}>
            {resilience}%
          </div>
        </div>
        <div class="stat">
          <div class="stat-label">Reserve</div>
          <div class="stat-value" class:good={reserve >= 0} class:bad={reserve < 0}>
            ${reserve.toFixed(1)}B
          </div>
        </div>
        <div class="stat">
          <div class="stat-label">Week</div>
          <div class="stat-value">{week}</div>
        </div>
      </div>

      <!-- Per-district outcomes -->
      {#if $game.disasterOutcomes}
        <div class="district-outcomes">
          <div class="outcomes-label">DISTRICT REPORT</div>
          <div class="outcomes-grid">
            {#each Object.values($game.disasterOutcomes) as o}
              <div class="outcome-row">
                <span class="outcome-name">{o.name}</span>
                <span class="outcome-status" style="color:{o.color}">{o.status}</span>
                <span class="outcome-score" style="color:{o.color}">{o.score}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <button class="restart-btn" onclick={restart}>Play Again</button>
    </div>
  </div>
{/if}

<style>
  .game-end-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.92) 70%);
    animation: fadeIn 0.5s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .game-end-content {
    text-align: center;
    color: #fff;
    max-width: 480px;
    padding: 40px;
  }
  .result-label {
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    font-weight: 600;
  }
  .divider {
    margin: 12px auto;
    width: 200px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }
  .result-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin: 8px 0;
  }
  .result-title.win { color: #34d399; }
  .result-title.lose { color: #ff5a52; }
  .result-subtitle {
    font-size: 12.5px;
    color: rgba(255,255,255,0.6);
    line-height: 1.55;
    margin-top: 8px;
  }
  .stats-row {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin: 20px 0;
  }
  .stat {
    text-align: center;
  }
  .stat-label {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
  }
  .stat-value {
    font-family: var(--font-data);
    font-size: 22px;
    font-weight: 900;
    color: #fff;
  }
  .stat-value.good { color: #34d399; }
  .stat-value.bad { color: #ff5a52; }
  /* ── District Outcomes ── */
  .district-outcomes {
    margin-top: 20px;
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;
  }
  .outcomes-label {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(255,255,255,0.35);
    margin-bottom: 10px;
    text-align: left;
  }
  .outcomes-grid {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-height: 280px;
    overflow-y: auto;
  }
  .outcome-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: rgba(255,255,255,0.04);
    border-radius: 4px;
    font-size: 11px;
  }
  .outcome-name {
    flex: 1;
    color: rgba(255,255,255,0.7);
    text-align: left;
  }
  .outcome-status {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    width: 64px;
    text-align: right;
  }
  .outcome-score {
    font-family: var(--font-data);
    font-size: 12px;
    font-weight: 900;
    width: 28px;
    text-align: right;
  }

  .restart-btn {
    margin-top: 16px;
    border: 1px solid rgba(255,255,255,0.2);
    background: transparent;
    color: #fff;
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 10px 32px;
    border-radius: 20px;
    cursor: pointer;
  }
  .restart-btn:hover {
    border-color: rgba(255,255,255,0.4);
  }
</style>
