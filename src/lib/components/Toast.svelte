<script>
  import { toastMessage } from '$lib/stores/game.js';

  let visible = $state(false);
  let text = $state('');
  let color = $state(null);
  let hideTimer;

  $effect(() => {
    const msg = $toastMessage;
    if (msg && msg.text) {
      text = msg.text;
      color = msg.color || null;
      visible = true;

      // Clear any existing timer
      clearTimeout(hideTimer);

      // Auto-hide after 2 seconds
      hideTimer = setTimeout(() => {
        visible = false;
      }, 2000);

      // Don't set store back to null inside the effect — that causes infinite loop
    }
  });
</script>

{#if text}
  <div class="map-toast" class:visible>
    {#if color}
      <span class="accent" style="background:{color}"></span>
    {/if}
    {text}
  </div>
{/if}

<style>
  .map-toast {
    position: fixed;
    top: 50px;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
    background: var(--dark, #1a1a1a);
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-ui);
    z-index: 9000;
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
    pointer-events: none;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .map-toast.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .accent {
    width: 3px;
    min-height: 16px;
    border-radius: 1px;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
  }
</style>
