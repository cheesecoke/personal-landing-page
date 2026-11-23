import { describe, expect, it } from 'vitest';

import { pagePaths } from '../paths';
import { currentNavHref, formatLastUpdate, navLinks, shellLinks } from './site';

describe('currentNavHref', () => {
  it('maps every page to its nav item', () => {
    const expected: Record<(typeof pagePaths)[number], string> = {
      '/': '/',
      '/projects': '/projects',
      '/projects/pas': '/projects',
      '/projects/pas/atti': '/projects',
      '/projects/pas/lifebox': '/projects',
      '/projects/personal-brain': '/projects',
      '/projects/ai-system': '/projects',
      '/projects/duo-decide': '/projects',
      '/projects/thread-quest': '/projects',
      '/work/titan-intake': '/projects',
      '/about': '/about',
      '/beyond': '/beyond',
      '/contact': '/contact',
    };
    for (const path of pagePaths) expect(currentNavHref(path)).toBe(expected[path]);
  });

  it('ignores a trailing slash (static hosts add one)', () => {
    expect(currentNavHref('/about/')).toBe('/about');
    expect(currentNavHref('/projects/duo-decide/')).toBe('/projects');
  });

  it('has no item for an unknown page', () => {
    expect(currentNavHref('/404')).toBeUndefined();
    expect(currentNavHref('/aboutish')).toBeUndefined();
  });
});

describe('shellLinks', () => {
  it('sets only Beyond quiet', () => {
    expect(shellLinks.filter((link) => link.quiet).map((link) => link.href)).toEqual(['/beyond']);
  });
});

describe('formatLastUpdate', () => {
  it('formats a date or a datetime the way the boards write dates', () => {
    expect(formatLastUpdate('2026-11-20')).toEqual({ date: '20 Nov 2026', dateTime: '2026-11-20' });
    expect(formatLastUpdate('2026-06-03T23:30:00Z')).toEqual({
      date: '3 Jun 2026',
      dateTime: '2026-06-03',
    });
  });
});

describe('navLinks', () => {
  it('adds the release ring after Projects only while a release is new', () => {
    expect(navLinks(false)).toBe(shellLinks);
    const ringed = navLinks(true).filter((link) => 'ring' in link);
    expect(ringed.map((link) => link.href)).toEqual(['/projects']);
  });
});
