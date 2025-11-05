<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let californiaSection;
  let californiaTitle;
  let californiaText;
  let patternCount = 150;
  let gridCols = 15;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
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
      Moving to California pushed me to grow as a builder and a teammate. It's where I leveled up my technical skills and learned how to bring ideas to life in a way that connects with people.
    </p>
  </div>


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
