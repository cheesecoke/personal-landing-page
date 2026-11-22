import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoryBlock } from '../internal/StoryBlock';
import { Cluster } from './Cluster';

const meta = {
  title: 'Layout/Cluster',
  component: Cluster,
  args: {
    children: (
      <>
        <StoryBlock>Projects</StoryBlock>
        <StoryBlock>About</StoryBlock>
        <StoryBlock>Beyond</StoryBlock>
        <StoryBlock>Contact</StoryBlock>
      </>
    ),
  },
} satisfies Meta<typeof Cluster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SpaceBetween: Story = { args: { justify: 'between', gapX: 48, gapY: 32 } };
export const AlignEnd: Story = { args: { align: 'end', gapX: 64, gapY: 16 } };
/** At 390 the row wraps instead of overflowing. */
export const Phone: Story = {
  args: { gapX: 48, gapY: 8 },
  globals: { viewport: { value: 'phone' } },
};
