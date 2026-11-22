import type { Meta, StoryObj } from '@storybook/react-vite';

import { Container } from '../Container/Container';
import { StoryBlock } from '../internal/StoryBlock';
import { Section } from './Section';

const meta = {
  title: 'Layout/Section',
  component: Section,
  parameters: { layout: 'fullscreen' },
  args: { 'aria-label': 'Example', children: <StoryBlock>Section</StoryBlock> },
  decorators: [
    (Story) => (
      <Container>
        <StoryBlock>Block above</StoryBlock>
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Details: Story = { args: { space: 'details' } };
export const Handoff: Story = { args: { space: 'handoff' } };
export const LogMeasure: Story = { args: { measure: 'log' } };
export const DeeperMeasure: Story = { args: { measure: 'deeper' } };
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
