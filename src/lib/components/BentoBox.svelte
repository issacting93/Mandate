<script>
  import { bentoActive, bentoState, game } from '$lib/stores/game.js';
  import { closeBento, bus } from '$lib/engine.js';
  import { DISTRICTS } from '$data/districts.js';

  let selectedTile = $state(null);
  let hoveredCell = $state(null);
  let districtTarget = $state('');

  let availableTiles = $derived($bentoState?.available || []);
  let grid = $derived($bentoState?.grid || Array.from({length:5}, () => Array(5).fill(null)));
  let evaluation = $derived($bentoState?.evaluation || {
    totalCost: 0, totalResilience: 0, totalDisorder: 0,
    synergies: [], conflicts: [], hasWhere: false, hasWhat: false, cellsUsed: 0,
  });

  const TYPES = ['WHERE', 'WHAT', 'HOW', 'FUNDING'];
  let groupedTiles = $derived(
    TYPES.reduce((acc, type) => {
      acc[type] = availableTiles.filter(t => t.type === type);
      return acc;
    }, {})
  );

  let canSign = $derived(
    evaluation.hasWhere && evaluation.hasWhat && $game.reserve >= evaluation.totalCost
  );

  function selectTile(tile) {
    selectedTile = selectedTile?.id === tile.id ? null : tile;
    districtTarget = tile.requiresSelection ? DISTRICTS[0]?.id : '';
  }

  function handleCellClick(col, row) {
    if (selectedTile) {
      bus.emit('ui.bentoPlace', {
        tileId: selectedTile.id,
        col, row,
        districtTarget: selectedTile.requiresSelection ? districtTarget : null,
      });
      selectedTile = null;
      hoveredCell = null;
    } else {
      const cell = grid[row]?.[col];
      if (cell?.placementId) {
        bus.emit('ui.bentoRemove', { placementId: cell.placementId });
      }
    }
  }

  function isPreview(col, row) {
    if (!selectedTile || !hoveredCell) return false;
    const [w, h] = selectedTile.size;
    return col >= hoveredCell.col && col < hoveredCell.col + w &&
           row >= hoveredCell.row && row < hoveredCell.row + h;
  }

  function isValidPreview() {
    if (!selectedTile || !hoveredCell) return false;
    const [w, h] = selectedTile.size;
    if (hoveredCell.col + w > 5 || hoveredCell.row + h > 5) return false;
    for (let r = hoveredCell.row; r < hoveredCell.row + h; r++) {
      for (let c = hoveredCell.col; c < hoveredCell.col + w; c++) {
        if (grid[r]?.[c] !== null) return false;
      }
    }
    return true;
  }

  function typeColor(type) {
    const colors = { WHERE: '#3b82f6', WHAT: '#10b981', HOW: '#8b5cf6', FUNDING: '#f59e0b' };
    return colors[type] || '#6b7280';
  }

  function typeBg(type) {
    const colors = { WHERE: 'rgba(59,130,246,0.15)', WHAT: 'rgba(16,185,129,0.15)', HOW: 'rgba(139,92,246,0.15)', FUNDING: 'rgba(245,158,11,0.15)' };
    return colors[type] || 'rgba(107,114,128,0.1)';
  }

  function findTileById(id) {
    return availableTiles.find(t => t.id === id);
  }
</script>

