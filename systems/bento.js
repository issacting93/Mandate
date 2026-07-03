// systems/bento.js — Bento Box Policy Builder
//
// Blue Prince-inspired spatial policy construction on a 5x5 grid.
// Every policy is a physical arrangement of tiles — WHERE, WHAT, HOW, FUNDING.
// The grid IS the budget constraint made visible. Synergies reward careful
// placement. Conflicts punish careless adjacency. Insights mutate bulky
// generic tiles into efficient specialist variants.
//
// The grid represents the intersection of budget and political capital:
// you can SEE that adding outreach to a fourth borough means removing
// the medical cache from the first. You cannot fit everything.

const GRID_SIZE = 5;

export class BentoGrid {
  #cells;       // 5x5 array, null or { tileId, placementId }
  #placements;  // Map<placementId, { tile, col, row, districtTarget? }>

  constructor() {
    this.#cells = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    this.#placements = new Map();
  }

  get size() { return GRID_SIZE; }

  // ── Placement ────────────────────────────────────────────

  // Can this tile be placed at (col, row)?
  canPlace(tile, col, row) {
    const [w, h] = tile.size;
    if (col + w > GRID_SIZE || row + h > GRID_SIZE) return false;
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        if (this.#cells[r][c] !== null) return false;
      }
    }
    return true;
  }

  // Place a tile. Returns placement ID or null if blocked.
  place(tile, col, row, districtTarget) {
    if (!this.canPlace(tile, col, row)) return null;
    const pid = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const [w, h] = tile.size;
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        this.#cells[r][c] = { tileId: tile.id, placementId: pid };
      }
    }
    this.#placements.set(pid, { tile, col, row, districtTarget: districtTarget || null });
    return pid;
  }

  // Remove a placement
  remove(placementId) {
    const p = this.#placements.get(placementId);
    if (!p) return false;
    const [w, h] = p.tile.size;
    for (let r = p.row; r < p.row + h; r++) {
      for (let c = p.col; c < p.col + w; c++) {
        if (this.#cells[r][c]?.placementId === placementId) {
          this.#cells[r][c] = null;
        }
      }
    }
    this.#placements.delete(placementId);
    return true;
  }

  // Clear entire grid
  clear() {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        this.#cells[r][c] = null;
      }
    }
    this.#placements.clear();
  }

  // ── Queries ──────────────────────────────────────────────

  getCell(col, row) {
    return this.#cells[row]?.[col] ?? null;
  }

  getPlacement(placementId) {
    return this.#placements.get(placementId) || null;
  }

  getAllPlacements() {
    return [...this.#placements.entries()].map(([pid, p]) => ({
      placementId: pid,
      tileId: p.tile.id,
      label: p.tile.label,
      type: p.tile.type,
      col: p.col,
      row: p.row,
      size: p.tile.size,
      districtTarget: p.districtTarget,
    }));
  }

  // How many cells are occupied?
  get cellsUsed() {
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.#cells[r][c]) count++;
      }
    }
    return count;
  }

  get cellsFree() {
    return GRID_SIZE * GRID_SIZE - this.cellsUsed;
  }

  // Get all tiles adjacent to a given placement (sharing an edge)
  getAdjacentPlacements(placementId) {
    const p = this.#placements.get(placementId);
    if (!p) return [];
    const [w, h] = p.tile.size;
    const adjacent = new Set();

    // Check all edge cells of this placement
    for (let r = p.row; r < p.row + h; r++) {
      for (let c = p.col; c < p.col + w; c++) {
        // Check 4 neighbors
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
          const neighbor = this.#cells[nr][nc];
          if (neighbor && neighbor.placementId !== placementId) {
            adjacent.add(neighbor.placementId);
          }
        }
      }
    }

    return [...adjacent].map(pid => this.#placements.get(pid)).filter(Boolean);
  }

  // Render the grid as a 2D array for visualization
  toGrid() {
    return this.#cells.map(row => row.map(cell =>
      cell ? { tileId: cell.tileId, placementId: cell.placementId } : null
    ));
  }
}


// ── BentoSystem ────────────────────────────────────────────────
// Manages the policy builder lifecycle: grid, tile availability,
// synergy/conflict evaluation, and resolution.
export class BentoSystem {
  #bus;
  #state;
  #allTiles;
  #synergies;
  #conflicts;
  #grid;
  #deptSys;

