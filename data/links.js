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

  // ─── Character → District (lives_in) ──────────────────────
  { source: "ch_delgado",    target: "d_south_bronx",   type: "lives_in" },
  { source: "ch_washington",  target: "d_harlem",        type: "lives_in" },
  { source: "ch_kowalski",   target: "d_midtown",       type: "lives_in" },
  { source: "ch_vega",       target: "d_astoria",       type: "lives_in" },
  { source: "ch_tanaka",     target: "d_jamaica",       type: "lives_in" },
  { source: "ch_alrashid",   target: "d_jackson_hts",   type: "lives_in" },
  { source: "ch_okonkwo",    target: "d_williamsburg",  type: "lives_in" },
  { source: "ch_williams",   target: "d_bed_stuy",      type: "lives_in" },
  { source: "ch_chen",       target: "d_flushing",      type: "lives_in" },
  { source: "ch_ferraro",    target: "d_staten_island", type: "lives_in" },
  { source: "ch_rizzo",      target: "d_park_slope",    type: "lives_in" },

  // ─── Insight Template links ───────────────────────────────
  // 3 link types per insight: knows_about, discovered_in, categorized_as
  // Category mapping: HEALTH→c_health, HOUSING→c_housing, INFRA→c_infra,
  //   SERVICES→c_services, SAFETY→c_safety, ASSET→c_safety (closest match)

  // Maria Delgado — South Bronx
  { source: "ch_delgado",    target: "it_delgado_1",    type: "knows_about" },
  { source: "it_delgado_1",  target: "d_south_bronx",   type: "discovered_in" },
  { source: "it_delgado_1",  target: "c_health",        type: "categorized_as" },

  { source: "ch_delgado",    target: "it_delgado_2",    type: "knows_about" },
  { source: "it_delgado_2",  target: "d_south_bronx",   type: "discovered_in" },
  { source: "it_delgado_2",  target: "c_housing",       type: "categorized_as" },

  { source: "ch_delgado",    target: "it_delgado_3",    type: "knows_about" },
  { source: "it_delgado_3",  target: "d_south_bronx",   type: "discovered_in" },
  { source: "it_delgado_3",  target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  // James Washington — Harlem
  { source: "ch_washington",  target: "it_washington_1", type: "knows_about" },
  { source: "it_washington_1", target: "d_harlem",       type: "discovered_in" },
  { source: "it_washington_1", target: "c_infra",        type: "categorized_as" },

  { source: "ch_washington",  target: "it_washington_2", type: "knows_about" },
  { source: "it_washington_2", target: "d_harlem",       type: "discovered_in" },
  { source: "it_washington_2", target: "c_safety",       type: "categorized_as" },  // ASSET → c_safety

  // Diane Kowalski — Midtown
  { source: "ch_kowalski",   target: "it_kowalski_1",   type: "knows_about" },
  { source: "it_kowalski_1", target: "d_midtown",       type: "discovered_in" },
  { source: "it_kowalski_1", target: "c_services",      type: "categorized_as" },

  // Ramon Vega — Astoria
  { source: "ch_vega",       target: "it_vega_1",       type: "knows_about" },
  { source: "it_vega_1",     target: "d_astoria",       type: "discovered_in" },
  { source: "it_vega_1",     target: "c_infra",         type: "categorized_as" },

  { source: "ch_vega",       target: "it_vega_2",       type: "knows_about" },
  { source: "it_vega_2",     target: "d_astoria",       type: "discovered_in" },
  { source: "it_vega_2",     target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  { source: "ch_vega",       target: "it_vega_3",       type: "knows_about" },
  { source: "it_vega_3",     target: "d_astoria",       type: "discovered_in" },
  { source: "it_vega_3",     target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  // Yuki Tanaka — Jamaica
  { source: "ch_tanaka",     target: "it_tanaka_1",     type: "knows_about" },
  { source: "it_tanaka_1",   target: "d_jamaica",       type: "discovered_in" },
  { source: "it_tanaka_1",   target: "c_health",        type: "categorized_as" },

  { source: "ch_tanaka",     target: "it_tanaka_2",     type: "knows_about" },
  { source: "it_tanaka_2",   target: "d_jamaica",       type: "discovered_in" },
  { source: "it_tanaka_2",   target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  // Fatima Al-Rashid — Jackson Heights
  { source: "ch_alrashid",   target: "it_alrashid_1",   type: "knows_about" },
  { source: "it_alrashid_1", target: "d_jackson_hts",   type: "discovered_in" },
  { source: "it_alrashid_1", target: "c_services",      type: "categorized_as" },

  { source: "ch_alrashid",   target: "it_alrashid_2",   type: "knows_about" },
  { source: "it_alrashid_2", target: "d_jackson_hts",   type: "discovered_in" },
  { source: "it_alrashid_2", target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  { source: "ch_alrashid",   target: "it_alrashid_3",   type: "knows_about" },
  { source: "it_alrashid_3", target: "d_jackson_hts",   type: "discovered_in" },
  { source: "it_alrashid_3", target: "c_housing",       type: "categorized_as" },

  // Sasha Okonkwo — Williamsburg
  { source: "ch_okonkwo",    target: "it_okonkwo_1",    type: "knows_about" },
  { source: "it_okonkwo_1",  target: "d_williamsburg",  type: "discovered_in" },
  { source: "it_okonkwo_1",  target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  { source: "ch_okonkwo",    target: "it_okonkwo_2",    type: "knows_about" },
  { source: "it_okonkwo_2",  target: "d_williamsburg",  type: "discovered_in" },
  { source: "it_okonkwo_2",  target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  { source: "ch_okonkwo",    target: "it_okonkwo_3",    type: "knows_about" },
  { source: "it_okonkwo_3",  target: "d_williamsburg",  type: "discovered_in" },
  { source: "it_okonkwo_3",  target: "c_infra",         type: "categorized_as" },

  // Pastor David Williams — Bed-Stuy
  { source: "ch_williams",   target: "it_williams_1",   type: "knows_about" },
  { source: "it_williams_1", target: "d_bed_stuy",      type: "discovered_in" },
  { source: "it_williams_1", target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  { source: "ch_williams",   target: "it_williams_2",   type: "knows_about" },
  { source: "it_williams_2", target: "d_bed_stuy",      type: "discovered_in" },
  { source: "it_williams_2", target: "c_health",        type: "categorized_as" },

  { source: "ch_williams",   target: "it_williams_3",   type: "knows_about" },
  { source: "it_williams_3", target: "d_bed_stuy",      type: "discovered_in" },
  { source: "it_williams_3", target: "c_safety",        type: "categorized_as" },

  // Wei Chen — Flushing
  { source: "ch_chen",       target: "it_chen_1",       type: "knows_about" },
  { source: "it_chen_1",     target: "d_flushing",      type: "discovered_in" },
  { source: "it_chen_1",     target: "c_health",        type: "categorized_as" },

  { source: "ch_chen",       target: "it_chen_2",       type: "knows_about" },
  { source: "it_chen_2",     target: "d_flushing",      type: "discovered_in" },
  { source: "it_chen_2",     target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  // Tommy Ferraro — Staten Island
  { source: "ch_ferraro",    target: "it_ferraro_1",    type: "knows_about" },
  { source: "it_ferraro_1",  target: "d_staten_island", type: "discovered_in" },
  { source: "it_ferraro_1",  target: "c_infra",         type: "categorized_as" },

  { source: "ch_ferraro",    target: "it_ferraro_2",    type: "knows_about" },
  { source: "it_ferraro_2",  target: "d_staten_island", type: "discovered_in" },
  { source: "it_ferraro_2",  target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  // Angela Rizzo — Park Slope
  { source: "ch_rizzo",      target: "it_rizzo_1",      type: "knows_about" },
  { source: "it_rizzo_1",    target: "d_park_slope",    type: "discovered_in" },
  { source: "it_rizzo_1",    target: "c_safety",        type: "categorized_as" },

  { source: "ch_rizzo",      target: "it_rizzo_2",      type: "knows_about" },
  { source: "it_rizzo_2",    target: "d_park_slope",    type: "discovered_in" },
  { source: "it_rizzo_2",    target: "c_safety",        type: "categorized_as" },  // ASSET → c_safety

  { source: "ch_rizzo",      target: "it_rizzo_3",      type: "knows_about" },
  { source: "it_rizzo_3",    target: "d_park_slope",    type: "discovered_in" },
  { source: "it_rizzo_3",    target: "c_infra",         type: "categorized_as" },

  // ── Phase 3: Tile → Infrastructure (implements) ─────────────
  { source: "tl_plow_fleet",        target: "p_plows",    type: "implements" },
  { source: "tl_targeted_plows",    target: "p_plows",    type: "implements" },
  { source: "tl_road_salt",         target: "p_salt",     type: "implements" },
  { source: "tl_generator_bank",    target: "p_grid",     type: "implements" },
  { source: "tl_med_power_cache",   target: "p_grid",     type: "implements" },
  { source: "tl_emergency_shelter", target: "p_shelter",  type: "implements" },
  { source: "tl_community_shelter", target: "p_shelter",  type: "implements" },
  { source: "tl_medical_cache",     target: "p_shelter",  type: "implements" },
  { source: "tl_warning_system",    target: "p_warning",  type: "implements" },
  { source: "tl_multilingual",      target: "p_warning",  type: "implements" },

  // ── Phase 3: Infrastructure → Outcome (prevents) ────────────
  { source: "p_plows",    target: "o_transit_shutdown", type: "prevents" },
  { source: "p_salt",     target: "o_transit_shutdown", type: "prevents" },
  { source: "p_grid",     target: "o_blackout",         type: "prevents" },
  { source: "p_shelter",  target: "o_casualties",       type: "prevents" },
  { source: "p_warning",  target: "o_casualties",       type: "prevents" },
  { source: "p_outreach", target: "o_casualties",       type: "prevents" },

  // ── Phase 4: District adjacency (for trust diffusion) ───────
  { source: "d_riverdale",      target: "d_washington_hts", type: "adjacent_to" },
  { source: "d_washington_hts", target: "d_riverdale",      type: "adjacent_to" },
  { source: "d_south_bronx",    target: "d_washington_hts", type: "adjacent_to" },
  { source: "d_washington_hts", target: "d_south_bronx",    type: "adjacent_to" },
  { source: "d_south_bronx",    target: "d_harlem",         type: "adjacent_to" },
  { source: "d_harlem",         target: "d_south_bronx",    type: "adjacent_to" },
  { source: "d_washington_hts", target: "d_harlem",         type: "adjacent_to" },
  { source: "d_harlem",         target: "d_washington_hts", type: "adjacent_to" },
  { source: "d_harlem",         target: "d_upper_west",     type: "adjacent_to" },
  { source: "d_upper_west",     target: "d_harlem",         type: "adjacent_to" },
  { source: "d_harlem",         target: "d_upper_east",     type: "adjacent_to" },
  { source: "d_upper_east",     target: "d_harlem",         type: "adjacent_to" },
  { source: "d_upper_west",     target: "d_upper_east",     type: "adjacent_to" },
  { source: "d_upper_east",     target: "d_upper_west",     type: "adjacent_to" },
  { source: "d_upper_west",     target: "d_midtown",        type: "adjacent_to" },
  { source: "d_midtown",        target: "d_upper_west",     type: "adjacent_to" },
  { source: "d_upper_east",     target: "d_midtown",        type: "adjacent_to" },
  { source: "d_midtown",        target: "d_upper_east",     type: "adjacent_to" },
  { source: "d_midtown",        target: "d_les",            type: "adjacent_to" },
  { source: "d_les",            target: "d_midtown",        type: "adjacent_to" },
  { source: "d_les",            target: "d_fidi",           type: "adjacent_to" },
  { source: "d_fidi",           target: "d_les",            type: "adjacent_to" },
  { source: "d_upper_east",     target: "d_astoria",        type: "adjacent_to" },
  { source: "d_astoria",        target: "d_upper_east",     type: "adjacent_to" },
  { source: "d_astoria",        target: "d_jackson_hts",    type: "adjacent_to" },
  { source: "d_jackson_hts",    target: "d_astoria",        type: "adjacent_to" },
  { source: "d_jackson_hts",    target: "d_flushing",       type: "adjacent_to" },
  { source: "d_flushing",       target: "d_jackson_hts",    type: "adjacent_to" },
  { source: "d_jackson_hts",    target: "d_jamaica",        type: "adjacent_to" },
  { source: "d_jamaica",        target: "d_jackson_hts",    type: "adjacent_to" },
  { source: "d_flushing",       target: "d_jamaica",        type: "adjacent_to" },
  { source: "d_jamaica",        target: "d_flushing",       type: "adjacent_to" },
  { source: "d_astoria",        target: "d_williamsburg",   type: "adjacent_to" },
  { source: "d_williamsburg",   target: "d_astoria",        type: "adjacent_to" },
  { source: "d_les",            target: "d_williamsburg",   type: "adjacent_to" },
  { source: "d_williamsburg",   target: "d_les",            type: "adjacent_to" },
  { source: "d_fidi",           target: "d_williamsburg",   type: "adjacent_to" },
  { source: "d_williamsburg",   target: "d_fidi",           type: "adjacent_to" },
  { source: "d_williamsburg",   target: "d_bed_stuy",       type: "adjacent_to" },
  { source: "d_bed_stuy",       target: "d_williamsburg",   type: "adjacent_to" },
  { source: "d_bed_stuy",       target: "d_park_slope",     type: "adjacent_to" },
  { source: "d_park_slope",     target: "d_bed_stuy",       type: "adjacent_to" },
  { source: "d_bed_stuy",       target: "d_brownsville",    type: "adjacent_to" },
  { source: "d_brownsville",    target: "d_bed_stuy",       type: "adjacent_to" },
  { source: "d_jamaica",        target: "d_brownsville",    type: "adjacent_to" },
  { source: "d_brownsville",    target: "d_jamaica",        type: "adjacent_to" },
  { source: "d_park_slope",     target: "d_bay_ridge",      type: "adjacent_to" },
  { source: "d_bay_ridge",      target: "d_park_slope",     type: "adjacent_to" },
  { source: "d_fidi",           target: "d_bay_ridge",      type: "adjacent_to" },
  { source: "d_bay_ridge",      target: "d_fidi",           type: "adjacent_to" },
  { source: "d_fidi",           target: "d_staten_island",  type: "adjacent_to" },
  { source: "d_staten_island",  target: "d_fidi",           type: "adjacent_to" },
  { source: "d_bay_ridge",      target: "d_staten_island",  type: "adjacent_to" },
  { source: "d_staten_island",  target: "d_bay_ridge",      type: "adjacent_to" },
];
