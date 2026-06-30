// systems/department.js — Department System (Disco Elysium-style skill lenses)
//
// Departments are the player's "skills" — they determine what you perceive
// in conversations. Funding a department makes its interjections more specific
// and reliable. All departments start at level 1 (vague whispers).
//
// Mapping: HEALTH, HOUSING, INFRA, SERVICES, SAFETY, COMMUNITY
// These map to concern axes in CONCERN_SCORES (transit → INFRA).

export const DEPARTMENTS = {
  HEALTH:    { id: 'HEALTH',    label: 'Health',          color: '#2dd4bf' },
  HOUSING:   { id: 'HOUSING',   label: 'Housing',         color: '#f59e0b' },
  INFRA:     { id: 'INFRA',     label: 'Infrastructure',  color: '#64748b' },
  SERVICES:  { id: 'SERVICES',  label: 'Services',        color: '#8b5cf6' },
  SAFETY:    { id: 'SAFETY',    label: 'Safety',          color: '#f97316' },
  COMMUNITY: { id: 'COMMUNITY', label: 'Community',       color: '#22c55e' },
};

export const DEPT_IDS = Object.keys(DEPARTMENTS);

// Cost to reach each level FROM the previous level
// Level 1 is free (starting). Level 2 costs $0.2B, etc.
const LEVEL_COST = [0, 0, 0.2, 0.4, 0.6, 0.8];
const MAX_LEVEL = 5;

export class DepartmentSystem {
  #bus;
  #state;
  #levels; // Map<deptId, number>

  constructor(bus, state) {
    this.#bus = bus;
    this.#state = state;
    this.#levels = new Map();

    // Initialize all departments at level 1
    for (const id of DEPT_IDS) {
      this.#levels.set(id, 1);
    }

    // Sync initial state
    this.#syncState();

    // Listen for funding events
    bus.on('department.fund', ({ deptId }) => this.#fund(deptId));
    bus.on('department.defund', ({ deptId }) => this.#defund(deptId));
  }

  // ── Public API ──

  getLevel(deptId) {
    return this.#levels.get(deptId) || 0;
  }

  getEffectiveLevel(deptId) {
    let level = this.getLevel(deptId);

    // Thought Cabinet bonus: crystallized thoughts give +1
    const thoughts = this.#state.get('thoughts') || [];
    const deptInfo = DEPARTMENTS[deptId];
    if (deptInfo) {
      const categoryMap = {
        HEALTH: 'HEALTH', HOUSING: 'HOUSING', INFRA: 'INFRA',
        SERVICES: 'SERVICES', SAFETY: 'SAFETY', COMMUNITY: 'ASSET',
      };
      const cat = categoryMap[deptId];
      if (thoughts.some(t => t.crystallized && t.category === cat)) {
        level = Math.min(MAX_LEVEL, level + 1);
      }
    }

    return level;
  }

  getAllLevels() {
    const result = {};
    for (const [id, level] of this.#levels) {
      result[id] = level;
    }
    return result;
  }

  canFund(deptId) {
    const current = this.getLevel(deptId);
    if (current >= MAX_LEVEL) return false;
    const cost = LEVEL_COST[current + 1] || 0;
    const reserve = this.#state.get('reserve') || 0;
    return reserve >= cost;
  }

  getFundCost(deptId) {
    const current = this.getLevel(deptId);
    if (current >= MAX_LEVEL) return 0;
    return LEVEL_COST[current + 1] || 0;
  }

  // ── Private ──

  #fund(deptId) {
    if (!this.#levels.has(deptId)) return;
    const current = this.getLevel(deptId);
    if (current >= MAX_LEVEL) return;

    const cost = LEVEL_COST[current + 1] || 0;
    const reserve = this.#state.get('reserve') || 0;
    if (reserve < cost) {
      this.#bus.emit('department.fundFailed', { deptId, reason: 'Insufficient reserve' });
      return;
    }

    // Deduct cost
    this.#state.update('reserve', v => +(v - cost).toFixed(2));

    // Increase level
    this.#levels.set(deptId, current + 1);
    this.#syncState();

    this.#bus.emit('department.funded', {
      deptId,
      newLevel: current + 1,
      cost,
    });
  }

  #defund(deptId) {
    if (!this.#levels.has(deptId)) return;
    const current = this.getLevel(deptId);
    if (current <= 1) return; // Can't go below 1

    this.#levels.set(deptId, current - 1);
    this.#syncState();

    this.#bus.emit('department.defunded', { deptId, newLevel: current - 1 });
  }

  #syncState() {
    const levels = this.getAllLevels();
    this.#state.set('departments', levels);
  }
}
