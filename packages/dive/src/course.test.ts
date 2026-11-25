import { describe, expect, it } from 'vitest';

import { DIVE_CONFIG } from './config';
import { buildCourse, ringPairIsPassable, speedAt } from './course';

const modes = ['normal', 'calm'] as const;

describe('buildCourse', () => {
  it('is deterministic per seed and differs across seeds', () => {
    const p = DIVE_CONFIG.normal;
    expect(buildCourse(DIVE_CONFIG, p, 9)).toEqual(buildCourse(DIVE_CONFIG, p, 9));
    expect(buildCourse(DIVE_CONFIG, p, 9)).not.toEqual(buildCourse(DIVE_CONFIG, p, 10));
  });

  it.each(modes)('every ring is reachable from the one before (%s, 500 seeds)', (mode) => {
    const profile = DIVE_CONFIG[mode];
    for (let seed = 0; seed < 500; seed++) {
      const rings = buildCourse(DIVE_CONFIG, profile, seed);
      let prev = { depth: 0, gapCentre: DIVE_CONFIG.startAngle, gapWidth: 0 };
      for (const ring of rings) {
        expect(ringPairIsPassable(DIVE_CONFIG, profile, prev, ring)).toBe(true);
        prev = ring;
      }
    }
  });

  it.each(modes)('gaps narrow and spacing tightens across the run (%s)', (mode) => {
    const profile = DIVE_CONFIG[mode];
    const rings = buildCourse(DIVE_CONFIG, profile, 3);
    const third = Math.floor(rings.length / 3);
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const early = rings.slice(1, third);
    const late = rings.slice(-third);
    expect(avg(late.map((r) => r.gapWidth))).toBeLessThan(avg(early.map((r) => r.gapWidth)));
    const gaps = (rs: typeof rings) => rs.slice(1).map((r, i) => r.depth - rs[i]!.depth);
    expect(avg(gaps(late))).toBeLessThan(avg(gaps(early)));
  });

  it('keeps rings off the lead-in and the finish run-out', () => {
    const profile = DIVE_CONFIG.normal;
    const rings = buildCourse(DIVE_CONFIG, profile, 1);
    expect(rings[0]!.depth).toBeGreaterThanOrEqual(DIVE_CONFIG.leadInDepth);
    expect(rings.at(-1)!.depth).toBeLessThanOrEqual(profile.totalDepth - DIVE_CONFIG.finishBuffer);
  });
});

describe('speedAt', () => {
  it('never decreases from start to top speed', () => {
    const p = DIVE_CONFIG.normal;
    let last = 0;
    for (let i = 0; i <= 100; i++) {
      const s = speedAt(p, i / 100);
      expect(s).toBeGreaterThanOrEqual(last);
      last = s;
    }
    expect(speedAt(p, 0)).toBe(p.startSpeed);
    expect(speedAt(p, 1)).toBe(p.topSpeed);
  });
});
