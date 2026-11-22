import type { Meta, StoryObj } from '@storybook/react-vite';

import { LitEdge } from './LitEdge';

const meta = {
  title: 'Primitives/LitEdge',
  component: LitEdge,
  decorators: [
    (Story) => (
      <div className="relative mt-4 h-22 w-full max-w-70 rounded-panel border border-hairline bg-raised shadow-panel">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LitEdge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** When something else on the page holds the one glow. */
export const NoGlow: Story = { args: { glow: false } };
