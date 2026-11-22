import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Text } from '../Text/Text';
import { NewMarker } from './NewMarker';

const meta = {
  title: 'Primitives/NewMarker',
  component: NewMarker,
  // An update lives 14 days.
  args: { ageDays: 0, lifeDays: 14, status: 'live' },
} satisfies Meta<typeof NewMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

const ring = (root: HTMLElement) =>
  root.querySelector('[data-new-ring] circle:nth-of-type(2)')?.getAttribute('stroke-dasharray');

/** Day 0: a full ring. */
export const Day0: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(ring(canvasElement)).toBe('100 100');
    await expect(canvas.getByText('New · today')).toBeInTheDocument();
    await expect(canvas.getByText('New, updated today')).toBeInTheDocument();
  },
};

/** Day 7 of 14: half the ring is left. */
export const MidLife: Story = {
  args: { ageDays: 7 },
  play: async ({ canvasElement }) => {
    await expect(ring(canvasElement)).toBe('50 100');
    await expect(within(canvasElement).getByText('New, updated 7 days ago')).toBeInTheDocument();
  },
};

/** Day 13 of 14: the last sliver. */
export const LastDay: Story = {
  args: { ageDays: 13 },
  play: async ({ canvasElement }) => {
    await expect(ring(canvasElement)).toBe('7 100');
  },
};

/** Day 14: gone. It renders nothing; the status reads as before. */
export const Expired: Story = {
  args: { ageDays: 14 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-new-ring]')).toBeNull();
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
  },
};

/** Without script (before hydration) it renders nothing: the mark needs today's date. */
export const ScriptOff: Story = {
  args: { ageDays: 2, hydrated: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-new-ring]')).toBeNull();
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
  },
};

/** Around any dot: Ember, Signal or hollow. */
export const AroundAnyDot: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <NewMarker status="live" ageDays={2} lifeDays={14} />
      <NewMarker status="build" ageDays={10} lifeDays={14} />
      <NewMarker status="private" ageDays={5} lifeDays={21} />
    </div>
  ),
};

/** A release lives 30 days and carries its version. */
export const Release: Story = {
  args: { ageDays: 2, lifeDays: 30, detail: 'v1.0.0' },
  play: async ({ canvasElement }) => {
    await expect(ring(canvasElement)).toBe('93 100');
    await expect(
      within(canvasElement).getByText('New, updated 2 days ago, v1.0.0'),
    ).toBeInTheDocument();
  },
};

/** The life of an update, day by day. */
export const Draining: Story = {
  render: () => (
    <div className="grid max-w-190 grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-x-6 gap-y-4">
      {[0, 2, 7, 10, 13].map((age) => (
        <div key={age} className="flex flex-col gap-2.5 border-t border-hairline pt-3.5">
          <NewMarker status={age === 10 ? 'build' : 'live'} ageDays={age} lifeDays={14} />
          <Text className="text-sm">Day {age}</Text>
        </div>
      ))}
    </div>
  ),
};

/** Reduced motion: no fade, it appears drawn. */
export const Reduced: Story = {
  args: { ageDays: 3 },
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector('[data-new-label]')!;
    await expect(getComputedStyle(label).transitionDuration).toBe('0s');
    await expect(getComputedStyle(label).opacity).toBe('1');
  },
};
