# chasewcole.com

Source for [chasewcole.com](https://www.chasewcole.com): a pre-rendered static site built from a
small component library.

- **Stack:** Vite, React 19, React Router (framework mode, every route pre-rendered), Tailwind v4,
  Storybook, Vitest. pnpm workspace + Turborepo. Hosted on Vercel.
- **Layout:** `packages/tokens` (design tokens), `packages/ui` (components), `packages/canopy`
  (three.js tree), `packages/content` (content schemas), `apps/site` (routes and templates).

## Run

Requires Node 22 and pnpm 10.

```
pnpm install
pnpm dev               # the site, with hot reload (http://localhost:5173)
pnpm storybook         # the component library (http://localhost:6006)
```

Checks, the same ones CI runs on every pull request:

```
pnpm typecheck && pnpm lint && pnpm test
pnpm test:stories      # every story in headless Chromium (once: pnpm exec playwright install chromium)
```

## Build

```
pnpm build                    # pre-renders every route to apps/site/build/client
pnpm --filter site preview    # serves that folder (http://localhost:4173)
pnpm build:empty              # the same build with no live content, to apps/site/build/empty
```

The build is plain static files: one HTML file per route, `404.html`, `sitemap.xml` and
`robots.txt`. It fails if a page is missing, if content does not match its schema, or if an
author's note (`[CONFIRM: ...]`) would reach a page.

Content is in two places. Hand-written copy lives in `apps/site/content/hand`. Live data (status,
logs, releases) is read from the folder named by `CONTENT_LIVE_DIR`; without it the build uses the
seed data in `packages/content/fixtures/seed`.

## Deploy

Vercel builds this repo with the settings in [`vercel.json`](./vercel.json) (`pnpm build`, output
`apps/site/build/client`). There is no server: the output is served as static files.

- **`main` is production.** A push to `main` deploys to chasewcole.com.
- Every other branch and pull request gets a preview deployment.
- The rebuilt site lives on the `rebuild` branch. **Merging `rebuild` into `main` is what switches
  chasewcole.com over to it**; until then the domain keeps serving what is on `main`.

Contributor and agent rules are in [AGENTS.md](./AGENTS.md). Licence: [MIT](./LICENSE).
