import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from './Label';

const meta = {
  title: 'Primitives/Label',
  component: Label,
  args: { children: 'Design mock · three screens' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Smoke never sits on Raised: there the label is Ash. */
export const OnRaised: Story = {
  args: { tone: 'secondary', children: 'Pull request · duo-decide #18' },
  globals: { backgrounds: { value: 'raised' } },
};

export const Primary: Story = {
  args: { tone: 'primary', children: 'About / Titan Intake' },
};

export const AsParagraph: Story = {
  args: { as: 'p', children: 'Next project' },
};
