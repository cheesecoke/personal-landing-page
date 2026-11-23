import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fixtures, seedContent } from '../fixtures';
import { getProject, getPublicProject } from '../live';
import {
  clearLiveContentCache,
  ContentError,
  loadLiveContent,
  resolveLiveDir,
  seedLiveDir,
} from './load';

let dir: string;
const write = (file: string, data: unknown) => {
  mkdirSync(join(dir, 'projects'), { recursive: true });
  writeFileSync(join(dir, file), typeof data === 'string' ? data : JSON.stringify(data));
};
const failure = (run: () => unknown): ContentError => {
  try {
    run();
  } catch (error) {
    if (error instanceof ContentError) return error;
    throw error;
  }
  throw new Error('Expected a ContentError');
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'cwc-content-'));
  clearLiveContentCache();
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe('which folder is read', () => {
  it('is the argument, then CONTENT_LIVE_DIR, then the seed fixtures', () => {
    vi.stubEnv('CONTENT_LIVE_DIR', '');
    expect(resolveLiveDir()).toBe(seedLiveDir);
    vi.stubEnv('CONTENT_LIVE_DIR', dir);
    expect(resolveLiveDir()).toBe(dir);
    expect(resolveLiveDir(seedLiveDir)).toBe(seedLiveDir);
  });
});

describe('the seed data', () => {
  it('loads, and is the same data the fixtures module exports', () => {
    expect(loadLiveContent(seedLiveDir)).toEqual(seedContent);
  });

  it('has a file for every project page, and Distill as name-only', () => {
    const content = loadLiveContent(seedLiveDir);
    for (const slug of [
      'pas',
      'atti',
      'lifebox',
      'personal-brain',
      'ai-system',
      'duo-decide',
      'thread-quest',
    ]) {
      expect(getPublicProject(content, slug), slug).toBeDefined();
    }
    expect(getProject(content, 'distill')).toEqual({
      schemaVersion: 1,
      visibility: 'name-only',
      slug: 'distill',
      name: 'Distill',
      parent: 'ai-system',
      status: { key: 'next-version', label: 'Next version' },
    });
    expect(getPublicProject(content, 'distill')).toBeUndefined();
  });

  it('keeps the job log off and no project live', () => {
    const content = loadLiveContent(seedLiveDir);
    expect(content.titanLog).toBeNull();
    expect(content.projects.filter((p) => p.visibility === 'public' && p.state === 'live')).toEqual(
      [],
    );
  });

  it('has no date after 2026-11-22', () => {
    const dates = JSON.stringify(seedContent).match(/\d{4}-\d{2}-\d{2}/g) ?? [];
    expect(dates.length).toBeGreaterThan(0);
    expect(dates.filter((date) => date > '2026-11-22')).toEqual([]);
  });
});

describe('missing files mean defaults', () => {
  it('returns empty content for an empty folder', () => {
    expect(loadLiveContent(dir)).toEqual({
      meta: null,
      projects: [],
      about: { schemaVersion: 1, now: null, currentRole: null },
      titanLog: null,
    });
  });

  it('returns empty content for a folder that does not exist', () => {
    expect(loadLiveContent(join(dir, 'nope')).projects).toEqual([]);
  });

  it('reads the files that are there', () => {
    write('about.json', fixtures.aboutGrowing);
    write('projects/duo-decide.json', fixtures.projectGrowing);
    const content = loadLiveContent(dir);
    expect(content.about.now?.month).toBe('2026-11');
    expect(content.projects.map((p) => p.slug)).toEqual(['duo-decide']);
    expect(content.meta).toBeNull();
  });

  it('returns the job log only when it is enabled', () => {
    write('titan-log.json', fixtures.titanLogDisabled);
    expect(loadLiveContent(dir).titanLog).toBeNull();
    clearLiveContentCache();
    write('titan-log.json', fixtures.titanLogEnabled);
    expect(loadLiveContent(dir).titanLog?.entries).toHaveLength(3);
  });
});

describe('an invalid file throws with the file and the path', () => {
  it('names a schema failure', () => {
    write('projects/duo-decide.json', { ...fixtures.projectGrowing, state: 'resting' });
    const error = failure(() => loadLiveContent(dir));
    expect(error.file).toBe('projects/duo-decide.json');
    expect(error.path).toBe('state');
    expect(error.message).toContain('projects/duo-decide.json at state');
  });

  it('names a nested path', () => {
    write('titan-log.json', {
      ...fixtures.titanLogEnabled,
      entries: [{ month: '2026-10', lines: ['Shipped 3 things.'] }],
    });
    const error = failure(() => loadLiveContent(dir));
    expect([error.file, error.path]).toEqual(['titan-log.json', 'entries.0.lines.0']);
  });

  it('validates the job log even while it is disabled', () => {
    write('titan-log.json', {
      ...fixtures.titanLogDisabled,
      entries: [{ month: '2026-10-31', lines: ['A line.'] }],
    });
    expect(failure(() => loadLiveContent(dir)).path).toBe('entries.0.month');
  });

  it('rejects broken JSON', () => {
    write('about.json', '{ "schemaVersion": 1, ');
    const error = failure(() => loadLiveContent(dir));
    expect([error.file, error.path]).toEqual(['about.json', '']);
  });

  it('rejects a slug that does not match its file name', () => {
    write('projects/duo.json', fixtures.projectGrowing);
    expect(failure(() => loadLiveContent(dir)).path).toBe('slug');
  });

  it('rejects a parent that is not in the folder', () => {
    write('projects/distill.json', fixtures.projectNameOnly);
    const error = failure(() => loadLiveContent(dir));
    expect([error.file, error.path]).toEqual(['projects/distill.json', 'parent']);
  });

  it('rejects a file it does not know', () => {
    write('notes.json', {});
    expect(failure(() => loadLiveContent(dir)).file).toBe('notes.json');
  });
});

describe('memoised per build', () => {
  it('reads a folder once', () => {
    write('about.json', fixtures.aboutGrowing);
    const first = loadLiveContent(dir);
    write('about.json', fixtures.aboutEmpty);
    expect(loadLiveContent(dir)).toBe(first);
    clearLiveContentCache();
    expect(loadLiveContent(dir).about.now).toBeNull();
  });
});
