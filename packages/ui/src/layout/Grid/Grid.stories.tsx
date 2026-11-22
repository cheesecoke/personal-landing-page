import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoryBlock } from '../internal/StoryBlock';
import { Grid } from './Grid';

const cells = (
  <>
    <StoryBlock>One</StoryBlock>
    <StoryBlock>Two</StoryBlock>
    <StoryBlock>Three</StoryBlock>
  </>
);

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
  args: { children: cells },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Proof facts: 150px floor, 36px rows, 24px columns. */
export const Facts: Story = { args: { min: 150, gapX: 24, gapY: 36 } };
/** Artifact cards: 230px floor, 16px gap, cells aligned to the top. */
export const Cards: Story = { args: { min: 230, gapX: 16, align: 'start' } };
/** The project index: 300px floor, 48px columns, 56px rows. */
export const Index: Story = { args: { min: 300, gapX: 48, gapY: 56, align: 'start' } };
export const AsList: Story = {
  args: {
    as: 'ul',
    children: (
      <>
        <li>
          <StoryBlock>One</StoryBlock>
        </li>
        <li>
          <StoryBlock>Two</StoryBlock>
        </li>
      </>
    ),
  },
};
/** At 390 the columns collapse to one. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
