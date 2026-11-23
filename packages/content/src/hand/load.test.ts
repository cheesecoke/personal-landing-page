import { mkdtempSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  findConfirms,
  findMissingMedia,
  HandContentError,
  handFilePaths,
  listHandMedia,
  loadHandContent,
} from './load';

// The site's real content. The test reads files; it does not import from apps/.
const site = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../apps/site');
const handDir = join(site, 'content/hand');
const publicDir = join(site, 'public');

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe('loadHandContent', () => {
  it('loads and validates every hand file in the site', () => {
    const content = loadHandContent(handDir);
    const loaded = Object.keys(content).length - 1 + Object.keys(content.projects).length;
    expect(loaded).toBe(handFilePaths.length);
  });

  it('has a schema for every file in the hand folder', () => {
    const onDisk = filesUnder(handDir).map((path) => relative(handDir, path));
    expect(onDisk.sort()).toEqual([...handFilePaths].sort());
  });

  it('points only at media that exists, and ships no media that nothing points at', () => {
    const content = loadHandContent(handDir);
    expect(findMissingMedia(content, publicDir)).toEqual([]);
    const shipped = filesUnder(join(publicDir, 'media')).map(
      (path) => `/${relative(publicDir, path).split('\\').join('/')}`,
    );
    expect(shipped.sort()).toEqual(listHandMedia(content));
  });

  it('names the file and the path when a file does not match its schema', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hand-'));
    writeFileSync(join(dir, 'home.json'), JSON.stringify({ schemaVersion: 1, title: '' }));
    expect(() => loadHandContent(dir)).toThrow(HandContentError);
    expect(() => loadHandContent(dir)).toThrow(/home\.json[\s\S]*title/);
  });

  it('fails on a missing file and on broken JSON', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hand-'));
    expect(() => loadHandContent(dir)).toThrow(/missing/);
    writeFileSync(join(dir, 'home.json'), '{');
    expect(() => loadHandContent(dir)).toThrow(/not valid JSON/);
  });
});

describe('findConfirms', () => {
  it('finds markers anywhere in the content, with their path', () => {
    const found = findConfirms({ a: [{ confirm: ['[CONFIRM: check this]'] }], b: 'fine' });
    expect(found).toEqual([{ path: 'a[0].confirm[0]', text: '[CONFIRM: check this]' }]);
  });
});
