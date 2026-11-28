import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { bestStore, type BestResult, type DiveResult } from '@cwc/dive/react';
import { PortalSpiral } from '@cwc/ui';

import { diveCopy } from './copy';
import { FakeAudio, FakeAudioContext } from './fakeAudio';
import PortalDive from './PortalDive';
import { gardenScene } from './scene';
import { SOUND_KEY, soundStore } from './sound';

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

/** The sound choice over its own stand-in storage, so a story can read what was kept. */
function sound(initial?: 'on' | 'off') {
  const s = storage();
  if (initial) s.setItem(SOUND_KEY, initial);
  return { storage: s, store: soundStore(s, SOUND_KEY) };
}

/**
 * Silent audio elements (stories never play sound). Each mount makes two from the same factory,
 * the music and then the garden's ambience; `last()` is the latest mount's music.
 */
function silentAudio(canPlay?: (type: string) => string) {
  const made: FakeAudio[] = [];
  return {
    factory: () => {
      const audio = new FakeAudio();
      if (canPlay) audio.canPlay = canPlay;
      made.push(audio);
      return audio;
    },
    last: () => made.at(-2) ?? null,
  };
}

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
    audio: () => new FakeAudio(),
    audioContext: () => new FakeAudioContext(),
    spiral: PortalSpiral,
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

const soundButton = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('[data-dive-sound]')!;

const soundOn = sound();
const audioOn = silentAudio();
/**
 * The sound button, beside Exit: on by default, a 44px square, first in the tab order (before
 * the game), with a line on the start screen saying there is music. A press turns it off, says
 * so in `aria-pressed` and its name, and keeps the choice.
 */
export const Sound: Story = {
  args: { store: store(), sound: soundOn.store, audio: audioOn.factory },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: diveCopy.sound.label });
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await expect(canvas.getByText(diveCopy.soundNote)).toBeVisible();
    // Before the game in the tab order: the first thing that takes focus in the overlay.
    const game = canvasElement.querySelector('section[aria-label]')!;
    await expect(
      button.compareDocumentPosition(game) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // The track is fetched at mount, but nothing plays on the start screen.
    await waitFor(() => expect(audioOn.last()?.preload).toBe('auto'));
    await expect(audioOn.last()?.paused).toBe(true);

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    // The name stays "Sound"; the state is in aria-pressed and the tooltip.
    await expect(button).toHaveAccessibleName(diveCopy.sound.label);
    await expect(button).toHaveAttribute('title', diveCopy.sound.off);
    await expect(soundOn.storage.getItem(SOUND_KEY)).toBe('off');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(soundOn.storage.getItem(SOUND_KEY)).toBe('on');
  },
};

const audioStart = silentAudio();
let startContext: FakeAudioContext | null = null;
/**
 * Start is the gesture: the Web Audio context is made and resumed inside it, the element plays
 * at full into a gain, and the gain fades in to a quarter.
 */
export const SoundStartsOnStart: Story = {
  args: {
    store: store(),
    sound: sound().store,
    audio: audioStart.factory,
    audioContext: () => (startContext = new FakeAudioContext()),
  },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Start' }));
    const audio = audioStart.last()!;
    await expect(audio.paused).toBe(false);
    await expect(audio.loop).toBe(true);
    await expect(startContext?.state).toBe('running');
    await expect(audio.volume).toBe(1);
    await waitFor(() => expect(startContext?.level).toBeCloseTo(0.25, 5), { timeout: 3000 });
  },
};

const offStore = sound('off');
const audioOff = silentAudio();
/** A kept "off" is respected: the button starts unpressed and Start stays silent. */
export const SoundStoredOff: Story = {
  args: { store: store(), sound: offStore.store, audio: audioOff.factory },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: diveCopy.sound.label });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(await canvas.findByRole('button', { name: 'Start' }));
    await expect(audioOff.last()?.paused).toBe(true);
    await expect(audioOff.last()?.src).toBe('');
  },
};

const keyStore = sound();
/** M toggles the sound while the overlay is open, but not while typing in a field. */
export const SoundKey: Story = {
  args: { store: store(), sound: keyStore.store },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const button = soundButton(canvasElement);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('m');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(keyStore.storage.getItem(SOUND_KEY)).toBe('off');
    await userEvent.keyboard('M');
    await expect(button).toHaveAttribute('aria-pressed', 'true');

    const field = document.createElement('input');
    field.setAttribute('aria-label', 'A field');
    canvasElement.append(field);
    await userEvent.type(field, 'm');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    field.remove();
  },
};

