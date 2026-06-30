<script>
  import { game } from '$lib/stores/game.js';
  import { bus, insightSys, emitPost } from '$lib/engine.js';
  import { DISTRICTS, districtMap, EDGES, CONCERN_SCORES } from '$data/districts.js';
  import { CONVERSATIONS } from '$data/conversations.js';

  // ── Local reactive state ──
  let composeText = $state('');
  let activeTone = $state('optimistic');
  let posting = $state(false);
  let llmStatus = $state('');
  let notebookOpen = $state(false);
  let showDeadInsights = $state(false);
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

  let sidebarFresh = $derived(
    ($game.insights ?? []).filter(i => i.freshness > 0.3)
  );

  let staleInsights = $derived(
    ($game.insights ?? []).filter(i => i.freshness > 0 && i.freshness <= 0.3)
  );

  let deadInsights = $derived(
    ($game.insights ?? []).filter(i => i.freshness <= 0)
  );

  let unreadCount = $derived(
    ($game.dms ?? []).filter(dm => dm.unread).length
  );

  // Merge posts + feed items, sorted by recency
  let allFeedItems = $derived.by(() => {
    const items = [];
    ($game.posts ?? []).forEach(p => {
      items.push({ type: 'post', data: p, week: p.week, order: p.order || 0 });
    });
    ($game.feed ?? []).forEach(f => {
      items.push({ type: 'feed', data: f, week: f.week, order: f.order || 0 });
    });
    items.sort((a, b) => b.week - a.week || b.order - a.order);
    return items;
  });

  // ── Notebook derived data ──
  let notebookPatterns = $derived.by(() => {
    return insightSys?.getPatterns?.() ?? [];
  });

  let notebookFresh = $derived.by(() => {
    return insightSys?.getFresh?.() ?? [];
  });

  let notebookStale = $derived.by(() => {
    return insightSys?.getStale?.() ?? [];
  });

  let notebookDead = $derived.by(() => {
    return insightSys?.getDead?.() ?? [];
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
    if (pct > 60) return '#34d399';
    if (pct > 30) return '#e8a83e';
    return '#ff5a52';
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

  // ── Keyboard shortcut: N to toggle notebook ──
  function handleKeydown(e) {
    if (e.key === 'n' || e.key === 'N') {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      notebookOpen = !notebookOpen;
    }
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }
  });

  // ── Post handler (with fallback scoring) ──

  function fallbackScore(text) {
    const scores = [];
    const words = text.toLowerCase();
    const insights = $game.insights ?? [];

    insights.filter(i => i.freshness > 0).forEach(ins => {
      const keywords = ins.text.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const hits = keywords.filter(k => words.includes(k)).length;
      const score = Math.min(10, Math.round((hits / Math.max(keywords.length, 1)) * 10));
      if (score > 0) {
        const d = districtMap[ins.districtId];
        const char = CONVERSATIONS[ins.districtId]?.character;
        scores.push({
          district: ins.districtId,
          score,
          resident: char?.name || 'A resident',
          reaction: score >= 5
            ? "They're talking about what we actually said."
            : "At least someone's paying attention.",
        });
      }
    });

    const overall = scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
      : 0;
    return {
      scores,
      overall,
      summary: scores.length > 0
        ? `Post references ${scores.length} community concern(s).`
        : 'Post lacks specific community knowledge.',
    };
  }

  async function handlePost() {
    const text = composeText.trim();
    if (!text || posting) return;

    posting = true;
    llmStatus = 'Evaluating post against community knowledge...';

    // Use fallback scoring (LLM scoring can be wired in later)
    const result = fallbackScore(text);

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
     SOCIAL VIEW LAYOUT: Main (compose + feed) | Sidebar (DMs + insights)
     ════════════════════════════════════════════════ -->

<div class="social-view">
  <div class="view-split">

    <!-- ── Main Column: Compose + Feed ── -->
    <div class="view-main">

      <!-- Compose bar -->
      <div class="compose-bar">
        <input
          type="text"
          class="compose-input"
          placeholder="What do you want to tell the city?"
          bind:value={composeText}
          onkeydown={(e) => { if (e.key === 'Enter') handlePost(); }}
          disabled={posting}
        />
        <button
          class="compose-post-btn"
          onclick={handlePost}
          disabled={posting}
        >
          {posting ? '...' : 'POST'}
        </button>
      </div>

      <!-- Tone selector pills -->
      <div class="compose-tones">
        {#each TONES as tone}
          <button
            class="compose-tone"
            class:active={activeTone === tone.id}
            onclick={() => { activeTone = tone.id; }}
          >
            {tone.label}
          </button>
        {/each}
      </div>

      <!-- Insight grounding chips (your knowledge) -->
      {#if freshInsights.length > 0}
        <div class="compose-ground">
          <span class="ground-label">Your knowledge ({freshInsights.length} fresh insights):</span>
          {#each freshInsights.slice(0, 4) as ins}
            <span class="compose-insight-chip readonly">
              &#9670; {ins.category} &mdash; {truncateInsight(ins.text)}
            </span>
          {/each}
          {#if freshInsights.length > 4}
            <span class="ground-overflow">+{freshInsights.length - 4} more</span>
          {/if}
        </div>
      {:else}
        <div class="compose-ground">
          <span class="ground-label">No insights yet. Visit districts first.</span>
        </div>
      {/if}

      <!-- LLM status -->
      {#if llmStatus}
        <div class="llm-status">{llmStatus}</div>
      {/if}

      <!-- ── Feed Timeline ── -->
      <div class="feed-timeline">
        {#each allFeedItems as item (item.type + '-' + item.order)}
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
                      <span
                        class="feed-score-district"
                        style="color: {s.score >= 7 ? '#34d399' : s.score >= 4 ? 'var(--secondary)' : 'var(--muted)'}"
                      >
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

    <!-- ── Sidebar: DMs + Patterns + Insights ── -->
    <div class="view-sidebar">

      <!-- Messages section -->
      <div class="sidebar-section-header">
        <span class="micro-label">MESSAGES</span>
        {#if unreadCount > 0}
          <span class="dm-unread-badge">{unreadCount}</span>
        {/if}
      </div>

      {#each $game.dms ?? [] as dm}
        {#if dm.messages.length === 0}
          <!-- Collapsed DM thread -->
          <div class="dm-thread">
            <div class="dm-avatar">{dm.initials}</div>
            <div class="dm-info">
              <div class="dm-name">{dm.characterName}</div>
              <div class="dm-district">{dm.districtName.toUpperCase()}</div>
              <div class="dm-preview">No messages yet</div>
            </div>
          </div>
        {:else}
          <!-- Expanded DM thread with messages -->
          <div class="dm-expanded">
            <div class="dm-expanded-header">
              <div class="dm-avatar">{dm.initials}</div>
              <div>
                <div class="dm-name">{dm.characterName}</div>
                <div class="dm-district">{dm.districtName.toUpperCase()}</div>
              </div>
            </div>
            {#each dm.messages as msg}
              <div class="dm-expanded-msg" class:sent={msg.sent}>{msg.text}</div>
            {/each}
          </div>
        {/if}
      {/each}

      <!-- Patterns section -->
      {#if ($game.patterns ?? []).length > 0}
        <div class="sidebar-section-header" style="margin-top: 20px;">
          <span class="micro-label">PATTERNS</span>
          <span class="pattern-count">{$game.patterns.length}</span>
        </div>
        {#each $game.patterns as p}
          <div class="insight-chip pattern-chip">&#9670; {p.text}</div>
        {/each}
      {/if}

      <!-- Insights section -->
      <div class="sidebar-section-header" style="margin-top: 20px;">
        <span class="micro-label">INSIGHTS</span>
        <span class="insight-total-count">{($game.insights ?? []).length}</span>
      </div>

      {#if ($game.insights ?? []).length === 0}
        <div class="sidebar-empty">Visit districts to discover insights.</div>
      {:else}
        <div class="insight-list">
          {#each sidebarFresh as ins}
            <div class="insight-chip">
              {ins.category} &mdash; {ins.text}
              <span class="insight-freshness">{Math.round(ins.freshness * 100)}%</span>
            </div>
          {/each}
          {#each staleInsights as ins}
            <div class="insight-chip stale">
              {ins.category} &mdash; {ins.text}
              <span class="insight-stale-badge">STALE</span>
            </div>
          {/each}
          {#each deadInsights as ins}
            <div class="insight-chip dead">
              {ins.category} &mdash; {ins.text}
            </div>
          {/each}
        </div>
      {/if}

      <!-- Notebook toggle -->
      <button class="notebook-toggle" onclick={() => { notebookOpen = !notebookOpen; }}>
        &#9782; FIELD NOTEBOOK
        {#if ($game.insights ?? []).length > 0}
          <span class="notebook-toggle-badge">{($game.insights ?? []).length}</span>
        {/if}
      </button>
    </div>
  </div>

  <!-- ════════════════════════════════════════════
       NOTEBOOK DRAWER (slides in from right)
       ════════════════════════════════════════════ -->
  {#if notebookOpen}
    <div class="notebook-drawer open">
      <div class="notebook-header">
        <span>
          <span class="notebook-title">FIELD NOTEBOOK</span>
          {#if ($game.insights ?? []).length > 0}
            <span class="notebook-badge">{($game.insights ?? []).length}</span>
          {/if}
        </span>
        <button class="notebook-close" onclick={() => { notebookOpen = false; }}>&times;</button>
      </div>

      <div class="notebook-body">
        <!-- Patterns -->
        {#if notebookPatterns.length > 0}
          <div class="notebook-section">
            <div class="notebook-section-title">Patterns ({notebookPatterns.length})</div>
            {#each notebookPatterns as p}
              {@const districtNames = p.districts.map(id => districtMap[id]?.name || id).join(', ')}
              <div class="notebook-pattern">
                <div class="notebook-pattern-cat">{p.category}</div>
                <div class="notebook-pattern-districts">{districtNames}</div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Fresh insights -->
        {#if notebookFresh.length > 0}
          <div class="notebook-section">
            <div class="notebook-section-title">Fresh Insights ({notebookFresh.length})</div>
            {#each groupByDistrict(notebookFresh) as [districtId, insights]}
              {@const d = districtMap[districtId]}
              <div class="notebook-district-group">
                <div class="notebook-district-name">{d?.name || districtId}</div>
                {#each insights as ins}
                  {@const pct = Math.round(ins.freshness * 100)}
                  <div class="notebook-insight">
                    <span class="notebook-insight-cat {ins.category}">{ins.category}</span>
                    <div class="notebook-insight-text">{ins.text}</div>
                    <div class="notebook-freshness">
                      <div
                        class="notebook-freshness-fill"
                        style="width: {pct}%; background: {freshnessColor(pct)}"
                      ></div>
                    </div>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        {/if}

        <!-- Stale insights -->
        {#if notebookStale.length > 0}
          <div class="notebook-section">
            <div class="notebook-section-title">Stale Insights ({notebookStale.length})</div>
            {#each groupByDistrict(notebookStale) as [districtId, insights]}
              {@const d = districtMap[districtId]}
              <div class="notebook-district-group">
                <div class="notebook-district-name">
                  {d?.name || districtId} <span class="notebook-stale-badge">STALE</span>
                </div>
                {#each insights as ins}
                  <div class="notebook-insight stale">
                    <span class="notebook-insight-cat {ins.category}">{ins.category}</span>
                    <div class="notebook-insight-text">{ins.text}</div>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        {/if}

        <!-- Dead insights (collapsed) -->
        {#if notebookDead.length > 0}
          <div class="notebook-section">
            <button class="notebook-dead-toggle" onclick={() => { showDeadInsights = !showDeadInsights; }}>
              Show expired ({notebookDead.length}) {showDeadInsights ? '\u25B4' : '\u25BE'}
            </button>
            {#if showDeadInsights}
              {#each notebookDead as ins}
                <div class="notebook-insight dead">
                  <span class="notebook-insight-cat {ins.category}">{ins.category}</span>
                  <div class="notebook-insight-text">{ins.text}</div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}

        <!-- Empty state -->
        {#if notebookPatterns.length === 0 && notebookFresh.length === 0 && notebookStale.length === 0 && notebookDead.length === 0}
          <div class="notebook-empty">
            Visit districts and have conversations to gather insights.
          </div>
        {/if}
      </div>
    </div>
  {/if}
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

  .view-sidebar {
    width: 280px;
    min-width: 240px;
    max-width: 320px;
    overflow-y: auto;
    padding: 16px 24px;
  }

  /* ── Compose Bar ── */
  .compose-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
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
    border-radius: 6px;
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

  /* ── Tone Pills ── */
  .compose-tones {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
  }

  .compose-tone {
    font-family: var(--font-data);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 3px 8px;
    border-radius: 4px;
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
    border-radius: 4px;
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
    border-radius: 4px;
    margin-left: 8px;
  }

  .feed-grounding.grounded {
    background: rgba(52,211,153,0.1);
    color: #34d399;
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

  /* ── Sidebar ── */
  .sidebar-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .micro-label {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .sidebar-empty {
    color: var(--muted);
    font-size: 11px;
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
    border-radius: 6px;
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

  /* ── Patterns ── */
  .pattern-count {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    color: var(--red);
  }

  .pattern-chip {
    background: rgba(255,45,45,0.08);
    color: var(--red);
    border-color: rgba(255,45,45,0.2);
  }

  /* ── Insights (sidebar) ── */
  .insight-total-count {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
  }

  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }

  .insight-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--dark);
    line-height: 1.4;
  }

  .insight-chip::before {
    content: '\25C6';
    font-size: 7px;
    color: var(--red);
    flex-shrink: 0;
  }

  .insight-chip.stale {
    opacity: 0.5;
    border-style: dashed;
  }

  .insight-chip.dead {
    opacity: 0.25;
    text-decoration: line-through;
  }

  .insight-freshness {
    font-size: 8px;
    color: var(--muted);
    margin-left: 4px;
  }

  .insight-stale-badge {
    font-size: 8px;
    color: var(--red);
    margin-left: 4px;
    font-weight: 700;
  }

  /* ── Notebook Toggle Button ── */
  .notebook-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 20px;
    padding: 8px 12px;
    width: 100%;
    background: rgba(0,0,0,0.03);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--secondary);
    cursor: pointer;
    text-transform: uppercase;
  }

  .notebook-toggle:hover {
    background: rgba(0,0,0,0.06);
  }

  .notebook-toggle-badge {
    background: var(--red);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 8px;
    margin-left: auto;
  }

  /* ── Notebook Drawer ── */
  .notebook-drawer {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 360px;
    background: var(--panel-bg);
    border-left: 1px solid var(--panel-border);
    z-index: 800;
    overflow-y: auto;
    font-family: var(--font-ui);
    box-shadow: -4px 0 20px rgba(0,0,0,0.08);
  }

  .notebook-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--panel-border);
    position: sticky;
    top: 0;
    background: var(--panel-bg);
    z-index: 1;
  }

  .notebook-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dark);
  }

  .notebook-badge {
    display: inline-block;
    background: var(--red);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 8px;
    margin-left: 6px;
  }

  .notebook-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
    padding: 0 4px;
  }

  .notebook-body {
    padding: 0;
  }

  .notebook-section {
    padding: 12px 16px;
    border-bottom: 1px solid var(--panel-border);
  }

  .notebook-section-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 8px;
  }

  .notebook-pattern {
    background: rgba(52,211,153,0.06);
    border: 1px solid rgba(52,211,153,0.2);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
  }

  .notebook-pattern-cat {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #34d399;
    text-transform: uppercase;
  }

  .notebook-pattern-districts {
    font-size: 12px;
    color: var(--dark);
    margin-top: 4px;
  }

  .notebook-district-group {
    margin-bottom: 12px;
  }

  .notebook-district-name {
    font-size: 11px;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 6px;
  }

  .notebook-insight {
    background: #fff;
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 8px 10px;
    margin-bottom: 6px;
    position: relative;
  }

  .notebook-insight.stale {
    border-style: dashed;
    opacity: 0.6;
  }

  .notebook-insight.dead {
    opacity: 0.35;
    text-decoration: line-through;
  }

  .notebook-insight-cat {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 1px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  /* Category-specific colors */
  .notebook-insight-cat.HEALTH   { background: #fef3c7; color: #92400e; }
  .notebook-insight-cat.HOUSING  { background: #dbeafe; color: #1e40af; }
  .notebook-insight-cat.INFRA    { background: #e0e7ff; color: #3730a3; }
  .notebook-insight-cat.SERVICES { background: #fce7f3; color: #9d174d; }
  .notebook-insight-cat.SAFETY   { background: #fee2e2; color: #991b1b; }
  .notebook-insight-cat.ASSET    { background: #d1fae5; color: #065f46; }

  .notebook-insight-text {
    font-size: 12px;
    color: var(--dark);
    line-height: 1.4;
  }

  .notebook-freshness {
    height: 3px;
    background: #e5e5e5;
    border-radius: 2px;
    margin-top: 6px;
    overflow: hidden;
  }

  .notebook-freshness-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s;
  }

  .notebook-stale-badge {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    color: var(--red);
    letter-spacing: 0.06em;
    margin-left: 6px;
  }

  .notebook-dead-toggle {
    font-size: 11px;
    color: #999;
    cursor: pointer;
    padding: 4px 0;
    background: none;
    border: none;
    font-family: var(--font-ui);
    width: 100%;
    text-align: left;
  }

  .notebook-dead-toggle:hover {
    color: var(--dark);
  }

  .notebook-empty {
    padding: 32px 16px;
    text-align: center;
    color: #999;
    font-size: 12px;
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
    .view-sidebar {
      max-width: none;
      min-width: 0;
      width: 100%;
    }
    .notebook-drawer {
      width: 100%;
    }
  }
</style>
