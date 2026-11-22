import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Portrait } from './Portrait';
import { cyberLook, normalLook, portraitCopy } from './Portrait.fixtures';

/**
 * The portrait with its Cyberware switch. Hover the switch: he glances at it. Click it: the
 * transformation plays and the other look takes over. The stories use stand-in stills and clips
 * (blocks of colour with two moving bars); the site passes the real media.
 */
const meta = {
  title: 'Sections/Pages/Portrait',
  component: Portrait,
  args: { normal: normalLook, cyber: cyberLook, ...portraitCopy },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Portrait>;

export default meta;
type Story = StoryObj<typeof meta>;

const shown = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLVideoElement>('video[data-shown]')].map(
    (video) => video.dataset.clip,
  );
const clip = (root: HTMLElement, name: string) =>
  root.querySelector<HTMLVideoElement>(`video[data-clip="${name}"]`)!;
const wait = { timeout: 8000 };

/** Idle: the six clips are loaded over the still and the idle loop for the look plays. */
export const Idle: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('video').length).toBe(6), wait);
    await waitFor(() => expect(shown(canvasElement)).toEqual(['normalIdle']), wait);
    await expect(clip(canvasElement, 'normalIdle').paused).toBe(false);
    await expect(clip(canvasElement, 'normalIdle').loop).toBe(true);
    // Every clip has the look's still as its poster.
    await expect(clip(canvasElement, 'cyberIdle').poster).toContain('data:image/svg+xml');
  },
};

/** Hover or focus the switch: the glance clip plays down to the hold and stops there. */
export const Glance: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: /Cyberware/ });
    await waitFor(() => expect(shown(canvasElement)).toEqual(['normalIdle']), wait);
    await userEvent.hover(button);
    await waitFor(() => expect(shown(canvasElement)).toEqual(['normalGlance']), wait);
    const glance = clip(canvasElement, 'normalGlance');
    await waitFor(() => expect(glance.paused).toBe(true), wait);
    await expect(glance.currentTime).toBeGreaterThanOrEqual(1);
    // Leaving brings the eyes back up, then the idle loop takes over again.
    await userEvent.unhover(button);
    await waitFor(() => expect(shown(canvasElement)).toEqual(['normalIdle']), wait);
  },
};

/** Click the switch: the transformation plays, then the cyberware idle loop takes over. */
export const Transform: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: /Cyberware/ });
    await waitFor(() => expect(shown(canvasElement)).toEqual(['normalIdle']), wait);
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(shown(canvasElement)).toEqual(['toCyber']), wait);
    await waitFor(() => expect(shown(canvasElement)).toEqual(['cyberIdle']), wait);
    await expect(
      within(canvasElement).getByRole('img', { name: /with cyberware/ }),
    ).toBeInTheDocument();
  },
};

/** The cyberware look from the start. */
export const Cyberware: Story = {
  args: { defaultCyber: true },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(shown(canvasElement)).toEqual(['cyberIdle']), wait);
  },
};

/** Reduced motion: no video at all. The switch swaps the two stills. */
export const Reduced: Story = {
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: /Cyberware/ });
    await expect(canvasElement.querySelectorAll('video').length).toBe(0);
    const frame = canvasElement.querySelector('[data-cyber]')!;
    await expect(frame).toHaveAttribute('data-cyber', 'off');
    await userEvent.click(button);
    await expect(frame).toHaveAttribute('data-cyber', 'on');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(canvasElement.querySelectorAll('video').length).toBe(0);
  },
};

/** No clips passed: stills only, whatever the motion setting. */
export const StillsOnly: Story = {
  args: {
    normal: { still: normalLook.still, alt: normalLook.alt },
    cyber: { still: cyberLook.still, alt: cyberLook.alt },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('video').length).toBe(0);
  },
};

/** Below the fold: nothing but the stills is loaded until the portrait comes near the viewport. */
export const LazyLoad: Story = {
  decorators: [
    (Story) => (
      <div>
        <div className="type-label flex h-[1600px] items-start">Scroll down</div>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(canvasElement.querySelectorAll('video').length).toBe(0);
    canvasElement.querySelector('figure')!.scrollIntoView();
    await waitFor(() => expect(canvasElement.querySelectorAll('video').length).toBe(6), wait);
    await waitFor(() => expect(shown(canvasElement)).toEqual(['normalIdle']), wait);
  },
};

export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