/** The track cannot play here: the button shows unavailable, and the game is unaffected. */
export const SoundUnavailable: Story = {
  args: { store: store(), sound: sound().store, audio: silentAudio(() => '').factory },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = soundButton(canvasElement);
    await waitFor(() => expect(button).toHaveAttribute('data-dive-sound', 'unavailable'));
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAccessibleName(diveCopy.sound.label);
    await expect(button).toHaveAttribute('title', diveCopy.sound.unavailable);
    await userEvent.click(await canvas.findByRole('button', { name: 'Start' }));
    const bar = await canvas.findByRole('progressbar');
    await waitFor(() => expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0), {
      timeout: 5000,
    });
  },
};

/* ---- The garden a win arrives in ------------------------------------------------------------ */

const gardenOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-dive-garden]');
const cardOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-dive-card]');
const portalOf = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('[data-garden-portal]')!;
/** The line that announces how to leave (DiveGame has a status line of its own). */
const statusOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-dive-rest-status]')!;
/** Waits for the garden to be on screen: its image loaded and decoded, and faded fully in. */
const arrived = async (root: HTMLElement) => {
  await waitFor(() => expect(gardenOf(root)).not.toBeNull(), { timeout: 8000 });
  const scene = root.querySelector('[data-garden]')!;
  await waitFor(() => expect(getComputedStyle(scene).opacity).toBe('1'), { timeout: 5000 });
};

/** A scene whose image never loads: the fallback is today's dark win screen. */
const brokenScene = {
  ...gardenScene,
  wide: { avif: '/missing-garden.avif', webp: '/missing-garden.webp' },
  tall: { avif: '/missing-garden.avif', webp: '/missing-garden.webp' },
};

/**
 * The garden. A win opens into it: the card sits on warm paper over the water, off centre and
 * clear of the portal, with the scene around it. The portal is a button even now (the scene is the
 * same throughout), but focus starts on "Dive again".
 */
