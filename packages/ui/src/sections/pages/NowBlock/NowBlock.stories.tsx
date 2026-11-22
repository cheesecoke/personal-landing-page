import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StoryPage } from '../internal/StoryPage';
import { NowBlock } from './NowBlock';

const text =
  'studying what makes messaging assistants reliable, for Atti. Polishing Duo Decide on iOS. Rebuilding this site.';

/** The About "Now" line. The month comes from the data and always shows. */
const meta = {
  title: 'Sections/Pages/NowBlock',
  component: NowBlock,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Now', now: { month: '2026-11', text } },
  decorators: [
    (Story) => (
      <StoryPage>
        <div className="pt-16">
          <Story />
        </div>
      </StoryPage>
    ),
  ],
} satisfies Meta<typeof NowBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Written this month. */
export const Growing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Now' })).toBeInTheDocument();
    await expect(canvasElement.querySelector('time')).toHaveAttribute('datetime', '2026-11');
    await expect(canvasElement).toHaveTextContent(`November 2026: ${text}`);
    await expect(canvasElement.querySelectorAll('[data-thread-node]').length).toBe(1);
  },
};

/** Nothing newer was published: the last line stays, under the month it was written. */
export const NoUpdate: Story = {
  args: { now: { month: '2026-08', text } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent(`August 2026: ${text}`);
  },
};

/** No line at all: no section, no title, no node. */
export const Empty: Story = {
  args: { now: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
    await expect(canvasElement.querySelector('h2')).toBeNull();
    await expect(canvasElement.querySelectorAll('[data-thread-node]').length).toBe(0);
  },
};

export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