{#if $bentoActive}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) closeBento(); }}>
    <div class="builder">
      <!-- Header -->
      <header class="header">
        <div>
          <h2 class="title">POLICY BUILDER</h2>
          <p class="subtitle">Assemble interventions on the grid. Budget and space are limited.</p>
        </div>
        <button class="close-btn" onclick={closeBento}>
          <span class="material-symbols-rounded">close</span>
        </button>
      </header>

      <div class="content">
        <!-- Left: Tile Tray -->
        <aside class="tray">
          {#each TYPES as type}
            {#if groupedTiles[type]?.length > 0}
              <div class="tray-group">
                <h3 class="tray-label" style="color:{typeColor(type)}">{type}</h3>
                {#each groupedTiles[type] as tile}
                  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
                  <div
                    class="tile-card"
                    class:selected={selectedTile?.id === tile.id}
                    style="--accent:{typeColor(type)}; --accent-bg:{typeBg(type)}"
                    onclick={() => selectTile(tile)}
                  >
                    <div class="tile-head">
                      <span class="tile-name">{tile.label}</span>
                      <span class="tile-size">{tile.size[0]}x{tile.size[1]}</span>
                    </div>
                    <p class="tile-desc">{tile.desc}</p>
                    {#if tile.cost > 0 || tile.resilience || tile.disorder}
                      <div class="tile-stats">
                        {#if tile.cost > 0}<span class="stat cost">${tile.cost}B</span>{/if}
                        {#if tile.resilience}<span class="stat res">+{tile.resilience}</span>{/if}
                        {#if tile.disorder}<span class="stat dis">+{tile.disorder}</span>{/if}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          {/each}
        </aside>

        <!-- Center: Grid -->
        <div class="grid-area">
          {#if selectedTile}
            <div class="place-hint">
              Place <strong>{selectedTile.label}</strong> ({selectedTile.size[0]}x{selectedTile.size[1]})
            </div>
          {/if}

          <div class="grid-board">
            {#each Array(5) as _, row}
              {#each Array(5) as _, col}
                {@const cell = grid[row]?.[col]}
                {@const preview = isPreview(col, row)}
                {@const valid = preview && isValidPreview()}
                {@const cellTile = cell ? findTileById(cell.tileId) : null}
                <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
                <div
                  class="grid-cell"
                  class:occupied={!!cell}
                  class:preview
                  class:valid={preview && valid}
                  class:invalid={preview && !valid}
                  class:has-selected={!!selectedTile}
                  style={cell ? `--cell-color:${typeColor(cellTile?.type)}; --cell-bg:${typeBg(cellTile?.type)}` : ''}
                  onmouseenter={() => hoveredCell = { col, row }}
                  onmouseleave={() => hoveredCell = null}
                  onclick={() => handleCellClick(col, row)}
                >
                  {#if cell && !preview}
                    <span class="cell-type" style="color:{typeColor(cellTile?.type)}">{cellTile?.type || ''}</span>
                    <span class="cell-label">{cellTile?.label || ''}</span>
                  {/if}
                </div>
              {/each}
            {/each}
          </div>

          <div class="grid-footer">
            Reserve: <span class="reserve-val">${$game.reserve.toFixed(1)}B</span>
          </div>
        </div>

        <!-- Right: Evaluation -->
        <aside class="eval-panel">
          <h3 class="eval-title">PROJECTION</h3>

          <div class="eval-stats">
            <div class="eval-stat">
              <span class="eval-label">COST</span>
              <span class="eval-val cost">${evaluation.totalCost.toFixed(1)}B</span>
            </div>
            <div class="eval-stat">
              <span class="eval-label">SPACE</span>
              <span class="eval-val">{evaluation.cellsUsed || 0}/25</span>
            </div>
          </div>

          <div class="eval-metres">
            <div class="metre-box">
              <span class="metre-label res">RESILIENCE</span>
              <span class="metre-val res">+{evaluation.totalResilience}</span>
            </div>
            <div class="metre-box">
              <span class="metre-label dis">DISORDER</span>
              <span class="metre-val dis">{evaluation.totalDisorder > 0 ? '+' : ''}{evaluation.totalDisorder}</span>
            </div>
          </div>

          {#if evaluation.synergies?.length > 0}
            <div class="eval-section">
              <div class="section-label syn">SYNERGIES</div>
              {#each evaluation.synergies as syn}
                <div class="syn-card">
                  <strong>{syn.label}</strong>
                  <span>{syn.desc}</span>
                </div>
              {/each}
            </div>
          {/if}

          {#if evaluation.conflicts?.length > 0}
            <div class="eval-section">
              <div class="section-label con">CONFLICTS</div>
              {#each evaluation.conflicts as con}
                <div class="con-card">
                  <strong>{con.label}</strong>
                  <span>{con.desc}</span>
                </div>
              {/each}
            </div>
          {/if}

          {#if !evaluation.hasWhere || !evaluation.hasWhat}
            <div class="eval-hint">
              Requires at least one <strong style="color:#3b82f6">WHERE</strong> and one <strong style="color:#10b981">WHAT</strong> tile.
            </div>
          {/if}

          <div class="eval-actions">
            <button class="btn-clear" onclick={() => bus.emit('ui.bentoClear')}>CLEAR BOARD</button>
            <button class="btn-sign" disabled={!canSign} onclick={() => bus.emit('ui.bentoResolve')}>
              SIGN POLICY
            </button>
          </div>
        </aside>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0,0,0,0.88);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .builder {
    width: 100%;
    max-width: 1100px;
    height: 100%;
    max-height: 780px;
    background: var(--dark);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Header ── */
  .header {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0a0a0a;
    flex-shrink: 0;
  }
  .title {
    font-family: var(--font-data);
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.15em;
    color: #fff;
  }
  .subtitle { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
  .close-btn {
    background: none; border: none; color: rgba(255,255,255,0.4);
    cursor: pointer; padding: 4px; border-radius: 0;
  }
  .close-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }

  /* ── Content ── */
  .content { flex: 1; display: flex; overflow: hidden; }

  /* ── Tile Tray ── */
  .tray {
    width: 240px;
    border-right: 1px solid rgba(255,255,255,0.06);
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(0,0,0,0.3);
  }
  .tray-group { display: flex; flex-direction: column; gap: 6px; }
  .tray-label {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    margin-bottom: 2px;
  }
  .tile-card {
    padding: 8px 10px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 0;
    cursor: pointer;
    background: rgba(255,255,255,0.02);
    transition: all 0.12s ease;
  }
  .tile-card:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); }
  .tile-card.selected {
    border-color: var(--accent);
    background: var(--accent-bg);
    box-shadow: 0 0 12px var(--accent-bg);
  }
  .tile-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .tile-name { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.9); }
  .tile-size { font-family: var(--font-data); font-size: 9px; color: rgba(255,255,255,0.3); }
  .tile-desc { font-size: 10px; color: rgba(255,255,255,0.35); line-height: 1.4; margin-bottom: 4px; }
  .tile-stats { display: flex; gap: 8px; font-family: var(--font-data); font-size: 10px; font-weight: 700; }
  .stat.cost { color: #f59e0b; }
  .stat.res { color: #10b981; }
  .stat.dis { color: #ef4444; }

  /* ── Grid Area ── */
  .grid-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #060608;
    position: relative;
    padding: 20px;
  }
  .place-hint {
    position: absolute;
    top: 16px;
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    font-family: var(--font-ui);
  }
  .place-hint strong { color: #fff; }

  .grid-board {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 3px;
    padding: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 0;
  }

  .grid-cell {
    width: 88px;
    height: 88px;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.1s ease;
    background: rgba(255,255,255,0.015);
    gap: 2px;
  }
  .grid-cell.has-selected { cursor: crosshair; }
  .grid-cell.occupied {
    border-color: var(--cell-color, rgba(255,255,255,0.1));
    background: var(--cell-bg, rgba(255,255,255,0.05));
    cursor: pointer;
  }
  .grid-cell.occupied:hover { filter: brightness(1.3); }
  .grid-cell.preview.valid {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.4);
    box-shadow: 0 0 8px rgba(255,255,255,0.1);
  }
  .grid-cell.preview.invalid {
    background: rgba(239,68,68,0.15);
    border-color: rgba(239,68,68,0.5);
  }
  .cell-type {
    font-family: var(--font-data);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.1em;
    opacity: 0.6;
  }
  .cell-label {
    font-size: 9px;
    color: rgba(255,255,255,0.7);
    text-align: center;
    line-height: 1.2;
  }

  .grid-footer {
    position: absolute;
    bottom: 12px;
    font-family: var(--font-data);
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.1em;
  }
  .reserve-val { color: #f59e0b; }

  /* ── Eval Panel ── */
  .eval-panel {
    width: 240px;
    border-left: 1px solid rgba(255,255,255,0.06);
    padding: 16px;
    display: flex;
    flex-direction: column;
    background: rgba(0,0,0,0.3);
    overflow-y: auto;
  }
  .eval-title {
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(255,255,255,0.4);
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 14px;
  }
  .eval-stats { display: flex; gap: 10px; margin-bottom: 14px; }
  .eval-stat {
    flex: 1;
    padding: 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 0;
  }
  .eval-label {
    font-family: var(--font-data);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.35);
    display: block;
    margin-bottom: 4px;
  }
  .eval-val {
    font-family: var(--font-data);
    font-size: 18px;
    font-weight: 900;
    color: rgba(255,255,255,0.8);
  }
  .eval-val.cost { color: #f59e0b; }

  .eval-metres {
    display: flex;
    gap: 10px;
    padding: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 0;
    margin-bottom: 14px;
  }
  .metre-box { flex: 1; }
  .metre-label { font-family: var(--font-data); font-size: 8px; font-weight: 700; letter-spacing: 0.1em; display: block; margin-bottom: 4px; }
  .metre-label.res { color: #10b981; }
  .metre-label.dis { color: #ef4444; }
  .metre-val { font-family: var(--font-data); font-size: 22px; font-weight: 900; }
  .metre-val.res { color: #10b981; }
  .metre-val.dis { color: #ef4444; }

  .eval-section { margin-bottom: 12px; }
  .section-label { font-family: var(--font-data); font-size: 8px; font-weight: 700; letter-spacing: 0.12em; margin-bottom: 6px; }
  .section-label.syn { color: #10b981; }
  .section-label.con { color: #ef4444; }
  .syn-card, .con-card {
    padding: 6px 8px;
    border-radius: 0;
    font-size: 10px;
    line-height: 1.4;
    margin-bottom: 4px;
  }
  .syn-card { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); color: rgba(16,185,129,0.8); }
  .syn-card strong { display: block; color: #10b981; margin-bottom: 2px; }
  .con-card { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15); color: rgba(239,68,68,0.8); }
  .con-card strong { display: block; color: #ef4444; margin-bottom: 2px; }

  .eval-hint {
    margin-top: auto;
    padding: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 0;
    font-size: 10px;
    color: rgba(255,255,255,0.35);
    line-height: 1.5;
  }

  .eval-actions {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .btn-clear {
    width: 100%;
    padding: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0;
    color: rgba(255,255,255,0.5);
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
  }
  .btn-clear:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .btn-sign {
    width: 100%;
    padding: 10px;
    background: var(--red);
    border: none;
    border-radius: 0;
    color: #fff;
    font-family: var(--font-data);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.15em;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(255,45,45,0.3);
    transition: all 0.15s ease;
  }
  .btn-sign:hover { background: var(--red); box-shadow: 0 0 30px rgba(255,45,45,0.5); }
  .btn-sign:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
</style>
