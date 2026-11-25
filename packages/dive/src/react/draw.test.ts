import { describe, expect, it } from 'vitest';

import { angleDelta } from '../angle';
import { createRun, type DiveState, startRun, step } from '../run';
import { DIVE_COLOR_VARS, fallbackDiveColors, readDiveColors } from './colors';
import { type DiveCtx, drawFrame, threadAngleAt, visibleRings } from './draw';
import { advanceFx, createFx, decay, FX_MS, shakeOffset } from './fx';
import { viewportFor } from './projection';

interface Call {
  op: string;
  args: unknown[];
  style: { stroke: unknown; fill: unknown; alpha: number };
}

/** A context that records every call with the colour and alpha in force at the time. */
function fakeCtx() {
  const calls: Call[] = [];
  const ctx = {
    globalAlpha: 1,
    strokeStyle: '' as unknown,
    fillStyle: '' as unknown,
    lineWidth: 1,
    lineCap: 'butt',
    createRadialGradient: () => ({ addColorStop: () => {} }),
  } as Record<string, unknown>;
  for (const op of [
    'save',
    'restore',
    'setTransform',
    'translate',
    'fillRect',
    'beginPath',
    'moveTo',
    'lineTo',
    'arc',
    'stroke',
    'fill',
    'setLineDash',
  ]) {
    ctx[op] = (...args: unknown[]) =>
      calls.push({
        op,
        args,
        style: {
          stroke: ctx.strokeStyle,
          fill: ctx.fillStyle,
          alpha: ctx.globalAlpha as number,
        },
      });
  }
  return { ctx: ctx as unknown as DiveCtx, calls };
}

const toGap = (s: DiveState) => {
  const next = s.course[s.nextRing];
  return next ? Math.max(-1, Math.min(1, 3 * angleDelta(next.gapCentre, s.angle))) : 0;
};
function runFor(ms: number, steer: (s: DiveState) => number = toGap) {
  let s = startRun(createRun({ seed: 11 }));
  let fx = createFx();
  for (let t = 0; t < ms && s.status === 'running'; t += 16) {
    s = step(s, { steer: steer(s) }, 16);
    fx = advanceFx(fx, s, 16);
  }
  return { s, fx };
}

const colors = { ...fallbackDiveColors, signal: 'SIGNAL', bright: 'BRIGHT', warm: 'WARM' };
const view = viewportFor(800, 600);

describe('readDiveColors', () => {
  it('reads each role from its custom property, trimmed', () => {
    const c = readDiveColors((name) => (name === '--accent-signal' ? '  #123456 ' : `v(${name})`));
    expect(c.signal).toBe('#123456');
    expect(c.warm).toBe('v(--accent-warm)');
    expect(c.thread).toBe('v(--thread-line)');
  });

  it('falls back to the token palette when a property is missing', () => {
    const c = readDiveColors(() => '');
    for (const [role, [, fallback]] of Object.entries(DIVE_COLOR_VARS))
      expect(c[role as keyof typeof c]).toBe(fallback);
  });

  it('never reads the ember status colour', () => {
    expect(Object.values(DIVE_COLOR_VARS).map(([name]) => name)).not.toContain('--status-build');
  });
});

describe('fx', () => {
  it('remembers passes and hits, and lets them fade', () => {
    const { s, fx } = runFor(8000, () => 0);
    expect(s.ringsHit).toBeGreaterThan(0);
    expect([...fx.outcomes.values()]).toContain('hit');
    expect(decay(fx.hitAt! + FX_MS.hit, fx.hitAt, FX_MS.hit)).toBe(0);
    expect(decay(fx.hitAt!, fx.hitAt, FX_MS.hit)).toBe(1);
  });

  it('keeps a short trail while running and drops it when the run ends', () => {
    const { s, fx } = runFor(1000);
    expect(fx.trail.length).toBeGreaterThan(5);
    expect(fx.now - fx.trail[0]!.at).toBeLessThanOrEqual(FX_MS.trail);
    const over = advanceFx(fx, { ...s, status: 'crashed', events: [] }, 16);
    expect(over.trail).toHaveLength(0);
  });

  it('shakes after a hit, never when quiet', () => {
    const fx = { ...createFx(), now: 1050, hitAt: 1000 };
    const loud = shakeOffset(fx, false);
    expect(Math.hypot(loud.x, loud.y)).toBeGreaterThan(0);
    expect(shakeOffset(fx, true)).toEqual({ x: 0, y: 0 });
    expect(shakeOffset({ ...fx, now: 5000 }, false)).toEqual({ x: 0, y: 0 });
  });
});

