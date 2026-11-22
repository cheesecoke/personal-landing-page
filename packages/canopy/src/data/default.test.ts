import { describe, expect, it } from 'vitest';

import { buildIndex } from '../core/tree';
import { defaultCanopyData } from './default';

/**
 * The site's pages (`apps/site/app/paths.ts`). Packages cannot import from the app, so the list is
 * repeated here: if a page moves, this test says which canopy link went stale.
 */
const sitePages = [
  '/',
  '/projects',
  '/projects/pas',
  '/projects/pas/atti',
  '/projects/pas/lifebox',
  '/projects/personal-brain',
  '/projects/ai-system',
  '/projects/duo-decide',
  '/projects/thread-quest',
  '/work/titan-intake',
  '/about',
  '/beyond',
  '/contact',
];

describe('defaultCanopyData', () => {
  it('links every node to a page of the site', () => {
    for (const n of defaultCanopyData.nodes) {
      expect(sitePages, `${n.id} -> ${n.href}`).toContain(n.href.split('#')[0]);
    }
  });

  it('gives a node with its own page that page, and the rest an anchor or a parent page', () => {
    for (const n of defaultCanopyData.nodes) {
      if (n.page) expect(n.href).not.toContain('#');
    }
  });

  it('has unique node and shoot ids, and start projects that exist', () => {
    const ids = defaultCanopyData.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    const shoots = defaultCanopyData.nodes.flatMap((n) => (n.shoots ?? []).map((s) => s.id));
    expect(new Set(shoots).size).toBe(shoots.length);
    for (const id of defaultCanopyData.start) expect(ids).toContain(id);
  });

  it('builds an index (no unknown parents, no loops)', () => {
    expect(buildIndex(defaultCanopyData).ids).toHaveLength(12);
  });

  it('holds no placeholder copy', () => {
    expect(JSON.stringify(defaultCanopyData)).not.toMatch(/\[CONFIRM|\[PLACEHOLDER/);
  });
});
