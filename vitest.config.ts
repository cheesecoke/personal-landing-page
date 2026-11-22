import { defineConfig } from 'vitest/config';

// Two projects: `unit` runs *.test.ts in Node, `dom` runs *.test.tsx in jsdom.
// Story tests (Storybook Vitest addon) are a separate project added with the test rig.
const roots = ['packages/*/src', 'apps/site/app', 'tools'];

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: roots.map((root) => `${root}/**/*.test.ts`),
        },
      },
      {
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: roots.map((root) => `${root}/**/*.test.tsx`),
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
});
