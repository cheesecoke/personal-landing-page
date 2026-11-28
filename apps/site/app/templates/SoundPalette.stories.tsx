import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { createCueBus, type CueBus, type CueName, NODE_NOTES } from '../sound/cues';

/** A bus that records what is asked of it and makes no sound: what test runs use. */
const recorder = () => ({ play: fn(), hum: fn(), dispose: fn() }) satisfies CueBus;

const CUES: { name: CueName; label: string; note?: number }[] = [
  { name: 'tick', label: 'Hover or focus: tick' },
  { name: 'press', label: 'Press: click' },
  { name: 'soft', label: 'Soft press (the tree list)' },
  ...NODE_NOTES.map((_, note) => ({ name: 'node' as const, label: `Tree node ${note + 1}`, note })),
  { name: 'page', label: 'Page change: whoosh' },
  { name: 'on', label: 'Sound turned on' },
];

interface PaletteProps {
  /** Where the cues go. Left out, a real audio context is made on the first press. */
  bus?: CueBus;
}

/**
 * Every interaction sound, one button each. With no `bus`, a press makes a real audio context
 * (inside the press) and plays the cue, so the owner can listen; test runs pass a recorder.
 */
function Palette({ bus: given }: PaletteProps) {
  const real = useRef<{ ctx: AudioContext; bus: CueBus } | null>(null);
  const [humming, setHumming] = useState(false);
  const bus = () => {
    if (given) return given;
    if (!real.current) {
      const ctx = new AudioContext();
      real.current = { ctx, bus: createCueBus(ctx) };
    }
    void real.current.ctx.resume();
    return real.current.bus;
  };
  useEffect(
    () => () => {
      real.current?.bus.dispose();
      void real.current?.ctx.close();
    },
    [],
  );
  const button =
    'min-h-touch cursor-pointer rounded-button border border-hairline bg-transparent px-4 type-nav text-primary hover:border-signal';
  return (
    <div className="flex max-w-page flex-wrap gap-3 p-6" data-ui-sound="none">
      {CUES.map((cue) => (
        <button
          key={cue.label}
          type="button"
          className={button}
          data-cue={cue.name}
          // The cue bus's `play`, not a story's play function.
          // eslint-disable-next-line storybook/context-in-play-function
          onClick={() => bus().play(cue.name, cue.note)}
        >
          {cue.label}
        </button>
      ))}
      <button
        type="button"
        className={button}
        aria-pressed={humming}
        data-cue="hum"
        onClick={() => {
          bus().hum(!humming);
          setHumming(!humming);
        }}
      >
        The portal hum (press again to let it go)
      </button>
    </div>
  );
}

const meta = {
  title: 'Sound/Palette',
  component: Palette,
} satisfies Meta<typeof Palette>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Listen here: each press plays the cue for real, at its real level, on its own (on the site it
 * sits over the ambient bed, which is louder). Nothing plays until you press.
 */
export const Audition: Story = {};

const requests = recorder();
/** What the test run checks: each button asks for its cue (a recorder, never real sound). */
export const Requests: Story = {
  args: { bus: requests },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Hover or focus: tick' }));
    await expect(requests.play).toHaveBeenLastCalledWith('tick', undefined);
    await userEvent.click(canvas.getByRole('button', { name: 'Tree node 3' }));
    await expect(requests.play).toHaveBeenLastCalledWith('node', 2);
    await userEvent.click(canvas.getByRole('button', { name: 'Sound turned on' }));
    await expect(requests.play).toHaveBeenLastCalledWith('on', undefined);
    const hum = canvas.getByRole('button', { name: /portal hum/ });
    await userEvent.click(hum);
    await expect(requests.hum).toHaveBeenLastCalledWith(true);
    await expect(hum).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(hum);
    await expect(requests.hum).toHaveBeenLastCalledWith(false);
  },
};
