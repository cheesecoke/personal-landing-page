import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../cx';

/** `build`: in build (Ember). `live`: in use (Signal). `private`: a hollow ring (Ash). */
export type Status = 'build' | 'live' | 'private';

const statuses: Record<Status, string> = {
  build: 'bg-status-build',
  live: 'bg-status-live',
  private: 'box-border border border-status-private',
};

export interface StatusDotProps extends ComponentPropsWithoutRef<'span'> {
  status: Status;
}

/**
 * The 6px status dot. It is decoration: the status word beside it carries the meaning, so the dot
 * is hidden from assistive technology. Children are drawn over it (the NewMarker ring).
 */
export function StatusDot({ status, className, children, ...rest }: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      data-status={status}
      className={cx(
        'relative inline-block size-1.5 flex-none rounded-full',
        statuses[status],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
