import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../cx';

/**
 * `sm`: buttons and small text links. `md`: index rows and lead links. `lg`: the hand-off link.
 * `lgRound` is the Home hand-off arrow (round caps), `lgLow` the project-page one.
 */
export type ArrowSize = 'sm' | 'md' | 'lg' | 'lgRound' | 'lgLow';

interface Shape {
  width: number;
  height: number;
  d: string;
  strokeWidth: number;
  round?: boolean;
}

// Drawn on the boards at these exact sizes; they are separate drawings, not one scaled path.
const shapes: Record<ArrowSize, Shape> = {
  sm: { width: 14, height: 14, d: 'M2 7h10M8 3l4 4-4 4', strokeWidth: 1.4, round: true },
  md: { width: 22, height: 12, d: 'M0 6h21M16 1l5 5-5 5', strokeWidth: 1 },
  lg: { width: 44, height: 20, d: 'M0 10h42M33 1l9 9-9 9', strokeWidth: 1 },
  lgRound: { width: 44, height: 20, d: 'M1 10h40M33 2l8 8-8 8', strokeWidth: 1.2, round: true },
  lgLow: { width: 44, height: 16, d: 'M0 8h42M35 1l7 7-7 7', strokeWidth: 1.2 },
};

export interface ArrowIconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  size?: ArrowSize;
}

/** A thin right-pointing arrow in the current colour. Decoration: hidden from assistive tech. */
export function ArrowIcon({ size = 'sm', className, ...rest }: ArrowIconProps) {
  const shape = shapes[size];
  return (
    <svg
      aria-hidden="true"
      width={shape.width}
      height={shape.height}
      viewBox={`0 0 ${shape.width} ${shape.height}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={shape.strokeWidth}
      strokeLinecap={shape.round ? 'round' : undefined}
      strokeLinejoin={shape.round ? 'round' : undefined}
      className={cx('block flex-none', className)}
      {...rest}
    >
      <path d={shape.d} />
    </svg>
  );
}
