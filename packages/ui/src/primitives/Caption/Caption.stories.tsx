import type { Meta, StoryObj } from '@storybook/react-vite';

import { Caption } from './Caption';

const meta = {
  title: 'Primitives/Caption',
  component: Caption,
  args: { as: 'p', children: 'Design mock · three screens' },
} satisfies Meta<typeof Caption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnRaised: Story = {
  args: { tone: 'secondary', children: 'Capture · Storybook, fixture data' },
  globals: { backgrounds: { value: 'raised' } },
};