  constructor(bus, state, tiles, synergies, conflicts) {
    this.#bus = bus;
    this.#state = state;
    this.#allTiles = tiles;
    this.#synergies = synergies;
    this.#conflicts = conflicts;
    this.#grid = new BentoGrid();
    this.#deptSys = null;

    bus.on('ui.bentoOpen', () => this.#present());
    bus.on('ui.bentoPlace', (e) => this.#handlePlace(e));
    bus.on('ui.bentoRemove', (e) => this.#handleRemove(e));
    bus.on('ui.bentoResolve', () => this.#resolve());
    bus.on('ui.bentoClear', () => this.#handleClear());
  }

  // ── Public API ───────────────────────────────────────────

  setDepartmentSystem(deptSys) {
    this.#deptSys = deptSys;
  }

  getGrid() {
    return this.#grid;
  }

  // Get available tiles (respecting insight mutations + department gating)
  getAvailableTiles() {
    const insights = this.#state.get('insights') || [];
    const available = [];

    for (const tile of this.#allTiles) {
      // If this tile requires insights, check if player has them
      if (tile.requiredInsightCategory) {
        const count = insights.filter(
          i => i.category === tile.requiredInsightCategory && i.freshness > 0.3
        ).length;
        if (count < (tile.requiredInsightCount || 1)) continue;
      }

      // Department level gate: efficient tiles require funded departments
      if (tile.requiredDept && this.#deptSys) {
        const effective = this.#deptSys.getEffectiveLevel(tile.requiredDept.id);
        if (effective < tile.requiredDept.level) continue;
      }

      // If this is a mutation, suppress the parent tile
      if (tile.mutatesFrom) {
        // This mutation is available — parent will be suppressed below
        available.push({ ...tile, isMutation: true });
      } else {
        // Check if a mutation of this tile is available
        const mutation = this.#allTiles.find(
          t => t.mutatesFrom === tile.id &&
            this.#checkTileRequirements(t, insights)
        );
        if (mutation) {
          // Parent is suppressed — mutation replaces it
          continue;
        }
        available.push({ ...tile, isMutation: false });
      }
    }

    return available;
  }

  // Evaluate current grid: synergies, conflicts, total cost, total effects
  evaluate() {
    const placements = this.#grid.getAllPlacements();
    const activeSynergies = [];
    const activeConflicts = [];
    let totalCost = 0;
    let totalResilience = 0;
    let totalDisorder = 0;

    // Collect all placed tile IDs
    const placedIds = new Set(placements.map(p => p.tileId));

    // Sum base costs and effects
    for (const p of placements) {
      const tile = this.#allTiles.find(t => t.id === p.tileId);
      if (!tile) continue;
      totalCost += tile.cost || 0;
      totalResilience += tile.resilience || 0;
      totalDisorder += tile.disorder || 0;
    }

    // Check adjacency synergies and conflicts
    for (const p of placements) {
      const adjacent = this.#grid.getAdjacentPlacements(p.placementId);
      for (const adj of adjacent) {
        // Check synergies
        for (const syn of this.#synergies) {
          if (this.#matchesPair(p.tileId, adj.tile.id, syn.tiles, syn.alsoMatches)) {
            const synId = `${syn.id}_${p.placementId}_${this.#grid.getAllPlacements().find(pp => pp.tileId === adj.tile.id)?.placementId}`;
            if (!activeSynergies.some(s => s.id === syn.id)) {
              activeSynergies.push(syn);
              totalResilience += syn.resilienceBonus || 0;
              totalDisorder -= syn.disorderReduction || 0;
            }
          }
        }
        // Check conflicts
        for (const con of this.#conflicts) {
          if (this.#matchesPair(p.tileId, adj.tile.id, con.tiles)) {
            if (!activeConflicts.some(c => c.id === con.id)) {
              activeConflicts.push(con);
              totalResilience -= con.resiliencePenalty || 0;
              totalDisorder += con.disorderCost || 0;
            }
          }
        }
      }
    }

    // Resolve targets from WHERE tiles
    const targets = this.#resolveTargets(placements);

    return {
      placements,
      synergies: activeSynergies,
      conflicts: activeConflicts,
      targets,
      totalCost: Math.round(totalCost * 100) / 100,
      totalResilience: Math.max(0, totalResilience),
      totalDisorder: Math.max(0, totalDisorder),
      cellsUsed: this.#grid.cellsUsed,
      cellsFree: this.#grid.cellsFree,
      hasWhere: placements.some(p => p.type === 'WHERE'),
      hasWhat: placements.some(p => p.type === 'WHAT'),
    };
  }

  // ── Event Handlers ───────────────────────────────────────

  #present() {
    const available = this.getAvailableTiles();
    const evaluation = this.evaluate();
    this.#bus.emit('bento.presented', { available, evaluation, grid: this.#grid.toGrid() });
  }

  #handlePlace({ tileId, col, row, districtTarget }) {
    const tile = this.#allTiles.find(t => t.id === tileId);
    if (!tile) return;
    const pid = this.#grid.place(tile, col, row, districtTarget);
    if (!pid) {
      this.#bus.emit('bento.placeFailed', { tileId, col, row, reason: 'blocked' });
      return;
    }
    const evaluation = this.evaluate();
    this.#bus.emit('bento.placed', { placementId: pid, tileId, col, row, evaluation });
  }

  #handleRemove({ placementId }) {
    this.#grid.remove(placementId);
    const evaluation = this.evaluate();
    this.#bus.emit('bento.removed', { placementId, evaluation });
  }

  #handleClear() {
    this.#grid.clear();
    this.#bus.emit('bento.cleared', {});
  }

