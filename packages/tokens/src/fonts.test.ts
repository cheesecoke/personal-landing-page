import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { font, type } from './tokens';

const fontsDir = join(import.meta.dirname, '..', 'fonts');
const css = readFileSync(join(fontsDir, 'fonts.css'), 'utf8');

describe('self-hosted fonts', () => {
  it('ships every file fonts.css points at, and the licences', () => {
    const files = [...css.matchAll(/url\('\.\/([^']+)'\)/g)].map((match) => match[1] ?? '');
    expect(files).toHaveLength(4);
    for (const file of [...files, 'LICENSE-mona-sans.txt', 'LICENSE-tomorrow.txt']) {
      expect(existsSync(join(fontsDir, file)), file).toBe(true);
    }
  });

  it('declares the first family of each font stack', () => {
    for (const stack of Object.values(font)) {
      const family = stack.split(',')[0]?.replaceAll("'", '') ?? '';
      expect(css).toMatch(new RegExp(`font-family: '?${family}'?;`));
    }
  });

  it('has a Tomorrow face for every readout weight in the type roles', () => {
    for (const role of Object.values(type)) {
      if (role.font === 'readout') expect(css).toContain(`font-weight: ${role.weight};`);
    }
  });
});
