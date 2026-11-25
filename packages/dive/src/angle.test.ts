import { describe, expect, it } from 'vitest';

import { angleDelta, inGap, TAU, wrapAngle } from './angle';

describe('angles', () => {
  it('wraps into [0, 2π)', () => {
    expect(wrapAngle(TAU)).toBe(0);
    expect(wrapAngle(-0.5)).toBeCloseTo(TAU - 0.5);
    expect(wrapAngle(3 * TAU + 1)).toBeCloseTo(1);
  });

  it('takes the short way across the 0 / 2π seam', () => {
    expect(angleDelta(0.1, TAU - 0.1)).toBeCloseTo(0.2);
    expect(angleDelta(TAU - 0.1, 0.1)).toBeCloseTo(-0.2);
    expect(angleDelta(Math.PI, 0)).toBeCloseTo(Math.PI);
  });

  it('counts a gap that straddles 0 from both sides', () => {
    expect(inGap(TAU - 0.05, 0.05, 0.3)).toBe(true);
    expect(inGap(0.15, TAU - 0.05, 0.5)).toBe(true);
    expect(inGap(0.4, TAU - 0.05, 0.5)).toBe(false);
  });
});
