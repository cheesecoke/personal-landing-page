import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../Label/Label';
import { Hairline } from './Hairline';

const meta = {
  title: 'Primitives/Hairline',
  component: Hairline,
} satisfies Meta<typeof Hairline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Tick: Story = { args: { tone: 'tick' } };

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className="flex h-16 items-center gap-6">
      <Label>Type</Label>
      <Hairline {...args} />
      <Label>Tomorrow · the readout accent</Label>
    </div>
  ),
};

/** A real separator between two groups, announced to assistive technology. */
export const Separator: Story = { args: { decorative: false } };
