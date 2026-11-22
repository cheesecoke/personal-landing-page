import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cx } from '../internal/cx';
import {
  alignClass,
  gapXClass,
  gapYClass,
  justifyClass,
  type Align,
  type Gap,
  type Justify,
} from '../internal/gap';

export interface ClusterProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. Default `div`. */
  as?: ElementType;
  /** Space between items on a row, in px. Default 16. */
  gapX?: Gap;
  /** Space between rows once items wrap, in px. Default: same as `gapX`. */
  gapY?: Gap;
  /** Cross-axis alignment. Default `center`. */
  align?: Align;
  /** Main-axis distribution. Default `start`. */
  justify?: Justify;
  children?: ReactNode;
}

/** A row that wraps: items sit side by side and drop to the next line when they run out of room. */
export function Cluster({
  as: Tag = 'div',
  gapX = 16,
  gapY,
  align = 'center',
  justify = 'start',
  className,
  children,
  ...rest
}: ClusterProps) {
  return (
    <Tag
      className={cx(
        'flex min-w-0 flex-wrap',
        gapXClass[gapX],
        gapYClass[gapY ?? gapX],
        alignClass[align],
        justifyClass[justify],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
