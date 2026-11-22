import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx } from '../cx';

export interface SkipLinkProps extends Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  /** The id of the main content, as a hash. */
  href?: `#${string}`;
  /** The link text. It comes from content; the component has no copy of its own. */
  children: ReactNode;
}

/**
 * The first focusable thing on a page: hidden until it takes keyboard focus, then shown at the
 * top-left as a quiet button. Put it first in the body and give the main content the target id.
 */
export function SkipLink({ href = '#main', className, children, ...rest }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cx(
        'sr-only type-button no-underline',
        'focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:box-border focus:inline-flex focus:min-h-touch focus:items-center focus:rounded-button focus:border focus:border-hairline focus:bg-ground focus:px-5.5 focus:py-3.5',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
