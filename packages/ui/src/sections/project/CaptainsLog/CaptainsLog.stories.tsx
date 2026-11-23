import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { LogEntryData } from '../LogEntry/LogEntry';
import { ShootList } from '../ShootList/ShootList';
import { CaptainsLog } from './CaptainsLog';

// Copy from the Captain's log board.
const duo: LogEntryData[] = [
  {
    id: 'duo-2026-11-05',
    date: '2026-11-05',
    kind: 'update',
    lines: [
      'Over-the-air updates, so fixes skip a store review.',
      'Decided decisions can be archived; deletes became soft.',
      'Native audit: a crash fix, touch targets, Dynamic Type.',
    ],
  },
  {
    id: 'duo-2026-11-04',
    date: '2026-11-04',
    kind: 'update',
    lines: [
      'Decision options became a row list, with tappable links.',
      'A 3D yellow heart became the app icon.',
    ],
  },
  {
    id: 'duo-2026-10-07',
    date: '2026-10-07',
    kind: 'update',
    lines: ['Vote mode is one pick by the partner again.'],
  },
  { id: 'duo-2026-10-06', date: '2026-10-06', kind: 'update', lines: ['Redesign v2 merged.'] },
];

// The board's release example: Duo Decide is not live, the version and date are placeholders.
const duoLive: LogEntryData[] = [
  {
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
  {
    id: 'duo-2026-11-05',
    date: '2026-11-05',
    kind: 'update',
    lines: [
      'Over-the-air updates, so fixes skip a store review.',
      'Decided decisions can be archived; deletes became soft.',
    ],
  },
];

const ai: LogEntryData[] = [
  {
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
  {
    id: 'ai-2026-07-18',
    date: '2026-07-18',
    kind: 'update',
    lines: ['An audit showed the lesson loop starved; fixes filed.'],
  },
  {
    id: 'ai-2026-07-06',
    date: '2026-07-06',
    kind: 'update',
    lines: ['The daemon runs tickets on its own.'],
  },
];

const atti: LogEntryData[] = [
  ['2026-11-20', 'Replies now match my Yes or No answers.'],
  ['2026-11-18', 'One Yes now confirms a whole list of calendar events.'],
  ['2026-11-10', 'Logs save at once with an Undo, no confirmation needed.'],
  ['2026-11-05', 'Hands-free: talk to Atti through an iPhone Shortcut.'],
  ['2026-10-29', 'Live replay evals, and flags for quiet failures.'],
  ['2026-10-28', 'Atti goes live on Telegram.'],
].map(([date, line]) => ({ id: `atti-${date}`, date: date!, kind: 'update', lines: [line!] }));

const meta = {
  title: 'Sections/Project/CaptainsLog',
  component: CaptainsLog,
  args: {
    title: 'Captain’s log',
    source: 'From GitHub and Linear',
    releaseLabel: 'Release notes',
    entries: duo,
  },
  decorators: [
    (Story) => (
      <div className="max-w-[760px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CaptainsLog>;

export default meta;
type Story = StoryObj<typeof meta>;

const nodes = (root: HTMLElement) => [...root.querySelectorAll('[data-log-node]')];
const glowing = (root: HTMLElement) =>
  nodes(root).filter((node) => getComputedStyle(node).boxShadow !== 'none');

/** Most projects: up to three recent entries, the newest holds the glow. */
export const Growing: Story = {
  args: { fresh: { ageDays: 17, lifeDays: 14 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = canvas.getByRole('region', { name: 'Captain’s log' });
    const list = within(log).getAllByRole('list')[0]!;
    await expect(list.tagName).toBe('OL');
    await expect(list.querySelectorAll(':scope > li')).toHaveLength(3);
    const times = [...list.querySelectorAll('time')].map((time) => time.getAttribute('datetime'));
    await expect(times).toEqual(['2026-11-05', '2026-11-04', '2026-10-07']);
    // One glow: the newest entry's node.
    await expect(glowing(canvasElement)).toHaveLength(1);
    await expect(glowing(canvasElement)[0]).toBe(nodes(canvasElement)[0]);
    // The mark ran out (17 of 14 days): nothing is drawn.
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
  },
};

/** As on the project pages: the not-yet-grown list closes the panel. */
export const WithShoots: Story = {
  args: {
    children: (
      <ShootList
        title="Not yet grown"
        labels={{
          kind: { goal: 'Goal', idea: 'Idea', question: 'Question' },
          state: { open: 'Not yet grown', grown: 'Grown', answered: 'Answered' },
        }}
        shoots={[
          {
            id: 'app-store',
            label: 'App Store release',
            kind: 'goal',
            state: 'open',
            resolved: null,
          },
          {
            id: 'notifications',
            label: 'Notifications',
            kind: 'idea',
            state: 'open',
            resolved: null,
          },
          { id: 'plan', label: 'Plan after deciding', kind: 'idea', state: 'open', resolved: null },
        ]}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('list', { name: 'Not yet grown' }),
    ).toBeInTheDocument();
  },
};

/** A fresh update: the newest entry carries the new mark. */
export const Fresh: Story = {
  args: { fresh: { ageDays: 2, lifeDays: 14 } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-new-label]')).toHaveLength(1);
    await expect(within(canvasElement).getByText('New · 2d')).toBeInTheDocument();
  },
};

/** Live: the newest entry carries the version and its release notes. */
export const Live: Story = {
  args: { entries: duoLive, source: 'Release notes', fresh: { ageDays: 0, lifeDays: 30 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('v1.0.0')).toBeVisible();
    await expect(canvasElement.querySelector('[data-log-entry="release"]')).not.toBeNull();
  },
};

/** No recent update: only the last entry shows, unchanged. No glow, no mark, no gap message. */
export const NoUpdate: Story = {
  args: { entries: ai, source: 'From GitHub', quiet: true, fresh: { ageDays: 2, lifeDays: 14 } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-log-entry]')).toHaveLength(1);
    await expect(canvasElement.querySelector('time')).toHaveTextContent('14 to 19 Sep 2026');
    await expect(glowing(canvasElement)).toHaveLength(0);
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
  },
};

/** No entries: it renders nothing. */
export const Empty: Story = {
  args: { entries: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
    await expect(canvasElement.querySelector('ol')).toBeNull();
  },
};

/**
 * More than three entries: the rest fold away behind a row. The row's label is a prop; the boards
 * have no copy for it, so this one is a stand-in.
 */
export const Long: Story = {
  args: { entries: atti, source: 'From GitHub', moreLabel: 'Earlier entries' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: 'Earlier entries' });
    await expect(row).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('Atti goes live on Telegram.')).not.toBeVisible();
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(canvas.getByText('Atti goes live on Telegram.')).toBeVisible());
    await expect(canvasElement.querySelectorAll('[data-log-entry]')).toHaveLength(6);
    await expect(glowing(canvasElement)).toHaveLength(1);
  },
};

