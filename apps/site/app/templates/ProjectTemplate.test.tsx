import { join } from 'node:path';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { listHandMedia } from '@cwc/content/hand/load';
import { cropMargins } from '@cwc/ui';

import { handContent } from '../content/hand.server';
import { ProjectTemplate } from './ProjectTemplate';
import { cropFor } from './ProjectTemplate.looks';
import {
  artifactMin,
  deeperMeasure,
  isQuiet,
  ringGrowth,
  toArtifact,
  toDeeperItems,
  toFacts,
  whereItsAtParagraphs,
  withoutConfirms,
  type SectionOf,
} from './ProjectTemplate.map';

const { projects } = handContent(join(import.meta.dirname, '../../content/hand'));
const pages = Object.values(projects);

const section = <Type extends SectionOf<'goDeeper'>['type'] | 'whereItsAt'>(
  page: (typeof pages)[number],
  type: Type,
) => page.sections.find((item) => item.type === type) as SectionOf<Type>;

describe('crops', () => {
  it('give the margins the boards print', () => {
    const margins = (src: string, width: number, height: number) => {
      const { image, caption } = cropMargins({ width, height }, cropFor(src)!);
      return [image.marginTop, caption.marginTop];
    };
    expect(margins('/media/projects/duo-decide/duo-decide-hero.webp', 1600, 1000)).toEqual([
      '-3.75%',
      'calc(20px - 6.88%)',
    ]);
    expect(margins('/media/projects/ai-system/ai-system-hero.webp', 1600, 1000)).toEqual([
      '-11.38%',
      'calc(20px - 16.19%)',
    ]);
    expect(margins('/media/projects/ai-system/ai-system-detail-relay.webp', 1200, 800)).toEqual([
      '-17.92%',
      'calc(20px - 24.33%)',
    ]);
    expect(margins('/media/projects/atti/atti-detail-lifecycle.webp', 1200, 800)).toEqual([
      '-7.75%',
      'calc(20px - 11.92%)',
    ]);
    expect(margins('/media/projects/lifebox/lifebox-detail-directions.webp', 1200, 800)).toEqual([
      '-10.25%',
      'calc(20px - 15.00%)',
    ]);
  });

  it('name only images the pages use', () => {
    const media = new Set(listHandMedia(projects));
    for (const src of [
      '/media/projects/duo-decide/duo-decide-hero.webp',
      '/media/projects/duo-decide/duo-decide-detail-queue.webp',
      '/media/projects/duo-decide/duo-decide-detail-rounds.webp',
      '/media/projects/ai-system/ai-system-hero.webp',
      '/media/projects/ai-system/ai-system-detail-relay.webp',
      '/media/projects/atti/atti-hero.webp',
      '/media/projects/atti/atti-detail-pod.webp',
      '/media/projects/atti/atti-detail-lifecycle.webp',
      '/media/projects/lifebox/lifebox-hero.webp',
      '/media/projects/lifebox/lifebox-detail-directions.webp',
    ]) {
      expect(cropFor(src), src).toBeDefined();
      expect(media.has(src), src).toBe(true);
    }
  });
});

describe('toFacts', () => {
  it('sets a counted number as a numeral and anything else in words', () => {
    const facts = toFacts(section(projects.personalBrain, 'whereItsAt').facts);
    expect(facts.map((fact) => fact.kind)).toEqual(['numeral', 'word', 'word']);
    // The measured fact keeps its sample size as the small readout, not as a unit.
    expect(facts[2]).toMatchObject({ value: 'κ 0.41 → 0.91', note: 'Sample: 20 items' });
    expect(facts[2]!.unit).toBeUndefined();
  });

  it('takes the live count where live data counts the same thing', () => {
    const facts = toFacts(section(projects.duoDecide, 'whereItsAt').facts, [
      { key: 'test-cases', value: '1,201', label: 'test cases', asOf: '2026-11-21' },
    ]);
    expect(facts.map((fact) => fact.value)).toEqual(['1,201', '24', '6']);
  });
});

describe('whereItsAtParagraphs', () => {
  const hand = section(projects.personalBrain, 'whereItsAt').paragraphs;

  it('keeps the hand paragraphs, links and all, while live data says the same', () => {
    const same =
      'In daily use since August 2026. Atti, my assistant, writes here most days; see PAS. Two brains feed it, each built separately and tied together here.';
    expect(typeof whereItsAtParagraphs(hand, same)[0]).not.toBe('string');
    expect(whereItsAtParagraphs(hand)).toHaveLength(1);
  });

  it('shows the live text once it says something new', () => {
    expect(whereItsAtParagraphs(hand, 'Something new.')).toEqual(['Something new.']);
  });
});

