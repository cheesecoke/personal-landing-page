<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let californiaSection;
  let californiaTitle;
  let californiaText;
  let showTimeline = false;
  let patternCount = 150;
  let gridCols = 15;

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
      gsap.utils.toArray('.california__milestone').forEach((milestone, i) => {
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
    // Calculate pattern count based on viewport
    const updatePatternCount = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cols = Math.ceil(width / 100) + 5;
      const rows = Math.ceil(height / 100) + 5;
      gridCols = cols;
      patternCount = cols * rows;
    };
    
    updatePatternCount();
    window.addEventListener('resize', updatePatternCount);
    
    // Text parallax - moves slightly faster
    gsap.to('.california__content', {
      y: -50,
      scrollTrigger: {
        trigger: californiaSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Text reveal animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: californiaSection,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    // Title fade in
    timeline.to(californiaTitle, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power2.out'
    });

    // Body text fade in
    timeline.to(californiaText, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power2.out'
    }, '-=1'); // Overlap by 1 second

    // Transition animation
    gsap.to('.california__transition', {
      opacity: 1,
      scrollTrigger: {
        trigger: californiaSection,
        start: 'bottom 60%',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Animate individual surfboards - subtle wiggle
    gsap.to('.surfboard-item', {
      rotation: '+=8',
      y: '+=5',
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      stagger: {
        each: 0.1,
        from: 'random'
      }
    });

    // Milestone animations will be handled in reactive statement
  });
</script>

<section class="california" id="california" bind:this={californiaSection}>
  
  <!-- SVG Background Container -->
  <div class="california__svg-container">
    <img src="/assets/California.svg" alt="California coastline illustration" />
  </div>

  <div class="california__content">
    <h1 class="california__title" bind:this={californiaTitle} style="transform: translateY(30px);">California – Where I Found Creation</h1>
    <p class="california__text" bind:this={californiaText} style="transform: translateY(30px);">
      In California, I discovered collaboration and innovation. The West Coast sparked my passion for building—where I honed my <span class="california__highlight" on:click={toggleTimeline} on:keydown={handleKeydown} role="button" tabindex="0" aria-label="Click to view technical skills">technical skills</span> and learned how to craft experiences that resonate.
    </p>
  </div>

  <!-- Simple timeline milestones (hidden by default) -->
  {#if showTimeline}
    <div class="california__timeline" transition:fade={{ duration: 500 }}>
      <div class="timeline__header">
        <h3>Technical Skills</h3>
        <button class="timeline__close" on:click={toggleTimeline} aria-label="Close timeline">×</button>
      </div>
      <div class="california__milestone" style="left: 20%; top: 30%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">Frontend Development</span>
      </div>
      <div class="california__milestone" style="left: 60%; top: 45%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">Design Systems</span>
      </div>
      <div class="california__milestone" style="left: 40%; top: 65%;">
        <span class="milestone__dot"></span>
        <span class="milestone__label">Team Collaboration</span>
      </div>
    </div>
  {/if}

  <!-- Surfboard and Palm Tree pattern background -->
  <div class="surfboard-pattern">
    {#each Array(patternCount) as _, i}
      {#if i % 2 === 0}
        <img 
          src="/assets/surfboard.svg" 
          alt="" 
          class="surfboard-item"
          style="left: {(i % gridCols) * 130}px; top: {Math.floor(i / gridCols) * 130}px;"
        />
      {:else}
        <img 
          src="/assets/palmtree.svg" 
          alt="" 
          class="surfboard-item palmtree-item"
          style="left: {(i % gridCols) * 130}px; top: {Math.floor(i / gridCols) * 130}px;"
        />
      {/if}
    {/each}
  </div>

  <!-- Transition fade overlay -->
  <div class="california__transition"></div>

  <!-- Guideline removed for now - will revisit later -->
</section>

<style lang="scss">
  @import '../../styles/variables.scss';

  .california {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F5F1E8;
    overflow: hidden;
  }

  .california__svg-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 8rem);
    height: calc(100% - 8rem);
    max-width: 1400px;
    max-height: 900px;
    border-radius: 16px;
    overflow: hidden;
    z-index: 1;
    
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
    }

    @media (max-width: 768px) {
      width: calc(100% - 4rem);
      height: calc(100% - 4rem);
      max-height: 800px;
    }

    @media (max-width: 480px) {
      width: calc(100% - 2rem);
      height: calc(100% - 2rem);
      border-radius: 12px;
    }
  }


  .california__content {
    position: relative;
    z-index: 10;
    max-width: 800px;
    padding: 3rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      max-width: 90%;
      padding: 2rem 1.5rem;
      margin: 0 1rem;
    }

    @media (max-width: 480px) {
      padding: 1.5rem 1rem;
      border-radius: 12px;
    }
  }

  .california__title {
    font-family: $font-header;
    font-size: $font-size-hero;
    color: #2C3E50; // Deep navy blue
    margin-bottom: $spacing-md;
    opacity: 0; // Will be animated
    font-weight: 600;
    letter-spacing: -0.5px;
  }

  .california__text {
    font-family: $font-body;
    font-size: $font-size-body;
    line-height: $line-height-relaxed;
    color: #34495E; // Darker blue-gray
    opacity: 0; // Will be animated
    transition: text-shadow 0.3s ease;
    cursor: default;
    font-weight: 400;

    &:hover {
      text-shadow: 0 0 20px rgba(91, 154, 168, 0.4);
    }
  }

  .california__highlight {
    color: #FF8C69; // Coral accent
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 4px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.15);
    padding: 2px 4px;
    border-radius: 3px;

    &:hover {
      color: #FF6B47;
      background: rgba(255, 255, 255, 0.25);
      text-shadow: 0 0 15px rgba(255, 140, 105, 0.4);
    }

    &:focus {
      outline: 2px solid #FF8C69;
      outline-offset: 2px;
    }
  }

  .california__timeline {
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

  .california__milestone {
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
    background: #FF8C69;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(255, 140, 105, 0.6);
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
    color: #2C3E50;
    background: rgba(255, 255, 255, 0.95);
    padding: 8px 12px;
    border-radius: 6px;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(91, 154, 168, 0.25);
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
      color: #2C3E50;
      font-weight: 600;
    }
  }

  .timeline__close {
    background: none;
    border: none;
    font-size: 24px;
    color: #5B9AA8;
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
      background: rgba(91, 154, 168, 0.1);
      color: #2C3E50;
    }
  }

  // Removed old milestone styles - replaced with 3D tube system

  .surfboard-pattern {
    position: absolute;
    top: -20%;
    left: -20%;
    width: 140%;
    height: 140%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.35;
    transform: rotate(30deg);
    transform-origin: center center;
  }

  .surfboard-item {
    position: absolute;
    width: 60px;
    height: auto;
    filter: grayscale(20%) brightness(0.95) contrast(0.9);
  }

  .palmtree-item {
    width: 50px;
  }

  @media (max-width: 768px) {
    .california__title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .california__text {
      font-size: 1rem;
      line-height: 1.6;
    }
  }

  @media (max-width: 480px) {
    .california__title {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .california__text {
      font-size: 0.95rem;
    }
  }

  // Accessibility - reduced motion
  @media (prefers-reduced-motion: reduce) {
    .california__text:hover {
      text-shadow: none;
    }
  }

  .california__transition {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30vh;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba($fire-smoke, 0.3) 50%,
      rgba($fire-charcoal, 0.6) 100%
    );
    z-index: 5;
    pointer-events: none;
    opacity: 0;
  }

  // Guideline styles removed - will revisit later
</style>
