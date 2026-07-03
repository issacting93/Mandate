<script>
  import { currentView, game } from '$lib/stores/game.js';

  let unreadCount = $derived(($game.dms || []).filter(dm => dm.unread).length);

  const tabs = [
    { id: 'map', label: 'MAP', icon: 'map' },
    { id: 'draft', label: 'DRAFT', icon: 'style' },
    { id: 'intel', label: 'INTEL', icon: 'forum' },
  ];
</script>

<nav class="bottom-nav">
  {#each tabs as tab}
    <button
      class="nav-tab"
      class:active={$currentView === tab.id}
      onclick={() => currentView.set(tab.id)}
    >
      <span class="tab-icon-wrap">
        <span class="material-symbols-rounded">{tab.icon}</span>
        {#if tab.id === 'intel' && unreadCount > 0}
          <span class="unread-badge">{unreadCount}</span>
        {/if}
      </span>
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
    font-family: var(--font-body);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--muted);
    cursor: pointer;
    transition: color 0.15s ease;
  }
  .nav-tab.active { color: var(--red); }
  .nav-tab:hover { color: var(--dark); }
  .nav-tab .material-symbols-rounded { font-size: 18px; }
  .tab-icon-wrap { position: relative; display: inline-flex; }
  .unread-badge {
    position: absolute;
    top: -4px;
    right: -8px;
    min-width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--red);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    font-family: var(--font-body);
  }
</style>
