/**
 * A far fish jump: now and then, far out on the open water, a fish breaks the surface. A brief
 * tiny splash, then a few slow rings that spread flat on the pond and fade. The pure parts (when,
 * where, and the shape of each moment) have no DOM, so they are unit-tested on their own;
 * `startFishJumps` draws them on a small canvas over the water.
 *
 * Positions are in the pixels of the full render (2688 by 1520). The canvas covers only `WATER`.
 */

/** The first jump comes this long after the garden is first shown, plus up to the jitter. */
export const FIRST_JUMP_S = 45;
export const FIRST_JITTER_S = 30;
/** From one jump to the next: at least this, plus up to the jitter (2 to 4 minutes). */
export const GAP_S = 120;
export const GAP_JITTER_S = 120;
/** How long a jump lasts on screen, splash to the last ring fading out. */
export const JUMP_S = 4.2;

/** The part of the render the canvas covers: the far, open middle of the pond. */
export const WATER = { x: 640, y: 830, width: 720, height: 150 } as const;
/**
 * Where a jump may happen: the open water left of the stepping stones and below the far shore's
 * reflections. Tall screens only show the render's left part, so they get the part they can see.
 */
export const SPOTS_WIDE = { x0: 900, x1: 1290, y0: 850, y1: 950 } as const;
export const SPOTS_TALL = { x0: 700, x1: 880, y0: 860, y1: 950 } as const;

/** The pond's horizon (render px): the water's depth scale comes from the distance below it. */
export const HORIZON = 792;
/** Render px per unit of depth: the rings are flattened by (y - HORIZON) / DEPTH. */
export const DEPTH = 730;

export interface Jump {
  /** Seconds of garden time when it starts. */
  start: number;
  /** Where the fish breaks the surface, render px. */
  x: number;
  y: number;
  /** 1: the fish leaps toward the right, -1: toward the left. */
  dir: 1 | -1;
}

/** The jump after `previous` (or the first), with `random` giving numbers in [0, 1). */
export function nextJump(
  previous: Jump | null,
  random: () => number,
  tall: boolean,
  firstAt = FIRST_JUMP_S,
): Jump {
  const start = previous
    ? previous.start + JUMP_S + GAP_S + random() * GAP_JITTER_S
    : firstAt + (firstAt >= FIRST_JUMP_S ? random() * FIRST_JITTER_S : 0);
  const spots = tall ? SPOTS_TALL : SPOTS_WIDE;
  return {
    start,
    x: spots.x0 + (spots.x1 - spots.x0) * random(),
    y: spots.y0 + (spots.y1 - spots.y0) * random(),
    dir: random() < 0.5 ? 1 : -1,
  };
}

/** How flat a circle on the water looks at render row `y`: its height over its width. */
export function flatness(y: number): number {
  return Math.min(0.35, Math.max(0.05, (y - HORIZON) / DEPTH));
}

/** Render px across, per unit of size on the water, at row `y` (nearer is larger). */
export function scaleAt(y: number): number {
  return Math.max(4, y - HORIZON) / 90;
}

export interface Ring {
  /** Half-width, render px (the half-height is `rx * flatness`). */
  rx: number;
  /** 0 to 1. */
  alpha: number;
}

export interface Splash {
  /** The bright fleck where the water breaks, 0 to 1. */
  fleck: number;
  /** Droplets: offsets from the jump point (render px, up is negative) and size. */
  drops: { dx: number; dy: number; r: number }[];
  /** The fish's dark arc while it is out of the water, 0 to 1 along its leap, or null. */
  arc: number | null;
}

const SPLASH_S = 0.55;
const LEAP_S = 0.32;
/** Each ring starts a little after the one before, spreads ever slower, and fades. */
const RINGS = [
  { delay: 0.1, reach: 30, life: 3.8 },
  { delay: 0.55, reach: 20, life: 3.0 },
] as const;
/** Droplets thrown up by the splash: launch angle, speed (render px/s), size. */
const DROPS = [
  { a: -1.25, v: 30, r: 0.55 },
  { a: -1.6, v: 36, r: 0.5 },
  { a: -1.95, v: 28, r: 0.45 },
  { a: -1.05, v: 22, r: 0.4 },
  { a: -2.2, v: 20, r: 0.4 },
] as const;
const GRAVITY = 140;

