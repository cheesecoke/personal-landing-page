import { join } from 'node:path';

import type { HandContent } from '@cwc/content/hand/load';
import { loadHandContent } from '@cwc/content/hand/load';

/**
 * Hand-written content for route loaders. Node only (the `.server` name keeps it out of the
 * browser bundle): loaders run at pre-render, call `handContent()` and return only their page's
 * slice, so each page's HTML carries just what it shows.
 *
 * The build runs from `apps/site`, so the hand folder is found from there. `CONTENT_HAND_DIR`
 * points it somewhere else.
 */
export const defaultHandDir = () =>
  process.env.CONTENT_HAND_DIR ?? join(process.cwd(), 'content', 'hand');

const cache = new Map<string, HandContent>();

/** Every hand file, read and validated once per folder per build. Throws on a bad file. */
export function handContent(dir: string = defaultHandDir()): HandContent {
  let content = cache.get(dir);
  if (!content) {
    content = loadHandContent(dir);
    cache.set(dir, content);
  }
  return content;
}
