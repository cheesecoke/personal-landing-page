import type { DiveState } from '../run';

/**
 * The renderer's own short memory: what happened recently, for flashes, the shake and the trail.
 * The core's state stays the only source of truth for the run; this only decorates it.
 */

export type RingOutcome = 'passed' | 'hit' | 'shielded';

export interface TrailSample {
  angle: number;
  /** `Fx.now` when sampled. */
  at: number;
}

export interface Fx {
  /** Renderer clock, ms. Advances only while frames are drawn. */
  now: number;
  /** When the last hit happened, or null. */
  hitAt: number | null;
  /** When the last ring was passed, or null. */
  passAt: number | null;
  /** How each resolved ring went, by ring id, so it can be coloured as it flies past. */
  outcomes: ReadonlyMap<number, RingOutcome>;
  /** Recent player angles, oldest first. */
  trail: readonly TrailSample[];
}

/** How long each effect lasts, ms. */
export const FX_MS = { hit: 360, flash: 260, pass: 420, trail: 200 } as const;

export function createFx(): Fx {
  return { now: 0, hitAt: null, passAt: null, outcomes: new Map(), trail: [] };
}

/** Advance the clock by `dtMs`, sample the trail, and take in the state's events. */
export function advanceFx(fx: Fx, state: DiveState, dtMs: number): Fx {
  const now = fx.now + Math.max(0, dtMs);
  let { hitAt, passAt, outcomes } = fx;
  if (state.events.length) {
    const next = new Map(outcomes);
    for (const e of state.events) {
      if (e.type === 'passed') {
        next.set(e.ringId, 'passed');
        passAt = now;
      } else if (e.type === 'hit') {
        next.set(e.ringId, 'hit');
        hitAt = now;
      } else if (e.type === 'shielded') {
        next.set(e.ringId, 'shielded');
      }
    }
    // Only rings near the player are ever looked up; forget the rest.
    for (const id of next.keys()) if (id < state.nextRing - 4) next.delete(id);
    outcomes = next;
  }
  const trail = state.status === 'running' ? [...fx.trail, { angle: state.angle, at: now }] : [];
  while (trail.length && now - trail[0]!.at > FX_MS.trail) trail.shift();
  return { now, hitAt, passAt, outcomes, trail };
}

/** 1 right after the event, easing to 0 over `ms`; 0 when it never happened or is over. */
export function decay(now: number, at: number | null, ms: number): number {
  if (at === null) return 0;
  const t = (now - at) / ms;
  if (t < 0 || t >= 1) return 0;
  return (1 - t) * (1 - t);
}

/** Screen shake after a hit, px. Deterministic from the clock; none at all when `quiet`. */
export function shakeOffset(fx: Fx, quiet: boolean, amplitude = 7): { x: number; y: number } {
  const k = quiet ? 0 : decay(fx.now, fx.hitAt, FX_MS.hit) * amplitude;
  if (k === 0) return { x: 0, y: 0 };
  return { x: Math.sin(fx.now * 0.093) * k, y: Math.cos(fx.now * 0.117) * k * 0.7 };
}
