import { z } from 'zod';

import { aboutSchema, metaSchema, titanLogSchema } from './schema/about';
import { projectSchema } from './schema/project';
import { SCHEMA_VERSION } from './schema/shared';

/** Each file in the live folder and the schema it must match. */
export const contentFiles = {
  'meta.json': { def: 'meta', schema: metaSchema },
  'projects/<slug>.json': { def: 'project', schema: projectSchema },
  'about.json': { def: 'about', schema: aboutSchema },
  'titan-log.json': { def: 'titanLog', schema: titanLogSchema },
} as const;

/**
 * The contract as one JSON Schema document (draft 2020-12), for the job that publishes content.
 * It carries shapes, enums, lengths and patterns. Rules across fields (newest first, a release
 * only when live, no future dates) are checked by the zod schemas when the site builds.
 */
export const contentJsonSchema = () => {
  const defs: Record<string, unknown> = {};
  const files: Record<string, string> = {};
  for (const [file, { def, schema }] of Object.entries(contentFiles)) {
    const { $schema: _draft, ...body } = z.toJSONSchema(schema, { io: 'input' });
    defs[def] = body;
    files[file] = `#/$defs/${def}`;
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Live content',
    description:
      'One definition per file in the live content folder. Validate each file against the definition x-files points it to.',
    'x-schemaVersion': SCHEMA_VERSION,
    'x-files': files,
    $defs: defs,
  };
};
