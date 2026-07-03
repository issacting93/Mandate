<script>
  import { selectedDistrict, game } from '$lib/stores/game.js';
  import { toggleWanted, showToast, deptSys } from '$lib/engine.js';
  import { DEPARTMENTS, DEPT_IDS } from '$systems/department.js';
  import { CONCERN_SCORES } from '$data/districts.js';

  let { districtId, district, hexPoints } = $props();

  // 6 departments arranged in a ring, plus WANT action at top
  const CABINET_RING = [
    { id: 'HEALTH',    angle: -90 },
    { id: 'HOUSING',   angle: -30 },
    { id: 'INFRA',     angle: 30 },
    { id: 'SERVICES',  angle: 90 },
    { id: 'SAFETY',    angle: 150 },
    { id: 'COMMUNITY', angle: 210 },
  ];

  // Concern score key for each department
  const DEPT_CONCERN_KEY = {
    HEALTH: 'health', HOUSING: 'housing', INFRA: 'infra',
    SERVICES: 'services', SAFETY: 'safety', COMMUNITY: 'community',
  };

  let actionDist = $derived(district.r + 70);
  const hexR = 24;

  function actionPos(angle) {
    const rad = angle * Math.PI / 180;
    return {
      x: district.x + actionDist * Math.cos(rad),
      y: district.y + actionDist * Math.sin(rad),
      rad,
    };
  }

  // Get concern level for this dept in this district
  function getConcern(deptId) {
    const key = DEPT_CONCERN_KEY[deptId];
    return CONCERN_SCORES[districtId]?.[key] || 0;
  }

  // Is this department funded enough to speak?
  function isFunded(deptId) {
    return deptSys ? deptSys.getEffectiveLevel(deptId) >= 2 : false;
  }

  // Has something to say: funded AND concern > 3
  function hasVoice(deptId) {
    return isFunded(deptId) && getConcern(deptId) >= 3;
  }

  // Cabinet whisper: one-line interjection based on concern level + dept
  function getWhisper(deptId) {
    const concern = getConcern(deptId);
    const dept = DEPARTMENTS[deptId];
    const name = district.name;

    if (!isFunded(deptId)) {
      return `Fund ${dept.label} to read ${name}.`;
    }
    if (concern <= 2) return `${dept.label}: Nothing urgent here.`;
    if (concern <= 4) return `${dept.label}: Minor signals. Worth watching.`;
    if (concern <= 6) return `${dept.label}: Active concern. Visit recommended.`;
    if (concern <= 8) return `${dept.label}: Significant pressure. Prioritize.`;
    return `${dept.label}: Critical. This district needs you now.`;
  }

  let hoveredDept = $state(null);
  let closing = $state(false);
  let whisperText = $state(null);

  function handleDeptClick(deptId) {
    whisperText = getWhisper(deptId);
    // Auto-dismiss after 3s
    setTimeout(() => { if (whisperText === getWhisper(deptId)) whisperText = null; }, 3000);
  }

  function handleWant() {
    toggleWanted(districtId);
    const isNowWanted = ($game.wanted || []).includes(districtId);
    showToast(`${district.name} — ${isNowWanted ? 'wanted' : 'unmarked'}`, '#B82A18');
  }

  function closeWithAnimation() {
    closing = true;
    whisperText = null;
    setTimeout(() => {
      closing = false;
      selectedDistrict.set(null);
    }, 300);
  }

  let isWanted = $derived(($game.wanted || []).includes(districtId));
</script>

