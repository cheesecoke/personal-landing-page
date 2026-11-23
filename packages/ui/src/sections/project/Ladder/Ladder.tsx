import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx } from '../../../primitives';

export interface LadderProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Accessible name of the steps ("Personal, then popular, then community, then core"). */
  stepsLabel: string;
  /** Lowest rung first. The first is where things stand today; the rest have not grown. */
  steps: readonly string[];
  /** The paragraph beside the ladder. */
  text: ReactNode;
}

/**
 * A short ladder of named steps climbing to the right, beside one paragraph (Lifebox: personal to
 * core). The first rung is solid; the rest are dashed, not yet grown. It goes in the details slot
 * (`DetailsStrip`'s children). Read in order, lowest rung first.
 */
export function Ladder({ stepsLabel, steps, text, className, ...rest }: LadderProps) {
  return (
    <div className={cx('flex flex-wrap items-center gap-x-14 gap-y-6', className)} {...rest}>
      <ol aria-label={stepsLabel} className="m-0 flex list-none flex-col-reverse p-0">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex min-h-10 items-center gap-3"
            style={{ paddingLeft: index * 28 }}
          >
            <span
              aria-hidden="true"
              className={cx(
                'box-border size-[11px] flex-none rounded-full border',
                index === 0 ? 'border-signal' : 'border-dashed border-cedar',
              )}
            />
            <span
              className={cx(
                'font-sans text-[14px] font-medium',
                index === 0 ? 'text-primary' : 'text-secondary',
              )}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
      <p className="m-0 max-w-[44ch] text-[15px] leading-[1.55] text-secondary">{text}</p>
    </div>
  );
}
