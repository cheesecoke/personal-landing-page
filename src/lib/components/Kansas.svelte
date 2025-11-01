<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { playWindSound, fadeInWind, fadeOutWind } from '$lib/utils/audio';

  gsap.registerPlugin(ScrollTrigger);

  let kansasSection;
  let wheatBackground;
  let kansasTitle;
  let kansasText;
  let audioInitialized = false;
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
      gsap.utils.toArray('.kansas__milestone').forEach((milestone, i) => {
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

    // Audio on scroll
    ScrollTrigger.create({
      trigger: kansasSection,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        if (!audioInitialized) {
          playWindSound();
          fadeInWind(0.2, 2);
          audioInitialized = true;
        }
      },
      onLeave: () => {
        fadeOutWind(2);
      },
      onEnterBack: () => {
        fadeInWind(0.2, 2);
      },
      onLeaveBack: () => {
        fadeOutWind(2);
      }
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

  onDestroy(() => {
    // Clean up audio if needed
    fadeOutWind(0.5);
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
      In Kansas, I grew as a leader and a learner. School and college sparked my love for design—where I earned my <span class="kansas__highlight" on:click={toggleTimeline} on:keydown={handleKeydown} role="button" tabindex="0" aria-label="Click to view education milestones">art degree</span> and discovered how to weave concepts into experiences that speak.
    </p>
  </div>

  <!-- Simple timeline milestones (hidden by default) -->
  {#if showTimeline}
    <div class="kansas__timeline" transition:fade={{ duration: 500 }}>
      <div class="timeline__header">
        <h3>Education Milestones</h3>
        <button class="timeline__close" on:click={toggleTimeline} aria-label="Close timeline">×</button>
      </div>
      <div class="kansas__milestone" style="left: 20%; top: 30%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">First Web Design Project</span>
      </div>
      <div class="kansas__milestone" style="left: 60%; top: 45%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">Art Degree Earned</span>
      </div>
      <div class="kansas__milestone" style="left: 40%; top: 65%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">Early Design Experiments</span>
      </div>
    </div>
  {/if}

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

  .kansas__highlight {
    color: #8b6f47; // Darker, more readable color
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 4px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 3px;

    &:hover {
      color: #6b5433;
      background: rgba(255, 255, 255, 0.2);
      text-shadow: 0 0 15px rgba(139, 111, 71, 0.3);
    }

    &:focus {
      outline: 2px solid #8b6f47;
      outline-offset: 2px;
    }
  }

  .kansas__timeline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 15;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
  }

  .kansas__milestone {
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
        box-shadow: 0 0 30px rgba(139, 111, 71, 0.8);
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
    background: #8b6f47;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(139, 111, 71, 0.6);
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
    color: #2c2419;
    background: rgba(255, 255, 255, 0.95);
    padding: 8px 12px;
    border-radius: 6px;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(139, 111, 71, 0.2);
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
    background: rgba(255, 255, 255, 0.95);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: all;

    h3 {
      margin: 0;
      font-family: $font-header;
      font-size: 18px;
      color: #2c2419;
      font-weight: 600;
    }
  }

  .timeline__close {
    background: none;
    border: none;
    font-size: 24px;
    color: #8b6f47;
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
      background: rgba(139, 111, 71, 0.1);
      color: #6b5433;
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
      rgba($california-mist, 0.3) 50%,
      rgba($california-mist, 0.7) 100%
    );
    z-index: 5;
    pointer-events: none;
    opacity: 0;
  }

  // Guideline styles removed - will revisit later
</style>

