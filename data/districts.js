export const BLOC_COLORS = {
  working:     '#1a1a1a',
  business:    '#3d3d3d',
  realestate:  '#595959',
  progressive: '#777777',
  labor:       '#2b2b2b',
};

export const BLOC_NAMES = {
  working:     'Working Families',
  business:    'Business Coalition',
  realestate:  'Real Estate',
  progressive: 'Progressives',
  labor:       'Labor',
};

export const ACTION_COLORS = {
  visit: '#34d399',
  listen: '#2fc3e8',
};

export const DISTRICTS = [
  { id: 'riverdale',   name: 'Riverdale',        boro: 'The Bronx',     bloc: 'realestate',  x: 170, y: 110, r: 14, trust: 58, know: 30, pop: '1.4M', concern: 'Flooding near the Harlem River', cat: 'Housing', cb: '08 BRONX' },
  { id: 'fordham',     name: 'Fordham',           boro: 'The Bronx',     bloc: 'labor',       x: 275, y: 135, r: 18, trust: 44, know: 72, pop: '2.1M', concern: 'Bus routes cut, commutes doubled', cat: 'Jobs', cb: '07 BRONX' },
  { id: 'southbronx',  name: 'South Bronx',       boro: 'The Bronx',     bloc: 'working',     x: 360, y: 210, r: 20, trust: 36, know: 80, pop: '2.6M', concern: 'Asthma rates and air quality near the expressway', cat: 'Services', cb: '01 BRONX' },
  { id: 'harlem',      name: 'Harlem Heights',    boro: 'Manhattan',     bloc: 'progressive', x: 340, y: 285, r: 17, trust: 62, know: 55, pop: '1.7M', concern: 'Displacement from rezoning', cat: 'Housing', cb: '10 MANHATTAN' },
  { id: 'ues',         name: 'Upper East Side',   boro: 'Manhattan',     bloc: 'realestate',  x: 410, y: 345, r: 16, trust: 71, know: 40, pop: '1.5M', concern: 'Construction noise and scaffolding everywhere', cat: 'Safety', cb: '08 MANHATTAN' },
  { id: 'midtown',     name: 'Midtown',           boro: 'Manhattan',     bloc: 'business',    x: 370, y: 420, r: 21, trust: 54, know: 88, pop: '2.4M', concern: 'Office vacancies hollowing out the tax base', cat: 'Transit', cb: '05 MANHATTAN' },
  { id: 'lowerman',    name: 'Lower Manhattan',   boro: 'Manhattan',     bloc: 'business',    x: 345, y: 505, r: 17, trust: 60, know: 48, pop: '1.6M', concern: 'Flood prep stalled since Sandy', cat: 'Transit', cb: '01 MANHATTAN' },
  { id: 'astoria',     name: 'Astoria',           boro: 'Queens',        bloc: 'progressive', x: 480, y: 335, r: 16, trust: 66, know: 42, pop: '1.5M', concern: 'Rent hikes pushing out longtime tenants', cat: 'Housing', cb: '01 QUEENS' },
  { id: 'lic',         name: 'Long Island City',  boro: 'Queens',        bloc: 'realestate',  x: 460, y: 415, r: 15, trust: 69, know: 25, pop: '1.2M', concern: null, cat: 'Housing', cb: '02 QUEENS' },
  { id: 'jackson',     name: 'Jackson Heights',   boro: 'Queens',        bloc: 'working',     x: 580, y: 360, r: 18, trust: 41, know: 18, pop: '2.2M', concern: null, cat: 'Services', cb: '03 QUEENS' },
  { id: 'flushing',    name: 'Flushing',          boro: 'Queens',        bloc: 'working',     x: 695, y: 300, r: 19, trust: 38, know: 12, pop: '2.5M', concern: null, cat: 'Jobs', cb: '07 QUEENS' },
  { id: 'jamaica',     name: 'Jamaica',           boro: 'Queens',        bloc: 'labor',       x: 670, y: 450, r: 17, trust: 47, know: 33, pop: '1.9M', concern: 'Archer Ave floods every hard rain', cat: 'Transit', cb: '12 QUEENS' },
  { id: 'williamsburg',name: 'Williamsburg',      boro: 'Brooklyn',      bloc: 'progressive', x: 455, y: 500, r: 16, trust: 64, know: 60, pop: '1.4M', concern: 'Waterfront development blocking park access', cat: 'Housing', cb: '01 BROOKLYN' },
  { id: 'dtbk',        name: 'Downtown Brooklyn', boro: 'Brooklyn',      bloc: 'business',    x: 405, y: 570, r: 17, trust: 57, know: 50, pop: '1.8M', concern: 'Atlantic Ave congestion from arena traffic', cat: 'Transit', cb: '02 BROOKLYN' },
  { id: 'bushwick',    name: 'Bushwick',          boro: 'Brooklyn',      bloc: 'working',     x: 535, y: 535, r: 17, trust: 43, know: 22, pop: '1.6M', concern: null, cat: 'Services', cb: '04 BROOKLYN' },
  { id: 'crown',       name: 'Crown Heights',     boro: 'Brooklyn',      bloc: 'working',     x: 500, y: 615, r: 18, trust: 39, know: 35, pop: '2.0M', concern: 'Crown St shootings up 40% this year', cat: 'Safety', cb: '08 BROOKLYN' },
  { id: 'bayridge',    name: 'Bay Ridge',         boro: 'Brooklyn',      bloc: 'realestate',  x: 360, y: 655, r: 15, trust: 67, know: 28, pop: '1.1M', concern: null, cat: 'Housing', cb: '10 BROOKLYN' },
  { id: 'northshore',  name: 'North Shore',       boro: 'Staten Island', bloc: 'labor',       x: 195, y: 615, r: 15, trust: 49, know: 20, pop: '0.9M', concern: null, cat: 'Jobs', cb: '01 STATEN ISLAND' },
  { id: 'midisland',   name: 'Mid-Island',        boro: 'Staten Island', bloc: 'realestate',  x: 140, y: 690, r: 14, trust: 72, know: 15, pop: '0.8M', concern: null, cat: 'Transit', cb: '02 STATEN ISLAND' },
];

