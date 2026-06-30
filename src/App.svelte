<script>
  import StatusBar from '$lib/components/StatusBar.svelte';
  import BlocBar from '$lib/components/BlocBar.svelte';
  import LeftPanel from '$lib/components/LeftPanel.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import RightPanel from '$lib/components/RightPanel.svelte';
  import CalendarView from '$lib/components/CalendarView.svelte';
  import SocialView from '$lib/components/SocialView.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import ConversationOverlay from '$lib/components/ConversationOverlay.svelte';
  import CinematicOverlay from '$lib/components/CinematicOverlay.svelte';
  import GameEndOverlay from '$lib/components/GameEndOverlay.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import OnboardingOverlay from '$lib/components/OnboardingOverlay.svelte';
  import BentoBox from '$lib/components/BentoBox.svelte';
  import GraphView from '$lib/components/GraphView.svelte';
  import { currentView, onboardingComplete } from '$lib/stores/game.js';
  import { downloadPlaylog } from '$lib/playlog.js';

  let graphOpen = $state(false);

  $effect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'g' || e.key === 'G') {
        graphOpen = !graphOpen;
      }
      if (e.key === 'Escape' && graphOpen) {
        graphOpen = false;
      }
      // Ctrl+Shift+L — download playlog JSON
      if (e.key === 'L' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        const data = downloadPlaylog();
        console.log(`[playlog] Exported ${data.summary.totalEvents} events, week ${data.finalState.week}`);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });
</script>

<StatusBar />
<BlocBar />

<main class="main-area">
  {#if $currentView === 'map'}
    <LeftPanel />
    <MapView />
    <RightPanel />
  {:else if $currentView === 'calendar'}
    <CalendarView />
  {:else if $currentView === 'socials'}
    <SocialView />
  {/if}
</main>

<BottomNav />

<!-- Overlays -->
<ConversationOverlay />
<CinematicOverlay />
<GameEndOverlay />
<Toast />
<BentoBox />
<OnboardingOverlay />

<!-- Graph view (toggle with G key) -->
<GraphView visible={graphOpen} />

<style>
  .main-area {
    flex: 1;
    display: flex;
    min-height: 0;
    position: relative;
  }
</style>