/** The splash at `s` seconds into the jump, at size `k` (render px per unit). */
export function splashAt(s: number, k: number, dir: 1 | -1): Splash | null {
  if (s < 0 || s > SPLASH_S) return null;
  const fleck = s < 0.06 ? s / 0.06 : Math.max(0, 1 - (s - 0.06) / 0.3);
  const t = Math.max(0, s - 0.02);
  const drops = DROPS.map((d) => {
    const vx = Math.cos(d.a) * d.v * dir * -1;
    const vy = Math.sin(d.a) * d.v;
    const dy = (vy * t + 0.5 * GRAVITY * t * t) * k;
    return { dx: vx * t * k, dy, r: d.r * k };
  }).filter((d) => d.dy < 0);
  const arc = s < LEAP_S ? s / LEAP_S : null;
  return { fleck, drops, arc };
}

/** The rings at `s` seconds into the jump, at size `k`. */
export function ringsAt(s: number, k: number): Ring[] {
  return RINGS.flatMap((r) => {
    const u = (s - r.delay) / r.life;
    if (u <= 0 || u >= 1) return [];
    // Fast at first, then ever slower, as a ring on still water.
    const spread = 1 - (1 - u) ** 2.2;
    const alpha = Math.min(1, u * 8) * (1 - u) ** 1.2;
    return [{ rx: (1.2 + r.reach * spread) * k, alpha }];
  });
}

/** `data-garden-fish` on the canvas. */
export type FishState = 'waiting' | 'jumping';

export interface FishJumpOptions {
  /** Seconds after the garden is first shown before the first jump (stories: a few). Below the default, exact. */
  firstJumpS?: number;
  /** Numbers in [0, 1). Default `Math.random`. */
  random?: () => number;
}

export interface FishJumps {
  setActive: (active: boolean) => void;
  dispose: () => void;
}

export interface WaterColour {
  /** The water where the jump happens, as r, g, b (0 to 255). */
  base: [number, number, number];
}

const MAX_RATIO = 2;
/** Strongest opacity of the brightest stroke. */
export const PEAK_ALPHA = 0.42;

const rgba = ([r, g, b]: readonly number[], a: number) =>
  `rgba(${Math.round(r!)}, ${Math.round(g!)}, ${Math.round(b!)}, ${a.toFixed(3)})`;
const mix = (a: readonly number[], b: readonly number[], t: number) =>
  a.map((v, i) => v + (b[i]! - v) * t);
/** The sky's warm light, which the side of a ring facing it reflects. */
const LIGHT = [255, 236, 214];
const SHADE = [70, 58, 60];

/**
 * Draws the jumps on `canvas` (which covers `WATER`). `sample` gives the water's colour at a render
 * point (from the still), so the light and dark edges are the water's own, made lighter and
 * darker. Garden time only runs while active; between jumps nothing is drawn or requested.
 */
