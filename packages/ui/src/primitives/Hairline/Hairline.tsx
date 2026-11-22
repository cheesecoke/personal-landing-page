import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../cx';

export type HairlineTone = 'hairline' | 'tick';

const tones: Record<HairlineTone, string> = {
  hairline: 'bg-hairline',
  tick: 'bg-tick',
};

export interface HairlineProps extends ComponentPropsWithoutRef<'hr'> {
  /** A vertical hairline stretches to the height of its flex or grid row. */
  orientation?: 'horizontal' | 'vertical';
  tone?: HairlineTone;
  /**
   * `true` (the default): a visual rule only, hidden from assistive technology. `false`: a real
   * separator between two groups of content.
   */
  decorative?: boolean;
}

/** A 1px rule. Most content sits straight on the ground, separated by hairlines and space. */
export function Hairline({
  orientation = 'horizontal',
  tone = 'hairline',
  decorative = true,
  className,
  ...rest
}: HairlineProps) {
  return (
    <hr
      aria-hidden={decorative ? 'true' : undefined}
      aria-orientation={!decorative && orientation === 'vertical' ? 'vertical' : undefined}
      className={cx(
        'm-0 flex-none border-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-auto w-px self-stretch',
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
