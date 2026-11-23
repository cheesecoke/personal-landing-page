import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { proofFacts } from '../internal/homeCopy';
import { HomeStory } from '../internal/HomeStory';
import { ProofRow } from './ProofRow';

const meta = {
  title: 'Sections/Home/ProofRow',
  component: ProofRow,
  parameters: { layout: 'fullscreen' },
  args: { 'aria-label': 'Proof', facts: proofFacts },
  decorators: [
    (Story) => (
      <HomeStory>
        <Story />
      </HomeStory>
    ),
  ],
} satisfies Meta<typeof ProofRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The board's three proofs: one phrase and two counted facts, each a link. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole('region', { name: 'Proof' });
    const links = within(section).getAllByRole('link');
    await expect(links).toHaveLength(3);
    await expect(links[1]).toHaveTextContent('177');
    await expect(links[1]).toHaveTextContent('commits by Atti');
    await expect(links[2]).toHaveAttribute('href', '/projects/duo-decide');
  },
};

/** Counted facts carry the date they were counted: read out after the fact, and the tooltip. */
export const WithAsOf: Story = {
  args: {
    facts: proofFacts.map((fact) =>
      fact.kind === 'phrase'
        ? fact
        : { ...fact, asOf: { dateTime: '2026-11-20', label: 'As of 20 November 2026' } },
    ),
  },
  play: async ({ canvasElement }) => {
    const times = canvasElement.querySelectorAll('time[datetime="2026-11-20"]');
    await expect(times).toHaveLength(2);
    await expect(times[0]).toHaveTextContent('As of 20 November 2026');
  },
};

/** Facts without a link are plain text. */
export const NoLinks: Story = {
  args: { facts: proofFacts.map((fact) => ({ ...fact, href: undefined })) },
};

/** A bigger count still fits its column. */
export const LongValues: Story = {
  args: {
    facts: proofFacts.map((fact) =>
      fact.key === 'duo-tests' ? { ...fact, value: '12,480', unit: 'test cases in CI' } : fact,
    ),
  },
};

/** No facts: the section renders nothing. */
export const Empty: Story = {
  args: { facts: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('section')).toBeNull();
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** 390 wide: one column. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };

export const Reduced: Story = { globals: { motion: 'reduce' } };
