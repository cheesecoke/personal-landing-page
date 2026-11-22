import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../Text/Text';
import { ConfirmMarker } from './ConfirmMarker';

const meta = {
  title: 'Primitives/ConfirmMarker',
  component: ConfirmMarker,
  args: { children: '~200 lessons at work' },
} satisfies Meta<typeof ConfirmMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Inside a sentence, where staging shows it. */
export const InText: Story = {
  render: (args) => (
    <Text measure>
      Run in CI with lint, formatting and typecheck. <ConfirmMarker {...args} />
    </Text>
  ),
};
