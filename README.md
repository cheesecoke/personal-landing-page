# chasewcole.com

Source for [chasewcole.com](https://www.chasewcole.com): a pre-rendered static site built from a
small component library.

- **Stack:** Vite, React 19, React Router (framework mode, every route pre-rendered), Tailwind v4,
  Storybook, Vitest. pnpm workspace + Turborepo. Hosted on Vercel.
- **Layout:** `packages/tokens` (design tokens), `packages/ui` (components), `packages/canopy`
  (three.js tree), `packages/content` (content schemas), `apps/site` (routes and templates).

## Develop

Requires Node 22 and pnpm 10.

```
pnpm install
pnpm dev               # the site
pnpm storybook         # the component library
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Contributor and agent rules are in [AGENTS.md](./AGENTS.md). Licence: [MIT](./LICENSE).
