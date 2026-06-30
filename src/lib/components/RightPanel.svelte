<script>
  import { selectedDistrict, game } from '$lib/stores/game.js';
  import { districtMap, CONCERN_SCORES, BLOC_COLORS, BLOC_NAMES } from '$data/districts.js';
  import { CONVERSATIONS } from '$data/conversations.js';

  // Resolve the full district object from the selected ID
  let district = $derived($selectedDistrict ? districtMap[$selectedDistrict] : null);
  let concerns = $derived(district ? CONCERN_SCORES[district.id] : null);
  let convo = $derived(district ? CONVERSATIONS[district.id] : null);

  // Visit & knowledge state
  let isVisited = $derived(district?.lastVisited !== null && district?.lastVisited !== undefined);
  let heardAbout = $derived($game.heardAbout?.[district?.id] || []);

  // Trust color thresholds
  let trustColor = $derived(
    !district ? '#141414'
    : district.trust >= 60 ? '#141414'
    : district.trust >= 45 ? '#8a8a8a'
    : '#ff2d2d'
  );

  // Concern text logic
  let concernText = $derived(
    !district ? ''
    : isVisited && district.concern ? `\u201C${district.concern}\u201D`
    : heardAbout.length > 0 ? `Heard about: ${heardAbout.join(', ')}. Not verified \u2014 you haven\u2019t been here.`
    : "You haven\u2019t been here yet."
  );

  let concernUnknown = $derived(!isVisited);

  // Sorted concern bars (only scores >= 3)
  let sortedConcerns = $derived(
    concerns
      ? Object.entries(concerns).sort((a, b) => b[1] - a[1])
      : []
  );

  // Filtered for the visited view (score >= 3)
  let visibleConcerns = $derived(sortedConcerns.filter(([, v]) => v >= 3));

  function barColor(val) {
    return val >= 7 ? '#ff2d2d' : val >= 5 ? '#e8a83e' : '#9a9a9a';
  }
</script>

<aside class="panel right-panel" class:empty={!district}>
  {#if district}
    <!-- Header -->
    <div class="district-header">
      <span class="district-boro">{district.boro.toUpperCase()}</span>
      <span class="district-name">{district.name}</span>
    </div>

    <!-- Body -->
    <div class="district-body">
      <!-- Bloc -->
      <div class="district-bloc">
        <span class="dot" style:background={BLOC_COLORS[district.bloc]}></span>
        {BLOC_NAMES[district.bloc]}
      </div>

      <!-- Trust -->
      <div class="district-trust-num" style:color={trustColor}>{district.trust}</div>
      <div class="district-trust-label">LOCAL TRUST</div>

      <!-- Population -->
      <div class="district-pop">Pop. Weight: <span class="val">{district.pop}</span></div>

      <div class="obj-divider"></div>

      <!-- Primary concern quote -->
      <div class="district-concern" class:unknown={concernUnknown}>
        {concernText}
      </div>

      <!-- Concern score bars: visited -->
      {#if concerns && isVisited}
        <div class="concern-bars">
          <div class="obj-section-title">CONCERNS</div>
          {#each visibleConcerns as [cat, val]}
            {@const pct = val * 10}
            {@const color = barColor(val)}
            <div class="concern-row">
              <span class="concern-label">{cat}</span>
              <div class="concern-track">
                <div class="concern-fill" style:width="{pct}%" style:background={color}></div>
              </div>
              <span class="concern-val" style:color={color}>{val}</span>
            </div>
          {/each}
        </div>
      {:else if concerns && heardAbout.length > 0}
        <!-- Concern score bars: heard about (unverified) -->
        <div class="concern-bars">
          <div class="obj-section-title">
            HEARD ABOUT <span class="unverified-badge">UNVERIFIED</span>
          </div>
          {#each heardAbout as cat}
            {@const val = concerns[cat] || 0}
            <div class="concern-row dimmed">
              <span class="concern-label">{cat}</span>
              <div class="concern-track">
                <div class="concern-fill dashed" style:width="{val * 10}%" style:background="#e8a83e"></div>
              </div>
              <span class="concern-val" style:color="#e8a83e">?</span>
            </div>
          {/each}
        </div>
      {/if}

      <div class="obj-divider"></div>

      <!-- Knowledge track -->
      <div class="knowledge-track">
        <div class="knowledge-fill" style:width="{district.know}%"></div>
      </div>
      <div class="knowledge-label">KNOWLEDGE &middot; <span class="kval">{district.know}%</span></div>

      <!-- Character contact -->
      {#if convo}
        <div class="character-contact">
          <div class="char-avatar">{convo.character.initials}</div>
          <div class="char-info">
            <div class="char-name">{convo.character.name}</div>
            <div class="char-role">{convo.character.role}</div>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="empty-msg">Select a district on the map to view details.</div>
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
  }

  /* ── Header ── */
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

  /* ── Body ── */
  .district-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .district-bloc {
    font-size: 11px;
    font-weight: 600;
    color: var(--secondary);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .district-bloc .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .district-trust-num {
    font-family: var(--font-data);
    font-weight: 900;
    font-size: 48px;
    line-height: 1;
  }

  .district-trust-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--muted);
    margin-top: -6px;
  }

  .district-pop {
    font-size: 11px;
    color: var(--muted);
  }

  .district-pop .val {
    font-family: var(--font-data);
    font-weight: 700;
  }

  /* ── Divider ── */
  .obj-divider {
    height: 1px;
    background: var(--divider);
  }

  /* ── Concern quote ── */
  .district-concern {
    font-size: 12px;
    color: var(--secondary);
    line-height: 1.5;
    font-style: italic;
    border-left: 2px solid var(--panel-border);
    padding-left: 10px;
  }

  .district-concern.unknown {
    color: var(--muted);
    font-style: normal;
  }

  /* ── Concern bars ── */
  .obj-section-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .unverified-badge {
    color: var(--red);
    font-size: 8px;
  }

  .concern-bars {
    margin-top: 4px;
  }

  .concern-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 2px 0;
    font-size: 10px;
  }

  .concern-row.dimmed {
    opacity: 0.5;
  }

  .concern-label {
    width: 52px;
    color: var(--secondary);
    font-weight: 600;
    text-transform: uppercase;
  }

  .concern-track {
    flex: 1;
    height: 4px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 2px;
    overflow: hidden;
  }

  .concern-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .concern-fill.dashed {
    border: 1px dashed rgba(0, 0, 0, 0.15);
  }

  .concern-val {
    font-family: var(--font-data);
    font-weight: 700;
    font-size: 9px;
  }

  /* ── Knowledge track ── */
  .knowledge-track {
    height: 4px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 2px;
    overflow: hidden;
  }

  .knowledge-fill {
    height: 100%;
    background: var(--dark);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .knowledge-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-top: -6px;
  }

  .knowledge-label .kval {
    font-family: var(--font-data);
    font-weight: 700;
  }

  /* ── Character contact ── */
  .character-contact {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    padding: 6px 0;
    border-top: 1px solid var(--divider);
  }

  .char-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--dark);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .char-name {
    font-size: 11px;
    font-weight: 600;
  }

  .char-role {
    font-size: 9px;
    color: var(--muted);
  }
</style>
