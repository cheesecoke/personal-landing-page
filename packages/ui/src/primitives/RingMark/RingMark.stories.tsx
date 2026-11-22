import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { RingMark } from './RingMark';

const meta = {
  title: 'Primitives/RingMark',
  component: RingMark,
} satisfies Meta<typeof RingMark>;

export default meta;
type Story = StoryObj<typeof meta>;

const arcOf = (root: HTMLElement) =>
  getComputedStyle(root.querySelector('[data-ring-arc]')!).strokeDasharray.replace(/px|,/g, '');

/** 24px, as it sits beside the name. Hover it: the arc grows from 25 to 50. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(arcOf(canvasElement)).toBe('25 100');
  },
};

/** 120px: the large drawing, with finer strokes. */
export const Mark: Story = { args: { size: 120 } };

/** The lockup: the mark and the name in one home link. Hovering or focusing the link grows the arc. */
export const Lockup: Story = {
  render: (args) => (
    <a
      href="#home"
      className="group/mark inline-flex min-h-touch items-center gap-2.5 text-lg leading-none font-semibold tracking-[-0.01em] whitespace-nowrap text-bone no-underline font-stretch-125%"
    >
      <RingMark {...args} />
      <span>Chase Cole</span>
    </a>
  ),
};

/** The arc at its hover and focus length. */
export const Active: Story = {
  args: { size: 120, arc: 50 },
  play: async ({ canvasElement }) => {
    await expect(arcOf(canvasElement)).toBe('50 100');
  },
};

/** With a `title` the mark is an image with a name. */
export const Named: Story = { args: { title: 'Chase Cole' } };

/** Reduced motion: the arc stays at 25, with no transition. */
export const Reduced: Story = {
  args: { size: 120 },
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const arc = canvasElement.querySelector('[data-ring-arc]')!;
    await expect(arcOf(canvasElement)).toBe('25 100');
    await expect(getComputedStyle(arc).transitionDuration).toBe('0s');
  },
};
