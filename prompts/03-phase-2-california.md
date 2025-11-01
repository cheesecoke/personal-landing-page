# Phase 2: California Chapter - Building Momentum

## Context
You are building the second chapter of a cinematic personal landing page. The Hero section and Kansas chapter are complete and working well. Now you're building the California chapter - representing creation, collaboration, and technical growth on the West Coast.

## Previous Work Completed
- ✅ **Hero Section**: Starfield background, D3 globe, typewriter text, scroll parallax
- ✅ **Kansas Section**: Wheat field animations, parallax hills, sunset sun, text reveals, Web Audio wind sound

## Design Vision
**Theme**: Creation, collaboration, color - where ideas come to life
**Palette**: Misty grays (#B8C5D0), California gray (#8B9BA8), gold (#D4AF37), teal (#5C8D89)
**Mood**: Coastal energy, creative movement, emerging possibilities
**Typography**: Fraunces serif for "California", Inter sans for body text

## Technical Requirements
- **Framework**: Svelte + SvelteKit (already set up)
- **Animations**: GSAP with ScrollTrigger
- **Styling**: SASS (separate `.scss` file for California)
- **Performance**: Target 60fps
- **File Structure**: Modular (similar to Hero and Kansas)

## California Chapter Specifications

### Visual Elements
1. **Full viewport section** with misty gray gradient background
2. **Abstract tech motifs**: Faint wireframe SVG elements that emerge like mirages
3. **Wave-like transitions**: Horizontal undulations creating coastal feel
4. **Text content**:
   - Heading: "California - Creation and Tech" (Fraunces, 48px, gold accent)
   - Body: "California brought color, collaboration, and creation. It's where I built things — interfaces, ideas, myself." (Inter, 18px, California gray)

### Animations & Interactions
1. **Text "swells in like ocean tide"**: Fade in with horizontal wave motion
2. **Tech wireframes emerge**: Faint SVG wireframes fade in and float upward
3. **Portfolio snippet orbs**:
   - Floating circular elements (no grids!)
   - Orbit gently on hover
   - Non-traditional, organic placement
4. **Parallax scrolling**: Background elements move slower than foreground
5. **Swipe-like gesture reveals**: Content reveals with swipe motion (scroll-based)

### Audio (Phase 2.5 - Can be added later)
- Faint synth/ocean swell sound (Web Audio API)
- Crossfades from Kansas wind sound
- Volume pulses with scroll speed
- For now, create placeholder function

### Guiding Line Transformation (Optional for now)
- Transform from Kansas curves to undulating waves
- Can be added in later phase

### File Structure
```
src/lib/components/
├── California.svelte (HTML structure only)
├── california.scss (all styles)
├── californiaAnimations.js (all GSAP logic)
```

## Implementation Checkpoints

### Checkpoint 2.1: California Visual Foundation ✅
**Task**: Create the basic visual layout
- Create `California.svelte` component with section structure
- Create `california.scss` with:
  - Full viewport height section
  - Misty gray gradient background (#B8C5D0 to #8B9BA8)
  - Proper z-index layering
- Add section to main `+page.svelte` (after Kansas)
- Test: Section renders with proper styling

### Checkpoint 2.2: Abstract Tech Motifs
**Task**: Build animated wireframe background
- Create SVG wireframe elements in California.svelte
  - Simple geometric shapes: circles, lines, grids
  - Faint stroke (1px, 20% opacity)
  - Multiple elements scattered organically
- Create `californiaAnimations.js`
- Implement "emerging like mirages" animation:
  - Elements fade in slowly
  - Float upward gently (GSAP)
  - Stagger delays for organic feel
- Test: Wireframes appear and animate smoothly

### Checkpoint 2.3: Text Reveal with Wave Motion
**Task**: Add California text with scroll-triggered reveal
- Add heading and body text to California.svelte
- Create "ocean tide swell" animation in californiaAnimations.js:
  - Text fades in
  - Horizontal wave motion (subtle translateX)
  - Scroll-triggered with ScrollTrigger
  - 2s delay before reveal
- Style typography:
  - Heading: Fraunces serif, 48px, gold (#D4AF37)
  - Body: Inter sans, 18px, California gray (#8B9BA8)
- Test: Text swells in smoothly on scroll

### Checkpoint 2.4: Portfolio Snippet Orbs
**Task**: Create floating interactive orbs
- Create 3-5 circular orb elements (SVG circles)
- Position organically (NOT in a grid!)
- Style with glass-morphism effect:
  - Semi-transparent background
  - Subtle backdrop-blur
  - Soft shadow
- Add gentle floating animation (GSAP)
- Implement hover interaction:
  - Orbs orbit gently (rotate around own axis)
  - Scale up slightly
  - Increase glow
- Test: Orbs float and respond to hover

### Checkpoint 2.5: Parallax Scrolling
**Task**: Add depth with parallax layers
- Identify elements for parallax:
  - Background wireframes (slow)
  - Middle orbs (medium)
  - Foreground text (fast)
- Use ScrollTrigger to animate Y position
- Different scroll speeds for depth
- Test: Smooth parallax creates depth effect

### Checkpoint 2.6: Swipe-like Content Reveal
**Task**: Add swipe gesture reveal effect
- Create additional content section (skills, projects, etc.)
- Implement scroll-based swipe reveal:
  - Content slides in from right
  - Use GSAP with ScrollTrigger
  - Smooth easing
- Make touch-friendly for mobile
- Test: Content reveals smoothly on scroll

### Checkpoint 2.7: Refinement & Polish
**Task**: Final polish pass
- Test on mobile (responsive)
- Verify 60fps performance
- Check accessibility (reduced motion)
- Add ARIA labels
- Code cleanup and comments
- Test transition from Kansas to California

## Acceptance Criteria
- [ ] California section renders full viewport with misty gradient
- [ ] Tech wireframes fade in and float smoothly
- [ ] Text swells in with wave motion on scroll
- [ ] Portfolio orbs float and orbit on hover
- [ ] Parallax scrolling works correctly
- [ ] Swipe-like reveal animates smoothly
- [ ] 60fps performance maintained
- [ ] Mobile responsive
- [ ] Code is modular (separate .js and .scss files)
- [ ] Accessibility features present (ARIA, reduced motion)
- [ ] Smooth transition from Kansas

## Color Palette Reference
Available in `/src/styles/variables.scss`:
```scss
// California colors
$california-mist: #B8C5D0;
$california-gray: #8B9BA8;
$california-gold: #D4AF37;
$california-teal: #5C8D89;
```

## Reference Files
- **Structure**: See `/src/lib/components/Hero.svelte` for modular pattern
- **Animations**: See `/src/lib/components/heroAnimations.js` for GSAP examples
- **Styles**: See `/src/lib/components/hero.scss` for SCSS pattern
- **Similar section**: See `/src/lib/components/Kansas.svelte` for chapter pattern
- **Project rules**: See `/CLAUDE.md` for restrictions and guidelines

## Design Principles (From CLAUDE.md)
- **FORBIDDEN**: Tailwind, Bootstrap, grid layouts, traditional UI components
- **USE**: Organic, flowing layouts with subtle motion
- **Colors**: Muted, elegant (avoid bright/saturated)
- **Motion**: Subtle, luxurious (1.5s eases)
- **Typography**: Fraunces (headers) + Inter (body)
- **Performance**: 60fps is non-negotiable

## Implementation Notes
- Follow the modular file structure (separate .js and .scss)
- Keep animations smooth and elegant (not aggressive)
- Portfolio orbs should feel "floating" and organic, not grid-based
- Use GSAP ScrollTrigger for all scroll animations
- Test on both desktop and mobile throughout
- Ensure smooth transition from Kansas wheat fields to California coast

## Success Checklist
When you're done, California should:
1. ✅ Feel coastal and creative (misty, flowing, emerging)
2. ✅ Have smooth wave-like animations
3. ✅ Perform at 60fps
4. ✅ Be fully responsive
5. ✅ Use modular file structure
6. ✅ Match the muted elegant aesthetic
7. ✅ Transition smoothly from Kansas

---

**Estimated Time**: 4-6 hours

**Mantra**: "Muted elegance. Subtle motion. Calm confidence. Design that breathes."

**Start with Checkpoint 2.1** and work through each checkpoint sequentially. Test thoroughly at each step before moving forward.

## Additional Context
This is a personal portfolio site with a narrative journey structure. California represents the creative/technical growth phase after Kansas beginnings. The tone should be:
- More dynamic than Kansas (but still subtle)
- Coastal energy (waves, mist, emerging)
- Technical but not cold (wireframes are faint, not harsh)
- Collaborative and creative (orbs represent projects/ideas)

Build this section to flow naturally from Kansas and set up the transition to Fire (the next chapter). Good luck! 🌊
