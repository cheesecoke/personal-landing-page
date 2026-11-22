const DAY = 86_400_000;

/**
 * A date as a stardate: the year, a dot, and the day of the year in three digits
 * (20 Nov 2026 is `2026.324`). Takes an ISO date (`YYYY-MM-DD`) or a `Date`, read as UTC.
 */
export function toStardate(date: string | Date): string {
  const value = typeof date === 'string' ? new Date(`${date.slice(0, 10)}T00:00:00Z`) : date;
  if (Number.isNaN(value.getTime()))
    throw new RangeError(`toStardate: not a date: ${String(date)}`);
  const year = value.getUTCFullYear();
  const day = Math.floor((value.getTime() - Date.UTC(year, 0, 1)) / DAY) + 1;
  return `${year}.${String(day).padStart(3, '0')}`;
}
