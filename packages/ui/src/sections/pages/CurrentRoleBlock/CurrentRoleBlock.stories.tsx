import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StoryPage } from '../internal/StoryPage';
import { RingsTimeline } from '../RingsTimeline/RingsTimeline';
import { chapters, ending, stumpArt } from '../RingsTimeline/RingsTimeline.fixtures';
import { CurrentRoleBlock, type CurrentRole } from './CurrentRoleBlock';

const role: CurrentRole = {
  title: 'Senior Software Engineer, AI',
  org: 'Titan Intake',
  since: '2026-01',
};
const rest = 'I build the pipeline between a product spec and shipped code.';

/**
 * The current role, as the first sentence of the newest ring on About. "Since January 2026" is
 * written from the start month in the data.
 */
const meta = {
  title: 'Sections/Pages/CurrentRoleBlock',
  component: CurrentRoleBlock,
  args: { role, sinceLabel: 'since', children: rest },
  decorators: [
    (Story) => (
      <p className="type-body m-0 max-w-measure">
        <Story />
      </p>
    ),
  ],
} satisfies Meta<typeof CurrentRoleBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent(
      'Senior Software Engineer, AI, since January 2026. I build the pipeline between a product spec and shipped code.',
    );
    await expect(canvasElement.querySelector('time')).toHaveAttribute('datetime', '2026-01');
  },
};

/** The role has not changed since the last publish: it reads the same, from the same start month. */
export const NoUpdate: Story = {};

/** No role data: the hand-written ring text shows instead. */
export const Empty: Story = {
  args: { role: null, fallback: 'Senior Software Engineer, AI.' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toBeNull();
    await expect(canvasElement).toHaveTextContent(`Senior Software Engineer, AI. ${rest}`);
  },
};

/** Where it lives: the summary of the newest ring. */
export const InTheRing: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => (
      <StoryPage>
        <RingsTimeline
          title="Rings"
          lead="One ring for each chapter, from the center out. Select a ring for the details."
          art={stumpArt}
          ending={ending}
          items={chapters.map((item) =>
            item.id === 'titan-intake'
              ? {
                  ...item,
                  summary: (
                    <CurrentRoleBlock role={role} sinceLabel="since">
                      {rest}
                    </CurrentRoleBlock>
                  ),
                }
              : item,
          )}
        />
      </StoryPage>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: /Titan Intake/ }),
    ).toHaveTextContent('Senior Software Engineer, AI, since January 2026.');
  },
};
