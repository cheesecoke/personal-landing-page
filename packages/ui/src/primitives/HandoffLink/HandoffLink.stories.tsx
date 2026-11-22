import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { HandoffLink } from './HandoffLink';

const meta = {
  title: 'Primitives/HandoffLink',
  component: HandoffLink,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="p-gutter">
        <Story />
      </div>
    ),
  ],
  args: { href: '#about', label: 'Next', children: 'About' },
} satisfies Meta<typeof HandoffLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

/** Home: the link stays Bone and the arrow is Signal. */
export const Home: Story = {
  args: { variant: 'home', href: '#projects', children: 'Projects' },
};

export const Project: Story = {
  args: { variant: 'project', label: 'Next project', href: '#ai-system', children: 'AI system' },
};

/** A long name wraps; the arrow drops to its own line before anything overflows. */
export const LongName: Story = {
  args: { variant: 'project', label: 'Next project', children: 'Personal brain' },
};

export const NoLabel: Story = { args: { label: undefined } };

export const Reduced: Story = {
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const arrow = within(canvasElement).getByRole('link').querySelector('svg');
    await expect(getComputedStyle(arrow!).transitionDuration).toBe('0s');
  },
};
