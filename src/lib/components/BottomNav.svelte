<script>
  import { currentView } from '$lib/stores/game.js';

  const tabs = [
    { id: 'map', label: 'MAP', icon: 'map' },
    { id: 'calendar', label: 'CALENDAR', icon: 'calendar_month' },
    { id: 'socials', label: 'SOCIALS', icon: 'forum' },
  ];
</script>

<nav class="bottom-nav">
  {#each tabs as tab}
    <button
      class="nav-tab"
      class:active={$currentView === tab.id}
      onclick={() => currentView.set(tab.id)}
    >
      <span class="material-symbols-rounded">{tab.icon}</span>
      {tab.label}
    </button>
  {/each}
</nav>

<style>
  .bottom-nav {
    height: 48px;
    display: flex;
    border-top: 1px solid var(--panel-border);
    background: var(--panel-bg);
    backdrop-filter: blur(12px);
    position: relative;
    z-index: 20;
    flex-shrink: 0;
  }
  .nav-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: none;
    background: transparent;
    font-family: var(--font-data);
    font-size: 11px;
    font-weight: 700;
    color: var(--muted);
    cursor: pointer;
    transition: color 0.15s ease;
  }
  .nav-tab.active { color: var(--red); }
  .nav-tab:hover { color: var(--dark); }
  .nav-tab .material-symbols-rounded { font-size: 18px; }
</style>
