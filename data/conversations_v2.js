// conversations_v2.js — Disco Elysium-style conversation scripts
// Department interjections, skill checks, solution-jump detection.
// Merges over conversations.js — districts with v2 scripts use this format.

export const CONVERSATIONS_V2 = {

  // ═══════════════════════════════════════════════════════════════
  // SOUTH BRONX — Maria Delgado, Tenant Organizer
  // Primary: HEALTH + COMMUNITY. The pharmacy generator and
  // Mrs. Gutierrez are behind checks.
  // ═══════════════════════════════════════════════════════════════
  southbronx: {
    character: { name: 'Maria Delgado', role: 'Tenant Organizer', initials: 'MD' },
    exchanges: [
      {
        npc: "Heat's been out since November. Third winter in a row. The landlord says he filed for parts. The city says they sent an inspector. Nobody came.",
        interjections: [
          { dept: 'HEALTH', minLevel: 1, text: "She seems exhausted. The cold is wearing her down.", followUp: "How are people managing the cold?" },
          { dept: 'HEALTH', minLevel: 3, text: "Third winter of cold exposure — some of those tenants are elderly. Hypothermia risk compounds.", followUp: "Who's most vulnerable in the building right now?" },
          { dept: 'HOUSING', minLevel: 1, text: "That's a code violation.", followUp: "Has code enforcement actually been here?" },
          { dept: 'HOUSING', minLevel: 3, text: "Rent-stabilized building. Landlord has a legal obligation to provide heat. This is actionable.", followUp: "What's the landlord's compliance history?" },
        ],
        freeChoices: [
          { text: "Tell me more about what's happening.", depth: 1 },
          { text: "That's unacceptable. I'll get someone out there.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'HOUSING', text: 'Heat failures in rent-stabilized buildings — systemic, not isolated. Third winter.' },
      },
      {
        npc: "The kids in 4B have been sleeping in coats. Mrs. Gutierrez on the fourth floor — she's on oxygen. When the power flickers, her concentrator stops. She's alone up there.",
        interjections: [
          { dept: 'HEALTH', minLevel: 2, text: "Oxygen-dependent, elevator building — she's trapped if power goes.", followUp: "Does anyone check on Mrs. Gutierrez regularly?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "She mentioned the kids by apartment number. She knows everyone.", followUp: "It sounds like you keep track of everyone in the building." },
          { dept: 'COMMUNITY', minLevel: 3, text: "This is someone who monitors her neighbors. She's an asset — a community sentinel.", followUp: "If something happened, could you mobilize people on your floor?" },
        ],
        freeChoices: [
          { text: "That sounds really hard. What does a bad night look like?", depth: 2 },
          { text: "We'll get her relocated.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'HEALTH', difficulty: 12,
            pass: {
              insight: { category: 'HEALTH', text: 'Mrs. Gutierrez, 4th floor, oxygen-dependent, lives alone. Concentrator fails in blackouts.' },
              npcReaction: "She pauses. 'You actually want to know who.' She gives you the apartment number, the medication schedule, the neighbor who has a key.",
            },
            fail: {
              text: "I've told three of you people about her. The last one said they'd send someone. Nobody came.",
              trustInsight: "Previous administration was informed about Mrs. Gutierrez. No action taken. Trust deficit inherited.",
            },
          },
        ],
      },
      {
        npc: "The pharmacy on 138th has a generator. Carlos — the pharmacist — he stores insulin for the whole block. If the power goes out for real, that generator is the only thing between twelve people and a medical emergency.",
        interjections: [
          { dept: 'HEALTH', minLevel: 2, text: "Insulin requires refrigeration. A pharmacy generator is critical medical infrastructure.", followUp: "How long can the generator run?" },
          { dept: 'COMMUNITY', minLevel: 2, text: "A pharmacist storing insulin for the block — that's a mutual aid network.", followUp: "Does Carlos coordinate with anyone else on the block?" },
          { dept: 'INFRA', minLevel: 1, text: "One generator for a whole block's medication.", followUp: "What happens when the generator runs out of fuel?" },
        ],
        freeChoices: [
          { text: "I didn't know about Carlos. Tell me more.", depth: 2 },
          { text: "We should get a backup generator in there.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'COMMUNITY', difficulty: 10,
            pass: {
              insight: { category: 'ASSET', text: 'Pharmacy at 138th has generator — stores insulin for 12 residents. Carlos coordinates with 3 block captains.' },
              npcReaction: "She leans forward. 'If you actually talk to Carlos, he'll show you the whole network. Phone tree, block captains, the works. We built this ourselves.'",
            },
            fail: {
              text: "She shrugs. 'It's just Carlos being Carlos. We take care of ourselves because nobody else does.'",
              trustInsight: "Community self-organization exists but isn't documented or supported by the city.",
            },
          },
        ],
        insight: { category: 'INFRA', text: 'Single-point-of-failure: one pharmacy generator protects insulin supply for 12+ residents.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HARLEM — James Washington, Block Association President
  // Primary: INFRA + COMMUNITY. The vulnerable-resident registry
  // is behind a COMMUNITY check.
  // ═══════════════════════════════════════════════════════════════
  harlem: {
    character: { name: 'James Washington', role: 'Block Association President', initials: 'JW' },
    exchanges: [
      {
        npc: "Thirty years I've been in this building. Used to be you knew every face on every floor. Now half the units are empty or flipped. But the ones who stayed — we look out for each other.",
        interjections: [
          { dept: 'HOUSING', minLevel: 1, text: "Displacement pressure. Long-term residents surrounded by turnover.", followUp: "What happened to the people who left?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "He's describing a community network. The people who stayed are the backbone.", followUp: "How do you keep track of everyone?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "'We look out for each other' — this is organized mutual aid, not just neighborliness.", followUp: "Do you have a system? A phone tree, a list?" },
        ],
        freeChoices: [
          { text: "What does looking out for each other look like day to day?", depth: 1 },
          { text: "We're working on stabilizing the neighborhood.", depth: 0, solutionJump: true },
        ],
      },
      {
        npc: "When the power went out last August — four days — I went door to door. Found Mrs. Patterson on the eighth floor. She'd fallen. No phone, no way to call anyone. Elevator's out, so nobody was going up there.",
        interjections: [
          { dept: 'INFRA', minLevel: 1, text: "High-rise walk-up during blackout. Elevator-dependent residents trapped.", followUp: "How many people in this building can't take the stairs?" },
          { dept: 'INFRA', minLevel: 3, text: "Four-day blackout, high-rise, no elevator — this is a systematic failure. How many buildings have this profile?", followUp: "Is this building on the same grid as the rest of the block?" },
          { dept: 'HEALTH', minLevel: 2, text: "Elderly fall, no phone, no one checking — this is exactly how preventable deaths happen.", followUp: "How long was she on the floor before you found her?" },
        ],
        freeChoices: [
          { text: "You found her. What happened next?", depth: 2 },
          { text: "We need to get emergency phones installed.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'INFRA', text: 'High-rise walk-ups during blackouts — elevator-dependent residents trapped above 6th floor.' },
      },
      {
        npc: "After that I started a list. Everyone in the building, what floor, who lives alone, who needs medication, who can't do stairs. I check on the ones who need it. Every morning.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 2, text: "A vulnerable-resident registry, maintained by one person. This is exactly what emergency management needs.", followUp: "Could we get a copy of that list — with permission?" },
          { dept: 'HEALTH', minLevel: 2, text: "Medication schedules, mobility limitations — this is better data than the city has.", followUp: "Do you know which residents are on medical equipment that needs power?" },
        ],
        freeChoices: [
          { text: "Every morning. How many people are on your list?", depth: 2 },
          { text: "That's impressive. The city should be doing this.", depth: 1 },
        ],
        checks: [
          {
            dept: 'COMMUNITY', difficulty: 11,
            pass: {
              insight: { category: 'ASSET', text: 'Block association maintains vulnerable-resident registry — 14 mobility-limited, medication schedules, medical volunteers available.' },
              npcReaction: "'Fourteen people who can't get down the stairs on their own. I know every one of their names. You want to help? Don't take my list — help me expand it to the next building.'",
            },
            fail: {
              text: "He looks at you carefully. 'I've shown this list to two other officials. One took a photo and left. The other said they'd be back with resources. Neither followed up.'",
              trustInsight: "Community data has been extracted before without reciprocation. James protects it now.",
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MIDTOWN — Diane Kowalski, Building Manager, Midtown Tower
  // Primary: SERVICES + INFRA. The 311 response data and
  // business continuity angle.
  // ═══════════════════════════════════════════════════════════════
  midtown: {
    character: { name: 'Diane Kowalski', role: 'Building Manager, Midtown Tower', initials: 'DK' },
    exchanges: [
      {
        npc: "I manage forty-two floors. Three thousand people work here every day. When something goes wrong, I don't call 311 — I call my guys. Because 311 takes four hours to send someone and by then the lobby's flooded.",
        interjections: [
          { dept: 'SERVICES', minLevel: 1, text: "Four-hour 311 response time in Midtown. That's a data point.", followUp: "What's the longest you've waited on a 311 call?" },
          { dept: 'SERVICES', minLevel: 3, text: "311 failure in a high-density commercial zone — if response is this slow here, what is it in the outer boroughs?", followUp: "Do you track your 311 calls? Response times, resolution?" },
          { dept: 'INFRA', minLevel: 2, text: "She has her own maintenance crew. The building is a self-contained system.", followUp: "What's your building's backup power situation?" },
        ],
        freeChoices: [
          { text: "What kind of emergencies are you dealing with?", depth: 1 },
          { text: "I'll make sure 311 prioritizes commercial buildings.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'SERVICES', text: '311 response times in Midtown average 4+ hours. Building managers route around the system.' },
      },
      {
        npc: "Last nor'easter, the loading dock flooded. We lost power to the freight elevators. Forty-two floors of offices, no way to get supplies up or garbage down. The tenants — the businesses — they were furious. Three of them broke their leases.",
        interjections: [
          { dept: 'INFRA', minLevel: 1, text: "Freight elevator failure cascades to building operations. Critical infrastructure.", followUp: "Is the loading dock below the flood line?" },
          { dept: 'INFRA', minLevel: 3, text: "Loading dock, freight elevators, backup power — three single points of failure. One storm takes all three.", followUp: "If you could fix one thing before next winter, what would it be?" },
          { dept: 'HOUSING', minLevel: 1, text: "Three broken leases. This is an economic cascading failure.", followUp: "What happens to the tax base when commercial tenants leave?" },
        ],
        freeChoices: [
          { text: "Walk me through what that day looked like.", depth: 2 },
          { text: "We'll get flood barriers for the loading docks.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'SERVICES', difficulty: 13,
            pass: {
              insight: { category: 'SERVICES', text: 'Building managers in Midtown maintain shadow infrastructure — private maintenance crews, mutual aid between buildings, off-grid communication.' },
              npcReaction: "'You want the real story? Talk to the other building managers on this block. We have a group chat. When the city fails, we coordinate ourselves.'",
            },
            fail: {
              text: "She crosses her arms. 'Look, I appreciate you coming, but I've sat in three community boards where they nodded and did nothing. Fix the loading dock or don't. Just don't waste my time with another listening session.'",
              trustInsight: "Building managers are competent, pragmatic, and deeply skeptical of government process.",
            },
          },
        ],
        insight: { category: 'INFRA', text: 'Commercial buildings have cascading failure chains: flood → freight elevator → supply logistics → tenant flight → tax base erosion.' },
      },
    ],
  },
};
