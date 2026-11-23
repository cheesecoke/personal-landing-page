import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { PublicProject } from '@cwc/content';
import { fixtures, seedContent } from '@cwc/content/fixtures';
import { ProjectPageContent } from '@cwc/content/hand';

import aiSystem from '../../content/hand/projects/ai-system.json';
import atti from '../../content/hand/projects/atti.json';
import duoDecide from '../../content/hand/projects/duo-decide.json';
import lifebox from '../../content/hand/projects/lifebox.json';
import pas from '../../content/hand/projects/pas.json';
import personalBrain from '../../content/hand/projects/personal-brain.json';
import threadQuest from '../../content/hand/projects/thread-quest.json';
import { ProjectTemplate } from './ProjectTemplate';

const page = (json: unknown) => ProjectPageContent.parse(json);
const seed = (slug: string) =>
  seedContent.projects.find(
    (project): project is PublicProject => project.slug === slug && project.visibility === 'public',
  ) ?? null;

/** The Storybook site date: the day the stories are "built". */
const TODAY = '2026-11-22';

/** The project pages, fed by the site's own hand content and the seed live data. */
const meta = {
  title: 'Templates/Project',
  component: ProjectTemplate,
  parameters: { layout: 'fullscreen' },
  args: { content: page(duoDecide), project: seed('duo-decide'), today: TODAY },
  globals: { viewport: { value: 'desktop' } },
} satisfies Meta<typeof ProjectTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const log = (root: HTMLElement) => within(root).queryByRole('region', { name: 'Captain’s log' });
const logOf = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('#log') ?? document.createElement('div');

/**
 * A growing project (Duo Decide): the live status, the log with three entries
 * and what has not grown yet, and the branch rings with the quarter still growing.
 */
export const Growing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    const slot = logOf(canvasElement);
    await expect(slot.querySelectorAll('[data-log-entry]')).toHaveLength(3);
    await expect(slot.querySelector('[data-latest]')).not.toBeNull();
    await expect([...slot.querySelectorAll('h3')].map((h) => h.textContent)).toContain(
      'Not yet grown',
    );
    await expect(slot.querySelector('[data-growing]')).not.toBeNull();
    // No release: the project is not live.
    await expect(within(slot).queryByText('Latest release')).toBeNull();
    // Rows are closed; a row opens to its dated artifacts.
    const row = canvas.getByRole('button', { name: /What I'm building/ });
    await expect(row).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(row);
    await waitFor(() =>
      expect(canvas.getAllByRole('list', { name: 'Dated artifacts' })[0]).toBeVisible(),
    );
    await expect(canvas.getByRole('region', { name: 'Next' })).toBeInTheDocument();
    // No marker for Chase is ever printed.
    await expect(canvasElement.textContent).not.toContain('[CONFIRM');
  },
};

/** A live project (an example, not real): the release panel, and a release entry in the log. */
export const Live: Story = {
  args: { project: fixtures.projectLive },
  play: async ({ canvasElement }) => {
    const slot = logOf(canvasElement);
    await expect(within(slot).getByRole('region', { name: 'Latest release' })).toBeInTheDocument();
    await expect(slot.querySelector('[data-log-entry="release"]')).not.toBeNull();
    await expect(within(canvasElement).getByText('Live', { selector: 'span' })).toBeVisible();
  },
};

/** No recent update (AI system): the last entry only, no glow, no ring growing, no new mark. */
export const NoUpdate: Story = {
  args: { content: page(aiSystem), project: seed('ai-system') },
  play: async ({ canvasElement }) => {
    const slot = logOf(canvasElement);
    await expect(slot.querySelectorAll('[data-log-entry]')).toHaveLength(1);
    await expect(slot.querySelector('[data-latest]')).toBeNull();
    await expect(slot.querySelector('[data-growing]')).toBeNull();
    await expect(canvasElement.querySelectorAll('[data-new-label]')).toHaveLength(0);
    // Distill is its name and one sentence.
    const distill = canvasElement.querySelector<HTMLElement>('#distill')!;
    await expect(distill.querySelectorAll('p')).toHaveLength(1);
    await expect(distill.querySelector('img, video')).toBeNull();
    // The cropped image under it is pulled up over the block; the sentence stays on top.
    const sentence = distill.querySelector('p')!;
    sentence.scrollIntoView({ block: 'center' });
    const box = sentence.getBoundingClientRect();
    await expect(document.elementFromPoint(box.left + 8, box.top + box.height / 2)).toBe(sentence);
  },
};

/** No live data: hand content only. No log, release or rings, and no empty shell where they go. */
export const NoLiveData: Story = {
  args: { project: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(log(canvasElement)).toBeNull();
    await expect(canvasElement.querySelector('#log')).toBeNull();
    await expect(canvas.queryByText('Branch rings')).toBeNull();
    await expect(canvasElement.querySelectorAll('[data-new-label]')).toHaveLength(0);
    // The status word and the counts fall back to hand content.
    await expect(canvas.getByText('In build')).toBeVisible();
    await expect(canvas.getByText('1,167')).toBeVisible();
    await expect(canvas.getByRole('heading', { level: 2, name: 'Go deeper' })).toBeVisible();
  },
};

const noSideScroll = async () => {
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
};

export const Phone: Story = { globals: { viewport: { value: 'phone' } }, play: noSideScroll };
export const Tablet: Story = { globals: { viewport: { value: 'tablet' } }, play: noSideScroll };

/** Reduced motion: no travelling light, log entries shown without the rise. */
export const Reduced: Story = { globals: { motion: 'reduce' } };

/* The other pages, each with its seed data. */

/** PAS changed two days before the site date: its status carries the new mark, and only one. */
export const Pas: Story = {
  args: { content: page(pas), project: seed('pas') },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-new-label]')).toHaveLength(1));
    await expect(
      within(canvasElement).getByRole('heading', { level: 1, name: 'PAS · Atti and Lifebox' }),
    ).toBeVisible();
  },
};
export const Atti: Story = { args: { content: page(atti), project: seed('atti') } };
export const Lifebox: Story = { args: { content: page(lifebox), project: seed('lifebox') } };
export const PersonalBrain: Story = {
  args: { content: page(personalBrain), project: seed('personal-brain') },
};
export const ThreadQuest: Story = {
  args: { content: page(threadQuest), project: seed('thread-quest') },
};
export const LifeboxPhone: Story = { ...Lifebox, ...Phone };
export const AiSystemPhone: Story = { ...NoUpdate, ...Phone };
