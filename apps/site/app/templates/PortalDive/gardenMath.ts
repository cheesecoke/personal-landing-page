/**
 * The pure parts of the garden's motion: how big the canvas draws, when the far flock crosses and
 * where each bird is, how its wings beat, and how the motion eases in. No DOM and no WebGL, so it
 * is unit-tested on its own. Every position is in the pixels of the full render (2688 by 1520).
 */

/** At most this many device pixels per CSS pixel. */
export const MAX_PIXEL_RATIO = 2;
/** At most this many pixels in the canvas's backing store (one full-screen pass, mid-range phones). */
export const MAX_BACKING_PIXELS = 2_400_000;

/**
 * The canvas's backing size for a box of `cssW` by `cssH` showing an image `texW` texels wide. It
 * never draws finer than the device, than `MAX_PIXEL_RATIO`, or than the image itself has detail
 * for (more would cost without showing anything), and it keeps under `MAX_BACKING_PIXELS`.
 */
export function backingSize(
  cssW: number,
  cssH: number,
  devicePixelRatio: number,
  texW: number,
): { width: number; height: number; scale: number } {
  if (cssW <= 0 || cssH <= 0) return { width: 1, height: 1, scale: 1 };
  const detail = texW / cssW;
  let scale = Math.min(Math.max(devicePixelRatio, 0.5), MAX_PIXEL_RATIO, Math.max(detail, 0.5));
  const pixels = cssW * cssH * scale * scale;
  if (pixels > MAX_BACKING_PIXELS) scale *= Math.sqrt(MAX_BACKING_PIXELS / pixels);
  return {
    width: Math.max(1, Math.round(cssW * scale)),
    height: Math.max(1, Math.round(cssH * scale)),
    scale,
  };
}

/** The motion eases in from nothing, so the first frame is the still image exactly. */
export const EASE_IN_S = 3;

/** 0 at the start, 1 after `EASE_IN_S`, smooth at both ends. */
export function easeIn(seconds: number): number {
  const t = Math.min(1, Math.max(0, seconds / EASE_IN_S));
  return t * t * (3 - 2 * t);
}

/* ---- The far flock -------------------------------------------------------------------------- */

/** How often a flock crosses, and how long one crossing takes, in seconds. */
export const FLOCK_PERIOD_S = 42;
export const FLOCK_CROSSING_S = 17;
/** The first crossing starts this long after the garden appears. */
export const FLOCK_FIRST_S = 6;
/** Where the flock flies: from the gap right of the left pine to the right-hand trees, rising. */
export const FLOCK_FROM = { x: 640, y: 372 } as const;
export const FLOCK_TO = { x: 1720, y: 262 } as const;
/** Wing beats per second, and the share of each flap-and-glide cycle spent gliding. */
export const WINGBEAT_HZ = 3.6;

export interface Bird {
  /** Render pixels. */
  x: number;
  y: number;
  /** Wingspan, render pixels. */
  span: number;
  /** Wing angle, radians: 0 is wings level at the top of the stroke; the shader takes the cosine. */
  wing: number;
  /** 0 to 1: fading in and out at the ends of the path. */
  alpha: number;
}

/** A loose, uneven flock: offsets from the leader (render px), size, and each bird's own rhythm. */
const FLOCK = [
  { dx: 0, dy: 0, span: 9.5, rate: 1, phase: 0, glide: 0.45 },
  { dx: -17, dy: 6, span: 8.6, rate: 1.06, phase: 1.9, glide: 0.35 },
  { dx: -29, dy: -4, span: 9, rate: 0.95, phase: 3.7, glide: 0.5 },
  { dx: -44, dy: 11, span: 8.2, rate: 1.1, phase: 0.8, glide: 0.3 },
  { dx: -61, dy: 3, span: 7.8, rate: 1.02, phase: 5.1, glide: 0.55 },
] as const;

/** A smooth 0..1 bump: 0 outside [0, 1], 1 in the middle, easing at the ends over `edge`. */
function fade(u: number, edge: number): number {
  if (u <= 0 || u >= 1) return 0;
  const a = Math.min(1, u / edge);
  const b = Math.min(1, (1 - u) / edge);
  const s = Math.min(a, b);
  return s * s * (3 - 2 * s);
}

/**
 * The wing angle of a bird at `t` seconds: flapping at its own rate, with a glide in every cycle
 * (wings held a little raised, as small birds do between bursts), so no two birds beat together.
 */
export function wingAngle(t: number, rate: number, phase: number, glide: number): number {
  // A flap-and-glide cycle of about 1.4 s: flapping for the first part, gliding for `glide` of it.
  const cycle = 1.4 / rate;
  const local = (((t + phase) % cycle) + cycle) % cycle;
  const flapping = local < cycle * (1 - glide);
  if (!flapping) return 0.35 * Math.PI; // gliding: wings just above level
  return 2 * Math.PI * WINGBEAT_HZ * rate * local;
}

/**
 * Where the far flock is at `t` seconds after the garden appeared: the birds on screen (fading at
 * the ends of the path), or none between crossings.
 */
export function flockAt(t: number): Bird[] {
  const since = t - FLOCK_FIRST_S;
  if (since < 0) return [];
  const into = since % FLOCK_PERIOD_S;
  if (into > FLOCK_CROSSING_S) return [];
  const u = into / FLOCK_CROSSING_S;
  const pass = Math.floor(since / FLOCK_PERIOD_S);
  // Each pass a little higher or lower, so it does not repeat exactly.
  const lift = ((pass * 37) % 5) * 9 - 18;
  const lx = FLOCK_FROM.x + (FLOCK_TO.x - FLOCK_FROM.x) * u;
  const ly = FLOCK_FROM.y + (FLOCK_TO.y - FLOCK_FROM.y) * u + lift;
  return FLOCK.map((b, i) => {
    // A gentle rise and fall of each bird on its own, a few pixels.
    const bob = Math.sin(t * 0.9 + i * 1.7) * 1.6;
    // Birds at the back reach each end of the path a little later.
    const ub = u + b.dx / (FLOCK_TO.x - FLOCK_FROM.x);
    return {
      x: lx + b.dx,
      y: ly + b.dy + bob,
      span: b.span,
      wing: wingAngle(t, b.rate, b.phase, b.glide),
      alpha: fade(ub, 0.12),
    };
  }).filter((b) => b.alpha > 0);
}

/** The most birds the shader draws at once. */
export const MAX_BIRDS = FLOCK.length;
