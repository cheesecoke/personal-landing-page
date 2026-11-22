import { z } from 'zod';

import { Href, Link, SchemaVersion, StatusLabel, Text } from './primitives';

/** One row of the index. `depth` is how far it is nested under the row above (0, 1 or 2). */
const IndexRow = z
  .object({
    /** The project's id in the map, so live status and the "new" marker can find the row. */
    id: Text,
    name: Text,
    status: StatusLabel,
    line: Text,
    href: Href,
    depth: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  })
  .strict();

export const ProjectsIndexContent = z
  .object({
    schemaVersion: SchemaVersion,
    title: Text,
    header: z.object({ title: Text, lead: Text }).strict(),
    /** Accessible name of the map section. */
    mapLabel: Text,
    index: z
      .object({
        title: Text,
        groups: z.array(z.object({ title: Text, rows: z.array(IndexRow).min(1) }).strict()).min(1),
      })
      .strict(),
    next: z.object({ label: Text, link: Link }).strict(),
  })
  .strict()
  .superRefine((page, ctx) => {
    const ids = page.index.groups.flatMap((group) => group.rows.map((row) => row.id));
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', message: 'row ids repeat' });
    for (const group of page.index.groups) {
      if (group.rows[0]?.depth !== 0) {
        ctx.addIssue({ code: 'custom', message: `group "${group.title}" must start at depth 0` });
      }
    }
  });

export type ProjectsIndexContent = z.infer<typeof ProjectsIndexContent>;
