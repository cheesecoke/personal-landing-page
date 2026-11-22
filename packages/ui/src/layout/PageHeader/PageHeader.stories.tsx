import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Readout, StatusDot, Text } from '../../primitives';
import { Container } from '../Container/Container';
import { PageHeader } from './PageHeader';

const meta = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Rings' },
  decorators: [
    (Story) => (
      <Container className="py-10">
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** About: title and lead in one column. */
export const Stack: Story = {
  args: {
    title: 'Rings',
    lead: 'One ring for each chapter, from the center out. Select a ring for the details.',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Rings',
    );
  },
};

/** Projects: the lead sits to the right of the title and wraps under it when there is no room. */
export const Row: Story = {
  args: {
    layout: 'row',
    title: 'Projects',
    lead: 'What I build on my own time, and how: what I tried, what broke, what’s next.',
  },
};

/** A project page: the status line above the title. */
export const Project: Story = {
  args: {
    layout: 'project',
    title: 'Duo Decide',
    titleId: 'duo-decide-title',
    lead: 'A decision app for couples. One shared place to ask a question, vote or poll, and see it decided.',
    status: (
      <p className="m-0 flex items-center gap-2.5">
        <StatusDot status="build" />
        <Readout kind="status" tone="secondary">
          In build
        </Readout>
      </p>
    ),
  },
};

/** Beyond: a status line and a note under the lead. */
export const WithExtras: Story = {
  args: {
    title: 'Beyond',
    measure: 36,
    lead: 'Where I’ll build in public: the real work, as it happens, including what fails.',
    children: (
      <>
        <p className="m-0 mt-1.5 inline-flex items-center gap-2.5">
          <StatusDot status="private" className="size-[7px]" />
          <Readout kind="status" tone="secondary">
            Not open yet
          </Readout>
        </p>
        <Text className="max-w-[40ch]">A short intro video, then the work sessions.</Text>
      </>
    ),
  },
};

export const TitleOnly: Story = { args: { title: 'Page not found' } };

export const Phone: Story = { ...Row, globals: { viewport: { value: 'phone' } } };
export const ProjectPhone: Story = { ...Project, globals: { viewport: { value: 'phone' } } };
