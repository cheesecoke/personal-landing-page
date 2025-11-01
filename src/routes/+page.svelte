<script>
  import Hero from '$lib/components/Hero.svelte';
  import Kansas from '$lib/components/Kansas.svelte';
  import California from '$lib/components/California.svelte';
  import Fire from '$lib/components/Fire.svelte';
  import Colorado from '$lib/components/Colorado.svelte';
  import Epilogue from '$lib/components/Epilogue.svelte';
  import GuidingLine from '$lib/components/GuidingLine.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
</script>

<svelte:head>
  <title>Chase Cole - A Journey Through Code</title>
  <meta name="description" content="A cinematic journey through Kansas, California, Fire, Colorado - told through code and design." />
</svelte:head>

<main class="scroll-container">
  <Navigation />
  <!-- <GuidingLine /> -->
  <!-- Removed main guiding line - using section-by-section lines instead -->

  <Hero />
  <Kansas />
  <California />
  <Fire />
  <Colorado />
  <Epilogue />
</main>

<style lang="scss">
  .scroll-container {
    width: 100%;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }
</style>

