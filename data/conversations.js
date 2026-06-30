// data/conversations.js — NPC conversation scripts for 11 districts
// Each district: character info + exchanges (NPC text, player choices, insights)

export const CONVERSATIONS = {
  southbronx: {
    character: { name: 'Maria Delgado', role: 'Tenant Organizer', initials: 'MD' },
    exchanges: [
      {
        npc: "You actually came. Most people from City Hall don't make it past the expressway.",
        choices: [
          { text: "I want to understand what's happening here firsthand.", depth: 2 },
          { text: "What's the biggest issue right now?", depth: 1 },
          { text: "We're committed to all five boroughs.", depth: 0 },
        ],
      },
      {
        npc: "The air. My kids can't play outside half the year. Asthma rates here are three times the city average. And the heat \u2014 landlords won't fix the boilers, but they also won't install AC.",
        choices: [
          { text: "Tell me about the heat situation specifically.", depth: 2 },
          { text: "Have you reported the landlords to code enforcement?", depth: 1 },
          { text: "That's unacceptable. We'll look into it.", depth: 0 },
        ],
        insight: { category: 'HEALTH', text: 'Asthma corridor near Bruckner Expressway \u2014 3x city average' },
      },
      {
        npc: "Code enforcement? Please. We've filed 40 complaints. Nothing. But here's what I need you to understand \u2014 when the heat hits, it's the seniors who die. Mrs. Gutierrez on the 4th floor, she's 82, no AC, no family nearby. We check on her, but we can't be everywhere.",
        choices: [
          { text: "Who else in the building is vulnerable like her?", depth: 2 },
          { text: "What would actually help if a heatwave came?", depth: 2 },
          { text: "We'll send someone to check on vulnerable residents.", depth: 1 },
        ],
        insight: { category: 'HOUSING', text: 'Isolated seniors in rent-stabilized buildings \u2014 no AC, no emergency contacts' },
      },
      {
        npc: "The corner pharmacy on 138th has a backup generator. They store insulin for half the block. If you gave us three more generators \u2014 one for the pharmacy, one for the community center, one for the church \u2014 we could run this block ourselves. We don't need your shelters. We need tools.",
        choices: [
          { text: "That's exactly the kind of local knowledge we need. Thank you.", depth: 2 },
          { text: "I'll look into the generator program.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Pharmacy at 138th has generator \u2014 stores insulin; community can self-organize with 3 more' },
      },
    ],
  },
  harlem: {
    character: { name: 'James Washington', role: 'Block Association President', initials: 'JW' },
    exchanges: [
      {
        npc: "Mayor. I've been running this block association for 22 years. Nobody from downtown has visited since Sandy.",
        choices: [
          { text: "That changes today. What should I know about this neighborhood?", depth: 2 },
          { text: "What happened during Sandy here?", depth: 1 },
          { text: "We're increasing community engagement citywide.", depth: 0 },
        ],
      },
      {
        npc: "During Sandy, we lost power for 9 days. Ninth floor walk-ups, no elevator. I carried water up to Mrs. Chen every morning. The city sent generators \u2014 to Lower Manhattan. We got a text message.",
        choices: [
          { text: "Who in the building can't get out on their own?", depth: 2 },
          { text: "That's a failure of resource allocation. I'm sorry.", depth: 1 },
        ],
        insight: { category: 'INFRA', text: 'High-rise walk-ups during blackouts \u2014 elevator-dependent residents trapped above 6th floor' },
      },
      {
        npc: "I keep a list. 14 people in this building alone who can't do stairs. I've got a retired nurse on the third floor, two EMTs in the next building over. We have the people. We just need the city to actually know we exist.",
        choices: [
          { text: "Can I see that list? We should integrate it into our emergency planning.", depth: 2 },
          { text: "The fact that you have this organized already is remarkable.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Block association maintains vulnerable-resident registry \u2014 14 mobility-limited, medical volunteers available' },
      },
    ],
  },
  midtown: {
    character: { name: 'Diane Kowalski', role: 'Building Manager, Midtown Tower', initials: 'DK' },
    exchanges: [
      {
        npc: "I manage 800 units. Half my tenants are office workers who disappear at 5pm. The other half are elderly residents who've been here since the 70s. When something goes wrong, it's the second group that's in trouble.",
        choices: [
          { text: "What does 'goes wrong' look like in a building this size?", depth: 2 },
          { text: "How many elderly residents are we talking about?", depth: 1 },
          { text: "We're looking at emergency plans for all large buildings.", depth: 0 },
        ],
      },
      {
        npc: "Last winter the boiler failed for 3 days. I had 60 units with no heat, 23 of them over 75 years old. I called 311 fourteen times. They sent an inspector on day 4 \u2014 after I'd already fixed it myself by calling in a favor from a contractor.",
        choices: [
          { text: "What would you need to handle that faster next time?", depth: 2 },
          { text: "311 response times are something we're looking at.", depth: 1 },
        ],
        insight: { category: 'SERVICES', text: '311 response failure in large residential buildings \u2014 3-day heat outage, 23 elderly units affected' },
      },
    ],
  },
  fordham: {
    character: { name: 'Ramon Vega', role: 'Retired MTA Mechanic', initials: 'RV' },
    exchanges: [
      {
        npc: "Forty years I rode the Bx12 to work. Now they cut it to every 45 minutes. My grandson takes two buses to get to school. You know what that does to a kid's day?",
        choices: [
          { text: "Walk me through his commute. What does that look like?", depth: 2 },
          { text: "When did the cuts start?", depth: 1 },
          { text: "We're looking at restoring service citywide.", depth: 0 },
        ],
        insight: { category: 'INFRA', text: 'Bx12 bus cuts — 45min headways, children missing school, seniors stranded' },
      },
      {
        npc: "When the power went out last July, we had no way to get people to cooling centers. The bus wasn't running. My neighbor — diabetic, 74 — sat in a dark apartment for 16 hours. I carried ice up five flights.",
        choices: [
          { text: "What would it take to get people to cooling centers without the bus?", depth: 2 },
          { text: "Is there a community van or shuttle that could help?", depth: 2 },
          { text: "We need to fix the grid so that doesn't happen.", depth: 0 },
        ],
        insight: { category: 'ASSET', text: 'Transit-dependent seniors can\u2019t reach cooling centers during blackouts — need local shuttle network' },
      },
      {
        npc: "The VFW hall on Jerome Ave has a backup generator and AC. It holds 200 people. Nobody from the city has ever asked us to use it. We offered after Sandy. Nobody called back.",
        choices: [
          { text: "Can I see the space? We should register it as an emergency resource.", depth: 2 },
          { text: "That's exactly what we need. I'll connect you with emergency management.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'VFW hall on Jerome Ave — generator, AC, 200-person capacity, offered after Sandy, never contacted' },
      },
    ],
  },
  astoria: {
    character: { name: 'Yuki Tanaka', role: 'Community Health Worker', initials: 'YT' },
    exchanges: [
      {
        npc: "I do home visits for elderly residents. Thirty-seven on my roster. When I tell you I know every creak in every staircase in this neighborhood — I mean it.",
        choices: [
          { text: "Thirty-seven people. How many of them could evacuate on their own?", depth: 2 },
          { text: "What's your biggest worry going into summer?", depth: 1 },
          { text: "That kind of dedication is what makes this city work.", depth: 0 },
        ],
      },
      {
        npc: "Eleven of them can't do stairs. Eight are on oxygen. Mrs. Papadopoulos hasn't left her apartment in two years — she weighs 90 pounds and lives on the sixth floor. When the elevator goes, she's trapped.",
        choices: [
          { text: "Do you have a list with addresses and medical conditions?", depth: 2 },
          { text: "What happens during a power outage? Who checks on them?", depth: 1 },
        ],
        insight: { category: 'HEALTH', text: '11 homebound residents can\u2019t evacuate — 8 on oxygen, elevator-dependent, no emergency contact system' },
      },
      {
        npc: "I check on them. Me. One person. If it's a citywide emergency, I can't get to all 37 in a day. Give me three more health workers and a radio, and we cover this whole zip code. That's a $180,000 ask. You spent $800 million on that housing thing.",
        choices: [
          { text: "That's a concrete proposal. Can you write it up for me?", depth: 2 },
          { text: "We need to scale programs like yours across the city.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Health worker network — 1 person covers 37 homebound residents; 3 more + radios covers full zip code for $180K' },
      },
    ],
  },
  jackson: {
    character: { name: 'Fatima Al-Rashid', role: 'Bodega Owner, Roosevelt Ave', initials: 'FA' },
    exchanges: [
      {
        npc: "You speak Spanish? No? Bengali? Urdu? This block has 14 languages. When the city sends emergency alerts, they come in English. Half my customers can't read them.",
        choices: [
          { text: "What languages would cover most people on this block?", depth: 2 },
          { text: "How do people get emergency information now?", depth: 1 },
          { text: "We're working on multilingual outreach.", depth: 0 },
        ],
        insight: { category: 'SERVICES', text: 'Emergency alerts English-only — 14 languages on one block, residents rely on word-of-mouth' },
      },
      {
        npc: "They come to me. I'm the one who tells them school is closed, or the subway is down, or there's a boil-water advisory. My bodega is the emergency broadcast system for Roosevelt Ave. I don't mind, but I shouldn't be the only one.",
        choices: [
          { text: "Could your bodega be an official information hub? We'd supply materials in every language.", depth: 2 },
          { text: "Are there other businesses that serve this role?", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Bodega network as informal emergency broadcast — Roosevelt Ave has 6 shops that could be official info hubs' },
      },
      {
        npc: "The basement apartments — there are maybe 200 on this block alone. Illegal, sure. But people live there. When it floods, those are death traps. The city pretends they don't exist. But I know every single one.",
        choices: [
          { text: "Would residents trust you to share that information with us for evacuation planning?", depth: 2 },
          { text: "How deep does the flooding get?", depth: 1 },
        ],
        insight: { category: 'HOUSING', text: '~200 illegal basement apartments on one block — flood death traps, residents fear deportation if reported' },
      },
    ],
  },
  williamsburg: {
    character: { name: 'Sasha Okonkwo', role: 'Mutual Aid Coordinator', initials: 'SO' },
    exchanges: [
      {
        npc: "We've been running a mutual aid network since COVID. 400 members. We do grocery delivery, medication runs, wellness checks. We don't wait for the city.",
        choices: [
          { text: "That's incredible infrastructure. How is it organized?", depth: 2 },
          { text: "What would make your network more resilient during a major crisis?", depth: 1 },
          { text: "The city should be supporting networks like yours.", depth: 0 },
        ],
        insight: { category: 'ASSET', text: 'Mutual aid network — 400 members, organized block-by-block, runs grocery/meds/wellness since COVID' },
      },
      {
        npc: "Organized by block captain. Each captain knows every unit in their building. Who's elderly. Who has kids. Who speaks what. During Sandy, we evacuated 60 people in 3 hours because we already knew who needed help. FEMA took 3 days.",
        choices: [
          { text: "Could this model be replicated in other neighborhoods?", depth: 2 },
          { text: "What did FEMA get wrong that you got right?", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Block captain model — 60 evacuations in 3 hours during Sandy, vs FEMA 3 days. Replicable structure.' },
      },
      {
        npc: "What we need: the city to actually share information with us. Evacuation routes. Shelter locations. Hospital capacity. We have the people. You have the data. Right now neither side talks to the other.",
        choices: [
          { text: "What if we created a direct data-sharing channel between your network and emergency management?", depth: 2 },
          { text: "I hear you. The silos need to break down.", depth: 1 },
        ],
        insight: { category: 'INFRA', text: 'Mutual aid needs city data access — evacuation routes, shelter capacity, hospital status. Two-way channel.' },
      },
    ],
  },
  crown: {
    character: { name: 'Pastor David Williams', role: 'Greater Faith Church', initials: 'DW' },
    exchanges: [
      {
        npc: "My church seats 300. We have a kitchen, a generator, and 40 volunteers on call. During the last blackout, we fed 200 people. The city didn't know we existed.",
        choices: [
          { text: "Can I see the facility? We should get it into the emergency resource registry.", depth: 2 },
          { text: "How long can your generator run?", depth: 1 },
          { text: "Faith communities are essential partners in emergency response.", depth: 0 },
        ],
        insight: { category: 'ASSET', text: 'Greater Faith Church — 300 seats, kitchen, generator, 40 volunteers. Fed 200 during last blackout. Not in city registry.' },
      },
      {
        npc: "The shootings are what people talk about, but the real danger is the quiet stuff. Diabetics who can't afford insulin. Kids with asthma using expired inhalers. When the pharmacy on Crown Street closed, people lost their supply chain. Nobody reported that as a crisis.",
        choices: [
          { text: "Where do people get medication now?", depth: 2 },
          { text: "The pharmacy closure — when did that happen?", depth: 1 },
        ],
        insight: { category: 'HEALTH', text: 'Pharmacy desert — Crown St pharmacy closed, nearest is 20min by bus. Insulin and inhaler supply chain broken.' },
      },
      {
        npc: "If a hurricane hits and the power goes, my congregation will come here. But the ones who don't come to church — the ones who stay home, who don't trust institutions — those are the people who die. I know 30 of them by name.",
        choices: [
          { text: "Would those 30 people trust you to share their information for evacuation planning?", depth: 2 },
          { text: "That's the gap — the people who don't come to you.", depth: 1 },
        ],
        insight: { category: 'SAFETY', text: '30 institution-distrustful residents known by name — won\u2019t go to shelters, need door-to-door outreach during crisis' },
      },
    ],
  },
  flushing: {
    character: { name: 'Wei Chen', role: 'Pharmacy Owner, Main Street', initials: 'WC' },
    exchanges: [
      {
        npc: "I fill 400 prescriptions a day. Sixty percent of my customers don't speak English. When the power goes out, my refrigerated medications have 4 hours before they're destroyed. $200,000 worth of insulin, biologics, vaccines. Gone.",
        choices: [
          { text: "What would it take to keep your refrigeration running during an outage?", depth: 2 },
          { text: "How many people depend on your refrigerated medications?", depth: 1 },
          { text: "We need to address pharmaceutical supply chain resilience.", depth: 0 },
        ],
        insight: { category: 'HEALTH', text: 'Single pharmacy serves 400/day — $200K in temperature-sensitive meds, 4hr backup before total loss' },
      },
      {
        npc: "A generator. One generator. $8,000. I've asked the SBA, FEMA, the city health department. Everyone says it's someone else's problem. Meanwhile I'm the only pharmacy between Main Street and Northern Boulevard serving this community.",
        choices: [
          { text: "If we supplied the generator, could you also serve as a medication distribution point during emergencies?", depth: 2 },
          { text: "What other pharmacies are in this situation?", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'Pharmacy can be emergency med distribution hub — needs $8K generator, willing to serve as community resource' },
      },
    ],
  },
  bayridge: {
    character: { name: 'Tommy Ferraro', role: 'Retired FDNY Captain', initials: 'TF' },
    exchanges: [
      {
        npc: "I was at Engine 241 for 28 years. I know every hydrant, every dead-end, every building with a bad standpipe in this neighborhood. You know what I do now? I argue with my landlord about the boiler.",
        choices: [
          { text: "What do you see that the current fire department might be missing?", depth: 2 },
          { text: "What's the biggest vulnerability in Bay Ridge right now?", depth: 1 },
          { text: "Your experience is invaluable to emergency planning.", depth: 0 },
        ],
      },
      {
        npc: "The seawall. Everyone talks about Red Hook and the Rockaways. But the Belt Parkway floods at Shore Road every nor'easter. When that floods, you cut off the entire southern tip. No ambulances in or out. I've seen it three times.",
        choices: [
          { text: "Where exactly does the flooding cut off access? Can you show me on a map?", depth: 2 },
          { text: "Has anyone documented these flood events?", depth: 1 },
        ],
        insight: { category: 'INFRA', text: 'Belt Parkway floods at Shore Road during nor\u2019easters — cuts off ambulance access to southern Bay Ridge' },
      },
      {
        npc: "I organized a CERT team — 15 retired first responders, all living within 10 blocks. We do our own drills. We have our own radios. If the big one hits, we're ready before the city even finishes its conference call.",
        choices: [
          { text: "Can we integrate your CERT team into the official response plan? Give you direct comms with OEM?", depth: 2 },
          { text: "That's exactly the kind of community readiness we need.", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'CERT team — 15 retired first responders with radios and drills. Ready to deploy before official response.' },
      },
    ],
  },
  northshore: {
    character: { name: 'Angela Rizzo', role: 'School Nurse, PS 31', initials: 'AR' },
    exchanges: [
      {
        npc: "I see 600 kids a year. I know which ones have asthma, which ones are food-insecure, which ones go home to empty houses. When you close schools for a storm, do you know what happens to those kids?",
        choices: [
          { text: "What happens to the kids who go home to empty houses?", depth: 2 },
          { text: "How many kids would you say are in vulnerable situations?", depth: 1 },
          { text: "School safety is a top priority.", depth: 0 },
        ],
        insight: { category: 'SAFETY', text: 'School closures during emergencies leave 40+ children unsupervised — empty houses, no food backup' },
      },
      {
        npc: "Forty-three kids last year went home to no adult supervision when we closed for the nor'easter. Eleven had no heat. Three had no food in the house. We found out after. Nobody tracks this.",
        choices: [
          { text: "Could the school serve as an emergency shelter for these families?", depth: 2 },
          { text: "Is there a way to flag these families before the next closure?", depth: 1 },
        ],
        insight: { category: 'ASSET', text: 'PS 31 has full kitchen, nurse, gym — can shelter 200. School nurse maintains vulnerable family list (43 at-risk children)' },
      },
      {
        npc: "The ferry is our lifeline over here. When the ferry stops, Staten Island is an island for real. Last year it stopped for a northeaster and we had 9,000 commuters stranded. No bus bridge for 6 hours.",
        choices: [
          { text: "What's the backup when the ferry goes down?", depth: 2 },
          { text: "Six hours with no bridge service — that's a system failure.", depth: 1 },
        ],
        insight: { category: 'INFRA', text: 'Ferry shutdown strands 9,000 commuters — no bus bridge protocol, Staten Island fully isolated during storms' },
      },
    ],
  },
};
