import type { HTMLAttributes, ReactNode } from 'react';

import { cx } from '../internal/cx';

/**
 * How the two columns share the row once the slot is wide enough.
 * `lead-320` / `lead-400` / `lead-420`: a capped text column, then the rest.
 * `11-9`: the About rings split. `equal`: halves.
 */
export type SplitColumns = 'lead-320' | 'lead-400' | 'lead-420' | '11-9' | 'equal';
export type SplitGap = 0 | 56;
export type SplitStackGap = 32 | 40 | 48;
export type SplitAlign = 'start' | 'center';

export interface SplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Column split when side by side. Default `lead-400`. */
  columns?: SplitColumns;
  /** Space between the columns when side by side, in px. Default 56. */
  gap?: SplitGap;
  /** Space between the blocks when stacked, in px. Default 48. */
  stackGap?: SplitStackGap;
  /** Cross-axis alignment. Default `start`. */
  align?: SplitAlign;
  /** Exactly two children: the lead column, then the rest. */
  children?: ReactNode;
}

const columnsClass: Record<SplitColumns, string> = {
  'lead-320': '@lg:grid-cols-[320px_minmax(0,1fr)]',
  'lead-400': '@lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]',
  'lead-420': '@lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]',
  '11-9': '@lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]',
  equal: '@lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
};

const gapClass: Record<SplitGap, string> = {
  0: '@lg:gap-0',
  56: '@lg:gap-14',
};

const stackGapClass: Record<SplitStackGap, string> = {
  32: 'gap-8',
  40: 'gap-10',
  48: 'gap-12',
};

const alignClass: Record<SplitAlign, string> = {
  start: 'items-start',
  center: 'items-center',
};

/**
 * Two blocks: stacked in a narrow slot, side by side from the `lg` container width. It queries its
 * own width, not the viewport, so it works wherever it is placed.
 */
export function SplitLayout({
  columns = 'lead-400',
  gap = 56,
  stackGap = 48,
  align = 'start',
  className,
  children,
  ...rest
}: SplitLayoutProps) {
  return (
    <div className={cx('@container', className)} {...rest}>
      <div
        className={cx(
          'grid grid-cols-[minmax(0,1fr)]',
          stackGapClass[stackGap],
          gapClass[gap],
          columnsClass[columns],
          alignClass[align],
        )}
      >
        {children}
      </div>
    </div>
  );
}
