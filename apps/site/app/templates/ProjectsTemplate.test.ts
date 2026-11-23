import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { handContent } from '../content/hand.server';
import { toIndexGroups } from './ProjectsTemplate';

const { projectsIndex } = handContent(join(import.meta.dirname, '../../content/hand'));
const rows = (
  ...args: Parameters<typeof toIndexGroups> extends [unknown, ...infer Rest] ? Rest : never
) => toIndexGroups(projectsIndex.index, ...args).flatMap((group) => group.rows);
const row = (list: ReturnType<typeof rows>, id: string) => list.find((entry) => entry.id === id)!;

describe('toIndexGroups, on the real Projects index', () => {
  it('shows the hand-written status when there is no live data', () => {
    const list = rows();
    expect(row(list, 'pas').status).toEqual({ label: 'Daily use', tone: 'live' });
    expect(list.every((entry) => !entry.fresh && !entry.reserveMarker)).toBe(true);
  });

  it('takes status, marks and marker room from live data, by row id', () => {
    const list = rows(
      { pas: { ageDays: 2, lifeDays: 14 } },
      { status: { 'duo-decide': { label: 'Live', tone: 'live' } }, reserve: ['pas', 'atti'] },
    );
    expect(row(list, 'duo-decide').status).toEqual({ label: 'Live', tone: 'live' });
    expect(row(list, 'pas').fresh).toEqual({ ageDays: 2, lifeDays: 14 });
    expect(row(list, 'pas').reserveMarker).toBe(true);
    expect(row(list, 'atti').reserveMarker).toBe(true);
    expect(row(list, 'atti').fresh).toBeNull();
    expect(row(list, 'thread-quest').reserveMarker).toBe(false);
  });

  it('keeps a name-only project to its name and status, whatever live data says', () => {
    const list = rows({ distill: { ageDays: 0, lifeDays: 14 } }, { reserve: ['distill'] });
    expect(Object.keys(row(list, 'distill')).sort()).toEqual(['depth', 'id', 'name', 'status']);
  });
});
