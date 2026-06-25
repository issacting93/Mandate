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
  { source: "o_casualties",      target: "r_resilience", type: "affects", value: -12 },
  { source: "o_displacement",    target: "r_resilience", type: "affects", value: -8 },
  { source: "o_transit_shutdown", target: "r_resilience", type: "affects", value: -6 },
  { source: "o_property_damage", target: "r_resilience", type: "affects", value: -5 },
  { source: "o_property_damage", target: "r_reserve",  type: "affects", value: -0.8 },
  { source: "o_blackout",        target: "r_resilience", type: "affects", value: -9 },
  { source: "o_invisible_success", target: "r_resilience", type: "affects", value: -2 },

  // ─── Bloc exposure to hazard ──────────────────────────────
  { source: "b_working",      target: "h_blizzard", type: "exposed_to", weight: 0.9 },
  { source: "b_labor",        target: "h_blizzard", type: "exposed_to", weight: 0.7 },
  { source: "b_progressives", target: "h_blizzard", type: "exposed_to", weight: 0.5 },
  { source: "b_finance",      target: "h_blizzard", type: "exposed_to", weight: 0.3 },
  { source: "b_realestate",   target: "h_blizzard", type: "exposed_to", weight: 0.4 },

  // ─── District → Concern (cares_about) ─────────────────────
  // Weight = concern score (0-10). These are the edges the LLM evaluates against.
  // The graph visualizes these as sized edges from district nodes to concern nodes.
  // Generated from district.concerns in entries.js.
  ...(function() {
    // Import not available here, so we inline the generation.
    // Each district's concerns object becomes weighted edges.
    const dConcerns = {
      d_south_bronx:   { health: 9, housing: 6, transit: 4, safety: 3, infra: 7, services: 5 },
      d_riverdale:     { health: 6, housing: 3, transit: 2, safety: 7, infra: 4, services: 5 },
      d_washington_hts:{ health: 5, housing: 7, transit: 8, safety: 3, infra: 4, services: 6 },
      d_harlem:        { health: 6, housing: 8, transit: 3, safety: 4, infra: 7, services: 8 },
      d_upper_west:    { health: 5, housing: 3, transit: 2, safety: 4, infra: 6, services: 3 },
      d_upper_east:    { health: 4, housing: 2, transit: 2, safety: 6, infra: 3, services: 3 },
      d_midtown:       { health: 2, housing: 2, transit: 9, safety: 4, infra: 8, services: 3 },
      d_les:           { health: 6, housing: 7, transit: 3, safety: 5, infra: 8, services: 5 },
      d_fidi:          { health: 2, housing: 1, transit: 7, safety: 5, infra: 8, services: 2 },
      d_astoria:       { health: 4, housing: 6, transit: 5, safety: 3, infra: 8, services: 4 },
      d_jackson_hts:   { health: 5, housing: 7, transit: 4, safety: 3, infra: 5, services: 8 },
      d_flushing:      { health: 5, housing: 4, transit: 3, safety: 6, infra: 4, services: 7 },
      d_jamaica:       { health: 6, housing: 3, transit: 9, safety: 4, infra: 6, services: 5 },
      d_williamsburg:  { health: 3, housing: 6, transit: 3, safety: 7, infra: 4, services: 4 },
      d_bed_stuy:      { health: 4, housing: 5, transit: 3, safety: 5, infra: 8, services: 5 },
      d_park_slope:    { health: 3, housing: 3, transit: 2, safety: 6, infra: 5, services: 6 },
      d_brownsville:   { health: 9, housing: 6, transit: 5, safety: 5, infra: 7, services: 9 },
      d_bay_ridge:     { health: 5, housing: 3, transit: 4, safety: 6, infra: 5, services: 6 },
      d_staten_island: { health: 4, housing: 3, transit: 8, safety: 5, infra: 6, services: 5 },
    };
    const edges = [];
    for (const [distId, concerns] of Object.entries(dConcerns)) {
      for (const [cat, weight] of Object.entries(concerns)) {
        if (weight >= 4) { // only show significant concerns as edges
          edges.push({ source: distId, target: `c_${cat}`, type: "cares_about", weight });
        }
      }
    }
    return edges;
  })(),
];
