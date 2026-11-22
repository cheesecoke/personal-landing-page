import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx } from '../cx';
import { toneClass, type TextTone } from '../tone';
import { toStardate } from './stardate';

export type ReadoutKind = 'numeral' | 'status' | 'date' | 'stardate';

const kinds: Record<ReadoutKind, string> = {
  numeral: 'type-readout-numeral lining-nums',
  status: 'type-readout-status',
  // A date is the status readout in Ash.
  date: 'type-readout-status text-secondary tabular-nums',
  stardate: 'type-readout-stardate tabular-nums',
};

export interface ReadoutProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /**
   * `numeral`: a hard fact. `status`: the word beside a status dot. `date`: a year, range or
   * date. `stardate`: year.day, decoration next to a readable date.
   */
  kind: ReadoutKind;
  /** Overrides the kind's colour (status words are Bone, Ash or Smoke depending on the board). */
  tone?: TextTone;
  /**
   * An ISO date (`YYYY-MM-DD`). A `date` readout renders `<time datetime>`; a `stardate` readout
   * with no children shows this date as a stardate.
   */
  dateTime?: string;
  children?: ReactNode;
}

/**
 * Tomorrow, the readout face. It only measures: numerals, status words, dates. A stardate is
 * hidden from assistive technology; put the readable date beside it.
 */
export function Readout({ kind, tone, dateTime, className, children, ...rest }: ReadoutProps) {
  const classes = cx(kinds[kind], tone && toneClass[tone], className);

  if (kind === 'date' && dateTime) {
    return (
      <time dateTime={dateTime} className={classes} {...rest}>
        {children}
      </time>
    );
  }
  if (kind === 'stardate') {
    return (
      <span aria-hidden="true" className={classes} {...rest}>
        {children ?? (dateTime ? toStardate(dateTime) : null)}
      </span>
    );
  }
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
