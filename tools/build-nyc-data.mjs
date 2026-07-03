#!/usr/bin/env node
// tools/build-nyc-data.mjs — NYC Open Data → Mandate game content
//
// Fetches real 311 complaint data and HPD housing violations,
// maps them to game districts and departments, and generates:
//   data/nyc-concerns.js  — concern scores (0-9) per district per department
//   data/nyc-rumors.js    — tiered rumor templates per district per department
//
// Usage: node tools/build-nyc-data.mjs [--dry-run]
//
// No API key needed. Uses native fetch (Node 18+).

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DRY_RUN = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════
// District → Community Board mapping
// ═══════════════════════════════════════════════════

const CB_MAP = {
  riverdale:    { cb: '08', boro: 'BRONX' },
  fordham:      { cb: '07', boro: 'BRONX' },
  southbronx:   { cb: '01', boro: 'BRONX' },
  harlem:       { cb: '10', boro: 'MANHATTAN' },
  ues:          { cb: '08', boro: 'MANHATTAN' },
  midtown:      { cb: '05', boro: 'MANHATTAN' },
  lowerman:     { cb: '01', boro: 'MANHATTAN' },
  astoria:      { cb: '01', boro: 'QUEENS' },
  lic:          { cb: '02', boro: 'QUEENS' },
  jackson:      { cb: '03', boro: 'QUEENS' },
  flushing:     { cb: '07', boro: 'QUEENS' },
  jamaica:      { cb: '12', boro: 'QUEENS' },
  williamsburg: { cb: '01', boro: 'BROOKLYN' },
  dtbk:         { cb: '02', boro: 'BROOKLYN' },
  bushwick:     { cb: '04', boro: 'BROOKLYN' },
  crown:        { cb: '08', boro: 'BROOKLYN' },
  bayridge:     { cb: '10', boro: 'BROOKLYN' },
  northshore:   { cb: '01', boro: 'STATEN ISLAND' },
  midisland:    { cb: '02', boro: 'STATEN ISLAND' },
};

// Reverse lookup: "08 BRONX" → "riverdale"
const CB_TO_DISTRICT = {};
for (const [id, { cb, boro }] of Object.entries(CB_MAP)) {
  CB_TO_DISTRICT[`${cb} ${boro}`] = id;
}

// HPD uses boroid (1-5) + communityboard (integer)
const HPD_BORO_MAP = { 1: 'MANHATTAN', 2: 'BRONX', 3: 'BROOKLYN', 4: 'QUEENS', 5: 'STATEN ISLAND' };

// Approximate population per district (from game data, in millions)
const POP = {
  riverdale: 1.4, fordham: 2.1, southbronx: 2.6, harlem: 1.7, ues: 1.5,
  midtown: 2.4, lowerman: 1.6, astoria: 1.5, lic: 1.2, jackson: 2.2,
  flushing: 2.5, jamaica: 1.9, williamsburg: 1.4, dtbk: 1.8, bushwick: 1.6,
  crown: 2.0, bayridge: 1.1, northshore: 0.9, midisland: 0.8,
};

// ═══════════════════════════════════════════════════
// 311 complaint type → game department mapping
// ═══════════════════════════════════════════════════

const DEPT_COMPLAINT_MAP = {
  health: [
    'Rodent', 'Mold', 'Asthma', 'Lead', 'Air Quality', 'Food Poisoning',
    'Pest Control Charges', 'Standing Water', 'Food Establishment',
    'Hazardous Material', 'Indoor Air Quality', 'Smoking',
    'UNSANITARY PIGEON CONDITION',
  ],
  housing: [
    'HEAT/HOT WATER', 'PAINT/PLASTER', 'PLUMBING', 'DOOR/WINDOW',
    'WATER LEAK', 'UNSANITARY CONDITION', 'ELEVATOR', 'ELECTRIC',
    'FLOORING/STAIRS', 'SAFETY', 'GENERAL', 'APPLIANCE',
    'OUTSIDE WINDOW GUARD', 'Maintenance or Facility',
  ],
  infra: [
    'Street Condition', 'Water System', 'Sewer', 'Traffic Signal Condition',
    'Street Light Condition', 'Broken Parking Meter', 'Sidewalk Condition',
    'Highway Condition', 'Bridge Condition', 'Catch Basin',
  ],
  safety: [
    'Noise - Residential', 'Noise - Street/Sidewalk', 'Noise - Commercial',
    'Noise', 'Noise - Vehicle', 'Noise - Helicopter', 'Noise - Park',
    'Illegal Parking', 'Blocked Driveway', 'Abandoned Vehicle',
    'Encampment', 'Graffiti', 'Panhandling',
  ],
  services: [
    'Homeless Person Assistance', 'Senior Center Complaint',
    'School Maintenance', 'Day Care', 'Elder Abuse',
    'Benefit Card Replacement', 'HPD Literature Request',
  ],
  community: [
    'Dirty Condition', 'Missed Collection', 'Illegal Dumping',
    'Derelict Vehicles', 'Derelict Vehicle', 'Litter Basket',
    'Sanitation Condition', 'Overflowing Litter Baskets',
  ],
};

