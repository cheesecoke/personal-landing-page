import type { Meta, StoryObj } from '@storybook/react-vite';

import { Readout } from '../Readout/Readout';
import { StatusDot } from './StatusDot';

const meta = {
  title: 'Primitives/StatusDot',
  component: StatusDot,
  args: { status: 'build' },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Build: Story = {};
export const Live: Story = { args: { status: 'live' } };
export const Private: Story = { args: { status: 'private' } };

/** A status is always a dot plus a word: colour is never the only signal. */
export const WithWord: Story = {
  render: () => (
    <div className="flex flex-wrap gap-x-8 gap-y-3">
      <span className="flex items-center gap-2">
        <StatusDot status="build" />
        <Readout kind="status">In build</Readout>
      </span>
      <span className="flex items-center gap-2">
        <StatusDot status="live" />
        <Readout kind="status">Daily use</Readout>
      </span>
      <span className="flex items-center gap-2">
        <StatusDot status="private" />
        <Readout kind="status">Private</Readout>
      </span>
    </div>
  ),
};
