import type { CanopyData } from '../types';
import type { CanopyColors } from './colors';
import { type Box, dirsToward, type LabelItem, placeLabels } from './labels';
import {
  bounds,
  branchCurve,
  branchRadius,
  flowCurve,
  homePoints,
  layoutCanopy,
  markSize,
  SIDES,
  STUMP_SCALE,
} from './layout';
import { add, cross, cubicAt, dot, mixHex, normalize, quadraticAt, sub, type V3 } from './math';
import { outlineR, ring, STUMP, TAU } from './stump';
import type { CanopyIndex } from './tree';

/**
 * The home view of the tree as flat shapes, worked out without three.js or a browser. It is what
 * the page shows before (or instead of) the live stage: pre-rendered HTML, no JavaScript, or a
 * device where the 3D chunk cannot load.
 */

export interface FlatOptions {
  width: number;
  height: number;
  /** Tall phone stage: the crown is pulled in and the marks are larger. */
  phone: boolean;
  teaser: boolean;
  /** Pixels at the top kept clear for the heading. */
  top?: number;
}

export interface FlatShape {
  /** SVG path data. */
  d: string;
  fill?: string;
  stroke?: string;
  opacity?: number;
  width?: number;
  dash?: string;
}

export interface FlatMark {
  id: string;
  x: number;
  y: number;
  r: number;
  lead: boolean;
}

export interface FlatLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  start: boolean;
  /** Leader line from the mark to the label, when the label sits away from it. */
  leader?: [number, number, number, number];
}

export interface FlatTree {
  width: number;
  height: number;
  shapes: FlatShape[];
  marks: FlatMark[];
  labels: FlatLabel[];
}

