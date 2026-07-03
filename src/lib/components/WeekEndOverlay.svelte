<script>
  import { game } from '$lib/stores/game.js';
  import { advanceWeek, openBento, openComms, showToast } from '$lib/engine.js';
  import { DISTRICTS, districtMap } from '$data/districts.js';
  import { CONVERSATIONS as CONVERSATIONS_V1 } from '$data/conversations.js';
  import { CONVERSATIONS_V2 } from '$data/conversations_v2.js';
  const CONVERSATIONS = { ...CONVERSATIONS_V1, ...CONVERSATIONS_V2 };

  let { visible = false, onclose } = $props();

  // Snapshot the week's state when overlay opens
  let weekNum = $derived($game.week);
  let reserve = $derived($game.reserve);
  let projectedReserve = $derived(+(reserve - 0.375).toFixed(2));
  let resilience = $derived($game.citywide);
  let disorder = $derived($game.citywideDisorder);

  // What you did this week
  let visitedThisWeek = $derived(
    DISTRICTS.filter(d => d.lastVisited === $game.week)
  );
  let totalVisited = $derived(
    DISTRICTS.filter(d => d.lastVisited !== null).length
  );
  let unvisited = $derived(19 - totalVisited);

  let insights = $derived($game.insights || []);
  let freshInsights = $derived(insights.filter(i => i.freshness > 0.3));
  let thisWeekInsights = $derived(insights.filter(i => i.week === $game.week));

  let patterns = $derived($game.patterns || []);
  let formingPatterns = $derived(patterns.filter(p => p.forming && !p.crystallized));
  let crystallizedPatterns = $derived(patterns.filter(p => p.crystallized));
  let thisWeekPatterns = $derived(patterns.filter(p => p.week === $game.week));

  // DMs waiting
  let unreadDms = $derived(
    ($game.dms || []).filter(dm => dm.unread && dm.messages.length > 0)
  );

  // Blizzard countdown
  let weeksLeft = $derived(Math.max(0, 48 - $game.week));

  // Can build policy? (have insights)
  let canBuildPolicy = $derived(freshInsights.length >= 1);

  // Week rating
  let weekRating = $derived.by(() => {
    const visited = visitedThisWeek.length;
    const insightCount = thisWeekInsights.length;
    if (visited >= 3 && insightCount >= 4) return { label: 'PRODUCTIVE', color: '#2A9E5C' };
    if (visited >= 2 && insightCount >= 2) return { label: 'SOLID', color: '#E8A020' };
    if (visited >= 1) return { label: 'LIGHT', color: '#E8A020' };
    return { label: 'EMPTY', color: '#B82A18' };
  });

  function handleBuildPolicy() {
    openBento();
  }

  function handlePublishStatement() {
    openComms();
  }

  function handleNextWeek() {
    if (onclose) onclose();
    advanceWeek();
  }
</script>

