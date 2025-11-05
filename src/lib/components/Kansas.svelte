<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let kansasSection;
  let wheatBackground;
  let kansasTitle;
  let kansasText;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Animate wheat stalks with GSAP
    gsap.to('.wheat-stalk', {
      x: (i) => Math.sin(i) * 5,
      y: (i) => Math.cos(i) * 3,
      rotation: (i) => Math.sin(i) * 2,
      duration: 3,
      ease: 'sine.inOut',
      stagger: {
        each: 0.1,
        repeat: -1,
        yoyo: true
      }
    });

    // Parallax effect - multiple layers at different speeds
    gsap.to('.kansas__hills--back', {
      y: 50,
      scrollTrigger: {
        trigger: kansasSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    gsap.to('.kansas__hills--middle', {
      y: 100,
      scrollTrigger: {
        trigger: kansasSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    gsap.to('.kansas__hills--front', {
      y: 150,
      scrollTrigger: {
        trigger: kansasSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Text parallax - moves slightly faster
    gsap.to('.kansas__content', {
      y: -50,
      scrollTrigger: {
        trigger: kansasSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Text reveal animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: kansasSection,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    // Title fade in with drift
    timeline.to(kansasTitle, {
      opacity: 1,
      y: 0,
      x: -10, // Subtle left drift (wind effect)
      duration: 1.5,
      ease: 'power2.out'
    });

    // Body text fade in with drift
    timeline.to(kansasText, {
      opacity: 1,
      y: 0,
      x: 10, // Subtle right drift (wind effect)
      duration: 1.5,
      ease: 'power2.out'
    }, '-=1'); // Overlap by 1 second

    // Continuous subtle wind effect on letters
    gsap.to(kansasTitle, {
      x: '+=5',
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    gsap.to(kansasText, {
      x: '-=3',
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    // Transition animation
    gsap.to('.kansas__transition', {
      opacity: 1,
      scrollTrigger: {
        trigger: kansasSection,
        start: 'bottom 60%',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Animate wireframe shapes on scroll
    gsap.to('.wireframe-shape', {
      opacity: 1,
      scale: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: kansasSection,
        start: 'top 70%',
        end: 'center center',
        scrub: 1
      }
    });

    // Milestone animations will be handled in reactive statement
  });
</script>

<section class="kansas" id="kansas" bind:this={kansasSection}>
  <!-- Rolling Hills Background (parallax layer) -->
  <div class="kansas__hills-layer" bind:this={wheatBackground}>
    <!-- Sunset Sun (behind all hills) -->
    <svg class="kansas__sun" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <!-- Outer glow -->
      <circle cx="600" cy="520" r="180" fill="rgba(237, 135, 45, 0.15)" />
      <circle cx="600" cy="520" r="140" fill="rgba(242, 153, 74, 0.25)" />
      <!-- Main sun -->
      <circle cx="600" cy="520" r="100" fill="rgba(245, 176, 65, 0.7)">
        <animate attributeName="r" values="100;105;100" dur="4s" repeatCount="indefinite" />
      </circle>
      <!-- Inner glow -->
      <circle cx="600" cy="520" r="70" fill="rgba(250, 200, 100, 0.8)" />
    </svg>

    <!-- Back hills - OPAQUE (to hide sun) -->
    <svg class="kansas__hills kansas__hills--back" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,800 L0,500 Q300,450 600,500 T1200,450 L1200,800 Z" fill="rgba(139, 160, 120, 0.9)"/>
    </svg>

    <!-- Middle hills - OPAQUE -->
    <svg class="kansas__hills kansas__hills--middle" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,800 L0,550 Q300,500 600,550 T1200,500 L1200,800 Z" fill="rgba(120, 140, 100, 0.95)"/>
    </svg>

    <!-- Front hills - OPAQUE (fastest parallax) -->
    <svg class="kansas__hills kansas__hills--front" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,800 L0,600 Q300,570 600,600 T1200,570 L1200,800 Z" fill="rgba(100, 120, 80, 1)"/>
    </svg>

    <!-- Subtle wheat stalks (fewer, more abstract) -->
    <svg class="kansas__wheat" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      {#each Array(15) as _, i}
        <path
          class="wheat-stalk"
          d="M{80 + i * 80},800 Q{80 + i * 80},{800 - Math.random() * 150} {80 + i * 80},{800 - 250 - Math.random() * 80}"
          stroke="rgba(201, 184, 150, 0.4)"
          stroke-width="2"
          fill="none"
          opacity="0.3"
        />
      {/each}
    </svg>
  </div>

  <div class="kansas__content">
    <h1 class="kansas__title" bind:this={kansasTitle} style="transform: translateY(30px);">Kansas – Where I Found My Foundation</h1>
    <p class="kansas__text" bind:this={kansasText} style="transform: translateY(30px);">
      I'm originally from Kansas. During college, I earned my art degree and discovered my passion for design — not just the visuals, but the process of turning concepts into meaningful experiences.
     </p>
  </div>


  <!-- Abstract wireframe shapes -->
  <div class="kansas__wireframes">
    {#each Array(8) as _, i}
      <div class="wireframe-shape wireframe-shape--{i}" style="left: {15 + i * 12}%; top: {20 + Math.sin(i) * 30}%;">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="rgba(201, 184, 150, 0.3)" stroke-width="1"/>
          <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(201, 184, 150, 0.2)" stroke-width="1"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(201, 184, 150, 0.2)" stroke-width="1"/>
        </svg>
      </div>
    {/each}
  </div>

  <!-- Transition fade overlay -->
  <div class="kansas__transition"></div>

  <!-- Guideline removed for now - will revisit later -->
</section>

<style lang="scss">
  @import '../../styles/variables.scss';

  .kansas {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      to bottom,
      $kansas-beige 0%,
      $kansas-sand 50%,
      $kansas-wheat 100%
    );
    overflow: hidden;
  }

  .kansas__hills-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .kansas__sun {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60%;
    z-index: 0; // Behind all hills
  }

  .kansas__hills {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60%;
  }

  .kansas__hills--back {
    z-index: 1;
    opacity: 1; // Fully opaque to hide sun
  }

  .kansas__hills--middle {
    z-index: 2;
    opacity: 1; // Fully opaque to hide sun
  }

  .kansas__hills--front {
    z-index: 3;
    opacity: 1; // Fully opaque to hide sun
  }

  .kansas__wheat {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 4;
    opacity: 0.5;
  }

  .kansas__content {
    position: relative;
    z-index: 10;
    max-width: 800px;
    padding: $spacing-lg;
    text-align: center;
  }

  .kansas__title {
    font-family: $font-header;
    font-size: $font-size-hero;
    color: #5a4a35;
    margin-bottom: $spacing-md;
    opacity: 0; // Will be animated
    font-weight: 600;
    letter-spacing: -0.5px;
  }

  .kansas__text {
    font-family: $font-body;
    font-size: $font-size-body;
    line-height: $line-height-relaxed;
    color: #4a3f35; // Much darker for better contrast
    opacity: 0; // Will be animated
    transition: text-shadow 0.3s ease;
    cursor: default;
    font-weight: 400;

    &:hover {
      text-shadow: 0 0 20px rgba($kansas-wheat, 0.6);
    }
  }


  // Removed old milestone styles - replaced with 3D tube system

  .kansas__wireframes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
  }

  .wireframe-shape {
    position: absolute;
    width: 80px;
    height: 80px;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.5s ease;

    &:hover {
      svg rect {
        stroke: rgba($kansas-wheat, 0.6);
      }
      
      svg line {
        stroke: rgba($kansas-wheat, 0.4);
        stroke-width: 2;
      }
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }

  @media (max-width: 768px) {
    .kansas__title {
      font-size: 36px;
    }

    .kansas__text {
      font-size: 16px;
    }
  }

  // Accessibility - reduced motion
  @media (prefers-reduced-motion: reduce) {
    .kansas__text:hover {
      text-shadow: none;
    }
  }

  .kansas__transition {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30vh;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba($california-sky, 0.3) 50%,
      rgba($california-sand, 0.6) 100%
    );
    z-index: 5;
    pointer-events: none;
    opacity: 0;
  }

  // Guideline styles removed - will revisit later
</style>

