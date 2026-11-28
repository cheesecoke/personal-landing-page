import { describe, expect, it } from 'vitest';

import {
  BAND,
  birdsAt,
  FIRST_JITTER_S,
  FIRST_PASS_S,
  GAP_JITTER_S,
  GAP_S,
  nextPass,
  type Pass,
  PASS_JITTER_S,
  PASS_S,
  wingAngle,
} from './flockSky';

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length]!;
};

describe('the far flock', () => {
  it('first passes no sooner than 20 s after the garden appears, then once every 60 to 90 s', () => {
    for (const r of [0, 0.5, 0.999]) {
      const random = seq(r);
      const first = nextPass(null, random);
      expect(first.start).toBeGreaterThanOrEqual(FIRST_PASS_S);
      expect(first.start).toBeLessThan(FIRST_PASS_S + FIRST_JITTER_S);
      const second = nextPass(first, random);
      expect(second.start - first.start).toBeGreaterThanOrEqual(GAP_S);
      expect(second.start - first.start).toBeLessThan(GAP_S + GAP_JITTER_S);
      expect(second.duration).toBeGreaterThanOrEqual(PASS_S);
      expect(second.duration).toBeLessThan(PASS_S + PASS_JITTER_S);
      // A pass is always over well before the next one begins.
      expect(first.start + first.duration).toBeLessThan(second.start);
    }
  });

  it('can be asked to start at once (stories)', () => {
    expect(nextPass(null, seq(0.7), 0).start).toBe(0);
  });

  it('has no birds outside a pass, and fades them in and out from nothing', () => {
    const pass: Pass = { start: 10, duration: 20, dir: 1, lift: 0 };
    expect(birdsAt(pass, 9)).toEqual([]);
    expect(birdsAt(pass, 30.5)).toEqual([]);
    for (const b of birdsAt(pass, 10.2)) expect(b.alpha).toBeLessThan(0.05);
    expect(birdsAt(pass, 20).length).toBeGreaterThan(3);
    for (const b of birdsAt(pass, 20)) expect(b.alpha).toBe(1);
  });

  it('keeps every bird small and inside the sky band, both ways and at any lift', () => {
    for (const dir of [1, -1] as const) {
      for (const lift of [-20, 0, 20]) {
        const pass: Pass = { start: 0, duration: 20, dir, lift };
        for (let t = 0; t < 20; t += 0.25) {
          for (const b of birdsAt(pass, t)) {
            expect(b.span).toBeLessThanOrEqual(7);
            expect(b.x - b.span).toBeGreaterThan(BAND.x);
            expect(b.x + b.span).toBeLessThan(BAND.x + BAND.width);
            expect(b.y - b.span).toBeGreaterThan(BAND.y);
            expect(b.y + b.span).toBeLessThan(BAND.y + BAND.height);
          }
        }
      }
    }
  });

  it('beats its wings, with a glide in every cycle', () => {
    const angles = Array.from({ length: 150 }, (_, i) => wingAngle(i / 100, 1, 0, 0.45));
    expect(new Set(angles.map((a) => a.toFixed(2))).size).toBeGreaterThan(20);
    expect(angles.filter((a) => a === 0.4 * Math.PI).length).toBeGreaterThan(30);
  });
});
