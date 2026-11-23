import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { CanopyHandle } from '../core';
import { Canopy } from './Canopy';

/** The live stage of the story on screen, for play functions. */
let stage: CanopyHandle | null = null;
const stageReady = () =>
  waitFor(
    () => {
      if (!stage) throw new Error('the stage has not mounted yet');
      return stage;
    },
    { timeout: 10000 },
  );

const meta = {
  title: 'Sections/Canopy',
  component: Canopy,
  parameters: { layout: 'fullscreen' },
  args: {
    variant: 'full',
    // Stories start fully grown so they are still when they are looked at or tested.
    intro: 'never',
    onStage: (handle) => {
      stage = handle;
    },
  },
} satisfies Meta<typeof Canopy>;

export default meta;
type Story = StoryObj<typeof meta>;

const desktop = { viewport: { value: 'desktop', isRotated: false } };

/** Projects: the list, the stage and (once a project is picked) its card. */
export const Full: Story = { globals: desktop };

/** Home: the picture only. The page wraps it in a link to the map. */
export const Teaser: Story = {
  args: { variant: 'teaser' },
  globals: desktop,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

/** The grow-in, as a first visit sees it: 5.2 seconds, once per session on the site. */
export const GrowIn: Story = { args: { intro: 'always' }, globals: desktop };

/** A project opened from the list: its family stays lit, its shoots grow out, its card has the link. */
export const ProjectOpen: Story = {
  globals: desktop,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^Duo Decide/ }));
    const card = within(await canvas.findByRole('complementary', { name: 'Selected project' }));
    await expect(card.getByRole('link', { name: /Open project/ })).toHaveAttribute(
      'href',
      '/projects/duo-decide',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('complementary')).toBeNull());
    await userEvent.click(canvas.getByRole('button', { name: /^Duo Decide/ }));
  },
};

/** What pre-rendered HTML shows without JavaScript, and what is shown if the 3D chunk cannot load. */
export const FlatFallback: Story = { args: { flat: true }, globals: desktop };
export const FlatFallbackTeaser: Story = {
  args: { flat: true, variant: 'teaser' },
  globals: desktop,
};

/** No WebGL (or the frame rate could not hold): the stage draws the tree in 2D and still works. */
export const NoWebGL: Story = {
  args: { stage: { forceStatic: true } },
  globals: desktop,
  play: async ({ canvasElement }) => {
    const handle = await stageReady();
    await expect(handle.perf().mode).toBe('static');
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Atti/ }));
    await expect(handle.state().active).toBe('atti');
  },
};

/** Reduced motion: the final state, no draw, even when the grow-in would play. */
export const ReducedMotion: Story = {
  args: { intro: 'always', reducedMotion: true },
  globals: desktop,
  play: async () => {
    const handle = await stageReady();
    await expect(handle.state().intro).toBe(1);
    handle.focus('pas');
    handle.advance(1 / 60);
    await expect(handle.state().grow.pas).toBe(1);
  },
};

/** Leaving the page: the stage stops, its listeners go, and the WebGL context is given back. */
export const Unmount: Story = {
  globals: desktop,
  render: function Unmountable(args) {
    const [shown, setShown] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setShown(false)}>
          Remove the canopy
        </button>
        {shown && <Canopy {...args} />}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const handle = await stageReady();
    const gl = canvasElement.querySelector('canvas')?.getContext('webgl2') ?? null;
    if (handle.perf().mode === 'gl') await expect(gl?.isContextLost()).toBe(false);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove the canopy' }));
    await waitFor(() => expect(stage).toBeNull());
    await expect(canvasElement.querySelector('canvas')).toBeNull();
    await expect(handle.perf().running).toBe(false);
    if (gl) await expect(gl.isContextLost()).toBe(true);
  },
};
