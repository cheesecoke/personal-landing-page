import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { handContent } from './hand.server';
import { statusTone } from './status';

describe('statusTone', () => {
  it('gives in-use projects the live dot and projects in build the build dot', () => {
    expect(statusTone('Daily use')).toBe('live');
    expect(statusTone('Running')).toBe('live');
    expect(statusTone('In build')).toBe('build');
  });

  it('gives every other state the hollow ring', () => {
    for (const label of ['Experiment', 'First version', 'In progress', 'Being expanded']) {
      expect(statusTone(label)).toBe('private');
    }
  });

  it('matches the Projects board for every row of the index', () => {
    const { projectsIndex } = handContent(join(import.meta.dirname, '../../content/hand'));
    const rows = projectsIndex.index.groups.flatMap((group) => group.rows);
    const tone = (id: string) => statusTone(rows.find((row) => row.id === id)!.status);
    expect(['pas', 'atti', 'personal-brain', 'business-brain'].map(tone)).toEqual(
      Array(4).fill('live'),
    );
    expect(['duo-decide', 'this-site'].map(tone)).toEqual(['build', 'build']);
    expect(
      ['lifebox', 'ai-system', 'distill', 'finance-brain', 'thread-quest', 'one-rep'].map(tone),
    ).toEqual(Array(6).fill('private'));
  });
});
