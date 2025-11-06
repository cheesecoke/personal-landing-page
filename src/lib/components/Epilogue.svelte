<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  let epilogueSection;
  let starsContainer;
  let ctaButtons;
  let narrativeText;

  // Create stars for starfield
  function createStars(count) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2
      });
    }
    return stars;
  }

  const stars = createStars(150);

  onMount(() => {
    // Animate stars twinkling
    stars.forEach((star, i) => {
      const starElement = document.querySelector(`.star-${i}`);
      if (starElement) {
        gsap.to(starElement, {
          opacity: Math.random() * 0.5 + 0.3,
          duration: star.duration,
          repeat: -1,
          yoyo: true,
          delay: star.delay,
          ease: 'sine.inOut'
        });
      }
    });

    // Fade in content
    const timeline = gsap.timeline({ delay: 0.5 });
    
    timeline.from(ctaButtons, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power2.out'
    });

    timeline.from(narrativeText, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.5');
  });
</script>

<section class="epilogue" id="epilogue" bind:this={epilogueSection}>
  <!-- Animated Starfield -->
  <div class="epilogue__starfield" bind:this={starsContainer}>
    {#each stars as star, i}
      <div 
        class="epilogue__star star-{i}" 
        style="left: {star.left}%; top: {star.top}%; width: {star.size}px; height: {star.size}px;"
      ></div>
    {/each}
  </div>

  <!-- Simple Pulsing Circles -->
  <div class="epilogue__circles">
    <div class="epilogue__circle epilogue__circle--outer"></div>
    <div class="epilogue__circle epilogue__circle--middle"></div>
    <div class="epilogue__circle epilogue__circle--inner"></div>
  </div>

  <!-- Content -->
  <div class="epilogue__content">
    <!-- CTA Buttons -->
    <div class="epilogue__ctas" bind:this={ctaButtons}>
      <!-- Primary CTA - Contact -->
      <a 
        href="mailto:chasewcole@gmail.com" 
        class="epilogue__cta-button epilogue__cta-button--primary"
        aria-label="Contact me via email"
      >
        Contact Me
      </a>

      <!-- Secondary CTA - Projects -->
      <a 
        href="https://cheesecoke.github.io/cheesecoke/" 
        class="epilogue__cta-button epilogue__cta-button--secondary"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View my projects in progress"
      >
        View My Projects
      </a>
    </div>

    <!-- Narrative text -->
    <p class="epilogue__narrative" bind:this={narrativeText}>
      This is just the beginning,<br />
      let's code the next chapter together.<br />
      <span class="epilogue__signature">— Chase Cole</span>
    </p>
  </div>
</section>

<style lang="scss">
  @import '../../styles/variables.scss';

  .epilogue {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
    padding: $spacing-xl 0;
    overflow: hidden;

    @media (max-width: 768px) {
      padding: $spacing-lg 0;
    }
  }

  // Starfield
  .epilogue__starfield {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  .epilogue__star {
    position: absolute;
    background: $white;
    border-radius: 50%;
    opacity: 0.8;
    box-shadow: 0 0 4px rgba($white, 0.8);
  }

  // Simple Circles Container
  .epilogue__circles {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 800px;
    z-index: 2;
    pointer-events: none;

    @media (max-width: 768px) {
      width: 600px;
      height: 600px;
    }

    @media (max-width: 480px) {
      width: 400px;
      height: 400px;
    }
  }

  .epilogue__circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid rgba($epilogue-gold, 0.3);
    animation: pulse 4s ease-in-out infinite;

    &--outer {
      width: 100%;
      height: 100%;
      animation-delay: 0s;
      box-shadow: 0 0 30px rgba($epilogue-gold, 0.2);
    }

    &--middle {
      width: 70%;
      height: 70%;
      animation-delay: 1.3s;
      border-color: rgba($epilogue-fog, 0.4);
      box-shadow: 0 0 25px rgba($epilogue-fog, 0.2);
    }

    &--inner {
      width: 40%;
      height: 40%;
      animation-delay: 2.6s;
      border-color: rgba($white, 0.5);
      box-shadow: 0 0 40px rgba($white, 0.3);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.05);
      opacity: 0.6;
    }
  }

  // Content
  .epilogue__content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-lg;
    padding: 0 $spacing-md;
    text-align: center;
    max-width: 900px;
    width: 100%;
  }

  .epilogue__ctas {
    display: flex;
    gap: $spacing-md;
    margin-top: $spacing-sm;
    flex-wrap: wrap;
    justify-content: center;

    @media (max-width: 480px) {
      flex-direction: column;
      gap: $spacing-sm;
      width: 100%;
    }
  }

  .epilogue__cta-button {
    font-family: $font-body;
    font-size: 18px;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.8px;
    transition: all $duration-fast $ease-smooth;
    padding: 18px 40px;
    border-radius: 50px;
    cursor: pointer;
    display: inline-block;
    text-align: center;
    text-transform: uppercase;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba($white, 0.2);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    &:hover::before {
      width: 300px;
      height: 300px;
    }

    &--primary,
    &--secondary {
      background: rgba($epilogue-fog, 0.3);
      color: $white;
      border: 2px solid $epilogue-fog;
      backdrop-filter: blur(10px);
      box-shadow: 
        0 4px 15px rgba($epilogue-fog, 0.5),
        0 0 40px rgba($epilogue-fog, 0.4);

      &:hover {
        background: lighten($epilogue-fog, 5%);
        border-color: lighten($epilogue-fog, 15%);
        transform: translateY(-4px) scale(1.05);
        box-shadow: 
          0 8px 25px rgba($epilogue-fog, 0.7),
          0 0 50px rgba($epilogue-fog, 0.6);
      }

      &:active {
        transform: translateY(-2px) scale(1.02);
      }

      &:focus-visible {
        outline: 3px solid $epilogue-fog;
        outline-offset: 4px;
      }
    }

    @media (max-width: 480px) {
      width: 100%;
      max-width: 300px;
      padding: 14px 28px;
      font-size: 15px;
    }
  }

  .epilogue__narrative {
    font-family: $font-body;
    font-size: 16px;
    font-weight: 400;
    color: rgba($white, 0.9);
    line-height: 1.6;
    margin: $spacing-md 0 0 0;
    max-width: 600px;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 10px rgba($black, 0.5);

    @media (max-width: 768px) {
      font-size: 14px;
      margin-top: $spacing-sm;
    }

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }

  .epilogue__signature {
    display: inline-block;
    margin-top: 8px;
    font-size: 14px;
    font-weight: 300;
    color: rgba($white, 0.7);
    letter-spacing: 1px;
    font-style: italic;

    @media (max-width: 768px) {
      font-size: 13px;
    }

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  // Accessibility - reduced motion
  @media (prefers-reduced-motion: reduce) {
    .epilogue,
    .epilogue__star,
    .epilogue__circle,
    .epilogue__cta-button {
      animation: none !important;
      transition: none !important;
    }
  }

  // High contrast mode support
  @media (prefers-contrast: high) {
    .epilogue {
      background: #000;
    }

    .epilogue__cta-button--primary {
      background: darken($epilogue-gold, 15%);
      border-color: $white;
    }

    .epilogue__cta-button--secondary {
      border-color: $white;
      color: $white;
      background: rgba($white, 0.2);
    }

    .epilogue__narrative {
      color: $white;
    }

    .epilogue__circle {
      border-color: rgba($white, 0.6);
    }
  }
</style>
