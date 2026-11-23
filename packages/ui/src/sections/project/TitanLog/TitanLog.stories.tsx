import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { TitanLog } from './TitanLog';

// Sample entries from the Captain's log board's job log, which the generic job-page draft mounts:
// the skill or the outcome only, no names, no systems, no numbers. The log is off on the site.
const meta = {
  title: 'Sections/Project/TitanLog',
  component: TitanLog,
  args: {
    enabled: true,
    title: 'Captain’s log',
    source: 'Monthly',
    role: 'Senior Software Engineer, AI',
    since: '2026-01',
    sinceLabel: 'since',
    entries: [
      {
        month: '2026-10',
        lines: [
          'Built an evaluation harness for agent pipeline stages.',
          'Taught a session on agent workflows for people outside engineering.',
        ],
      },
      {
        month: '2026-09',
        lines: ['Added a memory layer so the pipeline learns from past runs.'],
      },
      {
        month: '2026-08',
        lines: ['Moved the pipeline’s starting point from tickets to the product spec.'],
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-[760px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TitanLog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Switched on: one entry a month, the role and its start month under the header. */
export const Enabled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Captain’s log' })).toBeVisible();
    // Month-granular: the dates are months, never days.
    const times = [...canvasElement.querySelectorAll('time')];
    await expect(times.map((time) => time.getAttribute('datetime'))).toEqual([
      '2026-10',
      '2026-09',
      '2026-08',
    ]);
    await expect(times[0]).toHaveTextContent('October 2026');
    await expect(canvasElement.querySelector('[data-titan-role]')).toHaveTextContent(
      'Senior Software Engineer, AI · since January 2026',
    );
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
  },
};

/** The default, and the state the site ships in: it renders nothing. */
export const Disabled: Story = {
  args: { enabled: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
    await expect(canvasElement.querySelector('ol')).toBeNull();
    await expect(canvasElement).not.toHaveTextContent('Captain’s log');
  },
};

/** No recent update: only the last month shows, unchanged, with no glow. */
export const NoUpdate: Story = {
  args: { quiet: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-log-entry]')).toHaveLength(1);
    const node = canvasElement.querySelector('[data-log-node]')!;
    await expect(getComputedStyle(node).boxShadow).toBe('none');
  },
};

/** Switched on with no entries: it renders nothing. */
export const Empty: Story = {
  args: { entries: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
  },
};

/**
 * The guard rails: three lines a month at most, and a line with a digit in it is never shown.
 * The fourth line and the line with a number below are test input, not site copy.
 */
export const Guarded: Story = {
  args: {
    entries: [
      {
        month: '2026-10',
        lines: [
          'Built an evaluation harness for agent pipeline stages.',
          'Taught a session on agent workflows for people outside engineering.',
          'Added a memory layer so the pipeline learns from past runs.',
          'Moved the pipeline’s starting point from tickets to the product spec.',
        ],
      },
      { month: '2026-09', lines: ['Test input with a number: 42.'] },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-log-entry]')).toHaveLength(1);
    await expect(canvasElement.querySelectorAll('[data-log-entry] ul > li')).toHaveLength(3);
    await expect(canvasElement).not.toHaveTextContent('42');
  },
};

export const Phone: Story = { ...Enabled, globals: { viewport: { value: 'phone' } } };

/** Reduced motion: every entry is shown, nothing rises. */
export const Reduced: Story = {
  ...Enabled,
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    for (const entry of canvasElement.querySelectorAll('[data-log-entry]')) {
      await expect(getComputedStyle(entry).opacity).toBe('1');
    }
  },
};
