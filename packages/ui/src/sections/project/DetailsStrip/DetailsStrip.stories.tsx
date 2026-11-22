import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container } from '../../../layout';
import { placeholder } from '../internal/storyMedia';
import { DetailsStrip } from './DetailsStrip';

const crop = { top: 72, bottom: 712 };
const image = (alt: string) => ({
  src: `${placeholder(1200, 800, { subject: [72, 712] })}#${alt.length}`,
  width: 1200,
  height: 800,
  alt,
});

const meta = {
  title: 'Sections/Project/DetailsStrip',
  component: DetailsStrip,
  parameters: { layout: 'fullscreen' },
  // Alt text and captions from the Duo Decide board; the images are placeholders.
  args: {
    label: 'Details',
    figures: [
      {
        image: image(
          'Crop of the Duo Decide design mock: the queue header and a round-1 poll card showing who has voted.',
        ),
        caption: 'The queue · who has voted',
        crop,
      },
      {
        image: image(
          'Crop of the poll rounds in the design mock: round 2 narrows to two options, and in round 3 the person who started it sits out.',
        ),
        caption: 'Poll rounds · narrowing to two',
        crop,
      },
    ],
  },
  decorators: [
    (Story) => (
      <Container width="project" className="pb-16">
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof DetailsStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two closer looks, side by side. */
export const Pair: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Details' })).toBeVisible();
    await expect(canvas.getAllByRole('img')).toHaveLength(2);
    await expect(canvasElement.querySelectorAll('figcaption')).toHaveLength(2);
  },
};

/** One figure, capped at 820px (from the PAS board). */
export const Single: Story = {
  args: {
    narrow: true,
    figures: [
      {
        image: {
          src: placeholder(1200, 800, { kind: 'capture' }),
          width: 1200,
          height: 800,
          alt: 'Atti’s task lifecycle as a state diagram: how a job moves from queued to done, and what happens when it stalls or expires.',
        },
        caption:
          'Atti as software: how a job moves from queued to done, and what happens when it stalls',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-strip]')).toBeNull();
    await expect(
      canvasElement.querySelector('figure')!.getBoundingClientRect().width,
    ).toBeLessThanOrEqual(820);
  },
};

/** Nothing to show: it renders nothing. */
export const Empty: Story = {
  args: { figures: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
  },
};

/** On a phone the pair becomes a strip you swipe; the page itself never scrolls sideways. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    const strip = canvasElement.querySelector<HTMLElement>('[data-strip]')!;
    await expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth);
    await expect(strip).toHaveAttribute('tabindex', '0');
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
