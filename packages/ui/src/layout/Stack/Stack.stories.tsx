import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoryBlock } from '../internal/StoryBlock';
import { Stack } from './Stack';

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  args: {
    children: (
      <>
        <StoryBlock>One</StoryBlock>
        <StoryBlock>Two</StoryBlock>
        <StoryBlock>Three</StoryBlock>
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Tight: Story = { args: { gap: 6 } };
export const Loose: Story = { args: { gap: 40 } };
export const AlignStart: Story = { args: { align: 'start' } };
