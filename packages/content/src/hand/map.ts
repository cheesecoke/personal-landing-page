import { z } from 'zod';

import { Href, SchemaVersion, StatusLabel, Text } from './primitives';

/** The project tree (canopy): its nodes, what feeds what, and the words on the card. */

const NodeId = z.string().regex(/^[a-z][a-z0-9-]*$/);

const MapNode = z
  .object({
    id: NodeId,
    label: Text,
    /** The node this one sits inside, or null for a branch off the stump. */
    parent: NodeId.nullable(),
    kind: z.enum(['system', 'product', 'both']),
    status: StatusLabel,
    oneLine: Text,
    /** Prominence, 1 (small) to 5 (large). */
    weight: z.number().int().min(1).max(5),
    /** First commit, 'YYYY-MM', or null when it is not known. */
    since: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
      .nullable(),
    /** True when the project has its own page; false when it is an entry on another page. */
    page: z.boolean(),
    /** The route the card shows and opens. */
    href: Href,
    /** Card link wording, when it is not the default. */
    open: Text.optional(),
  })
  .strict();

const Flow = z.object({ from: NodeId, to: NodeId, label: Text }).strict();

export const MapContent = z
  .object({
    schemaVersion: SchemaVersion,
    headline: Text,
    hint: Text,
    root: z.object({ id: NodeId, label: Text, status: Text, oneLine: Text }).strict(),
    nodes: z.array(MapNode).min(1),
    flows: z.array(Flow),
    /** Where to start, in order. */
    start: z.array(NodeId).min(1),
    /** Words the card and the legend print. `{parent}` is replaced with the parent's label. */
    labels: z
      .object({
        kinds: z.object({ system: Text, product: Text, both: Text }).strict(),
        legend: z.object({ start: Text, ungrown: Text, feeds: Text }).strict(),
        open: Text,
        openInParent: Text,
        ungrown: Text,
        partOf: Text,
        inside: Text,
        feeds: Text,
        fedBy: Text,
        back: Text,
      })
      .strict(),
  })
  .strict()
  .superRefine((map, ctx) => {
    const ids = new Set(map.nodes.map((node) => node.id));
    if (ids.size !== map.nodes.length) ctx.addIssue({ code: 'custom', message: 'node ids repeat' });
    const known = (id: string, where: string) => {
      if (!ids.has(id)) ctx.addIssue({ code: 'custom', message: `${where}: unknown node "${id}"` });
    };
    for (const node of map.nodes) if (node.parent) known(node.parent, `parent of ${node.id}`);
    for (const flow of map.flows) {
      known(flow.from, 'flow.from');
      known(flow.to, 'flow.to');
    }
    for (const id of map.start) known(id, 'start');
  });

export type MapContent = z.infer<typeof MapContent>;
export type MapNode = z.infer<typeof MapNode>;
