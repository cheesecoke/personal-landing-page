import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Breadcrumb } from './Breadcrumb';

const meta = {
  title: 'Primitives/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [{ label: 'Projects', href: '#projects' }, { label: 'Duo Decide' }],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '#projects',
    );
    await expect(canvas.getByText('Duo Decide')).toHaveAttribute('aria-current', 'page');
  },
};

export const JobPage: Story = {
  args: { items: [{ label: 'About', href: '#about' }, { label: 'Titan Intake' }] },
};

/** Three levels; the trail wraps at phone width. */
export const Nested: Story = {
  args: {
    items: [
      { label: 'Projects', href: '#projects' },
      { label: 'PAS', href: '#pas' },
      { label: 'Atti' },
    ],
  },
};
