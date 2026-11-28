import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { angleDelta } from '../angle';
import { createRun, type DiveState, startRun, step } from '../run';
import { DiveGame, type DiveGameHandle } from './DiveGame';
import type { DiveResult } from './result';

const meta = {
  title: 'Sections/DiveGame',
  component: DiveGame,
  parameters: { layout: 'fullscreen' },
  args: { onEnd: fn() },
  // The live handle on `window.__dive`, so play-testing scripts can read the run.
  render: (args) => (
    <DiveGame
      {...args}
      ref={(handle) => {
        (window as { __dive?: DiveGameHandle | null }).__dive = handle;
      }}
    />
  ),
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiveGame>;

export default meta;
type Story = StoryObj<typeof meta>;

const desktop = { viewport: { value: 'desktop', isRotated: false } };
const phone = { viewport: { value: 'phone', isRotated: false } };

/** A run in play, steered toward the next gap, stopped at `ms` and frozen there. */
function frozenAt(seed: number, ms: number, calm = false): DiveState {
  let state = startRun(createRun({ seed, calm }));
  for (let t = 0; t < ms && state.status === 'running'; t += 1000 / 60) {
    const next = state.course[state.nextRing];
    const steer = next ? Math.max(-1, Math.min(1, 3 * angleDelta(next.gapCentre, state.angle))) : 0;
    state = step(state, { steer }, 1000 / 60);
  }
  return state;
}

/**
 * Playable. Arrow keys or A/D; on touch, hold a side. A fresh course every time the story loads.
 */
export const Default: Story = {
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = await canvas.findByRole('progressbar', { name: 'Progress' });
    await userEvent.keyboard('{ArrowLeft>}');
    await waitFor(() => expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0), {
      timeout: 5000,
    });
    await userEvent.keyboard('{/ArrowLeft}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Lives');
  },
};

/** Calm mode (the default under reduced motion): slower, wider gaps, no shake, no streaks. */
export const Calm: Story = { args: { calm: true }, globals: desktop };

/** Phone width: hold the left or right half of the screen to steer. */
export const Phone: Story = { globals: phone };

/**
 * A fixed seed stopped 20 seconds in, for visual checks: nothing moves, so it looks the same
 * every time.
 */
export const FrozenFrame: Story = {
  args: { initialState: frozenAt(7, 20_000), paused: true },
  globals: desktop,
};

export const FrozenFramePhone: Story = {
  args: { initialState: frozenAt(7, 20_000), paused: true },
  globals: phone,
};

export const FrozenFrameCalm: Story = {
  args: { initialState: frozenAt(7, 20_000, true), paused: true, calm: true },
  globals: desktop,
};

/** Waiting to start, as the page will hold it behind its own start screen. */
export const NotStarted: Story = {
  args: { autoStart: false, seed: 7 },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const bar = await within(canvasElement).findByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', '0');
  },
};

/** The imperative handle: start, pause and restart from outside, as the wrapping page will. */
function Controlled() {
  const game = useRef<DiveGameHandle>(null);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<DiveResult | null>(null);
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, padding: 8, color: 'var(--text-secondary)' }}>
        <button type="button" onClick={() => game.current?.start()}>
          Start
        </button>
        <button type="button" onClick={() => setPaused((p) => !p)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            game.current?.restart();
          }}
        >
          Restart
        </button>
        <output>{result ? JSON.stringify(result) : ''}</output>
      </div>
      <DiveGame ref={game} autoStart={false} paused={paused} onEnd={setResult} />
    </div>
  );
}

export const WithControls: Story = {
  globals: desktop,
  render: () => <Controlled />,
};
