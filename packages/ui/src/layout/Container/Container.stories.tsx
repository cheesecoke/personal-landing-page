import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoryBlock } from '../internal/StoryBlock';
import { Container } from './Container';

const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: { children: <StoryBlock>Page column</StoryBlock> },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The 1200px page column with the fluid gutter. */
export const Page: Story = {};

/** The 1440px band with no gutter: the map and the Beyond scene. */
export const Wide: Story = {
  args: { width: 'wide', children: <StoryBlock>Wide band</StoryBlock> },
};

export const Full: Story = {
  args: { width: 'full', children: <StoryBlock>Full width</StoryBlock> },
};

/** As a query container: the inner row switches direction on the container's width. */
export const QueryContainer: Story = {
  args: {
    query: true,
    children: (
      <div className="flex flex-col gap-4 @md:flex-row">
        <div className="flex-1">
          <StoryBlock>One</StoryBlock>
        </div>
        <div className="flex-1">
          <StoryBlock>Two</StoryBlock>
        </div>
      </div>
    ),
  },
};

export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
