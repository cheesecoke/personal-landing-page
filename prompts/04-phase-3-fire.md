# Phase 3: Fire Chapter - Peak Intensity

## Context
You are building the third chapter of a cinematic personal landing page. The Hero, Kansas, and California chapters are complete. Now you're building the Fire chapter - representing transformation, humility, and strength through wildland firefighting experiences.

## Previous Work Completed
- ✅ **Hero Section**: Starfield background, D3 globe, typewriter text
- ✅ **Kansas Section**: Wheat field animations, parallax hills, text reveals, audio
- ✅ **California Section**: Tech wireframes, portfolio orbs, wave animations

## Design Vision
**Theme**: Transformation through fire - humility, strength, controlled chaos
**Palette**: Smoke gray (#6B6B6B), ember orange (#D97757), charcoal (#3A3A3A)
**Mood**: Intense but controlled, smoky, flickering, grounding
**Typography**: Fraunces serif for "Fire", Inter sans for body text

## Technical Requirements
- **Framework**: Svelte + SvelteKit (already set up)
- **Animations**: GSAP with ScrollTrigger
- **Styling**: SASS (separate `.scss` file)
- **Performance**: Target 60fps (critical for intense animations)
- **File Structure**: Modular (similar to Kansas/California)

## Fire Chapter Specifications

### Visual Elements
1. **Full viewport section** with smoky gradient background (smoke gray to charcoal)
2. **Abstract heat shimmer**: Subtle distortion effect on edges
3. **Particle drifts**: Faint ember-like particles (NOT literal fire)
4. **Diagonal movement**: Elements move diagonally (unlike horizontal/vertical of previous sections)
5. **Text content**:
   - Heading: "Fire - Where I Learned Humility and Strength" (Fraunces, 48px, ember orange)
   - Body: Narrative about wildland firefighting experiences (Inter, 18px, soft charcoal)

### Animations & Interactions
1. **Heat shimmer background**: Subtle CSS filter blur/distortion
2. **Erratic flickering**: Elements pulse with controlled randomness
3. **Diagonal scroll animations**: Content moves diagonally on scroll
4. **"Humbling scale" interaction**: Hover expands element briefly, then contracts
5. **Smoke blur reveal**: Text emerges through blur-to-clear transition
6. **Scroll-intensified shimmer**: Heat effect intensifies with scroll speed

### Audio (Phase 3.5 - Can be added later)
- Deep bass hum (Web Audio API)
- Builds with scroll speed
- Soft grounding thud on hover (like tree falling)
- For now, create placeholder function

### File Structure
```
src/lib/components/
├── Fire.svelte (HTML structure only)
├── fire.scss (all styles)
├── fireAnimations.js (all GSAP logic)
```

## Implementation Checkpoints

### Checkpoint 3.1: Copy Kansas Section as Template ✅
**IMPORTANT: START HERE**

**Task**: Use Kansas as the foundation, then modify
- Copy `/src/lib/components/Kansas.svelte` to `/src/lib/components/Fire.svelte`
- Copy `/src/lib/components/kansas.scss` to `/src/lib/components/fire.scss` (if it exists as separate file, otherwise extract styles)
- Update all class names:
  - `.kansas__*` → `.fire__*`
  - `kansas-*` → `fire-*`
- Update section ID: `id="kansas"` → `id="fire"`
- Replace text content:
  - Heading: "Fire - Where I Learned Humility and Strength"
  - Body: Your firefighting narrative
- Update import in Fire.svelte to use `fire.scss`
- Add Fire component to main `+page.svelte` (after California)
- Test: Fire section renders with Kansas structure but Fire text

**Why this approach?**
- Maintains consistent section structure
- Preserves working animations/parallax patterns
- Faster iteration (modify existing vs build from scratch)
- Ensures smooth transitions between sections

### Checkpoint 3.2: Update Color Palette
**Task**: Change Kansas colors to Fire colors
- In `fire.scss`, replace color variables:
  - Kansas beige → Smoke gray (#6B6B6B)
  - Kansas wheat → Ember orange (#D97757)
  - Kansas sand → Charcoal (#3A3A3A)
- Update gradient backgrounds
- Update text colors (heading: ember orange, body: charcoal)
- Test: Fire section now uses smoky/ember color scheme

### Checkpoint 3.3: Transform Wheat Field to Particle Drifts
**Task**: Replace wheat field SVG with ember particles
- Remove wheat stalk SVG elements
- Create small SVG circles for ember particles (5-10 particles)
- Style particles:
  - Small (3-5px diameter)
  - Ember orange with glow
  - Semi-transparent
- Animate particles with GSAP:
  - Slow upward drift (like smoke)
  - Slight horizontal sway
  - Fade in/out cycle
- Test: Particles drift smoothly upward

### Checkpoint 3.4: Change Hills to Abstract Shapes
**Task**: Transform rolling hills into abstract smoky layers
- Modify SVG hill paths to be less defined (more abstract)
- Change fills to smoke gray with gradients
- Keep parallax animation (different scroll speeds)
- Add subtle blur filter for smoky effect
- Remove sunset sun (not relevant to Fire theme)
- Test: Abstract smoky layers create depth

### Checkpoint 3.5: Add Heat Shimmer Effect
**Task**: Create heat distortion background
- Add CSS backdrop-filter blur to background layer
- Implement subtle scale/skew animation (GSAP)
- Create shimmer that intensifies on scroll:
  - Use ScrollTrigger
  - Increase blur/distortion as user scrolls
- Keep effect subtle (no motion sickness)
- Test: Shimmer creates heat effect without being overwhelming

### Checkpoint 3.6: Implement Erratic Flickering
**Task**: Add controlled randomness to animations
- Modify GSAP animations to include slight jitter
- Elements pulse with varying timing (not synchronized)
- Use GSAP's random utilities for organic feel
- Diagonal movement instead of horizontal/vertical
- Test: Flickering feels controlled, not chaotic

### Checkpoint 3.7: Text Blur-to-Clear Reveal
**Task**: Replace text reveal with blur effect
- Text starts with high blur (CSS filter: blur(10px))
- On scroll trigger, blur reduces to 0
- Combine with fade-in animation
- 2s auto-delay before reveal
- Test: Text emerges through smoke-like effect

### Checkpoint 3.8: "Humbling Scale" Interaction
**Task**: Add unique hover interaction
- On hover over specific element (text or particle):
  - Element expands briefly (scale: 1.2)
  - Then contracts back (scale: 1)
  - Add abstract tree-like shapes that form/dissolve
- Use GSAP timeline for sequence
- Make accessible (keyboard support)
- Test: Interaction feels meaningful and controlled

### Checkpoint 3.9: Diagonal Scroll Animations
**Task**: Change movement direction to diagonal
- Update ScrollTrigger animations:
  - Instead of pure vertical (y)
  - Use both x and y transforms
  - Create diagonal movement
- Maintain parallax (different speeds)
- Test: Diagonal motion creates unique feel vs Kansas/California

### Checkpoint 3.10: Refinement & Polish
**Task**: Final polish pass
- Optimize particle count for performance
- Test 60fps (use Chrome DevTools)
- Add reduced-motion support
- Test on mobile (responsive)
- Add ARIA labels
- Test transition from California to Fire
- Code cleanup and comments

## Acceptance Criteria
- [ ] Fire section built from Kansas template (structure maintained)
- [ ] Smoky color palette applied (gray/orange/charcoal)
- [ ] Ember particles drift upward smoothly
- [ ] Heat shimmer effect visible and subtle
- [ ] Erratic flickering creates controlled intensity
- [ ] Text reveals through blur effect
- [ ] "Humbling scale" hover interaction works
- [ ] Diagonal scroll animations feel unique
- [ ] 60fps performance maintained
- [ ] Mobile responsive
- [ ] Accessibility features present
- [ ] Smooth transition from California

## Color Palette Reference
Available in `/src/styles/variables.scss`:
```scss
// Fire colors
$fire-smoke: #6B6B6B;
$fire-ember: #D97757;
$fire-charcoal: #3A3A3A;
```

## Reference Files
- **Template**: Copy from `/src/lib/components/Kansas.svelte`
- **Structure**: See `/src/lib/components/Hero.svelte` for modular pattern
- **Animations**: See `/src/lib/components/heroAnimations.js` for GSAP examples
- **Project rules**: See `/CLAUDE.md` for restrictions and guidelines

## Design Principles (From CLAUDE.md)
- **FORBIDDEN**: Tailwind, Bootstrap, bright colors, aggressive motion
- **USE**: Muted elegance, subtle motion, controlled chaos
- **Colors**: Smoky/muted (NOT bright fire colors)
- **Motion**: Intense but controlled (NOT jarring)
- **Performance**: 60fps is critical (test with particles)

## Implementation Strategy
1. **Start with Kansas** (working foundation)
2. **Iterative transformation** (change one element at a time)
3. **Test frequently** (ensure nothing breaks)
4. **Maintain structure** (section layout, timing, transitions)
5. **Polish performance** (particles can be heavy - optimize)

## Success Checklist
When you're done, Fire should:
1. ✅ Feel intense but controlled (smoky, flickering)
2. ✅ Have unique diagonal movement (different from other sections)
3. ✅ Perform at 60fps (even with particles)
4. ✅ Be fully responsive
5. ✅ Use modular file structure
6. ✅ Maintain muted elegant aesthetic (NOT bright/loud)
7. ✅ Transition smoothly from California

---

**Estimated Time**: 5-7 hours

**Mantra**: "Muted elegance. Subtle motion. Calm confidence. Design that breathes."

**CRITICAL**: Start with Checkpoint 3.1 (copy Kansas) before doing anything else. This ensures consistency and saves time.

## Additional Context
Fire represents transformation through humility and strength. The wildland firefighting experience taught:
- Humility in the face of nature's power
- Strength through physical and mental challenges
- Teamwork and controlled response to chaos

The design should reflect:
- **Intensity without aggression** (controlled burn, not wildfire)
- **Humbling scale** (big forces, small human)
- **Grounding** (smoke settles, embers cool)

This is the climax of the journey before the resolution in Colorado. Make it powerful but not overwhelming. 🔥
