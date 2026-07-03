<script>
  import { commsActive, commsState, game } from '$lib/stores/game.js';
  import { bus, closeComms, showToast } from '$lib/engine.js';

  const TYPE_COLORS = {
    AUDIENCE: '#3b82f6',
    CONCERN: '#E8A020',
    EVIDENCE: '#2A9E5C',
    TONE: '#7B4FBF',
  };

  const TYPE_LABELS = ['AUDIENCE', 'CONCERN', 'EVIDENCE', 'TONE'];

  let selectedTile = $state(null);
  let hoverCell = $state(null);

  let available = $derived($commsState.available || []);
  let evaluation = $derived($commsState.evaluation || {});
  let grid = $derived($commsState.grid || []);

  let groupedTiles = $derived.by(() => {
    const groups = {};
    for (const t of TYPE_LABELS) groups[t] = [];
    for (const tile of available) {
      if (groups[tile.type]) groups[tile.type].push(tile);
    }
    return groups;
  });

  function selectTile(tile) {
    selectedTile = selectedTile?.id === tile.id ? null : tile;
  }

  function handleCellClick(col, row) {
    const cell = grid[row]?.[col];
    if (cell && cell.placementId) {
      bus.emit('ui.commsRemove', { placementId: cell.placementId });
      selectedTile = null;
      return;
    }
    if (selectedTile) {
      bus.emit('ui.commsPlace', { tileId: selectedTile.id, col, row });
      selectedTile = null;
    }
  }

  function handleClear() {
    bus.emit('ui.commsClear');
    selectedTile = null;
  }

  function handlePublish() {
    bus.emit('ui.commsResolve');
    selectedTile = null;
  }

  function cellColor(col, row) {
    const cell = grid[row]?.[col];
    if (!cell) return null;
    // Find the tile type from available tiles
    const tile = available.find(t => t.id === cell.tileId);
    return tile ? TYPE_COLORS[tile.type] : '#999999';
  }

  function cellLabel(col, row) {
    const cell = grid[row]?.[col];
    if (!cell) return null;
    const tile = available.find(t => t.id === cell.tileId);
    return tile?.label || cell.tileId;
  }

  function cellType(col, row) {
    const cell = grid[row]?.[col];
    if (!cell) return null;
    const tile = available.find(t => t.id === cell.tileId);
    return tile?.type || '';
  }
</script>

