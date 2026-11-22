import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cx } from '../internal/cx';
import { alignClass, gapClass, type Align, type Gap } from '../internal/gap';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. Default `div`. */
  as?: ElementType;
  /** Space between children, in px. Default 16. */
  gap?: Gap;
  /** Cross-axis alignment. Default `stretch`. */
  align?: Align;
  children?: ReactNode;
}

/** A vertical run of blocks with one gap. */
export function Stack({
  as: Tag = 'div',
  gap = 16,
  align = 'stretch',
  className,
  children,
  ...rest
}: StackProps) {
  return (
    <Tag
      className={cx('flex min-w-0 flex-col', gapClass[gap], alignClass[align], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
