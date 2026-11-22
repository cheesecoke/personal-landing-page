import type { ElementType } from 'react';

import { cx } from '../cx';
import type { PolymorphicProps } from '../polymorphic';

/**
 * The focus ring as classes, for an element that draws its own: 1px Signal, 4px clear of the
 * element. Every focusable element already gets this from the base styles; reach for these only
 * where that outline is removed or clipped.
 */
export const focusRing =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-signal';

/** The same ring drawn inside the element's edge, for elements whose parent clips overflow. */
export const focusRingInset =
  'focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-signal';

interface FocusRingOwnProps {
  /** `inset` draws the ring inside the edge, for a wrapper that sits in a clipping parent. */
  placement?: 'outset' | 'inset';
}

export type FocusRingProps<E extends ElementType = 'span'> = PolymorphicProps<E, FocusRingOwnProps>;

/**
 * Draws the focus ring around a group when something inside it has keyboard focus: a tile whose
 * link covers it, a canvas with a focusable control. The focused element's own outline is
 * switched off so there is one ring, not two.
 */
export function FocusRing<E extends ElementType = 'span'>({
  as,
  placement = 'outset',
  className,
  ...rest
}: FocusRingProps<E>) {
  const Component: ElementType = as ?? 'span';
  return (
    <Component
      className={cx(
        'has-focus-visible:outline has-focus-visible:outline-1 has-focus-visible:outline-signal **:focus-visible:outline-none',
        placement === 'inset'
          ? 'has-focus-visible:-outline-offset-1'
          : 'has-focus-visible:outline-offset-4',
        className as string | undefined,
      )}
      {...rest}
    />
  );
}
