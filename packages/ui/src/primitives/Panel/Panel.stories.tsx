import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Heading } from '../Heading/Heading';
import { Label } from '../Label/Label';
import { Readout } from '../Readout/Readout';
import { Text } from '../Text/Text';
import { Panel } from './Panel';

const meta = {
  title: 'Primitives/Panel',
  component: Panel,
  decorators: [
    (Story) => (
      <div className="max-w-90 pt-2">
        <Story />
      </div>
    ),
  ],
  args: { padded: true },
  render: (args) => (
    <Panel {...args} className="flex flex-col gap-2.5">
      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Readout kind="stardate" dateTime="2026-10-06" />
        <Readout kind="date" dateTime="2026-10-06">
          6 Oct 2026
        </Readout>
      </span>
      <Heading level={3}>Redesign v2</Heading>
      <Text>
        A new design system with tested colour presets, and a Storybook library of every card state.
      </Text>
      <Label as="p" tone="secondary" className="mt-auto border-t border-hairline pt-3">
        Pull request · duo-decide #18
      </Label>
    </Panel>
  ),
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The lit edge: at most one per view. */
export const WithLitEdge: Story = { args: { litEdge: true } };

/** The segment without its glow, when something else on the page holds the glow. */
export const LitEdgeNoGlow: Story = { args: { litEdge: 'no-glow' } };

/** Empty, as on the design system board. */
export const Bare: Story = {
  args: { padded: false, litEdge: true },
  render: (args) => <Panel {...args} className="h-22" />,
};

/** Hover it: it lifts 4px and the border goes Signal dim. */
export const Rise: Story = { args: { rise: true } };

export const Reduced: Story = {
  args: { rise: true },
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('.rounded-panel')!;
    await expect(getComputedStyle(panel).transitionDuration).toBe('0s');
  },
};
