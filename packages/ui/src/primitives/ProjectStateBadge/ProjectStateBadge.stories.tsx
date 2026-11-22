import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Heading } from '../Heading/Heading';
import { Text } from '../Text/Text';
import { ProjectStateBadge } from './ProjectStateBadge';

const meta = {
  title: 'Primitives/ProjectStateBadge',
  component: ProjectStateBadge,
  args: { status: 'build', label: 'In build' },
} satisfies Meta<typeof ProjectStateBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A growing project with a fresh update. */
export const Growing: Story = {
  args: { fresh: { ageDays: 3, lifeDays: 14 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('In build')).toBeVisible();
    await expect(canvas.getByText('New, updated 3 days ago')).toBeInTheDocument();
  },
};

/** A live project, marked by a release. */
export const Live: Story = {
  args: { status: 'live', label: 'Live', fresh: { ageDays: 2, lifeDays: 30, detail: 'v1.0.0' } },
};

/** No recent update: the mark has run out, the status reads as before. */
export const NoUpdate: Story = {
  args: { status: 'live', label: 'Daily use', fresh: { ageDays: 40, lifeDays: 14 } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-new-ring]')).toBeNull();
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
  },
};

/** A name-only project: dot and word, no marker. */
export const Empty: Story = {
  args: { status: 'private', label: 'Private' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-new-ring]')).toBeNull();
  },
};

export const WithMarker: Story = {
  args: { status: 'live', label: 'Daily use', fresh: { ageDays: 0, lifeDays: 14 } },
};

/** Before hydration: the word, the dot and an empty slot of fixed width. Nothing shifts later. */
export const ReservedSlot: Story = {
  args: {
    status: 'live',
    label: 'Daily use',
    fresh: { ageDays: 2, lifeDays: 14 },
    reserveMarker: true,
    hydrated: false,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
    await expect(canvasElement.querySelector('[data-new-slot]')).not.toBeNull();
  },
};

/** The word is Ash in a page header, Smoke in the index, Bone on its own. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ProjectStateBadge status="build" label="In build" tone="primary" />
      <ProjectStateBadge status="build" label="In build" tone="secondary" />
      <ProjectStateBadge status="live" label="Daily use" tone="label" />
    </div>
  ),
};

/** In an index row. At phone width the readout wraps under the word. */
export const InIndexRow: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="p-gutter">
      <div className="flex max-w-140 flex-col gap-1.5 border-t border-hairline pt-4.5 pb-5">
        <Heading level={3}>PAS</Heading>
        <ProjectStateBadge
          status="live"
          label="Daily use"
          tone="label"
          fresh={{ ageDays: 2, lifeDays: 14 }}
        />
        <Text className="mt-0.5" measure>
          My personal assistant system: Atti and the projects that run under it.
        </Text>
      </div>
    </div>
  ),
};

export const Reduced: Story = {
  args: { fresh: { ageDays: 3, lifeDays: 14 } },
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector('[data-new-label]')!;
    await expect(getComputedStyle(label).transitionDuration).toBe('0s');
  },
};
