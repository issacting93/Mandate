// scoring.js — Hybrid post scoring engine
//
// Scores player social media posts against discovered insights.
// Three components: category match + keyword overlap + specificity bonus.
// No LLM, no network, <5ms per post.
//
// Returns { scores[], overall, summary } — same shape as the old fallbackScore.

// ── Category keyword banks ──────────────────────────────────
// Stem prefixes where useful (e.g. "evacuat" matches evacuate/evacuation)

const CATEGORY_BANKS = {
  HEALTH: [
    'health', 'asthma', 'inhaler', 'insulin', 'medication', 'medicine', 'pharmacy',
    'hospital', 'oxygen', 'concentrator', 'diabetic', 'diabetes', 'medical',
    'prescription', 'vaccine', 'refrigerat', 'nurse', 'doctor', 'clinic',
    'ambulance', 'emt', 'paramedic', 'vulnerable', 'elderly', 'senior',
    'homebound', 'heatwave', 'hypothermia', 'chronic', 'mortality', 'cold exposure',
  ],
  HOUSING: [
    'housing', 'rent', 'tenant', 'landlord', 'building', 'apartment', 'unit',
    'boiler', 'heat', 'elevator', 'floor', 'walk-up', 'stabilized',
    'displacement', 'rezoning', 'evict', 'code enforcement', 'inspector',
    'basement', 'overcrowd', 'shelter', 'warming center',
  ],
  INFRA: [
    'infrastructure', 'transit', 'bus', 'subway', 'ferry', 'bridge', 'road',
    'power', 'grid', 'blackout', 'generator', 'outage', 'seawall', 'flood',
    'parkway', 'standpipe', 'hydrant', 'loading dock', 'freight', 'commut',
    'plow', 'salt', 'debris', 'water main', 'sewer',
  ],
  SERVICES: [
    '311', 'service', 'response time', 'emergency alert', 'language', 'english',
    'multilingual', 'translation', 'broadcast', 'communication', 'info hub',
    'outreach', 'school closure', 'food insecure', 'supervision', 'bodega',
    'information', 'access',
  ],
  SAFETY: [
    'safety', 'shooting', 'crime', 'police', 'fire', 'fdny', 'cert',
    'evacuat', 'drill', 'radio', 'dispatch', 'first responder',
    'distrustful', 'isolated', 'door-to-door', 'stranded',
  ],
  ASSET: [
    'church', 'pharmacy', 'school', 'vfw', 'bodega', 'community center',
    'mutual aid', 'block captain', 'volunteer', 'network', 'registry',
    'phone tree', 'generator', 'kitchen', 'shelter capacity', 'asset',
  ],
  COMMUNITY: [
    'community', 'mutual aid', 'network', 'captain', 'organizer', 'coordinator',
    'association', 'congregation', 'volunteer', 'neighbor', 'block',
    'self-organiz', 'grassroot',
  ],
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
  'was', 'one', 'our', 'out', 'has', 'have', 'been', 'from', 'they', 'will',
  'with', 'this', 'that', 'what', 'when', 'make', 'like', 'just', 'about',
  'over', 'such', 'into', 'more', 'some', 'than', 'them', 'very', 'after',
  'also', 'most', 'much', 'need', 'city', 'people', 'mayor', 'should', 'would',
  'could', 'going', 'every', 'those', 'these', 'their', 'there', 'where',
  'been', 'being', 'does', 'doing', 'done', 'each', 'here', 'know', 'many',
  'well', 'work', 'take', 'come', 'back', 'want', 'look', 'good', 'great',
]);

const PLATITUDES = [
  'we care about', 'committed to', 'looking into', 'top priority',
  'working on', 'thoughts and prayers', 'all five boroughs', 'citywide',
  'everyone deserves', 'we will address', 'moving forward', 'deeply concerned',
  'taking action', 'comprehensive plan', 'whole-of-government',
];

// ── Minimal stemmer ──────────────────────────────────────
function stem(word) {
  if (word.length < 4) return word;
  return word
    .replace(/ies$/, 'y')
    .replace(/ied$/, 'y')
    .replace(/ing$/, '')
    .replace(/tion$/, '')
    .replace(/sion$/, '')
    .replace(/ness$/, '')
    .replace(/ment$/, '')
    .replace(/able$/, '')
    .replace(/ible$/, '')
    .replace(/ful$/, '')
    .replace(/less$/, '')
    .replace(/ous$/, '')
    .replace(/ive$/, '')
    .replace(/ed$/, '')
    .replace(/er$/, '')
    .replace(/ly$/, '')
    .replace(/es$/, '')
    .replace(/s$/, '');
}

