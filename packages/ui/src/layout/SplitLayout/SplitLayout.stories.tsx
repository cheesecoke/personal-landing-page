import type { Meta, StoryObj } from '@storybook/react-vite';

import { Container } from '../Container/Container';
import { StoryBlock } from '../internal/StoryBlock';
import { SplitLayout } from './SplitLayout';

const meta = {
  title: 'Layout/SplitLayout',
  component: SplitLayout,
  parameters: { layout: 'fullscreen' },
  args: {
    children: (
      <>
        <StoryBlock tall>Lead</StoryBlock>
        <StoryBlock tall>Rest</StoryBlock>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof SplitLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** "Where it's at": a 400px text column, then the facts. */
export const Default: Story = {};
/** The project opening: a 420px title column against the hero, centred, no gap. */
export const Opening: Story = {
  args: { columns: 'lead-420', gap: 0, stackGap: 32, align: 'center' },
};
/** The family block: a fixed 320px figure, then the text. */
export const Family: Story = { args: { columns: 'lead-320', stackGap: 40, align: 'center' } };
export const ElevenNine: Story = { args: { columns: '11-9' } };
export const Equal: Story = { args: { columns: 'equal' } };
/** In a narrow slot the blocks stack. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
/** It answers to its slot, not the viewport: a 600px slot on a wide screen still stacks. */
export const NarrowSlot: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[600px]">
        <Story />
      </div>
    ),
  ],
};
