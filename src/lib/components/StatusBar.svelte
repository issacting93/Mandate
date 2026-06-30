<script>
  import { game, blizzardSeverity } from '$lib/stores/game.js';
  import { DISTRICTS } from '$data/districts.js';

  // Compute citywide resilience from DISTRICTS array (mutable trust field)
  let resilience = $derived(
    Math.round(DISTRICTS.reduce((sum, d) => sum + d.trust, 0) / DISTRICTS.length)
  );

  let disorder = $derived($game.citywideDisorder ?? 10);

  let resilienceColor = $derived(
    resilience >= 60 ? '#34d399' : resilience >= 40 ? '#e8a83e' : '#ff2d2d'
  );

  let disorderColor = $derived(
    disorder >= 70 ? '#ff2d2d' : disorder >= 40 ? '#e8a83e' : '#9a9a9a'
  );

  // Disorder flashes red when critical (>= 75)
  let disorderCritical = $derived(disorder >= 75);
</script>

<header class="status-bar">
  <span class="logo">MANDATE</span>

  <div class="status-centre">
    <!-- Dual Metre -->
    <div class="metre-pair">
      <div class="metre">
        <span class="metre-label">RESILIENCE</span>
        <div class="metre-bar">
          <div class="metre-fill resilience" style="width:{resilience}%; background:{resilienceColor}"></div>
        </div>
        <span class="metre-val" style="color:{resilienceColor}">{resilience}</span>
      </div>
      <div class="metre">
        <span class="metre-label">DISORDER</span>
        <div class="metre-bar">
          <div class="metre-fill disorder" class:critical={disorderCritical} style="width:{disorder}%; background:{disorderColor}"></div>
        </div>
        <span class="metre-val" style="color:{disorderColor}">{disorder}</span>
      </div>
    </div>
  </div>

  <div class="status-items">
    <span class="status-item">
      WK <strong>{String($game.week).padStart(2, '0')}/48</strong>
    </span>
    <span class="status-item">
      <span class="material-symbols-rounded" style="font-size:14px">account_balance</span>
      ${$game.reserve.toFixed(1)}B
    </span>
    <span class="status-item severity" style="color: {$blizzardSeverity > 0.5 ? '#ff4444' : '#9a9a9a'}">
      <span class="material-symbols-rounded" style="font-size:14px">ac_unit</span>
      {Math.round($blizzardSeverity * 100)}%
    </span>
  </div>
</header>

<style>
  .status-bar {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: var(--dark);
    color: #fff;
    font-size: 12px;
    position: relative;
    z-index: 20;
    flex-shrink: 0;
    gap: 16px;
  }
  .logo {
    font-family: var(--font-data);
    font-weight: 900;
    font-size: 16px;
    letter-spacing: 0.15em;
    color: var(--red);
    flex-shrink: 0;
  }

  /* ── Dual Metre ── */
  .status-centre {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  .metre-pair {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .metre {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .metre-label {
    font-family: var(--font-data);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.4);
    width: 62px;
    text-align: right;
  }
  .metre-bar {
    width: 80px;
    height: 6px;
    background: rgba(255,255,255,0.08);
    border-radius: 3px;
    overflow: hidden;
  }
  .metre-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease, background 0.3s ease;
  }
  .metre-fill.critical {
    animation: pulse-danger 1.5s ease-in-out infinite;
  }
  .metre-val {
    font-family: var(--font-data);
    font-weight: 900;
    font-size: 13px;
    width: 24px;
    text-align: right;
    transition: color 0.3s ease;
  }

  @keyframes pulse-danger {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ── Right items ── */
  .status-items {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-shrink: 0;
  }
  .status-item {
    font-family: var(--font-data);
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .severity {
    transition: color 0.3s ease;
  }
</style>
