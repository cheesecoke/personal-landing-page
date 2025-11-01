# Personal Landing Page - Project Guidelines

## Project Overview
A cinematic, single-page application (SPA) telling a personal journey through Kansas → California → Fire → Colorado, culminating in an invitation to collaborate. This is NOT a portfolio; it's an interactive short film showcasing front-end development skills through storytelling and user experience.

## Core Vision
- **Experience**: "A cinematic, sensory journey through my life—told through muted elegance, subtle motion, and the calm confidence of design that breathes."
- **Goal**: Land front-end developer roles by showcasing resilience, precision, and storytelling through code
- **Duration**: Full journey in <10s scroll for impact
- **Aesthetic**: Refined, luxurious, minimalist - "muted elegance"

---

## MANDATORY REQUIREMENTS

### Tech Stack (DO NOT DEVIATE)
- **Framework**: Svelte + SvelteKit only
- **Animation**: Svelte Transitions + GSAP (for snake-line morphs and scroll magic)
- **Visuals**: SVG + Canvas (optional, if needed)
- **Audio**: Web Audio API (native, no libraries)
- **Styling**: SASS + Google Fonts (Fraunces serif for headers, Inter sans for body)
- **Build**: Vite
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel or Netlify

### Design Principles (NON-NEGOTIABLE)

#### Storytelling First
- Every element serves the narrative
- Snake guiding line is the FLUID thread, not a straight timeline
- User-driven: interactions respond to scroll/hover/touch
- Evoke emotion without force

#### Non-Traditional Design
- **FORBIDDEN**: Tailwind buttons, grids, standard UI components
- **USE**: Organic floating nodes, morphing SVGs, subtle pulses
- Keep it concise—full journey in <10s scroll
- Minimalist, breathing space

#### Theming Consistency
- **Colors**: Muted neutrals (beige, gray, ember, sage)
- **Typography**:
  - Headers: Fraunces serif
  - Body: Inter sans
- **Motion**: Subtle, luxurious (1.5s eases)
- **Audio**: Faint and optional, scene-linked

#### User Experience
- Forward-thinking, immersive—like a short film
- Subtle top-right nav dots ONLY (constellation style)
- Accessibility: ARIA, reduced-motion support, keyboard nav
- NO auto-loops in epilogue—user's choice

#### Tech Fidelity
- Stick to Svelte/GSAP/SASS stack
- NO additions without justification
- Prototype iteratively, test for 60fps performance
- Always reference `journey-blueprint.md` (this Grok Report)

---

## FORBIDDEN

### Do NOT Use
- React, Vue, or any framework other than Svelte
- jQuery or animation libraries besides GSAP
- Bootstrap, Tailwind, or any CSS framework
- Pre-built UI component libraries
- Heavy image assets (use SVG/Canvas)
- Traditional navigation menus or buttons
- Grid layouts (use organic, flowing layouts)
- Generic templates or "out of the box" designs

### Design Anti-Patterns
- No straight timelines (must be snake-like)
- No bright, saturated colors
- No aggressive animations or motion
- No click-heavy interactions (scroll/hover focus)
- No traditional portfolio grid layouts
- No auto-playing loops (except where specified)

---

## REQUIRED ELEMENTS

### The Snake Guiding Line
- **Critical**: Dynamic SVG that undulates across sections
- Appears as faint, curving horizon line at bottom
- Slowly draws upward as if carried by a breeze
- Morphs shape per chapter:
  - Kansas: Gentle curves like wind in wheat fields
  - California: Undulating waves
  - Fire: Flickers erratically like a pulse
  - Colorado: Straightens into steady, purposeful path
  - Epilogue: Curves into luminous circle
- **Tech**: SVG paths animated via GSAP morphing

### Top-Right Navigation
- Constellation dots only (subtle, non-obtrusive)
- Quick chapter jumps
- Non-traditional and unobtrusive
- Responsive to reduced-motion preferences

### Chapter Structure
1. **Entry Point**: Immersive load into Kansas
2. **Chapter 1: Kansas - Beginnings** (scroll-triggered)
3. **Chapter 2: California - Creation and Tech** (fluid transition)
4. **Chapter 3: Fire - Transformation** (intensifying motion)
5. **Chapter 4: Colorado - Rebirth/Renewal** (calming resolution)
6. **Epilogue: The Invitation** (stillness with CTAs)
7. **Extras**: Minimal footer (credits if needed), audio toggle

---

## CHAPTER REQUIREMENTS

### Kansas - Beginnings
- **Visual**: Soft animated wheat fields (SVG paths undulating like wind)
- **Text**: "I grew up where the wind never stopped moving — Kansas. It taught me calm, endurance, and the value of quiet work."
- **Interaction**: Parallax scrolling, hover triggers glow + seed particles
- **Audio**: Ambient wind hum (Web Audio API, volume low ~0.2)
- **Transition**: Guiding line curves upward, misty fade to California