// ── Specificity extraction ──────────────────────────────
function extractSpecificities(text) {
  const specs = [];
  // Named people: "Mrs. Gutierrez", "Carlos", "Pastor Williams"
  const names = text.match(/(?:Mrs?\.|Ms\.|Dr\.|Pastor|Captain)\s+[A-Z][a-z]+/g);
  if (names) names.forEach(n => specs.push(n.toLowerCase()));

  // Standalone proper names from insight text (first names of characters)
  const properNames = text.match(/\b[A-Z][a-z]{2,}\b/g);
  if (properNames) {
    // Filter out common words that happen to start sentences
    const commonCaps = new Set(['The', 'When', 'Heat', 'Third', 'Kids', 'Nobody', 'During', 'After', 'Every', 'Three', 'Community', 'Block', 'Your', 'Single']);
    properNames.filter(n => !commonCaps.has(n)).forEach(n => specs.push(n.toLowerCase()));
  }

  // Street/location: "138th", "Jerome Ave", "Roosevelt Ave", "Crown St"
  const locations = text.match(/\b\d+(?:st|nd|rd|th)\b/gi);
  if (locations) locations.forEach(l => specs.push(l.toLowerCase()));
  const streets = text.match(/[A-Z][a-z]+ (?:Ave|St|Street|Road|Blvd|Pkwy|Parkway)/g);
  if (streets) streets.forEach(s => specs.push(s.toLowerCase()));

  // Numbers with context: "200 basement", "14 mobility", "$8,000", "400 prescriptions"
  const nums = text.match(/\$?[\d,]+\s*(?:people|residents|kids|children|units|apartments|prescriptions|members|volunteers|seats|hours|minutes|days|blocks?|workers?)\b/gi);
  if (nums) nums.forEach(n => specs.push(n.toLowerCase().trim()));

  // Specific infrastructure: "Bx12", "PS 31", "Engine 241"
  const infra = text.match(/\b(?:Bx\d+|PS\s*\d+|Engine\s*\d+)\b/gi);
  if (infra) infra.forEach(i => specs.push(i.toLowerCase()));

  return [...new Set(specs)]; // deduplicate
}

// ── Main scoring function ──────────────────────────────
export function scorePost(text, tone, insights, districtMap, conversations, concernScores) {
  const postLower = text.toLowerCase();
  const postStemmed = postLower.split(/\s+/).map(stem);

  // Group fresh insights by district
  const byDistrict = {};
  for (const ins of (insights || [])) {
    if (ins.freshness <= 0) continue;
    if (!byDistrict[ins.districtId]) byDistrict[ins.districtId] = [];
    byDistrict[ins.districtId].push(ins);
  }

  // Count platitudes
  const platitudeCount = PLATITUDES.filter(p => postLower.includes(p)).length;

  const scores = [];

  for (const [districtId, distInsights] of Object.entries(byDistrict)) {
    const d = districtMap[districtId];
    if (!d) continue;
    const convo = conversations[districtId];
    const charName = convo?.character?.name || 'A resident';
    const maxFreshness = Math.max(...distInsights.map(i => i.freshness));

    let bestCategory = 0;
    let bestKeyword = 0;
    let totalSpecificity = 0;
    let hasSpecificity = false;

    for (const ins of distInsights) {
      // A. Category match
      const bank = CATEGORY_BANKS[ins.category];
      if (bank) {
        const hits = bank.filter(term => postLower.includes(term)).length;
        const catScore = (hits / bank.length) * 3;
        bestCategory = Math.max(bestCategory, catScore);
      }

      // B. Keyword overlap
      const insWords = ins.text.toLowerCase().split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w))
        .map(stem);
      const hits = insWords.filter(w => postStemmed.some(pw => pw.includes(w) || w.includes(pw))).length;
      const kwScore = Math.min(3, (hits / Math.max(insWords.length, 1)) * 5);
      bestKeyword = Math.max(bestKeyword, kwScore);

      // C. Specificity
      const specs = extractSpecificities(ins.text);
      const specHits = specs.filter(s => postLower.includes(s)).length;
      totalSpecificity += specHits;
    }

    const specScore = Math.min(3, totalSpecificity * 0.75);
    hasSpecificity = totalSpecificity > 0;

    // Combine
    let raw = (bestCategory + bestKeyword + specScore) * maxFreshness;

    // Tone modifier
    const concerns = concernScores?.[districtId];
    if (concerns) {
      const topVal = Math.max(...Object.values(concerns));
      if (topVal >= 7) {
        if (tone === 'urgent' || tone === 'concerned') raw += 0.5;
        if (tone === 'optimistic') raw -= 0.5;
      }
    }

    // Platitude penalty
    raw -= platitudeCount;

    const districtScore = Math.max(0, Math.min(10, Math.round(raw)));

    if (districtScore > 0) {
      scores.push({
        district: districtId,
        score: districtScore,
        resident: charName,
        hasSpecificity,
        reaction: generateReaction(districtScore, hasSpecificity, charName),
      });
    }
  }

  // Aggregate
  const overall = scores.length > 0
    ? Math.round(scores.reduce((s, e) => s + e.score, 0) / scores.length)
    : 0;

  let summary;
  if (scores.length === 0) {
    summary = 'Post lacks specific community knowledge.';
  } else if (overall >= 7) {
    summary = `Post deeply addresses ${scores.length} community concern(s). Grounded in field data.`;
  } else if (overall >= 4) {
    summary = `Post references ${scores.length} community concern(s). Could be more specific.`;
  } else {
    summary = `Post touches ${scores.length} concern(s) at surface level.`;
  }

  return { scores, overall, summary };
}

// ── Reaction text ──────────────────────────────────────
function generateReaction(score, hasSpec, name) {
  if (score >= 8 && hasSpec) {
    return `${name}: "They named names. They know the streets. Someone was actually listening."`;
  }
  if (score >= 8) {
    return `${name}: "The right concerns. Real detail. This isn't a press release."`;
  }
  if (score >= 5 && hasSpec) {
    return `${name}: "They know something. Let's see if they follow through."`;
  }
  if (score >= 5) {
    return `${name}: "Better than the usual press release. At least someone's paying attention."`;
  }
  if (score >= 3) {
    return `${name}: "Another politician who heard about us from a briefing."`;
  }
  return `${name}: "Who wrote this? They've never been here."`;
}
