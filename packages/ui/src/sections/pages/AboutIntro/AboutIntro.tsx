import type { ReactNode } from 'react';

import { ThreadNode } from '../../../layout';
import { cx, Text } from '../../../primitives';

export interface AboutIntroProps {
  /** The section's accessible name ("Outside work and rules I work by"). */
  'aria-label': string;
  /** The portrait, on the left (a `Portrait`). */
  portrait: ReactNode;
  /** The first paragraph, in the lead style. */
  lead: ReactNode;
  /** The second paragraph: outside work. */
  body?: ReactNode;
  /** Under the paragraphs (a `FieldNotes`). */
  children?: ReactNode;
  /** Put a node on the thread beside it. Default `true`. */
  node?: boolean;
  className?: string;
}

/**
 * The person: the portrait on the left, and beside it who he is, what he does outside work and
 * the rules he works by. The two columns wrap into one when there is no room.
 */
export function AboutIntro({
  'aria-label': ariaLabel,
  portrait,
  lead,
  body,
  children,
  node = true,
  className,
}: AboutIntroProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={cx('relative flex flex-wrap items-start gap-x-16 gap-y-12', className)}
    >
      {node ? <ThreadNode placement="column" top={8} /> : null}
      <div className="max-w-[400px] min-w-0 flex-[1_1_300px]">{portrait}</div>
      <div className="flex max-w-[640px] min-w-0 flex-[1_1_380px] flex-col gap-14">
        <div className="flex flex-col gap-5">
          <Text role="lead" className="max-w-[46ch]">
            {lead}
          </Text>
          {body ? <Text className="max-w-[56ch] text-pretty">{body}</Text> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
