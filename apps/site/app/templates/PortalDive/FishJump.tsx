import { type RefObject, useEffect, useRef, useState } from 'react';

import s from './arrival.module.css';
import { type FishJumpOptions, type FishJumps, startFishJumps, WATER } from './pondFish';
import { useMotionReduced } from './useMotionReduced';

/** The render the numbers are in (as `scene.ts`). */
const RENDER = { width: 2688, height: 1520 };

export interface FishJumpProps extends FishJumpOptions {
  /** The garden is on screen. Garden time (and so the jumps) only runs while it is. */
  shown: boolean;
  /** The scene's still, for the water's colour where a fish jumps. */
  img: RefObject<HTMLImageElement | null>;
  /** When the tall image is used (`scene.tallMedia`). */
  tallMedia: string;
}

/** The water's average colour around a render point, read from the still. */
function sampler(img: RefObject<HTMLImageElement | null>) {
  let ctx: CanvasRenderingContext2D | null = null;
  return (x: number, y: number): [number, number, number] | null => {
    const el = img.current;
    if (!el || !el.complete || el.naturalHeight === 0) return null;
    try {
      ctx ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      const k = el.naturalHeight / RENDER.height;
      ctx.canvas.width = 1;
      ctx.canvas.height = 1;
      ctx.drawImage(el, (x - 12) * k, (y - 4) * k, 24 * k, 8 * k, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!];
    } catch {
      return null;
    }
  };
}

/**
 * A far fish jump, now and then (first after 45 to 75 s, then every 2 to 4 minutes): a small
 * canvas over the open middle of the pond, under the portal and everything else. Not there with
 * reduced motion; it pauses while the garden is off screen or the tab is hidden.
 */
export function FishJump({ shown, img, tallMedia, firstJumpS, random }: FishJumpProps) {
  const reduced = useMotionReduced();
  const canvas = useRef<HTMLCanvasElement>(null);
  const jumps = useRef<FishJumps | null>(null);
  const [started, setStarted] = useState(false);
  if (shown && !started && !reduced) setStarted(true);
  const options = useRef({ firstJumpS, random, tallMedia });

  useEffect(() => {
    const el = canvas.current;
    if (!started || reduced || !el) return;
    const { tallMedia: query, ...rest } = options.current;
    const tall = () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
    const j = startFishJumps(el, sampler(img), tall, rest);
    jumps.current = j;
    return () => {
      j.dispose();
      jumps.current = null;
    };
  }, [started, reduced, img]);

  useEffect(() => {
    const j = jumps.current;
    if (!j) return;
    const sync = () => j.setActive(shown && document.visibilityState !== 'hidden');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      j.setActive(false);
    };
  }, [shown, started, reduced]);

  if (reduced || !started) return null;
  return (
    <canvas
      ref={canvas}
      className={s.fish}
      aria-hidden="true"
      style={{
        left: `${(WATER.x / RENDER.width) * 100}%`,
        top: `${(WATER.y / RENDER.height) * 100}%`,
        width: `${(WATER.width / RENDER.width) * 100}%`,
        height: `${(WATER.height / RENDER.height) * 100}%`,
      }}
    />
  );
}
