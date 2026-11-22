import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

// ONE Storybook for the whole repo: every package's stories, the site's page templates, and the
// reference pages in .storybook/stories.
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    './stories/*.stories.tsx',
    '../packages/*/src/**/*.stories.tsx',
    '../apps/site/app/templates/**/*.stories.tsx',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [...(viteConfig.plugins ?? []), tailwindcss()],
  }),
};

export default config;
