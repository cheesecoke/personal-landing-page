import {
  add,
  type Cubic,
  length,
  lerp,
  normalize,
  type Quadratic,
  scale,
  sub,
  type V3,
} from './math';
import type { CanopyIndex } from './tree';

/**
 * Where everything sits: a trunk, two boughs (systems left, products right), a branch per project
 * and sub-branches for what sits inside it. Pure numbers, no three.js, so the static drawing and
 * the live scene share one tree.
 *
 * NUDGE only tunes the home composition for the ids it names. Any other id falls back to a
 * procedural position on its bough, so the tree works for any data.
 */
const NUDGE: Readonly<Record<string, V3>> = {
  pas: [-3.15, 5.3, 1.25],
  atti: [-4.3, 6.65, 0.85],
  lifebox: [-5.3, 7.55, 0.1],
  'ai-system': [-0.85, 5.55, 1.85],
  distill: [-0.4, 7.0, 2.35],
  'personal-brain': [-2.05, 6.6, -1.5],
  'business-brain': [-3.05, 8.0, -2.2],
  'finance-brain': [-1.25, 8.05, -2.0],
  'duo-decide': [3.15, 5.75, 1.1],
  'thread-quest': [2.25, 7.05, -1.35],
  'one-rep': [4.3, 4.75, -1.5],
  'this-site': [3.95, 7.1, 0.35],
};

export type Side = 'system' | 'product';
export const SIDES: readonly Side[] = ['system', 'product'];

export interface ShootLayout {
  tip: V3;
  curve: Quadratic;
}

export interface CanopyLayout {
  base: V3;
  fork: V3;
  bough: Record<Side, V3>;
  /** Top-level ids, in data order. */
  tops: string[];
  bySide: Record<Side, string[]>;
  sideOf: (id: string) => Side;
  /** Mark position per node. */
  pos: Record<string, V3>;
  /** Where each node's branch starts. */
  from: Record<string, V3>;
  /** Shoot tips per node, in the node's shoot order. */
  shoots: Record<string, ShootLayout[]>;
  /** Growth windows on the linear intro clock 0..1, keyed by `trunk`, side or node id. */
  win: Record<string, [number, number]>;
  flowWin: [number, number];
  trunk: Cubic;
}

/** A branch from `a` to `b`: boughs rise first, branches reach out first. */
export function branchCurve(a: V3, b: V3, kind: 'bough' | 'branch'): Cubic {
  const d = sub(b, a);
  const L = length(d);
  let out: V3 = [d[0], 0, d[2]];
  out = length(out) < 1e-3 ? [0, 1, 0] : normalize(out);
  const c1 =
    kind === 'bough'
      ? add(add(a, [0, L * 0.32, 0]), scale(out, L * 0.12))
      : add(add(a, scale(out, L * 0.42)), [0, L * 0.08, 0]);
  const c2 = add(add(b, [0, -L * 0.36, 0]), scale(out, -L * 0.06));
  return [a, c1, c2, b];
}

