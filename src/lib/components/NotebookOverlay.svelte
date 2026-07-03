<script>
  import { game } from '$lib/stores/game.js';
  import { districtMap } from '$data/districts.js';
  import { bus } from '$lib/engine.js';

  let { visible = false, onclose } = $props();

  let showDeadInsights = $state(false);

  let patterns = $derived($game.patterns || []);
  let formingPatterns = $derived(patterns.filter(p => p.forming && !p.crystallized));
  let crystallizedPatterns = $derived(patterns.filter(p => p.crystallized));

  let freshInsights = $derived(($game.insights || []).filter(i => i.freshness > 0.3));
  let staleInsights = $derived(($game.insights || []).filter(i => i.freshness > 0 && i.freshness <= 0.3));
  let deadInsights = $derived(($game.insights || []).filter(i => i.freshness <= 0));

  function groupByDistrict(insights) {
    const grouped = {};
    for (const ins of insights) {
      if (!grouped[ins.districtId]) grouped[ins.districtId] = [];
      grouped[ins.districtId].push(ins);
    }
    return Object.entries(grouped);
  }

  function freshnessColor(pct) {
    if (pct > 60) return '#2A9E5C';
    if (pct > 30) return '#E8A020';
    return '#B82A18';
  }

  function handleAbandonPattern(category) {
    bus.emit('pattern.abandon', { category });
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="nb-overlay" onclick={onclose}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="nb-panel" onclick={(e) => e.stopPropagation()}>
      <div class="nb-header">
        <span class="nb-title">FIELD NOTEBOOK</span>
        <span class="nb-count">{($game.insights || []).length} insights · {patterns.length} patterns</span>
        <button class="nb-close" onclick={onclose}>&times;</button>
      </div>

      <div class="nb-body">
        <!-- Forming patterns -->
        {#if formingPatterns.length > 0}
          <div class="nb-section">
            <div class="nb-section-title">FORMING ({formingPatterns.length})</div>
            {#each formingPatterns as p}
              {@const weeksLeft = 3 - ($game.week - (p.cookStart || p.week))}
              <div class="nb-pattern forming">
                <div class="nb-pattern-cat">{p.category}</div>
                <div class="nb-pattern-text">{p.text}</div>
                <div class="nb-pattern-cook">Crystallizes in ~{Math.max(1, weeksLeft)} week{weeksLeft !== 1 ? 's' : ''}</div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Crystallized patterns -->
        {#if crystallizedPatterns.length > 0}
          <div class="nb-section">
            <div class="nb-section-title">CRYSTALLIZED ({crystallizedPatterns.length})</div>
            {#each crystallizedPatterns as p}
              <div class="nb-pattern crystallized">
                <div class="nb-pattern-header">
                  <div class="nb-pattern-cat">{p.category}</div>
                  <button class="nb-abandon" onclick={() => handleAbandonPattern(p.category)} title="Abandon pattern ($0.3B)">abandon</button>
                </div>
                <div class="nb-pattern-text">{p.text}</div>
                <div class="nb-pattern-effect">Department lens +1 · Active since week {p.crystallizedWeek || p.week}</div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Fresh insights -->
        {#if freshInsights.length > 0}
          <div class="nb-section">
            <div class="nb-section-title">FRESH INSIGHTS ({freshInsights.length})</div>
            {#each groupByDistrict(freshInsights) as [districtId, insights]}
              {@const d = districtMap[districtId]}
              <div class="nb-district">
                <div class="nb-district-name">{d?.name || districtId}</div>
                {#each insights as ins}
                  {@const pct = Math.round(ins.freshness * 100)}
                  <div class="nb-insight">
                    <span class="nb-cat {ins.category}">{ins.category}</span>
                    <div class="nb-insight-text">{ins.text}</div>
                    <div class="nb-freshness">
                      <div class="nb-freshness-fill" style="width:{pct}%; background:{freshnessColor(pct)}"></div>
                    </div>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        {/if}

        <!-- Stale insights -->
        {#if staleInsights.length > 0}
          <div class="nb-section">
            <div class="nb-section-title">STALE ({staleInsights.length})</div>
            {#each groupByDistrict(staleInsights) as [districtId, insights]}
              {@const d = districtMap[districtId]}
              <div class="nb-district">
                <div class="nb-district-name">{d?.name || districtId} <span class="stale-tag">FADING</span></div>
                {#each insights as ins}
                  <div class="nb-insight stale">
                    <span class="nb-cat {ins.category}">{ins.category}</span>
                    <div class="nb-insight-text">{ins.text}</div>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        {/if}

        <!-- Dead insights -->
        {#if deadInsights.length > 0}
          <div class="nb-section">
            <button class="nb-dead-toggle" onclick={() => showDeadInsights = !showDeadInsights}>
              Expired ({deadInsights.length}) {showDeadInsights ? '▴' : '▾'}
            </button>
            {#if showDeadInsights}
              {#each deadInsights as ins}
                <div class="nb-insight dead">
                  <span class="nb-cat {ins.category}">{ins.category}</span>
                  <div class="nb-insight-text">{ins.text}</div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}

        {#if freshInsights.length === 0 && staleInsights.length === 0 && patterns.length === 0}
          <div class="nb-empty">Visit districts and have conversations to gather insights.</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .nb-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
    background: rgba(0,0,0,0.3);
  }
  .nb-panel {
    width: 380px;
    max-width: 45vw;
    height: calc(100% - 32px);
    margin: 16px 16px 16px 0;
    background: var(--paper-card);
    backdrop-filter: blur(16px);
    border: 1px solid var(--rule);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: nb-slide 0.25s ease;
  }
  @keyframes nb-slide {
    from { transform: translateX(30px); opacity: 0.5; }
    to { transform: translateX(0); opacity: 1; }
  }

  .nb-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--rule);
    flex-shrink: 0;
  }
  .nb-title {
    font-family: var(--font-display);
    font-size: 18px;
    letter-spacing: 3px;
  }
  .nb-count {
    font-size: 10px;
    color: var(--ink-muted);
    margin-left: auto;
  }
  .nb-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--ink-muted);
    padding: 0 4px;
  }

  .nb-body {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .nb-section {
    padding: 14px 18px;
    border-bottom: 1px solid var(--rule);
  }
  .nb-section-title {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--ink-muted);
    margin-bottom: 10px;
  }

  /* Patterns */
  .nb-pattern {
    padding: 10px 12px;
    margin-bottom: 8px;
  }
  .nb-pattern.forming {
    background: rgba(139,92,246,0.06);
    border: 1px solid rgba(139,92,246,0.2);
  }
  .nb-pattern.crystallized {
    background: rgba(34,197,94,0.06);
    border: 1px solid rgba(34,197,94,0.2);
  }
  .nb-pattern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .nb-pattern-cat {
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .nb-pattern.forming .nb-pattern-cat { color: #8b5cf6; }
  .nb-pattern.crystallized .nb-pattern-cat { color: #16a34a; }
  .nb-pattern-text {
    font-size: 12px;
    color: var(--ink);
    margin-top: 4px;
    line-height: 1.4;
  }
  .nb-pattern-cook {
    font-size: 10px;
    color: #8b5cf6;
    margin-top: 4px;
  }
  .nb-pattern-effect {
    font-size: 10px;
    color: #16a34a;
    margin-top: 4px;
  }
  .nb-abandon {
    font-size: 9px;
    color: var(--ink-muted);
    background: none;
    border: 1px solid var(--rule);
    padding: 2px 8px;
    cursor: pointer;
    font-family: var(--font-body);
    letter-spacing: 0.04em;
  }
  .nb-abandon:hover {
    border-color: var(--red);
    color: var(--red);
  }

  /* Districts + insights */
  .nb-district {
    margin-bottom: 14px;
  }
  .nb-district-name {
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .stale-tag {
    font-size: 8px;
    color: var(--amber);
    letter-spacing: 0.06em;
    font-weight: 700;
  }

  .nb-insight {
    background: var(--paper-white);
    border: 1px solid var(--rule);
    padding: 8px 10px;
    margin-bottom: 6px;
  }
  .nb-insight.stale {
    border-style: dashed;
    opacity: 0.6;
  }
  .nb-insight.dead {
    opacity: 0.3;
    text-decoration: line-through;
  }

  .nb-cat {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 1px 6px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .nb-cat.HEALTH   { background: #fef3c7; color: #92400e; }
  .nb-cat.HOUSING  { background: #dbeafe; color: #1e40af; }
  .nb-cat.INFRA    { background: #e0e7ff; color: #3730a3; }
  .nb-cat.SERVICES { background: #fce7f3; color: #9d174d; }
  .nb-cat.SAFETY   { background: #fee2e2; color: #991b1b; }
  .nb-cat.ASSET    { background: #d1fae5; color: #065f46; }
  .nb-cat.COMMUNITY { background: #d1fae5; color: #065f46; }

  .nb-insight-text {
    font-size: 12px;
    color: var(--ink);
    line-height: 1.4;
  }

  .nb-freshness {
    height: 3px;
    background: var(--rule-light);
    margin-top: 6px;
    overflow: hidden;
  }
  .nb-freshness-fill {
    height: 100%;
    transition: width 0.3s;
  }

  .nb-dead-toggle {
    font-size: 11px;
    color: var(--ink-muted);
    cursor: pointer;
    background: none;
    border: none;
    font-family: var(--font-body);
    width: 100%;
    text-align: left;
    padding: 4px 0;
  }
  .nb-dead-toggle:hover { color: var(--ink); }

  .nb-empty {
    padding: 40px 18px;
    text-align: center;
    color: var(--ink-muted);
    font-size: 12px;
  }
</style>
