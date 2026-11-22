import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { plateAlts, projectPlates } from '../internal/homeCopy';
import { plateArt } from '../internal/storyArt';
import { ProjectTile } from './ProjectTile';

const { key: _pasKey, weight: _pasWeight, ...pas } = projectPlates[0]!;
const { key: _duoKey, weight: _duoWeight, ...duo } = projectPlates[1]!;
const { key: _aiKey, weight: _aiWeight, ...ai } = projectPlates[2]!;

const meta = {
  title: 'Sections/Home/ProjectTile',
  component: ProjectTile,
  args: { ...ai, image: { ...plateArt('ash'), alt: plateAlts['ai-system'] } },
  decorators: [
    (Story) => (
      <div className="@container w-[640px] max-w-full">
        <div className="w-[420px] max-w-full">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A project in its first version: the hollow dot. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('href', '/projects/ai-system');
    await expect(link).toHaveTextContent('First version');
    await expect(within(link).getByRole('img')).toHaveAccessibleName(plateAlts['ai-system']);
  },
};

/** The first plate: the name in the H2 style and the lit edge on the frame. */
export const Featured: Story = {
  args: { ...pas, image: { ...plateArt('signal'), alt: plateAlts.pas } },
};

/** The Duo Decide plate: a tall frame cropped in on the phone mock. In build: the Ember dot. */
export const DuoDecide: Story = {
  args: { ...duo, image: { ...plateArt('ember'), alt: plateAlts['duo-decide'] } },
  decorators: [
    (Story) => (
      <div className="w-[256px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

/** With the new mark beside the status word. */
export const WithNewMark: Story = { args: { fresh: { ageDays: 3, lifeDays: 14 } } };

/** Under a 560px slot the plate takes its phone frame. */
export const PhoneFrame: Story = {
  decorators: [
    (Story) => (
      <div className="@container w-[350px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export const Reduced: Story = { globals: { motion: 'reduce' } };
