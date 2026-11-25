import { describe, expect, it } from 'vitest';

import { TAU } from './angle';
import { DIVE_CONFIG } from './config';
import type { Ring } from './course';
import { createRun, startRun, step, type DiveEvent, type DiveState } from './run';

const FRAME = 1000 / 60;

/** Runs until the run ends (or `maxMs`), collecting every event. */
function play(state: DiveState, steer: (s: DiveState) => number, maxMs = 120_000) {
  const events: DiveEvent[] = [];
  let s = state;
  for (let t = 0; t < maxMs && s.status === 'running'; t += FRAME) {
    s = step(s, { steer: steer(s) }, FRAME);
    events.push(...s.events);
  }
  return { final: s, events };
}

/** A running state on a hand-made course; the player sits at angle 0 and rings block it. */
function onCourse(depths: number[]): DiveState {
  const course: Ring[] = depths.map((depth, id) => ({
    id,
    depth,
    gapCentre: Math.PI,
    gapWidth: 0.5,
  }));
  return startRun({ ...createRun({ seed: 1 }), course, upcoming: [] });
}

describe('createRun / startRun', () => {
  it('starts ready with full lives and nothing moving', () => {
    const s = createRun({ seed: 5 });
    expect(s.status).toBe('ready');
    expect(s.lives).toBe(3);
    expect(s.depth).toBe(0);
    expect(s.upcoming.length).toBeGreaterThan(0);
    expect(step(s, { steer: 1 }, FRAME)).toBe(s);
  });

  it('startRun moves to running and reports it', () => {
    const s = startRun(createRun({ seed: 5 }));
    expect(s.status).toBe('running');
    expect(s.events).toEqual([{ type: 'started' }]);
  });
});

describe('step', () => {
  it('does not mutate the state it is given', () => {
    const s = startRun(createRun({ seed: 2 }));
    const before = JSON.stringify(s);
    step(s, { steer: 1 }, FRAME);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('same seed and inputs give an identical run; different seeds differ', () => {
    const wiggle = (s: DiveState) => Math.sin(s.elapsedMs / 400);
    const a = play(startRun(createRun({ seed: 11 })), wiggle);
    const b = play(startRun(createRun({ seed: 11 })), wiggle);
    const c = play(startRun(createRun({ seed: 12 })), wiggle);
    expect(a.final).toEqual(b.final);
    expect(a.events).toEqual(b.events);
    expect(c.final.course).not.toEqual(a.final.course);
  });

  it('eases steering instead of snapping to full turn rate', () => {
    const s = step(startRun(createRun({ seed: 1 })), { steer: 1 }, FRAME);
    expect(s.angularVelocity).toBeGreaterThan(0);
    expect(s.angularVelocity).toBeLessThan(DIVE_CONFIG.maxTurnRate * 0.25);
    const later = play(s, () => 1, 600).final;
    expect(later.angularVelocity).toBeGreaterThan(DIVE_CONFIG.maxTurnRate * 0.95);
  });

  it('clamps a huge frame time to maxStepMs', () => {
    const s = startRun(createRun({ seed: 1 }));
    const big = step(s, { steer: 0 }, 10_000);
    const capped = step(s, { steer: 0 }, DIVE_CONFIG.maxStepMs);
    expect(big.elapsedMs).toBeCloseTo(DIVE_CONFIG.maxStepMs, 9);
    expect(big.depth).toBeCloseTo(capped.depth, 10);
    expect(step(s, { steer: 0 }, Number.NaN).elapsedMs).toBe(0);
    expect(step(s, { steer: 0 }, -50).elapsedMs).toBe(0);
  });

  it('counts the gap across the 0 / 2π seam', () => {
    const base = onCourse([5]);
    const ring: Ring = { id: 0, depth: 5, gapCentre: 0.05, gapWidth: 0.3 };
    const s = { ...base, course: [ring], angle: TAU - 0.05 };
    const { events } = play(s, () => 0, 1000);
    expect(events).toContainEqual({ type: 'passed', ringId: 0 });
  });
});

describe('lives and invulnerability', () => {
  it('three hits end the run', () => {
    const { final, events } = play(onCourse([30, 60, 90, 120]), () => 0);
    expect(events.filter((e) => e.type === 'hit')).toHaveLength(3);
    expect(events.at(-1)).toEqual({ type: 'crashed' });
    expect(final.status).toBe('crashed');
    expect(final.lives).toBe(0);
    expect(final.nextRing).toBe(3);
    expect(step(final, { steer: 1 }, FRAME).elapsedMs).toBe(final.elapsedMs);
  });

  it('shields rings inside the window and not after it', () => {
    // At ~20 units/s: ring 1 is ~0.25 s after the hit, ring 2 ~1.25 s after.
    const { final, events } = play(onCourse([30, 35, 55]), () => 0, 4000);
    const kinds = events.filter((e) => e.type !== 'started').map((e) => e.type);
    expect(kinds).toEqual(['hit', 'shielded', 'hit']);
    expect(final.lives).toBe(1);
  });

  it('reports invulnerability counting down after a hit', () => {
    const hitState = play(onCourse([30]), () => 0, 3000);
    expect(hitState.final.invulnerableMs).toBe(0);
    let s = onCourse([30]);
    while (s.events.every((e) => e.type !== 'hit')) s = step(s, { steer: 0 }, FRAME);
    expect(s.invulnerableMs).toBeGreaterThan(DIVE_CONFIG.invulnerableMs - FRAME);
  });
});

describe('the far side', () => {
  it.each([false, true])('a clean run wins at totalDepth in about 45 s (calm: %s)', (calm) => {
    const s = startRun(createRun({ seed: 3, calm }));
    const { final, events } = play({ ...s, course: [] }, () => 0);
    expect(final.status).toBe('won');
    expect(final.depth).toBe(final.totalDepth);
    expect(final.progress).toBe(1);
    expect(final.finishMs).not.toBeNull();
    expect(final.finishMs! / 1000).toBeGreaterThan(44);
    expect(final.finishMs! / 1000).toBeLessThan(46);
    expect(events.at(-1)).toEqual({ type: 'won', elapsedMs: final.finishMs });
  });

  it('calm mode is slower at the top and has wider gaps', () => {
    const normal = createRun({ seed: 4 });
    const calm = createRun({ seed: 4, calm: true });
    expect(calm.profile.topSpeed).toBeLessThan(normal.profile.topSpeed);
    const minGap = (s: DiveState) => Math.min(...s.course.map((r) => r.gapWidth));
    expect(minGap(calm)).toBeGreaterThan(minGap(normal));
  });
});
