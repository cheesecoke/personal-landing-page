import { describe, expect, it } from 'vitest';

import { navItems, pagePaths, prerenderPaths } from './paths';
import routes from './routes';

const routePaths = routes.map((entry) => (entry.index ? '/' : `/${entry.path}`));

describe('route table', () => {
  it('has one route per page path, plus the catch-all', () => {
    expect(routePaths.filter((path) => path !== '/*').sort()).toEqual([...pagePaths].sort());
    expect(routePaths).toContain('/*');
  });

  it('pre-renders every page and the 404', () => {
    expect(prerenderPaths).toEqual([...pagePaths, '/404']);
  });

  it('only links the nav to real pages', () => {
    for (const item of navItems) expect(pagePaths).toContain(item.to);
  });
});
