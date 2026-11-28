import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { bestStore } from '@cwc/dive/react';

import contact from '../../../content/hand/contact.json';
import { FakeAudio, FakeAudioContext } from './fakeAudio';
import { PortalDiveHost, type PortalDiveHostProps } from './PortalDiveHost';
import { soundStore } from './sound';

const words = contact.portal.entry.game;

const silent = () => new FakeAudio();
const silentContext = () => new FakeAudioContext();

/** A stand-in for the portal button, and the overlay it opens. */
function Demo({ open: _open, onClose: _onClose, ...props }: PortalDiveHostProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6">
      <button
        type="button"
        data-demo-portal=""
        className="min-h-touch cursor-pointer border border-hairline bg-transparent px-4 type-button text-primary"
        onClick={() => setOpen(true)}
      >
        Open the portal
      </button>
      <PortalDiveHost open={open} onClose={() => setOpen(false)} {...props} />
    </div>
  );
}

/**
 * The full-screen layer the Portal dive plays in, opened from the Contact page's portal. It loads
 * the game's own chunk the first time it opens.
 */
const meta = {
  title: 'Templates/PortalDiveHost',
  component: PortalDiveHost,
  parameters: { layout: 'fullscreen' },
  args: {
    open: false,
    onClose: fn(),
    mailto: 'mailto:hello@example.com',
    words,
    // A silent audio element: stories never play sound.
    gameProps: {
      seed: 7,
      store: bestStore(null),
      sound: soundStore(null),
      audio: silent,
      audioContext: silentContext,
    },
  },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof PortalDiveHost>;

export default meta;
type Story = StoryObj<typeof meta>;

const portal = (root: HTMLElement) => root.querySelector<HTMLButtonElement>('[data-demo-portal]')!;
const overlay = (root: HTMLElement) =>
  root.ownerDocument.querySelector<HTMLDialogElement>('[data-portal-dive]')!;

async function openOverlay(root: HTMLElement) {
  await userEvent.click(portal(root));
  const dialog = overlay(root);
  await expect(dialog.open).toBe(true);
  await expect(dialog.matches(':modal')).toBe(true);
  await expect(dialog).toHaveAccessibleName(words.label);
  await expect(document.documentElement.style.overflow).toBe('hidden');
  const box = dialog.getBoundingClientRect();
  await expect(box.width).toBe(window.innerWidth);
  await expect(box.height).toBe(window.innerHeight);
  return dialog;
}

async function closedToPortal(root: HTMLElement) {
  await waitFor(() => expect(overlay(root).open).toBe(false));
  await expect(portal(root)).toHaveFocus();
  await expect(document.documentElement.style.overflow).toBe('');
}

const wonGame = {
  seed: 7,
  store: bestStore(null),
  sound: soundStore(null),
  audio: silent,
  audioContext: silentContext,
  preview: {
    status: 'won',
    ringsPassed: 32,
    ringsTotal: 32,
    ringsHit: 0,
    livesLeft: 3,
    elapsedMs: 45_000,
    clean: true,
  },
} as const;

/** Opens on the win, waits for the garden, and sits down: only the scene is left. */
async function sitInGarden(root: HTMLElement) {
  const dialog = await openOverlay(root);
  await waitFor(() => expect(dialog.querySelector('[data-dive-garden]')).not.toBeNull(), {
    timeout: 8000,
  });
  await userEvent.click(within(dialog).getByRole('button', { name: 'Sit for a while' }));
  await waitFor(() =>
    expect(dialog.querySelector('[data-dive-garden]')).toHaveAttribute(
      'data-dive-garden',
      'resting',
    ),
  );
  return dialog;
}

// Never settles: the loading state stays on screen.
const pending = () => new Promise<never>(() => {});
const failing = () => Promise.reject(new Error('offline'));

/** The real chunk: opens on the start screen with Start focused; Exit returns to the portal. */
export const Open: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const dialog = await openOverlay(canvasElement);
    const start = await within(dialog).findByRole('button', { name: 'Start' });
    await waitFor(() => expect(start).toHaveFocus());
    await userEvent.click(within(dialog).getByRole('button', { name: 'Exit' }));
    await closedToPortal(canvasElement);
  },
};

/** Escape leaves at any time, mid-run included, and focus goes back to the portal. */
export const Escape: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const dialog = await openOverlay(canvasElement);
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Start' }));
    await userEvent.keyboard('{Escape}');
    await closedToPortal(canvasElement);
  },
};

