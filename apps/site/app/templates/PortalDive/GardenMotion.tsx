import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

import s from './arrival.module.css';
import { type ContextFactory, type Live, type MotionState, startGardenMotion } from './gardenLive';
import masksUrl from './scene/garden-masks.webp';

export interface GardenMotionOptions {
  /** Makes the WebGL2 context. Default: the browser's. Stories pass one that fails. */
  getContext?: ContextFactory;
  /** The masks' address. Default: the real ones. */
  masks?: string;
  /** Called on every change of state (stories and tests). */
  onState?: (state: MotionState) => void;
}

export interface GardenMotionProps extends GardenMotionOptions {
  /** The scene's image, already decoded (`ready`). */
  img: RefObject<HTMLImageElement | null>;
  ready: boolean;
  /** The garden is on screen: the loop only runs while it is. */
  active: boolean;
}

const REDUCE = '(prefers-reduced-motion: reduce)';
const media = () => (typeof window.matchMedia === 'function' ? window.matchMedia(REDUCE) : null);
/** The OS setting, or `[data-motion="reduce"]` on the root (the site's switch). */
function subscribeMotion(onChange: () => void) {
  const mq = media();
  mq?.addEventListener('change', onChange);
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => {
    mq?.removeEventListener('change', onChange);
    mo.disconnect();
  };
}
const motionReduced = () =>
  document.documentElement.dataset.motion === 'reduce' || !!media()?.matches;

/**
 * The garden, alive: a canvas exactly over the scene's image that draws it through the motion
 * shader (water, breeze, pads, light, mist, far birds). It is only a layer on top: with reduced
 * motion it is not there at all, and without WebGL2, before its first frame, or after the context
 * is lost it is invisible and the plain image shows, as before.
 */
export function GardenMotion({
  img,
  ready,
  active,
  getContext,
  masks = masksUrl,
  onState,
}: GardenMotionProps) {
  const reduced = useSyncExternalStore(subscribeMotion, motionReduced, () => true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef<Live | null>(null);
  const options = useRef({ getContext, masks, onState });
  useEffect(() => {
    options.current = { getContext, masks, onState };
  });

  // Nothing starts (no context, no masks fetched) until the garden is first on screen: during a
  // run the image is only loading in the background. After that, it pauses while off screen.
  const [shownOnce, setShownOnce] = useState(false);
  if (active && ready && !shownOnce) setShownOnce(true);
  const on = ready && !reduced && shownOnce;
  useEffect(() => {
    const el = canvas.current;
    const image = img.current;
    if (!on || !el || !image) return;
    const l = startGardenMotion(el, image, {
      masks: options.current.masks,
      getContext: options.current.getContext,
      onState: (state) => options.current.onState?.(state),
    });
    live.current = l;
    return () => {
      l.dispose();
      if (live.current === l) live.current = null;
      delete el.dataset.gardenDrawn;
    };
  }, [on, img]);

  useEffect(() => {
    live.current?.setActive(on && active);
  }, [on, active]);

  if (reduced) return null;
  return <canvas ref={canvas} className={s.motion} aria-hidden="true" data-garden-motion="off" />;
}
