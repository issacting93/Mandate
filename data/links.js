// data/links.js — All entry links (typed edges) for the Blizzard level
// Each link: { source, target, type, value?, weight? }
// The graph IS the game — mechanics traverse these at runtime.

export const links = [
  // ─── Hazard ↔ Season ──────────────────────────────────────
  { source: "h_blizzard", target: "s_winter", type: "occurs_in" },

  // ─── Hazard → District (threatens) ────────────────────────
  // Every district is threatened by the blizzard, but weight varies
  // by vulnerability (outer boroughs, transit-dependent, NYCHA)
  { source: "h_blizzard", target: "d_south_bronx",    type: "threatens", weight: 0.9 },
  { source: "h_blizzard", target: "d_riverdale",      type: "threatens", weight: 0.6 },
  { source: "h_blizzard", target: "d_washington_hts",  type: "threatens", weight: 0.8 },
  { source: "h_blizzard", target: "d_harlem",         type: "threatens", weight: 0.7 },
  { source: "h_blizzard", target: "d_upper_west",     type: "threatens", weight: 0.4 },
  { source: "h_blizzard", target: "d_upper_east",     type: "threatens", weight: 0.3 },
  { source: "h_blizzard", target: "d_midtown",        type: "threatens", weight: 0.5 },
  { source: "h_blizzard", target: "d_les",            type: "threatens", weight: 0.6 },
  { source: "h_blizzard", target: "d_fidi",           type: "threatens", weight: 0.4 },
  { source: "h_blizzard", target: "d_astoria",        type: "threatens", weight: 0.7 },
  { source: "h_blizzard", target: "d_jackson_hts",    type: "threatens", weight: 0.8 },
  { source: "h_blizzard", target: "d_flushing",       type: "threatens", weight: 0.7 },
  { source: "h_blizzard", target: "d_jamaica",        type: "threatens", weight: 0.7 },
  { source: "h_blizzard", target: "d_williamsburg",   type: "threatens", weight: 0.5 },
  { source: "h_blizzard", target: "d_bed_stuy",       type: "threatens", weight: 0.7 },
  { source: "h_blizzard", target: "d_park_slope",     type: "threatens", weight: 0.4 },
  { source: "h_blizzard", target: "d_brownsville",    type: "threatens", weight: 0.9 },
  { source: "h_blizzard", target: "d_bay_ridge",      type: "threatens", weight: 0.6 },
  { source: "h_blizzard", target: "d_staten_island",  type: "threatens", weight: 0.9 },

  // ─── Infrastructure → Hazard (mitigates) ──────────────────
  { source: "p_plows",    target: "h_blizzard", type: "mitigates", value: 20 },
  { source: "p_salt",     target: "h_blizzard", type: "mitigates", value: 10 },
  { source: "p_grid",     target: "h_blizzard", type: "mitigates", value: 15 },
  { source: "p_shelter",  target: "h_blizzard", type: "mitigates", value: 10 },
  { source: "p_warning",  target: "h_blizzard", type: "mitigates", value: 8 },
  { source: "p_outreach", target: "h_blizzard", type: "mitigates", value: 7 },

  // ─── Infrastructure → District (protects) ─────────────────
  // Plows protect everyone with roads
  { source: "p_plows", target: "d_south_bronx",   type: "protects" },
  { source: "p_plows", target: "d_washington_hts", type: "protects" },
  { source: "p_plows", target: "d_jackson_hts",   type: "protects" },
  { source: "p_plows", target: "d_flushing",      type: "protects" },
  { source: "p_plows", target: "d_brownsville",   type: "protects" },
  { source: "p_plows", target: "d_bay_ridge",     type: "protects" },
  { source: "p_plows", target: "d_staten_island", type: "protects" },
  // Salt protects icy districts
  { source: "p_salt", target: "d_riverdale",      type: "protects" },
  { source: "p_salt", target: "d_flushing",       type: "protects" },
  { source: "p_salt", target: "d_bay_ridge",      type: "protects" },
  { source: "p_salt", target: "d_staten_island",  type: "protects" },
  { source: "p_salt", target: "d_brownsville",    type: "protects" },
  // Grid protects power-vulnerable districts
  { source: "p_grid", target: "d_harlem",        type: "protects" },
  { source: "p_grid", target: "d_les",           type: "protects" },
  { source: "p_grid", target: "d_south_bronx",   type: "protects" },
  { source: "p_grid", target: "d_jackson_hts",   type: "protects" },
  { source: "p_grid", target: "d_bed_stuy",      type: "protects" },
  { source: "p_grid", target: "d_brownsville",   type: "protects" },
  // Shelters protect the most vulnerable
  { source: "p_shelter", target: "d_south_bronx",  type: "protects" },
  { source: "p_shelter", target: "d_brownsville",  type: "protects" },
  { source: "p_shelter", target: "d_harlem",       type: "protects" },
  { source: "p_shelter", target: "d_bed_stuy",     type: "protects" },
  // Warning system is citywide
  { source: "p_warning", target: "d_south_bronx",    type: "protects" },
  { source: "p_warning", target: "d_washington_hts",  type: "protects" },
  { source: "p_warning", target: "d_jackson_hts",    type: "protects" },
  { source: "p_warning", target: "d_brownsville",    type: "protects" },
  { source: "p_warning", target: "d_staten_island",  type: "protects" },
  // Outreach protects the most vulnerable
  { source: "p_outreach", target: "d_south_bronx",  type: "protects" },
  { source: "p_outreach", target: "d_harlem",       type: "protects" },
  { source: "p_outreach", target: "d_brownsville",  type: "protects" },
  { source: "p_outreach", target: "d_bed_stuy",     type: "protects" },

  // ─── Infrastructure prerequisites ─────────────────────────
  { source: "p_outreach", target: "p_warning", type: "requires" },

  // ─── Infrastructure → Reserve (costs) ─────────────────────
  { source: "p_plows",    target: "r_reserve", type: "costs", value: 0.8 },
  { source: "p_salt",     target: "r_reserve", type: "costs", value: 0.3 },
  { source: "p_grid",     target: "r_reserve", type: "costs", value: 1.2 },
  { source: "p_shelter",  target: "r_reserve", type: "costs", value: 0.5 },
  { source: "p_warning",  target: "r_reserve", type: "costs", value: 0.4 },
  { source: "p_outreach", target: "r_reserve", type: "costs", value: 0.3 },

  // ─── Policy → Infrastructure (builds) ─────────────────────
  { source: "pol_plow_fleet",  target: "p_plows",    type: "builds" },
  { source: "pol_grid_harden", target: "p_grid",     type: "builds" },
  { source: "pol_salt_reserve", target: "p_salt",    type: "builds" },
  { source: "pol_shelters",    target: "p_shelter",  type: "builds" },
  { source: "pol_warning_sys", target: "p_warning",  type: "builds" },
  { source: "pol_outreach",    target: "p_outreach", type: "builds" },

  // ─── Hazard → Outcome (cascades / causes) ─────────────────
  { source: "h_blizzard", target: "o_transit_shutdown", type: "cascades" },
  { source: "h_blizzard", target: "o_blackout",        type: "cascades", condition: "severity_high" },
  { source: "h_blizzard", target: "o_casualties",      type: "causes",   condition: "severity_high" },
  { source: "h_blizzard", target: "o_displacement",    type: "causes",   condition: "severity_medium" },
  { source: "h_blizzard", target: "o_property_damage", type: "causes",   condition: "severity_medium" },

  // ─── Outcome → Resource (affects) ─────────────────────────
  { source: "o_casualties",      target: "r_approval", type: "affects", value: -12 },
  { source: "o_displacement",    target: "r_approval", type: "affects", value: -8 },
  { source: "o_transit_shutdown", target: "r_approval", type: "affects", value: -6 },
  { source: "o_property_damage", target: "r_approval", type: "affects", value: -5 },
  { source: "o_property_damage", target: "r_reserve",  type: "affects", value: -0.8 },
  { source: "o_blackout",        target: "r_approval", type: "affects", value: -9 },
  { source: "o_invisible_success", target: "r_approval", type: "affects", value: -2 },

  // ─── Bloc exposure to hazard ──────────────────────────────
  { source: "b_working",      target: "h_blizzard", type: "exposed_to", weight: 0.9 },
  { source: "b_labor",        target: "h_blizzard", type: "exposed_to", weight: 0.7 },
  { source: "b_progressives", target: "h_blizzard", type: "exposed_to", weight: 0.5 },
  { source: "b_finance",      target: "h_blizzard", type: "exposed_to", weight: 0.3 },
  { source: "b_realestate",   target: "h_blizzard", type: "exposed_to", weight: 0.4 },

  // ─── Framing → Bloc (pleases / angers) ────────────────────
  { source: "f_fiscal",  target: "b_finance",      type: "pleases", value: 4 },
  { source: "f_fiscal",  target: "b_realestate",   type: "pleases", value: 3 },
  { source: "f_fiscal",  target: "b_progressives", type: "angers",  value: 3 },
  { source: "f_fiscal",  target: "b_labor",        type: "angers",  value: 2 },
  { source: "f_justice", target: "b_progressives", type: "pleases", value: 4 },
  { source: "f_justice", target: "b_working",      type: "pleases", value: 3 },
  { source: "f_justice", target: "b_labor",        type: "pleases", value: 2 },
  { source: "f_justice", target: "b_finance",      type: "angers",  value: 3 },
  { source: "f_justice", target: "b_realestate",   type: "angers",  value: 2 },
  { source: "f_safety",  target: "b_working",      type: "pleases", value: 3 },
  { source: "f_safety",  target: "b_labor",        type: "pleases", value: 2 },
  { source: "f_safety",  target: "b_finance",      type: "pleases", value: 1 },
  { source: "f_safety",  target: "b_progressives", type: "pleases", value: 1 },
  { source: "f_unity",   target: "b_working",      type: "pleases", value: 1 },
  { source: "f_unity",   target: "b_finance",      type: "pleases", value: 1 },
  { source: "f_unity",   target: "b_realestate",   type: "pleases", value: 1 },
  { source: "f_unity",   target: "b_progressives", type: "pleases", value: 1 },
  { source: "f_unity",   target: "b_labor",        type: "pleases", value: 1 },
  { source: "f_quiet",   target: "b_working",      type: "angers",  value: 1 },
  { source: "f_quiet",   target: "b_progressives", type: "angers",  value: 1 },
];
