import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx } from '../cx';

export interface ConfirmMarkerProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** What still needs confirming. Shown inside `[CONFIRM: …]`, in its own case. */
  children: ReactNode;
}

/**
 * Marks a fact that is not confirmed yet, so it is easy to find on a staging page. Production
 * builds fail while any marker is left in the content.
 */
export function ConfirmMarker({ className, children, ...rest }: ConfirmMarkerProps) {
  return (
    <span className={cx('type-readout-status text-accent-warm normal-case', className)} {...rest}>
      [CONFIRM: {children}]
    </span>
  );
}
