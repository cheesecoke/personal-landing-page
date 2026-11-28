import { describe, expect, it } from 'vitest';

import {
  backingSize,
  EASE_IN_S,
  easeIn,
  FLOCK_CROSSING_S,
  FLOCK_FIRST_S,
  FLOCK_FROM,
  FLOCK_PERIOD_S,
  FLOCK_TO,
  flockAt,
  MAX_BACKING_PIXELS,
  MAX_BIRDS,
  MAX_PIXEL_RATIO,
  wingAngle,
} from './gardenMath';

describe('backingSize', () => {
  it('never draws finer than the image has detail for', () => {
    // 1440-wide screen: the wide image (2048 texels) over a 1592 px box.
    const s = backingSize(1592, 900, 2, 2048);
    expect(s.scale).toBeCloseTo(2048 / 1592, 5);
    expect(s.width).toBe(2048);
  });

  it('follows the device up to the cap', () => {
    expect(backingSize(400, 300, 1, 4000).scale).toBe(1);
    expect(backingSize(400, 300, 3, 4000).scale).toBe(MAX_PIXEL_RATIO);
  });

  it('keeps under the pixel budget on big screens', () => {
    const s = backingSize(2600, 1470, 2, 4096);
    expect(s.width * s.height).toBeLessThanOrEqual(MAX_BACKING_PIXELS * 1.01);
  });

  it('a phone with the tall image: about 1.8 device px per CSS px', () => {
    const s = backingSize(746, 844, 3, 1344);
    expect(s.scale).toBeCloseTo(1344 / 746, 5);
    expect(s.width * s.height).toBeLessThan(MAX_BACKING_PIXELS);
  });

  it('survives an empty box', () => {
    expect(backingSize(0, 0, 2, 2048)).toEqual({ width: 1, height: 1, scale: 1 });
  });
});

describe('easeIn', () => {
  it('starts at exactly zero (the first frame is the still image) and settles at one', () => {
    expect(easeIn(0)).toBe(0);
    expect(easeIn(-1)).toBe(0);
    expect(easeIn(EASE_IN_S / 2)).toBeCloseTo(0.5, 5);
    expect(easeIn(EASE_IN_S)).toBe(1);
    expect(easeIn(100)).toBe(1);
  });

  it('is smooth at the start: almost nothing in the first tenth of a second', () => {
    expect(easeIn(0.1)).toBeLessThan(0.005);
  });
});

describe('wingAngle', () => {
  it('beats while flapping and holds the wings still while gliding', () => {
    const glide = 0.5;
    const flapping = [0, 0.1, 0.2, 0.3].map((t) => wingAngle(t, 1, 0, glide));
    expect(new Set(flapping.map((a) => a.toFixed(3))).size).toBe(4);
    // The second half of each 1.4 s cycle glides: the same angle throughout.
    expect(wingAngle(1.0, 1, 0, glide)).toBe(wingAngle(1.3, 1, 0, glide));
  });
});

describe('flockAt', () => {
  it('waits a few seconds before the first crossing', () => {
    expect(flockAt(0)).toEqual([]);
    expect(flockAt(FLOCK_FIRST_S - 0.1)).toEqual([]);
  });

  it('crosses from left to right, rising, and fades at both ends', () => {
    const start = flockAt(FLOCK_FIRST_S + 0.4);
    const middle = flockAt(FLOCK_FIRST_S + FLOCK_CROSSING_S / 2);
    expect(middle).toHaveLength(MAX_BIRDS);
    for (const b of middle) expect(b.alpha).toBe(1);
    // Early in the pass the leader is fading in and the birds behind are not on screen yet.
    expect(start.length).toBeLessThan(MAX_BIRDS);
    for (const b of start) expect(b.alpha).toBeLessThan(1);
    const leader = (t: number) => flockAt(t)[0]!;
    const a = leader(FLOCK_FIRST_S + 5);
    const b = leader(FLOCK_FIRST_S + 10);
    expect(b.x).toBeGreaterThan(a.x);
    expect(FLOCK_TO.y).toBeLessThan(FLOCK_FROM.y);
  });

  it('is sparse: nothing between crossings, then another pass', () => {
    expect(flockAt(FLOCK_FIRST_S + FLOCK_CROSSING_S + 1)).toEqual([]);
    expect(flockAt(FLOCK_FIRST_S + FLOCK_PERIOD_S - 1)).toEqual([]);
    expect(flockAt(FLOCK_FIRST_S + FLOCK_PERIOD_S + FLOCK_CROSSING_S / 2)).toHaveLength(MAX_BIRDS);
  });

  it('birds are small and far: under 10 render px across, uneven, never stacked', () => {
    const birds = flockAt(FLOCK_FIRST_S + FLOCK_CROSSING_S / 2);
    for (const b of birds) expect(b.span).toBeLessThan(10);
    const xs = birds.map((b) => b.x).sort((p, q) => p - q);
    const gaps = xs.slice(1).map((x, i) => x - xs[i]!);
    expect(Math.min(...gaps)).toBeGreaterThan(8);
    expect(new Set(gaps.map((g) => g.toFixed(1))).size).toBeGreaterThan(1);
  });
});
