/**
 * Angles are radians around the tunnel wall. 0 is the bottom of the tunnel and angles grow
 * with positive steering; how that maps to the screen (clockwise or not) is the renderer's call.
 */
export const TAU = Math.PI * 2;

/** Wrap any angle into [0, 2π). */
export function wrapAngle(a: number): number {
  const r = a % TAU;
  return r < 0 ? r + TAU : r;
}

/** Shortest signed difference `to - from`, in (-π, π]. Handles the 0 / 2π seam. */
export function angleDelta(to: number, from: number): number {
  const d = wrapAngle(to - from);
  return d > Math.PI ? d - TAU : d;
}

/** True when `angle` lies inside a gap of full width `gapWidth` centred on `gapCentre`. */
export function inGap(angle: number, gapCentre: number, gapWidth: number): boolean {
  return Math.abs(angleDelta(angle, gapCentre)) <= gapWidth / 2;
}
