import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { placeholder } from '../internal/storyMedia';
import { IdeaCompare } from './IdeaCompare';

const meta = {
  title: 'Sections/Project/IdeaCompare',
  component: IdeaCompare,
  parameters: { layout: 'fullscreen' },
  // Copy from the Lifebox board; the image is a placeholder.
  args: {
    id: 'idea',
    title: 'The idea',
    lead: 'Stable frame, adaptive content.',
    intro:
      'One codebase, with a different configuration for each person. The frame of the app stays stable and the content adapts: what shows on Now, in what order, and how dense it is.',
    cards: [
      {
        title: 'Testing for a crowd',
        marks: ['A', 'B'],
        text: 'Split people into A and B, and keep what wins.',
        label:
          'Testing for a crowd: people are split into group A and group B, and the version that wins is kept.',
      },
      {
        title: 'An app built for one person',
        tag: 'n = 1',
        marks: ['W1', 'W2', 'W3', 'W4'],
        text: 'A few signals a week, too few to split. Judge a change from week three, and drop the first days of each test block.',
        label:
          'An app built for one person: four weekly blocks. The first days of each block are dropped, and changes are judged from week three.',
      },
    ],
    outro:
      'What carries over from crowd testing: generate, constrain, measure, keep what works. What doesn’t: the statistics.',
    figure: {
      image: {
        src: placeholder(1200, 800, { subject: [147, 620] }),
        width: 1200,
        height: 800,
        alt: 'Four visual directions for the Lifebox Now screen, design mockups side by side.',
      },
      caption:
        'Concept · four visual directions for the Now screen (working title Life Inbox), not the running app',
      crop: { top: 147, bottom: 620 },
    },
  },
  decorators: [
    (Story) => (
      <ThreadScope hash={false}>
        <Container width="project" className="pb-16">
          <ThreadColumn placement="gutter">
            <div className="relative">
              <Thread placement="gutter" bottom={0} />
              <Story />
            </div>
          </ThreadColumn>
        </Container>
      </ThreadScope>
    ),
  ],
} satisfies Meta<typeof IdeaCompare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'The idea' })).toBeVisible();
    await expect(
      canvas.getByRole('img', { name: /^Testing for a crowd: people are split/ }),
    ).toBeVisible();
    await expect(canvas.getByRole('img', { name: /^An app built for one person/ })).toBeVisible();
    await expect(canvasElement.querySelector('#idea')).not.toBeNull();
  },
};

/** Without the figure. */
export const CardsOnly: Story = { args: { figure: undefined } };

export const Phone: Story = { ...Default, globals: { viewport: { value: 'phone' } } };
