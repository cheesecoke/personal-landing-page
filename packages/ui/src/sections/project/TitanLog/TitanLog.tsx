import type { ReactNode } from 'react';

import { Readout } from '../../../primitives';
import { CaptainsLog } from '../CaptainsLog/CaptainsLog';
import { formatLogMonth, monthEnd } from '../LogEntry/logDate';
import type { LogEntryData } from '../LogEntry/LogEntry';

/** One month of the job log. */
export interface TitanLogEntry {
  /** `YYYY-MM`. Never finer than a month. */
  month: string;
  /** The skill or the outcome, in words. Three lines at most; a line with a digit is not shown. */
  lines: readonly string[];
}

export interface TitanLogProps {
  /**
   * The switch. The log renders nothing unless this is `true`; it is off until it is confirmed
   * that the job log may be published. Default `false`.
   */
  enabled?: boolean;
  /** The panel's label ("Captain's log"). */
  title: ReactNode;
  /** The readout on the right of the header ("Monthly"). */
  source?: ReactNode;
  /** The role, in the line under the header ("Senior Software Engineer, AI"). */
  role?: string;
  /** The month the role began (`YYYY-MM`). It is printed as a month, never typed as a tenure. */
  since?: string;
  /** The word before the start month ("since"). */
  sinceLabel?: string;
  /** Newest first, one per month. */
  entries: readonly TitanLogEntry[];
  /** No recent update: only the last month shows, unchanged, with no glow. */
  quiet?: boolean;
  /** How many months show. Default 3. */
  visible?: number;
  className?: string;
}

const MAX_LINES = 3;
const HAS_DIGIT = /\d/;

/**
 * The job page's log: the captain's log at month granularity. Each entry is a month with at most
 * three lines that say the skill or the outcome only. As defence in depth on top of the content
 * schema, a line with a digit in it is dropped here, an entry left with no lines is dropped with
 * it, and the whole log renders nothing unless `enabled` is `true`. It carries no new mark.
 */
export function TitanLog({
  enabled = false,
  title,
  source,
  role,
  since,
  sinceLabel,
  entries,
  quiet,
  visible = 3,
  className,
}: TitanLogProps) {
  if (!enabled) return null;

  const months: LogEntryData[] = entries
    .filter((entry) => /^\d{4}-\d{2}$/.test(entry.month))
    .map((entry) => ({
      id: entry.month,
      date: monthEnd(entry.month),
      kind: 'update' as const,
      lines: entry.lines.filter((line) => !HAS_DIGIT.test(line)).slice(0, MAX_LINES),
    }))
    .filter((entry) => entry.lines.length > 0);
  if (months.length === 0) return null;

  const start = since ? [sinceLabel, formatLogMonth(since)].filter(Boolean).join(' ') : null;
  const header =
    role || start ? (
      <Readout kind="status" tone="secondary" data-titan-role="">
        {[role, start].filter(Boolean).join(' · ')}
      </Readout>
    ) : null;

  return (
    <CaptainsLog
      title={title}
      source={source}
      header={header}
      entries={months}
      quiet={quiet}
      visible={visible}
      maxLines={MAX_LINES}
      describeDate={(entry) => ({
        dateLabel: formatLogMonth(entry.id),
        dateTime: entry.id,
      })}
      className={className}
    />
  );
}
