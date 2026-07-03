<script>
  import { game, currentView, debriefActive } from '$lib/stores/game.js';
  import { districtMap, BLOC_NAMES } from '$data/districts.js';
  import { executeWeek, dealHand, draftCard, undraftCard, redeal, fundDepartment, defundDepartment, chooseDoctrine, switchDoctrine, showToast, deptSys } from '$lib/engine.js';
  import { DEPARTMENTS, DEPT_IDS, DOCTRINES } from '$systems/department.js';
  import { CONVERSATIONS as CONVERSATIONS_V1 } from '$data/conversations.js';
  import { CONVERSATIONS_V2 } from '$data/conversations_v2.js';
  const CONVERSATIONS = { ...CONVERSATIONS_V1, ...CONVERSATIONS_V2 };

  const NYC_ANALOG = {
    HEALTH: 'DOHMH', HOUSING: 'HPD', INFRA: 'DSNY/DEP',
    SERVICES: 'HRA/DFTA', SAFETY: 'NYCEM', COMMUNITY: 'Aid',
  };

  const LEVEL_COST = [0, 0, 0.2, 0.4, 0.6, 0.8];

  // Derived
  let filledSlots = $derived($game.schedule.filter(s => s && s.districtId !== '_redeal').length);
  let weekPct = $derived(Math.round(($game.week / 48) * 100));
  let seasonLabel = $derived.by(() => {
    const m = Math.floor(($game.week - 1) / 4);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const remaining = 48 - $game.week;
    return `${months[m] || 'December'} · Blizzard in ${remaining} wks`;
  });

  let draftedIds = $derived(new Set($game.schedule.filter(s => s && s.districtId !== '_redeal').map(s => s.districtId)));
  let openSlots = $derived($game.schedule.filter(s => s === null).length);
  let canRedeal = $derived(openSlots > 1 && !$game.weekStarted);

  // Dept spend + budget bar
  let deptSpend = $derived.by(() => {
    let total = 0;
    for (const id of DEPT_IDS) {
      const level = $game.departments?.[id] || 1;
      for (let l = 2; l <= level; l++) total += LEVEL_COST[l] || 0;
    }
    return Math.round(total * 100) / 100;
  });
  let budgetTotal = $derived(deptSpend + $game.reserve + 0.01);
  let percPct = $derived((deptSpend / budgetTotal) * 100);
  let resPct = $derived(($game.reserve / budgetTotal) * 100);

  // Deal hand on first render if empty
  $effect(() => {
    if ($game.hand.length === 0 && $game.week >= 1) {
      dealHand();
    }
  });

  function handleDraft(districtId) {
    if ($game.weekStarted) return;
    if (draftedIds.has(districtId)) return;
    if (openSlots <= 0) return;
    draftCard(districtId);
  }

  function handleUndraft(slotIdx) {
    if ($game.weekStarted) return;
    undraftCard(slotIdx);
  }

  function handleGo() {
    if ($game.weekStarted || filledSlots === 0) return;
    executeWeek();
    $currentView = 'map';
  }

  // ── End Week: stateful button with escalating friction ──
  let endWeekConfirm = $state(false);
  let endWeekLocked = $state(false);

  // Week 1 gate: hide End Week until GO has been pressed
  let week1Gate = $derived($game.week === 1 && !$game.weekStarted);

  // Determine End Week state
  let endWeekState = $derived.by(() => {
    if ($game.weekStarted) return 'post-go'; // played out the week
    if (filledSlots > 0) return 'partial';    // slots filled but GO not pressed
    return 'empty';                            // nothing drafted
  });

  let projectedReserve = $derived(($game.reserve - 0.08).toFixed(1));

  function handleEndWeek() {
    if (endWeekLocked) return;

    // Post-GO: open debrief directly
    if (endWeekState === 'post-go') {
      debriefActive.set(true);
      endWeekConfirm = false;
      return;
    }

    // Partial or empty: require confirm, then open debrief
    if (!endWeekConfirm) {
      endWeekConfirm = true;
      setTimeout(() => { endWeekConfirm = false; }, 2500);
      return;
    }

    // Confirmed — open debrief
    endWeekConfirm = false;
    debriefActive.set(true);

    // Rate limit after consecutive empty weeks
    if ($game.consecutiveEmptyWeeks >= 2) {
      endWeekLocked = true;
      setTimeout(() => { endWeekLocked = false; }, 500);
    }
  }

  function handleRedeal() {
    if (!canRedeal) return;
    redeal();
  }

  // Dept hint for week 4+
  let showDeptHint = $derived($game.week >= 4 && !$game.deptHintShown && $game.hand.some(c => !c.faceUp));

  function handleFund(deptId) {
    if (!deptSys.canFund(deptId)) {
      showToast(`Need $${deptSys.getFundCost(deptId)}B`, '#B82A18');
      return;
    }
    fundDepartment(deptId);

    // First fund: dismiss hint, show legibility toast
    if (!$game.deptHintShown) {
      game.update(g => { g.deptHintShown = true; return g; });
      const dept = DEPARTMENTS[deptId];
      const legibleCount = $game.hand.filter(c => !c.faceUp && c.lensId === deptId).length;
      if (legibleCount > 0) {
        showToast(`${dept.label} lens active — ${legibleCount} card${legibleCount > 1 ? 's' : ''} now legible`, dept.color);
      }
    }

    // Re-deal to update legibility
    dealHand();
  }

  function handleDefund(deptId) {
    if (deptSys.getLevel(deptId) <= 1) return;
    defundDepartment(deptId);
    dealHand();
  }

  function getCharacter(districtId) {
    const convo = CONVERSATIONS[districtId];
    return convo?.character || null;
  }

  function getDeptColor(deptId) {
    return DEPARTMENTS[deptId]?.color || '#999999';
  }

  function blocName(bloc) {
    return BLOC_NAMES[bloc] || bloc;
  }