{#if $commsActive}
  <div class="cb-overlay">
    <div class="cb-panel">
      <!-- Header -->
      <div class="cb-header">
        <span class="cb-title">STATEMENT BUILDER</span>
        <span class="cb-sub">Assemble your message from what you've heard</span>
        <button class="cb-close" onclick={closeComms}>&times;</button>
      </div>

      <div class="cb-body">
        <!-- Left: Tile tray -->
        <div class="cb-tray">
          {#each TYPE_LABELS as type}
            {@const tiles = groupedTiles[type] || []}
            {#if tiles.length > 0}
              <div class="cb-tray-group">
                <div class="cb-tray-label" style="color:{TYPE_COLORS[type]}">{type}</div>
                {#each tiles as tile}
                  <button
                    class="cb-tile"
                    class:selected={selectedTile?.id === tile.id}
                    style="border-left-color:{TYPE_COLORS[type]}"
                    onclick={() => selectTile(tile)}
                    title={tile.desc}
                  >
                    <span class="cb-tile-name">{tile.label}</span>
                    <span class="cb-tile-size">{tile.size[0]}×{tile.size[1]}</span>
                    {#if tile.type === 'EVIDENCE' && tile.insightRef}
                      <span class="cb-tile-freshness" style="width:{Math.round((tile.insightRef.freshness || 0) * 100)}%"></span>
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          {/each}
        </div>

        <!-- Center: Grid -->
        <div class="cb-grid-area">
          <div class="cb-grid">
            {#each {length: 3} as _, row}
              {#each {length: 4} as _, col}
                {@const color = cellColor(col, row)}
                {@const label = cellLabel(col, row)}
                {@const type = cellType(col, row)}
                <button
                  class="cb-cell"
                  class:occupied={color}
                  class:hover-valid={selectedTile && !color}
                  style={color ? `background:${color}15; border-color:${color}` : ''}
                  onclick={() => handleCellClick(col, row)}
                  onmouseenter={() => hoverCell = { col, row }}
                  onmouseleave={() => hoverCell = null}
                >
                  {#if label}
                    <span class="cb-cell-type" style="color:{color}">{type}</span>
                    <span class="cb-cell-label">{label}</span>
                  {:else if selectedTile}
                    <span class="cb-cell-hint">+</span>
                  {/if}
                </button>
              {/each}
            {/each}
          </div>

          {#if selectedTile}
            <div class="cb-placing">Placing: <strong>{selectedTile.label}</strong> ({selectedTile.size[0]}×{selectedTile.size[1]}) — click a cell</div>
          {/if}
        </div>

        <!-- Right: Evaluation -->
        <div class="cb-eval">
          <div class="cb-eval-section">
            <div class="cb-eval-label">GROUNDING</div>
            <div class="cb-eval-val">{evaluation.totalGrounding || 0}</div>
            <div class="cb-eval-bar">
              <div class="cb-eval-fill" style="width:{Math.min(100, (evaluation.totalGrounding || 0) * 10)}%; background:var(--green)"></div>
            </div>
          </div>

          <div class="cb-eval-section">
            <div class="cb-eval-label">HOLLOW</div>
            <div class="cb-eval-val">{evaluation.totalHollow || 0}</div>
            <div class="cb-eval-bar">
              <div class="cb-eval-fill" style="width:{Math.min(100, (evaluation.totalHollow || 0) * 15)}%; background:var(--red)"></div>
            </div>
          </div>

          <div class="cb-eval-section">
            <div class="cb-eval-label">SPACE</div>
            <div class="cb-eval-val">{evaluation.cellsUsed || 0}/12</div>
          </div>

          <!-- Synergies -->
          {#if (evaluation.synergies || []).length > 0}
            <div class="cb-eval-section">
              <div class="cb-eval-label">SYNERGIES</div>
              {#each evaluation.synergies as syn}
                <div class="cb-syn">+{syn.groundingBonus} {syn.label}</div>
              {/each}
            </div>
          {/if}

          <!-- Conflicts -->
          {#if (evaluation.conflicts || []).length > 0}
            <div class="cb-eval-section">
              <div class="cb-eval-label">CONFLICTS</div>
              {#each evaluation.conflicts as con}
                <div class="cb-con">-{con.groundingPenalty || con.hollowCost} {con.label}</div>
              {/each}
            </div>
          {/if}

          <!-- Validation -->
          {#if !evaluation.hasAudience}
            <div class="cb-hint">Need an AUDIENCE tile — who are you speaking to?</div>
          {/if}
          {#if !evaluation.hasConcern}
            <div class="cb-hint">Need a CONCERN tile — what are you addressing?</div>
          {/if}

          <!-- Actions -->
          <div class="cb-actions">
            <button class="cb-btn cb-btn-clear" onclick={handleClear}>Clear Board</button>
            <button
              class="cb-btn cb-btn-publish"
              disabled={!evaluation.hasAudience || !evaluation.hasConcern}
              onclick={handlePublish}
            >Publish Statement</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .cb-overlay {
    position: fixed;
    inset: 0;
    z-index: 85;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.5);
  }
  .cb-panel {
    width: 900px;
    max-width: 95vw;
    max-height: 90vh;
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: var(--font-body);
  }
  .cb-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: var(--ink);
    color: #fff;
  }
  .cb-title {
    font-family: var(--font-display);
    font-size: 18px;
    letter-spacing: 3px;
    color: var(--red);
  }
  .cb-sub { font-size: 8px; color: var(--ink-muted); letter-spacing: 1px; }
  .cb-close {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--ink-muted);
    font-size: 18px;
    cursor: pointer;
  }

  .cb-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Tile tray */
  .cb-tray {
    width: 200px;
    padding: 12px;
    overflow-y: auto;
    border-right: 1px solid var(--rule);
  }
  .cb-tray-group { margin-bottom: 14px; }
  .cb-tray-label {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .cb-tile {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 6px 8px;
    margin-bottom: 3px;
    background: var(--paper-white);
    border: 1px solid var(--rule);
    border-left: 3px solid;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 8px;
    text-align: left;
    position: relative;
  }
  .cb-tile:hover { border-color: var(--ink-muted); }
  .cb-tile.selected { background: var(--rule-light); border-color: var(--ink); }
  .cb-tile-name { flex: 1; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cb-tile-size { color: var(--ink-ghost); font-size: 7px; flex-shrink: 0; }
  .cb-tile-freshness {
    position: absolute;
    bottom: 0;
    left: 3px;
    height: 2px;
    background: var(--green);
    border-radius: 0;
  }

  /* Grid */
  .cb-grid-area {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .cb-grid {
    display: grid;
    grid-template-columns: repeat(4, 100px);
    grid-template-rows: repeat(3, 80px);
    gap: 4px;
  }
  .cb-cell {
    border: 1px solid var(--rule);
    background: var(--paper-white);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: var(--font-body);
    padding: 4px;
    transition: border-color 0.1s;
  }
  .cb-cell:hover { border-color: var(--ink-muted); }
  .cb-cell.occupied { border-width: 2px; }
  .cb-cell.hover-valid { background: var(--paper-card); border-style: dashed; }
  .cb-cell-type { font-size: 7px; letter-spacing: 1px; font-weight: 700; }
  .cb-cell-label { font-size: 8px; color: var(--ink); text-align: center; overflow: hidden; text-overflow: ellipsis; max-width: 90px; }
  .cb-cell-hint { font-size: 16px; color: var(--ink-ghost); }
  .cb-placing {
    font-size: 8px;
    color: var(--ink-muted);
    letter-spacing: 1px;
    margin-top: 12px;
    text-transform: uppercase;
  }

  /* Evaluation */
  .cb-eval {
    width: 200px;
    padding: 12px;
    border-left: 1px solid var(--rule);
    overflow-y: auto;
  }
  .cb-eval-section { margin-bottom: 14px; }
  .cb-eval-label {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--ink-muted);
    margin-bottom: 4px;
  }
  .cb-eval-val {
    font-family: var(--font-display);
    font-size: 24px;
    color: var(--ink);
    line-height: 1;
  }
  .cb-eval-bar {
    height: 3px;
    background: var(--rule);
    margin-top: 4px;
  }
  .cb-eval-fill { height: 100%; transition: width 0.2s; }

  .cb-syn {
    font-size: 8px;
    color: var(--green);
    padding: 3px 6px;
    background: rgba(42,158,92,0.06);
    border: 1px solid rgba(42,158,92,0.15);
    margin-bottom: 3px;
  }
  .cb-con {
    font-size: 8px;
    color: var(--red);
    padding: 3px 6px;
    background: rgba(184,42,24,0.06);
    border: 1px solid rgba(184,42,24,0.15);
    margin-bottom: 3px;
  }
  .cb-hint {
    font-size: 8px;
    color: var(--amber);
    border-left: 2px solid var(--amber);
    padding: 4px 8px;
    margin-bottom: 8px;
  }

  .cb-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .cb-btn {
    width: 100%;
    padding: 8px;
    font-family: var(--font-display);
    font-size: 13px;
    letter-spacing: 2px;
    cursor: pointer;
    border: none;
    text-transform: uppercase;
  }
  .cb-btn:disabled { opacity: 0.3; cursor: default; }
  .cb-btn-clear {
    background: var(--paper-white);
    border: 1px solid var(--rule);
    color: var(--ink-muted);
  }
  .cb-btn-publish {
    background: var(--ink);
    color: var(--paper);
  }
  .cb-btn-publish:hover:not(:disabled) { background: var(--red); }
</style>
