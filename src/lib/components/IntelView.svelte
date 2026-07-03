<script>
  import { game } from '$lib/stores/game.js';
  import { bus, emitPost, openComms } from '$lib/engine.js';
  import { DISTRICTS, districtMap, EDGES, CONCERN_SCORES } from '$data/districts.js';
  import { CONVERSATIONS as CONVERSATIONS_V1 } from '$data/conversations.js';
  import { CONVERSATIONS_V2 } from '$data/conversations_v2.js';
  const CONVERSATIONS = { ...CONVERSATIONS_V1, ...CONVERSATIONS_V2 };
  import { scorePost } from '$lib/scoring.js';

  let freshCount = $derived(($game.insights ?? []).filter(i => i.freshness > 0.3).length);

  // ── Local reactive state ──
  let composeText = $state('');
  let activeTone = $state('optimistic');
  let posting = $state(false);
  let llmStatus = $state('');
  let selectedInsightChips = $state(new Set());

  // ── Tone options ──
  const TONES = [
    { id: 'concerned', label: 'CONCERNED' },
    { id: 'optimistic', label: 'OPTIMISTIC' },
    { id: 'urgent', label: 'URGENT' },
    { id: 'matter-of-fact', label: 'MATTER-OF-FACT' },
  ];

  // ── Derived data from game store ──
  let freshInsights = $derived(
    ($game.insights ?? []).filter(i => i.freshness > 0.3)
  );


  let unreadCount = $derived(
    ($game.dms ?? []).filter(dm => dm.unread).length
  );

  // Merge posts + feed items, sorted by recency
  let allFeedItems = $derived.by(() => {
    const items = [];
    ($game.posts ?? []).forEach((p, idx) => {
      items.push({ type: 'post', data: p, week: p.week, order: p.order || 0, key: `post-${p.order || idx}` });
    });
    ($game.feed ?? []).forEach((f, idx) => {
      items.push({ type: 'feed', data: f, week: f.week, order: f.order || 0, key: `feed-${f.order || 0}-${idx}` });
    });
    items.sort((a, b) => b.week - a.week || b.order - a.order);
    return items;
  });


  // ── Helpers ──

  function groupByDistrict(insights) {
    const grouped = {};
    for (const ins of insights) {
      if (!grouped[ins.districtId]) grouped[ins.districtId] = [];
      grouped[ins.districtId].push(ins);
    }
    return Object.entries(grouped);
  }

  function freshnessColor(pct) {
    if (pct > 60) return '#2A9E5C';
    if (pct > 30) return '#E8A020';
    return '#B82A18';
  }

  function feedDotClass(type) {
    if (type === 'chatter') return 'chatter';
    if (type === 'news') return 'news';
    if (type === 'reaction') return 'reaction';
    if (type === 'dm') return 'dm';
    return 'chatter';
  }

  function feedMetaLabel(type) {
    if (type === 'chatter') return 'DISTRICT CHATTER';
    if (type === 'news') return 'NEWS';
    if (type === 'reaction') return 'REACTION';
    return type.toUpperCase();
  }

  function highlightDistrict(text, districtId) {
    if (!districtId || !districtMap[districtId]) return text;
    const name = districtMap[districtId].name;
    return text.replace(name, `<span class="feed-district">${name}</span>`);
  }

  function scoreLabel(score) {
    if (score >= 7) return 'RESONATING';
    if (score >= 4) return 'NOTICED';
    return 'HOLLOW';
  }

  function scoreClass(score) {
    return score >= 5 ? 'grounded' : 'hollow';
  }

  function truncateInsight(text, max = 35) {
    const label = text.split('\u2014')[0].trim();
    return label.substring(0, max);
  }

  // N key now handled globally by App.svelte (NotebookOverlay)

  // ── Post handler ──

  async function handlePost() {
    const text = composeText.trim();
    if (!text || posting) return;

    posting = true;
    llmStatus = 'Scoring against community knowledge...';

    const result = scorePost(text, activeTone, $game.insights ?? [], districtMap, CONVERSATIONS, CONCERN_SCORES);

    // Build engagement metrics
    const engagement = {
      likes: Math.round(result.overall * 20 + Math.random() * 20),
      shares: Math.round(result.overall * 5 + Math.random() * 10),
      replies: result.scores.length + Math.round(Math.random() * 5),
    };

    const post = {
      text,
      tone: activeTone,
      grounded: result.overall >= 4,
      scores: result.scores,
      overall: result.overall,
      summary: result.summary,
      engagement,
      week: $game.week,
      order: Date.now(),
    };

    game.update(g => {
      g.posts.push(post);

      // ── 1. TRUST DELTAS ──
      const affectedDistricts = [];
      result.scores.forEach(s => {
        const d = districtMap[s.district];
        if (!d) return;
        const visited = d.lastVisited !== null;
        let delta;
        if (visited) {
          delta = s.score >= 7 ? 4 : s.score >= 4 ? 2 : 0;
        } else {
          delta = s.score >= 7 ? 1 : 0;
        }
        if (delta !== 0) {
          const oldTrust = d.trust;
          d.trust = Math.max(0, Math.min(100, d.trust + delta));
          affectedDistricts.push({
            id: s.district, name: d.name, delta,
            oldTrust, newTrust: d.trust, score: s.score, visited,
          });
        }
      });

      // ── 2. CONCERN SCORES SHIFT ──
      result.scores.forEach(s => {
        const d = districtMap[s.district];
        if (!d || d.lastVisited === null || s.score < 5) return;
        const concerns = CONCERN_SCORES[s.district];
        if (!concerns) return;
        const topConcern = Object.entries(concerns).sort((a, b) => b[1] - a[1])[0];
        if (topConcern && topConcern[1] > 1) {
          concerns[topConcern[0]] = Math.max(1, topConcern[1] - 1);
        }
      });

      // ── 3. DISCOVERY ──
      if (!g.heardAbout) g.heardAbout = {};
      result.scores.forEach(s => {
        const d = districtMap[s.district];
        if (!d || d.lastVisited !== null || s.score < 4) return;
        if (!g.heardAbout[s.district]) g.heardAbout[s.district] = [];
        const topConcern = Object.entries(CONCERN_SCORES[s.district] || {}).sort((a, b) => b[1] - a[1])[0];
        if (topConcern && !g.heardAbout[s.district].includes(topConcern[0])) {
          g.heardAbout[s.district].push(topConcern[0]);
        }
      });

      // ── 4. DM TRIGGERS ──
      result.scores.forEach(s => {
        const d = districtMap[s.district];
        if (!d || s.score < 5) return;
        const convo = CONVERSATIONS[s.district];
        if (!convo) return;
        const charName = convo.character.name;
        const visited = d.lastVisited !== null;

        const dmText = visited
          ? 'I saw what you posted. Thank you for remembering what we talked about.'
          : `I saw your post about ${d.name}. Come see it for yourself \u2014 I'll show you what we actually need.`;

        const existingDm = g.dms.find(dm => dm.districtId === s.district);
        if (existingDm) {
          existingDm.messages.push({ text: dmText, sent: false });
          existingDm.unread = true;
        } else {
          g.dms.push({
            characterName: charName,
            initials: convo.character.initials,
            districtId: s.district,
            districtName: d.name,
            messages: [{ text: dmText, sent: false }],
            unread: true,
          });
        }
      });

      // ── 5. FEED CASCADE ──
      const scoredDistrictIds = new Set(result.scores.filter(s => s.score >= 5).map(s => s.district));
      const cascadeReactions = [];
      scoredDistrictIds.forEach(did => {
        EDGES.forEach(([a, b]) => {
          const neighbor = a === did ? b : b === did ? a : null;
          if (!neighbor || scoredDistrictIds.has(neighbor)) return;
          const nd = districtMap[neighbor];
          if (!nd || cascadeReactions.some(r => r.districtId === neighbor)) return;
          const nConvo = CONVERSATIONS[neighbor];
          const nName = nConvo?.character?.name || `Residents of ${nd.name}`;
          const nConcerns = CONCERN_SCORES[neighbor];
          const nTop = nConcerns ? Object.entries(nConcerns).sort((a2, b2) => b2[1] - a2[1])[0] : null;
          const topLabel = nTop ? nTop[0] : 'issues';
          cascadeReactions.push({
            districtId: neighbor,
            text: `${nName}: "What about ${topLabel} in ${nd.name}? We're dealing with the same thing."`,
          });
        });
      });
      cascadeReactions.slice(0, 3).forEach(r => {
        g.feed.unshift({
          type: 'chatter', text: r.text, districtId: r.districtId,
          time: 'just now', week: g.week, order: Date.now() - 2,
        });
      });

      // ── 6. PATTERN ACCELERATION ──
      if (!g.postConcernHits) g.postConcernHits = {};
      result.scores.filter(s => s.score >= 5).forEach(s => {
        const concerns = CONCERN_SCORES[s.district];
        if (!concerns) return;
        const topConcern = Object.entries(concerns).sort((a2, b2) => b2[1] - a2[1])[0];
        if (!topConcern) return;
        const cat = topConcern[0];
        if (!g.postConcernHits[cat]) g.postConcernHits[cat] = new Set();
        g.postConcernHits[cat].add(s.district);
        if (g.postConcernHits[cat].size >= 3 && !g.patterns.some(p => p.category === cat.toUpperCase() + '_POST')) {
          g.patterns.push({
            category: cat.toUpperCase() + '_POST',
            districts: Array.from(g.postConcernHits[cat]),
            text: `Public awareness pattern: ${cat} concerns connect ${Array.from(g.postConcernHits[cat]).map(id => districtMap[id]?.name || id).join(', ')}`,
            week: g.week,
          });
          g.feed.unshift({
            type: 'reaction',
            text: `Pattern emerging: your posts about ${cat} are connecting communities across districts. They're sharing experiences.`,
            time: 'just now', week: g.week, order: Date.now() - 3,
          });
        }
      });

      // ── 7. RESIDENT REACTIONS ──
      const topReactions = result.scores
        .filter(s => s.score > 0 && s.reaction)
        .sort((a2, b2) => b2.score - a2.score)
        .slice(0, 3);

      topReactions.forEach(s => {
        const d = districtMap[s.district];
        const visited = d?.lastVisited !== null;
        g.feed.unshift({
          type: 'reaction',
          text: `${s.resident} (${d?.name || s.district}): "${s.reaction}"${!visited ? ' -- DM sent' : ''}`,
          districtId: s.district,
          time: 'just now', week: g.week, order: Date.now() - 1,
        });
      });

      // Overall summary
      g.feed.unshift({
        type: result.overall >= 5 ? 'reaction' : 'chatter',
        text: result.summary || (result.overall >= 5 ? 'Your post is resonating.' : 'Your post received lukewarm engagement.'),
        time: 'just now', week: g.week, order: Date.now(),
      });

      // Emit bus event for MetreSystem + other systems
      const perDistrictScores = {};
      result.scores.forEach(s => { perDistrictScores[s.district] = s.score; });
      bus.emit('post.scored', {
        groundingScore: result.overall / 10,
        perDistrictScores,
      });

      return g;
    });

    // Reset UI
    composeText = '';
    posting = false;
    llmStatus = '';
    selectedInsightChips = new Set();
  }

  // ── Listen for external feed updates (scenario triggers, etc.) ──
  $effect(() => {
    const unsub1 = bus.on('scenario.triggered', ({ headline, narrative }) => {
      game.update(g => {
        g.feed.unshift({
          type: 'news', text: `${headline}: ${narrative}`,
          time: 'just now', week: g.week, order: Date.now(),
        });
        return g;
      });
    });

    const unsub2 = bus.on('feed.item', ({ text, type }) => {
      game.update(g => {
        g.feed.unshift({
          type: type || 'news', text,
          time: 'just now', week: g.week, order: Date.now(),
        });
        return g;
      });
    });

    return () => { unsub1(); unsub2(); };
  });
