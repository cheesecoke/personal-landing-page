import { describe, expect, it } from 'vitest';

import { createRng } from './rng';

describe('createRng', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  it('gives different sequences for different seeds', () => {
    const a = Array.from({ length: 5 }, createRng(1).next);
    const b = Array.from({ length: 5 }, createRng(2).next);
    expect(a).not.toEqual(b);
  });

  it('stays in [0, 1) and range stays in [min, max)', () => {
    const r = createRng(7);
    for (let i = 0; i < 10_000; i++) {
      const x = r.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      const y = r.range(-2, 3);
      expect(y).toBeGreaterThanOrEqual(-2);
      expect(y).toBeLessThan(3);
    }
  });
});
