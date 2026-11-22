import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../cx';

export interface LitEdgeProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /**
   * The glow. One glow per view: switch it off when something else on the page holds the glow
   * (the newest log entry on a project page).
   */
  glow?: boolean;
}

/**
 * The lit edge: a 72px by 1px Signal segment on the top-left edge of a panel or rule. At most one
 * per view. It positions itself against the nearest positioned ancestor (`Panel` is one).
 */
export function LitEdge({ glow = true, className, ...rest }: LitEdgeProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'pointer-events-none absolute -top-px left-4 block h-px w-18 max-w-[calc(100%-2rem)] bg-signal',
        glow && 'shadow-glow-signal',
        className,
      )}
      {...rest}
    />
  );
}
