import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container } from '../../../layout';
import { DetailsStrip } from '../DetailsStrip/DetailsStrip';
import { Ladder } from './Ladder';

const meta = {
  title: 'Sections/Project/Ladder',
  component: Ladder,
  parameters: { layout: 'fullscreen' },
  // Copy from the Lifebox board.
  args: {
    stepsLabel: 'Personal, then popular, then community, then core',
    steps: ['Personal', 'Popular', 'Community', 'Core'],
    text: 'When a personal change keeps winning for several people who opted in, it could become a candidate default, climbing from personal to popular to community to core. An idea, not built.',
  },
  decorators: [
    (Story) => (
      <Container width="project" className="pb-16">
        <DetailsStrip label="Details">
          <Story />
        </DetailsStrip>
      </Container>
    ),
  ],
} satisfies Meta<typeof Ladder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Details' })).toBeVisible();
    const list = canvas.getByRole('list', {
      name: 'Personal, then popular, then community, then core',
    });
    // Read lowest rung first, drawn climbing.
    const items = within(list).getAllByRole('listitem');
    await expect(items.map((item) => item.textContent)).toEqual([
      'Personal',
      'Popular',
      'Community',
      'Core',
    ]);
    await expect(items[0]!.getBoundingClientRect().top).toBeGreaterThan(
      items[3]!.getBoundingClientRect().top,
    );
  },
};

export const Phone: Story = { ...Default, globals: { viewport: { value: 'phone' } } };
