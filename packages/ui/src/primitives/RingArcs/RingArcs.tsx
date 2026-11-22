import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../cx';

export type RingArcTone = 'hairline' | 'tick' | 'signalDim' | 'signal';

export interface RingArc {
  /** Horizontal and vertical radius, in the drawing's own units. */
  rx: number;
  ry: number;
  tone?: RingArcTone;
  /** An SVG dash pattern (`"4 8"`) for a dashed arc. */
  dash?: string;
  opacity?: number;
}

const tones: Record<RingArcTone, string> = {
  hairline: 'stroke-hairline',
  tick: 'stroke-tick',
  signalDim: 'stroke-signal-dim',
  signal: 'stroke-signal',
};

/** Three rings, the outer one lit: the arcs on the design system board. */
export const defaultRingArcs: RingArc[] = [
  { rx: 26, ry: 12, tone: 'tick' },
  { rx: 46, ry: 21, tone: 'tick' },
  { rx: 66, ry: 30, tone: 'signalDim' },
];

export interface RingArcsProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  /** The arcs, inner to outer. Light one of them at most. */
  rings?: RingArc[];
  /** Widest it is drawn, in px. It shrinks with its container and keeps its shape. */
  maxWidth?: number;
}

/**
 * Thin concentric ellipse arcs: quiet decoration near an object, never a page background.
 * Strokes stay 1px at any size. Hidden from assistive technology.
 */
export function RingArcs({
  rings = defaultRingArcs,
  maxWidth,
  className,
  style,
  ...rest
}: RingArcsProps) {
  const rx = Math.max(...rings.map((ring) => ring.rx)) + 1;
  const ry = Math.max(...rings.map((ring) => ring.ry)) + 1;
  return (
    <svg
      aria-hidden="true"
      viewBox={`${-rx} ${-ry} ${rx * 2} ${ry * 2}`}
      fill="none"
      strokeWidth={1}
      className={cx('block h-auto w-full', className)}
      style={{ maxWidth: maxWidth ?? rx * 2, ...style }}
      {...rest}
    >
      {rings.map((ring) => (
        <ellipse
          key={`${ring.rx}-${ring.ry}`}
          rx={ring.rx}
          ry={ring.ry}
          className={tones[ring.tone ?? 'tick']}
          strokeDasharray={ring.dash}
          strokeOpacity={ring.opacity}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
