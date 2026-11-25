import { describe, expect, it } from 'vitest';

import { angleDelta } from './angle';
import { createRng } from './rng';
import { createRun, startRun, step, type DiveState } from './run';

const SEEDS = 200;

/** A simple bot: steer toward the nearest ring's gap centre, proportionally, saturating at ±1. */
function towardNextGap(s: DiveState): number {
  const next = s.course[s.nextRing];
  if (!next) return 0;
  return Math.max(-1, Math.min(1, 3 * angleDelta(next.gapCentre, s.angle)));
}

function runToEnd(
  seed: number,
  calm: boolean,
  steer: (s: DiveState) => number,
  frames: () => number,
) {
  let s = startRun(createRun({ seed, calm }));
  for (let i = 0; i < 20_000 && s.status === 'running'; i++)
    s = step(s, { steer: steer(s) }, frames());
  return s;
}

describe.each([false, true])('calm: %s', (calm) => {
  it(`the steer-toward-the-gap bot finishes every run without a hit (${SEEDS} seeds)`, () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const s = runToEnd(seed, calm, towardNextGap, () => 1000 / 60);
      expect({ seed, status: s.status, hits: s.ringsHit }).toEqual({
        seed,
        status: 'won',
        hits: 0,
      });
      expect(s.lives).toBe(3);
      expect(s.ringsPassed).toBe(s.course.length);
      expect(s.finishMs! / 1000).toBeGreaterThan(44);
      expect(s.finishMs! / 1000).toBeLessThan(46);
    }
  });

  it('the bot also finishes clean with ragged frame times (8 to 50 ms)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const jitter = createRng(seed + 1000);
      const s = runToEnd(seed, calm, towardNextGap, () => jitter.range(8, 50));
      expect({ seed, status: s.status, hits: s.ringsHit }).toEqual({
        seed,
        status: 'won',
        hits: 0,
      });
    }
  });

  it(`a player who never steers crashes (${SEEDS} seeds)`, () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const s = runToEnd(
        seed,
        calm,
        () => 0,
        () => 1000 / 60,
      );
      expect({ seed, status: s.status }).toEqual({ seed, status: 'crashed' });
    }
  });
});
