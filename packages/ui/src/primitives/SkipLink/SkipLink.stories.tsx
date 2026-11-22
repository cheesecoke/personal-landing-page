import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Text } from '../Text/Text';
import { SkipLink } from './SkipLink';

const meta = {
  title: 'Primitives/SkipLink',
  component: SkipLink,
  parameters: { layout: 'fullscreen' },
  args: { children: 'Skip to content' },
  render: (args) => (
    <div className="min-h-40 p-gutter">
      <SkipLink {...args} />
      <main id="main" tabIndex={-1}>
        <Text>Press Tab: the link appears at the top-left.</Text>
      </main>
    </div>
  ),
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At rest it is on the page but not on screen. */
export const Hidden: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Skip to content' });
    await expect(link).toHaveAttribute('href', '#main');
    await expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  },
};

/** With keyboard focus it shows, 44px tall. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const link = within(canvasElement).getByRole('link', { name: 'Skip to content' });
    await expect(link).toHaveFocus();
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};
