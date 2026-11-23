import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Two projects: `unit` runs *.test.ts in Node, `dom` runs *.test.tsx in jsdom.
// `stories` renders every Storybook story in headless Chromium and runs its play function and axe
// (`pnpm test:stories`; needs `pnpm exec playwright install chromium` once).
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
      {
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'stories',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
