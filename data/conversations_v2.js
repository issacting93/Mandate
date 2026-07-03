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

  // ═══════════════════════════════════════════════════════════════
  // FORDHAM — Ramon Vega, Retired MTA Mechanic
  // Primary: INFRA + SERVICES. Transit deserts, cooling center
  // access, VFW hall as community asset behind INFRA check.
  // ═══════════════════════════════════════════════════════════════
  fordham: {
    character: { name: 'Ramon Vega', role: 'Retired MTA Mechanic', initials: 'RV' },
    exchanges: [
      {
        npc: "Forty years I rode the Bx12 to work. Now they cut it to every 45 minutes. My grandson takes two buses to get to school. You know what that does to a kid's day?",
        interjections: [
          { dept: 'INFRA', minLevel: 1, text: "45-minute headways on a trunk line. That's not a cut — that's abandonment.", followUp: "When did the cuts start? Was there a service change notice?" },
          { dept: 'INFRA', minLevel: 3, text: "A transit desert in the Bronx. If the Bx12 is this bad, check the Bx19 and Bx35 — those corridors overlap.", followUp: "What other routes got cut at the same time?" },
          { dept: 'SERVICES', minLevel: 2, text: "Two buses to school — that's a child welfare issue, not just transit.", followUp: "How many kids on this block have that kind of commute?" },
        ],
        freeChoices: [
          { text: "Walk me through his morning. What does that commute look like?", depth: 2 },
          { text: "We're looking at restoring service citywide.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'INFRA', text: 'Bx12 bus cuts — 45min headways, children missing school, seniors stranded.' },
      },
      {
        npc: "When the power went out last July, we had no way to get people to cooling centers. The bus wasn't running. My neighbor — diabetic, 74 — sat in a dark apartment for 16 hours. I carried ice up five flights.",
        interjections: [
          { dept: 'HEALTH', minLevel: 1, text: "Diabetic, 74, 16 hours without power. That's a medical emergency.", followUp: "Does he have insulin that needs refrigeration?" },
          { dept: 'HEALTH', minLevel: 3, text: "Heat plus diabetes plus no transit equals preventable death. This is a compound vulnerability.", followUp: "How many people on this block are diabetic and transit-dependent?" },
          { dept: 'INFRA', minLevel: 2, text: "No bus during a blackout means no evacuation corridor. The transit gap becomes a life-safety gap.", followUp: "Is there any vehicle — a community van, church bus — that could serve as backup?" },
        ],
        freeChoices: [
          { text: "Five flights with ice. What was going through your head?", depth: 2 },
          { text: "We need to fix the grid so that doesn't happen.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'HEALTH', text: "Transit-dependent seniors can't reach cooling centers during blackouts — compound vulnerability with diabetes." },
      },
      {
        npc: "The VFW hall on Jerome Ave has a backup generator and AC. It holds 200 people. Nobody from the city has ever asked us to use it. We offered after Sandy. Nobody called back.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "200-person capacity, generator, AC — this is better than most city-run cooling centers.", followUp: "How long can the generator run? What's the fuel situation?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "They offered and nobody called back. That's institutional neglect of a community asset.", followUp: "Who else in the neighborhood knows about the VFW hall?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "A VFW hall — veterans. Trained, organized, disciplined. These are first responders the city isn't using.", followUp: "How many vets are active at the hall? Could they run an operation?" },
        ],
        freeChoices: [
          { text: "Can I see the space? I want to understand what you've got.", depth: 2 },
          { text: "I'll connect you with emergency management.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'INFRA', difficulty: 11,
            pass: {
              insight: { category: 'ASSET', text: 'VFW hall on Jerome Ave — generator, AC, 200-person capacity, 12 active vets with emergency training. Never contacted by city.' },
              npcReaction: "He straightens up. 'You want to see it? Come on. I'll show you the generator, the kitchen, the whole setup. We drill every month. We're ready. We've been ready.'",
            },
            fail: {
              text: "He looks away. 'I offered once. I'm not gonna beg. You people always say you'll call back.'",
              trustInsight: "Community resources offered and ignored during Sandy. The VFW stopped volunteering information to the city.",
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ASTORIA — Yuki Tanaka, Community Health Worker
  // Primary: HEALTH + COMMUNITY. Homebound elderly, the health
  // worker scaling proposal is behind a HEALTH check.
  // ═══════════════════════════════════════════════════════════════
  astoria: {
    character: { name: 'Yuki Tanaka', role: 'Community Health Worker', initials: 'YT' },
    exchanges: [
      {
        npc: "I do home visits for elderly residents. Thirty-seven on my roster. When I tell you I know every creak in every staircase in this neighborhood — I mean it.",
        interjections: [
          { dept: 'HEALTH', minLevel: 1, text: "Thirty-seven home visits. She's a one-person early warning system.", followUp: "How many of those 37 could evacuate on their own?" },
          { dept: 'HEALTH', minLevel: 3, text: "One health worker, 37 patients — that's a coverage ratio no hospital would accept. If she gets sick, they're blind.", followUp: "What happens to your patients when you take a day off?" },
          { dept: 'COMMUNITY', minLevel: 2, text: "She knows the staircases. She has the spatial knowledge the city doesn't.", followUp: "Do you keep notes on which buildings have working elevators?" },
        ],
        freeChoices: [
          { text: "What's your biggest worry going into this winter?", depth: 1 },
          { text: "That kind of dedication is what makes this city work.", depth: 0, solutionJump: true },
        ],
      },
      {
        npc: "Eleven of them can't do stairs. Eight are on oxygen. Mrs. Papadopoulos hasn't left her apartment in two years — she weighs 90 pounds and lives on the sixth floor. When the elevator goes, she's trapped.",
        interjections: [
          { dept: 'HEALTH', minLevel: 2, text: "Eight on oxygen — that's eight people whose lives depend on an uninterrupted power supply.", followUp: "Do any of them have battery backups for their concentrators?" },
          { dept: 'INFRA', minLevel: 1, text: "Sixth floor, 90 pounds, elevator-dependent. In a blackout, even stairs aren't an option.", followUp: "Which buildings in this area have the worst elevator reliability?" },
          { dept: 'SERVICES', minLevel: 2, text: "Two years homebound. Is anyone besides Yuki checking on her? Social services? Family?", followUp: "Does Mrs. Papadopoulos have any family in the city?" },
        ],
        freeChoices: [
          { text: "What happens during a power outage? Who checks on them?", depth: 2 },
          { text: "We'll get her relocated to a ground-floor unit.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'HEALTH', text: "11 homebound residents can't evacuate — 8 on oxygen, elevator-dependent, no emergency contact system." },
        checks: [
          {
            dept: 'HEALTH', difficulty: 12,
            pass: {
              insight: { category: 'HEALTH', text: 'Detailed vulnerability map: 8 oxygen-dependent, 3 insulin-dependent, 11 mobility-limited. Addresses, medication schedules, emergency contacts.' },
              npcReaction: "She pulls out a worn notebook. 'Every name, every medication, every emergency contact. I update it weekly. You want a copy? I'll give you a copy. But only if someone actually reads it.'",
            },
            fail: {
              text: "She shakes her head. 'I've shared my data with the health department twice. Both times it went into a filing cabinet. I don't share it anymore unless I know someone's going to act.'",
              trustInsight: "Health worker data has been collected and ignored by city agencies. She's protective of her patients' information now.",
            },
          },
        ],
      },
      {
        npc: "I check on them. Me. One person. If it's a citywide emergency, I can't get to all 37 in a day. Give me three more health workers and a radio, and we cover this whole zip code. That's a $180,000 ask. You spent $800 million on that housing thing.",
        interjections: [
          { dept: 'HEALTH', minLevel: 2, text: "$180K for full zip code coverage. That's the most cost-effective health intervention you'll hear today.", followUp: "What would the job description look like? What training do they need?" },
          { dept: 'SERVICES', minLevel: 1, text: "She's comparing $180K to $800M. The ratio speaks for itself.", followUp: "If we funded this, who would you hire? Do you have people in mind?" },
          { dept: 'COMMUNITY', minLevel: 2, text: "Radios — she wants direct comms, not 311. She knows the system doesn't work.", followUp: "What kind of radio network? Would it connect to OEM dispatch?" },
        ],
        freeChoices: [
          { text: "That's a concrete proposal. Can you write it up?", depth: 2 },
          { text: "We need to scale programs like yours across the city.", depth: 1, solutionJump: true },
        ],
        checks: [
          {
            dept: 'COMMUNITY', difficulty: 10,
            pass: {
              insight: { category: 'ASSET', text: 'Health worker network — 4 workers + radios covers full zip code for $180K. Yuki has 3 candidates ready, all bilingual.' },
              npcReaction: "'I already know who I'd hire. Maria speaks Greek and Albanian — half my patients on Ditmars. Priya knows the Bangladeshi families on Steinway. You fund this, I have people tomorrow.'",
            },
            fail: {
              text: "'Scale it.' She laughs, but not happily. 'Everyone wants to scale it. Nobody wants to fund the first one properly.'",
              trustInsight: "'Scaling' language without funding commitment is a recognized deflection pattern among frontline workers.",
            },
          },
        ],
        insight: { category: 'SERVICES', text: 'One health worker covers 37 homebound residents. Three more + radios = full zip code. $180K total.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // JACKSON HEIGHTS — Fatima Al-Rashid, Bodega Owner
  // Primary: SERVICES + HOUSING. Language barriers, basement
  // apartments, bodega info network. Trust check for basement data.
  // ═══════════════════════════════════════════════════════════════
  jackson: {
    character: { name: 'Fatima Al-Rashid', role: 'Bodega Owner, Roosevelt Ave', initials: 'FA' },
    exchanges: [
      {
        npc: "You speak Spanish? No? Bengali? Urdu? This block has 14 languages. When the city sends emergency alerts, they come in English. Half my customers can't read them.",
        interjections: [
          { dept: 'SERVICES', minLevel: 1, text: "English-only alerts in a 14-language neighborhood. That's not communication — it's noise.", followUp: "What languages would cover most people on this block?" },
          { dept: 'SERVICES', minLevel: 3, text: "This is a systemic access failure. If emergency info doesn't reach people, every other intervention downstream fails.", followUp: "How do people actually get emergency information right now?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "She's observing her customers closely. She knows who can read and who can't.", followUp: "Do people come to you when they don't understand something official?" },
        ],
        freeChoices: [
          { text: "How do people find out about emergencies now?", depth: 1 },
          { text: "We're working on multilingual outreach.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'SERVICES', text: 'Emergency alerts English-only — 14 languages on one block, residents rely on word-of-mouth.' },
      },
      {
        npc: "They come to me. I'm the one who tells them school is closed, or the subway is down, or there's a boil-water advisory. My bodega is the emergency broadcast system for Roosevelt Ave. I don't mind, but I shouldn't be the only one.",
        interjections: [
          { dept: 'SERVICES', minLevel: 2, text: "She's an informal emergency broadcaster. The city should be formalizing this, not ignoring it.", followUp: "Could your bodega be an official information hub? We'd supply materials in every language." },
          { dept: 'COMMUNITY', minLevel: 2, text: "Not just her — there are probably others. Bodegas, laundromats, barber shops. The informal network already exists.", followUp: "Are there other businesses on this block that serve this same role?" },
          { dept: 'INFRA', minLevel: 1, text: "She's filling a gap the city doesn't even know exists.", followUp: "What happens when you're closed? Who tells people then?" },
        ],
        freeChoices: [
          { text: "Six shops could cover this whole corridor?", depth: 2 },
          { text: "We'll set up an official alert system for the neighborhood.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'ASSET', text: 'Bodega network as informal emergency broadcast — Roosevelt Ave has 6 shops that could be official info hubs.' },
        checks: [
          {
            dept: 'SERVICES', difficulty: 11,
            pass: {
              insight: { category: 'SERVICES', text: 'Bodega info hub model: 6 shops, 14 languages covered, owners already trusted. $2K per shop for multilingual supply kits.' },
              npcReaction: "'You want names? Here.' She counts on her fingers. 'Me, Kim at the laundromat, Rajesh at the pharmacy, the two Mohammeds — hardware and grocery — and Rosa at the salon. We already coordinate on snow days.'",
            },
            fail: {
              text: "'Official.' She waves the word away. 'You make it official, you make it complicated. Forms, inspections, someone from downtown telling me where to put the sign. We're doing fine without you.'",
              trustInsight: "Formalization carries risk of bureaucratic overhead that kills organic community systems.",
            },
          },
        ],
      },
      {
        npc: "The basement apartments — there are maybe 200 on this block alone. Illegal, sure. But people live there. When it floods, those are death traps. The city pretends they don't exist. But I know every single one.",
        interjections: [
          { dept: 'HOUSING', minLevel: 1, text: "200 basement apartments. One block. Those aren't housing — they're flood zones with beds.", followUp: "How deep does the flooding get?" },
          { dept: 'HOUSING', minLevel: 3, text: "Illegal but occupied. If the city doesn't acknowledge them, there's no evacuation plan for 200+ people.", followUp: "Would residents cooperate with an evacuation plan if we guaranteed no enforcement?" },
          { dept: 'SAFETY', minLevel: 2, text: "Basement apartments plus flooding equals the Ida death toll. This is the exact scenario that killed 11 people in Queens.", followUp: "Were any of the Ida fatalities from this block?" },
        ],
        freeChoices: [
          { text: "Would residents trust you to share that information with us for evacuation planning?", depth: 2 },
          { text: "We need to shut those down for safety.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'HOUSING', text: '~200 illegal basement apartments on one block — flood death traps, residents fear deportation if reported.' },
        checks: [
          {
            dept: 'COMMUNITY', difficulty: 13,
            pass: {
              insight: { category: 'ASSET', text: 'Fatima can broker confidential basement apartment registry for evacuation — 200+ units, requires no-enforcement guarantee.' },
              npcReaction: "She lowers her voice. 'If you promise me — personally, not the city, you — that nobody gets deported for being on a list, I'll get you every address on this block. These are my people. I won't let them drown.'",
            },
            fail: {
              text: "She goes quiet. 'You want me to give you a list of undocumented people. And you want me to trust that the next mayor won't use it against them. I can't do that.'",
              trustInsight: "Basement apartment data requires extraordinary trust. Fear of immigration enforcement prevents cooperation with safety planning.",
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // WILLIAMSBURG — Sasha Okonkwo, Mutual Aid Coordinator
  // Primary: COMMUNITY + INFRA. Block captain model, data sharing,
  // replicable structure behind COMMUNITY check.
  // ═══════════════════════════════════════════════════════════════
  williamsburg: {
    character: { name: 'Sasha Okonkwo', role: 'Mutual Aid Coordinator', initials: 'SO' },
    exchanges: [
      {
        npc: "We've been running a mutual aid network since COVID. 400 members. We do grocery delivery, medication runs, wellness checks. We don't wait for the city.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 1, text: "400 members. That's not a volunteer group — that's an institution.", followUp: "How is it organized? Block-by-block, or something else?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "A mutual aid network that survived COVID and kept going. Most collapsed. Hers scaled. Find out why.", followUp: "What makes your network different from the ones that fell apart?" },
          { dept: 'HEALTH', minLevel: 1, text: "Medication runs and wellness checks — she's providing health services without calling them that.", followUp: "How do you know which medications to pick up? Do you coordinate with pharmacies?" },
        ],
        freeChoices: [
          { text: "That's incredible. How did it start?", depth: 1 },
          { text: "The city should be supporting networks like yours.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'COMMUNITY', text: 'Mutual aid network — 400 members, organized block-by-block, runs grocery/meds/wellness since COVID.' },
      },
      {
        npc: "Organized by block captain. Each captain knows every unit in their building. Who's elderly. Who has kids. Who speaks what. During Sandy, we evacuated 60 people in 3 hours because we already knew who needed help. FEMA took 3 days.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 2, text: "Block captains with unit-level knowledge. That's better intelligence than the census.", followUp: "How many block captains do you have? What's their coverage?" },
          { dept: 'INFRA', minLevel: 2, text: "60 evacuations in 3 hours versus FEMA in 3 days. The time differential is the argument.", followUp: "What did FEMA get wrong that you got right?" },
          { dept: 'SAFETY', minLevel: 1, text: "They evacuated 60 people. Without authority, without vehicles, without city support. Imagine what they could do with support.", followUp: "Did anyone get hurt during those evacuations?" },
        ],
        freeChoices: [
          { text: "Walk me through those three hours. What happened first?", depth: 2 },
          { text: "We should get your captains trained in emergency protocols.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'COMMUNITY', text: 'Block captain model — 60 evacuations in 3 hours during Sandy, vs FEMA 3 days. Replicable structure.' },
        checks: [
          {
            dept: 'COMMUNITY', difficulty: 11,
            pass: {
              insight: { category: 'ASSET', text: 'Block captain model is documented and replicable — 23 captains, training manual, phone tree template. Sasha will train other neighborhoods.' },
              npcReaction: "'We wrote it all down. The training manual, the phone tree template, the intake form. I've been waiting for someone to ask. Give me three neighborhoods and six months, I'll build you the same thing.'",
            },
            fail: {
              text: "'Protocols.' She sighs. 'See, this is the problem. The city wants to credential what we already know how to do. We don't need your protocols — you need ours.'",
              trustInsight: "Mutual aid organizers distrust top-down formalization. The city's instinct to credential community knowledge is read as co-optation.",
            },
          },
        ],
      },
      {
        npc: "What we need: the city to actually share information with us. Evacuation routes. Shelter locations. Hospital capacity. We have the people. You have the data. Right now neither side talks to the other.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "She's asking for data access. Real-time shelter capacity, evacuation status. That's a two-way channel.", followUp: "What if we created a direct data feed from OEM to your network?" },
          { dept: 'SERVICES', minLevel: 1, text: "The silos are bilateral. She can't see the city's data. The city can't see her network's data.", followUp: "Would your block captains share their data back — real-time ground truth?" },
          { dept: 'COMMUNITY', minLevel: 2, text: "Two-way data sharing between mutual aid and OEM would be unprecedented. And exactly right.", followUp: "What format would work? An app? Radio? Text chain?" },
        ],
        freeChoices: [
          { text: "What data would make the biggest difference right now?", depth: 2 },
          { text: "I hear you. The silos need to break down.", depth: 1 },
        ],
        insight: { category: 'INFRA', text: 'Mutual aid needs city data access — evacuation routes, shelter capacity, hospital status. Two-way channel.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CROWN HEIGHTS — Pastor David Williams, Greater Faith Church
  // Primary: HEALTH + COMMUNITY. Pharmacy desert, institution-
  // distrustful residents. The 30 hidden residents behind check.
  // ═══════════════════════════════════════════════════════════════
  crown: {
    character: { name: 'Pastor David Williams', role: 'Greater Faith Church', initials: 'DW' },
    exchanges: [
      {
        npc: "My church seats 300. We have a kitchen, a generator, and 40 volunteers on call. During the last blackout, we fed 200 people. The city didn't know we existed.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 1, text: "300 seats, kitchen, generator, 40 volunteers — this is a fully operational emergency facility.", followUp: "How long can your generator run?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "200 people fed during a blackout without city coordination. This church is better-prepared than most OEM staging areas.", followUp: "Can I see the facility? We should get it into the emergency resource registry." },
          { dept: 'INFRA', minLevel: 2, text: "Not in the city registry. The city's emergency map has a blind spot right where a 300-person shelter exists.", followUp: "What other churches and community centers in Crown Heights have this kind of capacity?" },
        ],
        freeChoices: [
          { text: "You fed 200 people. Walk me through how that happened.", depth: 2 },
          { text: "Faith communities are essential partners in emergency response.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'ASSET', text: 'Greater Faith Church — 300 seats, kitchen, generator, 40 volunteers. Fed 200 during last blackout. Not in city registry.' },
      },
      {
        npc: "The shootings are what people talk about, but the real danger is the quiet stuff. Diabetics who can't afford insulin. Kids with asthma using expired inhalers. When the pharmacy on Crown Street closed, people lost their supply chain. Nobody reported that as a crisis.",
        interjections: [
          { dept: 'HEALTH', minLevel: 1, text: "Pharmacy closure. That's a healthcare desert forming in real time.", followUp: "Where do people get medication now?" },
          { dept: 'HEALTH', minLevel: 3, text: "Expired inhalers and unaffordable insulin — these are the casualties nobody counts until they become 911 calls during a storm.", followUp: "How many people in the congregation are managing chronic conditions without regular pharmacy access?" },
          { dept: 'SERVICES', minLevel: 2, text: "Nobody reported it as a crisis. Because there's no reporting mechanism for a pharmacy closure. The system doesn't see it.", followUp: "When did the pharmacy close? Has anyone measured the impact?" },
        ],
        freeChoices: [
          { text: "The quiet stuff. Tell me what you see that nobody else does.", depth: 2 },
          { text: "We'll look into getting a pharmacy back in the area.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'HEALTH', text: 'Pharmacy desert — Crown St pharmacy closed, nearest is 20min by bus. Insulin and inhaler supply chain broken.' },
      },
      {
        npc: "If a hurricane hits and the power goes, my congregation will come here. But the ones who don't come to church — the ones who stay home, who don't trust institutions — those are the people who die. I know 30 of them by name.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 2, text: "30 institution-distrustful residents he knows personally. He's the only bridge to people the city can't reach.", followUp: "Would those 30 people trust you to share their information for evacuation planning?" },
          { dept: 'HEALTH', minLevel: 2, text: "'The ones who stay home' — these are the people who become post-storm fatality statistics. If he knows 30 names, that's 30 preventable deaths.", followUp: "Of those 30, how many have medical conditions that make sheltering in place dangerous?" },
          { dept: 'SAFETY', minLevel: 1, text: "He's describing the exact population that dies in every disaster — isolated, distrustful, invisible to systems.", followUp: "What would it take to get them to the church if a hurricane was coming?" },
        ],
        freeChoices: [
          { text: "You know them by name. Tell me about one of them.", depth: 2 },
          { text: "We need to do targeted outreach to isolated residents.", depth: 1 },
        ],
        checks: [
          {
            dept: 'COMMUNITY', difficulty: 12,
            pass: {
              insight: { category: 'ASSET', text: "Pastor Williams can broker door-to-door outreach to 30 institution-distrustful residents — the only person they'll open the door for." },
              npcReaction: "'There's Mr. Henderson on Nostrand — hasn't left his apartment in a year. Won't answer the door for anyone but me. If the storm comes, I'll go get him myself. But I need the city to tell me when, not after.'",
            },
            fail: {
              text: "He pauses. 'I've given names to the city before. Social services showed up at Miss Johnson's door and scared her half to death. She didn't answer my calls for a month. I won't make that mistake again.'",
              trustInsight: "Previous city outreach to isolated residents was experienced as intrusive. The pastor won't share names unless the approach is community-led.",
            },
          },
        ],
        insight: { category: 'SAFETY', text: "30 institution-distrustful residents known by name — won't go to shelters, need door-to-door outreach during crisis." },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FLUSHING — Wei Chen, Pharmacy Owner
  // Primary: HEALTH + INFRA. Medication cold chain, single
  // pharmacy as community lifeline. Generator ask behind check.
  // ═══════════════════════════════════════════════════════════════
  flushing: {
    character: { name: 'Wei Chen', role: 'Pharmacy Owner, Main Street', initials: 'WC' },
    exchanges: [
      {
        npc: "I fill 400 prescriptions a day. Sixty percent of my customers don't speak English. When the power goes out, my refrigerated medications have 4 hours before they're destroyed. $200,000 worth of insulin, biologics, vaccines. Gone.",
        interjections: [
          { dept: 'HEALTH', minLevel: 1, text: "400 prescriptions, 60% non-English. This isn't a pharmacy — it's a community health hub.", followUp: "How many people depend on your refrigerated medications?" },
          { dept: 'HEALTH', minLevel: 3, text: "$200K in temperature-sensitive meds, 4-hour window. One extended blackout and you have a mass medication crisis across Flushing.", followUp: "What's the replacement timeline if those medications are destroyed?" },
          { dept: 'INFRA', minLevel: 2, text: "Single point of failure. One pharmacy, no backup power, entire neighborhood's medication supply.", followUp: "Is there another pharmacy within walking distance that carries the same medications?" },
        ],
        freeChoices: [
          { text: "What happens to those 400 people if the meds are destroyed?", depth: 2 },
          { text: "We need to address pharmaceutical supply chain resilience.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'HEALTH', text: 'Single pharmacy serves 400/day — $200K in temperature-sensitive meds, 4hr backup before total loss.' },
      },
      {
        npc: "A generator. One generator. $8,000. I've asked the SBA, FEMA, the city health department. Everyone says it's someone else's problem. Meanwhile I'm the only pharmacy between Main Street and Northern Boulevard serving this community.",
        interjections: [
          { dept: 'HEALTH', minLevel: 2, text: "$8,000 for a generator that protects $200K in medication and serves 400 people daily. That's the highest ROI health investment in the city.", followUp: "If we supplied the generator, could you also serve as a medication distribution point during emergencies?" },
          { dept: 'SERVICES', minLevel: 1, text: "SBA, FEMA, city health — three agencies, zero action. Classic interagency gap.", followUp: "Do you have the applications on file? I want to see where they stalled." },
          { dept: 'INFRA', minLevel: 1, text: "The only pharmacy in a 12-block radius. This is critical infrastructure that the city doesn't classify as critical infrastructure.", followUp: "What other pharmacies in Flushing are in the same situation?" },
        ],
        freeChoices: [
          { text: "Have you connected with other pharmacies facing the same problem?", depth: 1 },
          { text: "I'll make some calls about that generator.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'HEALTH', difficulty: 10,
            pass: {
              insight: { category: 'ASSET', text: 'Pharmacy can be emergency med distribution hub — generator ($8K), bilingual staff, willing to serve as community resource. Wei has floor plan ready.' },
              npcReaction: "'I already drew up the floor plan. See — triage here, distribution line here, cold storage here. I can serve 600 people a day in emergency mode. I just need the power to keep the refrigerator running.'",
            },
            fail: {
              text: "'Make some calls.' He's heard that before. 'The SBA said the same thing. That was two years ago.'",
              trustInsight: "Small business owners in immigrant communities have learned that 'I'll look into it' means nothing. Concrete action is the only credible signal.",
            },
          },
        ],
        insight: { category: 'INFRA', text: 'Critical pharmacy infrastructure gap: $8K generator separates functioning community health hub from total medication loss.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BAY RIDGE — Tommy Ferraro, Retired FDNY Captain
  // Primary: INFRA + SAFETY. Flood access, CERT team, seawall
  // vulnerability. Flood map data behind INFRA check.
  // ═══════════════════════════════════════════════════════════════
  bayridge: {
    character: { name: 'Tommy Ferraro', role: 'Retired FDNY Captain', initials: 'TF' },
    exchanges: [
      {
        npc: "I was at Engine 241 for 28 years. I know every hydrant, every dead-end, every building with a bad standpipe in this neighborhood. You know what I do now? I argue with my landlord about the boiler.",
        interjections: [
          { dept: 'SAFETY', minLevel: 1, text: "28 years of institutional knowledge, now retired. The department lost a walking encyclopedia.", followUp: "What do you see that the current fire department might be missing?" },
          { dept: 'INFRA', minLevel: 1, text: "Bad standpipes. If he knows which buildings have them, that's life-safety data the city may not have current.", followUp: "Are the standpipe records up to date? Or is your knowledge ahead of the paperwork?" },
          { dept: 'INFRA', minLevel: 3, text: "Every hydrant, every dead-end — he has the spatial failure map in his head. This is the kind of local infrastructure knowledge that doesn't survive retirement.", followUp: "Have you ever written any of this down? The dead-ends, the bad standpipes?" },
        ],
        freeChoices: [
          { text: "What's the biggest vulnerability in Bay Ridge right now?", depth: 1 },
          { text: "Your experience is invaluable to emergency planning.", depth: 0, solutionJump: true },
        ],
      },
      {
        npc: "The seawall. Everyone talks about Red Hook and the Rockaways. But the Belt Parkway floods at Shore Road every nor'easter. When that floods, you cut off the entire southern tip. No ambulances in or out. I've seen it three times.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "Belt Parkway flooding cuts ambulance access. That's not a road closure — that's a mortality zone.", followUp: "Where exactly does the flooding cut off access? Can you show me?" },
          { dept: 'INFRA', minLevel: 3, text: "Three observed floods, same location. This is predictable. If it's predictable, it's preventable — or at least plannable.", followUp: "Has anyone documented these flood events with dates and water levels?" },
          { dept: 'HEALTH', minLevel: 1, text: "No ambulances in or out. If someone has a heart attack south of Shore Road during a nor'easter, they die.", followUp: "How many people live south of the flood point?" },
        ],
        freeChoices: [
          { text: "Three times. Walk me through the worst one.", depth: 2 },
          { text: "We need to fix that seawall.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'INFRA', text: 'Belt Parkway floods at Shore Road during nor\'easters — cuts off ambulance access to southern Bay Ridge.' },
        checks: [
          {
            dept: 'INFRA', difficulty: 11,
            pass: {
              insight: { category: 'INFRA', text: 'Detailed flood map: Shore Road floods at 4ft surge, cuts access for ~8,000 residents. Three documented events. Alternate route via 4th Ave adds 22 minutes.' },
              npcReaction: "He pulls out a folded map from his back pocket. 'I drew this after the second flood. Every point where the water comes over, the depth, the timing. I brought it to CB10. They said they'd forward it. That was 2019.'",
            },
            fail: {
              text: "'Fix the seawall.' He shakes his head. 'That's a $400 million federal project and you know it. I'm not asking you to fix the seawall. I'm asking you to have a plan for when it floods again. Because it will.'",
              trustInsight: "Tommy distinguishes between structural fixes (not your job) and operational planning (your job). He respects competence, not promises.",
            },
          },
        ],
      },
      {
        npc: "I organized a CERT team — 15 retired first responders, all living within 10 blocks. We do our own drills. We have our own radios. If the big one hits, we're ready before the city even finishes its conference call.",
        interjections: [
          { dept: 'SAFETY', minLevel: 2, text: "15 retired first responders with radios and drill discipline. This is a deployable asset sitting idle.", followUp: "Can we integrate your CERT team into the official response plan?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "They drill monthly. They have radios. They're organized. This is the most response-ready community group in the city.", followUp: "What's your comms setup? Could you patch into OEM dispatch?" },
          { dept: 'INFRA', minLevel: 2, text: "15 people, 10-block radius, radios, drill-trained. In the first hour of a disaster, they're faster than any city response.", followUp: "What's your response protocol? What do you do in the first 60 minutes?" },
        ],
        freeChoices: [
          { text: "What does a drill look like? I'd like to see one.", depth: 2 },
          { text: "That's exactly the kind of community readiness we need.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'CERT team — 15 retired first responders with radios and drills. Ready to deploy before official response.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // NORTH SHORE (Staten Island) — Angela Rizzo, School Nurse
  // Primary: SERVICES + INFRA. School as shelter, ferry isolation,
  // vulnerable family list behind SERVICES check.
  // ═══════════════════════════════════════════════════════════════
  northshore: {
    character: { name: 'Angela Rizzo', role: 'School Nurse, PS 31', initials: 'AR' },
    exchanges: [
      {
        npc: "I see 600 kids a year. I know which ones have asthma, which ones are food-insecure, which ones go home to empty houses. When you close schools for a storm, do you know what happens to those kids?",
        interjections: [
          { dept: 'SERVICES', minLevel: 1, text: "Food-insecure kids losing school meals during closures. Every snow day is a hunger day.", followUp: "How many kids depend on school meals as their main nutrition?" },
          { dept: 'SERVICES', minLevel: 3, text: "She's sitting on a vulnerability dataset the city doesn't have. School nurses see what no other system sees.", followUp: "Do you track which kids go home to no adult supervision?" },
          { dept: 'HEALTH', minLevel: 2, text: "Asthma, food insecurity, latchkey — she has a compound-vulnerability map of 600 children.", followUp: "Which kids have medical conditions that make being alone dangerous?" },
        ],
        freeChoices: [
          { text: "What happens to the kids who go home to empty houses?", depth: 2 },
          { text: "School safety is a top priority.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'SERVICES', text: 'School closures leave 40+ children unsupervised — empty houses, no food backup, medical conditions unmonitored.' },
      },
      {
        npc: "Forty-three kids last year went home to no adult supervision when we closed for the nor'easter. Eleven had no heat. Three had no food in the house. We found out after. Nobody tracks this.",
        interjections: [
          { dept: 'SERVICES', minLevel: 2, text: "43 unsupervised, 11 no heat, 3 no food. Those aren't statistics — those are near-misses.", followUp: "Could the school stay open as an emergency shelter for these families?" },
          { dept: 'HEALTH', minLevel: 1, text: "Three kids with no food. During a storm. For how long?", followUp: "Is there a way to flag these families before the next closure?" },
          { dept: 'HOUSING', minLevel: 1, text: "Eleven with no heat. That's the same pattern as the South Bronx — rent-stabilized buildings, landlord neglect.", followUp: "Are those 11 families in buildings with heat complaints on file?" },
        ],
        freeChoices: [
          { text: "You found out after. How did you find out?", depth: 2 },
          { text: "We'll make sure schools stay open during weather events.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'SERVICES', difficulty: 12,
            pass: {
              insight: { category: 'ASSET', text: 'PS 31 has full kitchen, nurse, gym — can shelter 200. School nurse maintains vulnerable family list: 43 at-risk children, addresses, conditions, emergency contacts.' },
              npcReaction: "'I keep my own list. Every kid I'm worried about — address, parent's work schedule, medical conditions, who has a key. The DOE doesn't ask for this. I do it because nobody else will. You want it? Use it.'",
            },
            fail: {
              text: "'Stay open.' She looks tired. 'You know how many forms that takes? Union, DOE, custodial, liability. Last time I suggested it, they said it was a facilities issue. Meanwhile the kids go home to cold apartments.'",
              trustInsight: "School-as-shelter proposals die in bureaucratic cross-jurisdictional gaps between DOE, facilities, and emergency management.",
            },
          },
        ],
      },
      {
        npc: "The ferry is our lifeline over here. When the ferry stops, Staten Island is an island for real. Last year it stopped for the nor'easter and we had 9,000 commuters stranded. No bus bridge for 6 hours.",
        interjections: [
          { dept: 'INFRA', minLevel: 1, text: "9,000 stranded, 6 hours, no bus bridge. That's not a service disruption — that's isolation.", followUp: "What's the backup when the ferry goes down?" },
          { dept: 'INFRA', minLevel: 3, text: "Staten Island isolated during storms. If the ferry stops and the bridges are wind-restricted, there's no way on or off the island. No mutual aid from Brooklyn, no hospital transfers.", followUp: "During those 6 hours, were there any medical emergencies that couldn't get off-island?" },
          { dept: 'SERVICES', minLevel: 2, text: "No bus bridge for 6 hours means the contingency plan either doesn't exist or failed. Which is it?", followUp: "Is there a written protocol for ferry shutdown? Who triggers the bus bridge?" },
        ],
        freeChoices: [
          { text: "Six hours. What happened to the people who were stranded?", depth: 2 },
          { text: "We need to ensure ferry reliability.", depth: 1 },
        ],
        insight: { category: 'INFRA', text: 'Ferry shutdown strands 9,000 commuters — no bus bridge protocol, Staten Island fully isolated during storms.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // JAMAICA — Claudette Desmond, Transit Rider / Q111 Bus Captain
  // Primary: INFRA + COMMUNITY. Transit desert, Archer Ave flooding,
  // mutual aid text chain. Flood map detail behind INFRA check.
  // ═══════════════════════════════════════════════════════════════
  jamaica: {
    character: { name: 'Claudette Desmond', role: 'Transit Rider / Q111 Bus Captain', initials: 'CD' },
    exchanges: [
      {
        npc: "I've been riding the Q111 for 22 years. Twenty-two years. The headways used to be 15 minutes. Now it's 45 on a good day. You miss one bus, you miss your transfer, you're late for work. You're late three times, you're fired. That's how people lose jobs out here.",
        interjections: [
          { dept: 'INFRA', minLevel: 1, text: "45-minute headways on a trunk route. That's not a schedule — that's a dare.", followUp: "When did the service cuts start?" },
          { dept: 'INFRA', minLevel: 3, text: "Q111 feeds into the Archer Ave transit hub. If the feeder line fails, the whole southeast Queens corridor collapses.", followUp: "What other routes connect at Jamaica? How many riders are affected?" },
          { dept: 'SERVICES', minLevel: 2, text: "Three lates and you're fired. The transit gap is an employment gap.", followUp: "How many people on your route are commuting to hourly jobs?" },
        ],
        freeChoices: [
          { text: "Walk me through what your morning commute looks like.", depth: 1 },
          { text: "We're committed to restoring bus service.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'INFRA', text: 'Q111 bus: 45-minute headways, riders losing jobs over missed transfers. Southeast Queens transit desert.' },
      },
      {
        npc: "And when it rains hard — real hard — Archer Ave floods. The underpass at Sutphin goes under three feet of water. Buses stop. Subway entrance floods. Last September, 3,000 people were stuck at Jamaica Station with no way home and no information. MTA just said 'service suspended.' That's it. No bus bridge. No nothing.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "Sutphin underpass at 3 feet — that's a predictable flood point. Should have sandbags staged and a diversion route posted.", followUp: "How often does Archer Ave flood like that?" },
          { dept: 'INFRA', minLevel: 3, text: "3,000 stranded, no bus bridge protocol. Jamaica is the busiest bus hub in Queens. If it floods during surge, the entire borough loses transit.", followUp: "Is there a written protocol for when Archer Ave floods? Or does everyone just improvise?" },
          { dept: 'SERVICES', minLevel: 1, text: "'Service suspended' — no timeline, no alternatives. That's not communication.", followUp: "How do riders find out when service resumes?" },
        ],
        freeChoices: [
          { text: "3,000 people. What did they do? Where did they go?", depth: 2 },
          { text: "We'll get a bus bridge protocol in place.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'INFRA', difficulty: 11,
            pass: {
              insight: { category: 'INFRA', text: 'Archer Ave floods at 4ft surge — Sutphin underpass impassable, Jamaica Station isolated. 3,000 commuters stranded, no bus bridge protocol exists.' },
              npcReaction: "She pulls up photos on her phone. 'September 29th. Three feet right here. I waded through it in my work shoes. This is Sutphin Boulevard, this is the subway entrance — water up to the turnstiles. I have dates, I have photos, I have the MTA's own delay reports. Nobody asked for any of it until now.'",
            },
            fail: {
              text: "She looks at you flat. 'You don't even ride the bus, do you? You drove here. In a city car. To talk to me about transit.'",
              trustInsight: "Transit riders can tell immediately whether an official has ever depended on public transit. Driving to a transit meeting signals disconnection.",
            },
          },
        ],
        insight: { category: 'INFRA', text: 'Archer Ave/Sutphin underpass floods at 3ft — subway entrance submerged, buses halted, 3,000 stranded.' },
      },
      {
        npc: "You know what we did? We built our own system. I run a text chain — 300 riders. When the Q111 is late, when the E train is down, when Archer floods, we text each other. People share rides. People cover each other's shifts. We've been doing the MTA's job for them for three years.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 1, text: "300 riders coordinating rides and shift coverage. That's a mutual aid transit network.", followUp: "How did you build the text chain? Word of mouth?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "Self-organized, 300 members, real-time coordination. This is the kind of community infrastructure the city should be funding, not replacing.", followUp: "Could this model scale to other transit deserts — Canarsie, Far Rockaway?" },
          { dept: 'INFRA', minLevel: 2, text: "They're doing real-time transit coordination with text messages. Give them the MTA's delay feed and they'd outperform the official system.", followUp: "Would it help if you had advance notice of service changes — before MTA posts them publicly?" },
        ],
        freeChoices: [
          { text: "300 people. How do you keep that organized?", depth: 2 },
          { text: "That network is exactly the kind of community asset we need to support.", depth: 1, solutionJump: true },
        ],
        insight: { category: 'ASSET', text: 'Bus rider mutual aid: 300-person text chain coordinating rides and shift coverage during transit failures. 3 years running.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // LOWER MANHATTAN — Priya Sharma, Climate Resilience Planner
  // Primary: INFRA. Sandy seawall gaps, FiDi flood vulnerability,
  // Con Ed substation risk behind INFRA check.
  // ═══════════════════════════════════════════════════════════════
  lowerman: {
    character: { name: 'Priya Sharma', role: 'Climate Resilience Planner, CB1', initials: 'PS' },
    exchanges: [
      {
        npc: "I've written three resilience plans for this district. Three. The first one was 2014, right after Sandy. Detailed, costed, shovel-ready. It's in a binder on a shelf at City Planning. The second one updated the surge models. Also on a shelf. The third one I didn't even bother printing.",
        interjections: [
          { dept: 'INFRA', minLevel: 1, text: "Three plans shelved in 12 years. That's not a planning failure — it's an implementation failure.", followUp: "What stopped the first plan from moving forward?" },
          { dept: 'INFRA', minLevel: 3, text: "Post-Sandy, updated surge models, and a third iteration. She has the most current resilience data in Lower Manhattan and nobody's using it.", followUp: "Are the surge models in the third plan still accurate, or has the data shifted again?" },
          { dept: 'SERVICES', minLevel: 2, text: "She stopped printing it. That's the sound of institutional knowledge giving up on institutions.", followUp: "Who needs to read these plans for something to actually happen?" },
        ],
        freeChoices: [
          { text: "What was in the first plan that should have been built by now?", depth: 1 },
          { text: "I want to read all three. Can you send them to my office?", depth: 2 },
        ],
        insight: { category: 'INFRA', text: 'Three resilience plans written since Sandy — none implemented. Surge models, cost estimates, engineering specs all exist.' },
      },
      {
        npc: "The seawall has gaps. Everybody knows about the big proposal — the $50 billion barrier. Nobody talks about the gaps that exist right now. Between the Battery Park esplanade and Pier 17, there are four sections where a 5-foot surge comes straight into the Financial District. The server farms in the FiDi basements flood at 3 feet.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "Basement server farms at 3ft flood threshold. That's not just property damage — that's data infrastructure for the financial sector.", followUp: "How many buildings have critical systems below the flood line?" },
          { dept: 'INFRA', minLevel: 3, text: "Four seawall gaps between Battery Park and Pier 17. She has the specific locations. This is the vulnerability map the Army Corps doesn't publish.", followUp: "Can you mark the four gaps on a map? Exact locations?" },
          { dept: 'SERVICES', minLevel: 1, text: "$50 billion barrier versus patching four gaps. The perfect is the enemy of the functional.", followUp: "What would it cost to close those four gaps temporarily? Deployable barriers?" },
        ],
        freeChoices: [
          { text: "Show me the gaps. Where exactly are they?", depth: 2 },
          { text: "We'll fast-track the seawall project.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'INFRA', difficulty: 12,
            pass: {
              insight: { category: 'INFRA', text: 'Con Ed substation at Fulton St is the real vulnerability — one flood takes out power for 40,000 residents. Seawall gaps at 4 specific points between Battery Park and Pier 17.' },
              npcReaction: "She leans forward. 'Everyone focuses on the water. The real risk is the Con Ed substation at Fulton. It flooded in Sandy — blew the transformer, 40,000 people lost power for 4 days. They rebuilt it in the same location. Same elevation. I put it in all three plans. Nobody moved it.'",
            },
            fail: {
              text: "She closes her laptop. 'Another mayor who nods and moves on. I'll be here when the next one comes through. And the one after that.'",
              trustInsight: "Resilience planners have been through multiple administrations. Promises without timelines are meaningless to them.",
            },
          },
        ],
        insight: { category: 'INFRA', text: 'Seawall gaps: 4 sections between Battery Park and Pier 17 where 5ft surge enters FiDi. Basement server farms flood at 3ft.' },
      },
      {
        npc: "There's a community resilience hub in Battery Park — existing space, generator, commercial kitchen, seats 500. It was a warming center after Sandy. It could be a full emergency operations hub for everything south of Chambers Street. It needs $40,000 to fit out. Forty thousand. I've been asking for two years.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "$40K to activate a 500-person emergency hub. That's less than the city spends on one block of temporary flood barriers.", followUp: "What specifically does the $40K cover?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "It was a warming center after Sandy — the community already knows it, already trusts it.", followUp: "Who runs the space now? Could they manage it during an emergency?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "500 capacity, generator, kitchen, community trust, and a resilience planner who's written the operational plan three times. This is the most deployment-ready asset in Lower Manhattan.", followUp: "If we funded the fit-out, how fast could it be operational?" },
        ],
        freeChoices: [
          { text: "What would the $40K get us? Break it down.", depth: 2 },
          { text: "That's a concrete ask. I want to make it happen.", depth: 1, solutionJump: true },
        ],
        insight: { category: 'ASSET', text: 'Battery Park Community Resilience Hub — 500 capacity, generator, kitchen. Needs $40K fit-out. Two years waiting.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSHWICK — Luz Mendoza, Promotora (Community Health Promoter)
  // Primary: SERVICES + COMMUNITY. Language barriers, undocumented
  // residents, promotora network behind SERVICES check.
  // ═══════════════════════════════════════════════════════════════
  bushwick: {
    character: { name: 'Luz Mendoza', role: 'Promotora (Community Health Promoter)', initials: 'LM' },
    exchanges: [
      {
        npc: "Sixty percent of my building doesn't speak English. When there's an emergency alert, it comes through in English. My neighbors show me their phones — they don't know if it's a weather warning or an Amber Alert. They can't tell the difference. So they ignore all of them.",
        interjections: [
          { dept: 'SERVICES', minLevel: 1, text: "Alerts ignored because they're incomprehensible. The system is producing noise, not safety.", followUp: "What languages would cover most of the residents in your building?" },
          { dept: 'SERVICES', minLevel: 3, text: "If 60% can't read alerts, the effective emergency communication rate in this neighborhood is below 40%. Every plan built on alert compliance is wrong.", followUp: "How do people actually find out about emergencies right now?" },
          { dept: 'HEALTH', minLevel: 1, text: "They ignore all alerts. That means evacuation orders too.", followUp: "During the last storm warning, how many people in your building knew to prepare?" },
        ],
        freeChoices: [
          { text: "When there's an emergency, what do people actually do?", depth: 1 },
          { text: "We're rolling out multilingual alert systems.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'SERVICES', text: 'Emergency alerts English-only — 60% of residents can\'t read them. All alerts ignored because none are understood.' },
      },
      {
        npc: "And the ones without papers — they won't call 311. They won't call 911. A woman on the third floor had chest pains for two days before her daughter told me. Two days. Because she thought if she went to the hospital, they'd find her. That's not paranoia. Her cousin was picked up at a hospital in Texas.",
        interjections: [
          { dept: 'HEALTH', minLevel: 2, text: "Two days of chest pain before seeking help. Fear of deportation is a medical access barrier that kills people.", followUp: "How many people in your buildings avoid medical care for this reason?" },
          { dept: 'SERVICES', minLevel: 2, text: "Won't call 311 or 911. The emergency system doesn't exist for undocumented residents. They're invisible to every safety net.", followUp: "Is there anyone they do call? A doctor, a clinic, a community organization?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "Her daughter told Luz — not the hospital, not 911. Luz is the emergency system for this building.", followUp: "How did you become the person people come to?" },
        ],
        freeChoices: [
          { text: "What happened to the woman with chest pains? Is she okay?", depth: 2 },
          { text: "We need to build trust with immigrant communities.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'SERVICES', difficulty: 12,
            pass: {
              insight: { category: 'ASSET', text: 'Promotora network: 8 bilingual community health workers covering 6 buildings, 340 residents, 47 children under 5. They know every family, every medication, every at-risk child.' },
              npcReaction: "She studies your face for a long time. Then she speaks quietly. 'There are eight of us. Promotoras. We cover six buildings — 340 people, 47 children under five. We know who's diabetic, who's pregnant, who has an expired inhaler. We are the system. But if I give you names and those names end up on a list — I will never be trusted again. And people will die.'",
            },
            fail: {
              text: "She goes quiet. 'I've told people like you before. The names ended up on a list.' She stands up. The conversation is over.",
              trustInsight: "Undocumented community data has been weaponized before. Promotoras will not share information unless the safety guarantee is personal and absolute.",
            },
          },
        ],
        insight: { category: 'HEALTH', text: 'Undocumented residents avoid 911/311 entirely — two-day delay on chest pain because of deportation fear.' },
      },
      {
        npc: "What I need is simple. Translated emergency materials — Spanish, Mandarin, Haitian Creole. A number people can call that isn't 911. And a promise — a real one, not a policy, a promise — that emergency services won't share information with immigration. You give me that, and I'll give you a network that covers six buildings in 20 minutes.",
        interjections: [
          { dept: 'SERVICES', minLevel: 2, text: "A non-911 emergency line. She's asking for a parallel system because the official one is a threat to her community.", followUp: "What if we set up a community health hotline that routes through the promotora network?" },
          { dept: 'COMMUNITY', minLevel: 2, text: "Six buildings in 20 minutes. That's faster than any city response. The network exists — it just needs protection.", followUp: "If we guaranteed a firewall between emergency services and immigration enforcement, would that be enough?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "She's not asking for resources. She's asking for a guarantee. The resource is the trust. Without it, the network stays invisible.", followUp: "What would a credible guarantee look like to you? An executive order? Something else?" },
        ],
        freeChoices: [
          { text: "What would a real promise look like? Not a policy — what would you actually believe?", depth: 2 },
          { text: "I'll make sure emergency services have a firewall from immigration.", depth: 1, solutionJump: true },
        ],
        insight: { category: 'ASSET', text: 'Promotora network can mobilize 6 buildings in 20 minutes — but only if immigration firewall is guaranteed personally by the mayor.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // DOWNTOWN BROOKLYN — Amir Hassan, Small Business Owner
  // Primary: SAFETY + INFRA. Arena traffic blocking emergency
  // access, merchant association as asset. Emergency access study
  // behind SAFETY check.
  // ═══════════════════════════════════════════════════════════════
  dtbk: {
    character: { name: 'Amir Hassan', role: 'Small Business Owner, Atlantic Ave', initials: 'AH' },
    exchanges: [
      {
        npc: "I've been on Atlantic Ave for 14 years. Every time there's a game at Barclays, my block turns into a parking lot. I'm not talking inconvenience — I'm talking gridlock. Double-parked cars, buses idling, Ubers stopping in the crosswalk. My evening customers can't get to the store. That's $1,200 a night I lose, 41 home games a year. You do the math.",
        interjections: [
          { dept: 'SAFETY', minLevel: 1, text: "$1,200 times 41 games — $49,000 a year in lost revenue for one shop. Multiply by 30 shops on the block.", followUp: "Have you organized the other merchants to document the losses?" },
          { dept: 'INFRA', minLevel: 1, text: "Double-parked, buses idling, crosswalk blocked. That's not a traffic pattern — that's an access failure.", followUp: "What does the traffic plan look like on game nights? Is there one?" },
          { dept: 'INFRA', minLevel: 3, text: "If civilian vehicles are gridlocked, emergency vehicles are gridlocked. This is a life-safety issue disguised as a business complaint.", followUp: "Have emergency vehicles been delayed on this block during events?" },
        ],
        freeChoices: [
          { text: "What does a game night look like from inside your store?", depth: 1 },
          { text: "We'll work with the arena on a traffic management plan.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'SAFETY', text: 'Arena events gridlock Atlantic Ave — $49K/year lost per merchant, 30 shops affected, access blocked for hours.' },
      },
      {
        npc: "Two months ago, a man had a cardiac arrest on the corner of Atlantic and Flatbush during a Nets game. The ambulance was three blocks away. It took eight minutes to get through. Eight minutes. You know what eight minutes means for a cardiac arrest? It means he's dead. He's not dead — he got lucky. But luck isn't a system.",
        interjections: [
          { dept: 'SAFETY', minLevel: 2, text: "Eight minutes added to cardiac arrest response. Survival rate drops 10% per minute after the first four. That's functionally fatal.", followUp: "Was this reported? Is there a record of the delay?" },
          { dept: 'SAFETY', minLevel: 3, text: "Arena traffic blocking emergency vehicle access. If one cardiac arrest almost died, how many calls were delayed that nobody reported?", followUp: "Have you filed a formal complaint about emergency access during events?" },
          { dept: 'HEALTH', minLevel: 1, text: "Eight minutes. That's outside the survivable window for most cardiac events.", followUp: "Is there a defibrillator on the block? In any of the shops?" },
        ],
        freeChoices: [
          { text: "Eight minutes. Walk me through what you saw.", depth: 2 },
          { text: "We'll require emergency vehicle corridors during arena events.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'SAFETY', difficulty: 11,
            pass: {
              insight: { category: 'SAFETY', text: 'Emergency access study: Atlantic/Flatbush choke point adds 6-8 min to response times during events. Alternate routes via Dean St and Bergen St, but both blocked by arena parking.' },
              npcReaction: "He reaches under the counter and pulls out a folder. 'I paid for this myself. $2,000 to a traffic engineer. Every choke point, every alternate route, every intersection where an ambulance gets stuck. Dean Street — blocked. Bergen — blocked. Pacific — one lane. I've been trying to give this to someone for six months.'",
            },
            fail: {
              text: "He shakes his head. 'Come back when you've sat in this traffic during a Nets game. Then tell me about your plan.'",
              trustInsight: "Small business owners judge officials by whether they've experienced the problem firsthand. Abstract solutions without site visits are dismissed.",
            },
          },
        ],
        insight: { category: 'SAFETY', text: 'Cardiac arrest response delayed 8 minutes by arena traffic — ambulance trapped 3 blocks away on Atlantic Ave.' },
      },
      {
        npc: "Here's what I actually want. Not a study. Not a task force. The merchants on this block — 30 of us — we all have generators, we all have shelf-stable inventory, and our customers trust us. During Sandy, people came to us, not the shelter on Schermerhorn. We sheltered 200 people in our shops. We can do it again. But the city doesn't even know we exist.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 1, text: "30 merchants with generators sheltering 200 people. The city's emergency plan doesn't include them.", followUp: "Which shops have the most capacity? Could we formalize this?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "Distributed shelter network — 30 locations, generators, supplies, local trust. This is more resilient than a single city shelter because it can't fail all at once.", followUp: "Would the merchants agree to be listed as emergency resource points if the city supplied materials?" },
          { dept: 'SAFETY', minLevel: 2, text: "They sheltered 200 during Sandy without being asked. Imagine what they could do with coordination and supplies.", followUp: "What supplies would make the biggest difference? Water, first aid, cots?" },
        ],
        freeChoices: [
          { text: "200 people during Sandy. How did that happen?", depth: 2 },
          { text: "We should integrate your merchant network into the emergency plan.", depth: 1, solutionJump: true },
        ],
        insight: { category: 'ASSET', text: 'Atlantic Ave Merchant Association — 30 shops with generators, shelf-stable inventory. Sheltered 200 during Sandy. Not in city emergency plan.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // UPPER EAST SIDE — Martin Calloway, Scaffolding Inspector (ret.)
  // Primary: SAFETY + INFRA. Construction scaffolding collapse risk,
  // blocked egress, Building Managers Association behind SAFETY check.
  // ═══════════════════════════════════════════════════════════════
  ues: {
    character: { name: 'Martin Calloway', role: 'Scaffolding Inspector (retired DOB)', initials: 'MC' },
    exchanges: [
      {
        npc: "Four hundred and twelve active scaffolding permits on the Upper East Side. I counted. Some of those sheds have been up since 2016. Sidewalk sheds aren't temporary — they're permanent infrastructure nobody budgeted for.",
        interjections: [
          { dept: 'SAFETY', minLevel: 1, text: "412 active permits. That's not maintenance — that's a parallel streetscape.", followUp: "How many of those permits have actually been inspected in the last year?" },
          { dept: 'SAFETY', minLevel: 3, text: "Sheds up since 2016 — 8 years. Steel fatigues. Bolts corrode. The longer they stay, the more dangerous they get.", followUp: "Is anyone tracking structural integrity on the long-term sheds?" },
          { dept: 'INFRA', minLevel: 2, text: "Sidewalk sheds block emergency egress. Narrow the sidewalk to 4 feet. One collapse during rush hour is a mass casualty event.", followUp: "Have any of these sheds been cited for obstructing emergency access?" },
        ],
        freeChoices: [
          { text: "You counted. Walk me through what you're seeing out there.", depth: 1 },
          { text: "We'll get DOB to crack down on expired permits.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'SAFETY', text: '412 active scaffolding permits on UES — some up 8 years, no structural re-inspection, emergency egress obstructed.' },
      },
      {
        npc: "I spent 30 years at Buildings. I know what a bad weld looks like from across the street. Three of those sheds — I can give you the addresses — are rated imminent hazard in the system. DOB hasn't acted. You know why? Paperwork backlog. Hazard sits in a queue like a parking ticket.",
        interjections: [
          { dept: 'SAFETY', minLevel: 2, text: "Imminent hazard ratings sitting in a queue. The system flagged the danger and then did nothing.", followUp: "How long have those hazard ratings been pending?" },
          { dept: 'SAFETY', minLevel: 3, text: "He can read welds from the sidewalk. 30 years of pattern recognition. He's a human inspection instrument.", followUp: "Would you be willing to walk the worst blocks with our team?" },
          { dept: 'INFRA', minLevel: 1, text: "Paperwork backlog on life-safety hazards. That's an organizational failure, not a resource problem.", followUp: "Is the backlog a staffing issue or a process issue?" },
        ],
        freeChoices: [
          { text: "Three sheds rated imminent hazard. What happens in a 50-mile-an-hour wind?", depth: 2 },
          { text: "Give me the addresses. I'll escalate today.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'SAFETY', difficulty: 11,
            pass: {
              insight: { category: 'SAFETY', text: '3 scaffolds rated imminent hazard — 78th & Lex (8 years up), 83rd & 2nd (corroded base plates), 91st & 3rd (missing cross-bracing). 50mph wind = collapse risk onto pedestrian traffic.' },
              npcReaction: "'78th and Lex — base plates rusted through, been up since 2016. 83rd and 2nd — the contractor walked off the job, nobody de-rigged. 91st and 3rd — missing cross-bracing, I filed the report myself. It's still in the queue. You want to do something? Pull those three permits tomorrow.'",
            },
            fail: {
              text: "He looks at you over his glasses. 'You know how many mayors I've briefed? They all nod. They all say they'll look into it. The sheds are still up. Come back when you've pulled a permit.'",
              trustInsight: "Retired DOB inspectors have briefed multiple administrations with no follow-through. Action on specific permits is the only credible signal.",
            },
          },
        ],
        insight: { category: 'INFRA', text: 'DOB imminent hazard ratings sitting in paperwork backlog — life-safety flags treated as administrative tasks.' },
      },
      {
        npc: "I still talk to 40 building supers on the east side. The Building Managers Association. Every one of them has master key access to their building. During Sandy, they checked every floor — 200 buildings in one night. Nobody asked them to. They just did it.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 1, text: "40 supers with master keys. That's building-by-building access no city agency has.", followUp: "Are they organized enough to activate on short notice?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "200 buildings checked in one night, self-organized. That's a search-and-welfare operation without a single city dollar.", followUp: "Could this network be formalized as a first-response tier?" },
          { dept: 'SAFETY', minLevel: 2, text: "Master key access during emergencies — they can reach people FDNY would need a warrant or a battering ram for.", followUp: "Do they coordinate with the local firehouse?" },
        ],
        freeChoices: [
          { text: "Two hundred buildings in one night. How did they coordinate?", depth: 2 },
          { text: "That's the kind of network we need to support.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Building Managers Association — 40 supers, master key access, checked 200 buildings during Sandy. Self-organized, no city support.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // RIVERDALE — Helen Park, Flood Insurance Agent
  // Primary: HOUSING + INFRA. Flood zone reclassification denial,
  // uninsured co-ops, flood preparedness network behind HOUSING check.
  // ═══════════════════════════════════════════════════════════════
  riverdale: {
    character: { name: 'Helen Park', role: 'Flood Insurance Agent, Broadway', initials: 'HP' },
    exchanges: [
      {
        npc: "I sell flood insurance for a living. Or I try to. Half the co-op boards in Riverdale dropped their policies after FEMA redrew the maps and premiums tripled. They think if they don't pay for insurance, the flood won't come. That's $340 million in property with zero coverage.",
        interjections: [
          { dept: 'HOUSING', minLevel: 1, text: "$340 million uninsured. One flood event and those co-ops are financially destroyed.", followUp: "How many buildings are we talking about?" },
          { dept: 'HOUSING', minLevel: 3, text: "Co-op boards dropping flood insurance is a collective action failure. Each board thinks they're saving money. Together they're creating a catastrophe.", followUp: "Have any of these boards seen the updated FEMA flood projections?" },
          { dept: 'INFRA', minLevel: 2, text: "Harlem River flood plain, tripled premiums, mass policy cancellation. This is a slow-motion disaster with a known timeline.", followUp: "When was the last time this area actually flooded?" },
        ],
        freeChoices: [
          { text: "Three hundred forty million. Break that down for me.", depth: 2 },
          { text: "We'll look into a city-backed flood insurance pool.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'HOUSING', text: '$340M in Riverdale co-op property with zero flood coverage — boards dropped policies after FEMA reclassification.' },
      },
      {
        npc: "I've sat in 12 co-op board meetings this year trying to explain the risk. They look at me like I'm trying to sell them something. I am — I'm trying to sell them survival. The Harlem River crested 6 feet during Ida. Their parking garages are at 4 feet. Do the math.",
        interjections: [
          { dept: 'HOUSING', minLevel: 2, text: "River crested at 6, garages at 4. Two feet of water in every underground garage. Electrical, boilers, storage — all destroyed.", followUp: "How many of those 12 buildings have critical systems below grade?" },
          { dept: 'HOUSING', minLevel: 3, text: "She's been to 12 boards. She has the data, the relationships, the trust. She's the only person these boards will listen to.", followUp: "Would any of those boards reconsider if the city subsidized premiums?" },
          { dept: 'INFRA', minLevel: 1, text: "Underground parking garages as flood vulnerability. Boilers, electrical panels, transformers — all below the flood line.", followUp: "What happens to the buildings above when the basement floods?" },
        ],
        freeChoices: [
          { text: "You've been to 12 board meetings. What do they say when you show them the numbers?", depth: 2 },
          { text: "We need to mandate flood insurance in the flood zone.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'HOUSING', difficulty: 10,
            pass: {
              insight: { category: 'HOUSING', text: '12 co-ops near Harlem River — $340M in property, zero flood coverage. Underground systems at 4ft, river crested 6ft during Ida. One nor\'easter floods 200+ units.' },
              npcReaction: "'Here.' She opens a spreadsheet on her phone. 'Building by building. Address, units, assessed value, flood elevation, insurance status. Twelve buildings, 200 units, $340 million. Every single one of them — zero flood coverage. I've been carrying this around for a year waiting for someone to care.'",
            },
            fail: {
              text: "She sighs. 'Everyone wants to hear the flood risk is overstated. It's not. The river doesn't care about your opinion. I'll be here when the water comes, writing checks I tried to prevent.'",
              trustInsight: "Insurance professionals in flood zones are exhausted by denial. They have precise data but no authority to compel action.",
            },
          },
        ],
        insight: { category: 'INFRA', text: 'Harlem River crested 6ft during Ida — co-op garages at 4ft elevation. Boilers, electrical, storage all below flood line.' },
      },
      {
        npc: "I organized those 12 boards into a flood preparedness network. Emergency plans, sandbag inventory, resident notification trees. It's not insurance, but at least when the water comes, people will know to move their cars and shut off the gas. That's the difference between property damage and people dying.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 1, text: "She built a preparedness network out of her sales calls. That's an asset disguised as a day job.", followUp: "How does the notification tree work? Phone calls? Group text?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "12 co-op boards coordinating on emergency plans. That's a neighborhood-scale response network built by one insurance agent.", followUp: "Could this model extend to the other co-ops along the river?" },
          { dept: 'SAFETY', minLevel: 2, text: "Shut off the gas — she's preventing the secondary disaster. Floods plus gas leaks equals explosions.", followUp: "Do all 12 buildings have gas shutoff training for residents?" },
        ],
        freeChoices: [
          { text: "You built this yourself. What do you need to make it stronger?", depth: 2 },
          { text: "The city should be scaling this across every flood zone.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Flood preparedness network — 12 co-op boards organized by one agent. Emergency plans, sandbag inventory, notification trees. Covers 200+ units along Harlem River.' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // LONG ISLAND CITY — Derek Osei, Union Electrician, IBEW Local 3
  // Primary: INFRA + SAFETY. Luxury towers with no backup power,
  // elevator-dependent seniors, IBEW restoration team behind check.
  // ═══════════════════════════════════════════════════════════════
  lic: {
    character: { name: 'Derek Osei', role: 'Union Electrician, IBEW Local 3', initials: 'DO' },
    exchanges: [
      {
        npc: "You see those glass towers on the waterfront? Beautiful, right? Forty stories, floor-to-ceiling windows, $4,000 a month. No backup power. Not a single one. The developers lobbied out the generator requirement in 2015 and nobody put it back.",
        interjections: [
          { dept: 'INFRA', minLevel: 1, text: "No backup power in 40-story residential towers. That's not a design choice — it's a liability.", followUp: "How many towers are we talking about?" },
          { dept: 'INFRA', minLevel: 3, text: "Lobbied out the requirement. That means someone at Buildings signed off on a code variance for luxury housing that's more vulnerable than public housing. Find that variance.", followUp: "Is the code variance on file? Can it be reversed?" },
          { dept: 'HOUSING', minLevel: 2, text: "$4,000/month and no generator. The tenants don't know. They assume the building is built to code — and technically, it is.", followUp: "Do the residents know there's no backup power?" },
        ],
        freeChoices: [
          { text: "Lobbied out the requirement. How does that happen?", depth: 2 },
          { text: "We'll mandate backup power for high-rises.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'INFRA', text: 'LIC waterfront towers — no backup power by design. Generator requirement lobbied out in 2015. 15,000 residents in glass towers that become vertical freezers during blackouts.' },
      },
      {
        npc: "Three towers on Center Blvd — no transfer switch, no generator hookup, nothing. 8,000 people. Seniors above floor 30 who can't take the stairs. When the grid goes down, the elevators stop. Those people are trapped in the sky with no heat, no water pumps, no way down.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "No transfer switch means you can't even plug in a portable generator. The building literally cannot accept emergency power.", followUp: "What would it cost to retrofit a transfer switch in each tower?" },
          { dept: 'INFRA', minLevel: 3, text: "No water pumps above floor 6 without power. 8,000 people with no water, no toilets, no elevators. This is vertical Katrina.", followUp: "How long before a high-rise without water pumps becomes uninhabitable?" },
          { dept: 'HEALTH', minLevel: 1, text: "Seniors above floor 30. Elevator-dependent. During a blackout, they can't evacuate and nobody can reach them.", followUp: "Has anyone mapped which floors have elderly or mobility-limited residents?" },
        ],
        freeChoices: [
          { text: "8,000 people, no transfer switch. What does a blackout actually look like in those buildings?", depth: 2 },
          { text: "We'll get emergency generators pre-positioned on the waterfront.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'INFRA', difficulty: 11,
            pass: {
              insight: { category: 'INFRA', text: '3 towers on Center Blvd — no transfer switch, 8,000 residents, elevator-dependent seniors above floor 30. No water pumps without power. Buildings cannot accept emergency generators without retrofit.' },
              npcReaction: "'I'll give you the addresses. Tower 1 — 46 floors, 312 units, zero backup. Tower 2 — 40 floors, 280 units, same. Tower 3 — 38 floors, built last, still no switch. I pulled the electrical plans. The developers saved $180K per building. That's what 8,000 people's safety was worth to them.'",
            },
            fail: {
              text: "He looks at your shoes. 'You're not the first suit to tour the waterfront. The last one took photos for a press release about resilient infrastructure. The buildings still don't have transfer switches.'",
              trustInsight: "Waterfront development tours are a recognized pattern — officials visit, photograph, announce nothing. Electricians judge by technical specificity.",
            },
          },
        ],
        insight: { category: 'SAFETY', text: 'Center Blvd towers: elevator-dependent seniors above floor 30, no water pumps without power, no way to accept emergency generators.' },
      },
      {
        npc: "My local — IBEW Local 3 — we have 20 guys who can restore building power in hours, not days. We did it after Sandy for free. Ran cable, bypassed blown panels, got elevators running while Con Ed was still doing damage assessment. We'll do it again. But we need $12,000 in parts pre-staged. Transfer switches, cable, breakers. That's it. Twelve grand.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "$12K in pre-staged parts for 20 electricians. That's the cheapest rapid-response infrastructure investment in the city.", followUp: "Where would you stage the parts? Do you have a space?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "They did it after Sandy for free. Union solidarity as emergency response. This is an asset.", followUp: "Would the local formalize this as an emergency activation agreement?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "20 licensed electricians, volunteer deployment, hours not days. This is faster than any city contract could mobilize.", followUp: "What's your activation protocol? How fast can you get 20 guys on site?" },
        ],
        freeChoices: [
          { text: "Twelve thousand dollars. Tell me exactly what that buys.", depth: 2 },
          { text: "Union partnerships are something we want to build on.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'IBEW Local 3 emergency restoration team — 20 electricians, restore building power in hours. Need $12K in pre-staged parts (transfer switches, cable, breakers).' },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MID-ISLAND (Staten Island) — Frank DiNapoli, DSNY Supervisor (ret.)
  // Primary: INFRA + COMMUNITY. Plow routes outdated since 2008,
  // ghost streets, retired workers network behind INFRA check.
  // ═══════════════════════════════════════════════════════════════
  midisland: {
    character: { name: 'Frank DiNapoli', role: 'DSNY Sanitation Supervisor (retired)', initials: 'FD' },
    exchanges: [
      {
        npc: "Nobody remembers Staten Island until someone dies. The 2010 blizzard — two people died on unplowed streets over here. You know what the mayor said? 'We'll review the plow routes.' That was 16 years ago. Same routes.",
        interjections: [
          { dept: 'INFRA', minLevel: 1, text: "Plow routes unchanged since before 2010. Two fatalities. No update.", followUp: "When were the current routes last officially reviewed?" },
          { dept: 'INFRA', minLevel: 3, text: "16 years, two deaths, same routes. This isn't neglect — it's institutional memory failure. The people who knew the routes retired. The routes stayed on paper.", followUp: "Who maintains the route maps now? Is it still done at the borough level?" },
          { dept: 'COMMUNITY', minLevel: 1, text: "'Nobody remembers Staten Island.' He's not wrong. The borough gets the least of everything — last plowed, last salted, first forgotten.", followUp: "What else gets forgotten out here besides plowing?" },
        ],
        freeChoices: [
          { text: "Two people died. Tell me what happened.", depth: 2 },
          { text: "We're committed to equitable service across all five boroughs.", depth: 0, solutionJump: true },
        ],
        insight: { category: 'INFRA', text: 'Staten Island plow routes unchanged since 2008 — two 2010 blizzard fatalities, no route review despite rezoning.' },
      },
      {
        npc: "Three streets got added by rezoning since 2008. Residential. Families. Kids waiting for school buses. None of them are on any plow route. I reported it when I was still on the job. Filed the form, CC'd the borough chief. Nothing. The form is probably in a drawer somewhere on West 57th.",
        interjections: [
          { dept: 'INFRA', minLevel: 2, text: "Rezoned streets not added to plow routes. The planning department and sanitation don't talk to each other.", followUp: "Is this a known gap — rezoning triggers new streets but doesn't update service maps?" },
          { dept: 'INFRA', minLevel: 3, text: "He filed the report internally and it went nowhere. The institutional channel failed. That's why he's talking to you on a sidewalk instead.", followUp: "Do you still have a copy of that report?" },
          { dept: 'SAFETY', minLevel: 1, text: "Kids waiting for school buses on unplowed streets. Black ice, no salt, no plow. One bus slides and it's a headline.", followUp: "Have there been any accidents on those streets during storms?" },
        ],
        freeChoices: [
          { text: "Three streets with families, no plow. Give me the names.", depth: 2 },
          { text: "I'll get sanitation to update the route maps.", depth: 0, solutionJump: true },
        ],
        checks: [
          {
            dept: 'INFRA', difficulty: 10,
            pass: {
              insight: { category: 'INFRA', text: '3 unplowed streets: Wilding Ave, Rustic Pl, and Mace Ct — added by rezoning, not on any route map. Salt tonnage 40% below need. Borough salt dome 2 miles from worst hills on Richmond Ave.' },
              npcReaction: "'Wilding Ave, Rustic Place, Mace Court. All three rezoned residential after 2008. Families, driveways, kids. Zero plowing, zero salt. And the salt dome on Muldoon Ave is 2 miles from the Richmond Ave hills — the steepest grade on the island. By the time a truck gets there loaded, the hill's already a skating rink. Forty percent under-salted, every storm.'",
            },
            fail: {
              text: "He folds his arms. 'Come back when you've actually driven a plow. You don't know what 40 tons of salt looks like, and you don't know what a hill looks like at 4 AM with black ice. I do. Thirty-five years.'",
              trustInsight: "Retired sanitation workers test for operational knowledge. Abstract promises about updating routes are meaningless without demonstrated understanding of tonnage and terrain.",
            },
          },
        ],
        insight: { category: 'SAFETY', text: 'Rezoned residential streets with no plow service — children waiting for buses on un-salted roads during storms.' },
      },
      {
        npc: "After that blizzard, 15 of us — all retired DSNY, all CDL-licensed — we organized ourselves. Personal trucks with plows, salt spreaders we bought ourselves. We cleared those three streets and six others the city missed. Nobody paid us. Nobody asked us. We just did it because two people died and that's not acceptable.",
        interjections: [
          { dept: 'COMMUNITY', minLevel: 1, text: "15 CDL drivers with personal plows. Self-funded, self-organized. This is a deployable asset.", followUp: "How fast can you mobilize when a storm hits?" },
          { dept: 'COMMUNITY', minLevel: 3, text: "They bought their own equipment after city failure killed two people. That's the purest form of civic response — and the strongest indictment of the system.", followUp: "What would it take to formalize this? Fuel reimbursement? Insurance?" },
          { dept: 'INFRA', minLevel: 2, text: "Personal equipment — plows, spreaders. If the city insured and fueled them, you'd have an instant supplemental plow fleet for Staten Island.", followUp: "What's the maintenance cost on your equipment? Who pays for salt?" },
        ],
        freeChoices: [
          { text: "You bought your own plows. What does that cost out of pocket?", depth: 2 },
          { text: "The city should be compensating people like you.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Retired DSNY workers network — 15 CDL-licensed drivers with personal plows and salt spreaders. Self-organized after 2010 blizzard. Clear streets the city misses.' },
      },
    ],
  },
};
