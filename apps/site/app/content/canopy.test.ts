import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildIndex } from '@cwc/canopy';
import { selectFreshMarks } from '@cwc/content';
import { fixtures, seedContent } from '@cwc/content/fixtures';

import { pagePaths } from '../paths';
import { freshShoots, toCanopyCopy, toCanopyData, withCanopyFresh } from './canopy';
import { handContent } from './hand.server';
import { freshCandidates } from './live';

const { map } = handContent(join(import.meta.dirname, '../../content/hand'));
const data = toCanopyData(map, seedContent.projects);
const node = (tree: typeof data, id: string) => tree.nodes.find((entry) => entry.id === id)!;

describe('toCanopyData, on the real map and the seed data', () => {
  it('sends every card to a page of the site', () => {
    const pages: readonly string[] = pagePaths;
    for (const { id, href } of data.nodes) {
      expect(pages, `${id}: ${href}`).toContain(href.split('#')[0]);
    }
  });

  it('builds a tree the canopy accepts, with the hand-written start order', () => {
    const index = buildIndex(data);
    expect(index.ids).toEqual(map.nodes.map((entry) => entry.id));
    expect(data.start).toEqual(map.start);
    expect(index.byId.lifebox!.depth).toBe(2);
  });

  it('takes status and shoots from live data', () => {
    const pas = seedContent.projects.find((project) => project.slug === 'pas')!;
    expect(node(data, 'pas').status).toBe(pas.status.label);
    expect(node(data, 'pas').tone).toBe('live');
    expect(node(data, 'duo-decide').tone).toBe('build');
    expect(node(data, 'thread-quest').tone).toBe('quiet');
    expect(node(data, 'duo-decide').shoots!.map((shoot) => shoot.state)).toContain('answered');
    // A name-only project is its name and status: no shoots.
    expect(node(data, 'distill').shoots).toBeUndefined();
  });

  it('gives every shoot on the tree its own id', () => {
    const ids = data.nodes.flatMap((entry) => entry.shoots?.map((shoot) => shoot.id) ?? []);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('pas-context-engine');
    expect(ids).toContain('atti-context-engine');
  });

  it('falls back to hand content with no live data: hand status, no shoots', () => {
    const bare = toCanopyData(map);
    expect(
      bare.nodes.every((entry) => entry.shoots === undefined && entry.tone === undefined),
    ).toBe(true);
    expect(node(bare, 'pas').status).toBe(map.nodes.find((entry) => entry.id === 'pas')!.status);
  });
});

describe('withCanopyFresh', () => {
  const marks = selectFreshMarks(freshCandidates(seedContent.projects), '2026-11-22');

  it('returns the same data when nothing is marked', () => {
    expect(withCanopyFresh(data, {})).toBe(data);
  });

  it('draws the mark on the marked projects only', () => {
    const marked = withCanopyFresh(data, marks);
    const fresh = marked.nodes.filter((entry) => entry.fresh).map((entry) => entry.id);
    expect(fresh.sort()).toEqual(Object.keys(marks).sort());
    const mark = node(marked, fresh[0]!).fresh!;
    expect(mark.label).toBe('New · 2d');
    expect(mark.left).toBeCloseTo(12 / 14);
  });

  it('marks the shoot that grew when that is the newest change', () => {
    const live = fixtures.projectLive;
    const grown = live.shoots.find((shoot) => shoot.state === 'grown')!;
    const project = {
      ...live,
      fresh: { changedAt: grown.resolved!.date, changeKind: 'grown' as const },
    };
    const shootId = `${live.slug}-${grown.id}`;
    expect(freshShoots([project])).toEqual({ [live.slug]: shootId });
    expect(freshShoots(seedContent.projects)).toEqual({});

    const tree = toCanopyData(
      {
        ...map,
        nodes: [{ ...map.nodes[0]!, id: live.slug, parent: null }],
        flows: [],
        start: [live.slug],
      },
      [project],
    );
    const mark = {
      ...project.fresh,
      ageDays: 1,
      lifeDays: 21,
      remaining: 20 / 21,
    };
    const marked = withCanopyFresh(tree, { [live.slug]: mark }, freshShoots([project]));
    const shoots = marked.nodes[0]!.shoots!;
    expect(shoots.filter((shoot) => shoot.fresh).map((shoot) => shoot.id)).toEqual([shootId]);
    expect(shoots.find((shoot) => shoot.id === shootId)!.note).toBe(grown.resolved!.text);
  });
});

describe('toCanopyCopy', () => {
  it('prints the hand-written words', () => {
    const copy = toCanopyCopy(map);
    expect(copy.headline).toBe(map.headline);
    expect(copy.legend.shoot).toBe(map.labels.legend.ungrown);
    expect(copy.openIn('Beyond')).toBe(map.labels.openInParent.replace('{parent}', 'Beyond'));
    expect(copy.back).toBe(map.labels.back);
  });
});
