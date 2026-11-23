import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { palette } from '@cwc/tokens';

import { Picture } from './Picture';

const drawing = (stroke: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="${palette.raised}"/><ellipse cx="160" cy="100" rx="110" ry="64" fill="none" stroke="${stroke}" stroke-width="2"/></svg>`,
  )}`;

const fallback = drawing(palette.tick);
const modern = drawing(palette.hinoki);

const meta = {
  title: 'Primitives/Picture',
  component: Picture,
  args: {
    children: (
      <img
        src={fallback}
        width={320}
        height={200}
        alt=""
        className="block h-auto w-80 max-w-full"
      />
    ),
  },
} satisfies Meta<typeof Picture>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No sources: the image alone, with no `<picture>` around it. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('picture')).toBeNull();
    await expect(canvasElement.querySelector('img')).toHaveAttribute('src', fallback);
  },
};

/**
 * With a source the browser can show, it is used (the Hinoki ring) and the image keeps its size:
 * the `<picture>` has no box of its own.
 */
export const WithSources: Story = {
  args: { sources: [{ src: modern, type: 'image/svg+xml' }] },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('img')!;
    await expect(canvasElement.querySelector('picture > source')).toHaveAttribute('srcset', modern);
    await expect(getComputedStyle(canvasElement.querySelector('picture')!).display).toBe(
      'contents',
    );
    await expect(img.getBoundingClientRect().width).toBe(320);
  },
};

/** A format the browser cannot show is skipped and the image's own file is used. */
export const UnknownFormat: Story = {
  args: { sources: [{ src: modern, type: 'image/x-not-a-format' }] },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('img')!;
    if (!img.complete) await new Promise((done) => img.addEventListener('load', done));
    await expect(img.currentSrc).toBe(fallback);
  },
};
