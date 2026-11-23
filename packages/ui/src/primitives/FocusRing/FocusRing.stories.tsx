import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { cx } from '../cx';
import { Heading } from '../Heading/Heading';
import { Text } from '../Text/Text';
import { FocusRing, focusRing, focusRingInset } from './FocusRing';

const meta = {
  title: 'Primitives/FocusRing',
  component: FocusRing,
  decorators: [
    (Story) => (
      <div className="p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FocusRing>;

export default meta;
type Story = StoryObj<typeof meta>;

const tile = (
  <>
    <Heading level={3}>
      <a href="#duo-decide" className="no-underline">
        Duo Decide
      </a>
    </Heading>
    <Text>A decision app for couples.</Text>
  </>
);

/** Tab into the tile: the ring is drawn around the whole group, once. */
export const AroundGroup: Story = {
  render: (args) => (
    <FocusRing {...args} as="div" className="flex max-w-80 flex-col gap-2">
      {tile}
    </FocusRing>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).outlineStyle).toBe('none');
    await expect(getComputedStyle(link.closest('div')!).outlineStyle).toBe('solid');
  },
};

/** Inside the edge, for a group that sits in a clipping parent. */
export const Inset: Story = {
  args: { placement: 'inset' },
  render: (args) => (
    <div className="max-w-80 overflow-hidden">
      <FocusRing {...args} as="div" className="flex flex-col gap-2 p-4">
        {tile}
      </FocusRing>
    </div>
  ),
  play: async () => {
    await userEvent.tab();
  },
};

/** The ring as classes, on an element that draws its own. */
export const AsClasses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <button type="button" className={cx('type-button bg-transparent px-3 py-2', focusRing)}>
        Outset
      </button>
      <button type="button" className={cx('type-button bg-transparent px-3 py-2', focusRingInset)}>
        Inset
      </button>
    </div>
  ),
  play: async () => {
    await userEvent.tab();
  },
};
