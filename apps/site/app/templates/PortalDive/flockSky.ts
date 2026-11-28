/**
 * The far flock: now and then, a few very distant birds drift across the open sky between the
 * trees. The pure parts (when a pass happens, where each bird is, how its wings beat) have no DOM,
 * so they are unit-tested on their own; `startFarFlock` draws them on a small canvas.
 *
 * Positions are in the pixels of the full render (2688 by 1520). The canvas covers only `BAND`,
 * the open sky above the far hills, so it stays small.
 */

/** The first pass starts this long after the garden is first shown, plus up to `FIRST_JITTER_S`. */
export const FIRST_PASS_S = 20;
export const FIRST_JITTER_S = 10;
/** From the start of one pass to the start of the next: at least this, plus up to the jitter. */
export const GAP_S = 60;
export const GAP_JITTER_S = 30;
/** How long a pass takes: far away, so slow across the sky. */
export const PASS_S = 18;
export const PASS_JITTER_S = 6;
/** The birds' strongest opacity, mid-path (they fade in and out from nothing at the ends). */
export const PEAK_ALPHA = 0.42;
/** The share of the path spent fading in, and again fading out. */
export const FADE_SHARE = 0.22;

/** The part of the render the canvas covers: open sky between the pines and above the hills. */
export const BAND = { x: 560, y: 300, width: 940, height: 260 } as const;
/** Where a pass flies, left to right (a pass may also fly the other way), before its lift. */
export const PATH_FROM = { x: 700, y: 470 } as const;
export const PATH_TO = { x: 1360, y: 405 } as const;
/** How far the path bows upward at its middle, render px. */
export const PATH_BOW = 26;

/** Wing beats per second while flapping; each bird glides for part of every cycle. */
export const WINGBEAT_HZ = 3.2;

export interface FarBird {
  /** Render pixels. */
  x: number;
  y: number;
  /** Wingspan, render pixels. */
  span: number;
  /** Wing angle, radians: 0 is wings at the top of the stroke. */
  wing: number;
  /** 0 to 1 (before `PEAK_ALPHA`): fading in and out at the ends of the path. */
  alpha: number;
}

export interface Pass {
  /** Seconds of garden time when it starts, and how long it takes. */
  start: number;
  duration: number;
  /** 1: left to right. -1: right to left. */
  dir: 1 | -1;
  /** Render px up (negative) or down from the path. */
  lift: number;
}

/** A loose, uneven little flock: offsets from the leader (render px), size, and its own rhythm. */
const FLOCK = [
  { dx: 0, dy: 0, span: 6.4, rate: 1, phase: 0, glide: 0.45 },
  { dx: -13, dy: 5, span: 5.6, rate: 1.07, phase: 1.9, glide: 0.35 },
  { dx: -22, dy: -4, span: 6, rate: 0.94, phase: 3.7, glide: 0.5 },
  { dx: -34, dy: 9, span: 5.2, rate: 1.12, phase: 0.8, glide: 0.3 },
  { dx: -41, dy: 1, span: 5.5, rate: 1.03, phase: 5.1, glide: 0.55 },
  { dx: -55, dy: 12, span: 5, rate: 0.97, phase: 2.6, glide: 0.4 },
] as const;

export const FLOCK_SIZE = FLOCK.length;

/** A smooth 0..1 bump: 0 outside [0, 1], 1 in the middle, easing in and out over `edge`. */
export function fade(u: number, edge: number): number {
  if (u <= 0 || u >= 1) return 0;
  const s = Math.min(1, u / edge, (1 - u) / edge);
  return s * s * (3 - 2 * s);
}

/**
 * The wing angle at `t` seconds: flapping at the bird's own rate, with a glide in every cycle
 * (wings held just above level), so no two birds beat together.
 */
export function wingAngle(t: number, rate: number, phase: number, glide: number): number {
  const cycle = 1.5 / rate;
  const local = (((t + phase) % cycle) + cycle) % cycle;
  if (local >= cycle * (1 - glide)) return 0.4 * Math.PI;
  return 2 * Math.PI * WINGBEAT_HZ * rate * local;
}

/** The pass after `previous` (or the first one), with `random` giving numbers in [0, 1). */
export function nextPass(
  previous: Pass | null,
  random: () => number,
  firstAt = FIRST_PASS_S,
): Pass {
  const start = previous
    ? previous.start + GAP_S + random() * GAP_JITTER_S
    : firstAt + (firstAt > 0 ? random() * FIRST_JITTER_S : 0);
  return {
    start,
    duration: PASS_S + random() * PASS_JITTER_S,
    dir: random() < 0.5 ? 1 : -1,
    lift: Math.round((random() - 0.5) * 40),
  };
}

