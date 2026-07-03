// systems/comms-bento.js — Communication Bento Box
//
// Spatial puzzle for public statements. 4×3 grid.
// Player assembles AUDIENCE + CONCERN + EVIDENCE + TONE tiles.
// Evidence tiles come from discovered insights — you can only say what you've heard.
// Outputs { scores[], overall, summary } for the post effects pipeline.

import { AUDIENCE_TILES, TONE_TILES, CONCERN_LABELS, COMMS_SYNERGIES, COMMS_CONFLICTS } from '$data/comms-tiles.js';

const COLS = 4;
const ROWS = 3;

// ── CommsGrid (4×3) ──────────────────────────────────────
export class CommsGrid {
  #cells;
  #placements;

  constructor() {
    this.#cells = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.#placements = new Map();
  }

  get cols() { return COLS; }
  get rows() { return ROWS; }

  canPlace(tile, col, row) {
    const [w, h] = tile.size;
    if (col + w > COLS || row + h > ROWS) return false;
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        if (this.#cells[r][c] !== null) return false;
      }
    }
    return true;
  }

  place(tile, col, row, districtTarget) {
    if (!this.canPlace(tile, col, row)) return null;
    const pid = `cp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const [w, h] = tile.size;
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        this.#cells[r][c] = { tileId: tile.id, placementId: pid };
      }
    }
    this.#placements.set(pid, { tile, col, row, districtTarget: districtTarget || null });
    return pid;
  }

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

  clear() {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) this.#cells[r][c] = null;
    this.#placements.clear();
  }

  getCell(col, row) { return this.#cells[row]?.[col] ?? null; }
  getPlacement(pid) { return this.#placements.get(pid) || null; }

  getAllPlacements() {
    return [...this.#placements.entries()].map(([pid, p]) => ({
      placementId: pid, tileId: p.tile.id, label: p.tile.label,
      type: p.tile.type, col: p.col, row: p.row, size: p.tile.size,
      districtTarget: p.districtTarget, tile: p.tile,
    }));
  }

  getAdjacentPlacements(placementId) {
    const p = this.#placements.get(placementId);
    if (!p) return [];
    const [w, h] = p.tile.size;
    const adjacent = new Set();
    for (let r = p.row; r < p.row + h; r++) {
      for (let c = p.col; c < p.col + w; c++) {
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          const neighbor = this.#cells[nr][nc];
          if (neighbor && neighbor.placementId !== placementId) {
            adjacent.add(neighbor.placementId);
          }
        }
      }
    }
    return [...adjacent].map(pid => this.#placements.get(pid)).filter(Boolean);
  }

  get cellsUsed() {
    let c = 0;
    for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) if (this.#cells[r][col]) c++;
    return c;
  }
  get cellsFree() { return COLS * ROWS - this.cellsUsed; }

  toGrid() {
    return this.#cells.map(row => row.map(cell =>
      cell ? { tileId: cell.tileId, placementId: cell.placementId } : null
    ));
  }
}

// ── CommsBentoSystem ─────────────────────────────────────
export class CommsBentoSystem {
  #bus;
  #state;
  #grid;
  #districtMap;
  #concernScores;

  constructor(bus, state, districtMap, concernScores) {
    this.#bus = bus;
    this.#state = state;
    this.#grid = new CommsGrid();
    this.#districtMap = districtMap;
    this.#concernScores = concernScores;

    bus.on('ui.commsOpen', () => this.#present());
    bus.on('ui.commsPlace', (e) => this.#handlePlace(e));
    bus.on('ui.commsRemove', (e) => this.#handleRemove(e));
    bus.on('ui.commsResolve', () => this.#resolve());
    bus.on('ui.commsClear', () => this.#handleClear());
  }

  getGrid() { return this.#grid; }

  // ── Generate tiles from current insights ──────────────
  getAvailableTiles(insights) {
    const tiles = [];

    // AUDIENCE (always available)
    tiles.push(...AUDIENCE_TILES.map(t => ({ ...t })));

    // CONCERN (one per category with fresh insights)
    const freshByCat = {};
    for (const ins of (insights || [])) {
      if (ins.freshness <= 0.3) continue;
      if (!freshByCat[ins.category]) freshByCat[ins.category] = [];
      freshByCat[ins.category].push(ins);
    }
    for (const [cat, catIns] of Object.entries(freshByCat)) {
      const districts = new Set(catIns.map(i => i.districtId));
      const mutated = catIns.length >= 2 && districts.size >= 2;
      tiles.push({
        id: `conc_${cat.toLowerCase()}`,
        type: 'CONCERN',
        label: CONCERN_LABELS[cat] || cat,
        size: mutated ? [1, 1] : [2, 1],
        concernCategory: cat,
        groundingScore: mutated ? 2 : 1,
        desc: mutated
          ? `Cross-district ${cat.toLowerCase()} concern. Field-verified across ${districts.size} districts.`
          : `${CONCERN_LABELS[cat] || cat}. Based on ${catIns.length} insight(s).`,
      });
    }

    // EVIDENCE (one per fresh insight)
    for (const ins of (insights || [])) {
      if (ins.freshness <= 0) continue;
      const label = ins.text.split('—')[0].split('–')[0].trim().substring(0, 28);
      tiles.push({
        id: `ev_${ins.category.toLowerCase()}_${ins.districtId}_${ins.week}`,
        type: 'EVIDENCE',
        label,
        size: ins.freshness > 0.3 ? [1, 1] : [2, 1],
        insightRef: { ...ins },
        groundingValue: ins.freshness > 0.8 ? 2.5 : ins.freshness > 0.5 ? 2 : ins.freshness > 0.3 ? 1.5 : 1,
        desc: `${ins.category} — ${ins.text}`,
      });
    }

    // TONE (always available)
    tiles.push(...TONE_TILES.map(t => ({ ...t })));

    return tiles;
  }

  // ── Evaluate current grid ─────────────────────────────
  evaluate(insights) {
    const placements = this.#grid.getAllPlacements();
    const synergies = [];
    const conflicts = [];
    let totalGrounding = 0;
    let totalHollow = 0;

    // Check pairwise adjacency for synergies/conflicts
    const checked = new Set();
    for (const p of placements) {
      const adjacents = this.#grid.getAdjacentPlacements(p.placementId);
      for (const adj of adjacents) {
        const pairKey = [p.placementId, adj.tile.id].sort().join('|');
        if (checked.has(pairKey)) continue;
        checked.add(pairKey);

        for (const syn of COMMS_SYNERGIES) {
          if (syn.check(p.tile, adj.tile, placements, this.#grid)) {
            if (!synergies.some(s => s.id === syn.id)) {
              synergies.push(syn);
              totalGrounding += syn.groundingBonus || 0;
              totalHollow -= syn.hollowReduction || 0;
            }
          }
        }
        for (const con of COMMS_CONFLICTS) {
          if (con.check(p.tile, adj.tile, placements, this.#grid)) {
            if (!conflicts.some(c => c.id === con.id)) {
              conflicts.push(con);
              totalGrounding -= con.groundingPenalty || 0;
              totalHollow += con.hollowCost || 0;
            }
          }
        }
      }
    }

    // Check for "Empty Rhetoric" — CONCERN with adjacent TONE but no adjacent EVIDENCE
    const concernPlacements = placements.filter(p => p.type === 'CONCERN');
    for (const cp of concernPlacements) {
      const adjacents = this.#grid.getAdjacentPlacements(cp.placementId);
      const hasAdjacentEvidence = adjacents.some(a => a.tile.type === 'EVIDENCE');
      const hasAdjacentTone = adjacents.some(a => a.tile.type === 'TONE');
      if (hasAdjacentTone && !hasAdjacentEvidence) {
        if (!conflicts.some(c => c.id === 'con_empty_rhetoric')) {
          conflicts.push(COMMS_CONFLICTS.find(c => c.id === 'con_empty_rhetoric'));
          totalGrounding -= 2;
          totalHollow += 3;
        }
      }
    }

    // Sum base grounding from evidence tiles
    for (const p of placements) {
      if (p.tile.groundingValue) totalGrounding += p.tile.groundingValue;
      if (p.tile.groundingScore) totalGrounding += p.tile.groundingScore;
      if (p.tile.toneId === 'platitude') totalHollow += 1;
    }

    // Resolve targets
    const targets = this.#resolveTargets(placements);

    return {
      placements,
      synergies,
      conflicts,
      targets,
      totalGrounding: Math.max(0, totalGrounding),
      totalHollow: Math.max(0, totalHollow),
      cellsUsed: this.#grid.cellsUsed,
      cellsFree: this.#grid.cellsFree,
      hasAudience: placements.some(p => p.type === 'AUDIENCE'),
      hasConcern: placements.some(p => p.type === 'CONCERN'),
    };
  }

  // ── Score per district ────────────────────────────────
  scoreCommsGrid(insights) {
    const eval_ = this.evaluate(insights);
    const placements = eval_.placements;
    const targets = eval_.targets;
    const evidenceTiles = placements.filter(p => p.type === 'EVIDENCE');
    const tones = placements.filter(p => p.tile.toneId);
    const scores = [];

    for (const districtId of targets) {
      const d = this.#districtMap[districtId];
      if (!d) continue;

      // Base from evidence matching this district
      let base = 0;
      for (const ev of evidenceTiles) {
        const ref = ev.tile.insightRef;
        if (!ref) continue;
        if (ref.districtId === districtId) {
          base += (ref.freshness || 0.5) * 2.0;
        } else if (d.boro && this.#districtMap[ref.districtId]?.boro === d.boro) {
          base += (ref.freshness || 0.5) * 0.5;
        }
      }
      base = Math.min(5, base);

      // Concern match
      const concerns = this.#concernScores?.[districtId];
      const concernTiles = placements.filter(p => p.type === 'CONCERN');
      let concernMatch = -1; // penalty for no concern match
      if (concerns && concernTiles.length > 0) {
        const topConcern = Object.entries(concerns).sort((a, b) => b[1] - a[1])[0];
        for (const ct of concernTiles) {
          if (ct.tile.concernCategory === topConcern?.[0]?.toUpperCase()) {
            concernMatch = 2;
            break;
          }
        }
        if (concernMatch < 0) {
          // Check secondary concerns
          const secondConcern = Object.entries(concerns).sort((a, b) => b[1] - a[1])[1];
          for (const ct of concernTiles) {
            if (ct.tile.concernCategory === secondConcern?.[0]?.toUpperCase()) {
              concernMatch = 1;
              break;
            }
          }
        }
      }
      if (concernMatch < 0 && concernTiles.length > 0) concernMatch = 0;

      // Tone modifiers
      let toneBonus = 0;
      const topConcernVal = concerns ? Math.max(...Object.values(concerns)) : 5;
      for (const t of tones) {
        if (t.tile.toneId === 'empathetic') {
          toneBonus += d.lastVisited != null ? 1.0 : 0.5;
        } else if (t.tile.toneId === 'urgent') {
          toneBonus += topConcernVal >= 7 ? 1.5 : -0.5;
        } else if (t.tile.toneId === 'visionary') {
          toneBonus += d.lastVisited == null ? 1.0 : -0.5;
        } else if (t.tile.toneId === 'concrete') {
          const hasDirectEvidence = evidenceTiles.some(e => e.tile.insightRef?.districtId === districtId);
          toneBonus += hasDirectEvidence ? 1.0 : -0.5;
        }
      }

      // Hollow penalty for no evidence
      let hollow = 0;
      const hasDirectEvidence = evidenceTiles.some(e => e.tile.insightRef?.districtId === districtId);
      if (!hasDirectEvidence) hollow += 2;

      const raw = base + concernMatch + toneBonus + eval_.totalGrounding * 0.3 - hollow - eval_.totalHollow * 0.3;
      const score = Math.max(0, Math.min(10, Math.round(raw)));

      const charName = this.#getCharName(districtId);
      scores.push({
        district: districtId,
        score,
        resident: charName,
        hasSpecificity: hasDirectEvidence,
        reaction: this.#generateReaction(score, hasDirectEvidence, charName),
      });
    }

    const overall = scores.length > 0
      ? Math.round(scores.reduce((s, e) => s + e.score, 0) / scores.length)
      : 0;

    let summary;
    if (scores.length === 0) {
      summary = 'Statement reaches no one.';
    } else if (overall >= 7) {
      summary = `Statement resonates across ${scores.length} district(s). Grounded in field knowledge.`;
    } else if (overall >= 4) {
      summary = `Statement reaches ${scores.length} district(s). Room for more specifics.`;
    } else {
      summary = `Statement heard in ${scores.length} district(s) but lacks substance.`;
    }

    return { scores, overall, summary };
  }

  // ── Event handlers ────────────────────────────────────
  #present() {
    const insights = this.#state.get('insights') || [];
    const available = this.getAvailableTiles(insights);
    const evaluation = this.evaluate(insights);
    this.#bus.emit('comms.presented', { available, evaluation, grid: this.#grid.toGrid() });
  }

  #handlePlace({ tileId, col, row, districtTarget }) {
    const insights = this.#state.get('insights') || [];
    const allTiles = this.getAvailableTiles(insights);
    const tile = allTiles.find(t => t.id === tileId);
    if (!tile) return;
    const pid = this.#grid.place(tile, col, row, districtTarget);
    if (!pid) {
      this.#bus.emit('comms.placeFailed', { tileId, reason: 'blocked' });
      return;
    }
    const evaluation = this.evaluate(insights);
    this.#bus.emit('comms.placed', { placementId: pid, evaluation, grid: this.#grid.toGrid() });
  }

  #handleRemove({ placementId }) {
    this.#grid.remove(placementId);
    const insights = this.#state.get('insights') || [];
    const evaluation = this.evaluate(insights);
    this.#bus.emit('comms.removed', { placementId, evaluation, grid: this.#grid.toGrid() });
  }

  #handleClear() {
    this.#grid.clear();
    this.#bus.emit('comms.cleared', {});
  }

  #resolve() {
    const insights = this.#state.get('insights') || [];
    const eval_ = this.evaluate(insights);

    if (!eval_.hasAudience) {
      this.#bus.emit('comms.resolveFailed', { reason: 'No AUDIENCE tile — who are you speaking to?' });
      return;
    }
    if (!eval_.hasConcern) {
      this.#bus.emit('comms.resolveFailed', { reason: 'No CONCERN tile — what are you addressing?' });
      return;
    }

    const result = this.scoreCommsGrid(insights);

    // Build post object
    const statementText = this.#generateStatementText(eval_.placements);
    const post = {
      text: statementText,
      tone: eval_.placements.find(p => p.tile.toneId)?.tile.toneId || 'matter-of-fact',
      grounded: result.overall >= 4,
      scores: result.scores,
      overall: result.overall,
      summary: result.summary,
      engagement: {
        likes: Math.round(result.overall * 20 + Math.random() * 20),
        shares: Math.round(result.overall * 5 + Math.random() * 10),
        replies: result.scores.length + Math.round(Math.random() * 5),
      },
      week: this.#state.get('week') || 1,
      order: Date.now(),
      tiles: eval_.placements.map(p => p.tileId),
      synergies: eval_.synergies.map(s => s.id),
      conflicts: eval_.conflicts.map(c => c.id),
    };

    // Emit for downstream effects (trust, DMs, feed cascade, etc.)
    const perDistrictScores = {};
    result.scores.forEach(s => { perDistrictScores[s.district] = s.score; });
    this.#bus.emit('post.scored', { groundingScore: result.overall / 10, perDistrictScores });

    // Emit resolved for UI
    this.#bus.emit('comms.resolved', { post, scores: result.scores, synergies: eval_.synergies, conflicts: eval_.conflicts });

    // Clear grid
    this.#grid.clear();
  }

  // ── Helpers ───────────────────────────────────────────
  #resolveTargets(placements) {
    const targets = new Set();
    for (const p of placements) {
      if (p.type !== 'AUDIENCE') continue;
      if (p.tile.targets === 'all') {
        for (const id of Object.keys(this.#districtMap)) targets.add(id);
      } else if (Array.isArray(p.tile.targets) && p.tile.targets.length > 0) {
        p.tile.targets.forEach(id => targets.add(id));
      }
      if (p.tile.requiresSelection && p.districtTarget) {
        targets.add(p.districtTarget);
      }
    }
    return [...targets];
  }

  #getCharName(districtId) {
    // Will be resolved by the UI/engine from CONVERSATIONS
    return 'A resident';
  }

  #generateReaction(score, hasEvidence, name) {
    if (score >= 8 && hasEvidence) return `"They used my words. Someone was actually listening."`;
    if (score >= 8) return `"That's not a press release. Someone was paying attention."`;
    if (score >= 5 && hasEvidence) return `"At least they know we exist. Let's see what happens."`;
    if (score >= 5) return `"Better than nothing. They mentioned us by name."`;
    if (score >= 3) return `"I heard the speech. Nothing we haven't heard before."`;
    return `"Who wrote that? They've never set foot in this neighborhood."`;
  }

  #generateStatementText(placements) {
    const audiences = placements.filter(p => p.type === 'AUDIENCE').map(p => p.label);
    const concerns = placements.filter(p => p.type === 'CONCERN').map(p => p.label);
    const evidence = placements.filter(p => p.type === 'EVIDENCE').map(p => p.label);
    const tones = placements.filter(p => p.tile.toneId).map(p => p.label);

    const parts = [];
    if (audiences.length) parts.push(`To ${audiences.join(' and ')}`);
    if (concerns.length) parts.push(`on ${concerns.join(', ')}`);
    if (evidence.length) parts.push(`citing: ${evidence.join('; ')}`);
    if (tones.length) parts.push(`[${tones.join(', ')}]`);
    return parts.join(' — ') || 'Empty statement.';
  }
}
