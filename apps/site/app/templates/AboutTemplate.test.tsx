import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { handContent } from '../content/hand.server';
import { toBuildWith, toRingsItems } from './AboutTemplate';

const { about } = handContent(join(import.meta.dirname, '../../content/hand'));
const items = toRingsItems(about.rings);
const chapter = (id: string) => {
  const item = items.find((entry) => entry.id === id);
  if (!item || item.kind === 'note') throw new Error(`no chapter ${id}`);
  return item;
};

describe('toRingsItems, on the real About content', () => {
  it('lights every ring of the drawing once, in order', () => {
    const lit = items.flatMap((item) => (item.kind === 'note' ? [] : item.rings));
    expect(lit).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(chapter('roots').rings).toEqual([0, 1]);
  });

  it('sets the markers and the dashed rules as the board does', () => {
    expect(chapter('roots').marker).toBe('root');
    expect(chapter('wildland-fire').marker).toBe('dot');
    expect(chapter('wildland-fire').tone).toBe('ember');
    expect(chapter('titan-intake').marker).toBe('dot');
    expect(chapter('tradesy').marker).toBe('ring');
    const dashed = items.filter((item) => item.kind !== 'note' && item.gapBefore);
    expect(dashed.map((item) => item.id)).toEqual(['roots', 'truecar', 'porchpass']);
    expect(items.find((item) => item.id === 'back-to-software')?.kind).toBe('note');
  });

  it('keeps the fire chapter to its summary and one paragraph that counts no years', () => {
    const fire = chapter('wildland-fire');
    expect(fire.summary).toBe(
      about.rings.chapters.find((entry) => entry.id === 'wildland-fire')!.summary,
    );
    expect(fire.details).toHaveLength(1);
    const text = `${fire.details![0]!.lead} ${String(fire.details![0]!.text)}`;
    expect(text).not.toMatch(/\byears?\b|\bseasons?\b|\b20\d\d\b/i);
  });

  it('splits the bold lead-in from each detail', () => {
    const [first, second] = chapter('roots').details!;
    expect(first!.lead).toBe('Digital Arts, BA');
    expect(String(first!.text)).toMatch(/^, 2013\./);
    expect(String(second!.text)).toMatch(/^The thing/);
  });

  it('shows no log line on any chapter', () => {
    for (const item of items) if (item.kind !== 'note') expect(item.latest).toBeUndefined();
  });

  it('opens the current job with the hand-written role when there is no live data', () => {
    const titan = about.rings.chapters.find((entry) => entry.id === 'titan-intake')!;
    render(<p>{chapter('titan-intake').summary}</p>);
    expect(screen.getByText(`${titan.role} ${titan.summary}`)).toBeTruthy();
  });

  it('writes the role from live data when it is there', () => {
    const live = toRingsItems(about.rings, {
      role: { title: 'Software Engineer', org: 'Titan Intake', since: '2026-01' },
      sinceLabel: 'since',
    });
    const titan = live.find((item) => item.id === 'titan-intake')!;
    const { container } = render(<p>{titan.kind === 'note' ? null : titan.summary}</p>);
    expect(container.querySelector('time')?.getAttribute('datetime')).toBe('2026-01');
    expect(container.textContent).toMatch(/^Software Engineer, since January 2026\. /);
  });
});

describe('toBuildWith', () => {
  it('reads the stages from the order of the groups', () => {
    const { tools, stageLabels } = toBuildWith(about.tools.groups);
    expect(tools[0]!.stage).toBe('tried');
    expect(tools[tools.length - 1]!.stage).toBe('current');
    expect(stageLabels).toEqual({
      tried: about.tools.groups[0]!.label,
      also: about.tools.groups[1]!.label,
      current: about.tools.groups[2]!.label,
    });
  });
});
