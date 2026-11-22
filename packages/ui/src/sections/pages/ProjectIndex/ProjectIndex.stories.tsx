import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { StoryPage } from '../internal/StoryPage';
import { ProjectIndex, ProjectsMapSlot } from './ProjectIndex';
import { groups, quietGroups } from './ProjectIndex.fixtures';

/**
 * The Projects index. Each row is a link with the project's state; rows that changed lately carry
 * the new mark (the caller picks them and caps them at three a page).
 */
const meta = {
  title: 'Sections/Pages/ProjectIndex',
  component: ProjectIndex,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Index', groups },
  decorators: [
    (Story) => (
      <StoryPage>
        <Story />
      </StoryPage>
    ),
  ],
} satisfies Meta<typeof ProjectIndex>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = (root: HTMLElement, id: string) =>
  root.querySelector<HTMLElement>(`[data-row="${id}"]`)!;

/** Growing: two projects changed two days ago and show the new mark. */
export const Growing: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Index' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('heading', { level: 3 }).length).toBe(3);
    await expect(canvas.getByRole('link', { name: /^Atti/ })).toHaveAttribute(
      'href',
      '/projects/pas/atti',
    );
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-new-label]').length).toBe(2));
    await expect(row(canvasElement, 'pas')).toHaveTextContent('New · 2d');
    await expect(row(canvasElement, 'thread-quest')).toHaveTextContent('New · 2d');
    // Three groups side by side.
    const tops = canvas
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.getBoundingClientRect().top);
    await expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
  },
};

/** No update: nothing changed lately, so no row carries a mark. */
export const NoUpdate: Story = {
  args: { groups: quietGroups },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-new-label]').length).toBe(0);
    await expect(canvasElement.querySelectorAll('[data-new-ring]').length).toBe(0);
  },
};

/** A name-only project (Distill): its name and its status. No line, no link, no arrow. */
export const NameOnly: Story = {
  args: { groups: [quietGroups[1]!] },
  play: async ({ canvasElement }) => {
    const distill = row(canvasElement, 'distill');
    await expect(distill).toHaveTextContent(/^DistillNext version$/);
    await expect(distill.querySelector('a')).toBeNull();
    await expect(distill.querySelectorAll('svg').length).toBe(1); // only the branch line
  },
};

/** Empty: no groups, only the title. */
export const Empty: Story = { args: { groups: [] } };

/** The phone layout: the groups stack and the rows keep their indent. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const tops = within(canvasElement)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.getBoundingClientRect().top);
    await expect(tops[1]).toBeGreaterThan(tops[0]!);
    await expect(tops[2]).toBeGreaterThan(tops[1]!);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** Reduced motion: the new marks are simply there and nothing slides on hover. */
export const Reduced: Story = { globals: { motion: 'reduce' } };

/** On the page the project map sits in its slot above the index, outside the page column. */
export const WithMapSlot: Story = {
  decorators: [
    (Story) => (
      <>
        <ProjectsMapSlot aria-label="Map of the projects">
          <div className="type-label flex h-[320px] items-center justify-center border-y border-dashed border-tick">
            The project map goes here
          </div>
        </ProjectsMapSlot>
        <Story />
      </>
    ),
  ],
};
