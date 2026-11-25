import {
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type RefObject,
} from 'react';

import { cx } from '../cx';
import styles from './PortalSpiral.module.css';

/** `rest`: a slow turn. `active`: faster, for hover or focus. A number is a multiple of rest. */
export type PortalSpiralSpeed = 'rest' | 'active' | number;

/** How many times faster than rest the `active` speed runs. */
export const PORTAL_ACTIVE_RATE = 4;

export interface PortalSpiralProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  /**
   * How fast it turns and pulls inward. Changing it eases from the current speed to the new one,
   * without a jump. Ignored under reduced motion, where the spiral is a still frame.
   */
  speed?: PortalSpiralSpeed;
}

// The drawing lives in a 200 x 200 box centred on 0,0. Every point is worked out once, here, from
// fixed numbers: server and browser draw the same markup.
const R = 100;
const round = (n: number) => Math.round(n * 100) / 100;

/** A logarithmic spiral arm from the rim to near the centre, `turns` times round. */
function spiralArm(phase: number, turns = 1.35, inner = 1.6, steps = 96): string {
  const sweep = turns * Math.PI * 2;
  const k = Math.log(R / inner) / sweep;
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * sweep;
    const r = R * Math.exp(-k * t);
    const a = phase + t;
    d += `${i === 0 ? 'M' : 'L'}${round(r * Math.cos(a))} ${round(r * Math.sin(a))}`;
  }
  return d;
}

/** A closed ring at the rim with a gentle wobble, like a growth ring rather than a compass circle. */
function growthRing(seed: number, steps = 120): string {
  let d = '';
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const wobble = 1 + 0.022 * Math.sin(3 * a + seed) + 0.012 * Math.sin(5 * a + seed * 2.3);
    const r = R * 0.98 * wobble;
    d += `${i === 0 ? 'M' : 'L'}${round(r * Math.cos(a))} ${round(r * Math.sin(a))}`;
  }
  return `${d}Z`;
}

const ARMS = 6;
const arms = Array.from({ length: ARMS }, (_, i) => ({
  d: spiralArm((i / ARMS) * Math.PI * 2),
  warm: i === 2,
}));

const FLOW = 7;
/** A ring's size `p` of the way down the tunnel; the same curve as the CSS keyframes. */
const recede = (p: number) => (1 - p) / (1 + 3 * p);

/**
 * Rings that travel from the rim to the centre on a loop, each a fraction of the loop behind the
 * last. `rest` is where each one sits in the still frame (reduced motion), on the same curve as
 * the moving rings, so the still frame has the same depth.
 */
const flow = Array.from({ length: FLOW }, (_, i) => {
  const progress = (i + 0.5) / FLOW;
  return {
    d: growthRing(i * 1.7),
    warm: i === 2,
    delay: round(-progress),
    rest: round(recede(progress)),
  };
});

/** Fixed rings for depth, closer together toward the centre. */
const depth = [0.82, 0.6, 0.43, 0.3, 0.2].map((scale) => round(R * scale));

/** Seconds from a computed CSS time, written in seconds or milliseconds. */
function seconds(value: string): number {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 0;
  return value.trim().endsWith('ms') ? n / 1000 : n;
}

function rateOf(speed: PortalSpiralSpeed): number {
  if (typeof speed === 'number') return Math.max(0, speed);
  return speed === 'active' ? PORTAL_ACTIVE_RATE : 1;
}

/**
 * Eases the playback rate of every CSS animation under `root` toward the rate `speed` asks for.
 * Changing the rate keeps each animation where it is, so the speed changes and the drawing does not
 * jump. Animations that start later (the styles arrive late, reduced motion is switched off) are
 * set to the current rate as they start. Does nothing where there are no animations (reduced
 * motion, the server, jsdom).
 */
