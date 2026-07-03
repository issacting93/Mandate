// systems/deal.js — DealSystem: Blue Prince-style weekly card deal
//
// Each week, deals a hand of district cards from a weighted pool.
// The player drafts up to 3 into meeting slots; undrafted cards return to the pool.
//
// Weights raised by: wanted markers, feed heat, neglect drift, scenario pressure.
// Weights lowered by: recency (recently visited districts less likely to re-deal).
//
// Cards are face-up (visited before) or face-down (never visited).
// Face-down cards reveal more when the matching department lens is funded.

import { NYC_RUMORS } from '$data/nyc-rumors.js';

const HAND_SIZE = 5;
const SLOT_COUNT = 3;

// Weighting constants
const WEIGHT_BASE = 1.0;
const WEIGHT_WANTED = 2.5;        // wanted markers boost deal weight
const WEIGHT_FEED_HOT = 1.5;      // districts with recent feed chatter
const WEIGHT_NEGLECT_PER_WEEK = 0.15; // per week unvisited, cumulative
const WEIGHT_NEGLECT_CAP = 3.0;   // max neglect bonus
const WEIGHT_RECENCY_PENALTY = 0.1; // recently visited = less likely dealt

// Department → insight category mapping for lens legibility
const DEPT_FOR_CAT = {
  Housing: 'HOUSING',
  Services: 'SERVICES',
  Safety: 'SAFETY',
  Transit: 'INFRA',
  Jobs: 'SERVICES',
};

// Department ID → concern score key (for NYC_RUMORS lookup)
const LENS_TO_CONCERN = {
  HEALTH: 'health',
  HOUSING: 'housing',
  INFRA: 'infra',
  SERVICES: 'services',
  SAFETY: 'safety',
  COMMUNITY: 'community',
};

export class DealSystem {
  #bus;
  #state;
  #districts;    // full DISTRICTS array
  #districtMap;  // id → district object
  #deptSys;

  constructor(bus, state, districts, districtMap, deptSys) {
    this.#bus = bus;
    this.#state = state;
    this.#districts = districts;
    this.#districtMap = districtMap;
    this.#deptSys = deptSys;
  }

  // ── Deal a new hand ──────────────────────────────────────
  // Returns array of card objects for the game store.
  deal(gameState) {
    const week = gameState.week || 1;
    const wanted = gameState.wanted || [];
    const feed = gameState.feed || [];
    const wantedSet = new Set(wanted);

    // Build weighted pool
    const pool = [];
    for (const d of this.#districts) {
      const w = this.#calcWeight(d, week, wantedSet, feed);
      if (w > 0) pool.push({ district: d, weight: w });
    }

    // Weighted random selection without replacement
    const hand = [];
    const remaining = [...pool];
    const count = Math.min(HAND_SIZE, remaining.length);

    for (let i = 0; i < count; i++) {
      const totalWeight = remaining.reduce((s, p) => s + p.weight, 0);
      let r = Math.random() * totalWeight;
      let picked = remaining.length - 1;
      for (let j = 0; j < remaining.length; j++) {
        r -= remaining[j].weight;
        if (r <= 0) { picked = j; break; }
      }

      const entry = remaining.splice(picked, 1)[0];
      const d = entry.district;
      const visited = d.lastVisited != null;

      // Determine lens and legibility
      const lensId = DEPT_FOR_CAT[d.cat] || 'SERVICES';
      const lensLevel = this.#deptSys ? this.#deptSys.getEffectiveLevel(lensId) : 0;
      const legible = lensLevel >= 2; // competence threshold

      hand.push({
        districtId: d.id,
        name: d.name,
        boro: d.boro,
        bloc: d.bloc,
        trust: d.trust,
        concern: d.concern,
        cat: d.cat,
        faceUp: visited,
        wanted: wantedSet.has(d.id),
        lensId,
        legible,
        // Face-up fields (only meaningful if visited)
        lastVisited: d.lastVisited,
        know: d.know,
        // Face-down hint (vague feed rumor)
        rumor: visited
          ? this.#getCharacterRumor(d.id, gameState)
          : this.#getVagueRumor(d),
        // Legibility reveal (only if face-down + lens funded)
        lensReveal: (!visited && legible)
          ? this.#getLensReveal(d, lensId)
          : null,
      });
    }

    return hand;
  }

