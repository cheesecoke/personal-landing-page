import type { Meta, StoryObj } from '@storybook/react-vite';

import { Readout } from '../Readout/Readout';
import { Favicon, type FaviconSize } from './Favicon';

const meta = {
  title: 'Primitives/Favicon',
  component: Favicon,
} satisfies Meta<typeof Favicon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Size32: Story = { name: '32' };
export const Size64: Story = { name: '64', args: { size: 64 } };
export const Size16: Story = { name: '16', args: { size: 16 } };

const sizes: FaviconSize[] = [64, 32, 16];

/** The three drawings side by side, as on the ring mark board. */
export const Set: Story = {
  render: () => (
    <div className="flex items-end gap-7">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <Favicon size={size} />
          <Readout kind="status" tone="label">
            {size}
          </Readout>
        </div>
      ))}
    </div>
  ),
};
