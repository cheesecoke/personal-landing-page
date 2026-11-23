import { describe, expect, it } from 'vitest';

import { Artifact, ProjectPageContent, stampForDate } from './project-page';

const page = {
  schemaVersion: 1,
  slug: 'sample',
  path: '/projects/sample',
  title: 'Sample',
  breadcrumb: {
    label: 'Breadcrumb',
    items: [{ label: 'Projects', href: '/projects' }, { label: 'Sample' }],
  },
  hero: { status: 'In build', title: 'Sample', lead: 'A sample page.' },
  sections: [
    {
      type: 'whereItsAt',
      id: 'where-its-at',
      title: "Where it's at",
      paragraphs: ['It exists.'],
      facts: [{ value: '1', unit: 'page', caption: 'This one.' }],
    },
    { type: 'log', id: 'log', label: "Captain's log" },
    {
      type: 'goDeeper',
      id: 'go-deeper',
      title: 'Go deeper',
      expanders: [
        {
          id: 'tried',
          title: 'What I tried',
          countLabel: '1 artifact',
          paragraphs: ['One thing.'],
          artifacts: [
            {
              stamp: '2026.314',
              date: '10 Nov 2026',
              title: 'A thing',
              text: 'It happened.',
              source: 'Doc · sample',
            },
          ],
        },
      ],
    },
  ],
  next: {
    label: 'Next',
    eyebrow: 'Next project',
    link: { label: 'Other', href: '/projects' },
    back: { label: 'Back to the map', href: '/projects' },
  },
};

describe('project page schema', () => {
  it('accepts a well-formed page', () => {
    expect(ProjectPageContent.safeParse(page).success).toBe(true);
  });

  it('rejects an unknown section type and unknown keys', () => {
    expect(ProjectPageContent.safeParse({ ...page, sections: [{ type: 'mystery' }] }).success).toBe(
      false,
    );
    expect(ProjectPageContent.safeParse({ ...page, extra: true }).success).toBe(false);
  });

  it('rejects anchors that repeat', () => {
    const sections = [...page.sections, { type: 'log', id: 'log', label: "Captain's log" }];
    expect(ProjectPageContent.safeParse({ ...page, sections }).success).toBe(false);
  });

  it('checks that an artifact stamp is the day of the year of its date', () => {
    const artifact = { stamp: '2026.314', date: '10 Nov 2026', title: 'A', text: 'B', source: 'C' };
    expect(Artifact.safeParse(artifact).success).toBe(true);
    expect(Artifact.safeParse({ ...artifact, stamp: '2026.315' }).success).toBe(false);
    expect(stampForDate('25 Sep 2024')).toBe('2024.269');
    expect(stampForDate('1 Jan 2026')).toBe('2026.001');
    expect(stampForDate('2026-11-10')).toBeNull();
  });

  it('checks that the printed artifact count matches the list', () => {
    const deeper = structuredClone(page.sections[2]) as { expanders: { countLabel: string }[] };
    deeper.expanders[0]!.countLabel = '3 artifacts';
    const sections = [page.sections[0], page.sections[1], deeper];
    expect(ProjectPageContent.safeParse({ ...page, sections }).success).toBe(false);
  });
});
