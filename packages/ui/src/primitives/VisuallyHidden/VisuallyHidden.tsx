import type { ElementType } from 'react';

import { cx } from '../cx';
import type { PolymorphicProps } from '../polymorphic';

export type VisuallyHiddenProps<E extends ElementType = 'span'> = PolymorphicProps<E>;

/** Text for assistive technology only: read out, never seen. Renders a `<span>` by default. */
export function VisuallyHidden<E extends ElementType = 'span'>({
  as,
  className,
  ...rest
}: VisuallyHiddenProps<E>) {
  const Component: ElementType = as ?? 'span';
  return <Component className={cx('sr-only', className as string | undefined)} {...rest} />;
}
