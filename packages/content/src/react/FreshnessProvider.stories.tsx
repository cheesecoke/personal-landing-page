import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { seedContent } from '../fixtures';
import type { FreshCandidate } from '../freshness';
import { FreshnessProvider, useFreshMark, useFreshness } from './FreshnessProvider';

// A check of the wiring, not a design: the seed projects with what the rules decide for the date
// in the "Site date" toolbar. The real marker is NewMarker in @cwc/ui.
const candidates: FreshCandidate[] = seedContent.projects.map((project) => ({
  id: project.slug,
  project: project.slug,
  fresh: project.visibility === 'public' ? project.fresh : null,
}));

function Row({ id, name }: { id: string; name: string }) {
  const mark = useFreshMark(id);
  return (
    <tr data-testid={id}>
      <th scope="row">{name}</th>
      <td>{mark ? `New · ${mark.ageDays === 0 ? 'today' : `${mark.ageDays}d`}` : ''}</td>
      <td>{mark ? `${Math.round(mark.remaining * 100)}%` : ''}</td>
    </tr>
  );
}

function SeedFreshness() {
  const { now } = useFreshness();
  return (
    <table className="type-body text-primary">
      <caption data-testid="now">{now}</caption>
      <tbody>
        {seedContent.projects.map((project) => (
          <Row key={project.slug} id={project.slug} name={project.name} />
        ))}
      </tbody>
    </table>
  );
}

const meta = {
  title: 'Content/FreshnessProvider',
  component: FreshnessProvider,
  args: { candidates, children: <SeedFreshness /> },
} satisfies Meta<typeof FreshnessProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Follows the "Site date" toolbar: the date comes from the provider the decorator adds. */
export const SiteDate: Story = {
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('now')).toHaveTextContent(String(globals.siteDate));
  },
};

/** 22 Nov 2026: three projects changed two days ago; the cap of three keeps them in page order. */
export const Day0: Story = {
  args: { now: '2026-11-22' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('atti')).toHaveTextContent('New · 2d');
    await expect(canvas.getByTestId('pas')).toHaveTextContent('New · 2d');
    await expect(canvas.getByTestId('personal-brain')).toHaveTextContent('New · 2d');
    await expect(canvas.getByTestId('thread-quest')).not.toHaveTextContent('New');
    await expect(canvas.getByTestId('duo-decide')).not.toHaveTextContent('New');
    await expect(canvas.getAllByText(/^New/)).toHaveLength(3);
  },
};

/** Six weeks on with no publish: every marker has drained. */
export const Expired: Story = {
  args: { now: '2027-01-03' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByText(/^New/)).toHaveLength(0);
  },
};
