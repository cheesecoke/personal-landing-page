import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { ProjectsIndexContent } from '@cwc/content/hand';

import projectsIndex from '../../content/hand/projects-index.json';
import { ProjectsTemplate } from './ProjectsTemplate';

/** The Projects page, fed by the site's own hand content. */
const meta = {
  title: 'Templates/Projects',
  component: ProjectsTemplate,
  parameters: { layout: 'fullscreen' },
  args: { content: ProjectsIndexContent.parse(projectsIndex) },
} satisfies Meta<typeof ProjectsTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = (root: HTMLElement, id: string) =>
  root.querySelector<HTMLElement>(`[data-row="${id}"]`)!;

/**
 * No live data and no tree: the header runs straight into the index. No row carries a new mark
 * and there is no empty map section.
 */
export const NoLiveData: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 }).length).toBe(1);
    await expect(canvas.queryByRole('region', { name: 'Map of the projects' })).toBeNull();
    await expect(canvasElement.querySelectorAll('[data-new-label]').length).toBe(0);
    // A name-only project: its name and status. No line, no link.
    const distill = row(canvasElement, 'distill');
    await expect(distill.querySelector('a')).toBeNull();
    await expect(distill.querySelectorAll('span.type-h3 ~ *').length).toBe(1);
    // Every other row is a link.
    await expect(canvasElement.querySelectorAll('[data-row] a').length).toBe(11);
    await expect(canvas.getByRole('navigation', { name: 'Next' })).toBeInTheDocument();
  },
};

/** With live data: the rows that changed lately carry the new mark. */
export const WithFresh: Story = {
  args: {
    fresh: {
      pas: { ageDays: 2, lifeDays: 14 },
      'thread-quest': { ageDays: 5, lifeDays: 14 },
    },
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-new-label]').length).toBe(2));
  },
};

/** With the tree in its slot, between the header and the index (a stand-in box here). */
export const WithMap: Story = {
  args: {
    map: <div aria-hidden="true" className="h-[800px] border-y border-dashed border-tick" />,
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('region', { name: 'Map of the projects' }),
    ).toBeInTheDocument();
  },
};

export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** Reduced motion: no travelling light, nothing slides on hover. */
export const Reduced: Story = { globals: { motion: 'reduce' } };
