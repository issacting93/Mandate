<script>
  import { conversationActive, game } from '$lib/stores/game.js';
  import { bus, CONVERSATIONS, deptSys } from '$lib/engine.js';
  import { DEPARTMENTS } from '$systems/department.js';
  import { rollCheck, DICE_FACES } from '$systems/dice.js';
  import { districtMap } from '$data/districts.js';

  // ── Internal conversation state ──
  let convoState = $state(null);
  let messages = $state([]);
  // message types:
  //   npc        — NPC line (left-aligned, light bg)
  //   player     — player choice echo (right-aligned, dark bg)
  //   insight    — insight chip
  //   summary    — end-of-convo summary
  //   interjection — department interjection (colored border)
  //   check      — dice check result (centered)
  //   trustInsight — trust-related insight (amber)
  //   npcReaction — NPC reaction after a passed check

  let choices = $state([]);
  let choiceState = $state('active'); // 'active' | 'selected' | 'hidden'
  let selectedIdx = $state(-1);
  let depthPct = $state(0);
  let showTyping = $state(false);
  let character = $state(null);
  let districtName = $state('');
  let showCloseBtn = $state(false);
  let solutionFlash = $state(false);

  // Reference for auto-scrolling
  let messagesEl = $state(null);

  // ── React to conversationActive store ──
  $effect(() => {
    const data = $conversationActive;
    if (data && data.districtId) {
      startConversation(data.districtId);
    }
  });

  // ── Helpers ──

  function scrollToBottom() {
    if (messagesEl) {
      requestAnimationFrame(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getDeptColor(deptId) {
    return DEPARTMENTS[deptId]?.color || '#999';
  }

  function getDeptLabel(deptId) {
    return DEPARTMENTS[deptId]?.label || deptId;
  }

  function isV2Exchange(exchange) {
    return Array.isArray(exchange.interjections);
  }

  function pushMessage(msg) {
    messages = [...messages, msg];
    scrollToBottom();
  }

  // ── Start conversation ──

  function startConversation(districtId) {
    const d = districtMap[districtId];
    const convo = CONVERSATIONS[districtId];
    if (!convo || !d) {
      conversationActive.set(null);
      return;
    }

    character = convo.character;
    districtName = d.name;
    convoState = {
      districtId,
      exchangeIdx: 0,
      depth: 0,
      maxDepth: convo.exchanges.length * 2,
      insights: [],
    };
    messages = [];
    choices = [];
    choiceState = 'active';
    selectedIdx = -1;
    depthPct = 0;
    showTyping = false;
    showCloseBtn = false;
    solutionFlash = false;

    // Show first exchange after a beat
    setTimeout(() => showExchange(0), 400);
  }

  // ── Show exchange (dispatches to v1 or v2) ──

  function showExchange(idx) {
    if (!convoState) return;
    const convo = CONVERSATIONS[convoState.districtId];
    if (!convo || idx >= convo.exchanges.length) {
      endConversation();
      return;
    }

    convoState.exchangeIdx = idx;
    const exchange = convo.exchanges[idx];

    if (isV2Exchange(exchange)) {
      showExchangeV2(exchange);
    } else {
      showExchangeV1(exchange);
    }
  }

  // ═══════════════════════════════════════════════════════
  // V1 LEGACY FLOW (exchange.choices, no interjections)
  // ═══════════════════════════════════════════════════════

  function showExchangeV1(exchange) {
    showTyping = true;
    choices = [];
    choiceState = 'active';
    selectedIdx = -1;
    scrollToBottom();

    const typingDelay = 600 + Math.random() * 400;
    setTimeout(() => {
      showTyping = false;
      pushMessage({ type: 'npc', text: exchange.npc });

      // Automatic insight
      if (exchange.insight) {
        setTimeout(() => {
          pushMessage({
            type: 'insight',
            text: exchange.insight.category + ' \u2014 ' + exchange.insight.text,
          });
          convoState.insights = [...convoState.insights, exchange.insight];
        }, 300);
      }

      // Show choices
      setTimeout(() => {
        choices = exchange.choices.map((c, i) => ({
          text: c.text,
          depth: c.depth,
          index: i,
          kind: 'free',
        }));
        choiceState = 'active';
        scrollToBottom();
      }, 400);
    }, typingDelay);
  }

  // ═══════════════════════════════════════════════════════
  // V2 DISCO ELYSIUM FLOW
  // ═══════════════════════════════════════════════════════

  async function showExchangeV2(exchange) {
    showTyping = true;
    choices = [];
    choiceState = 'active';
    selectedIdx = -1;
    scrollToBottom();

    // 1. Typing indicator → NPC message
    const typingDelay = 600 + Math.random() * 400;
    await delay(typingDelay);
    showTyping = false;
    pushMessage({ type: 'npc', text: exchange.npc });

    // 2. Department interjections (300ms pause, then fire)
    await delay(300);
    const firedInterjections = await fireInterjections(exchange.interjections);

    // 3. Automatic insight (not behind a check)
    if (exchange.insight) {
      await delay(200);
      pushMessage({
        type: 'insight',
        text: exchange.insight.category + ' \u2014 ' + exchange.insight.text,
      });
      convoState.insights = [...convoState.insights, exchange.insight];
    }

    // 4. Dice checks
    if (exchange.checks && exchange.checks.length > 0) {
      await delay(400);
      await runChecks(exchange.checks);
    }

    // 5. Build choice panel
    await delay(300);
    buildV2Choices(exchange, firedInterjections);
  }

  // ── Fire interjections ──

  async function fireInterjections(interjections) {
    if (!interjections || interjections.length === 0) return [];

    // Evaluate which interjections pass their minLevel check
    const passing = interjections.filter(ij =>
      deptSys.getEffectiveLevel(ij.dept) >= ij.minLevel
    );

    if (passing.length === 0) return [];

    // Group by department, pick highest minLevel per dept
    const byDept = new Map();
    for (const ij of passing) {
      const existing = byDept.get(ij.dept);
      if (!existing || ij.minLevel > existing.minLevel) {
        byDept.set(ij.dept, ij);
      }
    }

    // Sort by minLevel descending, take max 2
    const sorted = [...byDept.values()]
      .sort((a, b) => b.minLevel - a.minLevel)
      .slice(0, 2);

    // Stagger display 200ms apart
    const fired = [];
    for (const ij of sorted) {
      pushMessage({
        type: 'interjection',
        dept: ij.dept,
        deptColor: getDeptColor(ij.dept),
        deptLabel: getDeptLabel(ij.dept),
        text: ij.text,
      });
      fired.push(ij);
      await delay(200);
    }

    return fired;
  }

  // ── Run checks ──

  async function runChecks(checks) {
    for (const check of checks) {
      const deptLevel = deptSys.getEffectiveLevel(check.dept);
      const result = rollCheck(deptLevel, check.difficulty);
      const diceStr = result.dice.map(d => DICE_FACES[d]).join(' ');
      const color = getDeptColor(check.dept);
      const label = getDeptLabel(check.dept).toUpperCase();

      pushMessage({
        type: 'check',
        dept: check.dept,
        deptColor: color,
        deptLabel: label,
        passed: result.passed,
        roll: result.roll,
        target: result.target,
        diceStr,
        dice: result.dice,
      });

      await delay(600);

      if (result.passed) {
        // Show insight from check
        if (check.pass.insight) {
          pushMessage({
            type: 'insight',
            text: check.pass.insight.category + ' \u2014 ' + check.pass.insight.text,
          });
          convoState.insights = [...convoState.insights, check.pass.insight];
          await delay(200);
        }
        // Show NPC reaction
        if (check.pass.npcReaction) {
          pushMessage({ type: 'npcReaction', text: check.pass.npcReaction });
          await delay(200);
        }
      } else {
        // Show failure text
        if (check.fail.text) {
          pushMessage({ type: 'npc', text: check.fail.text });
          await delay(200);
        }
        // Show trust insight if present
        if (check.fail.trustInsight) {
          pushMessage({
            type: 'trustInsight',
            text: check.fail.trustInsight,
          });
          await delay(200);
        }
      }
    }
  }

  // ── Build V2 choices ──

  function buildV2Choices(exchange, firedInterjections) {
    const built = [];
    let idx = 0;

    // Department followUp choices — only if their interjection fired
    const firedDepts = new Set(firedInterjections.map(ij => ij.dept));
    for (const ij of firedInterjections) {
      if (ij.followUp) {
        built.push({
          text: ij.followUp,
          depth: 2, // dept followUp always +2
          index: idx++,
          kind: 'dept',
          dept: ij.dept,
          deptColor: getDeptColor(ij.dept),
          deptLabel: getDeptLabel(ij.dept),
        });
      }
    }

    // Free choices
    if (exchange.freeChoices) {
      for (const fc of exchange.freeChoices) {
        built.push({
          text: fc.text,
          depth: fc.depth ?? 1,
          index: idx++,
          kind: fc.solutionJump ? 'solutionJump' : 'free',
          solutionJump: !!fc.solutionJump,
        });
      }
    }

    choices = built;
    choiceState = 'active';
    scrollToBottom();
  }

  // ═══════════════════════════════════════════════════════
  // CHOICE SELECTION (both v1 and v2)
  // ═══════════════════════════════════════════════════════

  function selectChoice(choiceIdx, choice) {
    if (choiceState !== 'active') return;

    selectedIdx = choiceIdx;
    choiceState = 'selected';

    setTimeout(() => {
      // Add player message
      pushMessage({ type: 'player', text: choice.text });

      // Handle solution jump
      if (choice.kind === 'solutionJump') {
        handleSolutionJump(choice);
        return;
      }

      // Update depth based on kind
      const depthDelta = choice.kind === 'dept' ? 2 : (choice.depth ?? 1);
      convoState.depth += depthDelta;
      depthPct = Math.min(100, (convoState.depth / convoState.maxDepth) * 100);

      // Next exchange
      setTimeout(() => {
        choices = [];
        choiceState = 'active';
        selectedIdx = -1;
        showExchange(convoState.exchangeIdx + 1);
      }, 500);
    }, 200);
  }

  // ── Solution jump handling ──

  async function handleSolutionJump(choice) {
    // Depth penalty
    convoState.depth = Math.max(0, convoState.depth - 1);
    depthPct = Math.min(100, (convoState.depth / convoState.maxDepth) * 100);

    // Red flash
    solutionFlash = true;
    await delay(400);
    solutionFlash = false;

    // NPC dismissive response
    await delay(200);
    pushMessage({
      type: 'npc',
      text: "You haven't heard a word I said, have you? That's what the last one promised too.",
    });

    // Emit disorder +1 for the district
    bus.emit('metre.addDisorder', {
      districtId: convoState.districtId,
      modifier: {
        source: 'solutionJump',
        label: 'Premature solution offered',
        value: 1,
        decay: -0.1,
        week: 0,
      },
    });

    // Next exchange
    await delay(600);
    choices = [];
    choiceState = 'active';
    selectedIdx = -1;
    showExchange(convoState.exchangeIdx + 1);
  }

  // ═══════════════════════════════════════════════════════
  // END CONVERSATION
  // ═══════════════════════════════════════════════════════

  function endConversation() {
    const count = convoState.insights.length;
    pushMessage({
      type: 'summary',
      text: `${count} insight${count !== 1 ? 's' : ''} discovered`,
    });

    setTimeout(() => {
      showCloseBtn = true;
      scrollToBottom();
    }, 600);
  }

  function closeConversation() {
    if (!convoState) return;

    const d = districtMap[convoState.districtId];
    let currentGame;
    game.update(g => { currentGame = g; return g; });

    // Apply conversation results to district
    if (d) {
      d.know = Math.min(100, d.know + 25 + convoState.depth * 3);
      d.trust = Math.min(100, d.trust + 2 + convoState.depth);
      d.lastVisited = currentGame.week;
    }

    // Push insights into game state
    game.update(g => {
      convoState.insights.forEach(ins => {
        g.insights.push({
          category: ins.category,
          text: ins.text,
          districtId: convoState.districtId,
          week: g.week,
          freshness: 1.0,
        });
      });

      // Add feed item for the visit
      const convo = CONVERSATIONS[convoState.districtId];
      const charName = convo?.character?.name || 'A resident';
      g.feed.unshift({
        type: 'reaction',
        text: `${d?.name || convoState.districtId}: The mayor visited today. ${convoState.insights.length} concerns documented.`,
        districtId: convoState.districtId,
        time: 'just now',
        week: g.week,
      });

      // Add DM from the character
      const dmIdx = g.dms.findIndex(dm => dm.districtId === convoState.districtId);
      if (dmIdx >= 0) {
        g.dms[dmIdx].messages.push({
          text: `Thanks for coming by. I'll hold you to what we talked about.`,
          sent: false,
        });
        g.dms[dmIdx].unread = true;
      } else if (convo) {
        g.dms.push({
          characterName: charName,
          initials: convo.character.initials,
          districtId: convoState.districtId,
          districtName: d?.name || convoState.districtId,
          messages: [{
            text: `Thanks for coming by. I'll hold you to what we talked about.`,
            sent: false,
          }],
          unread: true,
        });
      }

      return g;
    });

    // Emit for systems (InsightSystem, etc.)
    bus.emit('conversation.ended', {
      districtId: convoState.districtId,
      insights: convoState.insights,
      trustDelta: 2 + convoState.depth,
      depth: convoState.depth,
      characterName: character?.name,
    });

    // Reset state
    convoState = null;
    messages = [];
    choices = [];
    showCloseBtn = false;
    solutionFlash = false;
    conversationActive.set(null);
  }
</script>

{#if $conversationActive && convoState}
  <div class="convo-overlay active" class:solution-flash={solutionFlash}>
    <div class="convo-panel">
      <!-- Header -->
      {#if character}
        <div class="convo-header">
          <div class="convo-avatar">{character.initials}</div>
          <div class="convo-char-info">
            <div class="convo-char-name">{character.name}</div>
            <div class="convo-char-role">{character.role}</div>
          </div>
          <span class="convo-district-tag">{districtName}</span>
        </div>
      {/if}

      <!-- Depth meter -->
      <div class="convo-depth">
        <div class="convo-depth-fill" style="width:{depthPct}%"></div>
      </div>

      <!-- Messages -->
      <div class="convo-messages" bind:this={messagesEl}>
        {#each messages as msg, i (i)}

          {#if msg.type === 'npc'}
            <div class="convo-msg npc">{msg.text}</div>

          {:else if msg.type === 'player'}
            <div class="convo-msg player">{msg.text}</div>

          {:else if msg.type === 'insight'}
            <div class="convo-insight">{msg.text}</div>

          {:else if msg.type === 'summary'}
            <div class="convo-msg npc summary">
              <strong>{msg.text}</strong>
            </div>

          {:else if msg.type === 'interjection'}
            <div
              class="convo-interjection"
              style="border-left-color:{msg.deptColor}; background: color-mix(in srgb, {msg.deptColor} 5%, transparent);"
            >
              <span class="ij-dept-label" style="color:{msg.deptColor};">[{msg.dept}]</span>
              <span class="ij-text">"{msg.text}"</span>
            </div>

          {:else if msg.type === 'check'}
            <div
              class="convo-check"
              class:check-pass={msg.passed}
              class:check-fail={!msg.passed}
            >
              <div class="check-dice">
                {#each msg.dice as d}
                  <span class="die">{DICE_FACES[d]}</span>
                {/each}
              </div>
              <div class="check-label">
                [{msg.deptLabel} Check — {msg.roll} vs {msg.target}: {msg.passed ? 'SUCCESS' : 'FAILED'}]
              </div>
            </div>

          {:else if msg.type === 'npcReaction'}
            <div class="convo-msg npc reaction">{msg.text}</div>

          {:else if msg.type === 'trustInsight'}
            <div class="convo-trust-insight">{msg.text}</div>
          {/if}

        {/each}

        {#if showTyping}
          <div class="convo-typing">
            <span class="convo-typing-dot"></span>
            <span class="convo-typing-dot"></span>
            <span class="convo-typing-dot"></span>
          </div>
        {/if}
      </div>

      <!-- Choices -->
      <div class="convo-choices">
        {#if showCloseBtn}
          <button class="convo-choice close-btn" onclick={closeConversation}>
            Thank you. I need to go.
          </button>
        {:else}
          {#each choices as choice (choice.index)}
            {#if choice.kind === 'dept'}
              <button
                class="convo-choice dept-choice"
                class:selected={choiceState === 'selected' && selectedIdx === choice.index}
                class:faded={choiceState === 'selected' && selectedIdx !== choice.index}
                style="border-left: 3px solid {choice.deptColor};"
                onclick={() => selectChoice(choice.index, choice)}
              >
                <span class="choice-dept-chip" style="color:{choice.deptColor}; border-color:{choice.deptColor};">{choice.deptLabel}</span>
                {choice.text}
              </button>
            {:else if choice.kind === 'solutionJump'}
              <button
                class="convo-choice solution-choice"
                class:selected={choiceState === 'selected' && selectedIdx === choice.index}
                class:faded={choiceState === 'selected' && selectedIdx !== choice.index}
                onclick={() => selectChoice(choice.index, choice)}
              >
                {choice.text}
              </button>
            {:else}
              <button
                class="convo-choice"
                class:selected={choiceState === 'selected' && selectedIdx === choice.index}
                class:faded={choiceState === 'selected' && selectedIdx !== choice.index}
                onclick={() => selectChoice(choice.index, choice)}
              >
                {choice.text}
              </button>
            {/if}
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* ═══════════════════════════════════════════════════════
     OVERLAY + PANEL
     ═══════════════════════════════════════════════════════ */
  .convo-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0 16px 80px;
    background: rgba(0,0,0,0.35);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  .convo-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }
  .convo-overlay.solution-flash {
    animation: solutionFlash 0.4s ease;
  }
  @keyframes solutionFlash {
    0%, 100% { background: rgba(0,0,0,0.35); }
    30% { background: rgba(255,45,45,0.25); }
  }

  .convo-panel {
    width: 100%;
    max-width: 520px;
    max-height: 70vh;
    background: var(--panel-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(0);
    animation: panelSlideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes panelSlideUp {
    from { transform: translateY(20px); }
    to { transform: translateY(0); }
  }

  /* ═══════════════════════════════════════════════════════
     HEADER
     ═══════════════════════════════════════════════════════ */
  .convo-header {
    background: var(--dark, #1a1a1a);
    color: #fff;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .convo-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--red, #ff2d2d);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-data);
    font-weight: 900;
    font-size: 14px;
    color: #fff;
    flex-shrink: 0;
  }
  .convo-char-info { flex: 1; }
  .convo-char-name {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .convo-char-role {
    font-size: 10px;
    color: rgba(255,255,255,0.6);
    font-weight: 500;
  }
  .convo-district-tag {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
  }

  /* ═══════════════════════════════════════════════════════
     DEPTH METER
     ═══════════════════════════════════════════════════════ */
  .convo-depth {
    padding: 0 18px;
    height: 3px;
    background: var(--divider, rgba(0,0,0,0.08));
  }
  .convo-depth-fill {
    height: 100%;
    background: var(--red, #ff2d2d);
    border-radius: 2px;
    transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  /* ═══════════════════════════════════════════════════════
     MESSAGES CONTAINER
     ═══════════════════════════════════════════════════════ */
  .convo-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: var(--panel-border) transparent;
  }

  /* ── Base message ── */
  .convo-msg {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13px;
    line-height: 1.45;
    opacity: 0;
    transform: translateY(8px);
    animation: msgIn 0.3s ease forwards;
  }
  @keyframes msgIn {
    to { opacity: 1; transform: translateY(0); }
  }

  /* NPC messages */
  .convo-msg.npc {
    align-self: flex-start;
    background: rgba(0,0,0,0.06);
    color: var(--dark, #1a1a1a);
    border-bottom-left-radius: 4px;
  }
  .convo-msg.npc.reaction {
    background: rgba(0,0,0,0.04);
    border-left: 2px solid rgba(0,0,0,0.15);
    font-style: italic;
  }

  /* Player messages */
  .convo-msg.player {
    align-self: flex-end;
    background: var(--dark, #1a1a1a);
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  /* Summary */
  .convo-msg.summary {
    background: rgba(255,45,45,0.06);
    border-left: 3px solid var(--red, #ff2d2d);
  }

  /* ═══════════════════════════════════════════════════════
     DEPARTMENT INTERJECTIONS
     ═══════════════════════════════════════════════════════ */
  .convo-interjection {
    align-self: flex-start;
    max-width: 90%;
    padding: 8px 12px;
    border-left: 3px solid;
    border-radius: 2px 8px 8px 2px;
    font-size: 12px;
    line-height: 1.4;
    opacity: 0;
    transform: translateX(-8px);
    animation: ijSlideIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  @keyframes ijSlideIn {
    to { opacity: 1; transform: translateX(0); }
  }

  .ij-dept-label {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin-right: 6px;
    display: inline;
  }
  .ij-text {
    font-family: var(--font-ui);
    font-style: italic;
    color: var(--dark, #1a1a1a);
  }

  /* ═══════════════════════════════════════════════════════
     DICE CHECK RESULTS
     ═══════════════════════════════════════════════════════ */
  .convo-check {
    align-self: center;
    text-align: center;
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid;
    max-width: 90%;
    opacity: 0;
    transform: scale(0.9);
    animation: checkPop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  @keyframes checkPop {
    to { opacity: 1; transform: scale(1); }
  }
  .convo-check.check-pass {
    border-color: #22c55e;
    background: rgba(34,197,94,0.06);
  }
  .convo-check.check-fail {
    border-color: #f59e0b;
    background: rgba(245,158,11,0.06);
  }
  .check-dice {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .die {
    font-size: 28px;
    line-height: 1;
    animation: diceRoll 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes diceRoll {
    0% { transform: rotate(-180deg) scale(0.3); opacity: 0; }
    60% { transform: rotate(10deg) scale(1.1); opacity: 1; }
    100% { transform: rotate(0deg) scale(1); opacity: 1; }
  }
  .check-label {
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--dark, #1a1a1a);
  }
  .check-pass .check-label { color: #16a34a; }
  .check-fail .check-label { color: #d97706; }

  /* ═══════════════════════════════════════════════════════
     TRUST INSIGHT (amber, failed-check insight)
     ═══════════════════════════════════════════════════════ */
  .convo-trust-insight {
    align-self: flex-start;
    max-width: 85%;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 8px;
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    color: #d97706;
    letter-spacing: 0.04em;
    line-height: 1.4;
    opacity: 0;
    transform: scale(0.8);
    animation: insightPop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  .convo-trust-insight::before {
    content: '\25B2';
    font-size: 7px;
    flex-shrink: 0;
  }

  /* ═══════════════════════════════════════════════════════
     TYPING INDICATOR
     ═══════════════════════════════════════════════════════ */
  .convo-typing {
    align-self: flex-start;
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: rgba(0,0,0,0.06);
    border-radius: 14px;
    border-bottom-left-radius: 4px;
  }
  .convo-typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--muted, #999);
    animation: typingBounce 1.2s ease-in-out infinite;
  }
  .convo-typing-dot:nth-child(2) { animation-delay: 0.15s; }
  .convo-typing-dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }

  /* ═══════════════════════════════════════════════════════
     INSIGHT CHIP
     ═══════════════════════════════════════════════════════ */
  .convo-insight {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255,45,45,0.08);
    border: 1px solid rgba(255,45,45,0.2);
    border-radius: 8px;
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    color: var(--red, #ff2d2d);
    letter-spacing: 0.05em;
    opacity: 0;
    transform: scale(0.8);
    animation: insightPop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  @keyframes insightPop {
    to { opacity: 1; transform: scale(1); }
  }
  .convo-insight::before {
    content: '\25C6';
    font-size: 7px;
  }

  /* ═══════════════════════════════════════════════════════
     CHOICES
     ═══════════════════════════════════════════════════════ */
  .convo-choices {
    padding: 12px 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-top: 1px solid var(--divider, rgba(0,0,0,0.08));
    min-height: 20px;
  }

  /* Base choice button */
  .convo-choice {
    background: transparent;
    border: 1px solid var(--panel-border, rgba(0,0,0,0.1));
    border-radius: 10px;
    padding: 10px 14px;
    font-family: var(--font-ui);
    font-size: 12.5px;
    color: var(--dark, #1a1a1a);
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    line-height: 1.3;
  }
  .convo-choice:hover {
    border-color: var(--red, #ff2d2d);
    background: rgba(255,45,45,0.03);
  }
  .convo-choice.selected {
    border-color: var(--dark, #1a1a1a);
    background: var(--dark, #1a1a1a);
    color: #fff;
  }
  .convo-choice.faded {
    opacity: 0;
    transform: translateY(-4px);
    pointer-events: none;
    transition: all 0.2s ease;
    position: absolute;
  }

  /* Department follow-up choice */
  .convo-choice.dept-choice {
    border-left-width: 3px;
    border-left-style: solid;
    border-radius: 4px 10px 10px 4px;
    padding-left: 12px;
  }
  .convo-choice.dept-choice:hover {
    background: rgba(0,0,0,0.03);
  }

  .choice-dept-chip {
    font-family: var(--font-data);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid;
    border-radius: 3px;
    padding: 1px 5px;
    margin-right: 6px;
    display: inline-block;
    vertical-align: middle;
  }

  /* Solution jump choice */
  .convo-choice.solution-choice {
    border-style: dashed;
    border-color: var(--muted, #999);
    color: var(--muted, #999);
    font-size: 12px;
  }
  .convo-choice.solution-choice:hover {
    border-color: var(--red, #ff2d2d);
    color: var(--dark, #1a1a1a);
    background: rgba(255,45,45,0.03);
  }

  /* Close button */
  .convo-choice.close-btn {
    border-color: var(--red, #ff2d2d);
    color: var(--red, #ff2d2d);
  }
  .convo-choice.close-btn:hover {
    background: rgba(255,45,45,0.06);
  }
</style>
