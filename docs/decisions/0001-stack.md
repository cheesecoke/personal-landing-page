# 0001. Stack: Vite + React Router, pre-rendered

Status: accepted · 2026-11-22

## Decision

Vite + React 19 + React Router v7 in framework mode with `ssr: false` and every route pre-rendered
to static HTML. pnpm workspace + Turborepo. Tailwind v4 fed by generated design tokens (CSS Modules
where a component needs them). One Storybook (`@storybook/react-vite`) for every layer. zod for
content schemas. Hosted on Vercel as static output.

## Why

- **Storybook fidelity.** Storybook runs the same Vite config, CSS and React as the site, so every
  layer from primitives to page templates is a story.
- **Persistent header.** The root layout stays mounted across navigation, so the nav's line is a
  plain CSS width transition.
- **Static performance.** Each route is pre-rendered HTML that then hydrates. three.js is a lazy
  chunk on the two pages that use it.
- **Data fits static.** Route loaders run at pre-render and read committed JSON through zod. New
  data is a new commit, which is a new build. Nothing is fetched at runtime.
- **View Transitions** through React Router's `viewTransition`.

## Alternatives

|                       | Astro + islands                     | Next.js                    | Vite + React Router (chosen) |
| --------------------- | ----------------------------------- | -------------------------- | ---------------------------- |
| Storybook fidelity    | Partial (`.astro` can't be stories) | Good, needs `next/*` mocks | Best                         |
| Static performance    | Best                                | Heaviest                   | Good                         |
| Persistent nav layout | Needs glue                          | Native                     | Native                       |
| Data at build         | Content collections                 | ISR                        | Loaders + zod at pre-render  |

## Trade-offs

- More JavaScript than Astro. Budgets are enforced in CI.
- No built-in image optimisation; images are processed at build time.
- Switch to Next.js only if server routes are wanted later. The packages move unchanged because
  they never import from `apps/`.

## Consequences

- `packages/tokens`, `packages/ui`, `packages/canopy` and `packages/content` stay extractable.
- A route cannot exist without a pre-rendered HTML file (`apps/site/app/paths.ts` and the
  post-build check).
- The 404 page is the pre-rendered catch-all route, published as `404.html`.
