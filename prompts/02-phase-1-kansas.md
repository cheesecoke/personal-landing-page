# Phase 1: Kansas Chapter - The Foundation

## Context
You are building the first chapter of a cinematic personal landing page. Phase 0 (setup) and the Hero section are complete. Now you're building the Kansas chapter - the first story section that appears after users scroll past the Hero.

## Design Vision
**Theme**: Humble beginnings, quiet work, endurance
**Palette**: Beige (#E8DCC4), sand (#D4C5A9), wheat (#C9B896)
**Mood**: Calm, serene, gentle motion (wind in wheat fields)
**Typography**: Fraunces serif for "Kansas", Inter sans for body text

## Technical Requirements
- **Framework**: Svelte + SvelteKit
- **Animations**: GSAP with ScrollTrigger
- **Styling**: SASS (separate `.scss` file)
- **Performance**: Target 60fps
- **File Structure**: Break into modular files (similar to Hero)

## Kansas Chapter Specifications

### Visual Elements
1. **Full viewport section** with beige/wheat gradient background
2. **Animated wheat field**: SVG paths that undulate gently (wind effect)
3. **Rolling hills**: 3 parallax layers (back, middle, front) with different scroll speeds
4. **Sunset sun**: Positioned behind the hills, partially visible
5. **Text content**:
   - Heading: "Kansas - Beginnings" (Fraunces, 48px, wheat color)
   - Body: "I grew up where the wind never stopped moving — Kansas. It taught me calm, endurance, and the value of quiet work." (Inter, 18px)

### Animations & Interactions
1. **Wheat field animation**: Continuous gentle undulation using GSAP
2. **Parallax scrolling**: Hills move at different speeds
   - Back hill: 50px movement
   - Middle hill: 100px movement
   - Front hill: 150px movement
3. **Text reveal**: Fade in with subtle drift (2s delay on scroll into view)
4. **Hover interaction**: Hovering over text triggers:
   - Soft glow effect
   - Faint seed particles dispersing (optional for now)

### Audio (Phase 1.6 - Can be added later)
- Ambient wind hum (Web Audio API)
- Fades in on scroll (volume ~0.2)
- For now, create placeholder function

### File Structure
```
src/lib/components/
├── Kansas.svelte (HTML structure only)
├── kansas.scss (all styles)
├── kansasAnimations.js (all GSAP logic)
```

## Implementation Checkpoints

### Checkpoint 1.1: Kansas Visual Foundation ✅
**Task**: Create the basic visual layout
- Create `Kansas.svelte` component with section structure
- Create `kansas.scss` with:
  - Full viewport height section
  - Beige/wheat gradient background
  - Proper z-index layering
- Import into main `+page.svelte`
- Test: Section renders with proper styling

### Checkpoint 1.2: Wheat Field & Hills
**Task**: Build static SVG background elements
- Create SVG wheat field pattern in Kansas.svelte
- Create 3 SVG hill layers (back, middle, front)
- Position sunset sun behind hills
- Style hills to be opaque (hide sun properly)
- Test: All elements visible and properly layered

### Checkpoint 1.3: Wheat Field Animation
**Task**: Animate wheat field with GSAP
- Create `kansasAnimations.js`
- Implement gentle undulating animation for wheat
- Use GSAP timeline for smooth continuous motion
- Target: Smooth 60fps animation
- Test: Wheat moves gently like wind

### Checkpoint 1.4: Parallax Scrolling
**Task**: Implement multi-layer parallax
- Add ScrollTrigger to `kansasAnimations.js`
- Hills move at different speeds on scroll
- Smooth scrub animation (no janky motion)
- Test: Parallax creates depth effect

### Checkpoint 1.5: Text Reveal Animation
**Task**: Add text with scroll-triggered reveal
- Add heading and body text to Kansas.svelte
- Create fade-in animation with GSAP
- Add subtle drift effect
- Trigger when section enters viewport
- Test: Text reveals smoothly on scroll

### Checkpoint 1.6: Hover Interactions
**Task**: Add interactive hover effects
- Detect hover over text
- Trigger soft glow (CSS filter or GSAP)
- Test: Hover states work on desktop
- Ensure touch-friendly (no broken mobile states)

### Checkpoint 1.7: Refinement & Polish
**Task**: Final polish pass
- Test on mobile (responsive)
- Verify 60fps performance
- Check accessibility (reduced motion)
- Add ARIA labels
- Code cleanup and comments

## Acceptance Criteria
- [ ] Kansas section renders full viewport
- [ ] Wheat field animates smoothly
- [ ] 3-layer parallax works correctly
- [ ] Text reveals on scroll into view
- [ ] Hover effects work on text
- [ ] 60fps performance maintained
- [ ] Mobile responsive
- [ ] Code is modular (separate .js and .scss files)
- [ ] Accessibility features present

## Reference Files
- See `/src/lib/components/Hero.svelte` for modular structure example
- See `/src/lib/components/heroAnimations.js` for GSAP pattern
- See `/src/lib/components/hero.scss` for styling pattern
- See `/CLAUDE.md` for project rules and restrictions

## Notes
- **DO NOT** use Tailwind or Bootstrap
- **DO NOT** create grid layouts - use organic, flowing design
- Keep animations subtle and luxurious (1.5s eases)
- Refer to color palette in `/src/styles/variables.scss`
- This is the template chapter - make it perfect before moving to California

## Success Checklist
When you're done, Kansas should:
1. ✅ Feel calm and serene (like Kansas plains)
2. ✅ Have smooth, gentle animations
3. ✅ Perform at 60fps
4. ✅ Be fully responsive
5. ✅ Use modular file structure
6. ✅ Match the muted elegant aesthetic

---

**Estimated Time**: 4-6 hours

**Mantra**: "Muted elegance. Subtle motion. Calm confidence. Design that breathes."

Begin with Checkpoint 1.1 and work through each checkpoint sequentially. Test thoroughly at each step before moving forward.
