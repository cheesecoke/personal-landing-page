import type { LinkComponent } from '../../../layout';
import { cx, Label, Readout, Text, TextLink } from '../../../primitives';

/** The newest published change across projects, as plain data. */
export interface LatestEntry {
  /** The project it belongs to, and its page. */
  project: string;
  href: string;
  /** `update`: a stretch of work. `release`: a version went out. */
  kind: 'update' | 'release';
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  /** The date as it reads ("20 Nov 2026"). */
  dateLabel: string;
  /** The one line of what changed (the entry's first line). */
  text: string;
  /** A release's version ("v1.0.0"). */
  version?: string;
}

export interface LatestLineProps {
  /** The small label that opens the line ("Latest"). */
  label: string;
  /** The newest entry. `null`: nothing has been published, and the line renders nothing. */
  entry: LatestEntry | null;
  /** The element or component for the link. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

/**
 * Home's "Latest" line: the newest published change across projects, with its date, on one
 * wrapping row. A release also shows its version. With no entry it renders nothing: no shell and
 * no "no updates" text.
 */
export function LatestLine({ label, entry, linkAs, className }: LatestLineProps) {
  if (!entry) return null;
  return (
    <p
      data-live="latest-line"
      data-kind={entry.kind}
      className={cx('m-0 flex flex-wrap items-baseline gap-x-4 gap-y-1', className)}
    >
      <Label>{label}</Label>
      <Readout kind="date" dateTime={entry.date}>
        {entry.dateLabel}
      </Readout>
      <TextLink as={linkAs} href={entry.href} size="body" arrow={false} className="min-h-0 py-2.5">
        {entry.project}
      </TextLink>
      {entry.kind === 'release' && entry.version ? (
        <Readout kind="status" tone="warm">
          {entry.version}
        </Readout>
      ) : null}
      <Text as="span">{entry.text}</Text>
    </p>
  );
}
