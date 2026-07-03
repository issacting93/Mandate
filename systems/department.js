// systems/department.js — Department System (Disco Elysium-style skill lenses)
//
// Departments are the player's "skills" — they determine what you perceive
// in conversations. Funding a department makes its interjections more specific
// and reliable. All departments start at level 1 (vague whispers).
//
// Doctrines (§5.5b): At level 2, the player chooses a doctrine (A or B) —
// a competing philosophy that changes perception, tiles, bloc trust, and
// blizzard outcomes. Switching costs $0.3B + 3-week cooldown.
//
// Mapping: HEALTH, HOUSING, INFRA, SERVICES, SAFETY, COMMUNITY
// These map to concern axes in CONCERN_SCORES (transit → INFRA).

import {
  DOCTRINES,
  DOCTRINE_SWITCH_COST,
  DOCTRINE_SWITCH_COOLDOWN,
  DOCTRINE_COOK_TIME,
  DOCTRINE_BLOC_TRUST_BOOST,
  DOCTRINE_BLOC_TRUST_PENALTY,
} from '$data/doctrines.js';

export const DEPARTMENTS = {
  HEALTH:    { id: 'HEALTH',    label: 'Health',          color: '#2A9E5C' },
  HOUSING:   { id: 'HOUSING',   label: 'Housing',         color: '#E8A020' },
  INFRA:     { id: 'INFRA',     label: 'Infrastructure',  color: '#5B6B8C' },
  SERVICES:  { id: 'SERVICES',  label: 'Services',        color: '#7B4FBF' },
  SAFETY:    { id: 'SAFETY',    label: 'Safety',          color: '#E8A020' },
  COMMUNITY: { id: 'COMMUNITY', label: 'Community',       color: '#2A9E5C' },
};

export const DEPT_IDS = Object.keys(DEPARTMENTS);

// Cost to reach each level FROM the previous level
// Level 1 is free (starting). Level 2 costs $0.2B, etc.
const LEVEL_COST = [0, 0, 0.2, 0.4, 0.6, 0.8];
const MAX_LEVEL = 5;

export { DOCTRINES };

export class DepartmentSystem {
  #bus;
  #state;
  #levels;      // Map<deptId, number>
  #doctrines;   // Map<deptId, 'A'|'B'|null>
  #cookingUntil; // Map<deptId, weekNumber> — doctrine activates after this week
  #cooldownUntil; // Map<deptId, weekNumber> — can't switch until after this week

