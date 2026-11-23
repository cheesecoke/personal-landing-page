import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { BranchRings, type RingData } from './BranchRings';

const ring = (label: string, weight: RingData['weight'], text: string): RingData => ({
  id: label.toLowerCase().replace(/\s+/g, '-'),
  label,
  weight,
  kind: 'period',
  text,
});

// Copy from the Branch rings board.
const duo: RingData[] = [
  ring('2025 Q3', 2, 'First commits on the couples app.'),
  ring('2025 Q4', 3, 'A busy quarter.'),
  ring('2026 Q1', 4, 'The busiest quarter so far.'),
  ring('2026 Q2', 2, 'Google sign-in on the web.'),
  ring('2026 Q3', 1, 'A lean quarter. The AI system opened its first pull requests here.'),
  ring('2026 Q4', 3, 'Redesign v2 merged on 6 Oct. Over-the-air updates on 5 Nov.'),
];

const ai: RingData[] = [
  ring('2026 Q2', 4, 'Built from May.'),
  ring('2026 Q3', 4, 'Ran real tasks on itself and on Duo Decide.'),
];

// "lean" and "busy" are the build design's words; the two between are stand-ins.
const weightLabels = { 1: 'lean', 2: 'steady', 3: 'busy', 4: 'busiest' } as const;

const meta = {
  title: 'Sections/Project/BranchRings',
  component: BranchRings,
  args: {
    title: 'Branch rings',
    status: 'Growing: this quarter',
    rings: duo,
    growing: 0.3,
    note: 'Branch section · Duo Decide. Each ring is a quarter of work.',
    weightLabels,
  },
} satisfies Meta<typeof BranchRings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A growing project: one ring per quarter, the teal arc is the quarter still growing. */
export const Growing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    const rows = canvas.getAllByRole('button');
    // Newest first, the newest selected.
    await expect(rows.map((row) => row.textContent)).toEqual([
      '2026 Q4, busy',
      '2026 Q3, lean',
      '2026 Q2, steady',
      '2026 Q1, busiest',
      '2025 Q4, busy',
      '2025 Q3, steady',
    ]);
    await expect(rows[0]).toHaveAttribute('aria-pressed', 'true');
    const readout = canvasElement.querySelector('[aria-live="polite"]')!;
    await expect(readout).toHaveTextContent('Redesign v2 merged on 6 Oct.');
    await expect(canvasElement.querySelector('[data-growing]')).not.toBeNull();

    await userEvent.click(rows[2]!);
    await expect(rows[2]).toHaveAttribute('aria-pressed', 'true');
    await expect(rows[0]).toHaveAttribute('aria-pressed', 'false');
    await expect(readout).toHaveTextContent('Google sign-in on the web.');
    await expect(canvasElement.querySelectorAll('[data-ring="selected"]')).toHaveLength(1);

    // Keyboard: the rows are buttons in document order.
    rows[0]!.focus();
    await userEvent.keyboard('{Enter}');
    await expect(rows[0]).toHaveAttribute('aria-pressed', 'true');
    for (const row of rows)
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

/**
 * Live: one ring per release. The version is the Captain's log board's placeholder example (Duo
 * Decide is not live); the line under the panel is a stand-in, the boards have none for releases.
 */
export const Live: Story = {
  args: {
    note: 'Branch section · Duo Decide. Each ring is a release.',
    rings: [
      {
        id: 'v1.0.0',
        label: 'v1.0.0',
        weight: 4,
        kind: 'release',
        text: 'Voting and three-round polls for two people.',
      },
    ],
  },
};

/** No update: no ring is growing, so there is no teal arc. */
export const NoUpdate: Story = {
  args: {
    status: 'No ring growing',
    rings: ai,
    growing: 0,
    note: 'Branch section · AI system. Each ring is a quarter of work.',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-growing]')).toBeNull();
    await expect(within(canvasElement).getAllByRole('button')).toHaveLength(2);
  },
};

/** No rings: it renders nothing. */
export const Empty: Story = {
  args: { rings: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
    await expect(canvasElement.querySelector('svg')).toBeNull();
  },
};

/** A project with one stretch of work. */
export const SingleRing: Story = {
  args: { rings: [duo[5]!], growing: 0.3 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('button')).toHaveLength(1);
  },
};

/** Below the fold: the arc draws when the panel scrolls into view. */
export const ArcDraw: Story = {
  decorators: [
    (Story) => (
      <div className="pt-[120vh] pb-10">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('section')!;
    await waitFor(() => expect(panel).toHaveAttribute('data-arc', 'armed'));
    panel.scrollIntoView();
    await waitFor(() => expect(panel).toHaveAttribute('data-arc', 'in'));
  },
};

/** On a phone the ring stacks above its list. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')!.getBoundingClientRect();
    const row = within(canvasElement).getAllByRole('button')[0]!.getBoundingClientRect();
    await expect(row.top).toBeGreaterThanOrEqual(svg.bottom);
  },
};

/** Reduced motion: selecting is instant and the arc is simply drawn. */
export const Reduced: Story = {
  ...ArcDraw,
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('section')!;
    await expect(panel).not.toHaveAttribute('data-arc');
    const selected = canvasElement.querySelector('[data-ring="selected"]')!;
    await expect(getComputedStyle(selected).transitionDuration).toBe('0s');
  },
};
