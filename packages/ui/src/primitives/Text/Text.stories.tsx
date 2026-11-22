import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  args: { children: 'Vote mode finishes when both have voted.' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = {};

export const Lead: Story = {
  args: { role: 'lead', children: 'A decision app for couples.' },
};

export const Measure: Story = {
  args: {
    role: 'lead',
    measure: true,
    children:
      'Voting, three-round polls, option lists, history and real-time sync work on iOS and the web. The redesign shipped in October.',
  },
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text tone="primary">Primary: Bone</Text>
      <Text tone="secondary">Secondary: Ash</Text>
      <Text tone="label">Label: Smoke</Text>
      <Text tone="warm">Warm: Hinoki</Text>
      <Text tone="signal">Signal</Text>
    </div>
  ),
};

/** Every type role, at the role's own colour. */
export const Roles: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex flex-col gap-6 p-gutter">
      <Text as="div" role="hero">
        What I’ve built, and what’s still growing.
      </Text>
      <Text as="div" role="h1">
        Rings
      </Text>
      <Text as="div" role="h2">
        Duo Decide
      </Text>
      <Text as="div" role="h3">
        How a decision works
      </Text>
      <Text role="lead">A decision app for couples.</Text>
      <Text role="body">Vote mode finishes when both have voted.</Text>
      <Text as="div" role="label">
        About / Titan Intake
      </Text>
      <Text as="div" role="handoff">
        AI system
      </Text>
      <Text as="div" role="button">
        See the projects
      </Text>
      <Text as="div" role="nav">
        Projects
      </Text>
      <Text as="div" role="link">
        All projects
      </Text>
      <Text as="div" role="readout-numeral">
        1,167
      </Text>
      <Text as="div" role="readout-status">
        In build
      </Text>
      <Text as="div" role="readout-stardate">
        2026.324
      </Text>
    </div>
  ),
};