export const WonGarden: Story = {
  args: { store: store(), preview: wonClean },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await arrived(canvasElement);
    await expect(cardOf(canvasElement)).toHaveAttribute('data-dive-card', 'garden');
    await expect(canvas.getByRole('heading', { name: diveCopy.won })).toBeVisible();
    await expect(canvas.getByText(diveCopy.clean)).toBeVisible();
    await expect(canvas.getByText(diveCopy.note)).toBeVisible();
    await expect(canvas.getByRole('link', { name: diveCopy.linkedin })).toBeVisible();
    await expect(canvas.getByRole('link', { name: diveCopy.email })).toBeVisible();
    await expect(canvas.getByRole('button', { name: diveCopy.buttons.sit })).toBeVisible();
    await expect(canvas.getByRole('button', { name: diveCopy.buttons.back })).toBeVisible();
    await expect(canvas.getByRole('img', { name: diveCopy.garden.alt })).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Dive again' })).toHaveFocus());

    // The card keeps clear of the ring.
    const card = cardOf(canvasElement)!.getBoundingClientRect();
    const ring = portalOf(canvasElement).getBoundingClientRect();
    await expect(card.left).toBeGreaterThan(ring.right);
    // The portal button is there and named, at least a touch target.
    const portal = canvas.getByRole('button', { name: diveCopy.garden.portal });
    await expect(portal.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await expect(portal.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    // The top bar sits on paper over the image; its buttons stay 44px.
    const exit = canvas.getByRole('button', { name: 'Exit' });
    await expect(exit.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

/** On a phone: the card is a sheet at the bottom; the scene and the portal are in view above. */
export const WonGardenPhone: Story = {
  args: { store: store(), preview: wonClean },
  globals: phone,
  play: async ({ canvasElement }) => {
    await arrived(canvasElement);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const card = cardOf(canvasElement)!.getBoundingClientRect();
    const portal = portalOf(canvasElement).getBoundingClientRect();
    await expect(card.left).toBe(0);
    await expect(Math.round(card.right)).toBe(window.innerWidth);
    await expect(Math.round(card.bottom)).toBe(window.innerHeight);
    // The portal: on screen, above the sheet, and a touch target.
    await expect(portal.left).toBeGreaterThanOrEqual(0);
    await expect(portal.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(portal.bottom).toBeLessThan(card.top);
    await expect(portal.width).toBeGreaterThanOrEqual(44);
  },
};

/** Reduced motion: the garden comes in with a plain cross-fade; no bloom. */
export const WonGardenReduced: Story = {
  args: { store: store(), preview: wonClean, previewArrival: true },
  globals: { ...desktop, motion: 'reduce' },
  play: async ({ canvasElement }) => {
    await arrived(canvasElement);
    const frame = canvasElement.querySelector('[data-garden]')!;
    await expect(frame.getAnimations({ subtree: true })).toHaveLength(0);
    await waitFor(() =>
      expect(within(canvasElement).getByRole('button', { name: 'Dive again' })).toHaveFocus(),
    );
  },
};

/**
 * The arrival, as a run that ends with the garden ready: the tunnel's glow blooms to warm white
 * and the garden resolves out of the light; the card follows.
 */
export const Arrival: Story = {
  args: { store: store(), preview: wonClean, previewArrival: true },
  globals: desktop,
  play: async ({ canvasElement }) => {
    await arrived(canvasElement);
    await expect(canvasElement.querySelector('[data-garden]')).toHaveAttribute(
      'data-arrival',
      'bloom',
    );
    await waitFor(() =>
      expect(within(canvasElement).getByRole('button', { name: 'Dive again' })).toHaveFocus(),
    );
    // Let the arrival finish before the accessibility check reads the card.
    await waitFor(() => expect(getComputedStyle(cardOf(canvasElement)!).opacity).toBe('1'), {
      timeout: 5000,
    });
  },
};

const sitExit = fn();
/**
 * "Sit for a while": the card goes and the reader is left in the garden. A hint says how to leave
 * (and is read out); Tab reaches the portal, which is named and leaves the game.
 */
export const SitForAWhile: Story = {
  args: { store: store(), preview: wonClean, onExit: sitExit },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await arrived(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: diveCopy.buttons.sit }));
    await expect(cardOf(canvasElement)).toBeNull();
    await expect(gardenOf(canvasElement)).toHaveAttribute('data-dive-garden', 'resting');
    // The hint: seen for a few seconds, and announced.
    await expect(statusOf(canvasElement)).toHaveAttribute('role', 'status');
    await expect(statusOf(canvasElement)).toHaveTextContent(diveCopy.garden.hint);
    await expect(canvasElement.querySelector('[data-dive-rest-hint]')).toHaveAttribute(
      'data-visible',
    );
    // Focus is in the scene; Tab reaches the portal, Shift+Tab goes back to Exit, then Sound.
    await userEvent.tab();
    const portal = canvas.getByRole('button', { name: diveCopy.garden.portal });
    await expect(portal).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(canvas.getByRole('button', { name: 'Exit' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(canvas.getByRole('button', { name: diveCopy.sound.label })).toHaveFocus();
    await userEvent.click(portal);
    await expect(sitExit).toHaveBeenCalledTimes(1);
  },
};

/** On a touch screen the hint has no Escape in it. */
export const SitForAWhilePhone: Story = {
  args: { store: store(), preview: wonClean },
  globals: phone,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await arrived(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: diveCopy.buttons.sit }));
    const expected = window.matchMedia('(pointer: coarse)').matches
      ? diveCopy.garden.hintTouch
      : diveCopy.garden.hint;
    await expect(statusOf(canvasElement)).toHaveTextContent(expected);
    const portal = portalOf(canvasElement).getBoundingClientRect();
    await expect(portal.width).toBeGreaterThanOrEqual(44);
    await expect(portal.height).toBeGreaterThanOrEqual(44);
  },
};

/**
 * Resting, the top bar goes very quiet after a few seconds without activity, and comes back on
 * any movement or key (and never hides from focus).
 */
export const RestingQuietBar: Story = {
  args: { store: store(), preview: wonClean },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await arrived(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: diveCopy.buttons.sit }));
    const bar = canvasElement.querySelector('[data-dive-bar]')!;
    await waitFor(() => expect(bar).toHaveAttribute('data-quiet'), { timeout: 6000 });
    await userEvent.keyboard('{Shift}');
    await expect(bar).not.toHaveAttribute('data-quiet');
  },
};

/** The portal comes alive on hover and on keyboard focus: the spiral speeds up and brightens. */
export const PortalHoverAndFocus: Story = {
  args: { store: store(), preview: wonClean },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await arrived(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: diveCopy.buttons.sit }));
    const portal = portalOf(canvasElement);
    const spiral = () => portal.querySelector('svg')!;
    await expect(portal).not.toHaveAttribute('data-active');
    await expect(spiral()).toHaveAttribute('data-speed', 'rest');
    await userEvent.hover(portal);
    await expect(portal).toHaveAttribute('data-active');
    await expect(spiral()).toHaveAttribute('data-speed', 'active');
    await expect(getComputedStyle(portal).cursor).toBe('pointer');
    await userEvent.unhover(portal);
    await expect(portal).not.toHaveAttribute('data-active');
    await userEvent.tab();
    await expect(portal).toHaveFocus();
    await expect(portal).toHaveAttribute('data-active');
  },
};

