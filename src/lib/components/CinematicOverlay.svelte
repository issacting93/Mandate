<script>
  import { cinematicData } from '$lib/stores/game.js';

  let visible = $state(false);
  let contentVisible = $state(false);

  $effect(() => {
    const data = $cinematicData;
    if (data) {
      visible = true;
      // Fade in content after overlay appears
      requestAnimationFrame(() => {
        contentVisible = true;
      });
    }
  });

  function dismiss() {
    contentVisible = false;
    visible = false;
    setTimeout(() => {
      cinematicData.set(null);
    }, 500);
  }
</script>

{#if $cinematicData}
  <div class="cinematic-overlay" class:visible>
    <div class="cinematic-content" class:contentVisible>
      <div class="label">
        {#if $cinematicData.isDanger}
          &#10052; Weather Alert
        {:else}
          Intelligence Report
        {/if}
      </div>

      <div class="divider"></div>

      <div class="headline" class:danger={$cinematicData.isDanger}>
        {$cinematicData.headline}
      </div>

      <div class="divider"></div>

      <div class="narrative">
        {$cinematicData.narrative}
      </div>

      <button class="dismiss-btn" onclick={dismiss}>I see</button>
    </div>
  </div>
{/if}

<style>
  .cinematic-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
    display: grid;
    place-items: center;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.93) 70%);
    opacity: 0;
    transition: opacity 0.5s;
  }
  .cinematic-overlay.visible {
    opacity: 1;
  }
  .cinematic-content {
    text-align: center;
    color: #fff;
    max-width: 480px;
    padding: 40px;
    opacity: 0;
    transition: opacity 0.5s 0.15s;
  }
  .cinematic-content.contentVisible {
    opacity: 1;
  }
  .label {
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    font-weight: 600;
  }
  .divider {
    margin: 12px auto;
    width: 200px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }
  .headline {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--amber);
  }
  .headline.danger {
    color: var(--red);
  }
  .narrative {
    font-size: 12.5px;
    color: rgba(255,255,255,0.6);
    line-height: 1.55;
    margin-top: 12px;
    max-width: 360px;
    margin-left: auto;
    margin-right: auto;
  }
  .dismiss-btn {
    margin-top: 20px;
    border: 1px solid rgba(255,255,255,0.2);
    background: transparent;
    color: #fff;
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 10px 32px;
    cursor: pointer;
  }
  .dismiss-btn:hover {
    border-color: rgba(255,255,255,0.4);
  }
</style>
