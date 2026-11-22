import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Panel } from '../../../primitives';
import { LogEntry } from './LogEntry';

// Copy from the Captain's log board (the Duo Decide log and its release example).
const meta = {
  title: 'Sections/Project/LogEntry',
  component: LogEntry,
  args: {
    entry: {
      id: 'duo-2026-11-05',
      date: '2026-11-05',
      kind: 'update',
      lines: [
        'Over-the-air updates, so fixes skip a store review.',
        'Decided decisions can be archived; deletes became soft.',
        'Native audit: a crash fix, touch targets, Dynamic Type.',
      ],
    },
    releaseLabel: 'Release notes',
  },
  decorators: [
    (Story) => (
      <Panel className="max-w-[520px] px-[clamp(18px,3vw,32px)] pt-6 pb-5.5">
        <ol className="relative m-0 list-none p-0 pl-7">
          <Story />
        </ol>
      </Panel>
    ),
  ],
} satisfies Meta<typeof LogEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What was built, in plain words. */
export const Update: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const time = canvasElement.querySelector('time');
    await expect(time?.getAttribute('datetime')).toBe('2026-11-05');
    await expect(time).toHaveTextContent('5 Nov 2026');
    // The stardate is decoration.
    await expect(canvas.getByText('2026.309')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvasElement.querySelectorAll('ul > li')).toHaveLength(3);
  },
};

/** A release carries its version and the release notes. */
export const Release: Story = {
  args: {
    entry: {
      id: 'duo-v1',
      date: '2026-12-01',
      kind: 'release',
      version: 'v1.0.0',
      lines: [
        'Voting and three-round polls for two people.',
        'Option lists, history and archive.',
        'Real-time sync between both phones.',
        'Over-the-air updates for fixes.',
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('v1.0.0')).toBeVisible();
    await expect(canvas.getByText('Release notes')).toBeVisible();
  },
};

/** The newest entry: its node is filled and holds the glow. */
export const Latest: Story = {
  args: { latest: true },
  play: async ({ canvasElement }) => {
    const node = canvasElement.querySelector('[data-log-node]')!;
    await expect(getComputedStyle(node).boxShadow).not.toBe('none');
  },
};

/** New: the ring around its node and "New · 2d" beside the date. */
export const Fresh: Story = {
  args: { latest: true, fresh: { ageDays: 2, lifeDays: 14 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('New · 2d')).toBeInTheDocument();
    await expect(canvas.getByText('New, updated 2 days ago')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-new-ring]')).not.toBeNull();
  },
};

/** An entry that covers a stretch of days. */
export const Stretch: Story = {
  args: {
    entry: {
      id: 'ai-2026-09-19',
      date: '2026-09-19',
      from: '2026-09-14',
      kind: 'update',
      lines: [
        'Spoken output for agent sessions.',
        'Brain dumps now file straight into my personal brain.',
        'Board fix: the live run stream stays connected.',
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toHaveTextContent('14 to 19 Sep 2026');
  },
};

/** Four lines at most: a fifth is not shown. */
export const MaxLines: Story = {
  args: {
    entry: {
      id: 'duo-v1-long',
      date: '2026-12-01',
      kind: 'release',
      version: 'v1.0.0',
      lines: [
        'Voting and three-round polls for two people.',
        'Option lists, history and archive.',
        'Real-time sync between both phones.',
        'Over-the-air updates for fixes.',
        'Decided decisions can be archived; deletes became soft.',
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('ul > li')).toHaveLength(4);
  },
};

export const Phone: Story = { ...Fresh, globals: { viewport: { value: 'phone' } } };

/** Reduced motion: the new mark does not fade in. */
export const Reduced: Story = {
  args: { latest: true, fresh: { ageDays: 2, lifeDays: 14 } },
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector('[data-new-label]')!;
    await expect(getComputedStyle(label).transitionDuration).toBe('0s');
  },
};
