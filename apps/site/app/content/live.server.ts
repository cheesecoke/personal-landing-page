import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

import type { LiveContent } from '@cwc/content';
import { loadLiveContent } from '@cwc/content/node';

/**
 * Live data for route loaders. Node only (the `.server` name keeps it out of the browser bundle):
 * loaders run at pre-render, call `liveContent()` and return only their page's slice.
 *
 * It reads `CONTENT_LIVE_DIR`, else the seed data. A missing file or folder is not an error: the
 * page gets no live data and falls back to hand content. An invalid file throws and fails the
 * build.
 *
 * The pure helpers (`projectBySlug`, `freshCandidates`, `toFreshProp`, `statusKeyTone`) live in
 * `./live` so templates can use them in the browser; they are re-exported here for loaders.
 */
const cache = new Map<string, LiveContent>();

/**
 * The seed data folder inside `@cwc/content`. The package finds it relative to its own source
 * file, which no longer holds once the build has bundled that file into the server bundle, so it
 * is looked up here through the package's exports, from the folder the build runs in.
 */
export function seedLiveDir(): string {
  const require = createRequire(join(process.cwd(), 'package.json'));
  return join(dirname(require.resolve('@cwc/content/content.schema.json')), 'fixtures', 'seed');
}

/** The folder to read: `CONTENT_LIVE_DIR`, else the seed data. */
export const defaultLiveDir = (): string => process.env.CONTENT_LIVE_DIR || seedLiveDir();

/** Everything in the live folder, read and validated once per folder per build. */
export function liveContent(dir: string = defaultLiveDir()): LiveContent {
  const resolved = resolve(dir);
  let content = cache.get(resolved);
  if (!content) {
    content = loadLiveContent(resolved);
    cache.set(resolved, content);
  }
  return content;
}

export * from './live';
