import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, GoDeeper, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { TextLink } from '../../../primitives';
import { placeholder } from '../internal/storyMedia';
import { ArtifactList, stampToIso, type ArtifactData } from './ArtifactList';

const capture = (alt: string) => ({
  src: `${placeholder(1600, 1000, { kind: 'capture' })}#${alt.length}`,
  width: 1600,
  height: 1000,
  alt,
});
const phone = (alt: string) => ({
  src: `${placeholder(600, 1299, { kind: 'phone', subject: [20, 1279] })}#${alt.length}`,
  width: 600,
  height: 1299,
  alt,
});

// Copy from the AI system board ("What I'm building" and "What didn't work"); media are placeholders.
const building: ArtifactData[] = [
  {
    stamp: '2026.187',
    date: '6 Jul 2026',
    title: 'The daemon',
    text: 'Tickets moved to In Progress run on their own: it dispatches, retries, parks and writes back. It built its own last two pieces.',
    source: 'Pull request · ai-system #64 · roadmap M3',
    media: [
      {
        kind: 'image',
        image: capture(
          'The board page for the ai-system project: its config, the latest run with all four stages passed, and recent runs.',
        ),
      },
    ],
  },
  {
    stamp: '2026.154',
    date: '3 Jun 2026',
    title: 'The board',
    text: 'Agents building UI read the board’s design-system mocks before they touch it. Here it moves from the dashboard into one run.',
    source: 'Commit · feat(ui): local pipeline progress board',
    media: [
      {
        kind: 'video',
        video: {
          src: '/media/placeholder-loop.mp4',
          poster: placeholder(1440, 900, { kind: 'capture' }),
          width: 1440,
          height: 900,
          label:
            'Eight-second screen recording of the board: the dashboard, a project page, then one run and its spec. Spend is masked.',
        },
      },
    ],
  },
  {
    stamp: '2026.324',
    date: '20 Nov 2026',
    title: 'The architecture map',
    text: '51 parts, coloured by maturity: 20 built, 30 partial, 1 still needed.',
    source: 'Doc · architecture/architecture.json',
    media: [
      {
        kind: 'image',
        image: capture(
          'The ai-system architecture graph, every part coloured green, yellow or red by how built it is.',
        ),
      },
    ],
  },
];

const didntWork: ArtifactData[] = [
  {
    stamp: '2026.199',
    date: '18 Jul 2026',
    title: 'The lesson loop starved',
    text: '60 of 73 runs pulled in no lessons. The weekly job had run once, at an hour my machine was asleep.',
    source: 'Roadmap · lessons audit',
  },
  {
    stamp: '2026.280',
    date: '7 Oct 2026',
    title: 'The doc was wrong',
    text: (
      <>
        The pipeline followed Duo Decide’s voting doc to the letter, and vote decisions stuck for
        three months.{' '}
        <TextLink inline href="/projects/duo-decide#didnt-work">
          The Duo Decide story
        </TextLink>
        .
      </>
    ),
    source: 'Pull request · duo-decide #25',
  },
  {
    stamp: '2026.324',
    date: '20 Nov 2026',
    title: 'Not built for phones',
    text: 'The board was made for a desk. On a phone, the sidebar fills the top half of the screen.',
    source: 'Capture · the board at phone width',
    media: [
      {
        kind: 'image',
        image: phone(
          'The board on a phone: a finished run, with the sidebar filling the top of the screen.',
        ),
      },
      {
        kind: 'image',
        image: phone(
          'The board dashboard on a phone, with the sidebar filling the top of the screen.',
        ),
      },
    ],
  },
];

const meta = {
  title: 'Sections/Project/ArtifactList',
  component: ArtifactList,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Dated artifacts', artifacts: building, min: 280 },
  decorators: [
    (Story) => (
      <Container width="project" className="py-10">
        <div className="max-w-[1056px]">
          <Story />
        </div>
      </Container>
    ),
  ],
} satisfies Meta<typeof ArtifactList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cards with captures and a clip. The first card holds the lit edge. */
export const WithMedia: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Dated artifacts' });
    await expect(list.tagName).toBe('OL');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    await expect(list.querySelector('time')?.getAttribute('datetime')).toBe('2026-07-06');
    const video = canvasElement.querySelector('video')!;
    await expect(video).toHaveAttribute('aria-label');
    await expect(video.muted).toBe(true);
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video.autoplay).toBe(false);
    await expect(stampToIso('2026.324')).toBe('2026-11-20');
  },
};

/** Cards without captures, one with a link, one with a pair of phone captures. */
export const Mixed: Story = {
  args: { artifacts: didntWork, min: 280 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'The Duo Decide story' })).toBeVisible();
    await expect(canvas.getAllByRole('img')).toHaveLength(2);
  },
};

/** One card (from the board's "Open questions and next"). */
export const Single: Story = {
  args: {
    min: 230,
    artifacts: [
      {
        stamp: '2026.242',
        date: '30 Aug 2026',
        title: 'The top lesson',
        text: 'Repeated retries at the code stage: seen 23 times across 3 repos. One of 14 lessons the ledger produced.',
        source: 'Lesson page · retry-code',
      },
    ],
  },
};

/** No artifacts: it renders nothing. */
export const Empty: Story = {
  args: { artifacts: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('ol')).toBeNull();
  },
};

/** Where it lives: under the paragraph of a "Go deeper" row. */
export const InGoDeeper: Story = {
  decorators: [
    () => (
      <ThreadScope hash={false}>
        <ThreadColumn placement="gutter">
          <div className="relative">
            <Thread placement="gutter" bottom={0} />
            <GoDeeper
              title="Go deeper"
              artifactsLabel="Dated artifacts"
              items={[
                {
                  id: 'building',
                  title: 'What I’m building',
                  meta: '3 artifacts',
                  defaultOpen: true,
                  body: 'One system that runs the whole loop (plan, build, check, open a pull request) and gets better from its own history. The rule of the house: the model picks what; code picks where and how.',
                  children: <ArtifactList label="Dated artifacts" artifacts={building} min={280} />,
                },
                {
                  id: 'didnt-work',
                  title: 'What didn’t work',
                  meta: '3 artifacts',
                  body: 'The lesson loop was wired but starved. When I audited it in July, 60 of 73 runs had pulled in no lessons at all.',
                  children: (
                    <ArtifactList label="Dated artifacts" artifacts={didntWork} min={280} />
                  ),
                },
              ]}
            />
          </div>
        </ThreadColumn>
      </ThreadScope>
    ),
  ],
};

export const Phone: Story = { ...Mixed, globals: { viewport: { value: 'phone' } } };
