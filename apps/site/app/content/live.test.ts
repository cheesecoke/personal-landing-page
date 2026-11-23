import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { selectFreshMarks, statusKeySchema } from '@cwc/content';
import { seedContent } from '@cwc/content/fixtures';

import {
  defaultLiveDir,
  familySlug,
  freshCandidates,
  liveContent,
  projectBySlug,
  publicProjectBySlug,
  statusKeyTone,
  toFreshProp,
} from './live.server';
import { statusTone } from './status';

afterEach(() => vi.unstubAllEnvs());

describe('defaultLiveDir', () => {
  it('finds the seed data in the content package', () => {
    vi.stubEnv('CONTENT_LIVE_DIR', '');
    expect(existsSync(join(defaultLiveDir(), 'meta.json'))).toBe(true);
  });

  it('can be pointed elsewhere', () => {
    vi.stubEnv('CONTENT_LIVE_DIR', '/somewhere/else');
    expect(defaultLiveDir()).toBe('/somewhere/else');
  });
});

describe('liveContent', () => {
  it('reads the seed data when no folder is set, once', () => {
    vi.stubEnv('CONTENT_LIVE_DIR', '');
    const content = liveContent();
    expect(content.projects.map((project) => project.slug)).toEqual(
      seedContent.projects.map((project) => project.slug),
    );
    expect(content.meta?.publishedAt).toBeTruthy();
    expect(liveContent()).toBe(content);
  });

  it('gives empty content for an empty folder', () => {
    vi.stubEnv('CONTENT_LIVE_DIR', mkdtempSync(join(tmpdir(), 'live-empty-')));
    expect(liveContent()).toEqual({
      meta: null,
      projects: [],
      about: { schemaVersion: 1, now: null, currentRole: null },
      titanLog: null,
    });
  });
});

describe('project by slug', () => {
  it('finds a project, and a public one only when it is public', () => {
    expect(projectBySlug(seedContent, 'distill')?.name).toBe('Distill');
    expect(publicProjectBySlug(seedContent, 'distill')).toBeUndefined();
    expect(publicProjectBySlug(seedContent, 'pas')?.log.length).toBeGreaterThan(0);
    expect(projectBySlug(seedContent, 'nope')).toBeUndefined();
  });
});

describe('freshCandidates', () => {
  it('groups a family under its top project', () => {
    expect(familySlug(seedContent.projects, 'lifebox')).toBe('pas');
    expect(familySlug(seedContent.projects, 'atti')).toBe('pas');
    expect(familySlug(seedContent.projects, 'thread-quest')).toBe('thread-quest');
    const candidates = freshCandidates(seedContent.projects);
    expect(candidates.find((candidate) => candidate.id === 'lifebox')?.project).toBe('pas');
  });

  it('leaves out name-only projects and follows the page order it is given', () => {
    const candidates = freshCandidates(seedContent.projects, ['thread-quest', 'pas']);
    expect(candidates.map((candidate) => candidate.id).slice(0, 2)).toEqual([
      'thread-quest',
      'pas',
    ]);
    expect(candidates.some((candidate) => candidate.id === 'distill')).toBe(false);
  });

  it('marks one row per family, three at most', () => {
    const order = ['pas', 'atti', 'lifebox', 'ai-system', 'personal-brain', 'duo-decide'];
    const marks = selectFreshMarks(freshCandidates(seedContent.projects, order), '2026-11-22');
    expect(Object.keys(marks)).toEqual(['pas', 'personal-brain', 'thread-quest']);
  });
});

describe('toFreshProp', () => {
  it('keeps the two numbers the markers take', () => {
    const mark = {
      changedAt: '2026-11-20',
      changeKind: 'update',
      ageDays: 2,
      lifeDays: 14,
      remaining: 12 / 14,
    } as const;
    expect(toFreshProp(mark)).toEqual({ ageDays: 2, lifeDays: 14 });
    expect(toFreshProp(null)).toBeNull();
  });
});

describe('statusKeyTone', () => {
  it('covers every status key', () => {
    expect(statusKeyTone('in-build')).toBe('build');
    expect(['live', 'daily-use', 'running'].map((key) => statusKeyTone(key as never))).toEqual(
      Array(3).fill('live'),
    );
    for (const key of statusKeySchema.options) {
      expect(['build', 'live', 'private']).toContain(statusKeyTone(key));
    }
  });

  it('agrees with the tone of the status word in the seed data', () => {
    for (const { status } of seedContent.projects) {
      expect(statusKeyTone(status.key)).toBe(statusTone(status.label));
    }
  });
});
