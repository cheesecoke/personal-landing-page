// Writes content.schema.json from the zod schemas: `pnpm --filter @cwc/content generate`.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { format } from 'prettier';

import { contentJsonSchema } from '../src/json-schema';

const file = join(import.meta.dirname, '..', 'content.schema.json');
writeFileSync(file, await format(JSON.stringify(contentJsonSchema()), { parser: 'json' }));
console.log(`wrote ${file}`);
