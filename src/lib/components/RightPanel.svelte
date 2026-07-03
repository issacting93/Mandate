<script>
  import { selectedDistrict, game } from '$lib/stores/game.js';
  import { districtMap, BLOC_NAMES } from '$data/districts.js';
  import { CONVERSATIONS as CONVERSATIONS_V1 } from '$data/conversations.js';
  import { CONVERSATIONS_V2 } from '$data/conversations_v2.js';
  const CONVERSATIONS = { ...CONVERSATIONS_V1, ...CONVERSATIONS_V2 };

  let district = $derived($selectedDistrict ? districtMap[$selectedDistrict] : null);
  let convo = $derived(district ? CONVERSATIONS[district.id] : null);
  let isVisited = $derived(district?.lastVisited !== null && district?.lastVisited !== undefined);
  let isWanted = $derived(($game.wanted || []).includes(district?.id));

  // Rumor: DM text if visited, concern text if available, else unknown
  let rumor = $derived.by(() => {
    if (!district) return '';
    if (isVisited) {
      const dm = ($game.dms || []).find(d => d.districtId === district.id);
      if (dm?.messages?.length > 0) {
        return `"${dm.messages[dm.messages.length - 1].text}"`;
      }
      if (district.concern) return `"${district.concern}"`;
      return '"Come back when you can."';
    }
    if (district.concern) return `"${district.concern}"`;
    return '';
  });

  let trustColor = $derived(
    !district ? '#111111'
    : district.trust >= 60 ? '#111111'
    : district.trust >= 45 ? '#999999'
    : '#B82A18'
  );
</script>

<aside class="panel right-panel" class:empty={!district}>
  {#if district}
    <!-- Header -->
    <div class="district-header">
      <span class="district-boro">{district.boro.toUpperCase()}</span>
      <span class="district-name">{district.name}</span>
    </div>

    <div class="district-body">
      <!-- Trust -->
      <div class="trust-row">
        <span class="trust-num" style:color={trustColor}>{district.trust}</span>
        <span class="trust-label">LOCAL TRUST</span>
      </div>

      <!-- Knowledge bar -->
      <div class="section-title">KNOWLEDGE · <span class="kval">{district.know}%</span></div>
      <div class="knowledge-track">
        <div class="knowledge-fill" style:width="{district.know}%"></div>
      </div>

      <div class="divider"></div>

      <!-- Rumor / hint -->
      {#if isVisited && rumor}
        <div class="rumor">{rumor}</div>
      {:else if !isVisited}
        <div class="hint">You haven't been here yet. Draft this district to find out who's vulnerable — and why.</div>
      {/if}

      <!-- Character -->
      {#if convo && isVisited}
        <div class="character">
          <div class="char-avatar">{convo.character.initials}</div>
          <div>
            <div class="char-name">{convo.character.name}</div>
            <div class="char-role">{convo.character.role}</div>
          </div>
        </div>
      {/if}

      <!-- Wanted status -->
      {#if isWanted}
        <div class="wanted-tag">★ WANTED — weighted into the deal</div>
      {/if}
    </div>
  {:else}
    <div class="empty-msg">Tap a district on the map to view what you know — and what you don't.</div>
  {/if}
</aside>

<style>
  .right-panel {
    width: 280px;
    border-left: 1px solid var(--panel-border);
    display: flex;
    flex-direction: column;
    background: var(--panel-bg);
    backdrop-filter: blur(12px);
    overflow-y: auto;
  }
  .right-panel.empty {
    align-items: center;
    justify-content: center;
  }
  .empty-msg {
    font-size: 12px;
    color: var(--muted);
    text-align: center;
    padding: 20px;
    font-style: italic;
    border-left: 2px solid var(--red);
    margin: 20px;
    text-align: left;
  }

  .district-header {
    background: var(--dark);
    padding: 16px 18px 14px;
    flex-shrink: 0;
  }
  .district-boro {
    display: block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 4px;
  }
  .district-name {
    display: block;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
  }

  .district-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .trust-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .trust-num {
    font-family: var(--font-display);
    font-size: 48px;
    line-height: 1;
  }
  .trust-label {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .section-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-transform: uppercase;
  }
  .kval {
    font-family: var(--font-body);
    font-weight: 700;
  }

  .knowledge-track {
    height: 5px;
    background: rgba(0, 0, 0, 0.06);
    overflow: hidden;
    margin-top: -6px;
  }
  .knowledge-fill {
    height: 100%;
    background: var(--dark);
    transition: width 0.4s ease;
  }

  .divider {
    height: 1px;
    background: var(--divider);
  }

  .rumor {
    font-size: 12.5px;
    color: var(--secondary);
    font-style: italic;
    border-left: 2px solid var(--red);
    padding-left: 10px;
    line-height: 1.5;
  }
  .hint {
    font-size: 12px;
    color: var(--muted);
    border-left: 2px solid var(--red);
    padding-left: 10px;
    line-height: 1.5;
  }

  .character {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 4px;
  }
  .char-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--dark);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .char-name { font-size: 12px; font-weight: 600; }
  .char-role { font-size: 10px; color: var(--muted); }

  .wanted-tag {
    font-size: 11px;
    color: var(--red);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
  }
</style>
