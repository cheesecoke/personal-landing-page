import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SiteFooter } from './SiteFooter';

const meta = {
  title: 'Layout/SiteFooter',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
  args: {
    name: 'Chase Cole',
    tagline: 'Senior Software Engineer, AI · Titan Intake',
    copyright: '© 2026 Chase Cole',
    navLabel: 'Footer',
    links: [
      { label: 'Projects', href: '/projects' },
      { label: 'About', href: '/about' },
      { label: 'Beyond', href: '/beyond', quiet: true },
      { label: 'Contact', href: '/contact' },
    ],
    email: 'chasewcole@gmail.com',
    lastUpdate: { label: 'Last update', date: '20 Nov 2026', dateTime: '2026-11-20' },
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Footer' })).toBeVisible();
    const time = canvasElement.querySelector('time');
    await expect(time?.getAttribute('datetime')).toBe('2026-11-20');
    await expect(canvas.getByRole('link', { name: 'chasewcole@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:chasewcole@gmail.com',
    );
  },
};

/** No live data yet: the "Last update" line is not rendered at all. */
export const NoLastUpdate: Story = {
  args: { lastUpdate: undefined },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toBeNull();
  },
};

/** Under `md` the nav and the address wrap below the name and line up with the left edge. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

export const Reduced: Story = { globals: { motion: 'reduce' } };