</script>

<!-- ════════════════════════════════════════════════
     INTEL VIEW: Feed (left) | Messages (right)
     Compact compose bar at top. Notebook is now a global overlay (N key).
     ════════════════════════════════════════════════ -->

<div class="social-view">
  <div class="view-split">

    <!-- ── Left Column: Compose + Feed ── -->
    <div class="view-main">

      <!-- Statement builder button -->
      <button class="statement-open-btn" onclick={openComms} disabled={freshCount === 0}>
        {#if freshCount > 0}
          ✎ Build Statement · {freshCount} insight{freshCount !== 1 ? 's' : ''} available
        {:else}
          No insights yet — visit districts first
        {/if}
      </button>

      <!-- Feed Timeline -->
      <div class="feed-timeline">
        {#each allFeedItems as item (item.key)}
          {#if item.type === 'post'}
            {@const p = item.data}
            {@const score = p.overall ?? (p.grounded ? 7 : 2)}
            {@const grClass = scoreClass(score)}
            {@const grLabel = scoreLabel(score)}
            <div class="feed-item">
              <div class="feed-dot player"></div>
              <div class="feed-body">
                <div class="feed-text">{p.text}</div>
                <div class="feed-engagement">
                  {p.engagement.likes} likes &middot; {p.engagement.shares} shares &middot; {p.engagement.replies} replies
                  <span class="feed-grounding {grClass}">{grLabel} {score}/10</span>
                </div>
                {#if p.scores?.length > 0}
                  <div class="feed-score-districts">
                    {#each p.scores.filter(s => s.score > 0) as s}
                      <span class="feed-score-district" style="color: {s.score >= 7 ? 'var(--green)' : s.score >= 4 ? 'var(--ink-mid)' : 'var(--ink-muted)'}">
                        {districtMap[s.district]?.name || s.district}: {s.score}/10
                      </span>

                    {/each}
                  </div>
                {/if}
                {#if p.summary}
                  <div class="feed-summary">{p.summary}</div>
                {/if}
              </div>
              <span class="feed-time">wk {p.week}</span>
            </div>
          {:else}
            {@const f = item.data}
            <div class="feed-item" class:urgent={$game.week >= 36 && f.type === 'news'} class:emergency={$game.week >= 44}>
              <div class="feed-dot {feedDotClass(f.type)}"></div>
              <div class="feed-body">
                <div class="feed-text">{@html highlightDistrict(f.text, f.districtId)}</div>
                <div class="feed-meta">{feedMetaLabel(f.type)}</div>
              </div>
              <span class="feed-time">{f.time || 'wk ' + f.week}</span>
            </div>
          {/if}
        {/each}

        {#if allFeedItems.length === 0}
          <div class="feed-empty">The city is quiet. For now.</div>
        {/if}
      </div>
    </div>

    <!-- ── Right Column: Messages (promoted from sidebar) ── -->
    <div class="view-messages">
      <div class="msg-header">
        <span class="micro-label">MESSAGES</span>
        {#if unreadCount > 0}
          <span class="dm-unread-badge">{unreadCount}</span>
        {/if}
      </div>

      {#each $game.dms ?? [] as dm}
        {#if dm.messages.length === 0}
          <div class="dm-thread">
            <div class="dm-avatar">{dm.initials}</div>
            <div class="dm-info">
              <div class="dm-name">{dm.characterName}</div>
              <div class="dm-district">{dm.districtName.toUpperCase()}</div>
              <div class="dm-preview">No messages yet</div>
            </div>
          </div>
        {:else}
          <div class="dm-expanded" class:has-unread={dm.unread}>
            <div class="dm-expanded-header">
              <div class="dm-avatar">{dm.initials}</div>
              <div>
                <div class="dm-name">{dm.characterName}</div>
                <div class="dm-district">{dm.districtName.toUpperCase()}</div>
              </div>
              {#if dm.unread}
                <span class="dm-new-dot"></span>
              {/if}
            </div>
            {#each dm.messages as msg}
              <div class="dm-expanded-msg" class:sent={msg.sent}>{msg.text}</div>
            {/each}
          </div>
        {/if}
      {/each}

      {#if ($game.dms ?? []).length === 0}
        <div class="dm-empty">Visit districts to start conversations. Characters will message you here.</div>
      {/if}
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════════════
     SCOPED STYLES
     ════════════════════════════════════════════════ -->
<style>
  /* ── Layout ── */
  .social-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .view-split {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .view-main {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
    border-right: 1px solid var(--divider);
  }

  .view-messages {
    width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 16px 20px;
  }
  .msg-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  /* ── Compose Bar ── */
  .compose-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 0;
    margin-bottom: 8px;
  }

  .compose-input {
    flex: 1;
    border: none;
    background: transparent;
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--dark);
    outline: none;
  }

  .compose-input::placeholder {
    color: var(--muted);
  }

  .compose-post-btn {
    background: var(--red);
    color: #fff;
    border: none;
    border-radius: 0;
    padding: 6px 14px;
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
  }

  .compose-post-btn:hover {
    opacity: 0.9;
  }

  .compose-post-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .compose-tones-inline {
    display: flex;
    gap: 3px;
    flex-shrink: 0;
  }

  /* ── Tone Pills ── */

  .compose-tone {
    font-family: var(--font-data);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 3px 8px;
    border-radius: 0;
    border: 1px solid var(--panel-border);
    background: transparent;
    color: var(--secondary);
    cursor: pointer;
    text-transform: uppercase;
  }

  .compose-tone.active {
    background: var(--dark);
    color: #fff;
    border-color: var(--dark);
  }

  /* ── Insight Grounding Chips ── */
  .compose-ground {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: var(--muted);
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .ground-label {
    color: var(--muted);
  }

  .ground-overflow {
    font-size: 10px;
    color: var(--muted);
  }

  .compose-insight-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 2px 8px;
    border-radius: 0;
    background: rgba(255,45,45,0.08);
    color: var(--red);
    border: 1px solid rgba(255,45,45,0.15);
  }

  .compose-insight-chip.readonly {
    cursor: default;
    opacity: 0.7;
  }

  /* ── LLM Status ── */
  .llm-status {
    font-size: 10px;
    color: var(--muted);
    padding: 4px 0;
    font-family: var(--font-data);
  }

  /* ── Feed Timeline ── */
  .feed-timeline {
    margin-top: 8px;
  }

  .feed-item {
    padding: 14px 0;
    border-bottom: 1px solid var(--divider);
    display: flex;
    gap: 12px;
    transition: background 0.3s ease;
  }
  .feed-item.urgent {
    background: rgba(255, 45, 45, 0.06);
    border-left: 2px solid rgba(255, 45, 45, 0.3);
    padding-left: 10px;
  }
  .feed-item.emergency {
    background: rgba(255, 45, 45, 0.1);
    border-left: 3px solid var(--red);
    padding-left: 10px;
    animation: feed-pulse 2s ease-in-out infinite;
  }
  @keyframes feed-pulse {
    0%, 100% { background: rgba(255, 45, 45, 0.1); }
    50% { background: rgba(255, 45, 45, 0.18); }
  }

  .feed-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .feed-dot.player { background: var(--red); }
  .feed-dot.chatter { background: var(--dark); }
  .feed-dot.news { background: var(--muted); }
  .feed-dot.dm { background: #2b2b2b; }
  .feed-dot.reaction { background: var(--red); }

  .feed-body {
    flex: 1;
    min-width: 0;
  }

  .feed-text {
    font-size: 13px;
    line-height: 1.5;
    color: var(--dark);
  }

  :global(.feed-district) {
    text-decoration: underline;
    cursor: pointer;
    color: var(--dark);
  }

  :global(.feed-district:hover) {
    color: var(--red);
  }

  .feed-meta {
    font-family: var(--font-data);
    font-size: 10px;
    color: var(--muted);
    margin-top: 4px;
  }

  .feed-time {
    font-family: var(--font-data);
    font-size: 9px;
    color: var(--muted);
    flex-shrink: 0;
  }

  .feed-engagement {
    font-family: var(--font-data);
    font-size: 10px;
    color: var(--secondary);
    margin-top: 6px;
  }

  .feed-grounding {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 0;
    margin-left: 8px;
  }

  .feed-grounding.grounded {
    background: rgba(42,158,92,0.1);
    color: var(--green);
  }

  .feed-grounding.hollow {
    background: rgba(0,0,0,0.04);
    color: var(--muted);
  }

  .feed-score-districts {
    margin-top: 2px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .feed-score-district {
    font-size: 9px;
  }

  .feed-score-district + .feed-score-district::before {
    content: '\00B7 ';
  }

  .feed-summary {
    font-size: 10px;
    color: var(--muted);
    margin-top: 2px;
    font-style: italic;
  }

  .feed-empty {
    color: var(--muted);
    font-size: 12px;
    text-align: center;
    padding: 32px 0;
  }

  .statement-open-btn {
    width: 100%;
    padding: 10px 16px;
    background: var(--ink);
    color: var(--paper);
    border: none;
    font-family: var(--font-display);
    font-size: 14px;
    letter-spacing: 2px;
    cursor: pointer;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  .statement-open-btn:hover:not(:disabled) { background: var(--red); }
  .statement-open-btn:disabled { opacity: 0.4; cursor: default; }

  .micro-label {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-transform: uppercase;
  }

  /* ── DM Threads ── */
  .dm-thread {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
  }

  .dm-thread:hover {
    background: rgba(0,0,0,0.02);
    margin: 0 -24px;
    padding: 12px 24px;
  }

  .dm-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--dark);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-data);
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .dm-info {
    flex: 1;
    min-width: 0;
  }

  .dm-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--dark);
  }

  .dm-district {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .dm-preview {
    font-size: 11px;
    color: var(--secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .dm-unread-badge {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    background: var(--red);
    color: #fff;
    padding: 1px 6px;
    border-radius: 0;
  }

  .dm-expanded {
    padding: 10px 0 14px;
    border-bottom: 1px solid var(--divider);
  }

  .dm-expanded-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .dm-expanded-msg {
    font-size: 12px;
    color: var(--dark);
    line-height: 1.5;
    padding: 6px 0 6px 42px;
  }

  .dm-expanded-msg.sent {
    color: var(--secondary);
  }

  .dm-expanded.has-unread {
    border-left: 3px solid var(--red);
    padding-left: 10px;
  }

  .dm-new-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--red);
    flex-shrink: 0;
    margin-left: auto;
  }

  .dm-empty {
    font-size: 12px;
    color: var(--muted);
    font-style: italic;
    border-left: 2px solid var(--red);
    padding-left: 10px;
    line-height: 1.5;
  }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .view-split {
      flex-direction: column;
    }
    .view-main {
      border-right: none;
      border-bottom: 1px solid var(--divider);
    }
    .view-messages {
      width: 100%;
    }
  }
</style>
