import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container } from '../Container/Container';
import { Thread, ThreadColumn, ThreadScope } from '../Thread/Thread';
import { HandoffFooter } from './HandoffFooter';

const meta = {
  title: 'Layout/HandoffFooter',
  component: HandoffFooter,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Next', title: 'About', href: '/about', 'aria-label': 'Next page' },
} satisfies Meta<typeof HandoffFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The foot of Projects: "Next", then the next page in the H1 style. */
export const Page: Story = {
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Next page' });
    await expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    );
  },
};

/** Beyond has a tighter hand-off, straight after its scene. */
export const PageTight: Story = {
  ...Page,
  args: { title: 'Contact', href: '/contact', space: 'beyond' },
  play: undefined,
};

/** The foot of a project page: the next project, the way back, and the thread's last node. */
export const Project: Story = {
  args: {
    variant: 'project',
    label: 'Next project',
    title: 'AI system',
    href: '/projects/ai-system',
    'aria-label': 'Next',
    back: { label: 'Back to the map', href: '/projects' },
  },
  decorators: [
    (Story) => (
      <ThreadScope hash={false}>
        <Container width="project">
          <ThreadColumn placement="gutter">
            <div className="relative">
              <Thread placement="gutter" bottom={56} />
              <Story />
            </div>
          </ThreadColumn>
        </Container>
      </ThreadScope>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'AI system' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Back to the map' })).toHaveAttribute(
      'href',
      '/projects',
    );
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(1);
  },
};

export const ProjectNoBack: Story = {
  ...Project,
  args: { ...Project.args, back: undefined, node: false },
  play: undefined,
};

export const Phone: Story = { ...Page, play: undefined, globals: { viewport: { value: 'phone' } } };
export const ProjectPhone: Story = {
  ...Project,
  play: undefined,
  globals: { viewport: { value: 'phone' } },
};
export const Reduced: Story = { ...Page, play: undefined, globals: { motion: 'reduce' } };
