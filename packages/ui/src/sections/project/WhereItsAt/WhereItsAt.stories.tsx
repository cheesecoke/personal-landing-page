import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { TextLink } from '../../../primitives';
import { WhereItsAt } from './WhereItsAt';

const meta = {
  title: 'Sections/Project/WhereItsAt',
  component: WhereItsAt,
  parameters: { layout: 'fullscreen' },
  // Copy from the Duo Decide board.
  args: {
    title: 'Where it’s at',
    paragraphs: [
      'Voting, three-round polls, option lists, history and real-time sync work on iOS and the web. The redesign shipped in October. November went to App Store readiness: an iOS 26 build, over-the-air updates, archive and soft delete, and a native accessibility pass.',
    ],
    facts: [
      {
        value: '1,167',
        unit: 'test cases',
        caption: 'Run in CI with lint, formatting and typecheck.',
      },
      { value: '24', unit: 'SQL migrations', caption: 'Each applied and tested on PGlite in CI.' },
      {
        value: '6',
        unit: 'end-to-end flows',
        caption: 'Auth, vote, poll, history, option lists, archive.',
      },
    ],
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
} satisfies Meta<typeof WhereItsAt>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Counted facts: a numeral over a tick scale, its unit and one line. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Where it’s at' })).toBeVisible();
    await expect(canvas.getByRole('heading', { level: 2, name: 'Where it’s at' })).toBeVisible();
    await expect(canvasElement.querySelectorAll('[data-fact="numeral"]')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(1);
  },
};

/** Rules and measured facts in words, one with a note (from the Personal brain board). */
export const Words: Story = {
  args: {
    paragraphs: [
      <>
        In daily use since August 2026. Atti, my assistant, writes here most days; see{' '}
        <TextLink inline href="/projects/pas">
          PAS
        </TextLink>
        . Two brains feed it, each built separately and tied together here.
      </>,
    ],
    facts: [
      {
        value: '889',
        unit: 'commits since August 2026',
        caption: 'From me, my skills and my assistant.',
      },
      {
        value: 'No message text in git',
        caption: 'Atti’s commits name what changed, never what I said.',
      },
      {
        value: 'κ 0.41 → 0.91',
        note: 'Sample: 20 items',
        caption: 'The business brain’s scoring rule, before and after a rewrite.',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('[data-fact="word"]')).toHaveLength(2);
    await expect(canvas.getByRole('link', { name: 'PAS' })).toBeVisible();
    await expect(canvas.getByText('Sample: 20 items')).toBeVisible();
  },
};

/** A fact from live data carries the day it was counted. "As of" is a stand-in label. */
export const WithAsOf: Story = {
  args: {
    asOfLabel: 'As of',
    facts: [
      {
        value: '1,167',
        unit: 'test cases',
        caption: 'Run in CI with lint, formatting and typecheck.',
        asOf: '2026-11-20',
      },
      {
        value: '24',
        unit: 'SQL migrations',
        caption: 'Each applied and tested on PGlite in CI.',
        asOf: '2026-11-20',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')?.getAttribute('datetime')).toBe('2026-11-20');
  },
};

/** A fact still to be confirmed keeps its marker, word for word (from the Thread Quest board). */
export const WithConfirm: Story = {
  args: {
    facts: [
      {
        value: '64',
        unit: 'commits',
        caption: '62 in 2024, built with Next.js and Google sign-in. Two in November 2026.',
      },
      {
        value: '[CONFIRM: a fact to check]',
        kind: 'confirm',
        caption: 'No public release yet.',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-fact="confirm"]')).toHaveLength(1);
  },
};

/** The paragraph alone: no facts, no thread node. */
export const TextOnly: Story = {
  args: { facts: [], node: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('ul')).toBeNull();
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(0);
  },
};

export const Phone: Story = { ...Default, globals: { viewport: { value: 'phone' } } };
