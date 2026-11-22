import type { Config } from '@react-router/dev/config';

import { prerenderPaths } from './app/paths';

// Static site: no server at runtime. Every route is pre-rendered to its own HTML file.
export default {
  ssr: false,
  prerender: [...prerenderPaths],
} satisfies Config;
