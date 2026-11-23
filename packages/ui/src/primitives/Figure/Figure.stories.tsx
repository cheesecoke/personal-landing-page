import type { Meta, StoryObj } from '@storybook/react-vite';

import { Figure } from './Figure';

// A stand-in for project imagery: a plate on the same near-black studio ground.
const plate = (width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="none"/><rect x="${width * 0.3}" y="${height * 0.08}" width="${width * 0.4}" height="${height * 0.84}" rx="28" fill="none" stroke="gray" stroke-opacity=".5" stroke-width="2"/><rect x="${width * 0.34}" y="${height * 0.2}" width="${width * 0.32}" height="${height * 0.12}" rx="8" fill="gray" fill-opacity=".18"/><rect x="${width * 0.34}" y="${height * 0.36}" width="${width * 0.32}" height="${height * 0.12}" rx="8" fill="gray" fill-opacity=".12"/></svg>`,
  )}`;

const meta = {
  title: 'Primitives/Figure',
  component: Figure,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="p-gutter">
        <Story />
      </div>
    ),
  ],
  args: {
    caption: 'Design mock · three screens',
    children: (
      <img
        src={plate(1600, 1000)}
        width={1600}
        height={1000}
        alt="Placeholder plate: the outline of a phone with two cards."
      />
    ),
  },
} satisfies Meta<typeof Figure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoCaption: Story = { args: { caption: undefined } };

/** Caption on the right, as beside a wide hero image. */
export const CaptionEnd: Story = { args: { captionClassName: 'text-right' } };

/** Two figures in a strip; each keeps its image whole. */
export const Pair: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <Figure caption="The queue · who has voted">
        <img
          src={plate(1200, 800)}
          width={1200}
          height={800}
          alt="Placeholder plate: the outline of a phone with two cards."
        />
      </Figure>
      <Figure caption="Poll rounds · narrowing to two">
        <img
          src={plate(1200, 800)}
          width={1200}
          height={800}
          alt="Placeholder plate: the outline of a phone with two cards."
        />
      </Figure>
    </div>
  ),
};