export function startFishJumps(
  canvas: HTMLCanvasElement,
  sample: (x: number, y: number) => [number, number, number] | null,
  tall: () => boolean,
  { firstJumpS = FIRST_JUMP_S, random = Math.random }: FishJumpOptions = {},
): FishJumps {
  const ctx = canvas.getContext('2d');
  let jump = nextJump(null, random, tall(), firstJumpS);
  let water: [number, number, number] | null = null;
  let clock = 0;
  let since = 0;
  let active = false;
  let disposed = false;
  let frame = 0;
  let timer = 0;

  const set = (state: FishState) => {
    if (canvas.dataset.gardenFish !== state) canvas.dataset.gardenFish = state;
  };
  set('waiting');
  const now = () => clock + (active ? (performance.now() - since) / 1000 : 0);
  const clear = () => ctx?.clearRect(0, 0, canvas.width, canvas.height);

  const draw = (s: number) => {
    if (!ctx) return;
    const cssW = canvas.clientWidth || canvas.getBoundingClientRect().width;
    const cssH = canvas.clientHeight || canvas.getBoundingClientRect().height;
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_RATIO);
    const w = Math.max(1, Math.round(cssW * ratio));
    const h = Math.max(1, Math.round(cssH * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const scale = w / WATER.width;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(scale, 0, 0, scale, -WATER.x * scale, -WATER.y * scale);
    const base = water ?? [200, 160, 150];
    const light = mix(base, LIGHT, 0.8);
    const shade = mix(base, SHADE, 0.55);
    const k = scaleAt(jump.y);
    const flat = flatness(jump.y);
    const hair = 0.8 / scale; // about one device pixel, never thinner

    // Everything is softened a little, as anything this far away is.
    const soft = 'filter' in ctx;
    if (soft) ctx.filter = `blur(${(0.35 * k * scale).toFixed(2)}px)`;

    for (const ring of ringsAt(s, k)) {
      const ry = ring.rx * flat;
      // A ring on bright water is a soft dark trough with a lit crest just beyond it. Its front and
      // back (facing the viewer, and facing the sky) show most; its ends, seen edge-on, fade out.
      const band = Math.max(hair, 0.9 * k);
      const SEGMENTS = 40;
      for (let i = 0; i < SEGMENTS; i++) {
        const t0 = (i / SEGMENTS) * 2 * Math.PI;
        const t1 = ((i + 1) / SEGMENTS) * 2 * Math.PI;
        const facing = Math.abs(Math.sin((t0 + t1) / 2));
        const w = 0.15 + 0.85 * facing * facing;
        ctx.lineWidth = band;
        ctx.strokeStyle = rgba(shade, PEAK_ALPHA * ring.alpha * w);
        ctx.beginPath();
        ctx.ellipse(jump.x, jump.y, ring.rx, ry, 0, t0, t1);
        ctx.stroke();
        ctx.lineWidth = band * 0.8;
        ctx.strokeStyle = rgba(light, PEAK_ALPHA * 0.7 * ring.alpha * w);
        ctx.beginPath();
        ctx.ellipse(jump.x, jump.y, ring.rx + band, ry + band * flat * 2, 0, t0, t1);
        ctx.stroke();
      }
    }

    const splash = splashAt(s, k, jump.dir);
    if (splash) {
      if (splash.arc !== null) {
        // The fish's back, a small dark curve rising out and dipping back in.
        const len = 3.2 * k;
        const lift = Math.sin(splash.arc * Math.PI) * 2.2 * k;
        const cx = jump.x + jump.dir * (splash.arc - 0.5) * len;
        ctx.strokeStyle = rgba(shade, 0.8 * Math.sin(splash.arc * Math.PI));
        ctx.lineWidth = Math.max(hair, 0.9 * k);
        ctx.beginPath();
        ctx.moveTo(cx - (jump.dir * len) / 2, jump.y - lift * 0.4);
        ctx.quadraticCurveTo(cx, jump.y - lift, cx + (jump.dir * len) / 2, jump.y - lift * 0.4);
        ctx.stroke();
      }
      // The broken water: a small, soft, upright spout of light that rises and falls back.
      const rise = Math.sin(Math.min(1, splash.fleck) * Math.PI * 0.5);
      ctx.fillStyle = rgba(light, 0.7 * splash.fleck);
      ctx.beginPath();
      ctx.ellipse(
        jump.x,
        jump.y - 1.2 * k * rise,
        0.9 * k,
        (0.6 + 1.6 * rise) * k,
        0,
        0,
        2 * Math.PI,
      );
      ctx.fill();
      for (const d of splash.drops) {
        ctx.fillStyle = rgba(light, 0.55 * Math.min(1, splash.fleck + 0.3));
        ctx.beginPath();
        ctx.arc(jump.x + d.dx, jump.y + d.dy, Math.max(hair / 2, d.r), 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    if (soft) ctx.filter = 'none';
  };

  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    if (timer) clearTimeout(timer);
    frame = 0;
    timer = 0;
  };

  const tick = () => {
    frame = 0;
    if (disposed || !active) return;
    const s = now() - jump.start;
    if (s >= JUMP_S) {
      clear();
      jump = nextJump(jump, random, tall());
      set('waiting');
      schedule();
      return;
    }
    draw(s);
    frame = requestAnimationFrame(tick);
  };

  const schedule = () => {
    stop();
    if (disposed || !active) return;
    const wait = jump.start - now();
    if (wait > 0) {
      timer = window.setTimeout(schedule, wait * 1000);
      return;
    }
    water = sample(jump.x, jump.y);
    set('jumping');
    frame = requestAnimationFrame(tick);
  };

  return {
    setActive: (on) => {
      if (on === active || disposed) return;
      if (on) {
        since = performance.now();
        active = true;
        schedule();
      } else {
        clock = now();
        active = false;
        stop();
      }
    },
    dispose: () => {
      disposed = true;
      stop();
      clear();
    },
  };
}
