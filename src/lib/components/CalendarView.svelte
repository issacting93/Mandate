<script>
  import { game, currentView } from '$lib/stores/game.js';
  import { districtMap, ACTION_COLORS } from '$data/districts.js';
  import { executeWeek, advanceWeek, openBento } from '$lib/engine.js';

  // ── Constants ──
  const GAME_START = new Date(2025, 0, 6); // Mon Jan 6 2025
  const MONTH_NAMES = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const DAY_NAMES = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const DOW_HEADERS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const SLOT_DAYS = [1, 3, 5]; // Mon=1, Wed=3, Fri=5
  const DAY_LABELS = ['MON','WED','FRI'];
  const ALL_BOROS = ['The Bronx', 'Manhattan', 'Queens', 'Brooklyn', 'Staten Island'];
  const BORO_ABBREV = { 'The Bronx': 'BX', 'Manhattan': 'MN', 'Queens': 'QN', 'Brooklyn': 'BK', 'Staten Island': 'SI' };

  // ── Local UI state ──
  let calViewMonth = $state(null);
  let calSelectedDay = $state(null);

  // ── Date helpers ──
  function weekToDateRange(week) {
    const start = new Date(GAME_START);
    start.setDate(start.getDate() + (week - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  }

  function dateToGameWeek(date) {
    const diff = Math.floor((date - GAME_START) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 0;
    return Math.floor(diff / 7) + 1;
  }

  function makeDayObj(date, viewMonth, currentWeekRange, week) {
    const gw = dateToGameWeek(date);
    return {
      date: new Date(date),
      dayNum: date.getDate(),
      inMonth: date.getMonth() === viewMonth,
      inCurrentWeek: date >= currentWeekRange.start && date <= currentWeekRange.end,
      isToday: date.getTime() === currentWeekRange.start.getTime(),
      isDisasterZone: gw >= 30 && gw <= 48,
      isPast: gw > 0 && gw < week,
      gameWeek: gw,
      dateKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    };
  }

  function getMonthGrid(year, month, week) {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    let startDow = firstOfMonth.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1; // shift to Mon=0

    const currentWeekRange = weekToDateRange(week);

    const days = [];
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(makeDayObj(d, month, currentWeekRange, week));
    }
    for (let i = 1; i <= lastOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(makeDayObj(d, month, currentWeekRange, week));
    }
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, days.length - (startDow + lastOfMonth.getDate()) + 1);
      days.push(makeDayObj(d, month, currentWeekRange, week));
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }

  // ── Initialize calViewMonth on first render ──
  $effect(() => {
    if (calViewMonth === null) {
      const range = weekToDateRange($game.week);
      calViewMonth = { year: range.start.getFullYear(), month: range.start.getMonth() };
    }
  });

  // ── Derived values ──
  let filledSlots = $derived($game.schedule.filter(Boolean).length);
  let weekPct = $derived(Math.round(($game.week / 48) * 100));
  let currentWeekRange = $derived(weekToDateRange($game.week));

  let unscheduledLabels = $derived(
    $game.labels.filter(l => !$game.schedule.some(s => s && s.districtId === l.districtId))
  );

  let grid = $derived(
    calViewMonth ? getMonthGrid(calViewMonth.year, calViewMonth.month, $game.week) : []
  );

  let coveredBoros = $derived.by(() => {
    const set = new Set();
    $game.schedule.filter(Boolean).forEach(s => {
      const d = districtMap[s.districtId];
      if (d) set.add(d.boro);
    });
    return set;
  });

  let unreadDms = $derived(
    $game.dms.filter(dm => dm.unread || dm.messages.length > 0)
  );

  // Does the selected day fall in the current week?
  let selectedInCurrentWeek = $derived(
    calSelectedDay && calSelectedDay >= currentWeekRange.start && calSelectedDay <= currentWeekRange.end
  );

  // If a day is selected and it's a slot day, which slot index?
  let selectedSlotIdx = $derived.by(() => {
    if (!calSelectedDay) return -1;
    return SLOT_DAYS.indexOf(calSelectedDay.getDay());
  });

  // ── Agenda helper: get the scheduled item for a given day in the current week ──
  function getAgendaForDay(day) {
    if (!day.inCurrentWeek || !day.inMonth) return null;
    const dow = day.date.getDay();
    const slotIdx = SLOT_DAYS.indexOf(dow);
    if (slotIdx < 0) return null;
    const slot = $game.schedule[slotIdx];
    if (!slot) return null;
    const d = districtMap[slot.districtId];
    if (!d) return null;
    const color = ACTION_COLORS[slot.action] || '#9a9a9a';
    return { ...slot, district: d, color, slotIdx };
  }

  // ── Cell CSS class builder ──
  function cellClasses(day) {
    let cls = 'cal-cell';
    if (!day.inMonth) cls += ' out-of-month';
    else if (day.isPast) cls += ' past';
    if (day.inCurrentWeek) cls += ' current-week';
    if (day.isDisasterZone && !day.inCurrentWeek) cls += ' disaster-zone';
    if (calSelectedDay && day.date.toDateString() === calSelectedDay.toDateString()) cls += ' selected-day';
    return cls;
  }

  // ── Actions ──
  function prevMonth() {
    if (!calViewMonth) return;
    let m = calViewMonth.month - 1;
    let y = calViewMonth.year;
    if (m < 0) { m = 11; y--; }
    calViewMonth = { year: y, month: m };
    calSelectedDay = null;
  }

  function nextMonth() {
    if (!calViewMonth) return;
    let m = calViewMonth.month + 1;
    let y = calViewMonth.year;
    if (m > 11) { m = 0; y++; }
    calViewMonth = { year: y, month: m };
    calSelectedDay = null;
  }

  function selectDay(day) {
    if (!day.inCurrentWeek || !day.inMonth) return;
    calSelectedDay = new Date(day.date);
  }

  function unscheduleByDistrict(districtId) {
    game.update(g => {
      const idx = g.schedule.findIndex(s => s && s.districtId === districtId);
      if (idx >= 0) g.schedule[idx] = null;
      return g;
    });
  }

  function unscheduleSlot(slotIdx) {
    game.update(g => {
      g.schedule[slotIdx] = null;
      return g;
    });
  }

  function removeFromQueue(districtId) {
    game.update(g => {
      g.labels = g.labels.filter(l => l.districtId !== districtId);
      g.schedule = g.schedule.map(s => s && s.districtId === districtId ? null : s);
      return g;
    });
  }

  function scheduleLabel(districtId, action) {
    game.update(g => {
      const openIdx = g.schedule.indexOf(null);
      if (openIdx >= 0) {
        g.schedule[openIdx] = { districtId, action };
      }
      return g;
    });
  }

  function navigateToDistrict(districtId) {
    $currentView = 'map';
    // The map component handles selection via the selectedDistrict store
  }

  function backToWeek() {
    calSelectedDay = null;
  }

  function handleGo() {
    if ($game.weekStarted) return;
    const hasScheduled = $game.schedule.some(Boolean);
    if (!hasScheduled) return;
    executeWeek();
    $currentView = 'map';
  }

  function handleEndWeek() {
    advanceWeek();
  }

  // ── Drag & drop ──
  let dragging = $state(null); // { districtId, action, chipEl }

  function onChipPointerDown(e, label) {
    if (e.target.closest('.cal-chip-remove')) return;
    const isScheduled = $game.schedule.some(s => s && s.districtId === label.districtId);
    if (isScheduled) return;
    dragging = { districtId: label.districtId, action: label.action };
  }

  function onCellDragOver(e, day) {
    if (!dragging) return;
    if (!day.inCurrentWeek || !day.inMonth) return;
    const dow = day.date.getDay();
    if (!SLOT_DAYS.includes(dow)) return;
    e.preventDefault();
  }

  function onCellDrop(e, day) {
    if (!dragging) return;
    if (!day.inCurrentWeek || !day.inMonth) return;
    const dow = day.date.getDay();
    const slotIdx = SLOT_DAYS.indexOf(dow);
    if (slotIdx < 0) return;
    e.preventDefault();

    game.update(g => {
      if (!g.schedule[slotIdx]) {
        g.schedule[slotIdx] = { districtId: dragging.districtId, action: dragging.action };
      }
      return g;
    });
    dragging = null;
  }

  function onDragEnd() {
    dragging = null;
  }

  // Click a queue chip to assign to selected slot
  function onChipClick(label) {
    const isScheduled = $game.schedule.some(s => s && s.districtId === label.districtId);
    if (isScheduled) return;

    // If a day is selected and it has an open slot, assign there
    if (selectedInCurrentWeek) {
      const si = selectedSlotIdx;
      if (si >= 0 && !$game.schedule[si]) {
        game.update(g => {
          g.schedule[si] = { districtId: label.districtId, action: label.action };
          return g;
        });
        return;
      }
    }

    // Otherwise, fill first open slot
    scheduleLabel(label.districtId, label.action);
  }
</script>

<div class="calendar-view">
  <!-- ═══ MAIN PANEL ═══ -->
  <div class="view-main">
    {#if calViewMonth}
      <!-- Month header -->
      <div class="cal-month-header">
        <span class="cal-month-title">{MONTH_NAMES[calViewMonth.month]}</span>
        <div class="cal-month-nav">
          <button onclick={prevMonth}>{'\u25C0'}</button>
          <button onclick={nextMonth}>{'\u25B6'}</button>
        </div>
      </div>

      <!-- Week indicator -->
      <div class="cal-week-indicator">
        <span class="cal-week-label">WEEK {String($game.week).padStart(2, '0')} OF 48</span>
        <div class="cal-progress">
          <div class="cal-progress-fill" style="width:{weekPct}%"></div>
        </div>
      </div>

      <!-- Day-of-week headers -->
      <div class="cal-dow-row">
        {#each DOW_HEADERS as dow}
          <span class="cal-dow">{dow}</span>
        {/each}
      </div>

      <!-- Calendar grid -->
      <div class="cal-grid">
        {#each grid as week}
          {#each week as day}
            {@const agenda = getAgendaForDay(day)}
            <div
              class={cellClasses(day)}
              data-date={day.inMonth ? day.dateKey : undefined}
              onclick={() => selectDay(day)}
              ondragover={(e) => onCellDragOver(e, day)}
              ondrop={(e) => onCellDrop(e, day)}
            >
              <div class={day.isToday ? 'cal-day-num today' : 'cal-day-num'}>
                {day.dayNum}
              </div>
              {#if agenda}
                <div class="cal-day-agenda">
                  <div
                    class="cal-agenda-item"
                    onclick={(e) => { e.stopPropagation(); unscheduleByDistrict(agenda.districtId); }}
                  >
                    <span class="cal-agenda-dot" style="background:{agenda.color}"></span>
                    <span>{agenda.district.name}</span>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        {/each}
      </div>

      <!-- Queue strip -->
      <div class="cal-queue-strip">
        <div class="cal-queue-header">
          <span class="micro-label">QUEUE</span>
          <span class="cal-queue-count">{$game.labels.length}</span>
        </div>

        {#if $game.labels.length === 0}
          <div class="cal-queue-empty">Label districts on the map to plan your week</div>
        {:else}
          <div class="cal-queue-row">
            {#each $game.labels as label (label.districtId)}
              {@const d = districtMap[label.districtId]}
              {@const color = ACTION_COLORS[label.action] || '#9a9a9a'}
              {@const isScheduled = $game.schedule.some(s => s && s.districtId === label.districtId)}
              {#if d}
                <div
                  class="cal-queue-chip"
                  class:scheduled={isScheduled}
                  class:dragging={dragging?.districtId === label.districtId}
                  data-district={label.districtId}
                  data-action={label.action}
                  draggable={!isScheduled}
                  onclick={() => onChipClick(label)}
                  onpointerdown={(e) => onChipPointerDown(e, label)}
                  ondragstart={(e) => {
                    if (isScheduled) { e.preventDefault(); return; }
                    dragging = { districtId: label.districtId, action: label.action };
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  ondragend={onDragEnd}
                >
                  <span class="cal-queue-chip-dot" style="background:{color}"></span>
                  {d.name}
                  <span class="cal-trust-sm">{d.trust}</span>
                  <button
                    class="cal-chip-remove"
                    title="Remove from queue"
                    onclick={(e) => { e.stopPropagation(); removeFromQueue(label.districtId); }}
                  >&times;</button>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- ═══ SIDEBAR ═══ -->
  <div class="view-sidebar">
    {#if selectedInCurrentWeek}
      <!-- Day detail mode -->
      {@const dayName = DAY_NAMES[calSelectedDay.getDay()]}
      {@const dateStr = calSelectedDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      {@const slotIdx = selectedSlotIdx}

      <div class="cal-side-day">
        {dayName}
        <span class="cal-side-day-date">{dateStr}</span>
      </div>

      {#if slotIdx >= 0}
        {@const slot = $game.schedule[slotIdx]}
        {#if slot}
          {@const d = districtMap[slot.districtId]}
          {@const color = ACTION_COLORS[slot.action] || '#9a9a9a'}
          <div class="cal-side-slot filled" style="border-left-color:{color}">
            <div class="cal-side-district" onclick={() => navigateToDistrict(slot.districtId)}>
              {d ? d.name : slot.districtId}
            </div>
            <div class="cal-side-action" style="color:{color}">{slot.action.toUpperCase()}</div>
            {#if d?.concern}
              <div class="cal-side-concern">{d.concern}</div>
            {/if}
            {#if d}
              <div class="cal-side-trust">{d.trust}</div>
              <div class="cal-side-trust-label">LOCAL TRUST</div>
            {/if}
          </div>
        {:else}
          <div class="cal-side-slot empty">
            {unscheduledLabels.length > 0 ? 'Click a queue chip to assign' : 'No labels in queue'}
          </div>
        {/if}
      {:else}
        <div class="cal-side-no-slot">No slots on this day. Visits are on Mon / Wed / Fri.</div>
      {/if}

      <div class="cal-side-back-section">
        <button class="cal-btn-end cal-btn-back" onclick={backToWeek}>BACK TO WEEK</button>
      </div>

    {:else}
      <!-- Week summary mode -->
      <div class="sidebar-section">
        <div class="cal-side-week-title">WEEK {String($game.week).padStart(2, '0')}</div>
        <div class="cal-side-week-subtitle">{$game.slotsTotal} slots &middot; {filledSlots} scheduled</div>

        <!-- Slot summary cards -->
        {#each $game.schedule as slot, i}
          {#if slot}
            {@const d = districtMap[slot.districtId]}
            {@const color = ACTION_COLORS[slot.action] || '#9a9a9a'}
            <div class="cal-side-slot filled" style="border-left-color:{color}">
              <div class="cal-side-slot-header">
                <div class="cal-side-district" onclick={() => navigateToDistrict(slot.districtId)}>
                  {d ? d.name : slot.districtId}
                </div>
                <div class="cal-side-slot-meta">
                  <span class="cal-side-day-label">{DAY_LABELS[i]}</span>
                  <button class="cal-remove-btn" title="Unschedule" onclick={() => unscheduleSlot(i)}>&times;</button>
                </div>
              </div>
              <div class="cal-side-action" style="color:{color}">{slot.action.toUpperCase()}</div>
            </div>
          {/if}
        {/each}

        <!-- Borough coverage -->
        <div class="cal-coverage">
          {#each ALL_BOROS as boro}
            {@const covered = coveredBoros.has(boro)}
            <span class="cal-boro-tag">
              {BORO_ABBREV[boro]}
              {#if covered}
                <span class="check-mark"> &#10003;</span>
              {:else}
                <span class="dash-mark"> &mdash;</span>
              {/if}
            </span>
          {/each}
        </div>
      </div>

      <!-- Commitments from DMs -->
      {#if unreadDms.length > 0}
        <div class="cal-commitments">
          <span class="micro-label cal-commitments-label">COMMITMENTS</span>
          {#each unreadDms as dm}
            {@const lastMsg = dm.messages[dm.messages.length - 1]}
            {#if lastMsg && !lastMsg.sent}
              <div class="cal-commitment-item">
                <span class="cal-side-district" onclick={() => navigateToDistrict(dm.districtId)}>
                  {dm.characterName}
                </span>: {lastMsg.text.substring(0, 50)}{lastMsg.text.length > 50 ? '...' : ''}
              </div>
            {/if}
          {/each}
        </div>
      {/if}

      <!-- GO + END WEEK -->
      <div class="sidebar-section cal-actions-section">
        <button
          class="cal-btn-go"
          disabled={!$game.schedule.some(Boolean) || $game.weekStarted}
          onclick={handleGo}
        >GO</button>

        {#if unscheduledLabels.length > 0}
          <div class="cal-unscheduled-note">{unscheduledLabels.length} unscheduled &mdash; will carry to next week</div>
        {/if}

        <button class="cal-btn-end" onclick={handleEndWeek}>END WEEK</button>
        <button class="cal-btn-policy" onclick={openBento}>
          <span class="material-symbols-rounded" style="font-size:14px">grid_view</span>
          POLICY BUILDER
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  /* ── Layout ── */
  .calendar-view {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  .view-main {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;
  }
  .view-sidebar {
    width: 260px;
    flex-shrink: 0;
    padding: 20px 16px;
    border-left: 1px solid var(--divider);
    overflow-y: auto;
  }

  /* ── Month header ── */
  .cal-month-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .cal-month-title {
    font-family: var(--font-data);
    font-size: 24px;
    font-weight: 900;
    color: var(--dark);
    letter-spacing: -0.02em;
  }
  .cal-month-nav {
    display: flex;
    gap: 4px;
  }
  .cal-month-nav button {
    background: none;
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-size: 12px;
    color: var(--secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.12s;
  }
  .cal-month-nav button:hover {
    border-color: var(--dark);
    color: var(--dark);
  }

  /* ── Week indicator ── */
  .cal-week-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 0 16px;
  }
  .cal-week-label {
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.08em;
    white-space: nowrap;
  }
  .cal-progress {
    flex: 1;
    height: 2px;
    background: var(--divider);
    border-radius: 1px;
  }
  .cal-progress-fill {
    height: 100%;
    background: var(--red);
    border-radius: 1px;
    transition: width 0.3s;
  }

  /* ── Day-of-week headers ── */
  .cal-dow-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid var(--divider);
    padding-bottom: 6px;
    margin-bottom: 0;
  }
  .cal-dow {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-align: left;
    padding: 0 4px;
  }

  /* ── Grid ── */
  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .cal-cell {
    min-height: 72px;
    padding: 6px 6px 8px;
    border-bottom: 1px solid var(--divider);
    cursor: default;
    position: relative;
    transition: background 0.12s;
  }
  .cal-cell:hover {
    background: rgba(0,0,0,0.015);
  }
  .cal-cell.out-of-month {
    opacity: 0.18;
  }
  .cal-cell.past {
    opacity: 0.5;
  }
  .cal-cell.current-week {
    background: rgba(255,45,45,0.03);
  }
  .cal-cell.current-week:hover {
    background: rgba(255,45,45,0.06);
    cursor: pointer;
  }
  .cal-cell.disaster-zone:not(.current-week) {
    background: rgba(255,100,45,0.02);
  }
  .cal-cell.selected-day {
    background: rgba(255,45,45,0.08) !important;
  }

  /* ── Day numbers ── */
  .cal-day-num {
    font-family: var(--font-data);
    font-size: 20px;
    font-weight: 700;
    color: var(--dark);
    line-height: 1;
    margin-bottom: 4px;
  }
  .cal-day-num.today {
    background: var(--red);
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  /* ── Day agenda items ── */
  .cal-day-agenda {
    font-size: 10px;
    font-weight: 600;
    line-height: 1.4;
    margin-top: 2px;
  }
  .cal-agenda-item {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    cursor: pointer;
  }
  .cal-agenda-item:hover {
    text-decoration: underline;
  }
  .cal-agenda-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── Queue strip ── */
  .cal-queue-strip {
    padding: 14px 0 8px;
    border-top: 1px solid var(--divider);
    margin-top: 4px;
  }
  .cal-queue-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  .cal-queue-count {
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    color: var(--muted);
  }
  .cal-queue-empty {
    color: var(--muted);
    font-size: 11px;
    padding: 8px 0;
  }
  .cal-queue-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 6px 0;
    scrollbar-width: none;
  }
  .cal-queue-row::-webkit-scrollbar {
    display: none;
  }
  .cal-queue-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    cursor: grab;
    transition: box-shadow 0.15s;
  }
  .cal-queue-chip:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .cal-queue-chip.scheduled {
    opacity: 0.35;
    cursor: default;
  }
  .cal-queue-chip.dragging {
    opacity: 0.3;
    transform: scale(0.97);
  }
  .cal-queue-chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .cal-trust-sm {
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    color: var(--muted);
    margin-left: auto;
  }
  .cal-chip-remove, .cal-remove-btn {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 14px;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
    transition: color 0.12s;
  }
  .cal-chip-remove:hover, .cal-remove-btn:hover {
    color: var(--red);
  }

  /* ── Sidebar: day detail ── */
  .cal-side-day {
    font-family: var(--font-data);
    font-size: 14px;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .cal-side-day-date {
    font-weight: 500;
    color: var(--secondary);
    font-size: 11px;
    margin-left: 4px;
  }
  .cal-side-no-slot {
    color: var(--muted);
    font-size: 12px;
    padding: 8px 0;
  }
  .cal-side-back-section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--divider);
  }
  .cal-btn-back {
    height: 32px !important;
    font-size: 10px !important;
  }

  /* ── Sidebar: slot cards ── */
  .cal-side-slot {
    padding: 12px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    margin-bottom: 8px;
  }
  .cal-side-slot.filled {
    border-left: 3px solid;
  }
  .cal-side-slot.empty {
    border-style: dashed;
    color: var(--muted);
    font-size: 12px;
    text-align: center;
    cursor: pointer;
  }
  .cal-side-slot.empty:hover {
    border-color: var(--red);
    color: var(--red);
  }
  .cal-side-slot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cal-side-slot-meta {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .cal-side-day-label {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
  }
  .cal-side-district {
    font-size: 14px;
    font-weight: 700;
    color: var(--dark);
    cursor: pointer;
  }
  .cal-side-district:hover {
    color: var(--red);
    text-decoration: underline;
  }
  .cal-side-action {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-top: 2px;
  }
  .cal-side-concern {
    font-size: 11px;
    font-style: italic;
    color: var(--secondary);
    margin-top: 4px;
    padding-left: 8px;
    border-left: 2px solid var(--red);
  }
  .cal-side-trust {
    font-family: var(--font-data);
    font-size: 22px;
    font-weight: 900;
    color: var(--dark);
    margin: 8px 0 4px;
  }
  .cal-side-trust-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ── Sidebar: week summary ── */
  .cal-side-week-title {
    font-family: var(--font-data);
    font-size: 18px;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 12px;
  }
  .cal-side-week-subtitle {
    font-size: 12px;
    color: var(--secondary);
    margin-bottom: 12px;
  }

  /* ── Borough coverage ── */
  .cal-coverage {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 10px 0;
  }
  .cal-boro-tag {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--secondary);
  }
  .cal-boro-tag .check-mark {
    color: #34d399;
    margin-left: 2px;
  }
  .cal-boro-tag .dash-mark {
    color: var(--muted);
    margin-left: 2px;
  }

  /* ── Commitments ── */
  .cal-commitments {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--divider);
  }
  .cal-commitments-label {
    display: block;
    margin-bottom: 8px;
  }
  .cal-commitment-item {
    font-size: 11px;
    color: var(--secondary);
    padding: 4px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .cal-commitment-item::before {
    content: '\25CF';
    color: var(--red);
    font-size: 6px;
  }

  /* ── GO / End Week buttons ── */
  .cal-actions-section {
    margin-top: 16px;
  }
  .cal-btn-go {
    width: 100%;
    height: 44px;
    background: var(--red);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: var(--font-data);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .cal-btn-go:hover:not(:disabled) {
    opacity: 0.9;
  }
  .cal-btn-go:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .cal-btn-end {
    width: 100%;
    height: 44px;
    background: transparent;
    color: var(--secondary);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    font-family: var(--font-data);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .cal-btn-end:hover {
    border-color: rgba(0,0,0,0.25);
    color: var(--dark);
  }
  .cal-btn-policy {
    width: 100%;
    height: 36px;
    background: var(--dark3);
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    font-family: var(--font-data);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
    transition: all 0.15s ease;
  }
  .cal-btn-policy:hover {
    background: var(--dark2);
    border-color: rgba(255,255,255,0.2);
    color: #fff;
  }
  .cal-unscheduled-note {
    font-size: 11px;
    color: var(--muted);
    text-align: center;
    margin: 6px 0;
  }

  /* ── Sidebar sections ── */
  .sidebar-section {
    margin-bottom: 16px;
  }
  .sidebar-section + .sidebar-section {
    padding-top: 16px;
    border-top: 1px solid var(--divider);
  }

  /* ── Shared utility ── */
  .micro-label {
    font-family: var(--font-data);
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
</style>
