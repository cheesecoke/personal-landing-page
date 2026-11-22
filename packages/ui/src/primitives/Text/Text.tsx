import type { ElementType } from 'react';

import type { TypeRoleName } from '@cwc/tokens';

import { cx } from '../cx';
import type { PolymorphicProps } from '../polymorphic';
import { toneClass, type TextTone } from '../tone';

export type TextRole = TypeRoleName;

// Whole class names: Tailwind cannot see names built from parts.
export const typeClass: Record<TextRole, string> = {
  hero: 'type-hero',
  h1: 'type-h1',
  h2: 'type-h2',
  h3: 'type-h3',
  lead: 'type-lead',
  body: 'type-body',
  label: 'type-label',
  button: 'type-button',
  nav: 'type-nav',
  link: 'type-link',
  handoff: 'type-handoff',
  'readout-numeral': 'type-readout-numeral',
  'readout-status': 'type-readout-status',
  'readout-stardate': 'type-readout-stardate',
};

interface TextOwnProps {
  /** The type role: font, size, weight, tracking and its default colour. */
  role?: TextRole;
  /** Overrides the role's colour. */
  tone?: TextTone;
  /** Caps the line length at the measure (56ch). */
  measure?: boolean;
}

export type TextProps<E extends ElementType = 'p'> = PolymorphicProps<E, TextOwnProps>;

/** Text in one of the type roles. Renders a `<p>` unless `as` says otherwise. */
export function Text<E extends ElementType = 'p'>({
  as,
  role = 'body',
  tone,
  measure = false,
  className,
  ...rest
}: TextProps<E>) {
  const Component: ElementType = as ?? 'p';
  return (
    <Component
      className={cx(
        'm-0',
        typeClass[role],
        tone && toneClass[tone],
        measure && 'max-w-measure',
        className as string | undefined,
      )}
      {...rest}
    />
  );
}
