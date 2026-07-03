<script>
  import { onboardingComplete, game, currentView } from '$lib/stores/game.js';
  import { DISTRICTS } from '$data/districts.js';
  import { dealHand } from '$lib/engine.js';

  let beat = $state(1);           // 1-6 = active beats
  let phase = $state('visible');  // 'visible' | 'exit'
  let subStep = $state(0);       // sub-animation step within a beat
  let policyApplied = $state(false);
  let flashActive = $state(false);


  function transitionTo(nextBeat) {
    phase = 'exit';
    setTimeout(() => {
      beat = nextBeat;
      subStep = 0;
      policyApplied = false;
      phase = 'visible';
    }, 400);
  }

  function skipOnboarding() {
    onboardingComplete.set(true);
  }

  function handleTakeOffice() {
    flashActive = true;
    setTimeout(() => {
      flashActive = false;
      transitionTo(2);
    }, 600);
  }

  function handleSignPolicy() {
    policyApplied = true;
    // Apply the mild trust bump and budget hit
    DISTRICTS.forEach(d => { d.trust = Math.min(100, d.trust + 2); });
    game.update(g => {
      g.reserve = Math.max(0, g.reserve - 0.8);
      return g;
    });
    // Show the staff follow-up after a beat
    setTimeout(() => { subStep = 1; }, 1200);
  }

  function handleGoToMeeting() {
    transitionTo(4);
  }

  function handleBeat4Start() {
    // Narrative-only: describe the conversation, don't launch it
    subStep = 1;
    // Simulate discovering an insight
    game.update(g => {
      if (!g.insights.some(i => i.districtId === 'southbronx')) {
        g.insights.push({
          category: 'HEALTH',
          text: 'Asthma corridor near Bruckner Expressway — 3x city average',
          districtId: 'southbronx',
          week: 0,
          freshness: 1.0,
        });
      }
      return g;
    });
    // Auto-advance to beat 5 after reading
    setTimeout(() => transitionTo(5), 4000);
  }

  function handleBeat5Continue() {
    transitionTo(6);
  }

  function handleBeginMandate() {
    phase = 'exit';
    setTimeout(() => {
      onboardingComplete.set(true);
      currentView.set('draft');
      dealHand();
    }, 800);
  }

  // Derived: count insights the player earned
  let insightCount = $derived($game.insights.length);

</script>

