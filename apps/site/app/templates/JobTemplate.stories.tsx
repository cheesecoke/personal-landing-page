import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { fixtures } from '@cwc/content/fixtures';
import { ProjectPageContent } from '@cwc/content/hand';

import titanIntake from '../../content/hand/work/titan-intake.json';
import { JobTemplate } from './JobTemplate';

/** The job page, fed by the site's own hand content. */
const meta = {
  title: 'Templates/Job',
  component: JobTemplate,
  parameters: { layout: 'fullscreen' },
  args: { content: ProjectPageContent.parse(titanIntake) },
  globals: { viewport: { value: 'desktop' } },
} satisfies Meta<typeof JobTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const noLog = async (root: HTMLElement) => {
  await expect(root.querySelector('#log')).toBeNull();
  await expect(root.querySelector('[data-log-entry]')).toBeNull();
  await expect(within(root).queryByText('Captain’s log')).toBeNull();
};

/** No live data: the page as it ships. No log, and no empty shell where one would go. */
export const NoLiveData: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', {
        level: 1,
        name: 'Titan Intake · Senior Software Engineer, AI',
      }),
    ).toBeVisible();
    await expect(canvas.getByRole('heading', { level: 2, name: 'What it is' })).toBeVisible();
    await noLog(canvasElement);
    // Four nodes on the thread: the opening, "What it is", "Go deeper", the hand-off.
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(4);
    const row = canvas.getByRole('button', { name: /What didn't work/ });
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await expect(canvasElement.textContent).not.toContain('[CONFIRM');
  },
};

/** The job log switched off, as its file is today: the same page. */
export const LogDisabled: Story = {
  args: { log: fixtures.titanLogDisabled },
  play: async ({ canvasElement }) => noLog(canvasElement),
};

export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** Reduced motion: no travelling light on the thread. */
export const Reduced: Story = { globals: { motion: 'reduce' } };
