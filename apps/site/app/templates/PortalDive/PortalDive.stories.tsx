import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { bestStore, type BestResult, type DiveResult } from '@cwc/dive/react';

import { diveCopy } from './copy';
import PortalDive from './PortalDive';

/** A Storage stand-in. `blocked` throws on every call, as private modes and settings can. */
function storage(initial?: BestResult, blocked = false): Storage {
  const data = new Map<string, string>();
  const guard = () => {
    if (blocked) throw new DOMException('blocked', 'SecurityError');
  };
  const s: Storage = {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    getItem: (k) => (guard(), data.get(k) ?? null),
    setItem: (k, v) => (guard(), void data.set(k, v)),
    removeItem: (k) => void data.delete(k),
  };
  if (initial) data.set('best', JSON.stringify(initial));
  return s;
}
const store = (initial?: BestResult, blocked = false) =>
  bestStore(storage(initial, blocked), 'best');

const crashed: DiveResult = {
  status: 'crashed',
  ringsPassed: 14,
  ringsTotal: 32,
  ringsHit: 3,
  livesLeft: 0,
  elapsedMs: 21_400,
  clean: false,
};
const won: DiveResult = {
  status: 'won',
  ringsPassed: 32,
  ringsTotal: 32,
  ringsHit: 1,
  livesLeft: 2,
  elapsedMs: 45_100,
  clean: false,
};
const wonClean: DiveResult = { ...won, ringsHit: 0, livesLeft: 3, clean: true };

/**
 * The Portal dive as the overlay shows it, full size: start, the run, and the end screens. The
 * game is real; the end screens can be opened straight from a result (`preview`).
 */
const meta = {
  title: 'Templates/PortalDive',
  component: PortalDive,
  parameters: { layout: 'fullscreen' },
  args: {
    mailto: 'mailto:hello@example.com',
    linkedin: 'https://example.com/in/someone',
    onExit: fn(),
    seed: 7,
  },
  decorators: [
    (Story) => (
      <div className="h-dvh bg-ground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PortalDive>;

export default meta;
type Story = StoryObj<typeof meta>;

const desktop = { viewport: { value: 'desktop' } };
const phone = { viewport: { value: 'phone' } };
const screenOf = (root: HTMLElement) =>
  root.querySelector('[data-dive-screen]')?.getAttribute('data-dive-screen') ?? null;

/** Start: the name, how to play, and Start, which has focus. Nothing moves until it is pressed. */
export const Start: Story = {
  args: { store: store() },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: diveCopy.name })).toBeVisible();
    await expect(canvas.getByText(diveCopy.start)).toBeVisible();
    await expect(canvas.getByText(diveCopy.keysHint)).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Start' })).toHaveFocus());
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    await expect(canvasElement.querySelector('[data-dive-best]')).toBeNull();
    const exit = canvas.getByRole('button', { name: 'Exit' });
    await expect(exit.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

/** Start, then the run: the panel goes, the tunnel moves, and the keys steer. */
export const Running: Story = {
  args: { store: store() },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Start' }));
    await expect(screenOf(canvasElement)).toBeNull();
    const bar = await canvas.findByRole('progressbar');
    await userEvent.keyboard('{ArrowLeft>}');
    await waitFor(() => expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0), {
      timeout: 5000,
    });
    await userEvent.keyboard('{/ArrowLeft}');
    // Exit is still there while running.
    await expect(canvas.getByRole('button', { name: 'Exit' })).toBeVisible();
  },
};

/** Crashed: a line, the rings threaded, and "Dive again" with focus. */
export const Crashed: Story = {
  args: { store: store(), preview: crashed },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: diveCopy.crashed })).toBeVisible();
    await expect(canvas.getByText('Rings threaded: 14 of 32')).toBeVisible();
    await expect(canvas.getByText('Lives left: 0')).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Dive again' })).toHaveFocus());
    await expect(canvas.queryByText(diveCopy.note)).toBeNull();
  },
};

/** "Dive again" lays out a fresh run and starts it straight away. */
export const DiveAgain: Story = {
  args: { store: store(), preview: crashed },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Dive again' }));
    await expect(screenOf(canvasElement)).toBeNull();
    const bar = await canvas.findByRole('progressbar');
    await waitFor(() => expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0), {
      timeout: 5000,
    });
  },
};

/** Won: the stats, then the note and the way to write. */
export const Won: Story = {
  args: { store: store(), preview: won },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: diveCopy.won })).toBeVisible();
    await expect(canvas.getByText('Lives left: 2')).toBeVisible();
    await expect(canvas.getByText(diveCopy.note)).toBeVisible();
    await expect(canvas.getByRole('link', { name: diveCopy.linkedin })).toHaveAttribute(
      'href',
      'https://example.com/in/someone',
    );
    await expect(canvas.getByRole('link', { name: diveCopy.email })).toHaveAttribute(
      'href',
      'mailto:hello@example.com',
    );
    await expect(canvasElement.querySelector('[data-dive-clean]')).toBeNull();
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Dive again' })).toHaveFocus());
  },
};

/** A win without a single hit is a clean dive. */
export const WonClean: Story = {
  args: { store: store(), preview: wonClean },
  globals: desktop,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(diveCopy.clean)).toBeVisible();
  },
};

/** With a best kept from an earlier visit: it shows quietly on the start screen. */
export const WithBest: Story = {
  args: { store: store({ ...crashed, ringsPassed: 20 }) },
  globals: desktop,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Best: 20 of 32 rings')).toBeVisible();
  },
};

/** The best on an end screen, under this run's own stats. */
export const CrashedWithBest: Story = {
  args: { store: store(won), preview: crashed },
  globals: desktop,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Best: through, with 2 lives left')).toBeVisible();
  },
};

/** Storage blocked: the game plays and the end screens work; the best lasts for the visit. */
export const StorageUnavailable: Story = {
  args: { store: store(undefined, true) },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('[data-dive-best]')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Start' })).toBeVisible();
  },
};

/** Exit leaves from any screen. */
export const Exit: Story = {
  args: { store: store(), onExit: fn() },
  globals: desktop,
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Exit' }));
    await expect(args.onExit).toHaveBeenCalledTimes(1);
  },
};

/** On a phone: the touch hint where touch comes first, the tunnel centred in the space left. */
export const Phone: Story = {
  args: { store: store() },
  globals: phone,
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const panel = canvasElement.querySelector('[data-dive-screen]')!.getBoundingClientRect();
    await expect(panel.left).toBeGreaterThanOrEqual(16);
    await expect(panel.right).toBeLessThanOrEqual(window.innerWidth - 16);
  },
};

export const PhoneWon: Story = {
  args: { store: store(), preview: wonClean },
  globals: phone,
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Reduced motion: the game runs in calm mode (slower, wider gaps, no shake). */
export const Reduced: Story = {
  args: { store: store() },
  globals: { ...desktop, motion: 'reduce' },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('section[aria-label]')).toHaveAttribute(
        'data-dive-calm',
        'true',
      ),
    );
  },
};
