export type V3 = [number, number, number];

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/** Smoothstep on 0..1. */
export const smooth = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};

/** Smoothstep of `u` between `a` and `b`. */
export const seg = (u: number, a: number, b: number) => smooth((u - a) / Math.max(1e-4, b - a));

/** Ease in-out cubic, no overshoot. */
export const soft = (x: number) => {
  const t = clamp(x, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/** `#RRGGBB` to 0..1 channels. */
export function hex(h: string): V3 {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgba(h: string, a: number): string {
  const c = hex(h);
  return `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
}

/** `h` laid over `base` at alpha `a`, as an opaque colour. */
export function mixHex(h: string, base: string, a: number): string {
  const c = hex(h);
  const b = hex(base);
  return `rgb(${[0, 1, 2].map((i) => Math.round((b[i]! + (c[i]! - b[i]!) * a) * 255)).join(',')})`;
}

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a: V3): V3 => {
  const l = length(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export type Cubic = [V3, V3, V3, V3];
export type Quadratic = [V3, V3, V3];

export function cubicAt(c: Cubic, t: number): V3 {
  const k = 1 - t;
  const w = [k * k * k, 3 * k * k * t, 3 * k * t * t, t * t * t] as const;
  return [0, 1, 2].map(
    (i) => w[0] * c[0][i]! + w[1] * c[1][i]! + w[2] * c[2][i]! + w[3] * c[3][i]!,
  ) as V3;
}

export function quadraticAt(c: Quadratic, t: number): V3 {
  const k = 1 - t;
  const w = [k * k, 2 * k * t, t * t] as const;
  return [0, 1, 2].map((i) => w[0] * c[0][i]! + w[1] * c[1][i]! + w[2] * c[2][i]!) as V3;
}
