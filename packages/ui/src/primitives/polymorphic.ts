import type { ComponentPropsWithoutRef, ElementType } from 'react';

/**
 * Props for a component that can render as another element or component (`as`), for example a
 * router link. The component's own props win over the element's.
 */
export type PolymorphicProps<E extends ElementType, Own = object> = Own & {
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof Own | 'as'>;