describe('visibleRings and the thread', () => {
  it('lists rings farthest first, including the few just passed', () => {
    const { s } = runFor(6000);
    const rings = visibleRings(s);
    const distances = rings.map((r) => r.distance);
    expect([...distances].sort((a, b) => b - a)).toEqual(distances);
    expect(distances.some((d) => d < 0)).toBe(true);
    expect(Math.max(...distances)).toBeLessThanOrEqual(s.config.viewDepth);
  });

  it('starts at the player and runs through the next gap', () => {
    const { s } = runFor(3000);
    expect(threadAngleAt(s, 0)).toBeCloseTo(s.angle);
    const next = s.upcoming[0]!;
    expect(angleDelta(threadAngleAt(s, next.distance), next.gapCentre)).toBeCloseTo(0);
  });
});

describe('drawFrame', () => {
  it('draws every upcoming ring as an arc with its gap open, and the player in the signal colour', () => {
    const { s, fx } = runFor(5000);
    const { ctx, calls } = fakeCtx();
    drawFrame(ctx, view, s, fx, colors, { quiet: false });
    const arcs = calls.filter((c) => c.op === 'arc');
    for (const r of s.upcoming) {
      const gap = r.gapWidth;
      const ringArcs = arcs.filter(
        (c) => Math.abs((c.args[3] as number) - (c.args[4] as number) + (2 * Math.PI - gap)) < 1e-6,
      );
      expect(ringArcs.length).toBeGreaterThan(0);
    }
    const player = arcs.find(
      (c) => c.args[0] === view.cx && c.args[1] === view.cy + view.wallRadius && c.args[2] === 4,
    );
    expect(player?.style.fill).toBe('SIGNAL');
    expect(calls.at(-1)?.op).toBe('restore');
  });

  it('flashes after a hit and dims the player while invulnerable', () => {
    const { s, fx } = runFor(8000, () => 0);
    const hitState = { ...s, status: 'running' as const, invulnerableMs: 500 };
    const { ctx, calls } = fakeCtx();
    drawFrame(ctx, view, hitState, { ...fx, now: fx.hitAt! + 20 }, colors, { quiet: false });
    const flash = calls.filter((c) => c.op === 'fillRect' && c.style.fill === 'BRIGHT');
    expect(flash).toHaveLength(1);
    const core = calls.find((c) => c.op === 'arc' && c.args[2] === 4)!;
    expect(core.style.alpha).toBeLessThan(1);
  });

  it('draws no streaks and no shake when quiet', () => {
    const { s, fx } = runFor(5000);
    const loud = fakeCtx();
    const quiet = fakeCtx();
    const hitFx = { ...fx, hitAt: fx.now - 20 };
    drawFrame(loud.ctx, view, s, hitFx, colors, { quiet: false });
    drawFrame(quiet.ctx, view, s, hitFx, colors, { quiet: true });
    const lines = (cs: Call[]) => cs.filter((c) => c.op === 'lineTo').length;
    expect(lines(quiet.calls)).toBeLessThan(lines(loud.calls));
    const shake = (cs: Call[]) => cs.find((c) => c.op === 'translate')!.args;
    expect(shake(quiet.calls)).toEqual([0, 0]);
    expect(shake(loud.calls)).not.toEqual([0, 0]);
  });

  it('marks gap edges in the warm accent', () => {
    const { s, fx } = runFor(4000);
    const { ctx, calls } = fakeCtx();
    drawFrame(ctx, view, s, fx, colors, { quiet: true });
    expect(calls.some((c) => c.op === 'stroke' && c.style.stroke === 'WARM')).toBe(true);
  });
});