// Build reverse: complaint_type → dept key
const COMPLAINT_TO_DEPT = {};
for (const [dept, types] of Object.entries(DEPT_COMPLAINT_MAP)) {
  for (const t of types) {
    COMPLAINT_TO_DEPT[t.toUpperCase()] = dept;
  }
}

// ═══════════════════════════════════════════════════
// Socrata API helpers
// ═══════════════════════════════════════════════════

const BASE = 'https://data.cityofnewyork.us/resource';

async function socrataQuery(dataset, params) {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/${dataset}.json?${qs}`;
  console.log(`  → ${url.slice(0, 120)}...`);
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ═══════════════════════════════════════════════════
// Phase 1: 311 complaint counts → concern scores
// ═══════════════════════════════════════════════════

async function fetch311Counts() {
  console.log('\n[1/3] Fetching 311 complaint counts by community board...');

  const cbList = Object.values(CB_MAP).map(v => `'${v.cb} ${v.boro}'`).join(',');

  const rows = await socrataQuery('erm2-nwe9', {
    '$select': 'community_board, complaint_type, count(*) as cnt',
    '$where': `created_date > '2025-01-01T00:00:00' AND community_board IN(${cbList})`,
    '$group': 'community_board, complaint_type',
    '$order': 'cnt DESC',
    '$limit': '50000',
  });

  console.log(`  Got ${rows.length} rows`);

  // Aggregate by district × department
  const counts = {}; // { districtId: { health: N, housing: N, ... } }
  for (const id of Object.keys(CB_MAP)) {
    counts[id] = { health: 0, housing: 0, infra: 0, safety: 0, services: 0, community: 0 };
  }

  let mapped = 0, unmapped = 0;
  for (const row of rows) {
    const districtId = CB_TO_DISTRICT[row.community_board];
    if (!districtId) continue;

    const dept = COMPLAINT_TO_DEPT[(row.complaint_type || '').toUpperCase()];
    if (dept) {
      counts[districtId][dept] += parseInt(row.cnt, 10);
      mapped += parseInt(row.cnt, 10);
    } else {
      unmapped += parseInt(row.cnt, 10);
    }
  }

  console.log(`  Mapped: ${mapped.toLocaleString()} complaints, unmapped: ${unmapped.toLocaleString()}`);
  return counts;
}

function normalizeScores(counts) {
  const depts = ['health', 'housing', 'infra', 'safety', 'services', 'community'];
  const ids = Object.keys(counts);

  // Citywide totals per department
  const citywide = {};
  for (const dept of depts) {
    citywide[dept] = ids.reduce((s, id) => s + counts[id][dept], 0);
  }

  // Percentile-based scoring: rank districts by complaint volume per department
  // Map rank position to 0-9 scale. Highest complaint count = 9.
  const scores = {};
  for (const id of ids) scores[id] = {};

  for (const dept of depts) {
    // Get raw counts and sort descending
    const ranked = ids
      .map(id => ({ id, count: counts[id][dept] }))
      .sort((a, b) => b.count - a.count);

    const max = ranked[0]?.count || 1;
    const min = ranked[ranked.length - 1]?.count || 0;
    const range = max - min || 1;

    for (const { id, count } of ranked) {
      // Linear map: highest count → 9, lowest → 0
      const raw = Math.round(((count - min) / range) * 9);
      scores[id][dept] = Math.max(0, Math.min(9, raw));
    }
  }

  return { scores, citywide };
}

// ═══════════════════════════════════════════════════
// Phase 2: 311 descriptors + HPD violations → rumors
// ═══════════════════════════════════════════════════

async function fetch311Descriptors() {
  console.log('\n[2/3] Fetching 311 top descriptors per community board...');

  const cbList = Object.values(CB_MAP).map(v => `'${v.cb} ${v.boro}'`).join(',');

  const rows = await socrataQuery('erm2-nwe9', {
    '$select': 'community_board, complaint_type, descriptor, count(*) as cnt',
    '$where': `created_date > '2025-01-01T00:00:00' AND community_board IN(${cbList}) AND descriptor IS NOT NULL`,
    '$group': 'community_board, complaint_type, descriptor',
    '$order': 'cnt DESC',
    '$limit': '50000',
  });

  console.log(`  Got ${rows.length} descriptor rows`);

  // Group by district → dept → top descriptors
  const byDistrict = {};
  for (const row of rows) {
    const districtId = CB_TO_DISTRICT[row.community_board];
    if (!districtId) continue;
    const dept = COMPLAINT_TO_DEPT[(row.complaint_type || '').toUpperCase()];
    if (!dept) continue;

    const desc = (row.descriptor || '').trim();
    if (desc.length < 5 || /^[0-9]+$/.test(desc) || ['N/A', 'OTHER', 'UNKNOWN'].includes(desc.toUpperCase())) continue;

    if (!byDistrict[districtId]) byDistrict[districtId] = {};
    if (!byDistrict[districtId][dept]) byDistrict[districtId][dept] = [];
    byDistrict[districtId][dept].push({ desc, cnt: parseInt(row.cnt, 10), type: row.complaint_type });
  }

  return byDistrict;
}

async function fetchHPDViolations() {
  console.log('\n[3/3] Fetching HPD housing violations...');

  const rows = await socrataQuery('wvxf-dwi5', {
    '$select': 'boroid, communityboard, class, novdescription',
    '$where': `inspectiondate > '2025-01-01T00:00:00' AND class IN('B','C') AND novdescription IS NOT NULL`,
    '$order': 'inspectiondate DESC',
    '$limit': '5000',
  });

  console.log(`  Got ${rows.length} HPD violations`);

  // Group by district
  const byDistrict = {};
  for (const row of rows) {
    const boroName = HPD_BORO_MAP[parseInt(row.boroid, 10)];
    if (!boroName) continue;
    const cbNum = String(parseInt(row.communityboard, 10)).padStart(2, '0');
    const key = `${cbNum} ${boroName}`;
    const districtId = CB_TO_DISTRICT[key];
    if (!districtId) continue;

    let text = (row.novdescription || '').trim();
    // Clean: strip apartment/unit numbers, truncate
    text = text.replace(/\bAPT\s+\S+/gi, '').replace(/\bUNIT\s+\S+/gi, '').replace(/#\d+/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length < 20) continue;
    if (text.length > 120) text = text.slice(0, 117) + '...';

    if (!byDistrict[districtId]) byDistrict[districtId] = [];
    byDistrict[districtId].push({ text, severity: row.class });
  }

  return byDistrict;
}

// ═══════════════════════════════════════════════════
// Rumor generation from real data
// ═══════════════════════════════════════════════════

const DISTRICT_NAMES = {
  riverdale: 'Riverdale', fordham: 'Fordham', southbronx: 'South Bronx',
  harlem: 'Harlem', ues: 'Upper East Side', midtown: 'Midtown',
  lowerman: 'Lower Manhattan', astoria: 'Astoria', lic: 'Long Island City',
  jackson: 'Jackson Heights', flushing: 'Flushing', jamaica: 'Jamaica',
  williamsburg: 'Williamsburg', dtbk: 'Downtown Brooklyn', bushwick: 'Bushwick',
  crown: 'Crown Heights', bayridge: 'Bay Ridge', northshore: 'North Shore',
  midisland: 'Mid-Island',
};

const DEPT_LABELS = {
  health: 'health', housing: 'housing', infra: 'infrastructure',
  safety: 'safety', services: 'services', community: 'sanitation',
};

function buildRumors(descriptors311, hpdViolations, counts) {
  const rumors = {};

  for (const id of Object.keys(CB_MAP)) {
    const name = DISTRICT_NAMES[id];
    const cb = CB_MAP[id];
    rumors[id] = {};

    for (const dept of ['health', 'housing', 'infra', 'safety', 'services', 'community']) {
      const topDescs = (descriptors311[id]?.[dept] || []).slice(0, 10);
      const count = counts[id]?.[dept] || 0;
      const label = DEPT_LABELS[dept];

      // Tier 1: vague
      const tier1 = [];
      if (topDescs.length > 0) {
        const top = topDescs[0];
        tier1.push(`Something about ${top.desc.toLowerCase().slice(0, 40)} in ${name}.`);
        tier1.push(`Chatter in the feed about ${label}.`);
      } else {
        tier1.push(`Quiet on ${label} in ${name}. Maybe too quiet.`);
        tier1.push(`The feed is vague about ${name}.`);
      }

      // Tier 2: statistical
      const tier2 = [];
      if (count > 0) {
        tier2.push(`${count.toLocaleString()} ${label} complaints this year in CB${cb.cb}.`);
      }
      for (const d of topDescs.slice(0, 3)) {
        tier2.push(`${d.type}: ${d.desc} — ${d.cnt} reports in CB${cb.cb}.`);
      }
      if (tier2.length === 0) {
        tier2.push(`No significant ${label} data for ${name}.`);
      }

      // Tier 3: real violation/complaint text
      const tier3 = [];
      if (dept === 'housing' && hpdViolations[id]) {
        for (const v of hpdViolations[id].slice(0, 5)) {
          tier3.push(`HPD Class ${v.severity}: ${v.text}`);
        }
      }
      // Add the most specific 311 descriptors
      for (const d of topDescs.slice(0, 3)) {
        if (d.desc.length > 15) {
          tier3.push(`311: ${d.type} — ${d.desc}. ${d.cnt} cases this period.`);
        }
      }
      if (tier3.length === 0) {
        tier3.push(...tier2.slice(0, 1)); // fallback to tier 2
      }

      rumors[id][dept] = { tier1, tier2, tier3 };
    }
  }

  return rumors;
}

// ═══════════════════════════════════════════════════
// File writers
// ═══════════════════════════════════════════════════

function writeConcerns(scores) {
  const now = new Date().toISOString();
  let out = `// Generated by tools/build-nyc-data.mjs on ${now}\n`;
  out += `// Source: NYC Open Data 311 Service Requests (erm2-nwe9)\n`;
  out += `// Do not edit manually — re-run the build script to update.\n\n`;
  out += `export const NYC_CONCERN_SCORES = {\n`;

  for (const [id, s] of Object.entries(scores)) {
    const vals = Object.entries(s).map(([k, v]) => `${k}: ${v}`).join(', ');
    out += `  ${id}: { ${vals} },\n`;
  }

  out += `};\n\n`;
  out += `export const GENERATED_AT = '${now}';\n`;
  out += `export const DATA_PERIOD = { start: '2025-01-01', end: '${new Date().toISOString().slice(0, 10)}' };\n`;

  const path = join(DATA_DIR, 'nyc-concerns.js');
  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would write ${path}`);
    console.log(out.slice(0, 500) + '...');
  } else {
    writeFileSync(path, out);
    console.log(`\n✓ Wrote ${path}`);
  }
}

function writeRumors(rumors) {
  const now = new Date().toISOString();
  let out = `// Generated by tools/build-nyc-data.mjs on ${now}\n`;
  out += `// Sources: NYC 311 (erm2-nwe9) + HPD Violations (wvxf-dwi5)\n`;
  out += `// Do not edit manually — re-run the build script to update.\n\n`;
  out += `export const NYC_RUMORS = ${JSON.stringify(rumors, null, 2)};\n`;

  const path = join(DATA_DIR, 'nyc-rumors.js');
  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would write ${path}`);
    console.log(out.slice(0, 500) + '...');
  } else {
    writeFileSync(path, out);
    console.log(`✓ Wrote ${path}`);
  }
}

// ═══════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════

async function main() {
  console.log('MANDATE — NYC Open Data Pipeline');
  console.log('================================');
  if (DRY_RUN) console.log('(DRY RUN — no files will be written)\n');

  try {
    // Phase 1: Concern scores from 311 counts
    const counts = await fetch311Counts();
    const { scores, citywide } = normalizeScores(counts);

    console.log('\nCitywide totals:');
    for (const [dept, total] of Object.entries(citywide)) {
      console.log(`  ${dept}: ${total.toLocaleString()}`);
    }

    console.log('\nGenerated concern scores (sample):');
    for (const id of ['southbronx', 'ues', 'crown', 'midtown']) {
      console.log(`  ${id}: ${JSON.stringify(scores[id])}`);
    }

    writeConcerns(scores);

    // Phase 2: Tiered rumors from descriptors + HPD
    const descriptors = await fetch311Descriptors();
    const hpdViolations = await fetchHPDViolations();
    const rumors = buildRumors(descriptors, hpdViolations, counts);

    console.log('\nRumor samples (South Bronx, housing):');
    const sample = rumors.southbronx?.housing;
    if (sample) {
      console.log('  Tier 1:', sample.tier1[0]);
      console.log('  Tier 2:', sample.tier2[0]);
      console.log('  Tier 3:', sample.tier3[0]);
    }

    writeRumors(rumors);

    console.log('\n✓ Pipeline complete.');
  } catch (err) {
    console.error('\n✗ Pipeline failed:', err.message);
    process.exit(1);
  }
}

main();
