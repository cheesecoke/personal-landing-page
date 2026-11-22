import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cx } from '../internal/cx';

export type SectionSpace = 'none' | 'details' | 'section' | 'handoff';
export type SectionMeasure = 'full' | 'log' | 'deeper';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. Default `section`. Give it `aria-labelledby` or `aria-label`. */
  as?: ElementType;
  /**
   * Space above, from the project boards. `section`: between page sections. `details`: the tighter
   * step before a details strip. `handoff`: before the hand-off footer.
   */
  space?: SectionSpace;
  /** Max width. `log`: 760px (the log column). `deeper`: 1056px (Go deeper). */
  measure?: SectionMeasure;
  children?: ReactNode;
}

const spaceClass: Record<SectionSpace, string> = {
  none: '',
  details: 'mt-[clamp(48px,5vw,72px)]',
  section: 'mt-[clamp(56px,5.5vw,80px)]',
  handoff: 'mt-[clamp(64px,7vw,96px)]',
};

const measureClass: Record<SectionMeasure, string> = {
  full: '',
  log: 'max-w-[760px]',
  deeper: 'max-w-[1056px]',
};

/**
 * A page section: a positioned block with the boards' fluid space above it. It is `relative` so a
 * thread node (see ThreadSection) can sit against it.
 */
export function Section({
  as: Tag = 'section',
  space = 'section',
  measure = 'full',
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <Tag className={cx('relative', spaceClass[space], measureClass[measure], className)} {...rest}>
      {children}
    </Tag>
  );
}