  constructor(bus, state) {
    this.#bus = bus;
    this.#state = state;
    this.#levels = new Map();
    this.#doctrines = new Map();
    this.#cookingUntil = new Map();
    this.#cooldownUntil = new Map();

    // Initialize all departments at level 1, no doctrine
    for (const id of DEPT_IDS) {
      this.#levels.set(id, 1);
      this.#doctrines.set(id, null);
    }

    // Sync initial state
    this.#syncState();

    // Listen for events
    bus.on('department.fund', ({ deptId }) => this.#fund(deptId));
    bus.on('department.defund', ({ deptId }) => this.#defund(deptId));
    bus.on('department.chooseDoctrine', ({ deptId, branch }) => this.#chooseDoctrine(deptId, branch));
    bus.on('department.switchDoctrine', ({ deptId, branch }) => this.#switchDoctrine(deptId, branch));
  }

  // ── Public API ──

  getLevel(deptId) {
    return this.#levels.get(deptId) || 0;
  }

  getEffectiveLevel(deptId) {
    let level = this.getLevel(deptId);

    // Cooking penalty: during doctrine cook time, effective level drops to 1
    const week = this.#state.get('week') || 1;
    const cookUntil = this.#cookingUntil.get(deptId);
    if (cookUntil && week <= cookUntil) {
      return 1;
    }

    // Thought Cabinet bonus: crystallized thoughts give +1
    const thoughts = this.#state.get('thoughts') || [];
    const categoryMap = {
      HEALTH: 'HEALTH', HOUSING: 'HOUSING', INFRA: 'INFRA',
      SERVICES: 'SERVICES', SAFETY: 'SAFETY', COMMUNITY: 'ASSET',
    };
    const cat = categoryMap[deptId];
    if (cat && thoughts.some(t => t.crystallized && t.category === cat)) {
      level = Math.min(MAX_LEVEL, level + 1);
    }

    return level;
  }

  getDoctrine(deptId) {
    return this.#doctrines.get(deptId) || null;
  }

  getDoctrineInfo(deptId) {
    const branch = this.getDoctrine(deptId);
    if (!branch) return null;
    return DOCTRINES[deptId]?.[branch] || null;
  }

  isDoctrineActive(deptId) {
    const week = this.#state.get('week') || 1;
    const cookUntil = this.#cookingUntil.get(deptId);
    return this.getDoctrine(deptId) !== null && (!cookUntil || week > cookUntil);
  }

  isCooking(deptId) {
    const week = this.#state.get('week') || 1;
    const cookUntil = this.#cookingUntil.get(deptId);
    return cookUntil && week <= cookUntil;
  }

  isOnCooldown(deptId) {
    const week = this.#state.get('week') || 1;
    const coolUntil = this.#cooldownUntil.get(deptId);
    return coolUntil && week <= coolUntil;
  }

  needsDoctrine(deptId) {
    return this.getLevel(deptId) >= 2 && this.getDoctrine(deptId) === null;
  }

  canSwitchDoctrine(deptId) {
    if (!this.getDoctrine(deptId)) return false;
    if (this.isOnCooldown(deptId)) return false;
    const reserve = this.#state.get('reserve') || 0;
    return reserve >= DOCTRINE_SWITCH_COST;
  }

  getAllLevels() {
    const result = {};
    for (const [id, level] of this.#levels) {
      result[id] = level;
    }
    return result;
  }

  getAllDoctrines() {
    const result = {};
    for (const [id, branch] of this.#doctrines) {
      result[id] = branch;
    }
    return result;
  }

  canFund(deptId) {
    const current = this.getLevel(deptId);
    if (current >= MAX_LEVEL) return false;
    // Can't fund past level 1 without choosing a doctrine
    if (current >= 2 && this.getDoctrine(deptId) === null) return false;
    // Dual-gate: budget + field requirements
    const req = this.getFundRequirement(deptId);
    if (req && !req.met) return false;
    const cost = LEVEL_COST[current + 1] || 0;
    const reserve = this.#state.get('reserve') || 0;
    return reserve >= cost;
  }

  getFundCost(deptId) {
    const current = this.getLevel(deptId);
    if (current >= MAX_LEVEL) return 0;
    return LEVEL_COST[current + 1] || 0;
  }

  // Dual-gate field requirements for leveling
  getFundRequirement(deptId) {
    const current = this.getLevel(deptId);
    const nextLevel = current + 1;
    if (nextLevel <= 1) return null; // Level 1 is free

    const categoryMap = {
      HEALTH: 'HEALTH', HOUSING: 'HOUSING', INFRA: 'INFRA',
      SERVICES: 'SERVICES', SAFETY: 'SAFETY', COMMUNITY: 'ASSET',
    };
    const cat = categoryMap[deptId];
    const insights = (this.#state.get('insights') || []).filter(
      i => i.category === cat && (i.freshness ?? 1) > 0.3
    );
    const patterns = this.#state.get('patterns') || [];
    const thoughts = this.#state.get('thoughts') || [];
    const forming = patterns.some(p => p.category === cat && p.forming);
    const crystallized = thoughts.some(t => t.category === cat && t.crystallized);

    // Field requirements by level
    if (nextLevel === 2) {
      // Need: doctrine choice (handled separately) + budget
      return null; // Budget-only at level 2
    }
    if (nextLevel === 3) {
      const met = insights.length >= 2;
      return { level: 3, text: `2 fresh ${cat} insights`, met, current: insights.length, needed: 2 };
    }
    if (nextLevel === 4) {
      const met = forming || crystallized;
      return { level: 4, text: `${cat} pattern forming`, met };
    }
    if (nextLevel === 5) {
      return { level: 5, text: `${cat} thought crystallized`, met: crystallized };
    }
    return null;
  }

  // ── Private: Funding ──

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
      needsDoctrine: current + 1 >= 2 && this.getDoctrine(deptId) === null,
    });
  }

  #defund(deptId) {
    if (!this.#levels.has(deptId)) return;
    const current = this.getLevel(deptId);
    if (current <= 1) return;

    this.#levels.set(deptId, current - 1);
    this.#syncState();

    this.#bus.emit('department.defunded', { deptId, newLevel: current - 1 });
  }

  // ── Private: Doctrines ──

  #chooseDoctrine(deptId, branch) {
    if (!DOCTRINES[deptId]?.[branch]) return;
    if (this.getDoctrine(deptId) !== null) return; // Already chosen — use switch

    const week = this.#state.get('week') || 1;

    this.#doctrines.set(deptId, branch);
    this.#cookingUntil.set(deptId, week + DOCTRINE_COOK_TIME);
    this.#syncState();

    const doctrine = DOCTRINES[deptId][branch];

    this.#bus.emit('department.doctrineChosen', {
      deptId,
      branch,
      doctrine,
      activatesWeek: week + DOCTRINE_COOK_TIME + 1,
    });

    // Bloc trust shifts
    this.#bus.emit('doctrine.blocShift', {
      deptId,
      boost: doctrine.blocBoost,
      penalty: doctrine.blocPenalty,
      boostAmount: DOCTRINE_BLOC_TRUST_BOOST,
      penaltyAmount: DOCTRINE_BLOC_TRUST_PENALTY,
    });
  }

  #switchDoctrine(deptId, branch) {
    if (!DOCTRINES[deptId]?.[branch]) return;
    if (!this.canSwitchDoctrine(deptId)) return;
    if (this.getDoctrine(deptId) === branch) return; // Same doctrine

    const week = this.#state.get('week') || 1;

    // Pay switching cost
    this.#state.update('reserve', v => +(v - DOCTRINE_SWITCH_COST).toFixed(2));

    // Reset to level 2
    this.#levels.set(deptId, 2);

    // Set new doctrine with cook time and cooldown
    const oldBranch = this.getDoctrine(deptId);
    this.#doctrines.set(deptId, branch);
    this.#cookingUntil.set(deptId, week + DOCTRINE_COOK_TIME);
    this.#cooldownUntil.set(deptId, week + DOCTRINE_SWITCH_COOLDOWN);
    this.#syncState();

    const doctrine = DOCTRINES[deptId][branch];

    this.#bus.emit('department.doctrineSwitched', {
      deptId,
      oldBranch,
      newBranch: branch,
      doctrine,
      cost: DOCTRINE_SWITCH_COST,
      activatesWeek: week + DOCTRINE_COOK_TIME + 1,
    });

    // New bloc trust shifts
    this.#bus.emit('doctrine.blocShift', {
      deptId,
      boost: doctrine.blocBoost,
      penalty: doctrine.blocPenalty,
      boostAmount: DOCTRINE_BLOC_TRUST_BOOST,
      penaltyAmount: DOCTRINE_BLOC_TRUST_PENALTY,
    });
  }

  #syncState() {
    this.#state.set('departments', this.getAllLevels());
    this.#state.set('doctrines', this.getAllDoctrines());
  }
}
