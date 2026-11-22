import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { placeholder } from '../internal/storyMedia';
import { ProjectFigure } from './ProjectFigure';

// Alt text and captions from the Duo Decide and AI system boards; the images are placeholders.
const meta = {
  title: 'Sections/Project/ProjectFigure',
  component: ProjectFigure,
  args: {
    image: {
      src: placeholder(1600, 1000, { subject: [90, 890] }),
      width: 1600,
      height: 1000,
      alt: 'Three screens from the Duo Decide design mock: the decision queue, poll rounds 2 and 3, and the create-decision sheet.',
    },
    caption: 'Design mock · three screens',
  },
  decorators: [
    (Story) => (
      <div className="max-w-[820px] pt-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectFigure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector('img')!;
    await expect(image).toHaveAttribute('width', '1600');
    await expect(image.alt).toMatch(/^Three screens/);
    await expect(canvasElement.querySelector('figcaption')).toHaveTextContent(
      'Design mock · three screens',
    );
  },
};

/** Cropped: the empty ground above and below the subject is pulled out of the layout. */
export const Cropped: Story = {
  args: { crop: { top: 90, bottom: 890 } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img')!.style.marginTop).toBe('-3.75%');
  },
};

/** A screen capture: rounded corners. */
export const Capture: Story = {
  args: {
    image: {
      src: placeholder(1600, 1000, { kind: 'capture' }),
      width: 1600,
      height: 1000,
      alt: 'The pipeline board showing one finished run: evidence, plan, code and pull request stages all passed, with token counts and run metrics. Spend figures are masked.',
    },
    caption:
      'The board, 4 Sep 2026: one run passes evidence, plan, code and pull request. Spend is masked.',
    rounded: true,
  },
};

export const Phone: Story = { ...Cropped, globals: { viewport: { value: 'phone' } } };