/** "Back to Contact" on an end screen closes it too. */
export const BackToContact: Story = {
  args: {
    gameProps: {
      seed: 7,
      store: bestStore(null),
      sound: soundStore(null),
      audio: silent,
      audioContext: silentContext,
      preview: {
        status: 'crashed',
        ringsPassed: 9,
        ringsTotal: 32,
        ringsHit: 3,
        livesLeft: 0,
        elapsedMs: 15_000,
        clean: false,
      },
    },
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const dialog = await openOverlay(canvasElement);
    // The loading view has a way back too: wait for the game's end screen.
    await within(dialog).findByRole('button', { name: 'Dive again' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Back to Contact' }));
    await closedToPortal(canvasElement);
  },
};

/** While the chunk loads: one quiet line and a way back. */
export const Loading: Story = {
  args: { load: pending },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const dialog = await openOverlay(canvasElement);
    await expect(within(dialog).getByRole('status')).toHaveTextContent(words.loading);
    await userEvent.keyboard('{Escape}');
    await closedToPortal(canvasElement);
  },
};

/** The chunk did not load: say so, and go back. */
export const Failed: Story = {
  args: { load: failing },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const dialog = await openOverlay(canvasElement);
    await waitFor(() => expect(within(dialog).getByRole('status')).toHaveTextContent(words.failed));
    await userEvent.click(within(dialog).getByRole('button', { name: words.back }));
    await closedToPortal(canvasElement);
  },
};

/** On a phone the layer fills the screen exactly, and nothing scrolls sideways. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    const dialog = await openOverlay(canvasElement);
    await within(dialog).findByRole('button', { name: 'Start' });
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Reduced motion: no fade on the layer. */
export const Reduced: Story = {
  globals: { viewport: { value: 'desktop' }, motion: 'reduce' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-motion', 'reduce'));
    const dialog = await openOverlay(canvasElement);
    await expect(getComputedStyle(dialog).transitionDuration).toBe('0s');
  },
};

const made: FakeAudio[] = [];
let closingContext: FakeAudioContext | null = null;
/** Closing stops the music: a short fade, then the element is paused, let go, and the context closed. */
export const SoundStopsOnClose: Story = {
  args: {
    gameProps: {
      seed: 7,
      store: bestStore(null),
      sound: soundStore(null),
      // Each mount makes the music, then the garden's ambience: keep the music.
      audio: () => {
        const audio = new FakeAudio();
        made.push(audio);
        return audio;
      },
      audioContext: () => (closingContext = new FakeAudioContext()),
    },
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const dialog = await openOverlay(canvasElement);
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Start' }));
    const audio = made.at(-2)!;
    await expect(audio.paused).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Exit' }));
    await closedToPortal(canvasElement);
    await waitFor(() => expect(audio.paused).toBe(true));
    await expect(audio.src).toBe('');
    await expect(closingContext?.state).toBe('closed');
  },
};

/** Resting in the garden, Escape leaves, and focus goes back to the portal on the page. */
export const EscapeFromGarden: Story = {
  args: { gameProps: wonGame },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await sitInGarden(canvasElement);
    await userEvent.keyboard('{Escape}');
    await closedToPortal(canvasElement);
  },
};

/** Resting in the garden, the portal in the scene leaves too, the same as Exit. */
export const PortalFromGarden: Story = {
  args: { gameProps: wonGame },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const dialog = await sitInGarden(canvasElement);
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Go back through the portal' }),
    );
    await closedToPortal(canvasElement);
  },
};

/** Leaving the garden lets the clip go: nothing keeps loading or playing behind the page. */
export const GardenReleasesVideo: Story = {
  args: { gameProps: wonGame },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const dialog = await openOverlay(canvasElement);
    const video = await waitFor(
      () => {
        const el = dialog.querySelector<HTMLVideoElement>('video[data-garden-video]');
        if (!el) throw new Error('no video yet');
        return el;
      },
      { timeout: 10000 },
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Exit' }));
    await closedToPortal(canvasElement);
    await waitFor(() => expect(video.isConnected).toBe(false));
    await expect(video.paused).toBe(true);
    await expect(video.networkState).toBe(HTMLMediaElement.NETWORK_EMPTY);
  },
};