  #resolve() {
    const evaluation = this.evaluate();

    // Validation: need at least one WHERE and one WHAT
    if (!evaluation.hasWhere) {
      this.#bus.emit('bento.resolveFailed', { reason: 'No WHERE tile — where should this deploy?' });
      return;
    }
    if (!evaluation.hasWhat) {
      this.#bus.emit('bento.resolveFailed', { reason: 'No WHAT tile — what are you deploying?' });
      return;
    }

    // Check budget
    const reserve = this.#state.get('reserve') || 0;
    if (reserve < evaluation.totalCost) {
      this.#bus.emit('bento.resolveFailed', { reason: `Insufficient reserve: need $${evaluation.totalCost}B, have $${reserve.toFixed(1)}B` });
      return;
    }

    // Deduct cost
    this.#state.update('reserve', v => +(v - evaluation.totalCost).toFixed(2));

    // Knowledge multiplier: fresh insights per target district boost resilience
    const allInsights = this.#state.get('insights') || [];
    const perDistrictMultiplier = {};
    const targets = evaluation.targets || [];

    for (const districtId of targets) {
      const freshCount = allInsights.filter(
        i => i.districtId === districtId && (i.freshness ?? 1) > 0.3
      ).length;
      perDistrictMultiplier[districtId] = 1 + freshCount * 0.15;
    }

    // Average multiplier across all target districts
    const avgMultiplier = targets.length > 0
      ? targets.reduce((s, id) => s + (perDistrictMultiplier[id] || 1), 0) / targets.length
      : 1;

    // Disorder penalty for blind deployment (zero insights in target districts)
    const blindTargets = targets.filter(id => (perDistrictMultiplier[id] || 1) === 1);
    const blindDisorderPenalty = blindTargets.length * 2;

    const adjustedResilience = Math.round(evaluation.totalResilience * avgMultiplier);
    const adjustedDisorder = evaluation.totalDisorder + blindDisorderPenalty;

    // Build effects array for MetreSystem
    const effects = [{
      label: 'Bento policy',
      targets,
      resilience: adjustedResilience,
      disorder: adjustedDisorder,
    }];

    // Emit for MetreSystem to process
    this.#bus.emit('bento.resolved', {
      tiles: evaluation.placements,
      synergies: evaluation.synergies,
      conflicts: evaluation.conflicts,
      targets,
      effects,
      totalCost: evaluation.totalCost,
      knowledgeMultiplier: avgMultiplier,
      blindTargets,
    });

    // Record in state
    const policies = this.#state.get('policies') || [];
    policies.push({
      id: `bento_${Date.now()}`,
      week: this.#state.get('week'),
      type: 'bento',
      tiles: evaluation.placements.map(p => p.tileId),
      synergies: evaluation.synergies.map(s => s.id),
      conflicts: evaluation.conflicts.map(c => c.id),
      targets: evaluation.targets,
      cost: evaluation.totalCost,
      resilience: evaluation.totalResilience,
      disorder: evaluation.totalDisorder,
    });
    this.#state.set('policies', policies);

    // Clear grid for next use
    this.#grid.clear();
  }

  // ── Helpers ──────────────────────────────────────────────

  #matchesPair(tileA, tileB, required, alsoMatches) {
    const all = [...required, ...(alsoMatches || [])];
    // Check if tileA matches one required and tileB matches the other
    return (all.includes(tileA) && all.includes(tileB) && tileA !== tileB) ||
           (required[0] === tileA && required[1] === tileB) ||
           (required[0] === tileB && required[1] === tileA);
  }

  #resolveTargets(placements) {
    const targets = new Set();
    for (const p of placements) {
      if (p.type !== 'WHERE') continue;
      const tile = this.#allTiles.find(t => t.id === p.tileId);
      if (!tile) continue;
      if (tile.targets === 'all') {
        // Citywide — add all district IDs
        const districts = this.#state.get('districts');
        if (districts) Object.keys(districts).forEach(id => targets.add(id));
      } else if (Array.isArray(tile.targets)) {
        tile.targets.forEach(id => targets.add(id));
      }
      // District-specific WHERE: use the districtTarget set at placement
      if (tile.requiresSelection && p.districtTarget) {
        targets.add(p.districtTarget);
      }
    }
    return [...targets];
  }

  #checkInsightRequirement(tile, insights) {
    if (!tile.requiredInsightCategory) return true;
    const count = insights.filter(
      i => i.category === tile.requiredInsightCategory && i.freshness > 0.3
    ).length;
    return count >= (tile.requiredInsightCount || 1);
  }

  #checkTileRequirements(tile, insights) {
    if (!this.#checkInsightRequirement(tile, insights)) return false;
    if (tile.requiredDept && this.#deptSys) {
      const effective = this.#deptSys.getEffectiveLevel(tile.requiredDept.id);
      if (effective < tile.requiredDept.level) return false;
    }
    return true;
  }
}
