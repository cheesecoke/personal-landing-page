/**
 * The AR overlay's geometry, in the pixels of the stump renders it is drawn over. It comes from
 * the render's projected ring data, so it only fits those images: a new render needs a new scene.
 */

export type ScenePoint = readonly [x: number, y: number];

export interface SceneEllipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/** A project node: it floats at `top`, on a stem that rises from `base` on the cut face. */
export interface SceneNode {
  x: number;
  base: number;
  top: number;
}

/** A ring callout: one straight line from a ring on the cut face out into the air. */
export interface SceneRing {
  source: ScenePoint;
  end: ScenePoint;
  /** Where the line ends when the frame cuts the image's right side (900 to 1299 wide). */
  narrowEnd?: ScenePoint;
}

export interface StumpScene {
  wide: {
    width: number;
    height: number;
    /** The plane the project nodes hover on. */
    plane: SceneEllipse;
    nodes: readonly SceneNode[];
    /** Wires between nodes, by node index, with the curve's control point. */
    wires: readonly { from: number; to: number; control: ScenePoint; pulse?: boolean }[];
    rings: readonly SceneRing[];
    /** The "not yet grown" mark: a dashed line out to a small wireframe. Shown from 1180 wide. */
    sprout?: {
      from: ScenePoint;
      to: ScenePoint;
      outline: string;
      facets: string;
      shadow: SceneEllipse;
    };
  };
  phone: {
    width: number;
    height: number;
    /** The band of the phone render that shows: `y` and `height` in image pixels. */
    crop: { y: number; height: number };
    plane: SceneEllipse;
    nodes: readonly SceneNode[];
    /** Ring marks on the cut face; they pair with the wide rings by index. */
    rings: readonly ScenePoint[];
  };
}

/** The scene for the hero renders on the board: 2400 by 1500 wide, 1170 by 1400 phone. */
export const stumpScene: StumpScene = {
  wide: {
    width: 2400,
    height: 1500,
    plane: { cx: 1625, cy: 492, rx: 345, ry: 92 },
    nodes: [
      { x: 1452.5, base: 632.3, top: 412.3 },
      { x: 1770.8, base: 667.3, top: 408.6 },
      { x: 1907.6, base: 601.7, top: 544.8 },
      { x: 1291.8, base: 645.2, top: 515.8 },
    ],
    wires: [
      { from: 0, to: 1, control: [1611.7, 340.5], pulse: true },
      { from: 1, to: 2, control: [1839.2, 416.7] },
    ],
    rings: [
      { source: [1261.1, 736.9], end: [1130, 612] },
      { source: [1882.5, 741.5], end: [2108, 672], narrowEnd: [2110, 705] },
    ],
    sprout: {
      from: [1954.8, 801.8],
      to: [2225, 742],
      outline: 'M2225 688.6 L2247.5 700.3 L2247.5 723.7 L2225 735.4 L2202.5 723.7 L2202.5 700.3 Z',
      facets:
        'M2225 688.6 L2247.5 723.7 L2202.5 723.7 Z M2225 715.9 L2247.5 700.3 M2225 715.9 L2225 735.4 M2225 715.9 L2202.5 700.3',
      shadow: { cx: 2225, cy: 726.3, rx: 39, ry: 10.9 },
    },
  },
  phone: {
    width: 1170,
    height: 1400,
    crop: { y: 537, height: 760 },
    plane: { cx: 572, cy: 640, rx: 250, ry: 66 },
    nodes: [
      { x: 447, base: 743.7, top: 582.8 },
      { x: 677.7, base: 757.4, top: 580.2 },
      { x: 776.8, base: 710.8, top: 677.9 },
      { x: 330.5, base: 759.3, top: 657.1 },
    ],
    rings: [
      [318.3, 815.2],
      [764.7, 820.5],
    ],
  },
};
