import { angleDelta, TAU } from '../angle';
import type { Ring } from '../course';
import type { DiveState } from '../run';
import type { DiveColors } from './colors';
import { decay, type Fx, FX_MS, shakeOffset } from './fx';
import {
  FOCAL_DEPTH,
  farFade,
  projectRadius,
  ringArc,
  screenAngle,
  type Viewport,
  wallPoint,
} from './projection';

/** The parts of a 2D context the dive draws with (a recording fake satisfies it in tests). */
export type DiveCtx = Pick<
  CanvasRenderingContext2D,
  | 'save'
  | 'restore'
  | 'setTransform'
  | 'translate'
  | 'fillRect'
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'arc'
  | 'stroke'
  | 'fill'
  | 'setLineDash'
  | 'createRadialGradient'
  | 'globalAlpha'
  | 'strokeStyle'
  | 'fillStyle'
  | 'lineWidth'
  | 'lineCap'
>;

export interface DrawOptions {
  /** Reduced motion: no shake, no rushing streaks, a softer flash. */
  quiet: boolean;
}

/** Depth between the faint dashed guide rings that sell the speed. */
export const GUIDE_SPACING = 12;
/** How far out the oldest trail point drifts, as a share of the wall radius. */
const TRAIL_DRIFT = 0.1;
/** Passed rings keep drawing until they are this far behind. */
const BEHIND = FOCAL_DEPTH * 0.7;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** A fixed pseudo-random number in [0, 1) for an integer, so streaks stay put in the world. */
export function hash01(n: number): number {
  let t = (n | 0) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Rings to draw, farthest first: the last few already passed, then everything in view ahead. */
export function visibleRings(state: DiveState): { ring: Ring; distance: number }[] {
  const out: { ring: Ring; distance: number }[] = [];
  const { course, depth, config } = state;
  for (let i = Math.max(0, state.nextRing - 3); i < course.length; i++) {
    const ring = course[i]!;
    const distance = ring.depth - depth;
    if (distance > config.viewDepth) break;
    if (distance > -BEHIND) out.push({ ring, distance });
  }
  return out.reverse();
}

/**
 * Angle of the thread at a distance ahead: it leaves the player and runs through the middle of
 * each coming gap, so it reads as the line to follow down into the vanishing point.
 */
export function threadAngleAt(state: DiveState, distance: number): number {
  let fromD = 0;
  let fromA = state.angle;
  for (const r of state.upcoming) {
    if (distance <= r.distance) {
      const t = r.distance > fromD ? (distance - fromD) / (r.distance - fromD) : 1;
      return fromA + angleDelta(r.gapCentre, fromA) * t;
    }
    fromD = r.distance;
    fromA = r.gapCentre;
  }
  return fromA;
}

function circle(ctx: DiveCtx, view: Viewport, r: number) {
  ctx.beginPath();
  ctx.arc(view.cx, view.cy, r, 0, TAU);
  ctx.stroke();
}

function drawBackdrop(ctx: DiveCtx, view: Viewport, state: DiveState, c: DiveColors) {
  ctx.fillStyle = c.ground;
  ctx.globalAlpha = 1;
  ctx.fillRect(-40, -40, view.width + 80, view.height + 80);

  // The far side: a faint light at the vanishing point that grows as the run nears its end.
  const glowR = view.wallRadius * (0.18 + 0.32 * state.progress);
  const glow = ctx.createRadialGradient(view.cx, view.cy, 0, view.cx, view.cy, glowR);
  glow.addColorStop(0, c.signal);
  glow.addColorStop(1, c.ground);
  ctx.globalAlpha = 0.05 + 0.16 * state.progress * state.progress;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(view.cx, view.cy, glowR, 0, TAU);
  ctx.fill();

  // The wall the player rides.
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = c.hairline;
  ctx.lineWidth = 1;
  circle(ctx, view, view.wallRadius);
}

function drawGuides(ctx: DiveCtx, view: Viewport, state: DiveState, c: DiveColors, quiet: boolean) {
  const viewDepth = state.config.viewDepth;
  const spacing = quiet ? GUIDE_SPACING * 2 : GUIDE_SPACING;
  const first = Math.ceil((state.depth - BEHIND) / spacing);
  const last = Math.floor((state.depth + viewDepth) / spacing);
  ctx.strokeStyle = c.tick;
  ctx.lineWidth = 1;
  ctx.setLineDash([1.5, 9]);
  for (let k = first; k <= last; k++) {
    const d = k * spacing - state.depth;
    const r = projectRadius(d, view.wallRadius);
    if (r === null) continue;
    const behind = d < 0 ? clamp01(1 + d / BEHIND) : 1;
    ctx.globalAlpha = 0.55 * farFade(d, viewDepth, 0.5) * behind;
    circle(ctx, view, r);
  }
  ctx.setLineDash([]);
  if (quiet) return;

  // Streaks: short lines along the wall, fixed in the world, rushing out past the player.
  ctx.strokeStyle = c.ring;
  ctx.lineCap = 'round';
  for (let k = first; k <= last; k++) {
    const d = k * spacing - state.depth;
    for (let j = 0; j < 3; j++) {
      const seed = k * 3 + j;
      const angle = hash01(seed) * TAU;
      const len = 2 + hash01(seed + 7919) * 4;
      const a = wallPoint(view, angle, state.angle, d + len);
      const b = wallPoint(view, angle, state.angle, d);
      if (!a || !b) continue;
      const near = clamp01(1 - d / (viewDepth * 0.6));
      ctx.globalAlpha = 0.22 * near * near * (d < 0 ? clamp01(1 + d / BEHIND) : 1);
      ctx.lineWidth = 0.6 + near;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
}

function drawThread(ctx: DiveCtx, view: Viewport, state: DiveState, c: DiveColors) {
  const viewDepth = state.config.viewDepth;
  const step = 1.5;
  ctx.strokeStyle = c.thread;
  ctx.lineCap = 'round';
  let prev = wallPoint(view, threadAngleAt(state, 0), state.angle, 0);
  for (let d = step; d <= viewDepth && prev; d += step) {
    const p = wallPoint(view, threadAngleAt(state, d), state.angle, d);
    if (!p) break;
    const near = 1 - d / viewDepth;
    ctx.globalAlpha = 0.85 * near * farFade(d, viewDepth, 0.4);
    ctx.lineWidth = 0.75 + 1.5 * near * near;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    prev = p;
  }
}

function drawRings(ctx: DiveCtx, view: Viewport, state: DiveState, fx: Fx, c: DiveColors) {
  const viewDepth = state.config.viewDepth;
  const nextId = state.course[state.nextRing]?.id;
  ctx.lineCap = 'butt';
  for (const { ring, distance } of visibleRings(state)) {
    const r = projectRadius(distance, view.wallRadius);
    if (r === null) continue;
    const scale = r / view.wallRadius;
    const near = clamp01(1 - distance / viewDepth);
    const outcome = fx.outcomes.get(ring.id);
    const isNext = ring.id === nextId;
    const behind = distance < 0 ? clamp01(1 + distance / BEHIND) : 1;
    const fade = farFade(distance, viewDepth) * behind;

    let colour = c.ring;
    let alpha = fade * (0.16 + 0.6 * near * near);
    if (isNext) {
      colour = c.bright;
      alpha = fade * (0.55 + 0.45 * near);
    } else if (outcome === 'passed') {
      colour = c.signal;
      alpha = behind * 0.9;
    } else if (outcome === 'hit') {
      colour = c.bright;
      alpha = behind;
    } else if (outcome === 'shielded') {
      alpha = behind * 0.4;
    }
    const width = Math.min(7, Math.max(0.6, 2.2 * scale)) + (isNext ? 0.75 : 0);

    const { start, end } = ringArc(ring.gapCentre, ring.gapWidth, state.angle);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(view.cx, view.cy, r, start, end);
    ctx.stroke();

    if (distance <= 0) continue;
    ctx.strokeStyle = c.warm;

    // The next ring's opening: a faint dotted arc across the gap, so the way through reads.
    if (isNext) {
      ctx.globalAlpha = fade * 0.45;
      ctx.lineWidth = 1;
      ctx.setLineDash([1, 5]);
      ctx.beginPath();
      ctx.arc(view.cx, view.cy, r, end - TAU, start);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // The gap's edges, in the warm accent: short ticks across the ring.
    {
      ctx.globalAlpha = fade * (isNext ? 1 : 0.25 + 0.5 * near);
      ctx.lineWidth = width + (isNext ? 1 : 0.5);
      const tick = Math.max(isNext ? 5 : 3, 12 * scale);
      for (const a of [start, end]) {
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(view.cx + (r - tick) * cos, view.cy + (r - tick) * sin);
        ctx.lineTo(view.cx + (r + tick) * cos, view.cy + (r + tick) * sin);
        ctx.stroke();
      }
    }
  }
}

function drawPlayer(ctx: DiveCtx, view: Viewport, state: DiveState, fx: Fx, c: DiveColors) {
  // Trail: where the player was a moment ago. The tunnel has turned since, so it sweeps along
  // the wall to the side the player came from, drifting a little toward the viewer as it fades.
  ctx.strokeStyle = c.signal;
  ctx.lineCap = 'round';
  const samples = fx.trail;
  const trailPoint = (angle: number, age: number) => {
    const r = view.wallRadius * (1 + TRAIL_DRIFT * age);
    const a = screenAngle(angle, state.angle);
    return { x: view.cx + r * Math.cos(a), y: view.cy + r * Math.sin(a) };
  };
  for (let i = 1; i < samples.length; i++) {
    const s0 = samples[i - 1]!;
    const s1 = samples[i]!;
    const age1 = (fx.now - s1.at) / FX_MS.trail;
    const a = trailPoint(s0.angle, (fx.now - s0.at) / FX_MS.trail);
    const b = trailPoint(s1.angle, age1);
    const life = 1 - age1;
    ctx.globalAlpha = 0.7 * life;
    ctx.lineWidth = 1 + 3 * life;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  const x = view.cx;
  const y = view.cy + view.wallRadius;
  const invulnerable = state.invulnerableMs > 0;
  const dim = invulnerable ? 0.35 + 0.25 * Math.abs(Math.sin(fx.now / 70)) : 1;
  const pulse = decay(fx.now, fx.passAt, FX_MS.pass);
  const haloR = 16 + 14 * pulse;
  const halo = ctx.createRadialGradient(x, y, 0, x, y, haloR);
  halo.addColorStop(0, c.signal);
  halo.addColorStop(1, c.ground);
  ctx.globalAlpha = dim * (0.45 + 0.35 * pulse);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, haloR, 0, TAU);
  ctx.fill();

  ctx.globalAlpha = dim;
  ctx.fillStyle = c.signal;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, TAU);
  ctx.fill();
  ctx.fillStyle = c.bright;
  ctx.beginPath();
  ctx.arc(x, y, 1.8, 0, TAU);
  ctx.fill();
}

/** One frame. `ctx` is already scaled for the device pixel ratio; coordinates are CSS px. */
export function drawFrame(
  ctx: DiveCtx,
  view: Viewport,
  state: DiveState,
  fx: Fx,
  colors: DiveColors,
  { quiet }: DrawOptions,
): void {
  ctx.save();
  const shake = shakeOffset(fx, quiet);
  ctx.translate(shake.x, shake.y);
  drawBackdrop(ctx, view, state, colors);
  drawGuides(ctx, view, state, colors, quiet);
  drawThread(ctx, view, state, colors);
  drawRings(ctx, view, state, fx, colors);
  drawPlayer(ctx, view, state, fx, colors);
  ctx.restore();

  const flash = decay(fx.now, fx.hitAt, FX_MS.flash);
  if (flash > 0) {
    ctx.save();
    ctx.globalAlpha = flash * (quiet ? 0.06 : 0.12);
    ctx.fillStyle = colors.bright;
    ctx.fillRect(0, 0, view.width, view.height);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