### California - Creation and Tech
- **Visual**: Misty grays with golden accents, abstract tech motifs (faint wireframes)
- **Text**: "California brought color, collaboration, and creation. It's where I built things — interfaces, ideas, myself."
- **Interaction**: Swipe-like reveals of portfolio snippets (floating orbs on hover)
- **Audio**: Faint synth/ocean swell replaces wind
- **Transition**: Wave intensifies, heat shimmer hints at Fire

### Fire - Transformation
- **Visual**: Smoky ember-lit scene (muted smoke gray, ember orange, charcoal)
- **Text**: "Fire – Where I Learned Humility and Strength" + wildland firefighting narrative
- **Interaction**: Heat shimmer, guiding line flickers diagonally, "humbling scale" effect
- **Audio**: Bass hum deepens, soft grounding thud on hover
- **Transition**: Guiding line steadies, palette cools to fog-blue/sage

### Colorado - Rebirth/Renewal
- **Visual**: Crisp minimalist mountainscape (soft snow-white, fog-blue, sage gray)
- **Text**: "Colorado – A New Chapter in Code and Nature"
- **Interaction**: Abstract code artifacts float into view, "fusion" effect on hover
- **Audio**: Wind chime shifts pitch subtly with scroll
- **Transition**: Guiding line curves gently, begins to arc into circle

### Epilogue - The Invitation
- **Visual**: Expansive white space, guiding line morphs into luminous circle
- **Text**:
  - Primary CTA: "Hire Me" (Fraunces serif, 36px, soft gold)
  - Secondary CTA: "Explore my GitHub" (Inter sans, 16px, sage gray)
  - Subtle narrative: "This is just the beginning—let's code the next chapter together."
- **Interaction**: Hover awakens circle with outward-spiraling lines, elegant line trace on GitHub link
- **Audio**: Interaction-only: crystalline chime on CTA hover
- **State**: Eternal poise—no auto-loops, just user's choice

---

## FILE STRUCTURE

```
/
├── src/
│   ├── routes/
│   │   └── +page.svelte          # Main scroll container
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Kansas.svelte
│   │   │   ├── California.svelte
│   │   │   ├── Fire.svelte
│   │   │   ├── Colorado.svelte
│   │   │   ├── Epilogue.svelte
│   │   │   ├── GuidingLine.svelte
│   │   │   └── Navigation.svelte
│   │   └── utils/
│   │       ├── guidingLine.js     # SVG morph logic via GSAP
│   │       └── audio.js           # Web Audio API setup
│   ├── styles/
│   │   ├── global.scss
│   │   └── variables.scss         # Color palette, typography
│   └── app.html
├── static/
│   └── fonts/                     # Fraunces + Inter
├── tests/
│   ├── unit/
│   └── e2e/
├── journey-blueprint.md           # This Grok Report (reference doc)
├── CLAUDE.md                      # This file (project rules)
├── package.json
├── vite.config.js
├── svelte.config.js
└── README.md
```

---

## DEVELOPMENT WORKFLOW

### Iterative Chapter-by-Chapter Approach
1. **Phase 0**: Setup (SvelteKit + dependencies + file structure)
2. **Phase 1**: Build Kansas chapter (test snake line, parallax, audio)
3. **Phase 2**: Build California chapter (test transitions, interactions)
4. **Phase 3**: Build Fire chapter (test intensity, performance)
5. **Phase 4**: Build Colorado chapter (test calming resolution)
6. **Phase 5**: Build Epilogue (test CTAs, final polish)
7. **Phase 6**: Integration, testing, optimization
8. **Phase 7**: Deployment + documentation

### Quality Checkpoints (Each Phase)
- ✅ 60fps performance (test on mobile)
- ✅ Accessibility (ARIA, keyboard nav, reduced-motion)
- ✅ Snake line behaves correctly
- ✅ Audio works (Web Audio API)
- ✅ Theming consistency (colors, fonts, motion)
- ✅ Reference journey-blueprint.md for accuracy

### Testing Requirements
- Unit tests for utility functions (Vitest)
- E2E tests for scroll interactions (Playwright)
- Performance testing (60fps target)
- Accessibility testing (ARIA, keyboard, reduced-motion)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (touch scroll triggers wind effects)

---

## DELIVERABLES

### Code Artifacts
- Clean, commented code
- Reusable components
- Performance-optimized animations
- Accessible interactions

### Documentation
- Component documentation
- Setup/build instructions
- Deployment guide
- Performance metrics

---

## FEEDBACK LOOP

Always reference `journey-blueprint.md`. If deviating, justify how it enhances the story. Output code snippets, not full files—let me build/test. Adhere strictly: This is my resilient evolution, coded with intention. No cheesiness; raw, humble, professional.

---

## MANTRA

"Muted elegance. Subtle motion. Calm confidence. Design that breathes."

This is a forward-thinking, story-rich site showcasing front-end skills for HR appeal.
