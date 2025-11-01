<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let snakePath;
  let startCircle;
  let epilogueText;

  onMount(() => {
    if (!snakePath) return;

    const pathLength = snakePath.getTotalLength();

    // Set up the starting position - line hidden initially
    snakePath.style.strokeDasharray = pathLength;
    snakePath.style.strokeDashoffset = pathLength;

    // Animate the snake line drawing from top to bottom as user scrolls through ENTIRE page
    gsap.to(snakePath, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });

    // Start circle - just fade in, no scale animation
    gsap.from(startCircle, {
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#kansas',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });

    // Epilogue text - fade in when reaching epilogue
    gsap.from(epilogueText, {
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#epilogue',
        start: 'top 60%',
        toggleActions: 'play none none reverse'
      }
    });
  });
</script>

<div class="guiding-line">
  <!-- SVG centered on page with snake path -->
  <svg class="guiding-line__svg" viewBox="0 0 200 4000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">

    <!-- Start Circle - positioned just below Kansas heading -->
    <circle
      bind:this={startCircle}
      class="guiding-line__circle guiding-line__circle--start"
      cx="100"
      cy="200"
      r="12"
      fill="#C9B896"
    />

    <!-- Snake Path - runs through center with curves -->
    <path
      bind:this={snakePath}
      class="guiding-line__path"
      d="
        M 100,215

        Q 115,350 100,500
        Q 85,650 105,800
        Q 120,950 100,1100

        Q 80,1250 110,1400
        Q 130,1550 100,1700
        Q 70,1850 95,2000

        Q 125,2150 85,2300
        Q 60,2450 105,2600
        Q 135,2750 95,2900

        Q 100,3050 100,3200
        Q 100,3350 100,3500
        Q 100,3600 100,3700
      "
      fill="none"
      stroke="#8b6f47"
      stroke-width="2.5"
      stroke-linecap="round"
      opacity="0.6"
    />

    <!-- Epilogue Text - at the end instead of circle -->
    <text
      bind:this={epilogueText}
      class="guiding-line__text"
      x="100"
      y="3780"
      text-anchor="middle"
      fill="#D4AF37"
      font-size="24"
      font-family="Fraunces, serif"
    >
      Epilogue
    </text>
  </svg>
</div>

<style lang="scss">
  @import '../../styles/variables.scss';

  .guiding-line {
    position: fixed;
    left: 50%; // Center on page
    top: 0;
    width: 200px; // Wide enough for the curves
    height: 100vh;
    transform: translateX(-50%); // Center alignment
    z-index: 1; // Behind content
    pointer-events: none;
    overflow: visible;
  }

  .guiding-line__svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .guiding-line__path {
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1));
    transition: stroke 0.5s ease;
  }

  .guiding-line__circle {
    filter: drop-shadow(0 0 8px rgba(201, 184, 150, 0.4));

    &--start {
      // Subtle pulse animation - opacity only, no scale
      animation: pulse-start 3s ease-in-out infinite;
    }
  }

  .guiding-line__text {
    filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
    // Pulse animation for Epilogue text
    animation: pulse-text 2.5s ease-in-out infinite;
  }

  @keyframes pulse-start {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes pulse-text {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .guiding-line {
      width: 150px;
    }

    .guiding-line__path {
      stroke-width: 2;
    }

    .guiding-line__text {
      font-size: 18;
    }
  }
</style>

