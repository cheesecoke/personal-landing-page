import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { handoffCopy } from '../internal/homeCopy';
import { HomeHandoff } from './HomeHandoff';

const meta = {
  title: 'Sections/Home/HomeHandoff',
  component: HomeHandoff,
  parameters: { layout: 'fullscreen' },
  args: handoffCopy,
} satisfies Meta<typeof HomeHandoff>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The hand-off to Projects, and the quiet line to Contact on the right. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole('region', { name: 'Next' });
    await expect(within(section).getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
    await expect(
      within(section).getByRole('link', { name: 'Building with agents too? Write to me.' }),
    ).toHaveAttribute('href', '/contact');
  },
};

/** The hand-off alone. */
export const NoAside: Story = { args: { aside: undefined } };

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** 390 wide: the two stack, left aligned. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };

/** Reduced motion: the arrows do not slide on hover. */
export const Reduced: Story = { globals: { motion: 'reduce' } };
