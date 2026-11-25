import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

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
    // The live page does not turn the portal on yet: it is decoration, with nothing to press.
    await expect(canvasElement.querySelector('[data-contact-portal]')).toBeNull();
    await expect(canvasElement.querySelector('[data-contact-door]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};

/**
 * The portal turned on, as the page will have it once the game is wired: the words come from
 * `contact.json`, and "Enter" calls `onEnterPortal`.
 */
export const PortalOn: Story = {
  args: { onEnterPortal: fn() },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Open the portal' });
    await userEvent.click(button);
    const dialog =
      canvasElement.ownerDocument.querySelector<HTMLDialogElement>('[data-confirm-dialog]')!;
    await expect(dialog.open).toBe(true);
    await expect(dialog).toHaveAccessibleName('Step through?');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enter' }));
    await waitFor(() => expect(dialog.open).toBe(false));
    await expect(args.onEnterPortal).toHaveBeenCalledTimes(1);
  },
};

export const PortalOnPhone: Story = {
  args: { onEnterPortal: fn() },
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    await expect(
      within(canvasElement).getByRole('button', { name: 'Open the portal' }),
    ).toBeVisible();
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
