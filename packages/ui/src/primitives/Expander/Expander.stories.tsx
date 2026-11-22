import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Text } from '../Text/Text';
import { Expander, ExpanderGroup } from './Expander';

const body = (
  <Text measure>
    One shared queue of decisions for two people. Vote mode is quick: one of you proposes options
    and the other picks.
  </Text>
);

const meta = {
  title: 'Primitives/Expander',
  component: Expander,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="p-gutter">
        <Story />
      </div>
    ),
  ],
  args: { title: 'What I’m building', children: body },
  render: (args) => (
    <ExpanderGroup>
      <Expander {...args} />
    </ExpanderGroup>
  ),
} satisfies Meta<typeof Expander>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: /What I’m building/ });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Open: Story = { args: { defaultOpen: true } };

export const WithMeta: Story = { args: { meta: '3 artifacts' } };

/** Click or press Enter on the row: it opens, and the plus becomes a minus. */
export const Toggles: Story = {
  args: { meta: '3 artifacts' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /What I’m building/ });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByRole('region', { name: /What I’m building/ })).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  },
};

/** The four rows of a project page. All closed by default. */
export const Group: Story = {
  render: () => (
    <ExpanderGroup>
      <Expander id="building" title="What I’m building" meta="3 artifacts">
        {body}
      </Expander>
      <Expander id="tried" title="What I tried" meta="3 artifacts" defaultOpen>
        {body}
      </Expander>
      <Expander id="didnt-work" title="What didn’t work" meta="3 artifacts">
        {body}
      </Expander>
      <Expander id="next" title="Open questions and next" meta="1 artifact">
        {body}
      </Expander>
    </ExpanderGroup>
  ),
};

/** Reduced motion: the body appears with no transition. */
export const Reduced: Story = {
  args: { defaultOpen: true },
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region');
    await expect(getComputedStyle(region).transitionDuration).toBe('0s');
  },
};
