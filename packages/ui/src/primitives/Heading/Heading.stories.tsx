import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from './Heading';

const meta = {
  title: 'Primitives/Heading',
  component: Heading,
  args: { level: 1, children: 'Duo Decide' },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {};

export const H2: Story = { args: { level: 2 } };

export const H3: Story = { args: { level: 3, children: 'How a decision works' } };

/** The Home headline: an `h1` in the hero role. */
export const Hero: Story = {
  parameters: { layout: 'fullscreen' },
  args: { role: 'hero' },
  render: (args) => (
    <div className="p-gutter">
      <Heading {...args}>
        What I’ve built,
        <br />
        and what’s
        <br />
        still growing.
      </Heading>
    </div>
  ),
};

/** A section title on a project page: an `h2` set as a label. */
export const SectionLabel: Story = {
  args: { level: 2, role: 'label', children: 'Where it’s at' },
};

/** Wide type is long: the title must wrap inside 390px. */
export const LongTitle: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="p-gutter">
      <Heading level={1}>The new mark is a growth ring</Heading>
    </div>
  ),
};
