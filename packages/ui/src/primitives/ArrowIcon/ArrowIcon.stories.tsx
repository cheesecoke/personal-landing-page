import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../Label/Label';
import { ArrowIcon, type ArrowSize } from './ArrowIcon';

const meta = {
  title: 'Primitives/ArrowIcon',
  component: ArrowIcon,
  args: { size: 'sm' },
} satisfies Meta<typeof ArrowIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {};
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };

const sizes: ArrowSize[] = ['sm', 'md', 'lg', 'lgRound', 'lgLow'];

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-bone">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-20">
            <Label>{size}</Label>
          </span>
          <ArrowIcon size={size} />
        </div>
      ))}
    </div>
  ),
};

/** The arrow takes the text colour of whatever holds it. */
export const InSignal: Story = {
  args: { size: 'lgRound', className: 'text-signal' },
};
