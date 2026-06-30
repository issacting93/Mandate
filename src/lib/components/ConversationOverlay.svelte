<script>
  import { conversationActive, game } from '$lib/stores/game.js';
  import { bus, CONVERSATIONS } from '$lib/engine.js';
  import { districtMap } from '$data/districts.js';

  // Internal conversation state
  let convoState = $state(null);
  let messages = $state([]);     // { type: 'npc'|'player'|'insight'|'summary', text: string }
  let choices = $state([]);      // { text, depth, index }
  let choiceState = $state('active'); // 'active' | 'selected' | 'hidden'
  let selectedIdx = $state(-1);
  let depthPct = $state(0);
  let showTyping = $state(false);
  let character = $state(null);
  let districtName = $state('');
  let showCloseBtn = $state(false);

  // Reference for auto-scrolling
  let messagesEl = $state(null);

  $effect(() => {
    const data = $conversationActive;
    if (data && data.districtId) {
      startConversation(data.districtId);
    }
  });

  function scrollToBottom() {
    if (messagesEl) {
      requestAnimationFrame(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }
  }

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

    // Show first exchange after a beat
    setTimeout(() => showExchange(0), 400);
  }

  function showExchange(idx) {
    if (!convoState) return;
    const convo = CONVERSATIONS[convoState.districtId];
    if (!convo || idx >= convo.exchanges.length) {
      endConversation();
      return;
    }

    convoState.exchangeIdx = idx;
    const exchange = convo.exchanges[idx];

    // Show typing indicator
    showTyping = true;
    choices = [];
    choiceState = 'active';
    selectedIdx = -1;
    scrollToBottom();

    // After delay, replace with message
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      showTyping = false;

      // Add NPC message
      messages = [...messages, { type: 'npc', text: exchange.npc }];
      scrollToBottom();

      // Add insight chip if present
      if (exchange.insight) {
        setTimeout(() => {
          messages = [...messages, {
            type: 'insight',
            text: exchange.insight.category + ' \u2014 ' + exchange.insight.text,
          }];
          convoState.insights = [...convoState.insights, exchange.insight];
          scrollToBottom();
        }, 300);
      }

      // Show choices after a beat
      setTimeout(() => {
        choices = exchange.choices.map((c, i) => ({
          text: c.text,
          depth: c.depth,
          index: i,
        }));
        choiceState = 'active';
        scrollToBottom();
      }, 400);
    }, delay);
  }

  function selectChoice(choiceIdx, choice) {
    if (choiceState !== 'active') return;

    selectedIdx = choiceIdx;
    choiceState = 'selected';

    // Add player message after a beat
    setTimeout(() => {
      messages = [...messages, { type: 'player', text: choice.text }];
      scrollToBottom();

      // Update depth
      convoState.depth += choice.depth;
      depthPct = Math.min(100, (convoState.depth / convoState.maxDepth) * 100);

      // Next exchange after a beat
      setTimeout(() => {
        choices = [];
        choiceState = 'active';
        selectedIdx = -1;
        showExchange(convoState.exchangeIdx + 1);
      }, 500);
    }, 200);
  }

  function endConversation() {
    // Show summary message
    const count = convoState.insights.length;
    messages = [...messages, {
      type: 'summary',
      text: `${count} insight${count !== 1 ? 's' : ''} discovered`,
    }];
    scrollToBottom();

    // Show close button after a beat
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
    conversationActive.set(null);
  }
</script>

{#if $conversationActive && convoState}
  <div class="convo-overlay active">
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
            <button
              class="convo-choice"
              class:selected={choiceState === 'selected' && selectedIdx === choice.index}
              class:faded={choiceState === 'selected' && selectedIdx !== choice.index}
              onclick={() => selectChoice(choice.index, choice)}
            >
              {choice.text}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
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

  /* Header */
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

  /* Depth meter */
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

  /* Messages */
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
  .convo-msg.npc {
    align-self: flex-start;
    background: rgba(0,0,0,0.06);
    color: var(--dark, #1a1a1a);
    border-bottom-left-radius: 4px;
  }
  .convo-msg.player {
    align-self: flex-end;
    background: var(--dark, #1a1a1a);
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .convo-msg.summary {
    background: rgba(255,45,45,0.06);
    border-left: 3px solid var(--red, #ff2d2d);
  }

  /* Typing indicator */
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

  /* Insight chip */
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

  /* Choices */
  .convo-choices {
    padding: 12px 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-top: 1px solid var(--divider, rgba(0,0,0,0.08));
    min-height: 20px;
  }
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
  .convo-choice.close-btn {
    border-color: var(--red, #ff2d2d);
    color: var(--red, #ff2d2d);
  }
  .convo-choice.close-btn:hover {
    background: rgba(255,45,45,0.06);
  }
</style>
