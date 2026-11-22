import type { ComponentPropsWithoutRef, CSSProperties } from 'react';

import { cx } from '../cx';

/** `lockup`: drawn for small sizes, beside the name. `mark`: drawn for large sizes, on its own. */
export type RingMarkDetail = 'lockup' | 'mark';

interface Drawing {
  box: number;
  outer: { r: number; width: number };
  inner: { r: number; width: number };
  arcWidth: number;
  dot: number;
}

// Two drawings from the ring mark board. The small one has heavier strokes; it is not a scale of
// the large one.
const drawings: Record<RingMarkDetail, Drawing> = {
  lockup: {
    box: 26,
    outer: { r: 11.5, width: 1.2 },
    inner: { r: 7, width: 1.1 },
    arcWidth: 1.8,
    dot: 2.1,
  },
  mark: {
    box: 120,
    outer: { r: 53, width: 2 },
    inner: { r: 32.3, width: 1.7 },
    arcWidth: 3.6,
    dot: 7.4,
  },
};

export interface RingMarkProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  /** Width and height in px. */
  size?: number;
  /** Which drawing to use. Defaults to `lockup` under 64px and `mark` from 64px up. */
  detail?: RingMarkDetail;
  /** How much of the ring the Signal arc covers at rest, as a percentage. */
  arc?: number;
  /**
   * How much it covers while the mark, or an ancestor with the class `group/mark` (the home
   * link), is hovered or focused. Set it equal to `arc` for a mark that never moves.
   */
  arcActive?: number;
  /** An accessible name. Without one the mark is decoration and hidden from assistive tech. */
  title?: string;
}

/**
 * The ring mark: a centre dot, a wood ring, and a growth arc in Signal. On hover or focus the arc
 * grows from 25 to 50. Under reduced motion it stays still.
 */
export function RingMark({
  size = 24,
  detail,
  arc = 25,
  arcActive = 50,
  title,
  className,
  style,
  ...rest
}: RingMarkProps) {
  const drawing = drawings[detail ?? (size >= 64 ? 'mark' : 'lockup')];
  const centre = drawing.box / 2;
  const arcs = { '--arc': arc, '--arc-active': arcActive } as CSSProperties;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${drawing.box} ${drawing.box}`}
      fill="none"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      className={cx('group/ring block flex-none', className)}
      style={{ ...arcs, ...style }}
      {...rest}
    >
      <circle
        cx={centre}
        cy={centre}
        r={drawing.outer.r}
        className="stroke-cedar"
        strokeOpacity={0.65}
        strokeWidth={drawing.outer.width}
      />
      <circle
        cx={centre}
        cy={centre}
        r={drawing.inner.r}
        className="stroke-hinoki"
        strokeOpacity={0.55}
        strokeWidth={drawing.inner.width}
      />
      <circle
        data-ring-arc=""
        cx={centre}
        cy={centre}
        r={drawing.outer.r}
        pathLength={100}
        transform={`rotate(-90 ${centre} ${centre})`}
        strokeWidth={drawing.arcWidth}
        strokeLinecap="round"
        className={cx(
          'stroke-signal [stroke-dasharray:var(--arc)_100]',
          'motion-ok:transition-[stroke-dasharray] motion-ok:duration-mark-arc motion-ok:ease-standard',
          'motion-ok:group-hover/ring:[stroke-dasharray:var(--arc-active)_100]',
          'motion-ok:group-hover/mark:[stroke-dasharray:var(--arc-active)_100]',
          'motion-ok:group-focus-visible/mark:[stroke-dasharray:var(--arc-active)_100]',
        )}
      />
      <circle cx={centre} cy={centre} r={drawing.dot} className="fill-bone" />
    </svg>
  );
}
