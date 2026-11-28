import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type Ref,
} from 'react';

import type { PortalSpiralProps } from '@cwc/ui';

import s from './arrival.module.css';
import type { GardenScene } from './scene';

/** `bloom`: the full arrival out of the tunnel's light. `fade`: a plain cross-fade. */
export type Arrival = 'bloom' | 'fade';

export interface GardenProps {
  scene: GardenScene;
  /** The image's text alternative. */
  alt: string;
  /** The portal button's name. */
  portalLabel: string;
  /** The spiral drawn in the ring's opening (`PortalSpiral`). Without it, only the glow. */
  spiral?: ComponentType<PortalSpiralProps>;
  /** On screen. Until then the image loads unseen and nothing in it can be reached. */
  shown: boolean;
  arrival: Arrival;
  /** Where the bloom starts (the tunnel's vanishing point), in px from the scene's top-left. */
  flare?: { x: number; y: number } | null;
  /** The portal was pressed: leave the game. */
  onPortal: () => void;
  /** The image has loaded and decoded. */
  onReady: () => void;
  /** The image could not load. */
  onFail: () => void;
  /** The scene's region, which takes focus when the reader sits down. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * The garden a win arrives in: the image covering the overlay (the tall half on tall screens), and
 * the ring in it as a real button that leaves the game. The ring's opening holds a small spiral,
 * faint and slow at rest, which brightens and speeds up (with a glow round the ring) on hover and
 * focus. Mounted only once the run starts, so the image is fetched after Start and never before.
 */
export function Garden({
  scene,
  alt,
  portalLabel,
  spiral: Spiral,
  shown,
  arrival,
  flare,
  onPortal,
  onReady,
  onFail,
  ref,
}: GardenProps) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const active = hover || focus;
  const done = useRef(false);
  const handlers = useRef({ onReady, onFail });
  useEffect(() => {
    handlers.current = { onReady, onFail };
  });

  const ready = (img: HTMLImageElement) => {
    if (done.current) return;
    done.current = true;
    // Decoded before it counts as ready, so the arrival never shows a half-painted image.
    const decoded = typeof img.decode === 'function' ? img.decode() : Promise.resolve();
    decoded.catch(() => {}).then(() => handlers.current.onReady());
  };
  const fail = () => {
    if (done.current) return;
    done.current = true;
    handlers.current.onFail();
  };
  // An image that finished before React listened (from the cache) still counts.
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    if (img.naturalWidth > 0) ready(img);
    else if (img.currentSrc) fail();
  }, []);

  const flareVars = flare
    ? ({ '--flare-x': `${flare.x}px`, '--flare-y': `${flare.y}px` } as CSSProperties)
    : undefined;

  return (
    <>
      <div
        ref={ref}
        tabIndex={-1}
        className={s.scene}
        data-garden=""
        data-shown={shown ? '' : undefined}
        data-arrival={arrival}
        inert={!shown}
        style={flareVars}
      >
        <div className={s.lens}>
          <div className={s.frame}>
            <picture>
              <source media={scene.tallMedia} type="image/avif" srcSet={scene.tall.avif} />
              <source media={scene.tallMedia} type="image/webp" srcSet={scene.tall.webp} />
              <source type="image/avif" srcSet={scene.wide.avif} />
              <img
                ref={imgRef}
                className={s.image}
                src={scene.wide.webp}
                alt={alt}
                decoding="async"
                draggable={false}
                onLoad={(event) => ready(event.currentTarget)}
                onError={fail}
              />
            </picture>
            <button
              type="button"
              className={s.portal}
              aria-label={portalLabel}
              data-garden-portal=""
              data-active={active ? '' : undefined}
              onClick={onPortal}
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
              onFocus={(event) => setFocus(event.currentTarget.matches(':focus-visible'))}
              onBlur={() => setFocus(false)}
            >
              <span className={s.halo} aria-hidden="true" />
              <span className={s.opening} aria-hidden="true">
                <span className={s.tint} />
                {Spiral ? <Spiral className={s.spiral} speed={active ? 'active' : 'rest'} /> : null}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div
        className={s.flare}
        aria-hidden="true"
        data-play={shown && arrival === 'bloom' ? '' : undefined}
        style={flareVars}
      >
        <div className={s.bloom} />
      </div>
    </>
  );
}
