import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contentJsonSchema } from './json-schema';

describe('content.schema.json', () => {
  const committed = JSON.parse(
    readFileSync(join(import.meta.dirname, '..', 'content.schema.json'), 'utf8'),
  ) as ReturnType<typeof contentJsonSchema>;

  it('is in step with the zod schemas (run `pnpm --filter @cwc/content generate`)', () => {
    expect(committed).toEqual(contentJsonSchema());
  });

  it('has one strict definition per file', () => {
    expect(Object.keys(committed['x-files'])).toEqual([
      'meta.json',
      'projects/<slug>.json',
      'about.json',
      'titan-log.json',
    ]);
    expect(JSON.stringify(committed.$defs)).not.toContain('"additionalProperties":true');
  });
});
