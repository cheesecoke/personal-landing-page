import { angleDelta, wrapAngle } from './angle';
import type { DiveConfig, DiveProfile } from './config';
import { createRng } from './rng';

/** One ring of the course. Rings never move; the player flies toward them. */
export interface Ring {
  /** Index along the course, from 0. Stable for the whole run. */
  id: number;
  /** Absolute depth of the ring. */
  depth: number;
  /** Angle of the gap's centre, in [0, 2π). */
  gapCentre: number;
  /** Full angular width of the gap, radians. */
  gapWidth: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Forward speed at a point of the run (progress 0..1): a smoothstep from `startSpeed` to
 * `topSpeed`. It never decreases, which the passability guarantee relies on.
 */
export function speedAt(profile: DiveProfile, progress: number): number {
  return lerp(profile.startSpeed, profile.topSpeed, smoothstep(clamp01(progress)));
}

/**
 * Lays out every ring of a run from its seed. Pure: same arguments, same course.
 *
 * Passability guarantee. Between ring i and ring i+1 the player has at least
 * `dt = spacing / speedAt(depth of ring i+1)` seconds, because speed never decreases.
 * With turn rate ω and steering ease τ, the worst start is turning the wrong way at full rate;
 * even then the angle covered toward the target after time t is at least ω·(t − 2τ).
 * Call `reach = reachSafety · ω · (dt − 2τ)`. A player anywhere inside ring i's gap must cover
 * at most `|shift| + halfᵢ − (halfᵢ₊₁ − edgeMargin)` to sit `edgeMargin` inside ring i+1's gap,
 * so the shift between gap centres is drawn within ±(reach − halfᵢ + halfᵢ₊₁ − edgeMargin)
 * (capped at π). If that budget would be negative, the spacing grows until it is not.
 * The first ring is measured from a virtual zero-width gap at the start angle.
 */
export function buildCourse(
  config: DiveConfig,
  profile: DiveProfile,
  seed: number,
): readonly Ring[] {
  const rng = createRng(seed);
  const omega = config.maxTurnRate;
  const tau = config.steerEaseMs / 1000;
  const lastDepth = profile.totalDepth - config.finishBuffer;
  const rings: Ring[] = [];

  let prevDepth = 0;
  let prevCentre = wrapAngle(config.startAngle);
  let prevHalf = 0;

  for (;;) {
    const first = rings.length === 0;
    const p = prevDepth / profile.totalDepth;
    let spacing = first
      ? config.leadInDepth
      : lerp(profile.spacingStart, profile.spacingEnd, p) *
        (1 + rng.range(-profile.spacingJitter, profile.spacingJitter));
    const width = Math.max(
      2 * config.edgeMargin + 0.1,
      lerp(profile.gapStart, profile.gapEnd, p) + rng.range(-profile.gapJitter, profile.gapJitter),
    );
    const half = width / 2;

    const shiftBudget = (gap: number) => {
      const dt = gap / speedAt(profile, (prevDepth + gap) / profile.totalDepth);
      const reach = config.reachSafety * omega * Math.max(0, dt - 2 * tau);
      return reach - prevHalf + half - config.edgeMargin;
    };
    while (shiftBudget(spacing) < 0) spacing *= 1.1;
    const budget = shiftBudget(spacing);

    const depth = prevDepth + spacing;
    if (depth > lastDepth) break;

    const shift = rng.range(-1, 1) * Math.min(budget, Math.PI);
    const gapCentre = wrapAngle(prevCentre + shift);
    rings.push({ id: rings.length, depth, gapCentre, gapWidth: width });

    prevDepth = depth;
    prevCentre = gapCentre;
    prevHalf = half;
  }

  return Object.freeze(rings.map((r) => Object.freeze(r)));
}

/** Exposed for tests and tooling: the worst-case reach rule above, for one pair of rings. */
export function ringPairIsPassable(
  config: DiveConfig,
  profile: DiveProfile,
  prev: Pick<Ring, 'depth' | 'gapCentre' | 'gapWidth'>,
  next: Ring,
): boolean {
  const dt = (next.depth - prev.depth) / speedAt(profile, next.depth / profile.totalDepth);
  const reach =
    config.reachSafety * config.maxTurnRate * Math.max(0, dt - (2 * config.steerEaseMs) / 1000);
  const shift = Math.abs(angleDelta(next.gapCentre, prev.gapCentre));
  const needed = shift + prev.gapWidth / 2 - (next.gapWidth / 2 - config.edgeMargin);
  return needed <= reach + 1e-9;
}
