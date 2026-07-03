// data/comms-tiles.js — Communication Bento Box tile definitions
//
// The communication bento is a spatial puzzle for public statements.
// You assemble a message from tiles earned by listening.
// AUDIENCE (who) + CONCERN (what) + EVIDENCE (proof) + TONE (voice).

// ── AUDIENCE tiles (always available) ────────────────────
export const AUDIENCE_TILES = [
  { id: 'aud_bronx',     type: 'AUDIENCE', label: 'The Bronx',       size: [2, 1], targets: ['riverdale', 'fordham', 'southbronx'], desc: 'Address all Bronx districts.' },
  { id: 'aud_manhattan',  type: 'AUDIENCE', label: 'Manhattan',       size: [2, 1], targets: ['harlem', 'ues', 'midtown', 'lowerman'], desc: 'Address all Manhattan districts.' },
  { id: 'aud_queens',     type: 'AUDIENCE', label: 'Queens',          size: [2, 1], targets: ['astoria', 'lic', 'jackson', 'flushing', 'jamaica'], desc: 'Address all Queens districts.' },
  { id: 'aud_brooklyn',   type: 'AUDIENCE', label: 'Brooklyn',        size: [2, 1], targets: ['williamsburg', 'dtbk', 'bushwick', 'crown', 'bayridge'], desc: 'Address all Brooklyn districts.' },
  { id: 'aud_si',         type: 'AUDIENCE', label: 'Staten Island',   size: [1, 1], targets: ['northshore', 'midisland'], desc: 'Address Staten Island.' },
  { id: 'aud_district',   type: 'AUDIENCE', label: 'One District',    size: [1, 1], targets: [], requiresSelection: true, desc: 'Address a single district. Most targeted.' },
  { id: 'aud_citywide',   type: 'AUDIENCE', label: 'All of NYC',      size: [3, 1], targets: 'all', desc: 'Address the whole city. Wide but thin.' },
];

// ── TONE tiles (always available) ────────────────────────
export const TONE_TILES = [
  {
    id: 'tone_urgent',
    type: 'TONE', label: 'Urgent', size: [1, 1],
    desc: 'Treat this as an emergency. Boosts high-concern districts, disorder in calm ones.',
    toneId: 'urgent',
  },
  {
    id: 'tone_empathetic',
    type: 'TONE', label: 'Empathetic', size: [1, 1],
    desc: 'Show you understand why it hurts. Small universal boost, larger in visited districts.',
    toneId: 'empathetic',
  },
  {
    id: 'tone_concrete',
    type: 'TONE', label: 'Concrete', size: [1, 1],
    desc: 'Cite facts and specifics. Multiplier when adjacent to EVIDENCE tiles.',
    toneId: 'concrete',
  },
  {
    id: 'tone_visionary',
    type: 'TONE', label: 'Visionary', size: [1, 1],
    desc: 'Paint the bigger picture. Boosts discovery in unvisited districts, slight disorder in visited ones.',
    toneId: 'visionary',
  },
  {
    id: 'tone_platitude',
    type: 'TONE', label: 'Platitude', size: [1, 1],
    desc: 'Say nothing with conviction. No benefit. Slight disorder increase. The trap.',
    toneId: 'platitude',
  },
];

// ── CONCERN label mapping ────────────────────────────────
export const CONCERN_LABELS = {
  HEALTH:    'Health Crisis',
  HOUSING:   'Housing Pressure',
  INFRA:     'Infrastructure Gap',
  SERVICES:  'Service Failure',
  SAFETY:    'Safety Threat',
  ASSET:     'Community Strength',
  COMMUNITY: 'Community Networks',
};

