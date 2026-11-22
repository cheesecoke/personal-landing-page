import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'See the projects' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { arrow: true } };

export const Quiet: Story = { args: { variant: 'quiet', children: 'Get in touch' } };

/** With an `href` it is a link. */
export const AsLink: Story = {
  args: { href: '#projects', arrow: true },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'See the projects' });
    await expect(link).toHaveAttribute('href', '#projects');
  },
};

/** Without one it is a `<button type="button">`. */
export const AsButton: Story = {
  args: { variant: 'quiet', children: 'Back to the map' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Back to the map' });
    await expect(button).toHaveAttribute('type', 'button');
  },
};

/** Keyboard focus shows the Signal outline. */
export const Focused: Story = {
  args: { variant: 'quiet', children: 'Get in touch' },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

/** The pair in the Home hero. They wrap at phone width. */
export const Pair: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button href="#projects" arrow>
        See the projects
      </Button>
      <Button href="#contact" variant="quiet">
        Get in touch
      </Button>
    </div>
  ),
};

/** Colour changes are instant under reduced motion. */
export const Reduced: Story = {
  args: { arrow: true },
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(getComputedStyle(button).transitionDuration).toBe('0s');
  },
};