{#if !$onboardingComplete}
  <div class="onboarding-overlay" class:flash={flashActive}>

    <!-- Skip button -->
    <button class="skip-btn" onclick={skipOnboarding}>SKIP</button>

    <!-- ═══ BEAT 1 — The Briefing ═══ -->
    {#if beat === 1}
      <div class="beat-container" class:visible={phase === 'visible'} class:exit={phase === 'exit'}>
        <div class="newspaper">
          <div class="newspaper-masthead">THE NEW YORK STANDARD</div>
          <div class="newspaper-date">JANUARY 1, 2026 &middot; INAUGURATION EDITION</div>
          <div class="newspaper-rule"></div>
          <div class="newspaper-headline">NEW MAYOR SWORN IN<br/>AT CITY HALL</div>
          <div class="newspaper-rule"></div>
          <div class="newspaper-sub">
            "I do solemnly swear that I will faithfully discharge the duties<br/>
            of the office of Mayor of the City of New York."
          </div>
          <div class="newspaper-body">
            Inherits $5B budget, 19 districts across five boroughs.<br/>
            First 100 days expected to set the tone for the administration.<br/>
            A winter storm watch is in effect through the week.
          </div>
          <button class="oath-btn" onclick={handleTakeOffice}>
            TAKE OFFICE
          </button>
        </div>
      </div>
    {/if}

    <!-- ═══ BEAT 2 — The Desk ═══ -->
    {#if beat === 2}
      <div class="beat-container" class:visible={phase === 'visible'} class:exit={phase === 'exit'}>
        <div class="desk-scene">
          <div class="staff-line">Your Chief of Staff slides a folder across the desk.</div>

          <div class="policy-card" class:signed={policyApplied}>
            <div class="policy-label">POLICY DIRECTIVE</div>
            <div class="policy-title">Citywide Housing Initiative</div>
            <div class="policy-detail">
              <span class="policy-cost">$0.8B</span>
              <span class="policy-scope">All 19 districts</span>
            </div>
            <div class="policy-desc">
              Broad allocation for housing inspection, code enforcement upgrades,
              and emergency shelter capacity across the city.
            </div>

            {#if !policyApplied}
              <button class="sign-btn" onclick={handleSignPolicy}>
                SIGN
              </button>
            {:else}
              <div class="policy-result">
                <span class="result-trust">TRUST +2 citywide</span>
                <span class="result-budget">RESERVE -$0.8B</span>
              </div>
            {/if}
          </div>

          {#if subStep >= 1}
            <div class="staff-followup" onclick={() => transitionTo(3)}>
              <span class="staff-voice">"Ready for the next one?"</span>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- ═══ BEAT 3 — The Interruption ═══ -->
    {#if beat === 3}
      <div class="beat-container" class:visible={phase === 'visible'} class:exit={phase === 'exit'}>
        <div class="interruption-scene">
          <div class="interrupt-label">SCHEDULER</div>
          <div class="interrupt-text">
            "Mayor &mdash; community board meeting tonight in the South Bronx.
            They've been asking for months."
          </div>
          <div class="interrupt-sub">
            "Or we can skip it. There's plenty on the desk."
          </div>

          <div class="interrupt-choices">
            <button class="choice-go" onclick={handleGoToMeeting}>
              GO TO THE MEETING
            </button>
            <button class="choice-stay" disabled>
              STAY AT THE DESK
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- ═══ BEAT 4 — First Conversation (narrative) ═══ -->
    {#if beat === 4}
      <div class="beat-container" class:visible={phase === 'visible'} class:exit={phase === 'exit'}>
        <div class="travel-scene">
          <div class="travel-district">SOUTH BRONX</div>
          <div class="travel-boro">The Bronx</div>
          <div class="travel-line"></div>

          {#if subStep === 0}
            <div class="travel-text">
              One bright dot against eighteen dim ones.
            </div>
            <button class="arrive-btn" onclick={handleBeat4Start}>
              ARRIVE
            </button>
          {:else}
            <div class="convo-narrative">
              <div class="narrator-line">You meet Maria Delgado. Tenant organizer. Tired eyes, steady voice.</div>
              <div class="narrator-quote">"The heat's been out since November. Third winter. Code enforcement won't come. The pharmacy on 138th has a generator — that's the only thing keeping insulin cold for the whole block."</div>
              <div class="insight-earned">
                <span class="insight-chip">HEALTH</span>
                Asthma corridor near Bruckner — 3x city average
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- ═══ BEAT 5 — The Contrast ═══ -->
    {#if beat === 5}
      <div class="beat-container" class:visible={phase === 'visible'} class:exit={phase === 'exit'}>
        <div class="contrast-scene">
          <div class="contrast-header">BACK AT CITY HALL</div>

          <div class="contrast-split">
            <div class="contrast-col notebook-col">
              <div class="contrast-label">YOUR NOTEBOOK</div>
              <div class="contrast-count">{insightCount}</div>
              <div class="contrast-unit">insight{insightCount !== 1 ? 's' : ''}</div>
              <div class="contrast-sub">Earned on the ground.<br/>Specific. Named. Real.</div>
            </div>

            <div class="contrast-divider"></div>

            <div class="contrast-col policy-col">
              <div class="contrast-label">THE POLICY YOU SIGNED</div>
              <div class="contrast-count">$0.8B</div>
              <div class="contrast-unit">spent</div>
              <div class="contrast-sub">Trust +2 everywhere.<br/>Trust +0 where it matters.</div>
            </div>
          </div>

          <div class="contrast-closing">
            That's day one. You have 47 weeks left.
          </div>

          <button class="continue-btn" onclick={handleBeat5Continue}>
            CONTINUE
          </button>
        </div>
      </div>
    {/if}

    <!-- ═══ BEAT 6 — Handoff ═══ -->
    {#if beat === 6}
      <div class="beat-container" class:visible={phase === 'visible'} class:exit={phase === 'exit'}>
        <div class="handoff-scene">
          <div class="handoff-map-hint">
            <span class="bright-dot"></span>
            <span class="dim-dots">
              <span class="dim-dot"></span><span class="dim-dot"></span><span class="dim-dot"></span>
              <span class="dim-dot"></span><span class="dim-dot"></span><span class="dim-dot"></span>
              <span class="dim-dot"></span><span class="dim-dot"></span><span class="dim-dot"></span>
              <span class="dim-dot"></span><span class="dim-dot"></span><span class="dim-dot"></span>
              <span class="dim-dot"></span><span class="dim-dot"></span><span class="dim-dot"></span>
              <span class="dim-dot"></span><span class="dim-dot"></span><span class="dim-dot"></span>
            </span>
          </div>
          <div class="handoff-views">
            <span class="view-tag">MAP</span>
            <span class="view-tag">CALENDAR</span>
            <span class="view-tag">SOCIAL</span>
          </div>
          <div class="handoff-slots">3 slots. 19 districts. 47 weeks.</div>
          <div class="handoff-question">Where do you want to go?</div>

          <button class="begin-btn" onclick={handleBeginMandate}>
            BEGIN
          </button>
        </div>
      </div>
    {/if}

  </div>
{/if}

<style>
  /* ── Overlay shell ── */
  .onboarding-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(8, 8, 8, 0.65);
    display: grid;
    place-items: center;
    transition: background 0.6s ease;
  }

  .onboarding-overlay.flash {
    background: rgba(255, 255, 255, 0.95);
    transition: background 0.08s ease;
  }

  .skip-btn {
    position: absolute;
    top: 16px;
    right: 20px;
    background: none;
    border: 1px solid var(--rule);
    color: var(--ink-muted);
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    padding: 6px 14px;
    cursor: pointer;
    z-index: 10;
  }
  .skip-btn:hover {
    color: var(--ink);
    border-color: var(--ink-muted);
  }

  /* ── Beat container: A4 paper document ── */
  .beat-container {
    width: 100%;
    max-width: 480px;
    aspect-ratio: 1 / 1.414;
    max-height: 90vh;
    background: var(--paper);
    border: 1px solid var(--rule);
    position: relative;
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .beat-container.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .beat-container.exit {
    opacity: 0;
    transform: translateY(-12px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }

  /* Corner brackets on the document */
  .beat-container::before,
  .beat-container::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    pointer-events: none;
  }
  .beat-container::before {
    top: 0; left: 0;
    border-top: 1px solid var(--red);
    border-left: 1px solid var(--red);
  }
  .beat-container::after {
    top: 0; right: 0;
    border-top: 1px solid var(--red);
    border-right: 1px solid var(--red);
  }

  /* ══════════════════════════════════════
     BEAT 1 — The Briefing (Newspaper)
     ══════════════════════════════════════ */
  .newspaper {
    text-align: center;
    color: var(--ink);
    width: 100%;
  }
  .newspaper-masthead {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  .newspaper-date {
    font-family: var(--font-body);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--ink-ghost);
    margin-top: 6px;
  }
  .newspaper-rule {
    margin: 16px auto;
    width: 280px;
    height: 1px;
    background: var(--rule);
  }
  .newspaper-headline {
    font-family: var(--font-display);
    font-size: 36px;
    letter-spacing: 0.02em;
    line-height: 1;
    color: var(--ink);
  }
  .newspaper-sub {
    font-family: var(--font-body);
    font-size: 11px;
    font-style: italic;
    color: var(--ink-mid);
    line-height: 1.6;
    margin-top: 4px;
  }
  .newspaper-body {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--ink-muted);
    line-height: 1.6;
    margin-top: 20px;
  }
  .oath-btn {
    margin-top: 36px;
    background: var(--ink);
    border: none;
    color: var(--paper);
    font-family: var(--font-display);
    font-size: 16px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 14px 48px;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .oath-btn:hover {
    background: var(--red);
  }

  /* ══════════════════════════════════════
     BEAT 2 — The Desk
     ══════════════════════════════════════ */
  .desk-scene {
    width: 100%;
    text-align: center;
    color: var(--ink);
  }
  .staff-line {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--ink-muted);
    font-style: italic;
    margin-bottom: 28px;
  }
  .policy-card {
    background: var(--paper-white);
    border: 1px solid var(--rule);
    border-top: 2px solid var(--red);
    padding: 28px 24px;
    text-align: left;
    transition: border-color 0.3s ease;
  }
  .policy-card.signed {
    border-color: var(--red);
  }
  .policy-label {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--ink-muted);
    text-transform: uppercase;
  }
  .policy-title {
    font-family: var(--font-display);
    font-size: 24px;
    color: var(--ink);
    margin-top: 8px;
  }
  .policy-detail {
    display: flex;
    gap: 16px;
    margin-top: 10px;
  }
  .policy-cost {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 700;
    color: var(--red);
  }
  .policy-scope {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--ink-muted);
    letter-spacing: 0.05em;
  }
  .policy-desc {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--ink-mid);
    line-height: 1.6;
    margin-top: 14px;
    border-left: 2px solid var(--rule);
    padding-left: 10px;
    font-style: italic;
  }
  .sign-btn {
    margin-top: 20px;
    width: 100%;
    background: var(--ink);
    border: none;
    color: var(--paper);
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 12px;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .sign-btn:hover {
    background: var(--red);
  }
  .policy-result {
    margin-top: 18px;
    display: flex;
    gap: 20px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards;
  }
  .result-trust {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 700;
    color: var(--green);
    letter-spacing: 0.05em;
  }
  .result-budget {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 700;
    color: var(--red);
    letter-spacing: 0.05em;
  }
  .staff-followup {
    margin-top: 28px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.2s forwards;
    cursor: pointer;
  }
  .staff-voice {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--ink-muted);
    font-style: italic;
    cursor: pointer;
  }
  .staff-voice:hover { color: var(--ink); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ══════════════════════════════════════
     BEAT 3 — The Interruption
     ══════════════════════════════════════ */
  .interruption-scene {
    width: 100%;
    text-align: center;
    color: var(--ink);
  }
  .interrupt-label {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: var(--ink-ghost);
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .interrupt-text {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--ink);
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }
  .interrupt-sub {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 16px;
    font-style: italic;
  }
  .interrupt-choices {
    margin-top: 36px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }
  .choice-go {
    background: var(--ink);
    border: none;
    color: var(--paper);
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 14px 24px;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .choice-go:hover {
    background: var(--red);
  }
  .choice-stay {
    background: transparent;
    border: 1px solid var(--rule);
    color: var(--ink-ghost);
    font-family: var(--font-body);
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 14px 24px;
    cursor: not-allowed;
    opacity: 0.4;
  }

  /* ══════════════════════════════════════
     BEAT 4 — First Conversation (travel)
     ══════════════════════════════════════ */
  .travel-scene {
    text-align: center;
    color: var(--ink);
  }
  .travel-district {
    font-family: var(--font-display);
    font-size: 36px;
    letter-spacing: 0.02em;
    color: var(--ink);
  }
  .travel-boro {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.25em;
    color: var(--ink-muted);
    text-transform: uppercase;
    margin-top: 6px;
  }
  .travel-line {
    margin: 24px auto;
    width: 60px;
    height: 2px;
    background: var(--red);
  }
  .travel-text {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--ink-muted);
    font-style: italic;
  }
  .arrive-btn {
    margin-top: 32px;
    background: var(--ink);
    border: none;
    color: var(--paper);
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 14px 48px;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .arrive-btn:hover {
    background: var(--red);
  }

  .convo-narrative {
    text-align: left;
    max-width: 420px;
    opacity: 0;
    animation: fadeUp 0.8s ease forwards;
  }
  .narrator-line {
    font-size: 12px;
    color: var(--ink-muted);
    font-style: italic;
    margin-bottom: 16px;
  }
  .narrator-quote {
    font-size: 13px;
    color: var(--ink);
    line-height: 1.6;
    border-left: 2px solid var(--red);
    padding-left: 14px;
    margin-bottom: 20px;
  }
  .insight-earned {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--ink-mid);
    padding: 8px 12px;
    background: var(--red-light);
    border: 1px solid var(--red-border);
    opacity: 0;
    animation: fadeUp 0.5s ease 1s forwards;
  }
  .insight-chip {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--red);
    padding: 2px 6px;
    border: 1px solid var(--red-border);
    flex-shrink: 0;
  }

  /* ══════════════════════════════════════
     BEAT 5 — The Contrast
     ══════════════════════════════════════ */
  .contrast-scene {
    width: 100%;
    text-align: center;
    color: var(--ink);
  }
  .contrast-header {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: var(--ink-ghost);
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .contrast-split {
    display: flex;
    align-items: stretch;
    gap: 0;
    width: 100%;
  }
  .contrast-col {
    flex: 1;
    padding: 24px 16px;
  }
  .contrast-divider {
    width: 1px;
    background: var(--rule);
    align-self: stretch;
  }
  .contrast-label {
    font-family: var(--font-body);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--ink-muted);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .contrast-count {
    font-family: var(--font-display);
    font-size: 48px;
    line-height: 1;
  }
  .notebook-col .contrast-count {
    color: var(--red);
  }
  .policy-col .contrast-count {
    color: var(--ink-ghost);
  }
  .contrast-unit {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--ink-muted);
    text-transform: uppercase;
    margin-top: 4px;
  }
  .contrast-sub {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--ink-mid);
    line-height: 1.5;
    margin-top: 12px;
  }
  .contrast-closing {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--ink-mid);
    font-style: italic;
    margin-top: 36px;
  }
  .continue-btn {
    margin-top: 28px;
    background: transparent;
    border: 1px solid var(--rule);
    color: var(--ink-muted);
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 12px 48px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .continue-btn:hover {
    border-color: var(--ink-muted);
    color: var(--ink);
  }

  /* ══════════════════════════════════════
     BEAT 6 — Handoff
     ══════════════════════════════════════ */
  .handoff-scene {
    text-align: center;
    color: var(--ink);
  }
  .handoff-map-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 32px;
  }
  .bright-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--red);
  }
  .dim-dots {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    max-width: 120px;
  }
  .dim-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--rule);
  }
  .handoff-views {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 24px;
  }
  .view-tag {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--ink-muted);
    text-transform: uppercase;
    padding: 6px 14px;
    border: 1px solid var(--rule);
    opacity: 0;
    animation: fadeUp 0.4s ease forwards;
  }
  .view-tag:nth-child(1) { animation-delay: 0.1s; }
  .view-tag:nth-child(2) { animation-delay: 0.3s; }
  .view-tag:nth-child(3) { animation-delay: 0.5s; }

  .handoff-slots {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--ink-muted);
    letter-spacing: 0.08em;
  }
  .handoff-question {
    font-family: var(--font-body);
    font-size: 18px;
    font-weight: 700;
    color: var(--ink);
    margin-top: 20px;
  }
  .begin-btn {
    margin-top: 36px;
    background: var(--ink);
    border: none;
    color: var(--paper);
    font-family: var(--font-display);
    font-size: 16px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 14px 56px;
    cursor: pointer;
    transition: background 0.25s ease;
  }
  .begin-btn:hover {
    background: var(--red);
  }
</style>
