import { z } from 'zod';

import { isoDateSchema, lineSchema, shortText, slugSchema } from './shared';

/** `v1.0.0`. */
export const versionSchema = z.string().regex(/^v\d+\.\d+\.\d+$/, 'Expected a version like v1.0.0');
export type Version = z.infer<typeof versionSchema>;

/**
 * One captain's log entry: 1 to 4 terse lines. A `release` entry carries the version; an `update`
 * entry never does. `from` is set when the entry covers a span of days that ends on `date`.
 */
export const logEntrySchema = z
  .strictObject({
    id: slugSchema,
    date: isoDateSchema,
    from: isoDateSchema.optional(),
    kind: z.enum(['update', 'release']),
    lines: z.array(lineSchema).min(1).max(4),
    version: versionSchema.optional(),
  })
  .superRefine((entry, ctx) => {
    if (entry.kind === 'release' && entry.version === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['version'],
        message: 'A release entry needs a version',
      });
    }
    if (entry.kind === 'update' && entry.version !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['version'],
        message: 'Only a release entry has a version',
      });
    }
    if (entry.from !== undefined && entry.from >= entry.date) {
      ctx.addIssue({ code: 'custom', path: ['from'], message: '`from` must be before `date`' });
    }
  });
export type LogEntry = z.infer<typeof logEntrySchema>;

export const releaseChannelSchema = z.enum(['app-store', 'play-store', 'testflight', 'web']);
export type ReleaseChannel = z.infer<typeof releaseChannelSchema>;

/** A usage number with the day it was read. */
export const usageSchema = z.strictObject({
  label: shortText(60),
  value: shortText(24),
  asOf: isoDateSchema,
});
export type Usage = z.infer<typeof usageSchema>;

/** The current release of a live project. */
export const releaseSchema = z.strictObject({
  version: versionSchema,
  date: isoDateSchema,
  channel: releaseChannelSchema,
  notes: z.array(lineSchema).min(1).max(6),
  usage: z.array(usageSchema),
});
export type Release = z.infer<typeof releaseSchema>;
