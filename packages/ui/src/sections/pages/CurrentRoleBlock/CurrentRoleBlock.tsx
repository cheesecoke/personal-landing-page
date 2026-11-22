import type { ReactNode } from 'react';

import { formatMonth, type Month } from '../internal/month';

/** The current role as data. Structurally the `currentRole` of the About content. */
export interface CurrentRole {
  title: string;
  org: string;
  /** The month the role started, `YYYY-MM`. "Since January 2026" is written from this. */
  since: Month;
}

export interface CurrentRoleBlockProps {
  /** `null`: there is no role data, so the fallback shows instead. */
  role: CurrentRole | null;
  /** The word between the title and the month ("since"). */
  sinceLabel: ReactNode;
  /** What to show with no role data: the hand-written ring text. */
  fallback?: ReactNode;
  /** Anything that follows the role in the same line (the rest of the ring's summary). */
  children?: ReactNode;
  /** The locale the month is written in. Default `en-US`. */
  locale?: string;
  className?: string;
}

/**
 * The current role in one sentence: "Senior Software Engineer, AI, since January 2026." The
 * month is written from the start date and marked up as `<time>`, never typed by hand. It is
 * inline, so it sits at the start of the newest ring's summary; the organisation is that ring's
 * label.
 */
export function CurrentRoleBlock({
  role,
  sinceLabel,
  fallback,
  children,
  locale,
  className,
}: CurrentRoleBlockProps) {
  if (!role) {
    if (!fallback && !children) return null;
    return (
      <span className={className}>
        {fallback}
        {fallback && children ? ' ' : null}
        {children}
      </span>
    );
  }
  return (
    <span className={className} data-current-role="" data-org={role.org}>
      {role.title}, {sinceLabel}{' '}
      <time dateTime={role.since}>{formatMonth(role.since, locale)}</time>.{children ? ' ' : null}
      {children}
    </span>
  );
}
