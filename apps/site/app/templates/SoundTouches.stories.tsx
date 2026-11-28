import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ContactContent } from '@cwc/content/hand';
import { SiteNav } from '@cwc/ui';

import contact from '../../content/hand/contact.json';
import { shellLinks, site } from '../shell/site';
import type { CueBus } from '../sound/cues';
import { createTouches, SAME_MS } from '../sound/touches';
import { ContactTemplate } from './ContactTemplate';

/** A recorder for the cue bus: the stories check which cue is asked for, and never play one. */
const recorder = () => ({ play: fn(), hum: fn(), dispose: fn() }) satisfies CueBus;

/** The site's delegated sound listeners around `children`, with sound on and a recorder. */
function Touched({ bus, children }: { bus: CueBus; children: ReactNode }) {
  useEffect(() => createTouches({ gate: () => true, bus: () => bus, nav: null }).install(), [bus]);
  return children;
}

const meta = {
  title: 'Sound/Touches',
  component: Touched,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Touched>;

export default meta;
type Story = StoryObj<typeof meta>;

const navBus = recorder();
/**
 * The header: a tick on hovering a page, a click on pressing one; the sound button makes no UI
 * sound of its own (it has its own "on" cue).
 */
export const Nav: Story = {
  args: {
    bus: navBus,
    children: (
      <SiteNav
        name="Chase Cole"
        label={site.navLabel}
        items={shellLinks}
        current="/"
        menu={site.menu}
        sound={{ on: true, onToggle: fn(), labels: site.sound, shortcut: 'm' }}
      />
    ),
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const about = canvas.getByRole('link', { name: 'About' });
    about.addEventListener('click', (event) => event.preventDefault());
    await userEvent.hover(about);
    await expect(navBus.play).toHaveBeenLastCalledWith('tick', undefined);
    await userEvent.unhover(about);
    await userEvent.hover(about);
    // Not again for the same link within a second.
    await expect(navBus.play).toHaveBeenCalledTimes(1);
    await userEvent.click(about);
    await expect(navBus.play).toHaveBeenLastCalledWith('press', undefined);
    const calls = navBus.play.mock.calls.length;
    const sound = canvas.getByRole('button', { name: 'Sound' });
    await new Promise((r) => setTimeout(r, SAME_MS / 10));
    await userEvent.hover(sound);
    await userEvent.click(sound);
    await expect(navBus.play).toHaveBeenCalledTimes(calls);
  },
};

const portalBus = recorder();
const enter = fn();
/**
 * The Contact portal hums while hovered and lets go on leave; Enter in its dialog clicks (and the
 * page adds a longer pulse on phones).
 */
export const Portal: Story = {
  args: {
    bus: portalBus,
    children: <ContactTemplate content={ContactContent.parse(contact)} onEnterPortal={enter} />,
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const portal = canvasElement.querySelector<HTMLButtonElement>('[data-contact-portal]')!;
    await userEvent.hover(portal);
    await expect(portalBus.hum).toHaveBeenLastCalledWith(true);
    await expect(portalBus.play).not.toHaveBeenCalled();
    await userEvent.unhover(portal);
    await expect(portalBus.hum).toHaveBeenLastCalledWith(false);
    await userEvent.click(portal);
    const dialog = within(document.body).getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enter' }));
    await waitFor(() => expect(enter).toHaveBeenCalled());
    await expect(portalBus.play).toHaveBeenLastCalledWith('press', undefined);
  },
};
