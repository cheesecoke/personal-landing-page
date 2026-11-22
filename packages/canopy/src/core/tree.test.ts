import { describe, expect, it } from 'vitest';

import { defaultCanopyData } from '../data/default';
import type { CanopyData } from '../types';
import { buildIndex, family, listRows, openShoots, statusTone } from './tree';

const index = buildIndex(defaultCanopyData);

describe('buildIndex', () => {
  it('works out children, depth and start rank', () => {
    expect(index.byId.pas!.children).toEqual(['atti']);
    expect(index.byId.lifebox!.depth).toBe(2);
    expect(index.byId[index.rootId]!.depth).toBe(-1);
    expect(index.byId['duo-decide']!.start).toBe(1);
    expect(index.byId.atti!.start).toBe(-1);
  });

  it('links flows both ways', () => {
    expect(index.byId['personal-brain']!.flowsOut.map((f) => f.to)).toEqual(['atti']);
    expect(index.byId['personal-brain']!.flowsIn.map((f) => f.from)).toEqual([
      'ai-system',
      'finance-brain',
      'business-brain',
    ]);
  });

  it('drops dropped shoots and draws six at most', () => {
    const shoots = Array.from({ length: 9 }, (_, i) => ({
      id: `s${i}`,
      label: `Shoot ${i}`,
      state: i === 0 ? ('dropped' as const) : ('open' as const),
    }));
    const data: CanopyData = {
      root: { id: 'root', label: 'Root' },
      nodes: [
        {
          id: 'a',
          label: 'A',
          parent: null,
          kind: 'product',
          status: 'In build',
          weight: 3,
          page: true,
          href: '/a',
          oneLine: '',
          shoots,
        },
      ],
      flows: [],
      start: [],
    };
    const a = buildIndex(data).byId.a!;
    expect(a.shoots.map((s) => s.id)).toEqual(['s1', 's2', 's3', 's4', 's5', 's6']);
  });

  it('rejects an unknown parent', () => {
    const bad: CanopyData = {
      ...defaultCanopyData,
      nodes: [{ ...defaultCanopyData.nodes[0]!, parent: 'nope' }],
    };
    expect(() => buildIndex(bad)).toThrow(/unknown parent/);
  });
});

describe('family', () => {
  it('is the node, what contains it, what it contains and what it feeds or is fed by', () => {
    expect(Object.keys(family(index, 'atti')).sort()).toEqual(
      ['atti', 'chase', 'lifebox', 'pas', 'personal-brain'].sort(),
    );
  });
});

describe('listRows', () => {
  it('lists the start projects first, each with what sits inside it', () => {
    const rows = listRows(index, defaultCanopyData);
    expect(rows.start.map((r) => `${r.depth}:${r.id}`)).toEqual([
      '0:pas',
      '1:atti',
      '2:lifebox',
      '0:duo-decide',
      '0:ai-system',
      '1:distill',
    ]);
    expect(rows.more.map((r) => r.id)).toEqual([
      'personal-brain',
      'finance-brain',
      'business-brain',
      'thread-quest',
      'one-rep',
      'this-site',
    ]);
  });
});

describe('status and shoots', () => {
  it('reads the status dot from the status word unless a tone is set', () => {
    expect(statusTone({ status: 'In build' })).toBe('build');
    expect(statusTone({ status: 'Daily use' })).toBe('live');
    expect(statusTone({ status: 'Experiment' })).toBe('quiet');
    expect(statusTone({ status: 'Experiment', tone: 'live' })).toBe('live');
  });

  it('counts only open shoots as not yet grown', () => {
    expect(
      openShoots({
        shoots: [
          { id: 'a', label: 'A', state: 'open' },
          { id: 'b', label: 'B', state: 'grown' },
          { id: 'c', label: 'C', state: 'answered' },
        ],
      }),
    ).toBe(1);
  });
});
