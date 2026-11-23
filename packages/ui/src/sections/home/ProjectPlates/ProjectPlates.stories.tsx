import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { plateAlts, platesCopy, projectPlates } from '../internal/homeCopy';
import { HomeStory } from '../internal/HomeStory';
import { plateArt } from '../internal/storyArt';
import { ProjectPlates, type ProjectPlate } from './ProjectPlates';

const art = {
  pas: plateArt('signal'),
  'duo-decide': plateArt('ember'),
  'ai-system': plateArt('ash'),
};
const plates: ProjectPlate[] = projectPlates.map((plate) => {
  const key = plate.key as keyof typeof art;
  return { ...plate, image: { ...art[key], alt: plateAlts[key] } };
});

const meta = {
  title: 'Sections/Home/ProjectPlates',
  component: ProjectPlates,
  parameters: { layout: 'fullscreen' },
  args: { ...platesCopy, plates },
  decorators: [
    (Story) => (
      <HomeStory>
        <Story />
      </HomeStory>
    ),
  ],
} satisfies Meta<typeof ProjectPlates>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The board's row: PAS wide, Duo Decide narrow and tall, the AI system beside it. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole('region', { name: 'On my own time' });
    await expect(within(section).getByRole('link', { name: 'All projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
    const tiles = within(section).getAllByRole('listitem');
    await expect(tiles).toHaveLength(3);
    await expect(within(tiles[1]!).getByRole('link')).toHaveAttribute(
      'href',
      '/projects/duo-decide',
    );
    await expect(within(tiles[1]!).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Duo Decide',
    );
    // Status is a word beside the dot, never the dot alone.
    await expect(tiles[1]!).toHaveTextContent('In build');
  },
};

/** A plate whose project changed lately carries the new mark beside its status. */
export const WithNewMark: Story = {
  args: {
    plates: plates.map((plate) =>
      plate.key === 'duo-decide' ? { ...plate, fresh: { ageDays: 3, lifeDays: 14 } } : plate,
    ),
  },
};

/** Two plates share the row by their weights. */
export const TwoPlates: Story = { args: { plates: plates.slice(0, 2) } };

/** No intro line and no link in the header. */
export const HeaderOnly: Story = { args: { intro: undefined, allLink: undefined } };

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** 390 wide: one column, each plate in its phone crop. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };

/** Reduced motion: the tiles do not rise on hover; the colours still change. */
export const Reduced: Story = { globals: { motion: 'reduce' } };
