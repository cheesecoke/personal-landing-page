/**
 * Where things are on the portal render, in the pixels of the exported image (1600 by 1024). The
 * spiral and the thread are placed from these numbers, so they only fit that render: a new render
 * needs a new scene.
 *
 * The opening was measured from the export, not guessed: rays cast from the middle of the ring
 * stop at the first pixel brighter than the dark inside, and an axis-aligned ellipse is fitted to
 * those points (every point lies within 1.7% of it). The opening is very slightly taller than it
 * is wide.
 */
export interface PortalScene {
  width: number;
  height: number;
  /** The ring's inner opening: the dark hole the spiral fills. */
  opening: { cx: number; cy: number; rx: number; ry: number };
  /**
   * Where the thread plugs in: the toe of the power unit's foot, on the floor. The thread runs
   * along the floor at this height and ends here.
   */
  plug: readonly [x: number, y: number];
}

export const portalScene: PortalScene = {
  width: 1600,
  height: 1024,
  opening: { cx: 747.2, cy: 458.4, rx: 251.3, ry: 264.6 },
  plug: [58, 823.5],
};
