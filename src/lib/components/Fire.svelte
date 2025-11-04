<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let fireSection;
  let emberBackground;
  let fireTitle;
  let fireText;
  let showTimeline = false;

  function toggleTimeline() {
    showTimeline = !showTimeline;
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTimeline();
    }
  }

  // Reactive statement for milestone animations
  $: if (showTimeline) {
    setTimeout(() => {
      gsap.utils.toArray('.fire__milestone').forEach((milestone, i) => {
        gsap.from(milestone, {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          delay: i * 0.2,
          ease: 'back.out(1.7)'
        });
      });
    }, 100);
  }

  onMount(() => {
    // Animate ember particles - upward drift with sway (behind fire)
    gsap.to('.ember-particle', {
      y: (i) => -300 - Math.random() * 200, // Drift upward farther
      x: (i) => Math.sin(i) * 40, // More horizontal sway
      opacity: (i) => 0, // Fade out as they rise
      duration: (i) => 4 + Math.random() * 3, // Slower, more languid
      ease: 'sine.inOut',
      stagger: {
        each: 0.4,
        repeat: -1,
        from: 'random'
      },
      yoyo: false // Don't return, just reset
    });

    // Fire image parallax - subtle movement
    gsap.to('.fire__image', {
      y: 80,
      scale: 1.15,
      scrollTrigger: {
        trigger: fireSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Text diagonal parallax - moves slightly faster
    gsap.to('.fire__content', {
      y: -50,
      x: 30, // Diagonal drift
      scrollTrigger: {
        trigger: fireSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Text animations removed - static text

    // Transition animation
    gsap.to('.fire__transition', {
      opacity: 1,
      scrollTrigger: {
        trigger: fireSection,
        start: 'bottom 60%',
        end: 'bottom top',
        scrub: 1
      }
    });


    // Flicker fire image subtly
    gsap.to('.fire__image', {
      opacity: 0.65,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    // Heat shimmer effect - intensifies with scroll
    gsap.to('.fire__heat-shimmer', {
      backdropFilter: 'blur(8px)',
      scale: 1.02,
      scrollTrigger: {
        trigger: fireSection,
        start: 'top center',
        end: 'bottom center',
        scrub: 2
      }
    });

    // Subtle shimmer animation (continuous)
    gsap.to('.fire__heat-shimmer', {
      skewX: 0.5,
      skewY: 0.3,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    // Milestone animations will be handled in reactive statement
  });
</script>

<section class="fire" id="fire" bind:this={fireSection} aria-label="Fire chapter - Wildland firefighting experiences">
  <!-- Ember particles (drifting upward - behind fire image) -->
  <div class="fire__ember-layer" bind:this={emberBackground} aria-hidden="true">
    <svg class="fire__embers" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      {#each Array(25) as _, i}
        <g class="ember-particle" transform="translate({60 + i * 50}, {700 + Math.random() * 100})">
          <circle
            cx="0"
            cy="0"
            r="{4 + Math.random() * 3}"
            fill="rgba(255, 140, 60, {0.7 + Math.random() * 0.3})"
          >
            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="{2 + Math.random() * 2}s" repeatCount="indefinite" />
          </circle>
          <!-- Glow effect -->
          <circle
            cx="0"
            cy="0"
            r="{8 + Math.random() * 4}"
            fill="rgba(255, 100, 30, 0.3)"
          >
            <animate attributeName="r" values="{8 + Math.random() * 4};{14 + Math.random() * 4};{8 + Math.random() * 4}" dur="{2 + Math.random() * 2}s" repeatCount="indefinite" />
          </circle>
        </g>
      {/each}
    </svg>
  </div>

  <!-- Fire Image Background (blurred) -->
  <div class="fire__image-layer" aria-hidden="true">
    <img src="/assets/fire.png" alt="" class="fire__image" />
  </div>

  <!-- Heat Shimmer Effect -->
  <div class="fire__heat-shimmer" aria-hidden="true"></div>

  <div class="fire__content">
    <h1 class="fire__title" bind:this={fireTitle}>Fire – Where I Learned Humility and Strength</h1>
    <p class="fire__text" bind:this={fireText}>
      In wildland firefighting, I discovered resilience and perspective. The mountains taught me humility—where I learned to respond to chaos with <span class="fire__highlight" on:click={toggleTimeline} on:keydown={handleKeydown} role="button" tabindex="0" aria-label="Click to view firefighting experiences">controlled strength</span> and understood the weight of forces larger than myself.
    </p>
  </div>

  <!-- Simple timeline milestones (hidden by default) -->
  {#if showTimeline}
    <div class="fire__timeline" transition:fade={{ duration: 500 }}>
      <div class="timeline__header">
        <h3>Firefighting Experiences</h3>
        <button class="timeline__close" on:click={toggleTimeline} aria-label="Close timeline">×</button>
      </div>
      <div class="fire__milestone" style="left: 20%; top: 30%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">First Season - Discovery</span>
      </div>
      <div class="fire__milestone" style="left: 60%; top: 45%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">Leadership Under Pressure</span>
      </div>
      <div class="fire__milestone" style="left: 40%; top: 65%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">Lessons in Humility</span>
      </div>
    </div>
  {/if}

  <!-- Transition fade overlay -->
  <div class="fire__transition"></div>
</section>

<style lang="scss">
  @import '../../styles/variables.scss';

  .fire {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      to bottom,
      $fire-smoke 0%,
      $fire-charcoal 50%,
      $fire-smoke 100%
    );
    overflow: hidden;
  }

  .fire__ember-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    will-change: transform;
  }

  .fire__embers {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.9;
    will-change: transform;
    
    // Optimize rendering
    backface-visibility: hidden;
    perspective: 1000px;
  }

  .fire__image-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: hidden;
  }

  .fire__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    filter: blur(2px) brightness(0.8) contrast(1.1);
    opacity: 0.7;
    will-change: transform;
    
    // Subtle parallax effect on image
    @media (prefers-reduced-motion: no-preference) {
      animation: imageFloat 20s ease-in-out infinite;
    }
  }

  @keyframes imageFloat {
    0%, 100% {
      transform: scale(1.05) translateY(0);
    }
    50% {
      transform: scale(1.08) translateY(-10px);
    }
  }

  .fire__heat-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(1px);
    z-index: 2;
    pointer-events: none;
    will-change: transform, backdrop-filter;
    opacity: 0.5;
  }

  .fire__content {
    position: relative;
    z-index: 10;
    max-width: 800px;
    padding: $spacing-md $spacing-lg $spacing-lg $spacing-lg;
    text-align: center;
    background: rgba(0, 0, 0, 0.4); // Darker backdrop for better text readability over fire
    border-radius: 12px;
    backdrop-filter: blur(8px);
  }

  .fire__title {
    font-family: $font-header;
    font-size: $font-size-hero;
    color: $fire-ember;
    margin-bottom: $spacing-md;
    margin-top: $spacing-md;
    opacity: 1;
    font-weight: 600;
    letter-spacing: -0.5px;
  }

  .fire__text {
    font-family: $font-body;
    font-size: $font-size-body;
    line-height: $line-height-relaxed;
    color: #E0E0E0; // Light color for contrast against dark background
    opacity: 1;
    transition: text-shadow 0.3s ease;
    cursor: default;
    font-weight: 400;

    &:hover {
      text-shadow: 0 0 20px rgba($fire-ember, 0.6);
    }
  }

  .fire__highlight {
    color: $fire-ember;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 4px;
    transition: all 0.3s ease;
    background: rgba(217, 119, 87, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    display: inline-block;
    position: relative;

    &:hover {
      color: lighten($fire-ember, 10%);
      background: rgba(217, 119, 87, 0.2);
      text-shadow: 0 0 15px rgba(217, 119, 87, 0.5);
      animation: humblingScale 1.2s ease-out;
    }

    &:focus {
      outline: 2px solid $fire-ember;
      outline-offset: 2px;
    }
  }

  // Humbling scale animation - expand then contract
  @keyframes humblingScale {
    0% {
      transform: scale(1);
    }
    20% {
      transform: scale(1.25);
    }
    40% {
      transform: scale(0.95);
    }
    60% {
      transform: scale(1.08);
    }
    80% {
      transform: scale(0.98);
    }
    100% {
      transform: scale(1);
    }
  }

  .fire__timeline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 15;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
  }

  .fire__milestone {
    position: absolute;
    pointer-events: all;
    animation: orbit 6s ease-in-out infinite;
    cursor: pointer;

    &:hover {
      animation-play-state: paused;
      
      .milestone__label {
        opacity: 1;
        transform: translateY(-10px);
      }
      
      .milestone__dot {
        transform: scale(1.5);
        box-shadow: 0 0 30px rgba(217, 119, 87, 0.8);
      }
    }
  }

  @keyframes orbit {
    0%, 100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(10px, -10px);
    }
  }

  .milestone__dot {
    display: block;
    width: 16px;
    height: 16px;
    background: $fire-ember;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(217, 119, 87, 0.6);
    animation: pulse 2s ease-in-out infinite;
    border: 2px solid rgba(255, 255, 255, 0.8);
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.3);
      opacity: 0.7;
    }
  }

  .milestone__label {
    position: absolute;
    top: 25px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-family: $font-body;
    font-size: 14px;
    color: #FFFFFF;
    background: rgba(58, 58, 58, 0.95);
    padding: 8px 12px;
    border-radius: 6px;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(217, 119, 87, 0.3);
    font-weight: 500;
  }

  .timeline__header {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(58, 58, 58, 0.95);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: all;

    h3 {
      margin: 0;
      font-family: $font-header;
      font-size: 18px;
      color: #FFFFFF;
      font-weight: 600;
    }
  }

  .timeline__close {
    background: none;
    border: none;
    font-size: 24px;
    color: $fire-ember;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(217, 119, 87, 0.2);
      color: lighten($fire-ember, 15%);
    }
  }


  @media (max-width: 768px) {
    .fire__title {
      font-size: 36px;
    }

    .fire__text {
      font-size: 16px;
      line-height: 1.6;
    }

    .fire__content {
      padding: $spacing-md;
      max-width: 90%;
    }

    .fire__embers {
      opacity: 0.7; // Reduce particle density on mobile
    }

    .fire__image {
      filter: blur(4px) brightness(0.7) contrast(1.1);
    }
  }

  @media (max-width: 480px) {
    .fire__title {
      font-size: 28px;
      margin-bottom: 1rem;
    }

    .fire__text {
      font-size: 14px;
    }
  }

  // Accessibility - reduced motion
  @media (prefers-reduced-motion: reduce) {
    .fire__text:hover {
      text-shadow: none;
    }

    .fire__heat-shimmer,
    .ember-particle,
    .fire__image {
      animation: none !important;
    }

    .fire__title,
    .fire__text {
      will-change: auto;
    }

    // Disable all GSAP animations for reduced motion users
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .fire__transition {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30vh;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba($colorado-fog, 0.3) 50%,
      rgba($colorado-snow, 0.6) 100%
    );
    z-index: 5;
    pointer-events: none;
    opacity: 0;
  }
</style>