/** Without a label for the row, the older entries are left out, as on the board. */
export const LongNoRow: Story = {
  args: { entries: atti, source: 'From GitHub' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-log-entry]')).toHaveLength(3);
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

/** Below the fold: the entries rise in when the log scrolls into view. */
export const RiseIn: Story = {
  decorators: [
    (Story) => (
      <div className="pt-[120vh] pb-10">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const log = canvasElement.querySelector('section')!;
    await waitFor(() => expect(log).toHaveAttribute('data-rise', 'armed'));
    await expect(getComputedStyle(log.querySelector('[data-log-entry]')!).opacity).toBe('0');
    log.scrollIntoView();
    await waitFor(() => expect(log).toHaveAttribute('data-rise', 'in'));
    await waitFor(() =>
      expect(getComputedStyle(log.querySelector('[data-log-entry]')!).opacity).toBe('1'),
    );
  },
};

export const Phone: Story = { ...Fresh, globals: { viewport: { value: 'phone' } } };

/** Reduced motion: every entry is shown, nothing rises. The glow stays. */
export const Reduced: Story = {
  ...RiseIn,
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const log = canvasElement.querySelector('section')!;
    await expect(log).not.toHaveAttribute('data-rise');
    for (const entry of log.querySelectorAll('[data-log-entry]')) {
      await expect(getComputedStyle(entry).opacity).toBe('1');
    }
    await expect(glowing(canvasElement)).toHaveLength(1);
  },
};
