import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { Container, ThreadScope } from '../../../layout';
import { ContactDoor } from './ContactDoor';

/**
 * The Contact page section. The thread runs down the left, along the floor and in through the
 * open door.
 */
const meta = {
  title: 'Sections/Pages/ContactDoor',
  component: ContactDoor,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'The door is open.',
    lead: 'Building with agents, or want to compare notes? Write to me.',
    links: [
      {
        label: 'Email',
        text: 'chasewcole@gmail.com',
        href: 'mailto:chasewcole@gmail.com',
        primary: true,
      },
      {
        label: 'LinkedIn',
        text: 'linkedin.com/in/chasewcole',
        href: 'https://www.linkedin.com/in/chasewcole',
        external: true,
      },
      {
        label: 'GitHub',
        text: 'github.com/cheesecoke',
        href: 'https://github.com/cheesecoke',
        external: true,
      },
    ],
  },
  decorators: [
    (Story) => (
      <ThreadScope hash={false}>
        <Container as="main">
          <Story />
        </Container>
      </ThreadScope>
    ),
  ],
} satisfies Meta<typeof ContactDoor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** How far the foot of the rail is from the floor line it hands over to, in px. */
function threadGap(root: HTMLElement) {
  const rail = root.querySelector('[data-thread]')!.getBoundingClientRect();
  const floor = root.querySelector('[data-contact-thread]')!.getBoundingClientRect();
  return {
    y: Math.abs(rail.bottom - (floor.top + floor.height / 2)),
    // The floor line reaches left at least as far as the rail's line.
    reaches: floor.left <= rail.left + rail.width / 2 + 1,
  };
}

export const Default: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'The door is open.' }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'chasewcole@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:chasewcole@gmail.com',
    );
    await expect(canvas.getByRole('link', { name: 'github.com/cheesecoke' })).toHaveAttribute(
      'rel',
      'noopener',
    );
    // The thread continues into the door: the rail ends on the floor line.
    await waitFor(() => {
      const gap = threadGap(canvasElement);
      expect(gap.y).toBeLessThanOrEqual(1.5);
      expect(gap.reaches).toBe(true);
    });
  },
};

/** On a phone the door sits under the links, and the rail still ends on its floor line. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const links = canvasElement.querySelector('ul')!.getBoundingClientRect();
    const door = canvasElement.querySelector('[data-contact-door]')!.getBoundingClientRect();
    await expect(door.top).toBeGreaterThan(links.bottom);
    await waitFor(() => {
      const gap = threadGap(canvasElement);
      expect(gap.y).toBeLessThanOrEqual(2);
      expect(gap.reaches).toBe(true);
    });
  },
};

/** In between, the drawing shrinks with the column and the rail's foot follows the floor line. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const gap = threadGap(canvasElement);
      expect(gap.y).toBeLessThanOrEqual(1.5);
      expect(gap.reaches).toBe(true);
    });
  },
};

/** Reduced motion: the arrow does not slide and the thread has no travelling light. */
export const Reduced: Story = { globals: { motion: 'reduce' } };

/** Without the thread, for use outside a page column. */
export const NoThread: Story = { args: { thread: false } };
