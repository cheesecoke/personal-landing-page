/** Label placement: try each direction and gap around a point until the label is clear. */

/** A direction and the index of the gap it was placed at. */
export type LabelSlot = [dx: number, dy: number, gap: number];

/** x0, y0, x1, y1. `own` marks a box that belongs to one label and never blocks it. */
export type Box = [number, number, number, number] & { own?: string };

export interface LabelItem {
  id: string;
  x: number;
  y: number;
  /** Radius of the mark the label belongs to. */
  r: number;
  w: number;
  h: number;
  dirs?: readonly (readonly [number, number])[];
  gaps?: readonly number[];
  /** Where it sat last frame, tried first so labels do not jump. */
  prev?: LabelSlot;
}

export interface PlacedLabel {
  rect: [number, number, number, number];
  slot: LabelSlot;
  /** The anchor the leader line runs to. */
  ax: number;
  ay: number;
}

export const LABEL_DIRS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0.82, -0.57],
  [0.82, 0.57],
  [-0.82, -0.57],
  [-0.82, 0.57],
  [0, -1],
  [0, 1],
];

/** Directions sorted by how closely they point along (dx, dy). */
export function dirsToward(dx: number, dy: number): readonly (readonly [number, number])[] {
  if (Math.hypot(dx, dy) < 1e-3) return LABEL_DIRS;
  return LABEL_DIRS.slice().sort((a, b) => b[0] * dx + b[1] * dy - (a[0] * dx + a[1] * dy));
}

/** Items in priority order; obstacles and bounds in the same pixel space. */
export function placeLabels(
  items: readonly LabelItem[],
  obstacles: readonly Box[],
  bounds: readonly [number, number, number, number],
): Record<string, PlacedLabel> {
  const placed: Box[] = obstacles.slice();
  const res: Record<string, PlacedLabel> = {};
  const free = (r: Box) => {
    if (r[0] < bounds[0] || r[1] < bounds[1] || r[2] > bounds[2] || r[3] > bounds[3]) return false;
    for (const q of placed) {
      if (q.own && q.own === r.own) continue;
      if (r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]) return false;
    }
    return true;
  };
  for (const it of items) {
    const gaps = it.gaps ?? [6, 16, 30];
    const dirs = it.dirs ?? LABEL_DIRS;
    const order: LabelSlot[] = [];
    if (it.prev) order.push(it.prev);
    for (let g = 0; g < gaps.length; g++) for (const d of dirs) order.push([d[0], d[1], g]);
    for (const c of order) {
      const gap = it.r + gaps[Math.min(c[2], gaps.length - 1)]!;
      const ax = it.x + c[0] * gap;
      const ay = it.y + c[1] * gap;
      const hx = c[0] > 0.3 ? 0 : c[0] < -0.3 ? -1 : -0.5;
      let vy = c[1] > 0.3 ? 0 : c[1] < -0.3 ? -1 : -0.5;
      if (hx !== -0.5) vy = -0.5 + (c[1] > 0.3 ? 0.35 : c[1] < -0.3 ? -0.35 : 0);
      const x0 = ax + hx * it.w;
      const y0 = ay + vy * it.h;
      const r: Box = [x0 - 3, y0 - 2, x0 + it.w + 3, y0 + it.h + 2];
      r.own = it.id;
      if (free(r)) {
        placed.push(r);
        res[it.id] = { rect: [x0, y0, x0 + it.w, y0 + it.h], slot: c, ax, ay };
        break;
      }
    }
  }
  return res;
}
