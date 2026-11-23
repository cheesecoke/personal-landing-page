import type { ReactNode } from 'react';

import { ThreadNode } from '../../../layout';
import { cx, Text } from '../../../primitives';
import { formatMonth, type Month } from '../internal/month';

/** The Now line as data. Structurally the `now` of the About content. */
export interface NowEntry {
  /** The month the line was written, `YYYY-MM`. It always shows, so an old line reads as old. */
  month: Month;
  text: string;
}

export interface NowBlockProps {
  /** `null`: nothing has been published, so the block renders nothing at all. */
  now: NowEntry | null;
  /** The section's title ("Now"). */
  label: ReactNode;
  /** An id for the title. Default `about-now`. */
  titleId?: string;
  /** Put a node on the thread beside it. Default `true`. */
  node?: boolean;
  /** The locale the month is written in. Default `en-US`. */
  locale?: string;
  className?: string;
}

/**
 * The About "Now" line: the month and one sentence about what is going on. An older line keeps
 * its own month, so it never pretends to be current. With no line there is no section, no title
 * and no node.
 */
export function NowBlock({
  now,
  label,
  titleId = 'about-now',
  node = true,
  locale,
  className,
}: NowBlockProps) {
  if (!now) return null;
  return (
    <section
      aria-labelledby={titleId}
      data-live="now"
      className={cx('relative flex flex-col gap-3', className)}
    >
      {node ? <ThreadNode placement="column" top={4} /> : null}
      <h2
        id={titleId}
        className="m-0 inline-flex items-center gap-2.5 type-readout-status text-secondary"
      >
        <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-accent-signal" />
        {label}
      </h2>
      <Text className="max-w-[64ch]">
        <span className="text-primary">
          <time dateTime={now.month}>{formatMonth(now.month, locale)}</time>:
        </span>{' '}
        {now.text}
      </Text>
    </section>
  );
}