<g class="hex-menu" class:closing style="transform-origin:{district.x}px {district.y}px">
  <!-- Selection ring -->
  <polygon
    points={hexPoints(district.x, district.y, district.r + 9)}
    fill="none"
    stroke="var(--red)"
    stroke-width="2.5"
    class="pulse"
  />

  <!-- District name label -->
  <text
    x={district.x} y={district.y - district.r - 18}
    text-anchor="middle"
    class="district-label"
    fill="rgba(255,255,255,0.7)"
    pointer-events="none"
  >{district.name}</text>

  <!-- 6 Department hexes -->
  {#each CABINET_RING as slot}
    {@const pos = actionPos(slot.angle)}
    {@const dept = DEPARTMENTS[slot.id]}
    {@const concern = getConcern(slot.id)}
    {@const funded = isFunded(slot.id)}
    {@const voice = hasVoice(slot.id)}
    {@const isHovered = hoveredDept === slot.id}
    {@const labelDist = hexR + 14}
    {@const lx = pos.x + labelDist * Math.cos(pos.rad)}
    {@const ly = pos.y + labelDist * Math.sin(pos.rad)}
    <!-- Fill intensity: concern level drives opacity when funded -->
    {@const fillOpacity = funded ? 0.15 + (concern / 9) * 0.6 : 0.04}
    {@const fillColor = funded ? dept.color : 'rgba(255,255,255,0.05)'}

    <g>
      <!-- Connector line -->
      <line
        x1={district.x} y1={district.y} x2={pos.x} y2={pos.y}
        stroke={funded ? dept.color : 'rgba(255,255,255,0.08)'}
        stroke-width="1"
        stroke-opacity={funded ? 0.4 : 0.2}
        pointer-events="none"
      />

      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <g
        class="hex-item"
        onclick={(e) => { e.stopPropagation(); handleDeptClick(slot.id); }}
        onmouseenter={() => hoveredDept = slot.id}
        onmouseleave={() => hoveredDept = null}
        style="cursor:pointer"
      >
        <polygon
          points={hexPoints(pos.x, pos.y, isHovered ? hexR * 1.1 : hexR)}
          fill={isHovered && funded ? dept.color : `rgba(18,18,24,0.85)`}
          fill-opacity={isHovered && funded ? 0.9 : 1}
          stroke={funded ? dept.color : 'rgba(255,255,255,0.12)'}
          stroke-width={voice ? 1.5 : 0.8}
          stroke-opacity={funded ? 0.7 : 0.3}
        />

        <!-- Concern level fill bar (inner) -->
        {#if funded && concern > 0}
          <rect
            x={pos.x - hexR * 0.55}
            y={pos.y + hexR * 0.25}
            width={hexR * 1.1 * (concern / 9)}
            height="3"
            fill={dept.color}
            opacity="0.6"
            pointer-events="none"
          />
        {/if}

        <!-- Dept initial -->
        <text
          x={pos.x} y={pos.y + 2}
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="var(--font-display)"
          font-size={funded ? '16' : '14'}
          fill={funded ? '#fff' : 'rgba(255,255,255,0.2)'}
          pointer-events="none"
        >{dept.label.slice(0, 1)}</text>

        <!-- Concern number (small, bottom-right) -->
        {#if funded}
          <text
            x={pos.x + hexR * 0.45}
            y={pos.y - hexR * 0.35}
            text-anchor="end"
            font-family="var(--font-body)"
            font-size="7"
            font-weight="700"
            fill={concern >= 7 ? dept.color : 'rgba(255,255,255,0.4)'}
            pointer-events="none"
          >{concern}</text>
        {/if}
      </g>

      <!-- Label -->
      <text
        x={lx} y={ly + 3.5}
        text-anchor="middle"
        class="hex-label"
        fill={isHovered ? (funded ? dept.color : 'rgba(255,255,255,0.3)') : (funded ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)')}
        pointer-events="none"
      >{dept.label.toUpperCase()}</text>
    </g>
  {/each}

  <!-- WANT toggle (small, below district) -->
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <g
    class="hex-item"
    onclick={(e) => { e.stopPropagation(); handleWant(); }}
    style="cursor:pointer"
  >
    <text
      x={district.x + district.r + 16} y={district.y + 4}
      text-anchor="start"
      font-family="var(--font-body)"
      font-size="7"
      font-weight="700"
      letter-spacing="0.1em"
      fill={isWanted ? 'var(--red)' : 'rgba(255,255,255,0.3)'}
    >{isWanted ? '★ WANTED' : '☆ WANT'}</text>
  </g>

  <!-- CLOSE button (small x) -->
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <g
    class="hex-item"
    onclick={(e) => { e.stopPropagation(); closeWithAnimation(); }}
    style="cursor:pointer"
  >
    <text
      x={district.x - district.r - 16} y={district.y + 4}
      text-anchor="end"
      font-family="'Material Symbols Rounded'"
      font-size="14"
      fill="rgba(255,255,255,0.3)"
    >close</text>
  </g>

  <!-- Whisper bubble -->
  {#if whisperText}
    {@const wy = district.y + district.r + actionDist + hexR + 20}
    <g class="whisper" style="animation: whisper-in 0.3s ease forwards">
      <rect
        x={district.x - 130} y={wy - 12}
        width="260" height="24"
        fill="rgba(18,18,24,0.92)"
        stroke="rgba(255,255,255,0.15)"
        stroke-width="0.5"
      />
      <text
        x={district.x} y={wy + 2}
        text-anchor="middle"
        class="whisper-text"
        fill="rgba(255,255,255,0.75)"
        pointer-events="none"
      >{whisperText}</text>
    </g>
  {/if}
</g>

<style>
  .pulse {
    animation: pulse-ring 3s ease-in-out infinite;
  }
  @keyframes pulse-ring {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .hex-label {
    font-family: var(--font-body);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.1em;
  }
  .district-label {
    font-family: var(--font-display);
    font-size: 14px;
    letter-spacing: 1px;
  }
  .hex-item polygon {
    transition: fill 100ms ease, stroke 100ms ease, fill-opacity 100ms ease;
  }
  .whisper-text {
    font-family: var(--font-body);
    font-size: 8px;
    font-style: italic;
    letter-spacing: 0.02em;
  }

  @keyframes whisper-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hex-menu.closing {
    animation: hex-collapse 300ms ease-in forwards;
  }
  .hex-menu.closing .hex-item,
  .hex-menu.closing .hex-label,
  .hex-menu.closing .whisper,
  .hex-menu.closing line {
    animation: hex-fade 250ms ease-in forwards;
  }
  @keyframes hex-collapse {
    to { opacity: 0; transform: scale(0.3); }
  }
  @keyframes hex-fade {
    to { opacity: 0; }
  }
</style>
