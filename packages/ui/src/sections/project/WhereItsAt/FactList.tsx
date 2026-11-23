import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx, Readout, TickScale } from '../../../primitives';
import { formatLogDate } from '../LogEntry/logDate';

/**
 * One fact beside "Where it's at".
 * `numeral`: a counted number, with its unit under the tick scale ("1,167" / "test cases").
 * `word`: a rule or a measured fact in words ("Approval before merge").
 * `confirm`: a marker for a fact that is not confirmed yet, shown word for word.
 */
export interface FactData {
  /** The number or the words. For `confirm`, the whole marker ("[CONFIRM: ...]"). */
  value: ReactNode;
  kind?: 'numeral' | 'word' | 'confirm';
  /** What the number counts ("test cases"). */
  unit?: ReactNode;
  /** A small readout under the tick scale ("Sample: 20 items"). */
  note?: ReactNode;
  caption: ReactNode;
  /** The day a counted fact was counted (`YYYY-MM-DD`), printed after `asOfLabel`. */
  asOf?: string;
}

export interface FactListProps extends ComponentPropsWithoutRef<'ul'> {
  facts: readonly FactData[];
  /** The words before a fact's date ("As of"). */
  asOfLabel?: string;
}

const lead = 'flex min-h-[57px] items-end font-readout text-accent-warm';

/** The facts beside "Where it's at": each over a tick scale, three across where there is room. */
export function FactList({ facts, asOfLabel, className, ...rest }: FactListProps) {
  return (
    <ul
      className={cx(
        'm-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-x-6 gap-y-9 p-0',
        className,
      )}
      {...rest}
    >
      {facts.map((fact, index) => {
        const kind = fact.kind ?? (fact.unit ? 'numeral' : 'word');
        return (
          <li key={index} data-fact={kind} className="flex min-w-0 flex-col">
            {kind === 'numeral' ? (
              <Readout kind="numeral">{fact.value}</Readout>
            ) : kind === 'word' ? (
              <span
                className={cx(
                  lead,
                  'text-[clamp(20px,1.7vw,24px)] leading-[1.15] font-normal tracking-[-0.005em]',
                )}
              >
                {fact.value}
              </span>
            ) : (
              <span
                className={cx(lead, 'text-[12px] leading-[1.45] font-medium tracking-[0.08em]')}
              >
                {fact.value}
              </span>
            )}
            <TickScale width={120} major="strong" className="mt-4.5" />
            {fact.note ? (
              <Readout kind="status" tone="secondary" className="mt-2 text-[10px]">
                {fact.note}
              </Readout>
            ) : null}
            {fact.unit ? (
              <span className="mt-4 text-[16px] leading-[1.3] font-semibold text-primary">
                {fact.unit}
              </span>
            ) : null}
            <span
              className={cx(
                'text-[14px] leading-normal text-secondary',
                fact.unit ? 'mt-1.5' : 'mt-4',
              )}
            >
              {fact.caption}
            </span>
            {fact.asOf ? (
              <Readout kind="date" dateTime={fact.asOf} className="mt-2 text-[10px]">
                {asOfLabel ? `${asOfLabel} ` : null}
                {formatLogDate(fact.asOf)}
              </Readout>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
