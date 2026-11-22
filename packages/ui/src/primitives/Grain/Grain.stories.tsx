import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from '../Heading/Heading';
import { Label } from '../Label/Label';
import { Grain } from './Grain';

const meta = {
  title: 'Primitives/Grain',
  component: Grain,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Grain>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Ground plus grain at 5%. */
export const Default: Story = {
  render: (args) => (
    <div className="relative overflow-hidden bg-ground">
      <Grain {...args} />
      <div className="relative flex flex-col gap-3 p-gutter py-16">
        <Label>Texture and light</Label>
        <Heading level={2}>Texture means touch, never pattern.</Heading>
      </div>
    </div>
  ),
};

/** The grain turned up, to see that it is there. Never do this on a page. */
export const Exaggerated: Story = {
  render: () => (
    <div className="relative h-60 overflow-hidden bg-ground">
      <Grain style={{ opacity: 0.6 }} />
    </div>
  ),
};

/** Fixed to the viewport, for a page shell. */
export const Fixed: Story = {
  render: () => (
    <div className="p-gutter py-16">
      <Grain position="fixed" />
      <Label>Ground + grain 5%</Label>
    </div>
  ),
};
