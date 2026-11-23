import { describe, expect, it } from 'vitest';

import { ringGeometry } from './ringGeometry';

describe('ringGeometry', () => {
  it('matches the board for Duo Decide (six quarters)', () => {
    const geometry = ringGeometry([2, 3, 4, 2, 1, 3]);
    expect(geometry.outer).toBe(118);
    expect(geometry.rings).toHaveLength(6);
    // Unscaled radii 24, 35.5, 50, 63, 72, 82.5 and an outline at 94.
    expect(geometry.rings[0]).toEqual({ r: 30.1, width: 5 });
    expect(geometry.rings[5]).toEqual({ r: 103.6, width: 8.8 });
    expect(geometry.core).toBe(7.5);
  });

  it('keeps a thin ring visible and handles one ring', () => {
    const geometry = ringGeometry([1]);
    expect(geometry.rings[0]!.width).toBeGreaterThanOrEqual(1.2);
    expect(geometry.rings[0]!.r).toBeLessThan(geometry.outer);
  });

  it('handles no rings', () => {
    expect(ringGeometry([]).rings).toEqual([]);
  });
});
