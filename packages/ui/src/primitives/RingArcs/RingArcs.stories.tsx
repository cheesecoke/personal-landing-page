import type { Meta, StoryObj } from '@storybook/react-vite';

import { RingArcs } from './RingArcs';

const meta = {
  title: 'Primitives/RingArcs',
  component: RingArcs,
} satisfies Meta<typeof RingArcs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** No arc lit. */
export const Quiet: Story = {
  args: {
    rings: [
      { rx: 26, ry: 12, tone: 'hairline' },
      { rx: 46, ry: 21, tone: 'hairline' },
      { rx: 66, ry: 30, tone: 'hairline' },
    ],
  },
};

/** Dashed arcs that fade outward, as behind the Beyond scene. */
export const Dashed: Story = {
  parameters: { layout: 'fullscreen' },
  args: {
    maxWidth: 1000,
    rings: [
      { rx: 520, ry: 218.4, tone: 'signalDim', dash: '4 8', opacity: 0.5 },
      { rx: 760, ry: 319.2, tone: 'signalDim', dash: '2 9', opacity: 0.38 },
      { rx: 1000, ry: 420, tone: 'signalDim', dash: '4 8', opacity: 0.28 },
    ],
  },
  render: (args) => (
    <div className="overflow-hidden p-gutter">
      <RingArcs {...args} />
    </div>
  ),
};

/** It shrinks with its container and the strokes stay 1px. */
export const Small: Story = {
  render: () => (
    <div className="w-20">
      <RingArcs />
    </div>
  ),
};
