# Phase 0: Project Foundation & Setup - Worker Prompt

## Context
You are helping build a cinematic personal landing page that tells a story through Kansas → California → Fire → Colorado → Epilogue. This is Phase 0: establishing the technical foundation from scratch.

## Required Reading
Before starting, read these files in this directory:
1. `CLAUDE.md` - Project rules and restrictions (MANDATORY)
2. `IMPLEMENTATION_PLAN.md` - Full phased plan
3. `grok_report.pdf` - Complete vision document

## Your Mission
Initialize a SvelteKit project from scratch and set up the complete technical foundation following the exact specifications in CLAUDE.md. Work through each checkpoint sequentially.

---

## Checkpoint 0.1: Initialize SvelteKit Project

### Task
Initialize a new SvelteKit project in the current directory.

### Actions
1. Run `npm create svelte@latest .` with these options:
   - SvelteKit app template
   - TypeScript: Yes (optional, but recommended)
   - ESLint: Yes
   - Prettier: Yes
   - Playwright: Yes
   - Vitest: Yes

2. Install dependencies: `npm install`

3. Verify dev server runs: `npm run dev`

### Acceptance Criteria
- [ ] SvelteKit project initialized
- [ ] Dev server starts without errors
- [ ] Can access localhost in browser

### Output
Confirm completion and show package.json contents.

---

## Checkpoint 0.2: Install Core Dependencies

### Task
Install all required packages per CLAUDE.md specifications.

### Actions
```bash
npm i gsap
npm i -D sass vite-plugin-sass
```

### Acceptance Criteria
- [ ] GSAP installed (for animations)
- [ ] SASS installed (for styling)
- [ ] All dependencies in package.json

### Output
Show updated package.json dependencies section.

---

## Checkpoint 0.3: Configure Build Tools

### Task
Configure Vite, Svelte, and testing tools.

### Actions
1. Update `vite.config.js` to include SASS plugin
2. Update `svelte.config.js` to include SASS preprocessor
3. Verify Playwright config exists
4. Verify Vitest config exists
5. Run test build: `npm run build`

### Vite Config Example
```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import './src/styles/variables.scss';`
      }
    }
  }
});
```

### Svelte Config
Ensure preprocessor is configured for SCSS.

### Acceptance Criteria
- [ ] vite.config.js configured
- [ ] svelte.config.js configured
- [ ] Build completes successfully
- [ ] No configuration errors

### Output
Show vite.config.js and svelte.config.js contents. Confirm build succeeds.

---

## Checkpoint 0.4: Setup Project Structure

### Task
Create complete file structure per CLAUDE.md specifications.

### Actions
Create these directories and files:

```
src/
├── lib/
│   ├── components/
│   │   ├── Kansas.svelte
│   │   ├── California.svelte
│   │   ├── Fire.svelte
│   │   ├── Colorado.svelte
│   │   ├── Epilogue.svelte
│   │   ├── GuidingLine.svelte
│   │   └── Navigation.svelte
│   └── utils/
│       ├── guidingLine.js
│       └── audio.js
├── styles/
│   ├── global.scss
│   └── variables.scss
└── routes/
    └── +page.svelte
```

### Component Placeholders
Each component should be a basic placeholder:

```svelte
<script>
  // Component logic will be added in later phases
</script>

<section class="[component-name]">
  <p>[Component Name] - Placeholder</p>
</section>

