import { describe, expect, it } from 'vitest';

import {
  FIRST_JITTER_S,
  FIRST_JUMP_S,
  flatness,
  GAP_JITTER_S,
  GAP_S,
  JUMP_S,
  nextJump,
  ringsAt,
  splashAt,
  SPOTS_TALL,
  SPOTS_WIDE,
  WATER,
} from './pondFish';

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length]!;
};

describe('the far fish jump', () => {
  it('first jumps no sooner than 45 s after the garden appears, then every 2 to 4 minutes', () => {
    for (const r of [0, 0.5, 0.999]) {
      const random = seq(r);
      const first = nextJump(null, random, false);
      expect(first.start).toBeGreaterThanOrEqual(FIRST_JUMP_S);
      expect(first.start).toBeLessThan(FIRST_JUMP_S + FIRST_JITTER_S);
      const second = nextJump(first, random, false);
      const gap = second.start - first.start - JUMP_S;
      expect(gap).toBeGreaterThanOrEqual(GAP_S - 1e-9);
      expect(gap).toBeLessThan(GAP_S + GAP_JITTER_S);
    }
  });

  it('happens far out on the open water, inside the canvas, wide or tall', () => {
    for (const tall of [false, true]) {
      const spots = tall ? SPOTS_TALL : SPOTS_WIDE;
      for (const r of [0, 0.3, 0.999]) {
        const j = nextJump(null, seq(r), tall);
        expect(j.x).toBeGreaterThanOrEqual(spots.x0);
        expect(j.x).toBeLessThanOrEqual(spots.x1);
        expect(j.y).toBeGreaterThanOrEqual(spots.y0);
        expect(j.y).toBeLessThanOrEqual(spots.y1);
        // The widest ring stays inside the canvas.
        const k = Math.max(4, j.y - 792) / 90;
        const widest = Math.max(
          ...Array.from({ length: 40 }, (_, i) => ringsAt(i / 10, k).map((x) => x.rx)).flat(),
        );
        expect(j.x - widest).toBeGreaterThan(WATER.x);
        expect(j.x + widest).toBeLessThan(WATER.x + WATER.width);
        expect(j.y + widest * flatness(j.y) + 2).toBeLessThan(WATER.y + WATER.height);
      }
    }
  });

  it('splashes for a fraction of a second, then leaves flat rings that fade out', () => {
    expect(splashAt(0.1, 1, 1)).not.toBeNull();
    expect(splashAt(0.7, 1, 1)).toBeNull();
    expect(ringsAt(0.05, 1)).toEqual([]);
    const mid = ringsAt(1.2, 1);
    expect(mid.length).toBeGreaterThanOrEqual(2);
    expect(ringsAt(JUMP_S - 0.01, 1).every((r) => r.alpha < 0.05)).toBe(true);
    // Far rings are flat: much wider than tall.
    expect(flatness(880)).toBeLessThan(0.2);
  });
});
