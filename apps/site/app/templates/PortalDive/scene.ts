/**
 * The garden a win arrives in: the image and where things are on it. Only the game's lazy chunk
 * imports this file, so the image (fingerprinted by the build) is never named on the Contact page.
 *
 * Every number is in the pixels of the full render (2688 by 1520). The portal button and its
 * spiral are placed from these numbers, so they only fit this render: a new render needs new ones.
 *
 * The opening was measured from the render, not guessed: rays cast every 2 degrees from inside the
 * ring stop at the first pair of pixels that are either dark (the metal, luminance under 105) or
 * clearly orange (the lit rim, red minus blue over 60); an axis-aligned ellipse is fitted to those
 * 180 points by least squares and the fit repeated from its own centre until it settled. Half the
 * points lie within 2.0% of the ellipse and nine in ten within 3.9%. The opening is a little taller
 * than it is wide. The ring's outer edge was read off an overlay of the render, to the nearest
 * few pixels; it only keeps the win card clear of the ring and sizes the glow.
 *
 * The video is the same render brought to life (a locked camera: rigid things stay within half a
 * pixel of the stills in every frame), cut into a seamless 8.8 s loop, so the same numbers place
 * the portal on it. Like the images, it is only named in this chunk.
 */
import tallAvif from './scene/garden-tall.avif';
import tallMp4 from './scene/garden-tall.mp4';
import tallWebp from './scene/garden-tall.webp';
import wideAvif from './scene/garden-wide.avif';
import wideMp4 from './scene/garden-wide.mp4';
import wideWebp from './scene/garden-wide.webp';

export interface Ellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface SceneImage {
  avif: string;
  webp: string;
}

/** A clip of the scene: H.264 MP4 (every browser), and a smaller WebM where one helps. */
export interface SceneClip {
  mp4: string;
  webm?: string;
}

export interface GardenScene {
  /** The full render. */
  width: number;
  height: number;
  /** The ring's inner opening: the lit hole the spiral fills and the button covers. */
  opening: Ellipse;
  /** The ring's outer edge. */
  ring: Ellipse;
  /** The whole render, for screens wider than tall. */
  wide: SceneImage;
  /**
   * The left half of the render at full height, for tall screens (`tallMedia`). A tall screen only
   * ever shows part of the left half (the scene is placed so the portal stays in view), so it gets
   * a smaller file at a higher resolution. It starts at the render's top-left corner, so every
   * number above holds for it too; `tallWidth` is how wide it is.
   */
  tall: SceneImage;
  tallWidth: number;
  /** When the tall image is used. The scene's CSS uses the same query. */
  tallMedia: string;
  /**
   * The scene moving, framed exactly as the stills (`wide` as the whole render, `tall` as its left
   * half), with a locked camera, looping seamlessly. Without it, the still is all there is.
   */
  video?: { wide: SceneClip; tall: SceneClip };
}

export const gardenScene: GardenScene = {
  width: 2688,
  height: 1520,
  opening: { cx: 373.3, cy: 476.6, rx: 70.9, ry: 80.9 },
  ring: { cx: 371, cy: 474, rx: 115, ry: 118 },
  wide: { avif: wideAvif, webp: wideWebp },
  tall: { avif: tallAvif, webp: tallWebp },
  tallWidth: 1344,
  tallMedia: '(aspect-ratio <= 2/3)',
  video: { wide: { mp4: wideMp4 }, tall: { mp4: tallMp4 } },
};

/** The scene's numbers as the custom properties `arrival.module.css` reads, as fractions. */
export function sceneVars(scene: GardenScene): Record<`--${string}`, number> {
  const { width: w, height: h, opening: o, ring: r } = scene;
  return {
    '--scene-ratio': w / h,
    '--tall-share': scene.tallWidth / w,
    '--open-x': o.cx / w,
    '--open-y': o.cy / h,
    '--open-w': (2 * o.rx) / w,
    '--open-h': (2 * o.ry) / h,
    '--ring-w': (2 * r.rx) / w,
    '--ring-h': (2 * r.ry) / h,
    '--ring-left': (r.cx - r.rx) / w,
    '--ring-right': (r.cx + r.rx) / w,
    '--ring-bottom': (r.cy + r.ry) / h,
  };
}
