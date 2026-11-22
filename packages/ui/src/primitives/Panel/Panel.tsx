import type { ElementType } from 'react';

import { cx } from '../cx';
import { LitEdge } from '../LitEdge/LitEdge';
import type { PolymorphicProps } from '../polymorphic';

interface PanelOwnProps {
  /**
   * The lit edge on the top-left. At most one per view. `'no-glow'` draws the segment without
   * its glow, for a page where something else holds the glow.
   */
  litEdge?: boolean | 'no-glow';
  /** The board's panel padding (20px top, 22px sides and bottom). */
  padded?: boolean;
  /** Lifts 4px and takes a Signal-dim border on hover. For a panel that is, or sits in, a link. */
  rise?: boolean;
}

export type PanelProps<E extends ElementType = 'div'> = PolymorphicProps<E, PanelOwnProps>;

/**
 * A Raised surface with a hairline border and a faint top highlight. Use panels rarely: most
 * content sits straight on the ground. Labels inside are Ash (`tone="secondary"`), never Smoke.
 */
export function Panel<E extends ElementType = 'div'>({
  as,
  litEdge = false,
  padded = false,
  rise = false,
  className,
  children,
  ...rest
}: PanelProps<E>) {
  const Component: ElementType = as ?? 'div';
  return (
    <Component
      className={cx(
        'relative box-border min-w-0 rounded-panel border border-hairline bg-raised shadow-panel',
        padded && 'px-5.5 pt-5 pb-5.5',
        rise &&
          'hover:-translate-y-1 hover:border-signal-dim motion-ok:transition-[translate,border-color] motion-ok:duration-rise motion-ok:ease-out',
        className as string | undefined,
      )}
      {...rest}
    >
      {litEdge ? <LitEdge glow={litEdge !== 'no-glow'} /> : null}
      {children}
    </Component>
  );
}
