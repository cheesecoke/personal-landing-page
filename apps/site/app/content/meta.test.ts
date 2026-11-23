import { describe, expect, it } from 'vitest';

import { pageMeta, pageUrl, strayPageMeta } from './meta';

describe('pageMeta', () => {
  it('gives a page its title, description, canonical address and preview tags', () => {
    const meta = pageMeta({ path: '/about', title: 'About', description: 'Who I am.' });
    expect(meta).toContainEqual({ title: 'About · Chase Cole' });
    expect(meta).toContainEqual({ name: 'description', content: 'Who I am.' });
    expect(meta).toContainEqual({
      tagName: 'link',
      rel: 'canonical',
      href: 'https://www.chasewcole.com/about',
    });
    expect(meta).toContainEqual({ property: 'og:title', content: 'About · Chase Cole' });
    expect(meta).toContainEqual({ property: 'og:description', content: 'Who I am.' });
    expect(meta).toContainEqual({
      property: 'og:url',
      content: 'https://www.chasewcole.com/about',
    });
  });

  it('titles Home with the site name alone and leaves out a missing description', () => {
    const meta = pageMeta({ path: '/' });
    expect(meta).toContainEqual({ title: 'Chase Cole' });
    expect(meta.some((tag) => 'name' in tag && tag.name === 'description')).toBe(false);
    expect(meta.some((tag) => 'property' in tag && tag.property === 'og:description')).toBe(false);
    expect(pageUrl('/')).toBe('https://www.chasewcole.com/');
  });
});

describe('strayPageMeta', () => {
  it('keeps the 404 page out of search', () => {
    expect(strayPageMeta('Page not found')).toEqual([
      { title: 'Page not found · Chase Cole' },
      { name: 'robots', content: 'noindex' },
    ]);
  });
});
