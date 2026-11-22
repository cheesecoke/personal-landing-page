import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Readout } from '../Readout/Readout';
import { VisuallyHidden } from './VisuallyHidden';

const meta = {
  title: 'Primitives/VisuallyHidden',
  component: VisuallyHidden,
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The readout shows "New · 3d"; a screen reader hears the sentence. */
export const Default: Story = {
  render: () => (
    <span>
      <Readout kind="status" tone="warm" aria-hidden="true">
        New · 3d
      </Readout>
      <VisuallyHidden>New, updated 3 days ago</VisuallyHidden>
    </span>
  ),
  play: async ({ canvasElement }) => {
    const hidden = within(canvasElement).getByText('New, updated 3 days ago');
    await expect(hidden.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  },
};
