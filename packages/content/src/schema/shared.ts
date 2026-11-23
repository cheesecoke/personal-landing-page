import { z } from 'zod';

import { isoToday } from '../today';

/** In every file. A bump is a coordinated change in the site and in the job that publishes. */
export const SCHEMA_VERSION = 1;
export const schemaVersionSchema = z.literal(SCHEMA_VERSION);

export { isoToday };

const isRealDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

/** `YYYY-MM-DD`: a real calendar date, never after the day the content is read (the build date). */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a date as YYYY-MM-DD')
  .refine(isRealDate, 'Not a real calendar date')
  .refine((value) => value <= isoToday(), 'Date is in the future');
export type IsoDate = z.infer<typeof isoDateSchema>;

/** `YYYY-MM`, never after the current month. */
export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected a month as YYYY-MM')
  .refine((value) => value <= isoToday().slice(0, 7), 'Month is in the future');
export type Month = z.infer<typeof monthSchema>;

/**
 * One terse line of published copy: 1 to 140 characters on one line, trimmed, with no URL and no
 * ticket reference such as `#123`. The patterns are plain regular expressions so they also land in
 * the exported JSON Schema.
 */
export const lineSchema = z
  .string()
  .min(1)
  .max(140)
  .regex(/^\S(?:.*\S)?$/, 'Must be one trimmed line')
  .regex(/^(?!.*(?:[Hh][Tt][Tt][Pp][Ss]?:\/\/|[Ww][Ww][Ww]\.)).*$/, 'Must not contain a URL')
  .regex(/^(?!.*#\d).*$/, 'Must not contain a ticket reference like #123');
export type Line = z.infer<typeof lineSchema>;

/** A project id as it appears in the route table and in file names: `duo-decide`. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected a kebab-case slug');
export type Slug = z.infer<typeof slugSchema>;

/** A short display string (names, labels): trimmed, one line. */
export const shortText = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .regex(/^\S(?:.*\S)?$/, 'Must be one trimmed line');
