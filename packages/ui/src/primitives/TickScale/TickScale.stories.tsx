import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../Label/Label';
import { Readout } from '../Readout/Readout';
import { TickScale } from './TickScale';

const meta = {
  title: 'Primitives/TickScale',
  component: TickScale,
} satisfies Meta<typeof TickScale>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The brighter major tick, as on project pages. */
export const Strong: Story = { args: { width: 120, major: 'strong' } };

export const MinorOnly: Story = { args: { major: false } };

export const Wide: Story = { args: { width: 241 } };

/** Under a numeral, where it lives. */
export const UnderNumeral: Story = {
  render: () => (
    <div className="flex flex-col">
      <Readout kind="numeral">1,167</Readout>
      <TickScale width={120} major="strong" className="mt-4.5" />
      <Label className="mt-4">test cases</Label>
    </div>
  ),
};

/** It never grows past its container. */
export const Narrow: Story = {
  render: () => (
    <div className="w-25">
      <TickScale width={241} />
    </div>
  ),
};
