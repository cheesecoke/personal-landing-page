# AGENTS.md

Router for every agent working in this repo. Read this first, then the file it points to.

## What this is

The source for chasewcole.com: a pre-rendered static site (Vite, React 19, React Router framework
mode) built from a component library that lives in Storybook. pnpm workspace + Turborepo.

| Path               | Holds                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| `packages/tokens`  | `src/tokens.ts`, the single source for colour, type, space, motion, freshness |
| `packages/ui`      | Components: `src/primitives`, `src/layout`, `src/sections`, stories beside    |
| `packages/canopy`  | The three.js tree: framework-free core plus a React wrapper                   |
| `packages/content` | zod schemas, content loader, freshness rules, fixtures                        |
| `apps/site`        | Routes and page templates (`app/`), content (`content/hand`, `content/live`)  |
| `docs/`            | `components.md` (inventory and status), `decisions/` (short ADRs)             |

## Commands

```
pnpm install
pnpm typecheck    pnpm lint    pnpm test    pnpm build
pnpm dev          pnpm storybook            pnpm build-storybook
```

## Hard rules

1. **Evidence over assumption.** Read the code before changing it. A success claim needs the
   runner's summary line or a screenshot. Never say something works unless you ran it.
2. **Never `git add -A` or `git add .`.** Stage files by name.
3. **Small PRs, one concern each.** Split again if the diff gets big.
4. **Surface conflicts.** If instructions, the design and the code disagree, stop and say so. Never
   discard someone else's work to get a merge through.
5. **No planning docs in this repo.** Plans, briefs and feedback live elsewhere. `docs/` holds only
   the component inventory and decision records.
6. **Never skip hooks or checks.** Do not delete a test to get green.

## Site rules

1. **Tokens only.** No literal colours, sizes or timings in components. Everything comes from
   `packages/tokens`. A missing token is a small separate PR to `packages/tokens`.
2. **The type system.** Use the type roles (hero, h1, h2, h3, lead, body, label, readout). Mona Sans
   is the voice; Tomorrow is only for readouts (numerals, status words, dates).
3. **One glow per view.** Signal and Ember never appear in the same component. Smoke never sits on
   Raised.
4. **Copy comes only from content files.** Components take plain props and never hard-code copy or
   import JSON. Do not write new copy.
5. **Never hand-edit `apps/site/content/live/`.** The publish bot owns it. Fixtures live in
   `packages/content/fixtures/`.
6. **Packages never import from `apps/`** (`import/no-restricted-paths`). `tokens`, `ui`, `canopy`
   and `content` stay extractable.
7. **Content checks.** A banned-terms list is applied by the content audit; the list itself is
   private and never enters this repo. Nothing private goes in this repo: no secrets, keys, private
   URLs or local file paths.
8. **Motion ships with the component**, inside `@media (prefers-reduced-motion: no-preference)`, so
   reduced motion is the default. Durations and easings come from motion tokens.
9. **Responsive from 360px to 1600px**, container queries first, no horizontal scroll, 44px touch
   targets. Semantic HTML, keyboard reachable, visible focus, colour never the only signal.
10. **Storybook first.** Every component has stories beside it for each state, plus a reduced-motion
    story where it animates.

## Where things go

- A new component: `packages/ui/src/<tier>/<Name>/<Name>.tsx`, with `<Name>.stories.tsx` (and
  `<Name>.module.css` if needed) beside it, exported from that tier's `index.ts`. Update its row in
  `docs/components.md`.
- A page template: `apps/site/app/templates/<Name>Template.tsx` with its story beside it.
- A route: `apps/site/app/routes/`, registered in `apps/site/app/routes.ts`.
- A big decision: a short ADR in `docs/decisions/`.