describe('go deeper', () => {
  it('uses the wide column only where rows open to artifact cards', () => {
    const measure = (page: (typeof pages)[number]) => deeperMeasure(section(page, 'goDeeper'));
    expect(measure(projects.duoDecide)).toBe('deeper');
    expect(measure(projects.aiSystem)).toBe('deeper');
    expect(measure(projects.threadQuest)).toBe('deeper');
    expect(measure(projects.pas)).toBe('log');
    expect(measure(projects.atti)).toBe('log');
    expect(measure(projects.lifebox)).toBe('log');
    expect(measure(projects.personalBrain)).toBe('log');
  });

  it('gives rows with a wide capture the wider cards, as on the boards', () => {
    const mins = (page: (typeof pages)[number]) =>
      section(page, 'goDeeper').expanders.map((row) => artifactMin(row.artifacts ?? []));
    expect(mins(projects.duoDecide)).toEqual([280, 230, 230, 230]);
    expect(mins(projects.aiSystem)).toEqual([280, 280, 280, 230]);
    expect(mins(projects.threadQuest)).toEqual([230, 230, 230, 230]);
  });

  it('caps a tall capture on its own, and leaves a pair of phone captures to sit side by side', () => {
    const duo = section(projects.duoDecide, 'goDeeper').expanders[1]!.artifacts![2]!;
    expect(toArtifact(duo).media).toMatchObject([{ kind: 'image', maxWidth: 240 }]);
    const pair = section(projects.aiSystem, 'goDeeper').expanders[2]!.artifacts![2]!;
    expect(toArtifact(pair).media!.every((media) => !('maxWidth' in media))).toBe(true);
  });

  it('keeps hand anchors and numbers the rows that have none', () => {
    const ids = (page: (typeof pages)[number]) =>
      toDeeperItems(section(page, 'goDeeper')).map((item) => item.id);
    expect(ids(projects.duoDecide)).toEqual(['building', 'tried', 'didnt-work', 'next']);
    expect(ids(projects.pas)).toEqual(['go-deeper-1', 'go-deeper-2', 'go-deeper-3', 'go-deeper-4']);
  });
});

describe('withoutConfirms', () => {
  it('drops every marker for Chase and nothing else', () => {
    const { titanIntake } = handContent(join(import.meta.dirname, '../../content/hand'));
    for (const page of [...pages, titanIntake]) {
      const clean = withoutConfirms(page);
      expect(JSON.stringify(clean)).not.toContain('[CONFIRM');
      const rows = (content: typeof page) =>
        section(content, 'goDeeper').expanders.map(({ confirm: _confirm, ...row }) => row);
      expect(rows(clean)).toEqual(rows(page));
      expect({ ...clean, sections: [] }).toEqual({ ...page, sections: [] });
    }
    expect(JSON.stringify(projects.threadQuest)).toContain('[CONFIRM');
  });
});

describe('isQuiet', () => {
  it('is quiet after six weeks without an entry', () => {
    expect(isQuiet([{ date: '2026-09-19' }], '2026-11-22')).toBe(true);
    expect(isQuiet([{ date: '2026-11-05' }], '2026-11-22')).toBe(false);
    expect(isQuiet([{ date: '2026-10-11' }], '2026-11-22')).toBe(false);
    expect(isQuiet([{ date: '2026-10-10' }], '2026-11-22')).toBe(true);
  });

  it('is never quiet without a date or without entries', () => {
    expect(isQuiet([{ date: '2020-01-01' }])).toBe(false);
    expect(isQuiet([], '2026-11-22')).toBe(false);
  });
});

describe('ringGrowth', () => {
  const quarter = [{ label: '2026 Q4', kind: 'period' as const }];

  it('is the share of the quarter that had passed at the newest entry', () => {
    expect(ringGrowth(quarter, [{ date: '2026-10-01' }], false)).toBe(0);
    expect(ringGrowth(quarter, [{ date: '2026-11-05' }], false)).toBe(0.38);
  });

  it('is 0 when quiet, outside the quarter, or when the outer ring is a release', () => {
    expect(ringGrowth(quarter, [{ date: '2026-11-05' }], true)).toBe(0);
    expect(ringGrowth(quarter, [{ date: '2026-09-19' }], false)).toBe(0);
    expect(
      ringGrowth([{ label: 'v1.0.0', kind: 'release' }], [{ date: '2026-11-21' }], false),
    ).toBe(0);
    expect(ringGrowth([], [], false)).toBe(0);
  });
});

describe('ProjectTemplate, on the real project pages', () => {
  it.each(pages.map((page) => [page.slug, page] as const))(
    '%s renders from hand content alone, with no marker for Chase and no log shell',
    (_slug, page) => {
      const { container } = render(
        <MemoryRouter>
          <ProjectTemplate content={page} />
        </MemoryRouter>,
      );
      expect(container.querySelectorAll('h1')).toHaveLength(1);
      expect(container.textContent).not.toContain('[CONFIRM');
      expect(container.querySelector('#log')).toBeNull();
      expect(container.querySelector('[data-log-entry]')).toBeNull();
      // Every hand anchor is on the page once.
      for (const item of page.sections) {
        if ('id' in item && item.id && item.type !== 'log') {
          expect(container.querySelectorAll(`[id="${item.id}"]`), item.id).toHaveLength(1);
        }
      }
    },
  );
});