function usePlaybackRate(root: RefObject<SVGSVGElement | null>, speed: PortalSpiralSpeed) {
  const target = rateOf(speed);
  const current = useRef(1);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof el.getAnimations !== 'function') return;
    const apply = (rate: number) => {
      current.current = rate;
      for (const animation of el.getAnimations({ subtree: true })) animation.playbackRate = rate;
    };
    const from = current.current;
    const ramp = seconds(getComputedStyle(el).getPropertyValue('--portal-ramp')) * 1000;
    const onStart = () => apply(current.current);
    el.addEventListener('animationstart', onStart);
    let frame = 0;
    if (ramp <= 0 || from === target) {
      apply(target);
    } else {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ramp);
        const eased = t * t * (3 - 2 * t);
        apply(from + (target - from) * eased);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('animationstart', onStart);
    };
  }, [root, target]);
}

/**
 * A spiral portal: growth rings pulled toward a bright centre while spiral arms turn slowly round
 * it. Teal lines with one warm arm and one warm ring, on a transparent background so it sits over
 * an image.
 *
 * It fills its container (100% wide and high) and stretches to the container's shape: a tall
 * doorway gives a tall elliptical tunnel, a square gives a circle. Lines stay 1px at any size. The
 * parent clips it to the opening (`clip-path`, or `overflow: hidden` with a radius); its edges
 * already fade out.
 *
 * Decoration only: hidden from assistive technology, nothing focusable. Under reduced motion it is
 * a still frame.
 */
export function PortalSpiral({ speed = 'rest', className, style, ...rest }: PortalSpiralProps) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();
  const coolId = `${id}-cool`;
  const warmId = `${id}-warm`;
  const coreId = `${id}-core`;
  usePlaybackRate(ref, speed);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`}
      preserveAspectRatio="none"
      fill="none"
      data-speed={String(speed)}
      className={cx(styles.portal, className)}
      style={style}
      {...rest}
    >
      <defs>
        {/* Arms brighten as they near the centre. */}
        <radialGradient id={coolId} gradientUnits="userSpaceOnUse" cx="0" cy="0" r={R}>
          <stop offset="0" className={styles.stopCool} stopOpacity={1} />
          <stop offset="0.5" className={styles.stopCool} stopOpacity={0.55} />
          <stop offset="1" className={styles.stopCool} stopOpacity={0.06} />
        </radialGradient>
        <radialGradient id={warmId} gradientUnits="userSpaceOnUse" cx="0" cy="0" r={R}>
          <stop offset="0" className={styles.stopWarm} stopOpacity={0.95} />
          <stop offset="0.6" className={styles.stopWarm} stopOpacity={0.6} />
          <stop offset="1" className={styles.stopWarm} stopOpacity={0.08} />
        </radialGradient>
        <radialGradient id={coreId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" className={styles.stopCool} stopOpacity={0.85} />
          <stop offset="0.2" className={styles.stopCool} stopOpacity={0.32} />
          <stop offset="1" className={styles.stopCool} stopOpacity={0} />
        </radialGradient>
      </defs>

      <ellipse rx={R * 0.5} ry={R * 0.5} fill={`url(#${coreId})`} />

      <g className={styles.depth}>
        {depth.map((r) => (
          <circle key={r} r={r} vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      <g className={styles.flow}>
        {flow.map((ring) => (
          <g
            key={ring.d}
            className={cx(styles.ring, ring.warm ? styles.warm : styles.cool)}
            style={{ '--delay': ring.delay, '--rest': ring.rest } as CSSProperties}
          >
            <path d={ring.d} className={styles.ringGlow} vectorEffect="non-scaling-stroke" />
            <path d={ring.d} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </g>

      <g className={styles.spin}>
        {arms.map((arm) => (
          <g key={arm.d} stroke={`url(#${arm.warm ? warmId : coolId})`}>
            <path d={arm.d} className={styles.armGlow} vectorEffect="non-scaling-stroke" />
            <path d={arm.d} className={styles.arm} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </g>

      <ellipse rx={1.4} ry={1.4} className={styles.dot} />
    </svg>
  );
}
