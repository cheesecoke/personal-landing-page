<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let coloradoSection;
  let coloradoTitle;
  let coloradoText;
  let artifactsContainer;
  let isFused = false;

  // Fusion effect - align artifacts into grid
  function handleFusionEnter() {
    if (isFused) return;
    isFused = true;

    const artifacts = gsap.utils.toArray('.code-artifact');
    artifacts.forEach((artifact, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      
      gsap.to(artifact, {
        left: `${25 + col * 25}%`,
        top: `${30 + row * 20}%`,
        rotation: 0,
        scale: 1.2,
        duration: 0.8,
        ease: 'power2.inOut'
      });
    });
  }

  function handleFusionLeave() {
    if (!isFused) return;
    isFused = false;

    const artifacts = document.querySelectorAll('.code-artifact');
    artifacts.forEach((artifact) => {
      gsap.to(artifact, {
        left: artifact.dataset.originalLeft,
        top: artifact.dataset.originalTop,
        rotation: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power2.inOut'
      });
    });
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isFused) {
        handleFusionLeave();
      } else {
        handleFusionEnter();
      }
    }
  }

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Store original positions
    const artifacts = document.querySelectorAll('.code-artifact');
    artifacts.forEach((artifact) => {
      artifact.dataset.originalLeft = artifact.style.left;
      artifact.dataset.originalTop = artifact.style.top;
    });
    // Parallax effect - subtle movement for SVG container
    gsap.to('.colorado__svg-container', {
      y: 30,
      scrollTrigger: {
        trigger: coloradoSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Text parallax - moves upward
    gsap.to('.colorado__content', {
      y: -80,
      scrollTrigger: {
        trigger: coloradoSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Clean snap-in text reveal animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: coloradoSection,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    // Title snap in - crisp and clean
    timeline.to(coloradoTitle, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });

    // Body text snap in
    timeline.to(coloradoText, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.1');

    // Code artifacts float in
    gsap.utils.toArray('.code-artifact').forEach((artifact, i) => {
      gsap.from(artifact, {
        opacity: 0,
        y: 100,
        x: (i % 2 === 0) ? -50 : 50,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: coloradoSection,
          start: 'top 70%',
          end: 'center center',
          scrub: 1
        }
      });
    });

    // Vertical upward movement for artifacts
    gsap.utils.toArray('.code-artifact').forEach((artifact, i) => {
      gsap.to(artifact, {
        y: -100 - (i * 20),
        scrollTrigger: {
          trigger: coloradoSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    // Transition animation
    gsap.to('.colorado__transition', {
      opacity: 1,
      scrollTrigger: {
        trigger: coloradoSection,
        start: 'bottom 60%',
        end: 'bottom top',
        scrub: 1
      }
    });
  });
</script>

<section class="colorado" id="colorado" bind:this={coloradoSection}>
  
  <!-- SVG Background Container (centered with rounded corners) -->
  <div class="colorado__svg-container">
    <img src="/assets/colorado.svg" alt="Colorado mountains illustration" />
  </div>

  <!-- Abstract code artifacts -->
  <div 
    class="colorado__artifacts" 
    bind:this={artifactsContainer}
    on:mouseenter={handleFusionEnter}
    on:mouseleave={handleFusionLeave}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
    aria-label="Hover to align code artifacts into grid pattern"
  >
    <!-- Curly braces -->
    <div class="code-artifact code-artifact--1" style="left: 15%; top: 20%;">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <text x="50" y="60" text-anchor="middle" fill="rgba(91, 143, 163, 0.3)" font-size="60" font-family="monospace">&#123; &#125;</text>
      </svg>
    </div>

    <!-- Arrow function -->
    <div class="code-artifact code-artifact--2" style="left: 75%; top: 25%;">
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="40" fill="rgba(139, 157, 131, 0.25)" font-size="24" font-family="monospace">() =&gt;</text>
      </svg>
    </div>

    <!-- Angle brackets -->
    <div class="code-artifact code-artifact--3" style="left: 10%; top: 65%;">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <text x="50" y="60" text-anchor="middle" fill="rgba(91, 143, 163, 0.3)" font-size="50" font-family="monospace">&lt; &gt;</text>
      </svg>
    </div>

    <!-- Variable name -->
    <div class="code-artifact code-artifact--4" style="left: 80%; top: 70%;">
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="40" fill="rgba(139, 157, 131, 0.25)" font-size="20" font-family="monospace">const</text>
      </svg>
    </div>

    <!-- Function symbol -->
    <div class="code-artifact code-artifact--5" style="left: 50%; top: 15%;">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <text x="50" y="60" text-anchor="middle" fill="rgba(91, 143, 163, 0.2)" font-size="40" font-family="monospace">fn</text>
      </svg>
    </div>

    <!-- Brackets -->
    <div class="code-artifact code-artifact--6" style="left: 35%; top: 75%;">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <text x="50" y="60" text-anchor="middle" fill="rgba(139, 157, 131, 0.3)" font-size="50" font-family="monospace">&#91; &#93;</text>
      </svg>
    </div>

    <!-- Semicolon -->
    <div class="code-artifact code-artifact--7" style="left: 65%; top: 50%;">
      <svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
        <text x="30" y="60" text-anchor="middle" fill="rgba(91, 143, 163, 0.25)" font-size="60" font-family="monospace">;</text>
      </svg>
    </div>
  </div>

  <div class="colorado__content">
    <h1 
      class="colorado__title" 
      bind:this={coloradoTitle} 
      style="opacity: 0; transform: scale(0.95);"
    >
      Colorado – A New Chapter in Code and Nature
    </h1>
    <p 
      class="colorado__text" 
      bind:this={coloradoText} 
      style="opacity: 0; transform: scale(0.95);"
    >
    I came to Colorado to turn the page and pursue work that matters, something with real impact, challenge, and purpose, while playing in the woods.
  </p>
  </div>

  <!-- Transition fade overlay -->
  <div class="colorado__transition"></div>
</section>

<style lang="scss">
  @import '../../styles/variables.scss';

  .colorado {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      to bottom,
      $colorado-snow 0%,
      #7BA5B8 50%,
      $colorado-fog 100%
    );
    overflow: hidden;
  }

  .colorado__svg-container {
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

  .colorado__artifacts {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: all;
    cursor: pointer;
    outline: none;

    &:focus-visible {
      outline: 2px solid $colorado-fog;
      outline-offset: 4px;
    }
  }

  .code-artifact {
    position: absolute;
    width: 100px;
    height: 100px;
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;

    svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 2px 8px rgba(91, 143, 163, 0.1));
    }
  }

  .colorado__content {
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

  .colorado__title {
    font-family: $font-header;
    font-size: $font-size-hero;
    color: $colorado-fog;
    margin-bottom: $spacing-md;
    font-weight: 600;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .colorado__text {
    font-family: $font-body;
    font-size: $font-size-body;
    line-height: $line-height-relaxed;
    color: #6d7d67;
    font-weight: 400;
    max-width: 700px;
    margin: 0 auto;
  }

  .colorado__transition {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30vh;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba($epilogue-white, 0.3) 50%,
      rgba($epilogue-white, 0.6) 100%
    );
    z-index: 5;
    pointer-events: none;
    opacity: 0;
  }

  @media (max-width: 768px) {
    .colorado__title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .colorado__text {
      font-size: 1rem;
      line-height: 1.6;
    }

    .code-artifact {
      width: 60px;
      height: 60px;

      svg text {
        font-size: 30px !important;
      }
    }

    .colorado__artifacts {
      pointer-events: none;
    }
  }

  @media (max-width: 480px) {
    .colorado__title {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .colorado__text {
      font-size: 0.95rem;
    }

    .code-artifact {
      width: 40px;
      height: 40px;

      svg text {
        font-size: 20px !important;
      }
    }
  }

  // Accessibility - reduced motion
  @media (prefers-reduced-motion: reduce) {
    .code-artifact,
    .colorado__content,
    .colorado__svg-container,
    .colorado__transition {
      animation: none !important;
      transition: none !important;
    }

    .colorado__artifacts {
      pointer-events: none;
    }
  }

  // High contrast mode support
  @media (prefers-contrast: high) {
    .colorado__title {
      color: #3d5f70;
    }

    .colorado__text {
      color: #525d4d;
    }

    .code-artifact svg text {
      fill: rgba(91, 143, 163, 0.6) !important;
    }
  }
</style>
