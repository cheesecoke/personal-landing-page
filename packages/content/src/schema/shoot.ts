import { z } from 'zod';

import { isoDateSchema, lineSchema, shortText, slugSchema } from './shared';

export const shootKindSchema = z.enum(['goal', 'idea', 'question']);
export type ShootKind = z.infer<typeof shootKindSchema>;

export const shootStateSchema = z.enum(['open', 'grown', 'answered', 'dropped']);
export type ShootState = z.infer<typeof shootStateSchema>;

/**
 * One goal, idea or question: a branch not yet grown. `resolved` says when and how it grew or was
 * answered; it is required for `grown` and `answered`, and null while the shoot is `open`.
 */
export const shootSchema = z
  .strictObject({
    id: slugSchema,
    label: shortText(60),
    kind: shootKindSchema,
    state: shootStateSchema,
    note: lineSchema.optional(),
    resolved: z.strictObject({ date: isoDateSchema, text: lineSchema }).nullable(),
  })
  .superRefine((shoot, ctx) => {
    const needsResolution = shoot.state === 'grown' || shoot.state === 'answered';
    if (needsResolution && shoot.resolved === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['resolved'],
        message: `A shoot that is ${shoot.state} needs \`resolved\``,
      });
    }
    if (shoot.state === 'open' && shoot.resolved !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['resolved'],
        message: 'An open shoot has no resolution',
      });
    }
  });
export type Shoot = z.infer<typeof shootSchema>;

/**
 * One ring of the project's branch cross-section: a stretch of work (`period`) or a release.
 * `weight` is how busy it was in four steps, never a raw count.
 */
export const ringSchema = z.strictObject({
  id: slugSchema,
  label: shortText(24),
  weight: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  kind: z.enum(['period', 'release']),
  text: lineSchema,
});
export type Ring = z.infer<typeof ringSchema>;

export const freshKindSchema = z.enum(['update', 'release', 'grown', 'answered', 'state']);
export type FreshChangeKind = z.infer<typeof freshKindSchema>;

/**
 * The date behind the "new" marker and what changed on it. The browser draws the marker from this
 * date and lets it drain; null means there is nothing to mark.
 */
export const freshSchema = z
  .strictObject({ changedAt: isoDateSchema, changeKind: freshKindSchema })
  .nullable();
export type Fresh = z.infer<typeof freshSchema>;
