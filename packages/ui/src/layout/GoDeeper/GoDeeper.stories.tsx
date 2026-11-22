import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Container } from '../Container/Container';
import { Thread, ThreadColumn, ThreadScope } from '../Thread/Thread';
import { GoDeeper, type GoDeeperItem } from './GoDeeper';

// Copy from the Duo Decide project board (two of its rows).
const items: GoDeeperItem[] = [
  {
    id: 'building',
    title: 'What I’m building',
    meta: '2 artifacts',
    body: 'One shared queue of decisions for two people. Vote mode is quick: one of you proposes options and the other picks. Poll mode is for harder calls: you both vote privately, it narrows to the two options you picked, and if you still disagree the partner who didn’t start it makes the final pick.',
    artifacts: [
      {
        date: '5 Nov 2026',
        dateTime: '2026-11-05',
        title: 'Over-the-air updates',
        text: 'Fixes reach both phones without waiting on a new store review.',
        source: 'Pull request · duo-decide #40',
        lit: true,
      },
      {
        date: '4 Nov 2026',
        dateTime: '2026-11-04',
        title: 'Built for the App Store',
        text: 'An iOS build with the iOS 26 SDK, which the App Store now requires.',
        source: 'Pull request · duo-decide #28',
      },
    ],
  },
  {
    id: 'tried',
    title: 'What I tried',
    meta: '3 artifacts',
    body: 'I split thinking from building. Ideas and trade-offs live in one repo, specs and code in another, and an idea moves over only once it is a decision. Every database migration is applied and tested in CI. Duo was also the first outside repo my AI pipeline worked on, and it opened real pull requests here.',
    artifacts: [
      {
        date: '3 Jun 2026',
        dateTime: '2026-06-03',
        title: 'The first pipeline run here',
        text: 'The first pull request my AI pipeline opened outside its own repo: a small helper for vote counts.',
        source: 'Pull request · duo-decide #7',
      },
      {
        date: '24 Apr 2026',
        dateTime: '2026-04-24',
        title: 'Two repos',
        text: 'Ideas and trade-offs in one repo, specs and code in another. An idea moves over once it is a decision.',
        source: 'Decision · duo-docs, speckit hybrid workflow',
      },
      {
        date: '20 Nov 2026',
        dateTime: '2026-11-20',
        title: 'Polls in round 1',
        text: 'Both partners vote privately. Nobody sees a pick until both have voted.',
        source: 'Capture · Storybook, fixture data',
      },
    ],
  },
];

const meta = {
  title: 'Layout/GoDeeper',
  component: GoDeeper,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Go deeper', artifactsLabel: 'Dated artifacts', items },
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
} satisfies Meta<typeof GoDeeper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rows are closed by default. The play function opens the first one. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Go deeper' })).toBeVisible();
    const row = canvas.getByRole('button', { name: /What I’m building/ });
    await expect(row).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    const list = (await canvas.findAllByRole('list', { name: 'Dated artifacts' }))[0]!;
    await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(2));
    await expect(list.querySelector('time')?.getAttribute('datetime')).toBe('2026-11-05');
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Open: Story = {
  args: { items: items.map((item, index) => ({ ...item, defaultOpen: index === 0 })) },
};

export const AllOpen: Story = {
  args: {
    items: items.map((item) => ({
      ...item,
      defaultOpen: true,
      artifacts: item.artifacts?.map((a) => ({ ...a, lit: false })),
    })),
  },
};

/** No thread beside it (a page without one). */
export const NoNode: Story = {
  args: { node: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(0);
  },
};

export const Phone: Story = { ...Open, globals: { viewport: { value: 'phone' } } };
export const Reduced: Story = { ...Open, globals: { motion: 'reduce' } };
