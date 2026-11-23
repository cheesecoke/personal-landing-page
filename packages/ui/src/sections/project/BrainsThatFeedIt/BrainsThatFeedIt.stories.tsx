import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { BrainsThatFeedIt } from './BrainsThatFeedIt';

const meta = {
  title: 'Sections/Project/BrainsThatFeedIt',
  component: BrainsThatFeedIt,
  parameters: { layout: 'fullscreen' },
  // Copy from the Personal brain board.
  args: {
    title: 'Brains that feed it',
    items: [
      {
        id: 'business-brain',
        name: 'Business brain',
        line: 'A research pipeline that scores ideas with cited evidence.',
      },
      {
        id: 'finance-brain',
        name: 'Finance brain',
        line: 'The first brain with a vault. Connecting to Plaid turned out to be too much, so a different approach is in progress.',
      },
    ],
    diagram: {
      label: 'The business brain and the finance brain both feed into the personal brain.',
      center: 'Personal brain',
    },
  },
  decorators: [
    (Story) => (
      <ThreadScope hash={false}>
        <Container width="project" className="pb-16">
          <ThreadColumn placement="gutter">
            <div className="relative">
              <Thread placement="gutter" bottom={0} />
              <Story />
            </div>
          </ThreadColumn>
        </Container>
      </ThreadScope>
    ),
  ],
} satisfies Meta<typeof BrainsThatFeedIt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Brains that feed it' })).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    // Each brain is an anchor other pages link to.
    await expect(canvasElement.querySelector('#business-brain')).not.toBeNull();
    await expect(canvasElement.querySelector('#finance-brain')).not.toBeNull();
    await expect(
      canvas.getByRole('img', {
        name: 'The business brain and the finance brain both feed into the personal brain.',
      }),
    ).toBeVisible();
    await expect(canvasElement.querySelectorAll('svg line')).toHaveLength(2);
  },
};

/** One feeder: its ring sits level with the large one. */
export const Single: Story = {
  args: {
    items: [
      {
        id: 'business-brain',
        name: 'Business brain',
        line: 'A research pipeline that scores ideas with cited evidence.',
      },
    ],
    diagram: {
      label: 'The business brain feeds into the personal brain.',
      center: 'Personal brain',
    },
  },
};

/** No feeders: it renders nothing. */
export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
  },
};

export const Phone: Story = { ...Default, globals: { viewport: { value: 'phone' } } };
