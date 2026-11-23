import { z } from 'zod';

import { lineSchema, monthSchema, schemaVersionSchema, shortText } from './shared';

/**
 * The About page's live pieces. `now` is the month and one sentence; `currentRole` is the title,
 * the organisation and the month it started (tenure is computed at render, never typed).
 */
export const aboutSchema = z.strictObject({
  schemaVersion: schemaVersionSchema,
  now: z.strictObject({ month: monthSchema, text: lineSchema }).nullable(),
  currentRole: z
    .strictObject({ title: shortText(60), org: shortText(60), since: monthSchema })
    .nullable(),
});
export type About = z.infer<typeof aboutSchema>;

/** What a page gets when there is no `about.json`. */
export const emptyAbout: About = { schemaVersion: 1, now: null, currentRole: null };

/** A job-log line: a `Line` with no digits at all, so no number can slip through. */
export const titanLineSchema = lineSchema.regex(/^\D*$/, 'Must not contain a digit');

/** Most lines in one month of the job log. */
export const MAX_TITAN_LINES = 3;

/**
 * The job page's log. Tighter than a project log on purpose: month-only dates, at most three lines
 * a month, no digits, one entry per month, newest first. Nothing renders unless `enabled` is true.
 */
export const titanLogSchema = z
  .strictObject({
    schemaVersion: schemaVersionSchema,
    enabled: z.boolean().default(false),
    role: shortText(60),
    since: monthSchema,
    entries: z.array(
      z.strictObject({
        month: monthSchema,
        lines: z.array(titanLineSchema).min(1).max(MAX_TITAN_LINES),
      }),
    ),
  })
  .superRefine((log, ctx) => {
    log.entries.forEach((entry, index) => {
      const newer = log.entries[index - 1];
      if (log.entries.findIndex((other) => other.month === entry.month) !== index) {
        ctx.addIssue({
          code: 'custom',
          path: ['entries', index, 'month'],
          message: `More than one entry for ${entry.month}`,
        });
      } else if (newer && entry.month > newer.month) {
        ctx.addIssue({
          code: 'custom',
          path: ['entries', index, 'month'],
          message: 'The log is newest first',
        });
      }
    });
  });
export type TitanLog = z.infer<typeof titanLogSchema>;

/** One publish: when it happened and its id. The footer's "Last update" reads `publishedAt`. */
export const metaSchema = z.strictObject({
  schemaVersion: schemaVersionSchema,
  publishedAt: z.iso
    .datetime()
    .refine((value) => Date.parse(value) <= Date.now(), 'Publish time is in the future'),
  publishId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/, 'Expected a short id'),
});
export type Meta = z.infer<typeof metaSchema>;