// ── SYNERGY rules (adjacency bonuses) ────────────────────
export const COMMS_SYNERGIES = [
  {
    id: 'syn_named_source',
    label: 'Named Source',
    desc: 'Evidence from a visited district addressed to that same audience. "They used my words."',
    check: (tileA, tileB) => {
      if (tileA.type === 'EVIDENCE' && tileB.type === 'AUDIENCE') {
        return tileB.targets && (
          Array.isArray(tileB.targets)
            ? tileB.targets.includes(tileA.insightRef?.districtId)
            : tileB.targets === 'all'
        );
      }
      if (tileB.type === 'EVIDENCE' && tileA.type === 'AUDIENCE') {
        return tileA.targets && (
          Array.isArray(tileA.targets)
            ? tileA.targets.includes(tileB.insightRef?.districtId)
            : tileA.targets === 'all'
        );
      }
      return false;
    },
    groundingBonus: 3,
    hollowReduction: 2,
  },
  {
    id: 'syn_connected_dots',
    label: 'Connected Dots',
    desc: 'Two evidence tiles from different districts, same category. "They see the pattern."',
    check: (tileA, tileB) => {
      return tileA.type === 'EVIDENCE' && tileB.type === 'EVIDENCE'
        && tileA.insightRef?.category === tileB.insightRef?.category
        && tileA.insightRef?.districtId !== tileB.insightRef?.districtId;
    },
    groundingBonus: 2,
    hollowReduction: 0,
  },
  {
    id: 'syn_receipts',
    label: 'Receipts',
    desc: 'Concrete tone adjacent to evidence. "Not platitudes. Actual data."',
    check: (tileA, tileB) => {
      return (tileA.toneId === 'concrete' && tileB.type === 'EVIDENCE')
          || (tileB.toneId === 'concrete' && tileA.type === 'EVIDENCE');
    },
    groundingBonus: 2,
    hollowReduction: 1,
  },
  {
    id: 'syn_empathy_concern',
    label: 'Heard You',
    desc: 'Empathetic tone adjacent to a concern. "They understand why it hurts."',
    check: (tileA, tileB) => {
      return (tileA.toneId === 'empathetic' && tileB.type === 'CONCERN')
          || (tileB.toneId === 'empathetic' && tileA.type === 'CONCERN');
    },
    groundingBonus: 2,
    hollowReduction: 1,
  },
  {
    id: 'syn_community_voice',
    label: 'Community Amplifier',
    desc: 'ASSET evidence adjacent to matching audience. "Amplifying what we already built."',
    check: (tileA, tileB) => {
      if (tileA.type === 'EVIDENCE' && tileA.insightRef?.category === 'ASSET' && tileB.type === 'AUDIENCE') {
        return Array.isArray(tileB.targets) && tileB.targets.includes(tileA.insightRef?.districtId);
      }
      if (tileB.type === 'EVIDENCE' && tileB.insightRef?.category === 'ASSET' && tileA.type === 'AUDIENCE') {
        return Array.isArray(tileA.targets) && tileA.targets.includes(tileB.insightRef?.districtId);
      }
      return false;
    },
    groundingBonus: 4,
    hollowReduction: 2,
  },
];

// ── CONFLICT rules (adjacency penalties) ─────────────────
export const COMMS_CONFLICTS = [
  {
    id: 'con_empty_rhetoric',
    label: 'Empty Rhetoric',
    desc: 'Concern with tone but no adjacent evidence. "Another press release."',
    check: (tileA, tileB, allPlacements, grid) => {
      // This conflict is special — it checks for ABSENCE of evidence neighbors
      // Handled in the evaluation loop, not pairwise
      return false;
    },
    groundingPenalty: 2,
    hollowCost: 3,
  },
  {
    id: 'con_platitude_evidence',
    label: 'Wasted Intel',
    desc: 'Platitude tone next to real evidence. "They had data and buried it in boilerplate."',
    check: (tileA, tileB) => {
      return (tileA.toneId === 'platitude' && tileB.type === 'EVIDENCE')
          || (tileB.toneId === 'platitude' && tileA.type === 'EVIDENCE');
    },
    groundingPenalty: 2,
    hollowCost: 1,
  },
  {
    id: 'con_crying_wolf',
    label: 'Crying Wolf',
    desc: 'Urgent tone addressing a calm district. "Nobody here thinks this is a crisis."',
    check: (tileA, tileB) => {
      // Checked during scoring against concern scores, not pairwise
      return false;
    },
    groundingPenalty: 0,
    hollowCost: 2,
  },
];
