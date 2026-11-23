import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { placeholder } from '../internal/storyMedia';
import { AiSystemEvolution } from './AiSystemEvolution';

const meta = {
  title: 'Sections/Project/AiSystemEvolution',
  component: AiSystemEvolution,
  parameters: { layout: 'fullscreen' },
  // Copy from the AI system board; the capture is a placeholder.
  args: {
    id: 'timeline',
    title: 'From the first pipeline to Distill',
    label: 'Milestones, oldest first',
    stops: [
      {
        stamp: '2026.130',
        date: '10 May 2026',
        title: 'First commit',
        text: 'A pipeline that plans, writes code and opens a pull request, with a budget on every stage from day one.',
      },
      {
        stamp: '2026.154',
        date: '3 Jun 2026',
        title: 'The board',
        text: 'A local board shows every run as a line of stages, with live status, spend and the pull request.',
      },
      {
        stamp: '2026.182',
        date: '1 Jul 2026',
        title: 'The ledger',
        text: 'Every run is recorded as an episode. In August the board’s Memory view joined each run to what it left behind.',
      },
      {
        stamp: '2026.186',
        date: '5 Jul 2026',
        title: 'Lessons',
        text: 'Repeated failures become ranked lessons the planner can pull, behind a gate built to say no.',
      },
      { tag: 'Next version', title: 'Distill', link: { label: 'What it is', href: '#distill' } },
    ],
    figure: {
      image: {
        src: placeholder(1600, 1000, { kind: 'capture' }),
        width: 1600,
        height: 1000,
        alt: 'The pipeline board showing one finished run: evidence, plan, code and pull request stages all passed, with token counts and run metrics. Spend figures are masked.',
      },
      caption:
        'The board, 4 Sep 2026: one run passes evidence, plan, code and pull request. Spend is masked.',
    },
    next: {
      id: 'distill',
      title: 'Distill',
      paragraphs: [
        'Distill is the next version: a code factory, the execution layer that takes a ticket through to a pull request.',
      ],
    },
  },
  decorators: [
    (Story) => (
      <ThreadScope hash={false}>
        <Container width="project" className="pb-16">
          <ThreadColumn placement="gutter">
            <div className="relative">
              <Thread placement="gutter" bottom={0} />
              <Story />
            </div>
          </ThreadColumn>
        </Container>
      </ThreadScope>
    ),
  ],
} satisfies Meta<typeof AiSystemEvolution>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four dated stops and the next version, the board capture, then the block the last stop links to. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Milestones, oldest first' });
    await expect(list.tagName).toBe('OL');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    const times = [...list.querySelectorAll('time')].map((time) => time.getAttribute('datetime'));
    await expect(times).toEqual(['2026-05-10', '2026-06-03', '2026-07-01', '2026-07-05']);
    // The last stop links to the block under the timeline, by anchor.
    await expect(canvas.getByRole('link', { name: 'What it is' })).toHaveAttribute(
      'href',
      '#distill',
    );
    await expect(canvasElement.querySelector('#distill')).not.toBeNull();
    await expect(canvasElement.querySelector('#timeline')).not.toBeNull();
    await expect(canvas.getByRole('heading', { level: 2, name: 'Distill' })).toBeVisible();
    // One node on the thread: the timeline. The Distill block has none.
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(1);
  },
};

/** The timeline alone. */
export const TimelineOnly: Story = { args: { figure: undefined, next: undefined } };

/** On a phone the line runs down the side. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    const stops = [...canvasElement.querySelectorAll('[data-stop]')].map((stop) =>
      stop.getBoundingClientRect(),
    );
    await expect(stops[1]!.top).toBeGreaterThanOrEqual(stops[0]!.bottom);
  },
};
