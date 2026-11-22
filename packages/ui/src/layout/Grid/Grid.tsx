import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cx } from '../internal/cx';
import { alignClass, gapXClass, gapYClass, type Align, type Gap } from '../internal/gap';

/** The smallest a column may get before the grid drops a column, in px. */
export type GridMin = 150 | 220 | 230 | 300;

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. Default `div`. `ul` and `ol` lose their list style and padding. */
  as?: ElementType;
  /**
   * Column floor. The grid fits as many columns of at least this width as its own width allows, so
   * it responds to its slot with no breakpoint. 150: proof facts. 220: three-up notes.
   * 230: artifact cards. 300: the project index.
   */
  min?: GridMin;
  /** Space between columns, in px. Default 24. */
  gapX?: Gap;
  /** Space between rows, in px. Default: same as `gapX`. */
  gapY?: Gap;
  /** Cross-axis alignment of the cells. Default `stretch`. */
  align?: Align;
  children?: ReactNode;
}

const minClass: Record<GridMin, string> = {
  150: 'grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))]',
  220: 'grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]',
  230: 'grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))]',
  300: 'grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))]',
};

/** An auto-fit grid: columns appear as the slot gets wider. No fixed widths, no breakpoints. */
export function Grid({
  as: Tag = 'div',
  min = 220,
  gapX = 24,
  gapY,
  align = 'stretch',
  className,
  children,
  ...rest
}: GridProps) {
  const isList = Tag === 'ul' || Tag === 'ol';
  return (
    <Tag
      className={cx(
        'grid min-w-0',
        minClass[min],
        gapXClass[gapX],
        gapYClass[gapY ?? gapX],
        alignClass[align],
        isList && 'm-0 list-none p-0',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
