import { describe, expect, it } from 'vitest';

import { angleDelta } from '../angle';
import { createRun, type DiveState, startRun, step } from '../run';
import { buildResult } from './result';

function play(seed: number, steer: (s: DiveState) => number) {
  let s = startRun(createRun({ seed }));
  for (let i = 0; i < 20_000 && s.status === 'running'; i++) s = step(s, { steer: steer(s) }, 16);
  return s;
}
const toGap = (s: DiveState) => {
  const next = s.course[s.nextRing];
  return next ? Math.max(-1, Math.min(1, 3 * angleDelta(next.gapCentre, s.angle))) : 0;
};

describe('buildResult', () => {
  it('is null until the run is over', () => {
    const ready = createRun({ seed: 1 });
    expect(buildResult(ready)).toBeNull();
    expect(buildResult(step(startRun(ready), { steer: 0 }, 16))).toBeNull();
  });

  it('reports a clean dive when every ring is threaded', () => {
    const s = play(3, toGap);
    expect(buildResult(s)).toEqual({
      status: 'won',
      ringsPassed: s.course.length,
      ringsTotal: s.course.length,
      ringsHit: 0,
      livesLeft: 3,
      elapsedMs: Math.round(s.elapsedMs),
      clean: true,
    });
  });

  it('reports a crash with its rings and no lives left, never clean', () => {
    const s = play(3, () => 0);
    const r = buildResult(s)!;
    expect(r.status).toBe('crashed');
    expect(r.livesLeft).toBe(0);
    expect(r.ringsHit).toBe(3);
    expect(r.ringsTotal).toBe(s.course.length);
    expect(r.ringsPassed).toBe(s.ringsPassed);
    expect(r.clean).toBe(false);
  });

  it('a win with a hit is not clean', () => {
    let hit = false;
    const s = play(5, (st) => {
      if (st.ringsHit > 0) hit = true;
      return hit ? toGap(st) : -toGap(st);
    });
    const r = buildResult(s)!;
    expect(r.status).toBe('won');
    expect(r.ringsHit).toBeGreaterThan(0);
    expect(r.clean).toBe(false);
  });
});