/** Where the birds of `pass` are at garden time `t` (none outside the pass). */
export function birdsAt(pass: Pass, t: number): FarBird[] {
  const u = (t - pass.start) / pass.duration;
  if (u <= 0 || u >= 1) return [];
  const from = pass.dir === 1 ? PATH_FROM : PATH_TO;
  const to = pass.dir === 1 ? PATH_TO : PATH_FROM;
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return FLOCK.map((b, i) => {
    // Birds further back reach each point of the path a little later.
    const ub = u + b.dx / length;
    const x = from.x + (to.x - from.x) * ub;
    const bow = -PATH_BOW * 4 * ub * (1 - ub);
    const bob = Math.sin(t * 0.8 + i * 1.7) * 1.2;
    return {
      x,
      y: from.y + (to.y - from.y) * ub + bow + pass.lift + b.dy + bob,
      span: b.span,
      wing: wingAngle(t, b.rate, b.phase, b.glide),
      alpha: fade(ub, FADE_SHARE),
    };
  }).filter((b) => b.alpha > 0);
}

/** `data-garden-flock` on the canvas: waiting for the next pass, or a pass on screen. */
export type FlockState = 'waiting' | 'flying';

export interface FarFlockOptions {
  /** Seconds after the garden is first shown before the first pass (default `FIRST_PASS_S`, plus jitter; 0: at once). */
  firstPassS?: number;
  /** Numbers in [0, 1). Default `Math.random`. */
  random?: () => number;
}

export interface FarFlock {
  /** On screen (the garden shown, the tab visible) or not: garden time only runs while it is. */
  setActive: (active: boolean) => void;
  dispose: () => void;
}

/** At most this many device pixels per CSS pixel. */
const MAX_RATIO = 2;

/**
 * Draws the far flock on `canvas` (which covers `BAND` of the scene). Garden time only runs while
 * active, so a hidden tab or the tunnel pauses everything; between passes nothing is drawn and no
 * frame is requested.
 */
export function startFarFlock(
  canvas: HTMLCanvasElement,
  { firstPassS = FIRST_PASS_S, random = Math.random }: FarFlockOptions = {},
): FarFlock {
  const ctx = canvas.getContext('2d');
  let pass = nextPass(null, random, firstPassS);
  let clock = 0; // garden seconds
  let since = 0; // performance.now() when garden time last resumed
  let active = false;
  let disposed = false;
  let frame = 0;
  let timer = 0;

  const set = (state: FlockState) => {
    if (canvas.dataset.gardenFlock !== state) canvas.dataset.gardenFlock = state;
  };
  set('waiting');

  const now = () => clock + (active ? (performance.now() - since) / 1000 : 0);

  const clear = () => ctx?.clearRect(0, 0, canvas.width, canvas.height);

  const draw = (t: number) => {
    if (!ctx) return;
    const box = canvas.getBoundingClientRect();
    const cssW = canvas.clientWidth || box.width;
    const cssH = canvas.clientHeight || box.height;
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_RATIO);
    const w = Math.max(1, Math.round(cssW * ratio));
    const h = Math.max(1, Math.round(cssH * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const scale = w / BAND.width; // canvas px per render px
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(scale, 0, 0, scale, -BAND.x * scale, -BAND.y * scale);
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const b of birdsAt(pass, t)) {
      const half = b.span / 2;
      const tip = -Math.cos(b.wing) * b.span * 0.26;
      ctx.globalAlpha = PEAK_ALPHA * b.alpha;
      ctx.lineWidth = Math.max(b.span * 0.13, 0.9 / scale);
      ctx.beginPath();
      ctx.moveTo(b.x - half, b.y + tip);
      ctx.quadraticCurveTo(b.x - half * 0.4, b.y + tip * 0.15 - b.span * 0.05, b.x, b.y + 0.4);
      ctx.quadraticCurveTo(
        b.x + half * 0.4,
        b.y + tip * 0.15 - b.span * 0.05,
        b.x + half,
        b.y + tip,
      );
      ctx.stroke();
    }
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
    const t = now();
    if (t >= pass.start + pass.duration) {
      clear();
      pass = nextPass(pass, random);
      set('waiting');
      schedule();
      return;
    }
    draw(t);
    frame = requestAnimationFrame(tick);
  };

  const schedule = () => {
    stop();
    if (disposed || !active) return;
    const wait = pass.start - now();
    if (wait > 0) {
      timer = window.setTimeout(schedule, wait * 1000);
      return;
    }
    set('flying');
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