// Initialize mutable runtime state
DISTRICTS.forEach(d => { d.lastVisited = null; });

export const EDGES = [
  ['riverdale','fordham'],['fordham','southbronx'],['southbronx','harlem'],
  ['harlem','ues'],['ues','midtown'],['midtown','lowerman'],['harlem','midtown'],
  ['ues','astoria'],['midtown','lic'],
  ['astoria','lic'],['lic','jackson'],['jackson','flushing'],['jackson','jamaica'],['flushing','jamaica'],
  ['lowerman','dtbk'],['lowerman','williamsburg'],
  ['lic','williamsburg'],['jamaica','crown'],
  ['williamsburg','bushwick'],['williamsburg','dtbk'],['dtbk','crown'],['bushwick','crown'],['dtbk','bayridge'],['crown','bayridge'],
  ['northshore','midisland'],['northshore','bayridge'],
];

export const BORO_POS = {
  'The Bronx':     { x: 275, y: 175 },
  'Manhattan':     { x: 370, y: 400 },
  'Queens':        { x: 590, y: 390 },
  'Brooklyn':      { x: 460, y: 580 },
  'Staten Island': { x: 170, y: 660 },
};

// Hardcoded fallback (transit scores stay — 311 doesn't capture transit/MTA data)
const HARDCODED_CONCERNS = {
  southbronx:   { health: 9, housing: 6, transit: 4, safety: 3, infra: 7, services: 5 },
  riverdale:    { health: 6, housing: 3, transit: 2, safety: 7, infra: 4, services: 5 },
  fordham:      { health: 4, housing: 5, transit: 7, safety: 4, infra: 5, services: 6 },
  harlem:       { health: 6, housing: 8, transit: 3, safety: 4, infra: 7, services: 8 },
  ues:          { health: 4, housing: 2, transit: 2, safety: 6, infra: 3, services: 3 },
  midtown:      { health: 2, housing: 2, transit: 9, safety: 4, infra: 8, services: 3 },
  lowerman:     { health: 3, housing: 2, transit: 7, safety: 5, infra: 8, services: 2 },
  astoria:      { health: 4, housing: 6, transit: 5, safety: 3, infra: 8, services: 4 },
  lic:          { health: 2, housing: 5, transit: 4, safety: 3, infra: 4, services: 3 },
  jackson:      { health: 5, housing: 7, transit: 4, safety: 3, infra: 5, services: 8 },
  flushing:     { health: 5, housing: 4, transit: 3, safety: 6, infra: 4, services: 7 },
  jamaica:      { health: 6, housing: 3, transit: 9, safety: 4, infra: 6, services: 5 },
  williamsburg: { health: 3, housing: 6, transit: 3, safety: 7, infra: 4, services: 4 },
  dtbk:         { health: 3, housing: 4, transit: 7, safety: 4, infra: 5, services: 4 },
  bushwick:     { health: 4, housing: 6, transit: 3, safety: 4, infra: 5, services: 7 },
  crown:        { health: 4, housing: 5, transit: 3, safety: 8, infra: 5, services: 5 },
  bayridge:     { health: 5, housing: 3, transit: 4, safety: 6, infra: 5, services: 6 },
  northshore:   { health: 4, housing: 3, transit: 8, safety: 5, infra: 6, services: 5 },
  midisland:    { health: 3, housing: 3, transit: 6, safety: 4, infra: 5, services: 4 },
};

// Merge: real 311 data overrides hardcoded, but transit (not in 311) stays from hardcoded
import { NYC_CONCERN_SCORES } from './nyc-concerns.js';

export const CONCERN_SCORES = Object.fromEntries(
  DISTRICTS.map(d => [
    d.id,
    { ...HARDCODED_CONCERNS[d.id], ...(NYC_CONCERN_SCORES[d.id] || {}) },
  ])
);

export const DISTRICT_LATLNG = {
  riverdale:    [-73.905, 40.895],
  fordham:      [-73.890, 40.862],
  southbronx:   [-73.875, 40.820],
  harlem:       [-73.945, 40.812],
  ues:          [-73.956, 40.774],
  midtown:      [-73.975, 40.755],
  lowerman:     [-74.007, 40.710],
  astoria:      [-73.923, 40.772],
  lic:          [-73.958, 40.744],
  jackson:      [-73.883, 40.755],
  flushing:     [-73.830, 40.763],
  jamaica:      [-73.793, 40.703],
  williamsburg: [-73.953, 40.714],
  dtbk:         [-73.985, 40.692],
  bushwick:     [-73.921, 40.694],
  crown:        [-73.948, 40.669],
  bayridge:     [-74.023, 40.635],
  northshore:   [-74.077, 40.643],
  midisland:    [-74.105, 40.583],
};

// Convenience lookups
export const districtMap = Object.fromEntries(DISTRICTS.map(d => [d.id, d]));
