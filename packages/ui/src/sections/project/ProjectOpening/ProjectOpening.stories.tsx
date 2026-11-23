import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { ProjectStateBadge } from '../../../primitives';
import { placeholder } from '../internal/storyMedia';
import { HeroFigure, ProjectOpening } from './ProjectOpening';

const hero = (
  <HeroFigure
    image={{
      src: placeholder(1600, 1000, { subject: [90, 890] }),
      width: 1600,
      height: 1000,
      alt: 'Three screens from the Duo Decide design mock: the decision queue, poll rounds 2 and 3, and the create-decision sheet.',
    }}
    crop={{ top: 90, bottom: 890 }}
    caption="Design mock · three screens"
  />
);

const meta = {
  title: 'Sections/Project/ProjectOpening',
  component: ProjectOpening,
  parameters: { layout: 'fullscreen' },
  // Copy from the Duo Decide board; the image is a placeholder.
  args: {
    title: 'Duo Decide',
    status: <ProjectStateBadge status="build" label="In build" />,
    lead: 'A decision app for couples. One shared place to ask a question, vote or poll, and see it decided.',
    children: hero,
  },
  decorators: [
    (Story) => (
      <ThreadScope hash={false}>
        <Container width="project" className="overflow-x-clip pt-11 pb-16">
          <ThreadColumn placement="gutter">
            <div className="relative pt-6">
              <Thread placement="gutter" top={40} bottom={0} />
              <Story />
            </div>
          </ThreadColumn>
        </Container>
      </ThreadScope>
    ),
  ],
} satisfies Meta<typeof ProjectOpening>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Duo Decide' })).toBeVisible();
    await expect(canvas.getByRole('region', { name: 'Duo Decide' })).toBeVisible();
    await expect(canvas.getByText('In build')).toBeVisible();
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(1);
  },
};

/** A title with a second line, and a fresh status (from the PAS board). */
export const WithSubtitle: Story = {
  args: {
    title: 'PAS',
    subtitle: 'Atti and Lifebox',
    status: (
      <ProjectStateBadge status="live" label="Daily use" fresh={{ ageDays: 2, lifeDays: 14 }} />
    ),
    lead: 'My personal assistant system. Atti is the assistant I text; Lifebox is an experiment planned as its phone app.',
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', { level: 1, name: 'PAS · Atti and Lifebox' }),
    ).toBeVisible();
  },
};

/** No hero: the title block alone. */
export const TextOnly: Story = { args: { children: undefined } };

export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    // The hero bleeds to both edges of the screen.
    const figure = canvasElement.querySelector('figure')!.getBoundingClientRect();
    await expect(Math.round(figure.left)).toBe(0);
    await expect(Math.round(figure.right)).toBe(window.innerWidth);
  },
};
