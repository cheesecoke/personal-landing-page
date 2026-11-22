import { z } from 'zod';

import { isoDateSchema, monthSchema, schemaVersionSchema, shortText, slugSchema } from './shared';

/**
 * `growing` or `live`, from the project registry. "No update" is derived from the dates (no entry
 * inside the cadence window); it is never stored.
 */
export const projectStateSchema = z.enum(['growing', 'live']);
export type ProjectState = z.infer<typeof projectStateSchema>;

export const statusKeySchema = z.enum([
  'in-build',
  'daily-use',
  'first-version',
  'next-version',
  'being-expanded',
  'being-overhauled',
  'experiment',
  'running',
  'in-progress',
]);
export type StatusKey = z.infer<typeof statusKeySchema>;

/**
 * The status word shown beside the dot. `since` is when the project took this status: a day when
 * the day is known, otherwise a month, and left out when neither is known.
 */
export const statusSchema = z.strictObject({
  key: statusKeySchema,
  label: shortText(32),
  since: z.union([isoDateSchema, monthSchema]).optional(),
});
export type Status = z.infer<typeof statusSchema>;

/** A counted fact with the day it was counted. `value` is display text ("1,167"). */
export const factSchema = z.strictObject({
  key: slugSchema,
  value: shortText(24),
  label: shortText(60),
  asOf: isoDateSchema,
});
export type Fact = z.infer<typeof factSchema>;

export const projectKindSchema = z.enum(['system', 'product', 'both']);
export type ProjectKind = z.infer<typeof projectKindSchema>;

const projectIdentity = {
  schemaVersion: schemaVersionSchema,
  slug: slugSchema,
  name: shortText(40),
  /** The slug of the project this one sits under on the map, or null at the top level. */
  parent: slugSchema.nullable(),
  status: statusSchema,
};

export const publicProjectSchema = z
  .strictObject({
    ...projectIdentity,
    visibility: z.literal('public'),
    kind: projectKindSchema,
    state: projectStateSchema,
    /** The gated "where it's at" paragraph. The summary stays in hand content. */
    whereItsAt: z.string().min(1).max(400).optional(),
    facts: z.array(factSchema),
  })
  .superRefine((project, ctx) => {
    project.facts.forEach((fact, index) => {
      if (project.facts.findIndex((other) => other.key === fact.key) !== index) {
        ctx.addIssue({
          code: 'custom',
          path: ['facts', index, 'key'],
          message: `Duplicate fact key "${fact.key}"`,
        });
      }
    });
    if (project.parent === project.slug) {
      ctx.addIssue({
        code: 'custom',
        path: ['parent'],
        message: 'A project cannot be its own parent',
      });
    }
  });
export type PublicProject = z.infer<typeof publicProjectSchema>;

/** A project that shows its name and one line of status, and nothing else. */
export const nameOnlyProjectSchema = z.strictObject({
  ...projectIdentity,
  visibility: z.literal('name-only'),
});
export type NameOnlyProject = z.infer<typeof nameOnlyProjectSchema>;

export const projectSchema = z.discriminatedUnion('visibility', [
  publicProjectSchema,
  nameOnlyProjectSchema,
]);
export type Project = z.infer<typeof projectSchema>;

export const isPublicProject = (project: Project): project is PublicProject =>
  project.visibility === 'public';
