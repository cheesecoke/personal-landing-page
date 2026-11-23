import type { Config } from '@react-router/dev/config';

import { prerenderPaths } from './app/paths';

// Static site: no server at runtime. Every route is pre-rendered to its own HTML file.
// `SITE_BUILD_DIR` sends the output somewhere else (the no-data check builds beside the real build).
export default {
  buildDirectory: process.env.SITE_BUILD_DIR || 'build',
  ssr: false,
  prerender: [...prerenderPaths],
} satisfies Config;
