/**
 * Today as `YYYY-MM-DD` (UTC). Content dates are plain calendar dates with no time zone.
 *
 * It lives apart from the schemas so the browser code that needs the date (the freshness
 * provider) does not pull the schema library into a page's JavaScript.
 */
export const isoToday = (now: Date = new Date()): string => now.toISOString().slice(0, 10);
