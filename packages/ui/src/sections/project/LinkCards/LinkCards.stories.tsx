import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { LinkCards } from './LinkCards';

const meta = {
  title: 'Sections/Project/LinkCards',
  component: LinkCards,
  // Copy from the PAS board.
  args: {
    label: 'The projects inside PAS',
    cards: [
      {
        name: 'Atti',
        status: 'Daily use',
        tone: 'live',
        line: 'The assistant I text. It remembers, keeps my commitments and runs my day.',
        href: '/projects/pas/atti',
      },
      {
        name: 'Lifebox',
        status: 'Experiment',
        tone: 'private',
        line: 'One interface per person. Planned as Atti’s phone app.',
        href: '/projects/pas/lifebox',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-[760px] pt-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LinkCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'The projects inside PAS' });
    const links = within(list).getAllByRole('link');
    await expect(links).toHaveLength(2);
    await expect(links[0]).toHaveAttribute('href', '/projects/pas/atti');
    await expect(links[0]).toHaveTextContent('Daily use');
    for (const link of links)
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

/** No cards: it renders nothing. */
export const Empty: Story = {
  args: { cards: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('ul')).toBeNull();
  },
};

export const Phone: Story = { ...Default, globals: { viewport: { value: 'phone' } } };

/** Reduced motion: the card does not lift over time. */
export const Reduced: Story = {
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getAllByRole('link')[0]!;
    await expect(getComputedStyle(link).transitionDuration).toBe('0s');
  },
};
