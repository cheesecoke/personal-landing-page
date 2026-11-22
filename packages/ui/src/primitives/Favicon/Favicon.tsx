import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../cx';

export type FaviconSize = 16 | 32 | 64;

interface Drawing {
  radius: number;
  /** The mark's box inside the tile, and the units it is drawn in. */
  box: number;
  units: number;
  outer: { r: number; width: number; opacity?: number };
  inner?: { r: number; width: number; opacity: number };
  arcWidth: number;
  dot: number;
}

// The three drawings on the ring mark board. Each size is drawn for its pixels: the 16px one
// drops the inner ring.
const drawings: Record<FaviconSize, Drawing> = {
  64: {
    radius: 14,
    box: 48,
    units: 26,
    outer: { r: 11.2, width: 1.3, opacity: 0.75 },
    inner: { r: 6.8, width: 1.2, opacity: 0.6 },
    arcWidth: 2,
    dot: 2.3,
  },
  32: {
    radius: 7,
    box: 24,
    units: 24,
    outer: { r: 10, width: 1.6, opacity: 0.85 },
    inner: { r: 5.5, width: 1.4, opacity: 0.7 },
    arcWidth: 2.2,
    dot: 2.2,
  },
  16: {
    radius: 3.5,
    box: 14,
    units: 14,
    outer: { r: 5, width: 1.5 },
    arcWidth: 1.8,
    dot: 1.6,
  },
};

/**
 * The files in the site's `public` folder, as `<link>` descriptors for the document head
 * (React Router's `links` export takes this shape).
 */
export const faviconLinks = [
  { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  { rel: 'manifest', href: '/site.webmanifest' },
] as const;

export interface FaviconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  size?: FaviconSize;
}

/**
 * The favicon as it is drawn at 16, 32 and 64px: the ring mark on a Surface tile. This is the
 * reference drawing for Storybook; browsers use the static files in the site's `public` folder.
 */
export function Favicon({ size = 32, className, ...rest }: FaviconProps) {
  const drawing = drawings[size];
  const offset = (size - drawing.box) / 2;
  const centre = drawing.units / 2;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={cx('block flex-none', className)}
      {...rest}
    >
      <rect
        x={0.5}
        y={0.5}
        width={size - 1}
        height={size - 1}
        rx={drawing.radius - 0.5}
        className="fill-surface stroke-hairline"
      />
      <g transform={`translate(${offset} ${offset}) scale(${drawing.box / drawing.units})`}>
        <circle
          cx={centre}
          cy={centre}
          r={drawing.outer.r}
          className="stroke-cedar"
          strokeOpacity={drawing.outer.opacity}
          strokeWidth={drawing.outer.width}
        />
        {drawing.inner ? (
          <circle
            cx={centre}
            cy={centre}
            r={drawing.inner.r}
            className="stroke-hinoki"
            strokeOpacity={drawing.inner.opacity}
            strokeWidth={drawing.inner.width}
          />
        ) : null}
        <circle
          cx={centre}
          cy={centre}
          r={drawing.outer.r}
          pathLength={100}
          strokeDasharray="25 100"
          transform={`rotate(-90 ${centre} ${centre})`}
          className="stroke-signal"
          strokeWidth={drawing.arcWidth}
          strokeLinecap="round"
        />
        <circle cx={centre} cy={centre} r={drawing.dot} className="fill-bone" />
      </g>
    </svg>
  );
}
