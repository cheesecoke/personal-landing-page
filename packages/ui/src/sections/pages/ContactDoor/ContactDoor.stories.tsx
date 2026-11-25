import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Container, ThreadScope } from '../../../layout';
import { ContactDoor } from './ContactDoor';
import { portalScene } from './scene';
import { portalArt } from './storyArt';

/**
 * The Contact page section. The thread runs down the left, along the floor and plugs into the
 * portal's power unit; the spiral turns in the ring's opening. The stories use a drawn stand-in
 * for the render, built from the same scene numbers.
 */
const meta = {
  title: 'Sections/Pages/ContactDoor',
  component: ContactDoor,
  parameters: { layout: 'fullscreen' },
  args: {
    image: portalArt,
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

/** How far the spiral's box is from the opening the scene names, in px, on each side. */
function openingGap(root: HTMLElement) {
  const stage = root.querySelector('[data-contact-door] img')!.getBoundingClientRect();
  const spiral = root.querySelector('[data-contact-door] svg')!.getBoundingClientRect();
  const { width, height, opening: o } = portalScene;
  const sx = stage.width / width;
  const sy = stage.height / height;
  return Math.max(
    Math.abs(spiral.left - (stage.left + (o.cx - o.rx) * sx)),
    Math.abs(spiral.right - (stage.left + (o.cx + o.rx) * sx)),
    Math.abs(spiral.top - (stage.top + (o.cy - o.ry) * sy)),
    Math.abs(spiral.bottom - (stage.top + (o.cy + o.ry) * sy)),
  );
}

/** How far the end of the floor line is from the plug the scene names, in px. */
function plugGap(root: HTMLElement) {
  const stage = root.querySelector('[data-contact-door] img')!.getBoundingClientRect();
  const floor = root.querySelector('[data-contact-thread]')!.getBoundingClientRect();
  const { width, height, plug } = portalScene;
  return Math.max(
    Math.abs(floor.right - (stage.left + (plug[0] / width) * stage.width)),
    Math.abs(floor.top + floor.height / 2 - (stage.top + (plug[1] / height) * stage.height)),
  );
}

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
    // The thread continues to the portal: the rail ends on the floor line, which ends at the plug.
    await waitFor(() => {
      const gap = threadGap(canvasElement);
      expect(gap.y).toBeLessThanOrEqual(1.5);
      expect(gap.reaches).toBe(true);
      expect(plugGap(canvasElement)).toBeLessThanOrEqual(1.5);
    });
    // The spiral sits exactly over the ring's opening, and the scene is decoration.
    await expect(openingGap(canvasElement)).toBeLessThanOrEqual(1);
    await expect(canvasElement.querySelector('[data-contact-door]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};

/** On a phone the portal sits under the links, whole, and the rail still ends on its floor line. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const links = canvasElement.querySelector('ul')!.getBoundingClientRect();
    const door = canvasElement.querySelector('[data-contact-door]')!.getBoundingClientRect();
    await expect(door.top).toBeGreaterThan(links.bottom);
    const render = canvasElement.querySelector('[data-contact-door] img')!.getBoundingClientRect();
    await expect(render.left).toBeGreaterThanOrEqual(0);
    await expect(render.right).toBeLessThanOrEqual(window.innerWidth);
    await waitFor(() => {
      const gap = threadGap(canvasElement);
      expect(gap.y).toBeLessThanOrEqual(2);
      expect(gap.reaches).toBe(true);
      expect(plugGap(canvasElement)).toBeLessThanOrEqual(2);
    });
    await expect(openingGap(canvasElement)).toBeLessThanOrEqual(1);
  },
};

/** In between, the render shrinks with the column and the rail's foot follows the floor line. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const gap = threadGap(canvasElement);
      expect(gap.y).toBeLessThanOrEqual(1.5);
      expect(gap.reaches).toBe(true);
      expect(plugGap(canvasElement)).toBeLessThanOrEqual(1.5);
    });
    await expect(openingGap(canvasElement)).toBeLessThanOrEqual(1);
  },
};

/** Pointer over the portal: the spiral speeds up, and settles back when the pointer leaves. */
export const Hover: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const spiral = canvasElement.querySelector('[data-contact-door] svg')!;
    const stage = spiral.closest('[data-contact-door] > div')!;
    await expect(spiral).toHaveAttribute('data-speed', 'rest');
    await userEvent.hover(stage);
    await waitFor(() => expect(spiral).toHaveAttribute('data-speed', 'active'));
    await userEvent.unhover(stage);
    await waitFor(() => expect(spiral).toHaveAttribute('data-speed', 'rest'));
  },
};

/**
 * Reduced motion: the arrow does not slide, the thread has no travelling light, and the spiral is
 * a still frame.
 */
export const Reduced: Story = { globals: { motion: 'reduce' } };

/** Without the thread, for use outside a page column: no floor line either. */
export const NoThread: Story = {
  args: { thread: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-thread]')).toBeNull();
    await expect(canvasElement.querySelector('[data-contact-thread]')).toBeNull();
  },
};
