import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RingArcs } from '../../../primitives';
import { mapCopy } from '../internal/homeCopy';
import { HomeStory } from '../internal/HomeStory';
import { ProjectMapTeaser } from './ProjectMapTeaser';

/** Stands in for the canopy teaser, at the heights the board gives it (460, and 360 on a phone). */
const MapSlot = () => (
  <div className="flex h-[360px] items-center justify-center rounded-panel border border-dashed border-hairline md:h-[460px]">
    <RingArcs />
  </div>
);

const meta = {
  title: 'Sections/Home/ProjectMapTeaser',
  component: ProjectMapTeaser,
  parameters: { layout: 'fullscreen' },
  args: { ...mapCopy, children: <MapSlot /> },
  decorators: [
    (Story) => (
      <HomeStory>
        <Story />
      </HomeStory>
    ),
  ],
} satisfies Meta<typeof ProjectMapTeaser>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The title beside the map; the whole map is a link to Projects. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole('region', {
      name: 'How my projects connect.',
    });
    await expect(within(section).getByRole('link', { name: 'Open the map' })).toHaveAttribute(
      'href',
      '/projects',
    );
    await expect(
      within(section).getByRole('link', { name: 'Open the project map' }),
    ).toHaveAttribute('href', '/projects');
  },
};

/** A map that handles its own interaction is not wrapped in a link. */
export const MapNotLinked: Story = {
  args: { mapLink: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('link')).toHaveLength(1);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** 390 wide: the map goes under the title. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };

export const Reduced: Story = { globals: { motion: 'reduce' } };
