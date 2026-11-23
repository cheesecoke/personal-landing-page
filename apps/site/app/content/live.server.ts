import type { LiveContent } from '@cwc/content';
import { loadLiveContent, resolveLiveDir } from '@cwc/content/node';

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

/** Everything in the live folder, read and validated once per folder per build. */
export function liveContent(dir?: string): LiveContent {
  const resolved = resolveLiveDir(dir);
  let content = cache.get(resolved);
  if (!content) {
    content = loadLiveContent(resolved);
    cache.set(resolved, content);
  }
  return content;
}

export * from './live';
