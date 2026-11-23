import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Panel } from '../../../primitives';
import type { ShootData, ShootLabels } from './ShootItem';
import { ShootList } from './ShootList';

// Words from the Captain's log board and the build design.
const labels: ShootLabels = {
  kind: { goal: 'Goal', idea: 'Idea', question: 'Question' },
  state: { open: 'Not yet grown', grown: 'Grown', answered: 'Answered' },
};

const shoot = (
  id: string,
  label: string,
  kind: ShootData['kind'],
  rest: Partial<ShootData> = {},
): ShootData => ({ id, label, kind, state: 'open', resolved: null, ...rest });

// Copy from the Captain's log board (Duo Decide's shoots).
const duo: ShootData[] = [
  shoot('app-store', 'App Store release', 'goal'),
  shoot('split-vote', 'Who wins a split vote?', 'question', {
    state: 'answered',
    resolved: {
      date: '2026-10-07',
      text: 'Round 3 of a poll is decided by the partner who didn’t start it.',
    },
  }),
  shoot('notifications', 'Notifications', 'idea'),
  shoot('plan-after', 'Plan after deciding', 'idea'),
];

const meta = {
  title: 'Sections/Project/ShootList',
  component: ShootList,
  args: { title: 'Not yet grown', labels, shoots: duo },
  decorators: [
    (Story, context) =>
      context.args.surface === 'ground' ? (
        <div className="max-w-[760px]">
          <Story />
        </div>
      ) : (
        <Panel className="max-w-[760px] px-[clamp(18px,3vw,32px)] pt-6 pb-5.5">
          <Story />
        </Panel>
      ),
  ],
} satisfies Meta<typeof ShootList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A growing project: open shoots are dashed, an answered question is a knot with its answer. */
export const Growing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Not yet grown' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    await expect(canvasElement.querySelectorAll('[data-shoot="open"]')).toHaveLength(3);
    await expect(canvas.getByText('Answered')).toBeVisible();
    await expect(canvasElement.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-07');
    // The icon is decoration; the state is a word.
    await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getAllByText(', Not yet grown')).toHaveLength(3);
  },
};

/** Live: the goal grew. It is solid and, while fresh, carries the new mark. */
export const Live: Story = {
  args: {
    shoots: [
      shoot('app-store', 'App Store release', 'goal', {
        state: 'grown',
        resolved: { date: '2026-12-01', text: 'Voting and three-round polls for two people.' },
      }),
      shoot('notifications', 'Notifications', 'idea'),
      shoot('plan-after', 'Plan after deciding', 'idea'),
    ],
    fresh: { 'app-store': { ageDays: 1, lifeDays: 21 } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('[data-shoot="grown"]')).toHaveLength(1);
    await expect(canvas.getByText('Grown')).toBeVisible();
    await expect(canvas.getByText('New · 1d')).toBeInTheDocument();
  },
};

/** No update: the same shoots, nothing new. A mark that ran out draws nothing. */
export const NoUpdate: Story = {
  args: {
    // Copy from the board (the AI system's shoots).
    shoots: [
      shoot('distill', 'Rebuild as Distill', 'goal'),
      shoot('cascade', 'Model cascade with a verifier', 'idea'),
      shoot('rerank', 'Reranked memory search', 'idea'),
    ],
    fresh: { distill: { ageDays: 40, lifeDays: 21 } },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-new-label]')).toBeNull();
  },
};

/** No shoots, or only dropped ones: the whole section is left out. */
export const Empty: Story = {
  args: { shoots: [shoot('old', 'A release per user', 'idea', { state: 'dropped' })] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('ul')).toBeNull();
    await expect(within(canvasElement).queryByText('Not yet grown')).toBeNull();
  },
};

/** A shoot with its own status word in place of the kind (from the board's PAS and brain logs). */
export const WithNotes: Story = {
  args: {
    shoots: [
      shoot('context', 'Context engine', 'question'),
      shoot('listening', 'Listening for commitments', 'idea', { note: 'Spec written' }),
      shoot('release-per-user', 'A release per user', 'question', { note: 'Open problem' }),
    ],
  },
};

/** Every state side by side. The dropped shoot is not rendered. */
export const States: Story = {
  args: {
    shoots: [
      shoot('open', 'Notifications', 'idea'),
      shoot('grown', 'App Store release', 'goal', {
        state: 'grown',
        resolved: { date: '2026-12-01', text: 'Voting and three-round polls for two people.' },
      }),
      duo[1]!,
      shoot('dropped', 'Plan after deciding', 'idea', { state: 'dropped' }),
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-shoot]')).toHaveLength(3);
  },
};

/** On the page, inside Go deeper's "Open questions and next": the state word is Smoke. */
export const OnGround: Story = { args: { surface: 'ground' } };

export const Phone: Story = { ...Growing, globals: { viewport: { value: 'phone' } } };

/** Reduced motion: the new mark does not fade in. */
export const Reduced: Story = {
  ...Live,
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector('[data-new-label]')!;
    await expect(getComputedStyle(label).transitionDuration).toBe('0s');
  },
};
