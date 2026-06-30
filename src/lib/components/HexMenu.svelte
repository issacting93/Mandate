<script>
  import { selectedDistrict } from '$lib/stores/game.js';
  import { emitEngagement } from '$lib/engine.js';
  import { HEX_ACTIONS } from '$data/districts.js';

  let { districtId, district, hexPoints } = $props();

  let actionDist = $derived(district.r + 70);
  const hexR = 28;

  function actionPos(angle) {
    const rad = angle * Math.PI / 180;
    return {
      x: district.x + actionDist * Math.cos(rad),
      y: district.y + actionDist * Math.sin(rad),
      rad,
    };
  }

  function handleAction(actionId) {
    if (actionId === 'close') {
      closeWithAnimation();
      return;
    }
    if (actionId === 'info') {
      emitEngagement(actionId, districtId);
      return;
    }
    // VISIT, LISTEN, MSG — perform action then animate close
    emitEngagement(actionId, districtId);
    closeWithAnimation();
  }

  let hoveredAction = $state(null);
  let closing = $state(false);

  function closeWithAnimation() {
    closing = true;
    setTimeout(() => {
      closing = false;
      selectedDistrict.set(null);
    }, 300);
  }
</script>

<g class="hex-menu" class:closing style="transform-origin:{district.x}px {district.y}px">
  <!-- Selection ring -->
  <polygon
    points={hexPoints(district.x, district.y, district.r + 9)}
    fill="none"
    stroke="#ff2d2d"
    stroke-width="2.5"
    class="pulse"
  />

  {#each HEX_ACTIONS as action, i}
    {@const pos = actionPos(action.angle)}
    {@const labelDist = hexR + 14}
    {@const lx = pos.x + labelDist * Math.cos(pos.rad)}
    {@const ly = pos.y + labelDist * Math.sin(pos.rad)}
    {@const isHovered = hoveredAction === action.id}

    <g>
      <!-- Connector line -->
      <line
        x1={district.x} y1={district.y} x2={pos.x} y2={pos.y}
        stroke="rgba(255,255,255,0.2)" stroke-width="1" pointer-events="none"
      />

      <!-- Hex button -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <g
        class="hex-item"
        onclick={(e) => { e.stopPropagation(); handleAction(action.id); }}
        onmouseenter={() => hoveredAction = action.id}
        onmouseleave={() => hoveredAction = null}
        style="cursor:pointer"
      >
        <polygon
          points={hexPoints(pos.x, pos.y, isHovered ? hexR * 1.1 : hexR)}
          fill="rgba(18,18,24,0.85)"
          stroke={isHovered ? '#ff2d2d' : 'rgba(255,255,255,0.3)'}
          stroke-width="1.2"
        />
        <!-- Material icon -->
        <text
          x={pos.x} y={pos.y + 6}
          text-anchor="middle"
          font-family="'Material Symbols Rounded'"
          font-size="18"
          fill={isHovered ? '#fff' : 'rgba(255,255,255,0.9)'}
          pointer-events="none"
        >{action.icon}</text>
      </g>

      <!-- Label outside hex -->
      <text
        x={lx} y={ly + 3.5}
        text-anchor="middle"
        class="hex-label"
        fill={isHovered ? '#ff2d2d' : 'rgba(255,255,255,0.6)'}
        pointer-events="none"
      >{action.label}</text>
    </g>
  {/each}
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
    font-family: 'Doto', monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  .hex-item polygon {
    transition: fill 80ms ease, stroke 80ms ease;
  }

  /* Closing animation: collapse to center + fade */
  .hex-menu.closing {
    animation: hex-collapse 300ms ease-in forwards;
  }
  .hex-menu.closing .hex-item,
  .hex-menu.closing .hex-label,
  .hex-menu.closing line {
    animation: hex-fade 250ms ease-in forwards;
  }
  @keyframes hex-collapse {
    to {
      opacity: 0;
      transform: scale(0.3);
    }
  }
  @keyframes hex-fade {
    to { opacity: 0; }
  }
</style>
