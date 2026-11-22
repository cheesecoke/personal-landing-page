/** A calendar month as data: `YYYY-MM`. */
export type Month = string;

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

function parts(month: Month): { year: number; month: number } | null {
  const match = MONTH.exec(month);
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
}

/** "2026-01" to "January 2026". The same on the server and in every browser time zone. */
export function formatMonth(month: Month, locale = 'en-US'): string {
  const value = parts(month);
  if (!value) return month;
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(value.year, value.month - 1, 1)));
}

/**
 * Whole months from `since` up to `now` (an ISO date or month). Never negative. The tenure is
 * always worked out from the start month; nobody types it.
 */
export function tenureMonths(since: Month, now: string): number {
  const from = parts(since);
  const to = parts(now.slice(0, 7));
  if (!from || !to) return 0;
  return Math.max(0, (to.year - from.year) * 12 + (to.month - from.month));
}