{#if visible}
  <div class="debrief-overlay">
    <div class="debrief-panel">
      <!-- Header -->
      <div class="debrief-header">
        <span class="debrief-week">WEEK {String(weekNum).padStart(2, '0')} DEBRIEF</span>
        <span class="debrief-rating" style="color:{weekRating.color}">{weekRating.label}</span>
      </div>

      <div class="debrief-body">
        <!-- What you did -->
        <div class="debrief-section">
          <div class="section-label">WHAT YOU LEARNED</div>
          {#if visitedThisWeek.length > 0}
            <div class="debrief-visits">
              {#each visitedThisWeek as d}
                {@const convo = CONVERSATIONS[d.id]}
                <div class="visit-card">
                  <span class="visit-name">{d.name}</span>
                  {#if convo}
                    <span class="visit-char">{convo.character.name}</span>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <div class="debrief-empty">No districts visited this week.</div>
          {/if}

          {#if thisWeekInsights.length > 0}
            <div class="debrief-insights">
              {#each thisWeekInsights as ins}
                <div class="insight-row">
                  <span class="insight-cat">{ins.category}</span>
                  <span class="insight-text">{ins.text}</span>
                </div>
              {/each}
            </div>
          {/if}

          {#if thisWeekPatterns.length > 0}
            <div class="debrief-patterns">
              {#each thisWeekPatterns as p}
                <div class="pattern-row forming">
                  Pattern forming: <strong>{p.category}</strong> — crystallizes in ~3 weeks
                </div>
              {/each}
            </div>
          {/if}

          {#if crystallizedPatterns.length > 0}
            {#each crystallizedPatterns.filter(p => p.crystallizedWeek === weekNum) as p}
              <div class="pattern-row crystallized">
                Pattern crystallized: <strong>{p.category}</strong> — department lens +1
              </div>
            {/each}
          {/if}
        </div>

        <!-- What it cost -->
        <div class="debrief-section">
          <div class="section-label">WHAT IT COSTS</div>
          <div class="cost-grid">
            <div class="cost-item">
              <span class="cost-label">Reserve</span>
              <span class="cost-value">${reserve.toFixed(1)}B → ${projectedReserve}B</span>
              <span class="cost-delta">−$0.38B deficit</span>
            </div>
            <div class="cost-item">
              <span class="cost-label">Coverage</span>
              <span class="cost-value">{totalVisited}/19 districts heard</span>
              <span class="cost-delta">{unvisited} still unknown</span>
            </div>
          </div>
          {#if unvisited > 15}
            <div class="cost-warning">Most of the city is still dark. Knowledge is decaying in districts you haven't reached.</div>
          {:else if unvisited > 10}
            <div class="cost-note">Knowledge decaying in {unvisited} unvisited districts.</div>
          {/if}
        </div>

        <!-- What's coming -->
        <div class="debrief-section">
          <div class="section-label">WHAT'S COMING</div>
          <div class="coming-row">
            <span class="coming-icon">&#10052;</span>
            <span>Blizzard in <strong>{weeksLeft}</strong> weeks</span>
          </div>
          {#if unreadDms.length > 0}
            <div class="coming-dms">
              {#each unreadDms.slice(0, 3) as dm}
                <div class="dm-preview">
                  <span class="dm-avatar">{dm.initials}</span>
                  <span class="dm-name">{dm.characterName}</span>
                  <span class="dm-msg">{dm.messages[dm.messages.length - 1]?.text.substring(0, 50)}...</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Policy step -->
        <div class="debrief-section policy-section">
          {#if canBuildPolicy}
            <div class="section-label">BUILD A POLICY?</div>
            <div class="policy-prompt">
              You have {freshInsights.length} fresh insight{freshInsights.length !== 1 ? 's' : ''}. Turn what you've heard into action.
            </div>
            <button class="debrief-btn policy-btn" onclick={handleBuildPolicy}>
              ▦ Open Policy Builder
            </button>
          {:else}
            <div class="policy-prompt muted">
              No insights yet. Visit districts first — policy follows listening.
            </div>
          {/if}
        </div>
      </div>

      <!-- Statement step -->
      <div class="debrief-section statement-section">
        {#if canBuildPolicy}
          <div class="section-label">PUBLISH A STATEMENT?</div>
          <div class="policy-prompt">
            You have {freshInsights.length} fresh insight{freshInsights.length !== 1 ? 's' : ''}. Tell the city what you've heard.
          </div>
          <button class="debrief-btn statement-btn" onclick={handlePublishStatement}>
            ✎ Open Statement Builder
          </button>
        {:else}
          <div class="policy-prompt muted">
            Nothing to say. Visit districts first — you can only speak to what you've heard.
          </div>
        {/if}
      </div>

      <!-- Advance -->
      <div class="debrief-footer">
        <button class="debrief-btn next-btn" onclick={handleNextWeek}>
          NEXT WEEK →
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .debrief-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.5);
    animation: fade-in 0.3s ease;
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .debrief-panel {
    width: 520px;
    max-width: 90vw;
    max-height: 85vh;
    background: var(--paper-card);
    border: 1px solid var(--rule);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: panel-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes panel-up {
    from { transform: translateY(20px); opacity: 0.5; }
    to { transform: translateY(0); opacity: 1; }
  }

  .debrief-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: var(--ink);
    color: #fff;
  }
  .debrief-week {
    font-family: var(--font-display);
    font-size: 18px;
    letter-spacing: 3px;
  }
  .debrief-rating {
    font-family: var(--font-body);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
  }

  .debrief-body {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }

  .debrief-section {
    padding: 16px 24px;
    border-bottom: 1px solid var(--rule);
  }
  .debrief-section:last-child {
    border-bottom: none;
  }

  .section-label {
    font-family: var(--font-body);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--ink-muted);
    margin-bottom: 10px;
  }

  /* Visits */
  .debrief-visits {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .visit-card {
    background: var(--paper-white);
    border: 1px solid var(--rule);
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .visit-name {
    font-size: 13px;
    font-weight: 700;
  }
  .visit-char {
    font-size: 10px;
    color: var(--ink-muted);
  }

  .debrief-empty {
    font-size: 12px;
    color: var(--ink-muted);
    font-style: italic;
  }

  /* Insights */
  .debrief-insights {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .insight-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12px;
    line-height: 1.4;
  }
  .insight-cat {
    font-family: var(--font-body);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 1px 6px;
    background: var(--red-light);
    color: var(--red);
    flex-shrink: 0;
  }
  .insight-text {
    color: var(--ink);
  }

  /* Patterns */
  .debrief-patterns {
    margin-top: 8px;
  }
  .pattern-row {
    font-size: 12px;
    padding: 8px 12px;
    margin-bottom: 4px;
  }
  .pattern-row.forming {
    background: rgba(139,92,246,0.06);
    color: #7c3aed;
    border: 1px solid rgba(139,92,246,0.15);
  }
  .pattern-row.crystallized {
    background: rgba(34,197,94,0.06);
    color: #16a34a;
    border: 1px solid rgba(34,197,94,0.15);
  }

  /* Costs */
  .cost-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .cost-item {
    background: var(--paper-white);
    border: 1px solid var(--rule);
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .cost-label {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--ink-muted);
  }
  .cost-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
  }
  .cost-delta {
    font-size: 10px;
    color: var(--ink-muted);
  }
  .cost-warning {
    font-size: 11px;
    color: var(--amber);
    background: rgba(232,160,32,0.06);
    border: 1px solid rgba(232,160,32,0.2);
    padding: 8px 12px;
    margin-top: 10px;
  }
  .cost-note {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 8px;
  }

  /* Coming */
  .coming-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    margin-bottom: 10px;
  }
  .coming-icon { font-size: 16px; }
  .coming-dms {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .dm-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--ink-mid);
  }
  .dm-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--ink);
    color: #fff;
    font-size: 8px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .dm-name {
    font-weight: 600;
    flex-shrink: 0;
  }
  .dm-msg {
    color: var(--ink-muted);
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Policy */
  .policy-section {
    background: rgba(0,0,0,0.02);
  }
  .policy-prompt {
    font-size: 12px;
    color: var(--ink-mid);
    line-height: 1.5;
    margin-bottom: 10px;
  }
  .policy-prompt.muted {
    color: var(--ink-muted);
    font-style: italic;
  }

  /* Buttons */
  .debrief-btn {
    border: none;
    padding: 12px 20px;
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.15s ease;
    width: 100%;
    text-align: center;
  }
  .policy-btn {
    background: var(--paper-white);
    border: 1px solid var(--rule);
    color: var(--ink);
  }
  .policy-btn:hover {
    border-color: var(--ink);
  }
  .statement-section {
    background: rgba(0,0,0,0.02);
  }
  .statement-btn {
    background: var(--paper-white);
    border: 1px solid var(--rule);
    color: var(--ink);
  }
  .statement-btn:hover {
    border-color: var(--ink);
  }

  .debrief-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--rule);
  }
  .next-btn {
    background: var(--ink);
    color: #fff;
  }
  .next-btn:hover {
    background: var(--ink-mid);
  }
</style>
