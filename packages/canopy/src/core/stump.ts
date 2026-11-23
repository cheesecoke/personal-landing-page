/**
 * The stump's shape, shared with the hero so the rings match.
 * `outlineR(a)`: outline radius at angle `a` (mean 1). `ringR(t, a)`: ring `t` (0 pith .. 1 wood
 * edge) at angle `a`.
 */
export const TAU = Math.PI * 2;

export const STUMP = {
  H: 0.56,
  OA: [0.075, 0.034, 0.022, 0.011, 0.009, 0.0045, 0.0025],
  OK: [1, 2, 3, 4, 5, 7, 9],
  OP: [0.9, 2.1, 4.0, 0.3, 1.4, 5.1, 2.7],
  woodFrac: 0.925,
  K: 0.85,
  wob: 0.007,
  scarPhi: 0.32,
  scarAmp: 0.045,
  scarSig: 0.17,
  major: [0.15, 0.315, 0.455, 0.58, 0.695, 0.82, 0.958],
  scarIndex: 4,
} as const;

export function outlineR(a: number): number {
  let r = 1;
  for (let i = 0; i < STUMP.OA.length; i++)
    r += STUMP.OA[i]! * Math.sin(STUMP.OK[i]! * a + STUMP.OP[i]!);
  return r;
}

export function woodR(a: number): number {
  return outlineR(a) * STUMP.woodFrac;
}

/** Mean wood radius. */
const M = (() => {
  let s = 0;
  for (let i = 0; i < 1024; i++) s += woodR((i / 1024) * TAU);
  return s / 1024;
})();

function angDiff(a: number, b: number) {
  const d = a - b;
  return Math.atan2(Math.sin(d), Math.cos(d));
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function ringR(t: number, a: number): number {
  const wR = woodR(a);
  const base = t * (M + (wR - M) * Math.pow(t, STUMP.K));
  const wob =
    STUMP.wob *
    4 *
    t *
    (1 - t) *
    (0.6 * Math.sin(6 * a + 11 * t + 1) + 0.4 * Math.sin(9 * a - 17 * t + 2));
  const ds = angDiff(a, STUMP.scarPhi);
  const t4 = STUMP.major[STUMP.scarIndex];
  const bump =
    STUMP.scarAmp *
    Math.exp(-(ds * ds) / (STUMP.scarSig * STUMP.scarSig)) *
    smoothstep(t4, t4 + 0.1, t) *
    (1 - 0.6 * smoothstep(0.85, 1, t));
  return base + wob + bump;
}

/** Points of ring `t` as [x, z] pairs (`n` segments), scaled by `sc`. `t >= 1` is the outline. */
export function ring(t: number, n: number, sc: number): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * TAU;
    const r = (t >= 1 ? outlineR(a) : ringR(t, a)) * sc;
    out.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return out;
}
