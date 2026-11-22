import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cx } from '../../../primitives';
import { useReducedMotion } from '../internal/useReducedMotion';
import styles from './Portrait.module.css';
import {
  PORTRAIT_CLIPS,
  PortraitController,
  type PortraitClipName,
  type PortraitGlanceTiming,
  type PortraitLookName,
} from './portraitController';

export interface PortraitStill {
  src: string;
  width: number;
  height: number;
}

/** The three clips for one look. Every clip starts and ends on the look's still pose. */
export interface PortraitClips {
  /** The idle loop. */
  idle: string;
  /** The look down at the switch and back: the same frames forwards, then in reverse. */
  glance: string;
  glanceTiming: PortraitGlanceTiming;
  /** The transformation from this look into the other one. */
  transform: string;
}

export interface PortraitLook {
  /** The still: what shows before any video loads, and all that shows with reduced motion. */
  still: PortraitStill;
  /** What the portrait shows in this look, for assistive technology. */
  alt: string;
  /** Leave out for a portrait that is stills only. */
  clips?: PortraitClips;
}

export interface PortraitProps {
  normal: PortraitLook;
  cyber: PortraitLook;
  /** The switch's name ("Cyberware"). */
  toggleLabel: ReactNode;
  /** The words after it for on and off ("On", "Off"). */
  onLabel: ReactNode;
  offLabel: ReactNode;
  caption?: ReactNode;
  /** Start with the cyberware on. */
  defaultCyber?: boolean;
  /** How much faster the eyes come back up when the switch is clicked mid-glance. Default 2. */
  clickRate?: number;
  /** How far outside the viewport, in px, the clips start to load. Default 200. */
  loadMargin?: number;
  className?: string;
}

/**
 * The portrait with a Cyberware switch. Hovering the switch makes him glance at it; clicking it
 * plays the transformation. The clips load only when the portrait comes near the viewport, over
 * the stills. With reduced motion there is no video: the switch swaps the stills.
 */
export function Portrait({
  normal,
  cyber,
  toggleLabel,
  onLabel,
  offLabel,
  caption,
  defaultCyber = false,
  clickRate = 2,
  loadMargin = 200,
  className,
}: PortraitProps) {
  const reduced = useReducedMotion();
  const [look, setLook] = useState<PortraitLookName>(defaultCyber ? 'cyber' : 'normal');
  const [near, setNear] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const clipRefs = useRef<Partial<Record<PortraitClipName, HTMLVideoElement | null>>>({});
  const controllerRef = useRef<PortraitController | null>(null);
  // The look the controller starts from when the clips mount (after reduced motion is lifted).
  const lookRef = useRef(look);
  useEffect(() => {
    lookRef.current = look;
  }, [look]);

  const sources: Record<PortraitClipName, string> | null =
    normal.clips && cyber.clips
      ? {
          normalIdle: normal.clips.idle,
          cyberIdle: cyber.clips.idle,
          normalGlance: normal.clips.glance,
          cyberGlance: cyber.clips.glance,
          toCyber: normal.clips.transform,
          toNormal: cyber.clips.transform,
        }
      : null;
  const normalTiming = normal.clips?.glanceTiming;
  const cyberTiming = cyber.clips?.glanceTiming;
  const motion = Boolean(sources) && !reduced && near;

  // Load the clips the first time the portrait comes near the viewport.
  useEffect(() => {
    const frame = frameRef.current;
    // Without IntersectionObserver the portrait stays on its stills.
    if (!frame || near || typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: `${loadMargin}px` },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [near, loadMargin]);

  // The controller lives while the clips are mounted. It plays on screen and pauses off it.
  useEffect(() => {
    if (!motion || !normalTiming || !cyberTiming) return;
    const controller = new PortraitController({
      clip: (name) => clipRefs.current[name] ?? null,
      timing: { normal: normalTiming, cyber: cyberTiming },
      clickRate,
      onLook: setLook,
      look: lookRef.current,
    });
    controllerRef.current = controller;
    const onVisibility = () => controller.run();
    document.addEventListener('visibilitychange', onVisibility);
    const frame = frameRef.current;
    let observer: IntersectionObserver | null = null;
    if (frame && typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => controller.setVisible(entries[entries.length - 1]!.isIntersecting),
        { threshold: 0.05 },
      );
      observer.observe(frame);
    }
    controller.run();
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
      controller.destroy();
      controllerRef.current = null;
    };
  }, [motion, normalTiming, cyberTiming, clickRate]);

  const toggle = () => {
    if (controllerRef.current) controllerRef.current.toggle();
    else setLook((value) => (value === 'normal' ? 'cyber' : 'normal'));
  };
  const enter = () => controllerRef.current?.enter();
  const leave = () => controllerRef.current?.leave();

  const on = look === 'cyber';
  return (
    <figure className={cx(styles.figure, className)}>
      <div
        ref={frameRef}
        className={styles.frame}
        data-cyber={on ? 'on' : 'off'}
        data-still={motion ? 'off' : 'on'}
      >
        <div role="img" aria-label={on ? cyber.alt : normal.alt} className={styles.stage}>
          <img
            className={cx(styles.layer, styles.hero)}
            src={normal.still.src}
            width={normal.still.width}
            height={normal.still.height}
            alt=""
            draggable={false}
            decoding="async"
            loading="lazy"
          />
          <img
            className={cx(styles.layer, styles.cyber)}
            src={cyber.still.src}
            width={cyber.still.width}
            height={cyber.still.height}
            alt=""
            draggable={false}
            decoding="async"
            loading="lazy"
          />
          {motion && sources
            ? PORTRAIT_CLIPS.map((name) => (
                <video
                  key={name}
                  ref={(element) => {
                    clipRefs.current[name] = element;
                  }}
                  data-clip={name}
                  className={cx(styles.layer, styles.video)}
                  src={sources[name]}
                  poster={
                    (name.startsWith('cyber') || name === 'toNormal' ? cyber : normal).still.src
                  }
                  preload="auto"
                  muted
                  playsInline
                  aria-hidden="true"
                />
              ))
            : null}
        </div>
        <div aria-hidden="true" className={styles.shade} />
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={on}
          onClick={toggle}
          onPointerEnter={enter}
          onPointerLeave={leave}
          onFocus={enter}
          onBlur={leave}
        >
          <span aria-hidden="true" className={styles.node} />
          <span>{toggleLabel}</span>
          <span aria-hidden="true" className={styles.state}>
            {on ? onLabel : offLabel}
          </span>
        </button>
      </div>
      {caption ? (
        <figcaption className={cx('type-label', styles.caption)}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}
