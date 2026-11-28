import { angleDelta } from '../angle';

/**
 * Fake perspective for the tunnel. Pure maths, no canvas.
 *
 * The player is fixed at the bottom of the screen and the tunnel turns around them: a world angle
 * is drawn relative to the player's angle, so steering left swings the tunnel the other way and
 * brings what was on the left down to the player. "Left" and "right" therefore always mean the
 * same thing on screen, wherever the player is in the tunnel.
 */

/** Where the tunnel sits in a canvas of the given CSS size. */
export interface Viewport {
  width: number;
  height: number;
  /** Vanishing point. */
  cx: number;
  cy: number;
  /** Screen radius of the tunnel wall at the player's depth (distance 0). */
  wallRadius: number;
}

/** Tunnel units: a ring this far ahead is drawn at half the wall radius. */
export const FOCAL_DEPTH = 20;

/** Lay the tunnel out in a box. The wall fills the narrow side, nudged up so the player has room. */
export function viewportFor(width: number, height: number): Viewport {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const wallRadius = Math.max(1, Math.min(w * 0.46, h * 0.4));
  return { width: w, height: h, cx: w / 2, cy: h / 2 - wallRadius * 0.06, wallRadius };
}

/**
 * Screen radius of something `distance` tunnel units ahead (negative: already behind the player,
 * on its way off screen). Returns null when it is too far behind to draw.
 */
export function projectRadius(
  distance: number,
  wallRadius: number,
  focal: number = FOCAL_DEPTH,
): number | null {
  const denom = focal + distance;
  if (denom <= focal * 0.2) return null;
  return (wallRadius * focal) / denom;
}

/** 0 at `viewDepth`, rising to 1 by `viewDepth * (1 - band)`: far things fade in, never pop. */
export function farFade(distance: number, viewDepth: number, band = 0.3): number {
  const t = (viewDepth - distance) / (viewDepth * band);
  return Math.min(1, Math.max(0, t));
}

/**
 * Canvas angle (radians, clockwise from +x since canvas y points down) of a point on the wall.
 * The player is always at the bottom (π/2); a world angle greater than the player's sits to the
 * player's left.
 */
export function screenAngle(worldAngle: number, playerAngle: number): number {
  return Math.PI / 2 + angleDelta(worldAngle, playerAngle);
}

export interface Point {
  x: number;
  y: number;
}

/** A point on the wall `distance` ahead at a world angle, or null when it is off behind. */
export function wallPoint(
  view: Viewport,
  worldAngle: number,
  playerAngle: number,
  distance: number,
  focal: number = FOCAL_DEPTH,
): Point | null {
  const r = projectRadius(distance, view.wallRadius, focal);
  if (r === null) return null;
  const a = screenAngle(worldAngle, playerAngle);
  return { x: view.cx + r * Math.cos(a), y: view.cy + r * Math.sin(a) };
}

/**
 * The solid part of a ring, as a clockwise canvas arc: it starts at one edge of the gap and goes
 * the long way round to the other, so the gap is left open.
 */
export function ringArc(
  gapCentre: number,
  gapWidth: number,
  playerAngle: number,
): { start: number; end: number } {
  const g = screenAngle(gapCentre, playerAngle);
  const half = Math.min(Math.PI, Math.max(0, gapWidth / 2));
  return { start: g + half, end: g - half + Math.PI * 2 };
}
