import type { ElementType } from 'react';

import { cx } from '../cx';
import type { PolymorphicProps } from '../polymorphic';

interface CaptionOwnProps {
  /** `secondary` (Ash) when the caption sits on Raised. */
  tone?: 'label' | 'secondary';
}

export type CaptionProps<E extends ElementType = 'figcaption'> = PolymorphicProps<
  E,
  CaptionOwnProps
>;

/**
 * One line under an image, in the label style. Renders a `<figcaption>` (it belongs in a
 * `Figure`); pass `as="p"` outside one. Say what the image is: a design mock is never "the app".
 */
export function Caption<E extends ElementType = 'figcaption'>({
  as,
  tone = 'label',
  className,
  ...rest
}: CaptionProps<E>) {
  const Component: ElementType = as ?? 'figcaption';
  return (
    <Component
      className={cx(
        'm-0 type-label',
        tone === 'secondary' ? 'text-secondary' : 'text-label',
        className as string | undefined,
      )}
      {...rest}
    />
  );
}
