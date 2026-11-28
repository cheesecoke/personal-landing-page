import { useEffect, useRef, useState } from 'react';

import s from './arrival.module.css';
import { BAND, type FarFlock as Flock, type FarFlockOptions, startFarFlock } from './flockSky';
import { useMotionReduced } from './useMotionReduced';

/** The render the band's numbers are in (as `scene.ts`). */
const RENDER = { width: 2688, height: 1520 };

export interface FarFlockProps extends FarFlockOptions {
  /** The garden is on screen. Garden time (and so the flock) only runs while it is. */
  shown: boolean;
}

/**
 * The far flock, over the scene and under everything else: a small canvas over the open sky where,
 * once a minute or so, a few very distant birds drift across. Not there with reduced motion; it
 * pauses while the garden is off screen or the tab is hidden.
 */
export function FarFlock({ shown, firstPassS, random }: FarFlockProps) {
  const reduced = useMotionReduced();
  const canvas = useRef<HTMLCanvasElement>(null);
  const flock = useRef<Flock | null>(null);
  const [started, setStarted] = useState(false);
  if (shown && !started && !reduced) setStarted(true);
  const options = useRef({ firstPassS, random });

  useEffect(() => {
    const el = canvas.current;
    if (!started || reduced || !el) return;
    const f = startFarFlock(el, options.current);
    flock.current = f;
    return () => {
      f.dispose();
      flock.current = null;
    };
  }, [started, reduced]);

  useEffect(() => {
    const f = flock.current;
    if (!f) return;
    const sync = () => f.setActive(shown && document.visibilityState !== 'hidden');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      f.setActive(false);
    };
  }, [shown, started, reduced]);

  if (reduced || !started) return null;
  return (
    <canvas
      ref={canvas}
      className={s.flock}
      aria-hidden="true"
      style={{
        left: `${(BAND.x / RENDER.width) * 100}%`,
        top: `${(BAND.y / RENDER.height) * 100}%`,
        width: `${(BAND.width / RENDER.width) * 100}%`,
        height: `${(BAND.height / RENDER.height) * 100}%`,
      }}
    />
  );
}
