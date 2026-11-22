import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { issuePaths } from './issues';
import { projectSchema } from './project';

/** A fixture is named `<schema>.<case>.json`; the prefix picks the schema it is checked against. */
const schemas: Record<string, z.ZodType> = {
  project: projectSchema,
};

const fixturesDir = join(import.meta.dirname, '..', '..', 'fixtures');
const read = (folder: string) =>
  readdirSync(join(fixturesDir, folder))
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      file,
      schema: schemas[file.split('.')[0] ?? ''],
      json: JSON.parse(readFileSync(join(fixturesDir, folder, file), 'utf8')) as unknown,
    }));

describe('valid fixtures', () => {
  it.each(read('valid'))('$file parses', ({ schema, json }) => {
    expect(schema, 'no schema for this file prefix').toBeDefined();
    const result = schema!.safeParse(json);
    expect(result.success ? [] : issuePaths(result.error)).toEqual([]);
  });
});

describe('invalid fixtures', () => {
  it.each(read('invalid'))('$file fails at its expected path', ({ schema, json }) => {
    expect(schema, 'no schema for this file prefix').toBeDefined();
    const { expectPath, data } = json as { expectPath: string; data: unknown };
    const result = schema!.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) expect(issuePaths(result.error)).toContain(expectPath);
  });

  it('fails only at the expected path, so each fixture tests one rule', () => {
    for (const { file, schema, json } of read('invalid')) {
      const { expectPath, data } = json as { expectPath: string; data: unknown };
      const result = schema!.safeParse(data);
      expect(result.success ? [] : issuePaths(result.error), file).toEqual([expectPath]);
    }
  });
});
