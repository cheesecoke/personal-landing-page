# Phase 1: Kansas Chapter - Worker Prompt

## Context
You are building the **Kansas - Beginnings** chapter for a cinematic personal landing page. Phase 0 (setup) is complete. This is the foundational chapter that sets the template for all others.

## Required Reading
Before starting, read these files:
1. `CLAUDE.md` - Project rules (MANDATORY)
2. `IMPLEMENTATION_PLAN.md` - See Phase 1 section
3. `grok_report.pdf` - Pages 2-3 (Kansas Storyboard)

## Chapter Vision (from Grok Report)

### Objective
Set the stage for the user's journey through your story, rooted in Kansas upbringing. Convey formative years of learning, leadership, and discovering design principles during school and college. Mood: nostalgic yet purposeful, with visuals evoking growth and curiosity, not just pastoral charm.

### Key Text
"I grew up where the wind never stopped moving — Kansas. It taught me calm, endurance, and the value of quiet work."

### Visual Aesthetic
- Soft animated wheat fields (subtle SVG paths undulating like wind)
- Kansas color palette: beige (#E8DCC4), sand (#D4C5A9), wheat (#C9B896)
- Typography: Fraunces serif for "Kansas", Inter sans for body text
- Minimal, breathing space

---

## Your Mission

Build and perfect the Kansas chapter through 8 sequential checkpoints. Each builds on the previous. Test thoroughly at each step. Target: 60fps performance.

---

## Checkpoint 1.1: Kansas Visual Foundation

### Task
Create the visual layout and styling for the Kansas component.

### Actions

Update `src/lib/components/Kansas.svelte`:

```svelte
<script>
  // Animation logic will be added in next checkpoints
</script>

<section class="kansas" id="kansas">
  <div class="kansas__content">
    <h1 class="kansas__title">Kansas</h1>
    <p class="kansas__text">
      I grew up where the wind never stopped moving — Kansas.
      It taught me calm, endurance, and the value of quiet work.
    </p>
  </div>
</section>

<style lang="scss">
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
    color: $gray-dark;
    margin-bottom: $spacing-md;
    opacity: 0; // Will be animated
  }

  .kansas__text {
    font-family: $font-body;
    font-size: $font-size-body;
    line-height: $line-height-relaxed;
    color: $gray-medium;
    opacity: 0; // Will be animated
  }

  @media (max-width: 768px) {
    .kansas__title {
      font-size: 36px;
    }

    .kansas__text {
      font-size: 16px;
    }
  }
</style>
```

### Test
1. Run `npm run dev`
2. View Kansas section in browser
3. Verify gradient background displays correctly
4. Verify text is centered (but invisible - will fade in later)
5. Test responsive layout on mobile

### Acceptance Criteria
- [ ] Kansas section takes full viewport height
- [ ] Background gradient using Kansas color palette
- [ ] Typography uses correct fonts (Fraunces + Inter)
- [ ] Content centered and max-width constrained
- [ ] Responsive on mobile

---

## Checkpoint 1.2: Wheat Field SVG Animation

### Task
Create animated SVG wheat field background with subtle wind effect.

### Actions

1. **Update `Kansas.svelte`** - Add wheat field SVG:

```svelte
<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  let wheatField;

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
  });
</script>

<section class="kansas" id="kansas" bind:this={wheatField}>
  <!-- Wheat Field Background -->
  <svg class="kansas__wheat" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    {#each Array(30) as _, i}
      <path
        class="wheat-stalk"
        d="M{50 + i * 40},800 Q{50 + i * 40},{800 - Math.random() * 200} {50 + i * 40},{800 - 300 - Math.random() * 100}"
        stroke="#C9B896"
        stroke-width="2"
        fill="none"
        opacity="0.3"
      />
    {/each}
  </svg>

  <div class="kansas__content">
    <h1 class="kansas__title">Kansas</h1>
    <p class="kansas__text">
      I grew up where the wind never stopped moving — Kansas.
      It taught me calm, endurance, and the value of quiet work.
    </p>
  </div>
</section>

<style lang="scss">
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

  .kansas__wheat {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
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
    color: $gray-dark;
    margin-bottom: $spacing-md;
    opacity: 0;
  }

  .kansas__text {
    font-family: $font-body;
    font-size: $font-size-body;
    line-height: $line-height-relaxed;
    color: $gray-medium;
    opacity: 0;
  }

  @media (max-width: 768px) {
    .kansas__title {
      font-size: 36px;
    }

    .kansas__text {
      font-size: 16px;
    }
  }
</style>
```

### Test
1. Reload page
2. Verify wheat stalks visible and animating
3. Open browser DevTools > Performance
4. Record while scrolling - verify 60fps
5. Test on mobile device

### Acceptance Criteria
- [ ] 30 wheat stalks visible
- [ ] Stalks undulate smoothly (wind effect)
- [ ] Animation loops infinitely
- [ ] 60fps performance maintained
- [ ] Works on mobile

### Performance Note
If performance drops below 60fps, reduce number of wheat stalks or simplify animation.

---

## Checkpoint 1.3: Text Reveal Animation

### Task
Implement scroll-triggered text fade-in with gentle drift and wind effect.

### Actions

1. **Install GSAP ScrollTrigger** (if not already):
```bash
# This is included in gsap, just import it
```

2. **Update `Kansas.svelte`** with scroll-triggered text:

```svelte
<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let wheatField;
  let kansasTitle;
  let kansasText;

  onMount(() => {
    // Wheat field animation
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

    // Text reveal animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.kansas',
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
  });
</script>

<section class="kansas" id="kansas" bind:this={wheatField}>
  <!-- Wheat Field Background -->
  <svg class="kansas__wheat" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    {#each Array(30) as _, i}
      <path
        class="wheat-stalk"
        d="M{50 + i * 40},800 Q{50 + i * 40},{800 - Math.random() * 200} {50 + i * 40},{800 - 300 - Math.random() * 100}"
        stroke="#C9B896"
        stroke-width="2"
        fill="none"
        opacity="0.3"
      />
    {/each}
  </svg>

  <div class="kansas__content">
    <h1 class="kansas__title" bind:this={kansasTitle} style="transform: translateY(30px);">Kansas</h1>
    <p class="kansas__text" bind:this={kansasText} style="transform: translateY(30px);">
      I grew up where the wind never stopped moving — Kansas.
      It taught me calm, endurance, and the value of quiet work.
    </p>
  </div>
</section>

<style lang="scss">
  /* Same styles as before */
</style>
```

### Test
1. Scroll to Kansas section
2. Verify text fades in smoothly
3. Verify subtle left-right drift (wind effect)
4. Verify continuous subtle movement
5. Test ScrollTrigger works on mobile

### Acceptance Criteria
- [ ] Text hidden initially
- [ ] Scroll triggers fade-in animation
- [ ] Title and body drift subtly (mimicking wind)
- [ ] Continuous gentle movement after reveal
- [ ] Smooth, professional animation timing

---

## Checkpoint 1.4: Parallax Scrolling

### Task
Implement multi-layer parallax scrolling for depth (rolling plains effect).

### Actions

Update `Kansas.svelte` to add parallax layers:

```svelte
<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let kansasSection;
  let wheatBackground;
  let kansasTitle;
  let kansasText;

  onMount(() => {
    // Wheat field animation (same as before)
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

    // Parallax effect - background moves slower
    gsap.to(wheatBackground, {
      y: 100,
      scrollTrigger: {
        trigger: kansasSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1 // Smooth parallax
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

    // Text reveal animation (same as before)
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: kansasSection,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    timeline.to(kansasTitle, {
      opacity: 1,
      y: 0,
      x: -10,
      duration: 1.5,
      ease: 'power2.out'
    });

    timeline.to(kansasText, {
      opacity: 1,
      y: 0,
      x: 10,
      duration: 1.5,
      ease: 'power2.out'
    }, '-=1');

    // Continuous wind effect (same as before)
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
  });
</script>

<section class="kansas" id="kansas" bind:this={kansasSection}>
  <!-- Wheat Field Background (parallax layer) -->
  <div class="kansas__wheat-layer" bind:this={wheatBackground}>
    <svg class="kansas__wheat" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      {#each Array(30) as _, i}
        <path
          class="wheat-stalk"
          d="M{50 + i * 40},800 Q{50 + i * 40},{800 - Math.random() * 200} {50 + i * 40},{800 - 300 - Math.random() * 100}"
          stroke="#C9B896"
          stroke-width="2"
          fill="none"
          opacity="0.3"
        />
      {/each}
    </svg>
  </div>

  <div class="kansas__content">
    <h1 class="kansas__title" bind:this={kansasTitle} style="transform: translateY(30px);">Kansas</h1>
    <p class="kansas__text" bind:this={kansasText} style="transform: translateY(30px);">
      I grew up where the wind never stopped moving — Kansas.
      It taught me calm, endurance, and the value of quiet work.
    </p>
  </div>
</section>

<style lang="scss">
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

  .kansas__wheat-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .kansas__wheat {
    width: 100%;
    height: 100%;
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
    color: $gray-dark;
    margin-bottom: $spacing-md;
    opacity: 0;
  }

  .kansas__text {
    font-family: $font-body;
    font-size: $font-size-body;
    line-height: $line-height-relaxed;
    color: $gray-medium;
    opacity: 0;
  }

  @media (max-width: 768px) {
    .kansas__title {
      font-size: 36px;
    }

    .kansas__text {
      font-size: 16px;
    }
  }
</style>
```

### Test
1. Slowly scroll through Kansas section
2. Notice wheat background moves slower than text
3. Creates depth effect (rolling plains)
4. Verify smooth parallax (no jank)
5. Test on mobile with touch scroll

### Acceptance Criteria
- [ ] Background scrolls slower than foreground
- [ ] Creates convincing depth effect
- [ ] Smooth 60fps parallax scrolling
- [ ] Works on mobile (touch scroll)
- [ ] No layout shift or jank

---

## Checkpoint 1.5: Hover Interactions

### Task
Add hover effects - soft glow on key phrases + seed particle dispersing.

### Actions

This is optional/advanced. For now, add basic hover glow on text:

```svelte
<style lang="scss">
  /* ... previous styles ... */

  .kansas__text {
    font-family: $font-body;
    font-size: $font-size-body;
    line-height: $line-height-relaxed;
    color: $gray-medium;
    opacity: 0;
    transition: text-shadow 0.3s ease;
    cursor: default;

    &:hover {
      text-shadow: 0 0 20px rgba($kansas-wheat, 0.6);
    }
  }

  /* Accessibility - reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .kansas__text:hover {
      text-shadow: none;
    }
  }
</style>
```

### Test
1. Hover over body text
2. Verify soft glow appears
3. Test on touch devices (tap)
4. Verify reduced-motion preference respected

### Acceptance Criteria
- [ ] Hover creates subtle glow
- [ ] Transition smooth
- [ ] Touch-friendly
- [ ] Reduced-motion supported

**Note**: Seed particles can be added later if desired. Keep it simple for now.

---

## Checkpoint 1.6: Kansas Audio Integration

### Task
Setup Web Audio API with ambient wind hum that fades in on scroll.

### Actions

1. **Create audio utility** in `src/lib/utils/audio.js`:

```javascript
// Web Audio API setup
let audioContext;
let oscillator;
let gainNode;
let isPlaying = false;

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0; // Start silent
  }
}

export function playWindSound() {
  if (isPlaying) return;

  initAudio();

  // Create oscillator for wind-like sound
  oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = 80; // Low frequency for wind

  // Add slight frequency modulation for natural sound
  const lfo = audioContext.createOscillator();
  lfo.frequency.value = 0.5; // Slow modulation
  const lfoGain = audioContext.createGain();
  lfoGain.gain.value = 10;

  lfo.connect(lfoGain);
  lfoGain.connect(oscillator.frequency);

  oscillator.connect(gainNode);
  oscillator.start();
  lfo.start();

  isPlaying = true;
}

export function fadeInWind(targetVolume = 0.2, duration = 2) {
  if (!gainNode) return;

  const currentTime = audioContext.currentTime;
  gainNode.gain.cancelScheduledValues(currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
  gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + duration);
}

export function fadeOutWind(duration = 2) {
  if (!gainNode) return;

  const currentTime = audioContext.currentTime;
  gainNode.gain.cancelScheduledValues(currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
  gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
}

export function stopWind() {
  if (oscillator) {
    oscillator.stop();
    isPlaying = false;
  }
}

export function setWindVolume(volume) {
  if (gainNode) {
    gainNode.gain.value = volume;
  }
}
```

2. **Update `Kansas.svelte`** to use audio:

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { playWindSound, fadeInWind, fadeOutWind } from '$lib/utils/audio';

  gsap.registerPlugin(ScrollTrigger);

  let kansasSection;
  let wheatBackground;
  let kansasTitle;
  let kansasText;
  let audioInitialized = false;

  onMount(() => {
    // ... (previous wheat and parallax animations) ...

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

    // ... (rest of animations) ...
  });

  onDestroy(() => {
    // Clean up audio if needed
    fadeOutWind(0.5);
  });
</script>

<!-- ... rest of template ... -->
```

### Test
1. Scroll to Kansas section
2. Verify wind hum fades in (volume ~0.2)
3. Scroll away - verify fades out
4. Test in different browsers (Chrome, Firefox, Safari)
5. **Note**: Some browsers require user interaction before audio plays

### Acceptance Criteria
- [ ] Wind sound plays when scrolling to Kansas
- [ ] Volume fades in smoothly (0 → 0.2)
- [ ] Volume fades out when leaving section
- [ ] Works across browsers (may need user interaction)
- [ ] No audio errors in console

**Browser Note**: Modern browsers often block autoplay audio. You may need to add a "Start Experience" button that users click first.

---

## Checkpoint 1.7: Guiding Line - Kansas Segment

### Task
Build the first segment of the snake guiding line for Kansas.

### Actions

1. **Update `src/lib/components/GuidingLine.svelte`**:

```svelte
<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  let svg;
  let path;

  onMount(() => {
    // Animate the line drawing upward
    gsap.fromTo(
      path,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        scrollTrigger: {
          trigger: '#kansas',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      }
    );
  });
</script>

<svg class="guiding-line" bind:this={svg} viewBox="0 0 100 500" xmlns="http://www.w3.org/2000/svg">
  <!-- Kansas segment: gentle curves like wind in wheat fields -->
  <path
    bind:this={path}
    class="guiding-line__path guiding-line__path--kansas"
    d="M 10,450 Q 30,400 20,350 Q 10,300 30,250 Q 50,200 40,150 Q 30,100 50,50"
    fill="none"
    stroke="#C9B896"
    stroke-width="2"
    opacity="0.6"
  />
</svg>

<style lang="scss">
  .guiding-line {
    position: fixed;
    left: 0;
    top: 0;
    width: 100px;
    height: 100%;
    z-index: 100;
    pointer-events: none;
  }

  .guiding-line__path {
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .guiding-line__path--kansas {
    stroke: $kansas-wheat;
    opacity: 0.6;
  }
</style>
```

**Note**: You'll need the GSAP DrawSVGPlugin (premium) for the `drawSVG` effect. Alternative approach using `stroke-dasharray`:

```svelte
<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let path;

  onMount(() => {
    const pathLength = path.getTotalLength();

    // Set up the starting position
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    // Animate the line drawing
    gsap.to(path, {
      strokeDashoffset: 0,
      scrollTrigger: {
        trigger: '#kansas',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });
</script>

<svg class="guiding-line" viewBox="0 0 100 500" xmlns="http://www.w3.org/2000/svg">
  <path
    bind:this={path}
    class="guiding-line__path guiding-line__path--kansas"
    d="M 10,450 Q 30,400 20,350 Q 10,300 30,250 Q 50,200 40,150 Q 30,100 50,50"
    fill="none"
    stroke="#C9B896"
    stroke-width="2"
  />
</svg>

<style lang="scss">
  .guiding-line {
    position: fixed;
    left: 0;
    top: 0;
    width: 100px;
    height: 100%;
    z-index: 100;
    pointer-events: none;
  }

  .guiding-line__path {
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .guiding-line__path--kansas {
    stroke: $kansas-wheat;
    opacity: 0.6;
  }
</style>
```

### Test
1. Scroll through Kansas section
2. Verify line draws from bottom to top
3. Line should have gentle curves (like wind)
4. Syncs with scroll position
5. Test on mobile

### Acceptance Criteria
- [ ] Line draws progressively on scroll
- [ ] Gentle curving path (not straight)
- [ ] Fixed position on left side
- [ ] Syncs smoothly with scroll
- [ ] 60fps performance

---

## Checkpoint 1.8: Kansas Transition Out

### Task
Create smooth transition from Kansas to California chapter.

### Actions

Update `Kansas.svelte` to add transition styling at bottom:

```svelte
<section class="kansas" id="kansas" bind:this={kansasSection}>
  <!-- ... wheat field and content ... -->

  <!-- Transition fade overlay -->
  <div class="kansas__transition"></div>
</section>

<style lang="scss">
  /* ... previous styles ... */

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
  }
</style>
```

**Animation**: Update script to animate transition:

```javascript
// In onMount():
gsap.to('.kansas__transition', {
  opacity: 1,
  scrollTrigger: {
    trigger: kansasSection,
    start: 'bottom 60%',
    end: 'bottom top',
    scrub: 1
  }
});
```

### Test
1. Scroll to bottom of Kansas section
2. Verify misty fade appears
3. Color hints at California (mist tones)
4. Smooth gradient transition
5. Test timing feels natural

### Acceptance Criteria
- [ ] Misty fade at bottom of Kansas
- [ ] Hints at California color palette
- [ ] Smooth gradient (no harsh edges)
- [ ] Scroll-triggered (appears progressively)
- [ ] Natural transition timing

---

## Phase 1 Completion Checklist

Before marking Kansas chapter complete:

### Visual
- [ ] ✅ Kansas section full viewport
- [ ] ✅ Wheat field background visible
- [ ] ✅ Typography correct (Fraunces + Inter)
- [ ] ✅ Color palette matches (beige, sand, wheat)

### Animation
- [ ] ✅ Wheat stalks undulate (wind effect)
- [ ] ✅ Text fades in on scroll
- [ ] ✅ Text drifts subtly (mimicking wind)
- [ ] ✅ Parallax scrolling works
- [ ] ✅ Hover glow on text

### Audio
- [ ] ✅ Wind hum plays on scroll
- [ ] ✅ Fades in/out smoothly
- [ ] ✅ Volume at ~0.2
- [ ] ✅ Works in multiple browsers

### Guiding Line
- [ ] ✅ Line draws on scroll
- [ ] ✅ Gentle curves (Kansas style)
- [ ] ✅ Fixed position
- [ ] ✅ Syncs with scroll

### Transition
- [ ] ✅ Misty fade at bottom
- [ ] ✅ Hints at California palette
- [ ] ✅ Smooth transition

### Performance
- [ ] ✅ 60fps throughout
- [ ] ✅ No console errors
- [ ] ✅ Works on mobile
- [ ] ✅ Reduced-motion supported

### Accessibility
- [ ] ✅ Keyboard navigable
- [ ] ✅ Text readable
- [ ] ✅ Reduced-motion preference honored

---

## Final Output

When complete, provide:

1. **Screenshots/Screen Recording**: Show Kansas chapter in action
2. **Performance Report**: DevTools performance profile (should show 60fps)
3. **Console Check**: No errors or warnings
4. **Mobile Test**: Confirm works on mobile device
5. **Next Steps**: Confirm ready for Phase 2 (California Chapter)

---

## Troubleshooting

### Audio doesn't play
- Modern browsers block autoplay. Add a "Start Experience" button
- Check browser console for errors
- Verify Web Audio API is supported

### Performance issues
- Reduce number of wheat stalks (30 → 15)
- Simplify animations
- Use `will-change: transform` on animated elements
- Profile with Chrome DevTools

### Parallax feels janky
- Ensure `scrub: 1` or `scrub: true` on ScrollTrigger
- Use `transform` instead of `top/left` for better performance
- Check for layout shifts

### Guiding line doesn't appear
- Verify `position: fixed` on SVG
- Check z-index stacking
- Ensure path coordinates are visible in viewport
- Test `getTotalLength()` returns a value

---

## Important Reminders

### DO:
- Follow CLAUDE.md strictly
- Test after each checkpoint
- Target 60fps performance
- Support reduced-motion
- Test on mobile

### DON'T:
- Skip checkpoints
- Add features not in spec
- Use libraries beyond Svelte/GSAP/SASS
- Ignore performance
- Use bright colors

### Reference:
- `CLAUDE.md` - Your rules
- `grok_report.pdf` - Pages 2-3 (Kansas storyboard)
- `IMPLEMENTATION_PLAN.md` - Phase 1 details

---

**Ready? Start with Checkpoint 1.1 and work through each sequentially.**

Once complete, you will stop and we will test. 
