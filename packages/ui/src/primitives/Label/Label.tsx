import type { ElementType } from 'react';

import { cx } from '../cx';
import type { PolymorphicProps } from '../polymorphic';

/** `label` is Smoke, for Ground and Surface. On Raised use `secondary` (Smoke never sits on Raised). */
export type LabelTone = 'label' | 'secondary' | 'primary';

const tones: Record<LabelTone, string> = {
  label: 'text-label',
  secondary: 'text-secondary',
  primary: 'text-primary',
};

interface LabelOwnProps {
  tone?: LabelTone;
}

export type LabelProps<E extends ElementType = 'span'> = PolymorphicProps<E, LabelOwnProps>;

/** The small uppercase label: section labels, breadcrumbs, captions. Renders a `<span>` by default. */
export function Label<E extends ElementType = 'span'>({
  as,
  tone = 'label',
  className,
  ...rest
}: LabelProps<E>) {
  const Component: ElementType = as ?? 'span';
  return (
    <Component
      className={cx('m-0 type-label', tones[tone], className as string | undefined)}
      {...rest}
    />
  );
}
