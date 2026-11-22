import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { FieldNotes } from './FieldNotes';

export const rules = [
  'With AI, experiment and test together. Build the harness around what you need to know.',
  "Stay adaptable. Let go of what's ready to go, and learn what comes next.",
  'Stay calm under pressure, and do the job in front of you.',
];

/** Field notes: the "Rules I work by" list on About. */
const meta = {
  title: 'Sections/Pages/FieldNotes',
  component: FieldNotes,
  excludeStories: ['rules'],
  args: { title: 'Rules I work by', notes: rules },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FieldNotes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Rules I work by' });
    await expect(within(list).getAllByRole('listitem').length).toBe(3);
  },
};

/** No notes: nothing renders, not even the title. */
export const Empty: Story = {
  args: { notes: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('h2')).toBeNull();
  },
};

export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
