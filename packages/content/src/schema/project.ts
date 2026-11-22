import { z } from 'zod';

import { logEntrySchema, releaseSchema } from './log';
import { isoDateSchema, monthSchema, schemaVersionSchema, shortText, slugSchema } from './shared';
import { freshSchema, ringSchema, shootSchema } from './shoot';

/** Most log entries a project file carries. */
export const MAX_LOG_ENTRIES = 12;
/** Most open shoots a project shows. */
export const MAX_OPEN_SHOOTS = 6;

/**
 * `growing` or `live`, from the project registry. "No update" is derived from the dates (no entry
 * inside the cadence window); it is never stored.
 */
export const projectStateSchema = z.enum(['growing', 'live']);
export type ProjectState = z.infer<typeof projectStateSchema>;

export const statusKeySchema = z.enum([
  'in-build',
  'live',
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
    /** The captain's log, newest first. */
    log: z.array(logEntrySchema).max(MAX_LOG_ENTRIES),
    /** The current release. Only a live project has one. */
    release: releaseSchema.nullable(),
    shoots: z.array(shootSchema),
    /** Branch rings, oldest first (drawn from the centre out). */
    rings: z.array(ringSchema),
    facts: z.array(factSchema),
    fresh: freshSchema,
  })
  .superRefine((project, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path, message });
    const duplicates = (items: { id: string }[], list: string) =>
      items.forEach((item, index) => {
        if (items.findIndex((other) => other.id === item.id) !== index) {
          issue([list, index, 'id'], `Duplicate id "${item.id}"`);
        }
      });
    const live = project.state === 'live';

    duplicates(project.log, 'log');
    duplicates(project.shoots, 'shoots');
    duplicates(project.rings, 'rings');

    project.log.forEach((entry, index) => {
      const newer = project.log[index - 1];
      if (newer && entry.date > newer.date) {
        issue(['log', index, 'date'], 'The log is newest first');
      }
      if (entry.kind === 'release' && !live) {
        issue(['log', index, 'kind'], 'Only a live project has release entries');
      }
    });
    if (project.release !== null && !live) {
      issue(['release'], 'Only a live project has a release');
    }
    project.rings.forEach((ring, index) => {
      if (ring.kind === 'release' && !live) {
        issue(['rings', index, 'kind'], 'Only a live project has release rings');
      }
    });
    if (project.shoots.filter((shoot) => shoot.state === 'open').length > MAX_OPEN_SHOOTS) {
      issue(['shoots'], `At most ${MAX_OPEN_SHOOTS} open shoots`);
    }

    // The marker date must be the date of the newest item of the kind it names.
    if (project.fresh !== null) {
      const { changedAt, changeKind } = project.fresh;
      const newest = (dates: (string | undefined)[]) =>
        dates
          .filter((date) => date !== undefined)
          .sort()
          .at(-1);
      const resolvedDates = (state: 'grown' | 'answered') =>
        project.shoots
          .filter((shoot) => shoot.state === state)
          .map((shoot) => shoot.resolved?.date);
      const expected = {
        update: () => newest(project.log.filter((e) => e.kind === 'update').map((e) => e.date)),
        release: () => project.release?.date,
        grown: () => newest(resolvedDates('grown')),
        answered: () => newest(resolvedDates('answered')),
        state: () =>
          isoDateSchema.safeParse(project.status.since).success ? project.status.since : undefined,
      }[changeKind]();
      if (expected === undefined) {
        issue(['fresh', 'changeKind'], `Nothing dated for a "${changeKind}" change to point to`);
      } else if (expected !== changedAt) {
        issue(['fresh', 'changedAt'], `Expected ${expected}, the newest "${changeKind}" date`);
      }
    }

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
