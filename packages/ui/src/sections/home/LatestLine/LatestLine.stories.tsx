import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container } from '../../../layout';
import { latestRelease, latestUpdate } from '../internal/homeCopy';
import { LatestLine } from './LatestLine';

const meta = {
  title: 'Sections/Home/LatestLine',
  component: LatestLine,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Latest', entry: latestUpdate },
  decorators: [
    (Story) => (
      <Container className="py-10">
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof LatestLine>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The newest change is a stretch of work: its date, the project and one line. */
export const Update: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Latest')).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'PAS' })).toHaveAttribute(
      'href',
      '/projects/pas',
    );
    await expect(canvas.getByText('20 Nov 2026')).toHaveAttribute('datetime', '2026-11-20');
  },
};

/** The newest change is a release: the version is written out beside the project. */
export const Release: Story = {
  args: { entry: latestRelease },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('v1.0.0')).toBeVisible();
  },
};

/** Nothing published: the line renders nothing at all. */
export const Empty: Story = {
  args: { entry: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('p')).toBeNull();
    await expect(canvasElement).not.toHaveTextContent('Latest');
  },
};

/** 390 wide: the line wraps. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
export const ReleasePhone: Story = {
  args: { entry: latestRelease },
  globals: { viewport: { value: 'phone' } },
};

/** Reduced motion: the link's colour change is instant. */
export const Reduced: Story = { globals: { motion: 'reduce' } };
