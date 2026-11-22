import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { atWorkCopy } from '../internal/homeCopy';
import { HomeStory } from '../internal/HomeStory';
import { AtWorkPipeline } from './AtWorkPipeline';

const meta = {
  title: 'Sections/Home/AtWorkPipeline',
  component: AtWorkPipeline,
  parameters: { layout: 'fullscreen' },
  args: atWorkCopy,
  decorators: [
    (Story) => (
      <HomeStory>
        <Story />
      </HomeStory>
    ),
  ],
} satisfies Meta<typeof AtWorkPipeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Side by side: the copy on the left, the pipeline running left to right. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole('region', { name: 'The AI orchestrator I built' });
    await expect(
      within(section).getByRole('link', { name: 'The work at Titan Intake' }),
    ).toHaveAttribute('href', '/work/titan-intake');
    // One diagram shows at a time; both carry the same sentence.
    const diagrams = canvasElement.querySelectorAll(`[role="img"]`);
    await expect(diagrams).toHaveLength(2);
    for (const diagram of diagrams) {
      await expect(diagram).toHaveAttribute('aria-label', atWorkCopy.flowLabel);
    }
    const shown = [...diagrams].filter((el) => getComputedStyle(el).display !== 'none');
    await expect(shown).toHaveLength(1);
  },
};

/** The steps are data: three steps space themselves along the same line. */
export const ThreeSteps: Story = {
  args: {
    steps: ['Plan', 'Build', 'Review'],
    flowLabel: 'Flow: plan, build, review.',
  },
};

/** No link under the sentence. */
export const NoLink: Story = { args: { link: undefined } };

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** 390 wide: stacked, with the pipeline as a vertical rail. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };

export const Reduced: Story = { globals: { motion: 'reduce' } };
