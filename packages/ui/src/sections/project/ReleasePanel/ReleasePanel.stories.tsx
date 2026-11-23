import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ReleasePanel, type ReleaseData } from './ReleasePanel';

// The release is the Captain's log board's example: Duo Decide is not live, the version and date
// are placeholders, the notes list real features. The boards have no usage numbers and no label
// for this panel: the usage slots and "Latest release" / "As of" below are fixture stand-ins.
const release: ReleaseData = {
  version: 'v1.0.0',
  date: '2026-12-01',
  channel: 'app-store',
  notes: [
    'Voting and three-round polls for two people.',
    'Option lists, history and archive.',
    'Real-time sync between both phones.',
    'Over-the-air updates for fixes.',
  ],
  usage: [
    { label: 'Fixture slot A', value: '12', asOf: '2026-12-08' },
    { label: 'Fixture slot B', value: '3', asOf: '2026-12-08' },
  ],
};

const meta = {
  title: 'Sections/Project/ReleasePanel',
  component: ReleasePanel,
  args: {
    title: 'Latest release',
    release,
    notesLabel: 'Release notes',
    asOfLabel: 'As of',
    channelLabels: {
      'app-store': 'App Store',
      'play-store': 'Play Store',
      testflight: 'TestFlight',
      web: 'Web',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[760px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReleasePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A live project: version, date, channel, notes and usage slots. Fresh for 30 days. */
export const Live: Story = {
  args: { fresh: { ageDays: 2, lifeDays: 30 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Latest release' })).toBeVisible();
    await expect(canvas.getByText('v1.0.0')).toBeVisible();
    await expect(canvas.getByText('App Store')).toBeVisible();
    await expect(canvasElement.querySelector('time')?.getAttribute('datetime')).toBe('2026-12-01');
    await expect(canvasElement.querySelectorAll('[data-usage] dd')).toHaveLength(2);
    await expect(canvas.getByText('New · 2d')).toBeInTheDocument();
  },
};

/** Live, before there are analytics: no usage row at all. */
export const LiveNoUsage: Story = {
  args: { release: { ...release, usage: [] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-usage]')).toBeNull();
  },
};

/** No update: an old release stays as it is, with its date and no mark. */
export const NoUpdate: Story = {
  args: { fresh: { ageDays: 90, lifeDays: 30 } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
    await expect(within(canvasElement).getByText('1 Dec 2026')).toBeVisible();
  },
};

/** Not live: no release, and the panel renders nothing. */
export const Empty: Story = {
  args: { release: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
  },
};

export const Phone: Story = { ...Live, globals: { viewport: { value: 'phone' } } };

/** Reduced motion: the new mark does not fade in. */
export const Reduced: Story = {
  ...Live,
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector('[data-new-label]')!;
    await expect(getComputedStyle(label).transitionDuration).toBe('0s');
  },
};