  // ── Weight calculation ──────────────────────────────────
  #calcWeight(d, week, wantedSet, feed) {
    let w = WEIGHT_BASE;

    // Wanted boost
    if (wantedSet.has(d.id)) w += WEIGHT_WANTED;

    // Neglect drift: unvisited districts gain weight over time
    if (d.lastVisited == null) {
      w += Math.min(week * WEIGHT_NEGLECT_PER_WEEK, WEIGHT_NEGLECT_CAP);
    } else {
      const weeksSince = week - d.lastVisited;
      if (weeksSince > 0) {
        w += Math.min(weeksSince * WEIGHT_NEGLECT_PER_WEEK, WEIGHT_NEGLECT_CAP);
      }
      // Recency penalty: visited very recently = less likely
      if (weeksSince <= 2) {
        w *= WEIGHT_RECENCY_PENALTY;
      }
    }

    // Feed heat: districts with recent chatter surface more
    const recentFeed = feed.filter(
      f => f.districtId === d.id && f.week >= week - 2
    );
    if (recentFeed.length > 0) {
      w += WEIGHT_FEED_HOT;
    }

    return Math.max(0.01, w); // never fully zero
  }

  // ── Rumor generators ──────────────────────────────────────
  #getCharacterRumor(districtId, gameState) {
    // For visited districts, pull from recent DMs or insights
    const dms = gameState.dms || [];
    const dm = dms.find(d => d.districtId === districtId);
    if (dm && dm.messages.length > 0) {
      const last = dm.messages[dm.messages.length - 1];
      return `"${last.text}"`;
    }
    const d = this.#districtMap[districtId];
    if (d?.concern) return `"${d.concern}."`;
    return '"Come back when you can."';
  }

  #getVagueRumor(d) {
    // Try real 311 data first (tier 1 = unfunded, vague)
    const deptKey = LENS_TO_CONCERN[DEPT_FOR_CAT[d.cat] || 'SERVICES'];
    const pool = NYC_RUMORS[d.id]?.[deptKey]?.tier1;
    if (pool?.length) return pool[Math.floor(Math.random() * pool.length)];

    // Fallback to hardcoded concern text
    if (d.concern) {
      const vague = [
        'Something about ' + d.concern.split(' ').slice(0, 4).join(' ').toLowerCase() + ', the feed says.',
        'Chatter in the feed about ' + (d.cat || 'issues').toLowerCase() + '.',
      ];
      return vague[Math.floor(Math.random() * 2)];
    }
    return ['Quiet. Too quiet, maybe.', 'Hard to read from here.', 'The feed is vague.'][
      Math.floor(Math.random() * 3)
    ];
  }

  #getLensReveal(d, lensId) {
    const deptKey = LENS_TO_CONCERN[lensId];
    const lensLevel = this.#deptSys ? this.#deptSys.getEffectiveLevel(lensId) : 0;

    // Tier 3 (level 3+): real violation text
    if (lensLevel >= 3) {
      const pool = NYC_RUMORS[d.id]?.[deptKey]?.tier3;
      if (pool?.length) return pool[Math.floor(Math.random() * pool.length)];
    }
    // Tier 2 (level 2+): statistical
    if (lensLevel >= 2) {
      const pool = NYC_RUMORS[d.id]?.[deptKey]?.tier2;
      if (pool?.length) return pool[Math.floor(Math.random() * pool.length)];
    }

    // Fallback to generic lens reveal
    const dept = { HOUSING: 'Housing', HEALTH: 'Health', INFRA: 'Infrastructure', SERVICES: 'Services', SAFETY: 'Safety', COMMUNITY: 'Community' };
    const deptName = dept[lensId] || lensId;
    const fragTypes = {
      Housing: 'a housing fragility',
      Services: 'a services gap',
      Safety: 'an at-risk-residents fragility',
      Transit: 'a transit-access fragility',
      Jobs: 'an economic fragility',
    };
    const fragility = fragTypes[d.cat] || 'a potential fragility';
    return `Your ${deptName} lens reads: likely ${fragility} — ${d.trust < 50 ? 'high-value' : 'moderate-value'} if you go.`;
  }
}
