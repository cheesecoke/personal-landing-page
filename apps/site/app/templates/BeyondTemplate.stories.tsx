import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { BeyondContent } from '@cwc/content/hand';
import { palette } from '@cwc/tokens';

import beyond from '../../content/hand/beyond.json';
import { BeyondTemplate } from './BeyondTemplate';

/** A stand-in for the stump image (Storybook does not serve the site's media): rings at an angle. */
const stump = () => {
  const rings = [60, 130, 200, 270, 340, 410]
    .map(
      (rx) =>
        `<ellipse cx="950" cy="500" rx="${rx}" ry="${rx * 0.42}" fill="none" stroke="${palette.tick}" stroke-width="2"/>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 900"><ellipse cx="950" cy="500" rx="450" ry="190" fill="${palette.raised}"/>${rings}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const content = BeyondContent.parse(beyond);

/** The Beyond page, fed by the site's own hand content. Only the image is a stand-in. */
const meta = {
  title: 'Templates/Beyond',
  component: BeyondTemplate,
  parameters: { layout: 'fullscreen' },
  args: {
    content: {
      ...content,
      scene: {
        ...content.scene,
        image: { ...content.scene.image, src: stump(), width: 1500, height: 900 },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="overflow-x-clip">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BeyondTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Beyond shows no live data, so this is the whole page. */
export const NoLiveData: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 }).length).toBe(1);
    const scene = canvas.getByRole('region', { name: content.scene.label });
    await expect(within(scene).getAllByRole('listitem').length).toBe(content.scene.slots.length);
    // The anchor the Projects index links to.
    await expect(canvasElement.querySelector('#one-rep')).not.toBeNull();
    // The header sits above the art that slides up under it.
    const header = canvasElement.querySelector('header')!.getBoundingClientRect();
    await expect(scene.getBoundingClientRect().top).toBeLessThan(header.bottom);
    await expect(canvas.getByRole('navigation', { name: content.next.label })).toBeInTheDocument();
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Under 1180px the art is a band and the slots are a list under it. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** Reduced motion: every point is lit and still, and the thread has no travelling light. */
export const Reduced: Story = { globals: { motion: 'reduce' } };
