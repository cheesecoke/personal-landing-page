const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface Parts {
  year: number;
  month: number;
  day: number;
}

function parts(iso: string): Parts | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = match[3] ? Number(match[3]) : 1;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/**
 * A log date as the boards print it: `5 Nov 2026`. With `from`, the stretch it covers:
 * `14 to 19 Sep 2026`, `28 Oct to 5 Nov 2026`. Returns the input unchanged when it is not an ISO
 * date, so a bad value shows up instead of throwing.
 */
export function formatLogDate(date: string, from?: string): string {
  const end = parts(date);
  if (!end) return date;
  const endText = `${end.day} ${MONTHS[end.month]} ${end.year}`;
  const start = from && from !== date ? parts(from) : null;
  if (!start) return endText;
  if (start.year !== end.year)
    return `${start.day} ${MONTHS[start.month]} ${start.year} to ${endText}`;
  if (start.month !== end.month) return `${start.day} ${MONTHS[start.month]} to ${endText}`;
  return `${start.day} to ${endText}`;
}

/** A month as the job log prints it: `2026-10` is `October 2026`. */
export function formatLogMonth(month: string): string {
  const value = parts(month);
  return value ? `${LONG_MONTHS[value.month]} ${value.year}` : month;
}

/** The last day of a month (`2026-10` is `2026-10-31`), the day a month's stardate is drawn from. */
export function monthEnd(month: string): string {
  const value = parts(month);
  if (!value) return month;
  const last = new Date(Date.UTC(value.year, value.month + 1, 0)).getUTCDate();
  return `${month.slice(0, 7)}-${String(last).padStart(2, '0')}`;
}
