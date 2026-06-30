<script>
  import { DISTRICTS, BLOC_COLORS, BLOC_NAMES } from '$data/districts.js';
  import { game } from '$lib/stores/game.js';

  // Recomputes when game week changes (trust mutations happen during week transitions)
  let blocs = $derived.by(() => {
    void $game.week; // dependency trigger — DISTRICTS.trust is mutable, not reactive
    const groups = {};
    DISTRICTS.forEach(d => {
      if (!groups[d.bloc]) groups[d.bloc] = { trusts: [], color: BLOC_COLORS[d.bloc], name: BLOC_NAMES[d.bloc] };
      groups[d.bloc].trusts.push(d.trust);
    });
    return Object.entries(groups).map(([key, b]) => ({
      key, name: b.name, color: b.color,
      avg: Math.round(b.trusts.reduce((a, c) => a + c, 0) / b.trusts.length),
    }));
  });
</script>

<div class="bloc-bar">
  {#each blocs as bloc}
    <span>
      <span class="bloc-dot" style="background:{bloc.color}"></span>
      {bloc.name}
      <span class="bloc-val">{bloc.avg}%</span>
    </span>
  {/each}
</div>

<style>
  .bloc-bar {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 4px 12px;
    background: var(--dark2);
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.55);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .bloc-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
    vertical-align: middle;
  }
  .bloc-val {
    font-family: var(--font-data);
    font-weight: 700;
    margin-left: 3px;
  }
</style>
