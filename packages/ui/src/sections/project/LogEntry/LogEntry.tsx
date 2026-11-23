import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import {
  cx,
  newMark,
  NewMarkerLabel,
  NewMarkerRing,
  Readout,
  toStardate,
  useHydrated,
} from '../../../primitives';
import { LogLines } from '../internal/LogLines';
import { formatLogDate } from './logDate';

/** One entry of a project log, as the publish job writes it. */
export interface LogEntryData {
  id: string;
  /** The day of the entry (`YYYY-MM-DD`). */
  date: string;
  /** The first day, when the entry covers a stretch (`YYYY-MM-DD`). */
  from?: string;
  kind: 'update' | 'release';
  /** One to four terse lines. More than four are not shown. */
  lines: readonly string[];
  /** A release's version (`v1.2.3`). */
  version?: string;
}

/** The new mark, as plain numbers: age and lifetime in days. */
export interface LogEntryFresh {
  ageDays: number;
  lifeDays: number;
}

export interface LogEntryProps extends Omit<ComponentPropsWithoutRef<'li'>, 'children'> {
  entry: LogEntryData;
  /** The newest entry: its node is filled and holds the page's one glow. */
  latest?: boolean;
  /** Marks the entry as new ("New · 3d"). A mark that has run out draws nothing. */
  fresh?: LogEntryFresh | null;
  /** The label beside a release's version ("Release notes"). */
  releaseLabel?: ReactNode;
  /** The date as printed. Default: made from `date` and `from` ("5 Nov 2026"). */
  dateLabel?: string;
  /** The `datetime` of the date. Default: `entry.date`. */
  dateTime?: string;
  /** The stardate as printed. Default: made from `entry.date` ("2026.309"). */
  stardate?: string;
  /** Most lines shown. Default 4. */
  maxLines?: number;
  /** As `NewMarker`'s: leave it out, or pass `false` to see the page without script. */
  hydrated?: boolean;
}

/**
 * One stardate entry of a captain's log: the stardate and the readable date, a release's version,
 * and a few terse lines. It is a list item; it sits on the log's own thread, and its node is drawn
 * 28px to its left, so the list needs that much padding. The stardate is decoration and hidden
 * from assistive technology; the `<time>` beside it carries the date.
 */
export function LogEntry({
  entry,
  latest = false,
  fresh,
  releaseLabel,
  dateLabel,
  dateTime,
  stardate,
  maxLines = 4,
  hydrated,
  className,
  ...rest
}: LogEntryProps) {
  const detected = useHydrated();
  const mark = (hydrated ?? detected) && fresh ? newMark(fresh) : null;
  const isRelease = entry.kind === 'release' && Boolean(entry.version);
  return (
    <li
      data-log-entry={entry.kind}
      data-latest={latest ? '' : undefined}
      className={cx('relative flex min-w-0 flex-col gap-2.5', className)}
      {...rest}
    >
      <span
        aria-hidden="true"
        data-log-node=""
        className={cx(
          'absolute top-[7px] -left-7 box-border size-[9px] rounded-full border',
          latest ? 'border-signal bg-signal shadow-glow-signal' : 'border-signal-dim bg-raised',
        )}
      >
        {mark ? <NewMarkerRing dash={mark.dash} style={{ top: -3.5, left: -3.5 }} /> : null}
      </span>
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
        <Readout kind="stardate" className="leading-none tracking-[0.02em]">
          {stardate ?? toStardate(entry.date)}
        </Readout>
        <Readout kind="date" dateTime={dateTime ?? entry.date}>
          {dateLabel ?? formatLogDate(entry.date, entry.from)}
        </Readout>
        {mark ? <NewMarkerLabel text={mark.text} spoken={mark.spoken} /> : null}
      </div>
      {isRelease ? (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <Readout kind="numeral" className="text-[clamp(34px,4vw,48px)] leading-[0.98]">
            {entry.version}
          </Readout>
          {releaseLabel ? <span className="type-label text-secondary">{releaseLabel}</span> : null}
        </div>
      ) : null}
      <LogLines lines={entry.lines.slice(0, maxLines)} />
    </li>
  );
}
