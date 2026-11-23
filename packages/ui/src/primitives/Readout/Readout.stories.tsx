import type { Meta, StoryObj } from '@storybook/react-vite';

import { Readout } from './Readout';

const meta = {
  title: 'Primitives/Readout',
  component: Readout,
  args: { kind: 'numeral', children: '1,167' },
} satisfies Meta<typeof Readout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Numeral: Story = {};

export const Status: Story = {
  args: { kind: 'status', children: 'In build' },
};

/** The status word is Bone on the system board, Ash in a page header, Smoke in the index. */
export const StatusTones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Readout kind="status">In build</Readout>
      <Readout kind="status" tone="secondary">
        In build
      </Readout>
      <Readout kind="status" tone="label">
        Daily use
      </Readout>
      <Readout kind="status" tone="warm">
        New · 2d
      </Readout>
    </div>
  ),
};

export const DateRange: Story = {
  name: 'Date',
  args: { kind: 'date', children: '2022–2024' },
};

/** With `dateTime` the date is a `<time>` element. */
export const DateWithTime: Story = {
  args: { kind: 'date', dateTime: '2026-10-06', children: '6 Oct 2026' },
};

export const Stardate: Story = {
  args: { kind: 'stardate', children: '2026.324' },
};

/** Year.day worked out from an ISO date, beside the readable date. */
export const StardateFromDate: Story = {
  render: () => (
    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <Readout kind="stardate" dateTime="2026-10-06" />
      <Readout kind="date" dateTime="2026-10-06">
        6 Oct 2026
      </Readout>
    </span>
  ),
};
