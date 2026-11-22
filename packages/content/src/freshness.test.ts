import { describe, expect, it } from 'vitest';

import { fresh as tokens } from '@cwc/tokens';

import { fixtures } from './fixtures';
import {
  daysBetween,
  freshLifetime,
  freshMark,
  hasNavRing,
  maxFreshLifetime,
  selectFreshMarks,
  type FreshCandidate,
} from './freshness';
import type { Fresh } from './schema/shoot';

// The clock is frozen: every rule takes "now" as an argument.
const NOW = '2026-11-22';
const daysAgo = (days: number) => {
  const date = new Date(`${NOW}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};
const changed = (days: number, changeKind: NonNullable<Fresh>['changeKind'] = 'update'): Fresh => ({
  changedAt: daysAgo(days),
  changeKind,
});
const candidate = (id: string, fresh: Fresh, project = id): FreshCandidate => ({
  id,
  project,
  fresh,
});

describe('daysBetween', () => {
  it('counts calendar days, across months and years', () => {
    expect(daysBetween('2026-11-20', '2026-11-22')).toBe(2);
    expect(daysBetween('2026-11-22', '2026-11-22')).toBe(0);
    expect(daysBetween('2026-10-28', '2026-11-22')).toBe(25);
    expect(daysBetween('2024-12-10', '2026-11-22')).toBe(712);
    expect(daysBetween('2026-11-23', '2026-11-22')).toBe(-1);
  });
});

describe('lifetimes come from the tokens', () => {
  it('is 14 days for an update, 21 for grown and answered, 30 for a release', () => {
    expect(freshLifetime('update')).toBe(tokens.life.update);
    expect(freshLifetime('grown')).toBe(tokens.life.grown);
    expect(freshLifetime('answered')).toBe(tokens.life.answered);
    expect(freshLifetime('release')).toBe(tokens.life.release);
    expect([
      tokens.life.update,
      tokens.life.grown,
      tokens.life.answered,
      tokens.life.release,
    ]).toEqual([14, 21, 21, 30]);
  });

  it('gives a state change the life of an update', () => {
    expect(freshLifetime('state')).toBe(tokens.life.update);
  });

  it('knows the longest lifetime', () => {
    expect(maxFreshLifetime).toBe(30);
  });
});

describe('freshMark', () => {
  it('is full on day 0', () => {
    expect(freshMark(changed(0), NOW)).toEqual({
      changedAt: NOW,
      changeKind: 'update',
      ageDays: 0,
      lifeDays: 14,
      remaining: 1,
    });
  });

  it('is half drained at mid-life', () => {
    expect(freshMark(changed(7), NOW)).toMatchObject({ ageDays: 7, remaining: 0.5 });
  });

  it('still shows on the last day', () => {
    const mark = freshMark(changed(13), NOW);
    expect(mark?.ageDays).toBe(13);
    expect(mark?.remaining).toBeCloseTo(1 / 14);
  });

  it('is gone once the lifetime has passed', () => {
    expect(freshMark(changed(14), NOW)).toBeNull();
    expect(freshMark(changed(400), NOW)).toBeNull();
  });

  it.each([
    ['update', 13, 14],
    ['state', 13, 14],
    ['grown', 20, 21],
    ['answered', 20, 21],
    ['release', 29, 30],
  ] as const)('a %s shows through day %i and is gone on day %i', (kind, lastDay, gone) => {
    expect(freshMark(changed(lastDay, kind), NOW)).not.toBeNull();
    expect(freshMark(changed(gone, kind), NOW)).toBeNull();
  });

  it('is nothing when there is nothing to mark', () => {
    expect(freshMark(null, NOW)).toBeNull();
    expect(freshMark(undefined, NOW)).toBeNull();
  });

  it('treats a date ahead of the clock as today', () => {
    expect(freshMark(changed(-1), NOW)).toMatchObject({ ageDays: 0, remaining: 1 });
  });

  it('reads the fixtures: the growing project has expired, the live example is fresh', () => {
    expect(fixtures.projectGrowing.fresh).toEqual({
      changedAt: '2026-11-05',
      changeKind: 'update',
    });
    expect(freshMark(fixtures.projectGrowing.fresh, NOW)).toBeNull();
    expect(freshMark(fixtures.projectGrowing.fresh, '2026-11-08')).toMatchObject({ ageDays: 3 });
    expect(freshMark(fixtures.projectLive.fresh, NOW)).toMatchObject({ ageDays: 1, lifeDays: 30 });
    expect(freshMark(fixtures.projectNoUpdate.fresh, NOW)).toBeNull();
    expect(freshMark(fixtures.projectEmpty.fresh, NOW)).toBeNull();
  });
});

describe('selectFreshMarks', () => {
  it('marks nothing when everything has expired', () => {
    expect(selectFreshMarks([candidate('a', changed(14)), candidate('b', null)], NOW)).toEqual({});
  });

  it('keeps the newest three on a page', () => {
    const marks = selectFreshMarks(
      [
        candidate('a', changed(9)),
        candidate('b', changed(2)),
        candidate('c', changed(12)),
        candidate('d', changed(1)),
        candidate('e', changed(5)),
      ],
      NOW,
    );
    expect(Object.keys(marks).sort()).toEqual(['b', 'd', 'e']);
    expect(tokens.cap).toBe(3);
  });

  it('breaks a tie by page order', () => {
    const sameDay = ['a', 'b', 'c', 'd'].map((id) => candidate(id, changed(2)));
    expect(Object.keys(selectFreshMarks(sameDay, NOW)).sort()).toEqual(['a', 'b', 'c']);
  });

  it('gives one mark per project, to its newest change', () => {
    const marks = selectFreshMarks(
      [
        candidate('pas', changed(4), 'pas'),
        candidate('atti', changed(2), 'pas'),
        candidate('lifebox', changed(8), 'pas'),
        candidate('thread-quest', changed(2)),
      ],
      NOW,
    );
    expect(Object.keys(marks).sort()).toEqual(['atti', 'thread-quest']);
  });

  it('gives the first in page order the mark when a project ties with itself', () => {
    const marks = selectFreshMarks(
      [candidate('pas', changed(2), 'pas'), candidate('atti', changed(2), 'pas')],
      NOW,
    );
    expect(Object.keys(marks)).toEqual(['pas']);
  });

  it('does not let an extra mark for one project push another project out', () => {
    const marks = selectFreshMarks(
      [
        candidate('a1', changed(1), 'a'),
        candidate('a2', changed(2), 'a'),
        candidate('b', changed(3)),
        candidate('c', changed(4)),
        candidate('d', changed(5)),
      ],
      NOW,
    );
    expect(Object.keys(marks).sort()).toEqual(['a1', 'b', 'c']);
  });

  it('compares across kinds by date, each with its own lifetime', () => {
    const marks = selectFreshMarks(
      [
        candidate('update', changed(15, 'update')),
        candidate('answered', changed(15, 'answered')),
        candidate('release', changed(25, 'release')),
      ],
      NOW,
    );
    expect(Object.keys(marks).sort()).toEqual(['answered', 'release']);
    expect(marks.release).toMatchObject({ ageDays: 25, lifeDays: 30 });
  });

  it('takes a different cap', () => {
    const three = ['a', 'b', 'c'].map((id, index) => candidate(id, changed(index)));
    expect(Object.keys(selectFreshMarks(three, NOW, 1))).toEqual(['a']);
  });
});

describe('hasNavRing', () => {
  it('is on for a release up to 7 days old', () => {
    expect(tokens.nav).toBe(7);
    expect(hasNavRing([candidate('a', changed(0, 'release'))], NOW)).toBe(true);
    expect(hasNavRing([candidate('a', changed(7, 'release'))], NOW)).toBe(true);
  });

  it('is off from day 8, though the release marker itself lives on', () => {
    const release = candidate('a', changed(8, 'release'));
    expect(hasNavRing([release], NOW)).toBe(false);
    expect(selectFreshMarks([release], NOW)).toHaveProperty('a');
  });

  it('is off for anything that is not a release', () => {
    expect(
      hasNavRing(
        [
          candidate('a', changed(0, 'update')),
          candidate('b', changed(1, 'grown')),
          candidate('c', null),
        ],
        NOW,
      ),
    ).toBe(false);
  });

  it('is on if any one release qualifies', () => {
    expect(
      hasNavRing(
        [candidate('a', changed(20, 'release')), candidate('b', changed(3, 'release'))],
        NOW,
      ),
    ).toBe(true);
  });
});