/** "Dive again" from the garden: back to the dark tunnel, and a new run starts. */
export const DiveAgainFromGarden: Story = {
  args: { store: store(), preview: wonClean },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await arrived(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dive again' }));
    await expect(gardenOf(canvasElement)).toBeNull();
    await expect(canvasElement.querySelector('[data-garden]')).not.toHaveAttribute('data-shown');
    await waitFor(() => expect(portalOf(canvasElement)).not.toBeVisible());
    const bar = await canvas.findByRole('progressbar');
    await waitFor(() => expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0), {
      timeout: 5000,
    });
  },
};

let releaseScene: () => void = () => {};
/**
 * A win before the garden's image is ready: the card shows over the tunnel as before, and the
 * scene comes in (a cross-fade) when the image does, without moving focus.
 */
export const WonBeforeScene: Story = {
  args: {
    store: store(),
    preview: won,
    get sceneHold() {
      return new Promise<void>((resolve) => (releaseScene = resolve));
    },
  },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(cardOf(canvasElement)).toHaveAttribute('data-dive-card', 'tunnel');
    await expect(canvas.queryByRole('button', { name: diveCopy.buttons.sit })).toBeNull();
    const again = canvas.getByRole('button', { name: 'Dive again' });
    await waitFor(() => expect(again).toHaveFocus());
    releaseScene();
    await arrived(canvasElement);
    await expect(cardOf(canvasElement)).toHaveAttribute('data-dive-card', 'garden');
    await expect(canvasElement.querySelector('[data-garden]')).toHaveAttribute(
      'data-arrival',
      'fade',
    );
    await expect(again).toHaveFocus();
  },
};

const failExit = fn();
/** The image fails: today's dark win screen, complete and working; no garden, no "Sit". */
export const SceneFails: Story = {
  args: { store: store(), preview: wonClean, scene: brokenScene, onExit: failExit },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelector('[data-garden]')).toBeNull(), {
      timeout: 5000,
    });
    await expect(cardOf(canvasElement)).toHaveAttribute('data-dive-card', 'tunnel');
    await expect(canvas.getByText(diveCopy.note)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: diveCopy.buttons.sit })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: diveCopy.buttons.back }));
    await expect(failExit).toHaveBeenCalledTimes(1);
  },
};

/** A crash stays in the dark tunnel: only people who make it through see the garden. */
export const CrashedStaysInTunnel: Story = {
  args: { store: store(), preview: crashed },
  globals: desktop,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(cardOf(canvasElement)).toHaveAttribute('data-dive-card', 'tunnel'));
    // Give the image time to load: it still never shows.
    await new Promise((r) => setTimeout(r, 800));
    await expect(gardenOf(canvasElement)).toBeNull();
    await expect(cardOf(canvasElement)).toHaveAttribute('data-dive-card', 'tunnel');
  },
};

/** The garden is not asked for before Start: the start screen has no scene at all. */
export const SceneAfterStart: Story = {
  args: { store: store() },
  globals: desktop,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-garden]')).toBeNull();
    await userEvent.click(await within(canvasElement).findByRole('button', { name: 'Start' }));
    await expect(canvasElement.querySelector('[data-garden] img')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-garden]')).not.toHaveAttribute('data-shown');
  },
};

/**
 * Sitting down, the scene holds still: no pan, no drift. Nothing in the scene animates except the
 * portal's own spiral, and the image stays exactly where it is.
 */
export const SittingStill: Story = {
  args: { store: store(), preview: wonClean },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await arrived(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: diveCopy.buttons.sit }));
    const scene = canvasElement.querySelector<HTMLElement>('[data-garden]')!;
    const portal = portalOf(canvasElement);
    const moving = () =>
      scene
        .getAnimations({ subtree: true })
        .filter((a) => a.playState === 'running')
        .filter((a) => {
          const target = (a.effect as KeyframeEffect | null)?.target;
          return !(target instanceof Element && portal.contains(target));
        });
    await expect(moving()).toHaveLength(0);
    const image = canvas.getByRole('img', { name: diveCopy.garden.alt });
    const before = image.getBoundingClientRect();
    await new Promise((r) => setTimeout(r, 1500));
    const after = image.getBoundingClientRect();
    await expect(after.left).toBe(before.left);
    await expect(after.top).toBe(before.top);
    // The portal button is still topmost at the ring's centre.
    const box = portal.getBoundingClientRect();
    await expect(
      document
        .elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
        ?.closest('[data-garden-portal]'),
    ).toBe(portal);
  },
};
