export type RingWeight = 1 | 2 | 3 | 4;

/** Ring thickness in board units, by weight. Four steps, never a raw count. */
export const RING_THICKNESS: Record<RingWeight, number> = { 1: 2, 2: 4, 3: 7, 4: 10 };

export interface BranchRingGeometry {
  /** Radius of the solid core. */
  core: number;
  /** Radius of the outline, where the growing arc is drawn. */
  outer: number;
  /** One per ring, oldest (innermost) first. */
  rings: { r: number; width: number }[];
}

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * The cross-section's geometry in a 280 by 280 box, from the Branch rings board: rings are laid
 * outward from a 16-unit centre, 6 apart, each as thick as its weight, then the whole section is
 * scaled so its outline sits at radius 118.
 */
export function ringGeometry(weights: readonly RingWeight[]): BranchRingGeometry {
  let r = 16;
  const raw = weights.map((weight) => {
    const t = RING_THICKNESS[weight];
    r += 6 + t / 2;
    const ring = { r, t };
    r += t / 2;
    return ring;
  });
  const outer = r + 8;
  const k = 118 / outer;
  return {
    core: round(6 * k),
    outer: round(outer * k),
    rings: raw.map((ring) => ({ r: round(ring.r * k), width: round(Math.max(1.2, ring.t * k)) })),
  };
}