const FOV = 30;
const n1 = (x: number) => Math.round(x * 10) / 10;
const path = (pts: readonly (readonly [number, number])[], close = false) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${n1(p[0])} ${n1(p[1])}`).join('') + (close ? 'Z' : '');

export function flatTree(
  index: CanopyIndex,
  data: CanopyData,
  C: CanopyColors,
  o: FlatOptions,
): FlatTree {
  const { width: W, height: H, phone, teaser } = o;
  const top = teaser ? 0 : Math.min(H * 0.25, o.top ?? 0);
  const idx = index.byId;
  const L = layoutCanopy(index, phone ? 0.8 : 1);
  const tv = Math.tan((FOV * Math.PI) / 360);

  /* the same framing as the live stage's home view */
  const b = bounds(homePoints(L));
  const fw = Math.max(80, W);
  const fh = Math.max(80, H - top);
  const half = Math.min(Math.atan((tv * fh) / H), Math.atan((tv * fw) / H));
  const dist =
    (Math.max(b.w / 2, b.h / 2) + (teaser || phone ? 0.1 : 0.2)) /
    Math.sin(half * (teaser ? 0.97 : 0.95));
  const target: V3 = [b.c[0], b.c[1] + (phone ? 0.1 : 0.15), 0];
  const el = (9 * Math.PI) / 180;
  const eye = add(target, [0, dist * Math.sin(el), dist * Math.cos(el)]);
  const fwd = normalize(sub(target, eye));
  const right = normalize(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  const aspect = W / H;
  const depth = (p: V3) => dot(sub(p, eye), fwd);
  const project = (p: V3): [number, number] => {
    const q = sub(p, eye);
    const d = dot(q, fwd);
    return [
      (dot(q, right) / (d * tv * aspect) / 2 + 0.5) * W,
      (-dot(q, up) / (d * tv) / 2 + 0.5) * H + top / 2,
    ];
  };
  const screenR = (p: V3, r: number) => ((r / depth(p)) * (H / 2)) / tv;

  const shapes: FlatShape[] = [];

  /* stump: side, cut face, growth rings */
  const SC = STUMP_SCALE;
  const SH = STUMP.H * SC;
  const front: [number, number][] = [];
  const back: [number, number][] = [];
  for (let k = 0; k <= 48; k++) {
    const a = (k / 48) * TAU;
    const r = outlineR(a) * SC;
    front.push(project([Math.cos(a) * r, SH, Math.sin(a) * r]));
    back.push(project([Math.cos(a) * r * 1.04, 0, Math.sin(a) * r * 1.04]));
  }
  /* the side as one silhouette: the foot, plus the band between the widest points of rim and foot */
  let lo = 0;
  let hi = 0;
  front.forEach((p, k) => {
    if (p[0] < front[lo]![0]) lo = k;
    if (p[0] > front[hi]![0]) hi = k;
  });
  const wall = path(back, true) + path([front[lo]!, front[hi]!, back[hi]!, back[lo]!], true);
  shapes.push({ d: wall, fill: C.stumpWall }, { d: path(front, true), fill: C.stumpTop });
  STUMP.major.forEach((t, i) => {
    const last = i === STUMP.major.length - 1;
    shapes.push({
      d: path(ring(t, 60, SC).map((p) => project([p[0], SH + 0.004, p[1]]))),
      stroke: last ? C.signal : C.signalDim,
      opacity: last ? 0.7 : 0.3,
      width: 1,
    });
  });
  [1.35, 1.62].forEach((s, i) => {
    shapes.push({
      d: path(ring(1, 72, SC * s).map((p) => project([p[0], 0.001, p[1]]))),
      stroke: C.signalDim,
      opacity: i ? 0.2 : 0.32,
      width: 1,
      dash: '4 4',
    });
  });

  /* branches: tapered, filled outlines */
  const SEGS = 20;
  function taper(at: (t: number) => V3, r0: number, r1: number, color: string) {
    const mid: [number, number][] = [];
    const half: number[] = [];
    for (let i = 0; i <= SEGS; i++) {
      const t = i / SEGS;
      const p = at(t);
      mid.push(project(p));
      half.push(Math.max(0.5, (r0 + (r1 - r0) * Math.pow(t, 0.8)) * screenR(p, 1)));
    }
    const left: [number, number][] = [];
    const rightSide: [number, number][] = [];
    for (let i = 0; i <= SEGS; i++) {
      const a = mid[Math.max(0, i - 1)]!;
      const c = mid[Math.min(SEGS, i + 1)]!;
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
      const nx = (-(c[1] - a[1]) / len) * half[i]!;
      const ny = ((c[0] - a[0]) / len) * half[i]!;
      left.push([mid[i]![0] + nx, mid[i]![1] + ny]);
      rightSide.push([mid[i]![0] - nx, mid[i]![1] - ny]);
    }
    shapes.push({
      d: path([...left, ...rightSide.reverse()], true),
      fill: mixHex(color, C.ground, 0.8),
    });
  }
  const TONE = { system: C.toneSystem, product: C.toneProduct };
  taper((t) => cubicAt(L.trunk, t), 0.068, 0.047, C.toneTrunk);
  for (const s of SIDES) {
    if (!L.bySide[s].length) continue;
    const c = branchCurve(L.fork, L.bough[s], 'bough');
    taper((t) => cubicAt(c, t), 0.047, 0.04, TONE[s]);
  }
  for (const n of data.nodes) {
    const parentW = n.parent ? idx[n.parent]!.weight : 5;
    const c = branchCurve(L.from[n.id]!, L.pos[n.id]!, 'branch');
    taper(
      (t) => cubicAt(c, t),
      branchRadius(Math.min(parentW, n.weight + 1.5)),
      branchRadius(n.weight) * 0.8,
      TONE[L.sideOf(n.id)],
    );
  }
  for (const f of data.flows) {
    if (!L.pos[f.from] || !L.pos[f.to]) continue;
    const c = flowCurve(L.pos[f.from]!, L.pos[f.to]!);
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) pts.push(project(quadraticAt(c, i / 24)));
    shapes.push({ d: path(pts), stroke: C.signal, opacity: 0.12, width: 1 });
  }

  /* marks and their labels */
  const marks: FlatMark[] = index.ids.map((id) => {
    const p = L.pos[id]!;
    const q = project(p);
    const size = markSize(index, id) * (phone ? 1.25 : 1);
    return {
      id,
      x: q[0],
      y: q[1],
      r: Math.max(4, screenR(p, size / 2)),
      lead: idx[id]!.start >= 0,
    };
  });
  const byId: Record<string, FlatMark> = {};
  for (const m of marks) byId[m.id] = m;
  const baseXY = project(L.base);
  const shown = marks
    .filter((m) => (teaser || phone ? m.lead : true))
    .sort((a, b2) => {
      const score = (id: string) =>
        (idx[id]!.start >= 0 ? 200 - idx[id]!.start : 0) + idx[id]!.weight * 10 - idx[id]!.depth;
      return score(b2.id) - score(a.id);
    });
  /* text is not measured here: an average glyph width stands in for it */
  const items: (LabelItem & { text: string; start: boolean })[] = shown.map((m) => {
    const n = idx[m.id]!;
    const start = n.start >= 0;
    const par = n.parent && byId[n.parent] ? byId[n.parent]! : { x: baseXY[0], y: baseXY[1] };
    const side = n.depth === 0 ? (L.sideOf(m.id) === 'product' ? 1 : -1) : 0;
    return {
      id: m.id,
      text: n.label,
      start,
      x: m.x,
      y: m.y,
      r: m.r,
      w: n.label.length * (start ? 9.4 : 7.4) + (start ? 18 : 14),
      h: start ? 27 : 22,
      dirs: side ? dirsToward(side, 0) : dirsToward(m.x - par.x, m.y - par.y),
      gaps: [4, 14, 28],
    };
  });
  const placed = placeLabels(
    items,
    marks.map((m) => {
      const q: Box = [m.x - m.r, m.y - m.r, m.x + m.r, m.y + m.r];
      q.own = m.id;
      return q;
    }),
    [6, 6, W - 6, H - 6],
  );
  const labels: FlatLabel[] = [];
  for (const it of items) {
    const p = placed[it.id];
    if (!p) continue;
    const dx = p.ax - it.x;
    const dy = p.ay - it.y;
    const m = Math.hypot(dx, dy) || 1;
    labels.push({
      id: it.id,
      text: it.text,
      start: it.start,
      x: n1(p.rect[0]),
      y: n1(p.rect[1]),
      w: n1(it.w),
      h: it.h,
      leader:
        m > it.r + 6
          ? [n1(it.x + (dx / m) * (it.r + 2)), n1(it.y + (dy / m) * (it.r + 2)), n1(p.ax), n1(p.ay)]
          : undefined,
    });
  }
  for (const m of marks) {
    m.x = n1(m.x);
    m.y = n1(m.y);
    m.r = n1(m.r);
  }
  return { width: W, height: H, shapes, marks, labels };
}
