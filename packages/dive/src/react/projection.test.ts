import { describe, expect, it } from 'vitest';

import { TAU } from '../angle';
import {
  farFade,
  FOCAL_DEPTH,
  projectRadius,
  ringArc,
  screenAngle,
  viewportFor,
  wallPoint,
} from './projection';

describe('viewportFor', () => {
  it('fits the wall in the narrow side and keeps the player on screen', () => {
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
      [360, 280],
    ] as const) {
      const v = viewportFor(w, h);
      expect(v.cx).toBe(w / 2);
      expect(v.cx - v.wallRadius).toBeGreaterThan(0);
      expect(v.cy + v.wallRadius).toBeLessThan(h);
      expect(v.cy - v.wallRadius).toBeGreaterThanOrEqual(0);
    }
  });

  it('never returns a zero or negative size', () => {
    expect(viewportFor(0, -5).wallRadius).toBeGreaterThan(0);
  });
});

describe('projectRadius', () => {
  it('is the wall radius at the player, half of it one focal depth ahead', () => {
    expect(projectRadius(0, 200)).toBe(200);
    expect(projectRadius(FOCAL_DEPTH, 200)).toBeCloseTo(100);
  });

  it('shrinks with distance and grows as a ring comes closer', () => {
    const far = projectRadius(140, 200)!;
    const mid = projectRadius(40, 200)!;
    const near = projectRadius(5, 200)!;
    expect(far).toBeLessThan(mid);
    expect(mid).toBeLessThan(near);
    expect(far).toBeGreaterThan(0);
  });

  it('keeps growing behind the player, then stops drawing', () => {
    expect(projectRadius(-5, 200)!).toBeGreaterThan(200);
    expect(projectRadius(-FOCAL_DEPTH * 0.9, 200)).toBeNull();
  });
});

describe('farFade', () => {
  it('is 0 at the far edge of view and 1 well inside it', () => {
    expect(farFade(140, 140)).toBe(0);
    expect(farFade(60, 140)).toBe(1);
    expect(farFade(120, 140)).toBeGreaterThan(0);
    expect(farFade(120, 140)).toBeLessThan(1);
  });
});

describe('screenAngle', () => {
  it('puts the player at the bottom whatever its angle', () => {
    for (const a of [0, 1, 3, 5.9]) expect(screenAngle(a, a)).toBeCloseTo(Math.PI / 2);
  });

  it('draws a larger world angle to the left of the player (canvas y points down)', () => {
    const a = screenAngle(0.5, 0);
    expect(Math.cos(a)).toBeLessThan(0);
    expect(Math.cos(screenAngle(-0.5, 0))).toBeGreaterThan(0);
  });

  it('takes the short way across the 0 / 2π seam', () => {
    expect(screenAngle(0.1, TAU - 0.1)).toBeCloseTo(Math.PI / 2 + 0.2);
  });
});

describe('wallPoint', () => {
  it('puts distance 0 at the player angle straight below the vanishing point', () => {
    const v = viewportFor(400, 400);
    const p = wallPoint(v, 2, 2, 0)!;
    expect(p.x).toBeCloseTo(v.cx);
    expect(p.y).toBeCloseTo(v.cy + v.wallRadius);
  });
});

describe('ringArc', () => {
  it('leaves exactly the gap open, centred where the gap is drawn', () => {
    const { start, end } = ringArc(1, 0.8, 0.2);
    expect(end - start).toBeCloseTo(TAU - 0.8);
    const g = screenAngle(1, 0.2);
    expect(start).toBeCloseTo(g + 0.4);
    expect(end - TAU).toBeCloseTo(g - 0.4);
  });

  it('centres the gap on the player when the player sits in it', () => {
    const { start, end } = ringArc(3, 1, 3);
    expect((start + end - TAU) / 2).toBeCloseTo(Math.PI / 2);
  });
});
