import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultHandDir, handContent } from './hand.server';

const dir = join(import.meta.dirname, '..', '..', 'content', 'hand');

afterEach(() => vi.unstubAllEnvs());

describe('handContent', () => {
  it('loads the hand folder', () => {
    const content = handContent(dir);
    expect(content.site.footer.name).toBeTruthy();
    expect(content.about.rings.chapters.length).toBeGreaterThan(0);
  });

  it('reads a folder once', () => {
    expect(handContent(dir)).toBe(handContent(dir));
  });

  it('fails on a folder with no content', () => {
    expect(() => handContent(join(dir, 'nowhere'))).toThrow(/site\.json|home\.json/);
  });
});

describe('defaultHandDir', () => {
  it('is content/hand under the folder the build runs from', () => {
    expect(defaultHandDir()).toBe(join(process.cwd(), 'content', 'hand'));
  });

  it('can be pointed elsewhere', () => {
    vi.stubEnv('CONTENT_HAND_DIR', '/somewhere/else');
    expect(defaultHandDir()).toBe('/somewhere/else');
  });
});