function angDist(a: number, b: number) {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

/** `squeeze` pulls the crown in for tall phone stages (0.8) without shrinking the marks. */
export function layoutCanopy(index: CanopyIndex, squeeze = 1): CanopyLayout {
  const idx = index.byId;
  const sq = (p: V3): V3 => [p[0] * squeeze, p[1], p[2]];
  const nudge = (id: string): V3 | undefined => (NUDGE[id] ? sq(NUDGE[id]) : undefined);
  const base: V3 = [0, 0.86, 0];
  const fork: V3 = [0, 3.15, 0];
  const bough: Record<Side, V3> = { system: sq([-1.45, 4.05, 0.2]), product: sq([1.5, 4.25, 0.1]) };

  const sideOf = (id: string): Side => {
    let q = idx[id]!;
    while (q.parent) q = idx[q.parent]!;
    return q.kind === 'product' ? 'product' : 'system';
  };
  const tops = index.ids.filter((id) => !idx[id]!.parent);
  const bySide: Record<Side, string[]> = { system: [], product: [] };
  for (const id of tops) bySide[sideOf(id)].push(id);

  const pos: Record<string, V3> = {};
  const from: Record<string, V3> = {};
  for (const id of tops) {
    const s = sideOf(id);
    const list = bySide[s];
    const k = list.indexOf(id);
    const n = list.length;
    const sg = s === 'product' ? 1 : -1;
    from[id] = bough[s];
    const fixed = nudge(id);
    if (fixed) {
      pos[id] = fixed;
      continue;
    }
    const th = ((18 + 60 * (n > 1 ? k / (n - 1) : 0.5)) * Math.PI) / 180;
    const L = 2.0 + 0.18 * (idx[id]!.weight || 1);
    const b = bough[s];
    pos[id] = [b[0] + sg * Math.sin(th) * L, b[1] + Math.cos(th) * L, k % 2 ? -1.4 : 1.2];
  }
  const place = (list: readonly string[]) => {
    for (const id of list) {
      idx[id]!.children.forEach((cid, ci) => {
        const P = pos[id]!;
        from[cid] = P;
        const fixed = nudge(cid);
        if (fixed) pos[cid] = fixed;
        else {
          const d = normalize(sub(P, from[id]!));
          const a = (ci % 2 ? 1 : -1) * (0.35 + 0.25 * Math.floor(ci / 2));
          let r: V3 = [
            d[0] * Math.cos(a) - d[1] * Math.sin(a),
            d[0] * Math.sin(a) + d[1] * Math.cos(a),
            d[2],
          ];
          if (r[1] < 0.25) r[1] = 0.25;
          r = normalize(r);
          pos[cid] = [P[0] + r[0] * 1.45, P[1] + r[1] * 1.45, P[2] + (ci % 2 ? -0.5 : 0.5)];
        }
      });
      place(idx[id]!.children);
    }
  };
  place(tops);

  /* Shoot tips: a fan of free directions around the way the branch was already growing, kept clear
     of the branch it came in on and of its own children, never pointing down into the tree. */
  const shoots: Record<string, ShootLayout[]> = {};
  const D = Math.PI / 180;
  for (const id of index.ids) {
    const cnt = idx[id]!.shoots.length;
    if (!cnt) continue;
    const P = pos[id]!;
    const d = sub(P, from[id]!);
    const phi0 = Math.atan2(d[1], d[0]);
    const blocked = [
      phi0 + Math.PI,
      ...idx[id]!.children.map((c) => Math.atan2(pos[c]![1] - P[1], pos[c]![0] - P[0])),
    ];
    const picked: number[] = [];
    for (let i = 0; i < cnt; i++) {
      let best = phi0;
      let bs = -1e9;
      for (let a = -110; a <= 110; a += 5) {
        const phi = phi0 + a * D;
        const sy = Math.sin(phi);
        if (sy < -0.2) continue;
        const clear = Math.min(...blocked.map((x) => angDist(phi, x)));
        const sc = Math.min(clear, 60 * D) - 0.35 * Math.abs(a * D) + 0.15 * sy;
        if (sc > bs) {
          bs = sc;
          best = phi;
        }
      }
      picked.push(best);
      blocked.push(best);
    }
    picked.sort((x, y) => y - x);
    shoots[id] = picked.map((phi, i) => {
      const L = 1.0 + 0.2 * (i % 2);
      const tip: V3 = [
        P[0] + Math.cos(phi) * L,
        P[1] + Math.sin(phi) * L,
        P[2] + (i % 2 ? -0.35 : 0.35) * (cnt > 1 ? 1 : 0),
      ];
      const mid = add(lerp(P, tip, 0.5), [0, 0.12, 0]);
      return { tip, curve: [P, mid, tip] };
    });
  }

  /* Growth schedule on the linear intro clock 0..1. */
  const ranked = tops.slice().sort((a, b) => {
    const sa = idx[a]!.start;
    const sb = idx[b]!.start;
    if (sa >= 0 || sb >= 0) return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
    return idx[b]!.weight - idx[a]!.weight;
  });
  const win: Record<string, [number, number]> = {
    trunk: [0.03, 0.22],
    system: [0.19, 0.36],
    product: [0.21, 0.38],
  };
  ranked.forEach((id, r) => {
    win[id] = [0.33 + r * 0.045, 0.33 + r * 0.045 + 0.2];
  });
  const sched = (list: readonly string[]) => {
    for (const id of list) {
      idx[id]!.children.forEach((cid, ci) => {
        const s = win[id]![1] - 0.03 + ci * 0.04;
        win[cid] = [s, s + 0.15];
      });
      sched(idx[id]!.children);
    }
  };
  sched(tops);
  let maxEnd = 0;
  for (const k of Object.keys(win)) maxEnd = Math.max(maxEnd, win[k]![1]);
  if (maxEnd > 0.86) {
    for (const k of Object.keys(win)) {
      win[k] = [(win[k]![0] * 0.86) / maxEnd, (win[k]![1] * 0.86) / maxEnd];
    }
  }

  return {
    base,
    fork,
    bough,
    tops,
    bySide,
    sideOf,
    pos,
    from,
    shoots,
    win,
    flowWin: [0.86, 1.0],
    trunk: [base, [0.05, 1.8, 0], [-0.05, 2.5, 0], fork],
  };
}

/** A flow arcs up and toward the viewer between two marks. */
export function flowCurve(a: V3, b: V3): Quadratic {
  return [a, add(scale(add(a, b), 0.5), [0, 0.45, 0.85]), b];
}

export interface Bounds {
  c: V3;
  r: number;
  w: number;
  h: number;
}

export function bounds(list: readonly V3[], pad = 0): Bounds {
  const lo: V3 = [1e9, 1e9, 1e9];
  const hi: V3 = [-1e9, -1e9, -1e9];
  for (const a of list) {
    for (let i = 0; i < 3; i++) {
      lo[i] = Math.min(lo[i]!, a[i]!);
      hi[i] = Math.max(hi[i]!, a[i]!);
    }
  }
  return {
    c: [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2],
    r: Math.hypot(hi[0] - lo[0], hi[1] - lo[1]) / 2 + pad,
    w: hi[0] - lo[0],
    h: hi[1] - lo[1],
  };
}

/** Every mark plus the stump's footprint: what the home view frames. */
export function homePoints(layout: CanopyLayout): V3[] {
  return [...Object.values(layout.pos), [0, 0, 0], [-1.6, 0.4, 0], [1.6, 0.4, 0]];
}

/** Mark diameter in world units: start projects largest, then branches, then what sits inside. */
export function markSize(index: CanopyIndex, id: string): number {
  const n = index.byId[id]!;
  return n.start >= 0 ? 0.46 : n.depth === 0 ? 0.36 : 0.29;
}

/** Branch radius from a node's weight. */
export const branchRadius = (w: number) => 0.009 + 0.0062 * w;

export const STUMP_SCALE = 1.55;
