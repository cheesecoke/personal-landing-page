import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ContactContent } from '@cwc/content/hand';

import contact from '../../content/hand/contact.json';
import { ContactTemplate } from './ContactTemplate';

/** The Contact page, fed by the site's own hand content. */
const meta = {
  title: 'Templates/Contact',
  component: ContactTemplate,
  parameters: { layout: 'fullscreen' },
  args: { content: ContactContent.parse(contact) },
} satisfies Meta<typeof ContactTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Contact shows no live data, so this is the whole page. */
export const NoLiveData: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 }).length).toBe(1);
    const links = canvas.getAllByRole('link');
    await expect(links.length).toBe(3);
    // The mail link stays in the tab; the other sites open a new one.
    await expect(links[0]).not.toHaveAttribute('target');
    await expect(links[1]).toHaveAttribute('target', '_blank');
    await expect(links[2]).toHaveAttribute('target', '_blank');
    // The thread is one piece: a rail, and the floor line it runs into.
    await expect(canvasElement.querySelectorAll('[data-thread]').length).toBe(1);
    await expect(canvasElement.querySelector('[data-contact-thread]')).not.toBeNull();
  },
};

export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** Reduced motion: no travelling light on the thread, and the arrow does not slide. */
export const Reduced: Story = { globals: { motion: 'reduce' } };