<style lang="scss">
  .[component-name] {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
```

### Utility Placeholders
```javascript
// guidingLine.js
export const guidingLine = {
  // GSAP morphing logic will be added in Phase 1
};

// audio.js
export const audio = {
  // Web Audio API setup will be added in Phase 1
};
```

### Acceptance Criteria
- [ ] All directories created
- [ ] All component files created with placeholders
- [ ] All utility files created with placeholders
- [ ] Style files created

### Output
List all created files. Show directory tree.

---

## Checkpoint 0.5: Setup Typography & Color System

### Task
Define complete design system (fonts + colors) in SASS variables.

### Actions

1. **Add Google Fonts** to `src/app.html`:
```html
<head>
  <!-- existing head content -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet">
</head>
```

2. **Create `src/styles/variables.scss`**:
```scss
// Typography
$font-header: 'Fraunces', serif;
$font-body: 'Inter', sans-serif;

// Font Sizes
$font-size-hero: 48px;
$font-size-h1: 36px;
$font-size-h2: 24px;
$font-size-body: 18px;
$font-size-small: 16px;
$font-size-tiny: 14px;

// Line Heights
$line-height-tight: 1.2;
$line-height-normal: 1.5;
$line-height-relaxed: 1.8;

// Colors - Kansas
$kansas-beige: #E8DCC4;
$kansas-sand: #D4C5A9;
$kansas-wheat: #C9B896;

// Colors - California
$california-mist: #B8C5D0;
$california-gray: #8B9BA8;
$california-gold: #D4AF37;
$california-teal: #5C8D89;

// Colors - Fire
$fire-smoke: #6B6B6B;
$fire-ember: #D97757;
$fire-charcoal: #3A3A3A;

// Colors - Colorado
$colorado-snow: #F5F5F5;
$colorado-fog: #5B8FA3;
$colorado-sage: #8B9D83;

// Colors - Epilogue
$epilogue-white: #FFFFFF;
$epilogue-gold: #D4AF37;
$epilogue-sage: #8B9D83;
$epilogue-fog: #A5B9C7;

// Neutrals
$black: #000000;
$white: #FFFFFF;
$gray-dark: #333333;
$gray-medium: #666666;
$gray-light: #CCCCCC;

// Animation
$ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
$duration-fast: 0.3s;
$duration-medium: 0.8s;
$duration-slow: 1.5s;

// Spacing
$spacing-xs: 0.5rem;
$spacing-sm: 1rem;
$spacing-md: 2rem;
$spacing-lg: 4rem;
$spacing-xl: 8rem;
```

3. **Create `src/styles/global.scss`**:
```scss
@import './variables.scss';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: $font-body;
  font-size: $font-size-body;
  line-height: $line-height-normal;
  color: $gray-dark;
  background: $white;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: $font-header;
  line-height: $line-height-tight;
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

4. **Import global styles** in `src/routes/+layout.svelte`:
```svelte
<script>
  import '../styles/global.scss';
</script>

<slot />
```

Create `+layout.svelte` if it doesn't exist.

### Acceptance Criteria
- [ ] Google Fonts linked in app.html
- [ ] variables.scss contains all color palettes
- [ ] variables.scss contains typography system
- [ ] global.scss applies base styles
- [ ] Fonts render correctly in browser
- [ ] Reduced-motion support added

### Output
Show variables.scss and global.scss contents. Confirm fonts load in browser.

---

## Checkpoint 0.6: Setup Main Page Container

### Task
Create main scroll container that imports all chapter components.

### Actions

Update `src/routes/+page.svelte`:

```svelte
<script>
  import Kansas from '$lib/components/Kansas.svelte';
  import California from '$lib/components/California.svelte';
  import Fire from '$lib/components/Fire.svelte';
  import Colorado from '$lib/components/Colorado.svelte';
  import Epilogue from '$lib/components/Epilogue.svelte';
  import GuidingLine from '$lib/components/GuidingLine.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
</script>

<svelte:head>
  <title>Chase Cole - A Journey Through Code</title>
  <meta name="description" content="A cinematic journey through Kansas, California, Fire, Colorado - told through code and design." />
</svelte:head>

<main class="scroll-container">
  <Navigation />
  <GuidingLine />

  <Kansas />
  <California />
  <Fire />
  <Colorado />
  <Epilogue />
</main>

<style lang="scss">
  .scroll-container {
    width: 100%;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }
</style>
```

### Acceptance Criteria
- [ ] Main page imports all components
- [ ] Page renders without errors
- [ ] All placeholder chapters visible
- [ ] Smooth scroll behavior works
- [ ] Page title set correctly

### Output
Show +page.svelte contents. Confirm page renders with all placeholder chapters.

---

## Phase 0 Completion Checklist

Review these before marking Phase 0 complete:

- [ ] ✅ Dev server runs without errors
- [ ] ✅ All dependencies installed (check package.json)
- [ ] ✅ File structure complete (all components and utils created)
- [ ] ✅ Design system working (fonts load, colors defined)
- [ ] ✅ Main page renders with all placeholder chapters
- [ ] ✅ Build completes successfully (`npm run build`)
- [ ] ✅ No console errors in browser

---

## Final Output

When complete, provide:

1. **Directory Tree**: Show complete file structure
2. **Package.json**: Show all dependencies
3. **Screenshot/Description**: Describe what you see in browser
4. **Build Status**: Confirm production build works
5. **Next Steps**: Confirm ready for Phase 1 (Kansas Chapter)

---

## Important Reminders

### DO:
- Follow CLAUDE.md rules strictly
- Use Svelte + SvelteKit only
- Use SASS for styling
- Test after each checkpoint
- Keep it minimal (placeholders only in Phase 0)

### DON'T:
- Add any frameworks besides Svelte
- Install unnecessary dependencies
- Skip checkpoints
- Add actual chapter content yet (that's for later phases)
- Use Tailwind or CSS frameworks

### Reference Documents:
- `CLAUDE.md` - Your bible for this project
- `IMPLEMENTATION_PLAN.md` - Detailed roadmap
- `grok_report.pdf` - Complete vision

---

## Emergency Help

If stuck:
1. Re-read CLAUDE.md
2. Check IMPLEMENTATION_PLAN.md Phase 0 section
3. Verify all commands ran successfully
4. Check for typos in file paths
5. Clear node_modules and reinstall if needed

---

**Ready to begin? Start with Checkpoint 0.1 and work sequentially through all checkpoints.**

Once Phase 0 is complete, we'll move to Phase 1: Kansas Chapter.