</script>

<div class="w-root">
  <div class="w-watermark">WK {String($game.week).padStart(2,'0')}<br>/ 48</div>

  <!-- ═══ MAIN: DRAFT + BRIEFINGS ═══ -->
  <div class="w-main">
    <!-- Top bar -->
    <div class="w-topbar">
      <div class="w-logo">MANDATE</div>
      <div class="w-stats">
        <div class="w-stat">
          <div class="w-stat-label">Resilience</div>
          <div class="w-stat-row">
            <div class="w-stat-track"><div class="w-stat-fill" style="width:{$game.citywide || 55}%; background:var(--amber)"></div></div>
            <div class="w-stat-val">{$game.citywide || 55}</div>
          </div>
        </div>
        <div class="w-stat">
          <div class="w-stat-label">Disorder</div>
          <div class="w-stat-row">
            <div class="w-stat-track"><div class="w-stat-fill" style="width:{$game.citywideDisorder || 10}%; background:var(--red)"></div></div>
            <div class="w-stat-val">{$game.citywideDisorder || 10}</div>
          </div>
        </div>
        <div class="w-meta">{seasonLabel}</div>
      </div>
      <div class="w-wk-block">
        <span class="w-wk-num">{String($game.week).padStart(2,'0')}</span>
        <span class="w-wk-total">/ 48</span>
      </div>
    </div>

    <!-- Section 01: Draft slots -->
    <div class="w-section-head">
      <div class="w-sec-num">01</div>
      <div>
        <div class="w-sec-title">Draft Your Week</div>
        <div class="w-sec-sub">DIRECTIVE // FIELD MEETINGS</div>
      </div>
      <div class="w-sec-right">Three slots · choose who gets heard</div>
    </div>

    <div class="w-slots">
      {#each $game.schedule as slot, i (i)}
        {#if slot && slot.districtId !== '_redeal'}
          {@const d = districtMap[slot.districtId]}
          {@const char = getCharacter(slot.districtId)}
          {#if d}
            <div class="w-slot w-slot-filled" onclick={() => handleUndraft(i)}>
              <div class="w-slot-corner tl"></div><div class="w-slot-corner tr"></div>
              <div class="w-slot-corner bl"></div><div class="w-slot-corner br"></div>
              <div class="w-card-eye">{d.boro} · {blocName(d.bloc)}</div>
              <div class="w-slot-name">{d.name}</div>
              {#if char}<div class="w-slot-char">{char.name}</div>{/if}
            </div>
          {/if}
        {:else if slot && slot.districtId === '_redeal'}
          <div class="w-slot">
            <div class="w-slot-label">Re-dealt</div>
          </div>
        {:else}
          <div class="w-slot" class:w-pulse={$game.week === 1 && filledSlots === 0}>
            <div class="w-slot-corner tl"></div><div class="w-slot-corner tr"></div>
            <div class="w-slot-corner bl"></div><div class="w-slot-corner br"></div>
            <div class="w-slot-num">{i + 1}</div>
            <div class="w-slot-label">Open Slot</div>
          </div>
        {/if}
      {/each}
    </div>
    <div class="w-slot-status">{filledSlots} of {$game.slotsTotal} committed · click a briefing to assign</div>

    <hr class="w-divider">

    <!-- Section 02: Field Briefings -->
    <div class="w-brief-header">
      <div class="w-sec-num" style="font-size:30px">02</div>
      <div>
        <div class="w-sec-title">Field Briefings</div>
        <div class="w-sec-sub">{$game.hand.length} SURFACED THIS CYCLE</div>
      </div>
      <button class="w-redeal" disabled={!canRedeal} onclick={handleRedeal}>↺ Re-deal · 1 slot</button>
    </div>

    <div class="w-cards">
      {#each $game.hand as card (card.districtId)}
        {@const drafted = draftedIds.has(card.districtId)}
        {@const char = getCharacter(card.districtId)}
        {@const blocColor = { working: '#E8A020', labor: '#7B4FBF', business: '#999', realestate: '#999', progressive: '#E8A020' }[card.bloc] || '#DDD'}
        <button
          class="w-card"
          class:w-drafted={drafted}
          style="border-top-color:{blocColor}"
          onclick={() => handleDraft(card.districtId)}
          disabled={drafted || $game.weekStarted || openSlots <= 0}
        >
          {#if card.wanted}<span class="w-wanted">★ WANTED</span>{/if}
          <div class="w-card-eye">{card.boro} · {blocName(card.bloc)}</div>
          <div class="w-card-title">{card.name}</div>
          <div class="w-card-intel">
            {#if card.faceUp}
              {card.rumor}
            {:else}
              {card.rumor}
              {#if card.lensReveal}
                <br><br>{card.lensReveal}
              {/if}
            {/if}
          </div>
          <div class="w-card-barcode">
            <span style="width:2px"></span><span style="width:1px"></span><span style="width:3px"></span><span style="width:1px"></span><span style="width:2px"></span><span style="width:4px"></span><span style="width:1px"></span><span style="width:2px"></span>
          </div>
          <div class="w-card-footer">
            <div class="w-card-tag">
              <svg class="w-card-dot" viewBox="0 0 5 5"><rect width="5" height="5" fill="{getDeptColor(card.lensId)}"/></svg>
              {#if card.faceUp}
                {DEPARTMENTS[card.lensId]?.label} · Trust {card.trust}
              {:else if card.legible}
                {DEPARTMENTS[card.lensId]?.label} lens active
              {:else}
                {DEPARTMENTS[card.lensId]?.label} lens
              {/if}
            </div>
            {#if !drafted}
              <div class="w-card-add">+</div>
            {/if}
          </div>
        </button>
      {/each}
    </div>

    <div class="w-classified">Classified · Mayoral Eyes Only</div>
  </div>

  <!-- ═══ SIDEBAR: BUDGET + DEPARTMENTS ═══ -->
  <div class="w-sidebar">
    <div class="w-sb-label">Reserve</div>
    <div class="w-sb-budget">${$game.reserve.toFixed(1)}B</div>
    <div class="w-budgetbar">
      <div class="w-bp" style="width:{percPct}%"></div>
      <div class="w-br" style="width:{resPct}%"></div>
      <div class="w-bs" style="width:{100 - percPct - resPct}%"></div>
    </div>
    <div class="w-legend">
      <div class="w-leg"><svg class="w-leg-dot" viewBox="0 0 6 6"><rect width="6" height="6" style="fill:var(--perceive)"/></svg>Perceive</div>
      <div class="w-leg"><svg class="w-leg-dot" viewBox="0 0 6 6"><rect width="6" height="6" style="fill:var(--reserve)"/></svg>Reserve</div>
      <div class="w-leg"><svg class="w-leg-dot" viewBox="0 0 6 6"><rect width="6" height="6" style="fill:var(--spent)"/></svg>Spent</div>
    </div>

    {#if showDeptHint}
      <div class="w-dept-hint">Fund a lens to read briefings</div>
    {/if}

    <div class="w-dept-label">Departments — Funded Lens Reads Deck</div>

    {#each DEPT_IDS as deptId (deptId)}
      {@const dept = DEPARTMENTS[deptId]}
      {@const level = $game.departments?.[deptId] || 1}
      {@const cost = deptSys.getFundCost(deptId)}
      {@const doctrine = $game.doctrines?.[deptId] || null}
      {@const needsDoctrine = level >= 2 && !doctrine}
      {@const doctrineInfo = doctrine ? DOCTRINES[deptId]?.[doctrine] : null}
      {@const cooking = deptSys.isCooking(deptId)}
      {@const req = deptSys.getFundRequirement(deptId)}
      {@const canFundNow = deptSys.canFund(deptId)}
      <div class="w-dept">
        <div class="w-dept-top">
          <div class="w-dept-name">{dept.label}</div>
          <div class="w-dept-alloc">{level}/5{#if cooking} · cooking{/if}</div>
        </div>
        <div class="w-dept-code">
          {NYC_ANALOG[deptId]}
          {#if doctrineInfo}
            <span class="w-doctrine-tag" style="color:{dept.color}"> · {doctrineInfo.name}</span>
          {/if}
        </div>

        {#if needsDoctrine}
          <!-- Doctrine choice required -->
          <div class="w-doctrine-choice">
            <div class="w-doctrine-prompt">Choose doctrine:</div>
            <div class="w-doctrine-options">
              <button class="w-doctrine-btn" onclick={() => chooseDoctrine(deptId, 'A')}>
                <span class="w-doctrine-name">{DOCTRINES[deptId].A.name}</span>
                <span class="w-doctrine-desc">{DOCTRINES[deptId].A.desc}</span>
              </button>
              <button class="w-doctrine-btn" onclick={() => chooseDoctrine(deptId, 'B')}>
                <span class="w-doctrine-name">{DOCTRINES[deptId].B.name}</span>
                <span class="w-doctrine-desc">{DOCTRINES[deptId].B.desc}</span>
              </button>
            </div>
          </div>
        {:else}
          <div class="w-dept-ctrl">
            <button class="w-dept-btn" onclick={() => handleDefund(deptId)} disabled={level <= 1}>−</button>
            <div class="w-dept-track"><div class="w-dept-fill" style="background:{dept.color}; width:{level * 20}%"></div></div>
            <button class="w-dept-btn" onclick={() => handleFund(deptId)} disabled={!canFundNow}>+</button>
            <div class="w-dept-cost">${cost}B</div>
          </div>
          {#if req && !req.met}
            <div class="w-dept-req">Requires: {req.text}</div>
          {/if}
        {/if}
      </div>
    {/each}

    <div class="w-go-wrap">
      <button class="w-go" disabled={filledSlots === 0 || $game.weekStarted} onclick={handleGo}>
        Execute Week {String($game.week).padStart(2,'0')} ↗
      </button>
      <div class="w-go-sub">Commit slots to proceed</div>

      {#if !week1Gate}
        {#if endWeekState === 'post-go'}
          <button class="w-end" onclick={handleEndWeek}>End Week →</button>
        {:else if endWeekState === 'partial'}
          <button class="w-end w-end-warn" onclick={handleEndWeek}>
            {endWeekConfirm ? `Confirm — skip ${filledSlots}?` : `End Week (${filledSlots} unplayed)`}
          </button>
        {:else}
          <button class="w-end w-end-danger" class:w-confirming={endWeekConfirm} onclick={handleEndWeek} disabled={endWeekLocked}>
            {endWeekConfirm ? 'Confirm empty week?' : `End Week · −$0.38B → $${projectedReserve}B`}
          </button>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  /* ═══ DRAFT VIEW — Government Briefing Aesthetic ═══ */
  .w-root {
    flex: 1;
    background: var(--paper);
    font-family: var(--font-body);
    color: var(--ink);
    display: grid;
    grid-template-columns: 1fr 240px;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }
  .w-watermark {
    position: absolute;
    font-family: var(--font-display);
    font-size: 200px;
    color: rgba(0,0,0,0.03);
    letter-spacing: -6px;
    top: 50%; left: 40%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    z-index: 0;
    line-height: 1;
  }
  .w-main { padding: 20px; position: relative; z-index: 1; overflow-y: auto; }
  .w-sidebar {
    border-left: 1px solid var(--rule);
    padding: 20px 16px;
    background: var(--paper-card);
    position: relative; z-index: 1;
    overflow-y: auto;
  }

  /* Top bar */
  .w-topbar {
    display: flex; align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 20px;
  }
  .w-logo { font-family: var(--font-display); font-size: 20px; color: var(--red); letter-spacing: 3px; margin-right: 28px; }
  .w-stats { display: flex; gap: 20px; flex: 1; }
  .w-stat { display: flex; flex-direction: column; gap: 3px; }
  .w-stat-label { font-size: 8px; letter-spacing: 2px; color: var(--ink-muted); text-transform: uppercase; }
  .w-stat-row { display: flex; align-items: center; gap: 8px; }
  .w-stat-track { width: 64px; height: 2px; background: var(--spent); }
  .w-stat-fill { height: 2px; }
  .w-stat-val { font-size: 11px; font-weight: 700; color: var(--ink); }
  .w-meta { font-size: 8px; color: var(--ink-muted); letter-spacing: 1px; margin-left: 16px; align-self: center; }
  .w-wk-block { margin-left: auto; text-align: right; }
  .w-wk-num { font-family: var(--font-display); font-size: 26px; color: var(--red); line-height: 1; display: block; }
  .w-wk-total { font-size: 8px; color: var(--ink-ghost); letter-spacing: 1px; }

  /* Section headers */
  .w-section-head {
    display: flex; align-items: flex-end; gap: 10px;
    margin-bottom: 12px; padding-bottom: 8px;
    border-bottom: 1px solid var(--rule);
  }
  .w-sec-num { font-family: var(--font-display); font-size: 40px; line-height: 1; color: var(--red); }
  .w-sec-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--ink-mid); padding-bottom: 4px; }
  .w-sec-sub { font-size: 8px; color: var(--ink-muted); letter-spacing: 1px; }
  .w-sec-right { margin-left: auto; font-size: 8px; color: var(--ink-ghost); letter-spacing: 1px; text-align: right; padding-bottom: 4px; }

  /* Slots */
  .w-slots { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 6px; }
  .w-slot {
    border: 1px solid var(--rule); height: 68px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: var(--paper-card); position: relative; cursor: pointer;
  }
  .w-slot:hover { border-color: var(--red); }
  .w-slot-filled { background: var(--paper-white); align-items: flex-start; justify-content: flex-start; padding: 8px 10px; }
  .w-slot-num { font-family: var(--font-display); font-size: 36px; line-height: 1; color: var(--spent); }
  .w-slot-label { font-size: 7px; letter-spacing: 2px; color: var(--ink-ghost); text-transform: uppercase; }
  .w-slot-name { font-family: var(--font-display); font-size: 18px; color: var(--ink); line-height: 1; }
  .w-slot-char { font-size: 7px; color: var(--ink-muted); letter-spacing: 1px; margin-top: 2px; }
  .w-slot-corner { position: absolute; width: 7px; height: 7px; }
  .w-slot-corner.tl { top: 0; left: 0; border-top: 1px solid var(--red); border-left: 1px solid var(--red); }
  .w-slot-corner.tr { top: 0; right: 0; border-top: 1px solid var(--red); border-right: 1px solid var(--red); }
  .w-slot-corner.bl { bottom: 0; left: 0; border-bottom: 1px solid var(--red); border-left: 1px solid var(--red); }
  .w-slot-corner.br { bottom: 0; right: 0; border-bottom: 1px solid var(--red); border-right: 1px solid var(--red); }
  .w-slot-status { font-size: 8px; color: var(--ink-ghost); letter-spacing: 1px; margin-bottom: 14px; }
  .w-pulse { animation: w-slot-pulse 2s ease-in-out infinite; }
  @keyframes w-slot-pulse { 0%,100% { border-color: var(--rule); } 50% { border-color: var(--red); } }

  .w-divider { border: none; border-top: 1px solid var(--rule); margin: 14px 0; }

  /* Briefing header */
  .w-brief-header { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 10px; }
  .w-redeal {
    margin-left: auto; font-size: 8px; color: var(--red); letter-spacing: 1px;
    text-transform: uppercase; cursor: pointer;
    border: 1px solid var(--red-border); padding: 2px 8px;
    background: var(--red-light); align-self: center;
    font-family: var(--font-body);
  }
  .w-redeal:disabled { opacity: 0.3; cursor: default; }

  /* Cards */
  .w-cards { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; }
  .w-card {
    background: var(--paper-white); border: 1px solid var(--rule); border-top: 2px solid var(--ink-ghost);
    padding: 10px; cursor: pointer; position: relative;
    display: flex; flex-direction: column; min-height: 130px;
    font-family: var(--font-body); text-align: left; width: 100%;
    transition: border-color 0.12s;
  }
  .w-card:hover:not(:disabled) { border-color: var(--ink-ghost); }
  .w-card:disabled { cursor: default; }
  .w-drafted { opacity: 0.35; transform: scale(0.98); }
  .w-card-eye { font-size: 7px; letter-spacing: 1.5px; color: var(--ink-muted); text-transform: uppercase; margin-bottom: 3px; }
  .w-card-title { font-family: var(--font-display); font-size: 22px; color: var(--ink); line-height: 1; margin-bottom: 6px; }
  .w-card-intel {
    font-size: 8px; color: var(--ink-muted); line-height: 1.5;
    border-left: 2px solid var(--rule); padding-left: 6px;
    font-style: italic; flex: 1;
  }
  .w-card-footer { margin-top: 8px; display: flex; align-items: center; justify-content: space-between; }
  .w-card-tag { font-size: 7px; letter-spacing: 1px; text-transform: uppercase; color: var(--ink-ghost); display: flex; align-items: center; gap: 4px; }
  .w-card-dot { width: 5px; height: 5px; flex-shrink: 0; }
  .w-card-add {
    width: 16px; height: 16px; border: 1px solid var(--spent);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: var(--ink-ghost); flex-shrink: 0;
  }
  .w-card-barcode { display: flex; gap: 1px; margin-top: 6px; opacity: 0.1; }
  .w-card-barcode span { background: var(--ink); height: 6px; display: block; }
  .w-wanted {
    position: absolute; top: 0; right: 0;
    background: var(--red); color: var(--paper-white);
    font-size: 6px; letter-spacing: 2px; padding: 2px 6px;
    font-weight: 700; z-index: 2;
  }
  .w-classified {
    position: absolute; bottom: 14px; right: 18px;
    border: 1px solid rgba(184,42,24,0.12);
    padding: 2px 8px;
    font-size: 7px; letter-spacing: 3px; color: rgba(184,42,24,0.18);
    text-transform: uppercase; transform: rotate(-3deg);
    pointer-events: none;
  }

  /* Sidebar */
  .w-sb-label { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 3px; }
  .w-sb-budget { font-family: var(--font-display); font-size: 34px; color: var(--ink); line-height: 1; margin-bottom: 12px; }
  .w-budgetbar { height: 3px; display: flex; gap: 1px; margin-bottom: 10px; }
  .w-bp { background: var(--perceive); transition: width 0.3s; }
  .w-br { background: var(--reserve); transition: width 0.3s; }
  .w-bs { background: var(--spent); transition: width 0.3s; }
  .w-legend { display: flex; gap: 10px; margin-bottom: 14px; }
  .w-leg { display: flex; align-items: center; gap: 4px; font-size: 7px; color: var(--ink-muted); }
  .w-leg-dot { width: 6px; height: 6px; flex-shrink: 0; }

  .w-dept-hint {
    font-size: 8px; color: var(--red); letter-spacing: 1px;
    border: 1px solid var(--red-border); background: var(--red-light);
    padding: 6px 10px; margin-bottom: 10px; text-align: center;
    text-transform: uppercase;
  }
  .w-dept-label {
    font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-muted);
    border-bottom: 1px solid var(--rule); padding-bottom: 6px; margin-bottom: 10px;
  }
  .w-dept { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--rule-light); }
  .w-dept:last-of-type { border-bottom: none; }
  .w-dept-top { display: flex; justify-content: space-between; align-items: baseline; }
  .w-dept-name { font-family: var(--font-display); font-size: 15px; color: var(--ink); line-height: 1; }
  .w-dept-alloc { font-size: 8px; color: var(--ink-muted); }
  .w-dept-code { font-size: 7px; color: var(--ink-ghost); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .w-dept-ctrl { display: flex; align-items: center; gap: 6px; }
  .w-dept-track { flex: 1; height: 2px; background: var(--rule); position: relative; }
  .w-dept-fill { position: absolute; left: 0; top: 0; height: 2px; transition: width 0.2s; }
  .w-dept-cost { font-size: 7px; color: var(--ink-ghost); min-width: 30px; text-align: right; }
  .w-dept-btn {
    width: 14px; height: 14px; border: 1px solid var(--spent);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; color: var(--ink-ghost); cursor: pointer; flex-shrink: 0;
    font-family: var(--font-body); background: var(--paper-card);
  }
  .w-dept-btn:hover:not(:disabled) { border-color: var(--ink-muted); color: var(--ink-mid); }
  .w-dept-btn:disabled { opacity: 0.3; cursor: default; }

  /* Doctrine UI */
  .w-doctrine-tag { font-weight: 700; }
  .w-doctrine-choice { margin-top: 4px; }
  .w-doctrine-prompt { font-size: 7px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--red); margin-bottom: 4px; }
  .w-doctrine-options { display: flex; gap: 4px; }
  .w-doctrine-btn {
    flex: 1; background: var(--paper-white); border: 1px solid var(--rule);
    padding: 6px 8px; cursor: pointer; text-align: left;
    font-family: var(--font-body); transition: border-color 0.15s;
  }
  .w-doctrine-btn:hover { border-color: var(--red); }
  .w-doctrine-name { display: block; font-family: var(--font-display); font-size: 13px; color: var(--ink); }
  .w-doctrine-desc { display: block; font-size: 7px; color: var(--ink-muted); margin-top: 2px; line-height: 1.4; }
  .w-dept-req { font-size: 7px; color: var(--red); letter-spacing: 0.5px; margin-top: 3px; font-style: italic; }

  /* GO + End Week */
  .w-go-wrap { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--rule); }
  .w-go {
    width: 100%; background: var(--ink); border: none; padding: 11px;
    font-family: var(--font-display); font-size: 15px; color: var(--paper);
    letter-spacing: 3px; cursor: pointer; display: block; text-transform: uppercase;
  }
  .w-go:hover:not(:disabled) { background: var(--red); }
  .w-go:disabled { opacity: 0.4; cursor: default; }
  .w-go-sub { font-size: 7px; color: var(--ink-ghost); letter-spacing: 1.5px; text-align: center; margin-top: 6px; text-transform: uppercase; }
  .w-end {
    width: 100%; background: transparent; border: 1px solid var(--rule); padding: 8px;
    font-family: var(--font-body); font-size: 8px; color: var(--ink-muted);
    letter-spacing: 1.5px; cursor: pointer; display: block; text-transform: uppercase;
    margin-top: 6px; text-align: center;
  }
  .w-end:hover { border-color: var(--ink-muted); color: var(--ink-mid); }
  .w-end-warn { border-color: var(--amber); color: #8a5a1a; }
  .w-end-danger { border-color: var(--amber); color: #8a5a1a; }
  .w-confirming { border-color: var(--red); color: var(--red); animation: w-pulse 1s ease-in-out infinite; }
  @keyframes w-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
  .w-end:disabled { opacity: 0.3; cursor: default; }
</style>
