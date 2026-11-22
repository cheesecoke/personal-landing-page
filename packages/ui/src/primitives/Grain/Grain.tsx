import { useId, type ComponentPropsWithoutRef } from 'react';

import { texture } from '@cwc/tokens';

import { cx } from '../cx';

export interface GrainProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  /**
   * `absolute` (the default) covers the nearest positioned ancestor, which should also clip it
   * (`overflow: hidden`). `fixed` covers the viewport.
   */
  position?: 'absolute' | 'fixed';
}

/**
 * The house film grain, and the only texture on the site: never put a second one on top of it.
 * It sits above the content and lets every click through.
 */
export function Grain({ position = 'absolute', className, style, ...rest }: GrainProps) {
  const { opacity, baseFrequency, numOctaves, colorMatrix } = texture.grain;
  const id = `grain-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg
      aria-hidden="true"
      className={cx(
        'pointer-events-none inset-0 z-3 size-full',
        position === 'fixed' ? 'fixed' : 'absolute',
        className,
      )}
      style={{ opacity, ...style }}
      {...rest}
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency={baseFrequency}
          numOctaves={numOctaves}
          stitchTiles="stitch"
        />
        <feColorMatrix values={colorMatrix} />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
