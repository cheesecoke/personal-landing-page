<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let fireSection;
  let emberBackground;
  let fireTitle;
  let fireText;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
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
      In wildland firefighting, I discovered resilience and perspective. The mountains taught me humility—where I learned to respond to chaos with controlled strength and understood the weight of forces larger than myself.
    </p>
  </div>


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
