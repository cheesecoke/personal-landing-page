/**
 * The "site date" toolbar: the date stories treat as today, so freshness (new markers, the nav
 * ring, "no update") can be scrubbed. The default is fixed so screenshots are stable.
 */
export const DEFAULT_SITE_DATE = '2026-11-22';

const addDays = (isoDate: string, days: number) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const siteDateItems = [
  { value: DEFAULT_SITE_DATE, title: `${DEFAULT_SITE_DATE} (default)` },
  ...[3, 7, 14, 21, 30, 45].map((days) => ({
    value: addDays(DEFAULT_SITE_DATE, days),
    title: `${addDays(DEFAULT_SITE_DATE, days)} (+${days}d)`,
  })),
  { value: 'today', title: 'Today (real clock)' },
];

/** Resolve the toolbar value to an ISO date (YYYY-MM-DD). */
export const resolveSiteDate = (value: unknown): string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : new Date().toISOString().slice(0, 10);
