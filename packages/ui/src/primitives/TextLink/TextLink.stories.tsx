import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Text } from '../Text/Text';
import { TextLink } from './TextLink';

const meta = {
  title: 'Primitives/TextLink',
  component: TextLink,
  args: { href: '#projects', children: 'All projects' },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'The work at Titan Intake' },
};

export const Secondary: Story = { args: { tone: 'secondary' } };

export const Body: Story = {
  args: { size: 'body', tone: 'secondary', children: 'Building with agents too? Write to me.' },
};

export const Lead: Story = {
  args: { size: 'lead', arrow: 'md', children: 'Let me know what else I should try.' },
};

export const LongArrow: Story = {
  args: { arrow: 'md', children: 'The monthly log' },
};

export const NoArrow: Story = { args: { arrow: false } };

/** A link inside a sentence. */
export const Inline: Story = {
  render: () => (
    <Text measure>
      The pipeline behind it is my{' '}
      <TextLink inline href="#ai-system">
        AI system
      </TextLink>
      .
    </Text>
  ),
};

/** The arrow and the colour do not animate under reduced motion. */
export const Reduced: Story = {
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(getComputedStyle(link).transitionDuration).toBe('0s');
  },
};
