<script>
  import { onMount } from 'svelte';
  import Globe from './Globe.svelte';
  import { setupHeroAnimations } from './heroAnimations.js';
  import './hero.scss';

  let taglineElement;
  let largeNameElement;

  onMount(() => {
    setupHeroAnimations(largeNameElement, taglineElement);
  });
</script>

<section class="hero" id="hero">
  <!-- Starfield background - multiple layers moving in different directions -->
  <div class="hero__stars hero__stars--1"></div>
  <div class="hero__stars hero__stars--2"></div>
  <div class="hero__stars hero__stars--3"></div>
  <div class="hero__stars hero__stars--4"></div>
  <div class="hero__stars hero__stars--5"></div>



  <!-- Large name behind globe -->
  <div class="hero__large-name" bind:this={largeNameElement} aria-hidden="true"></div>

  <!-- Planet/World - positioned to cut through name -->
  <div class="hero__planet">
    <!-- <img src="/assets/earth.png" alt="Earth" /> -->
    <Globe />
  </div>

  <!-- Introduction text - layered over globe -->
  <div class="hero__content">
    <!-- <h1 class="hero__greeting" bind:this={greetingElement}>Hello, I'm Chase</h1> -->
    <p class="hero__tagline" bind:this={taglineElement}></p>
    <div class="hero__scroll-hint">
      <span>Scroll to begin the journey</span>
      <svg class="scroll-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4 L12 20 M12 20 L6 14 M12 20 L18 14" stroke="currentColor" stroke-width="2" fill="none" />
      </svg>
    </div>
  </div>
</section>
