import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Container, ThreadScope } from '../../../layout';
import { ContactDoor, type ContactDoorPortal } from './ContactDoor';
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
    // Without a portal there is nothing to press.
    await expect(canvasElement.querySelector('[data-contact-portal]')).toBeNull();
    await expect(canvasElement.ownerDocument.querySelector('[data-confirm-dialog]')).toBeNull();
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

const portal: ContactDoorPortal = {
  label: 'Open the portal',
  dialog: {
    title: 'Step through?',
    body: 'It has been running all day. Nobody has said where it goes.',
    enter: 'Enter',
    cancel: 'Not now',
  },
  onEnter: fn(),
};

const portalButton = (root: HTMLElement) =>
  within(root).getByRole('button', { name: 'Open the portal' });
const spiralOf = (root: HTMLElement) => root.querySelector('[data-contact-door] svg')!;
const dialogOf = (root: HTMLElement) =>
  root.ownerDocument.querySelector<HTMLDialogElement>('[data-confirm-dialog]')!;

/** Tabs from the top of the page until the portal button has focus. */
async function tabToPortal(root: HTMLElement) {
  const button = portalButton(root);
  for (let i = 0; i < 8 && document.activeElement !== button; i += 1) await userEvent.tab();
  await expect(button).toHaveFocus();
  return button;
}

async function openPortal(root: HTMLElement) {
  const button = portalButton(root);
  await userEvent.click(button);
  const dialog = dialogOf(root);
  await expect(dialog.open).toBe(true);
  await expect(dialog).toHaveAccessibleName('Step through?');
  await expect(within(dialog).getByRole('button', { name: 'Enter' })).toHaveFocus();
  await expect(document.documentElement.style.overflow).toBe('hidden');
  return dialog;
}

async function closedToPortal(root: HTMLElement) {
  await waitFor(() => expect(dialogOf(root).open).toBe(false));
  await expect(portalButton(root)).toHaveFocus();
  await expect(document.documentElement.style.overflow).toBe('');
}

/**
 * With a portal: the opening is a button, a touch more than the ellipse all round. The render is
 * still decoration; only the button is exposed.
 */
export const Portal: Story = {
  args: { portal },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const scene = canvasElement.querySelector('[data-contact-door]')!;
    await expect(scene).not.toHaveAttribute('aria-hidden');
    const button = portalButton(canvasElement);
    await expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(scene.querySelector('img')).toHaveAttribute('alt', '');
    await expect(spiralOf(canvasElement)).toHaveAttribute('aria-hidden', 'true');
    await expect(scene.querySelectorAll('a, button, [tabindex]')).toHaveLength(1);
    await expect(getComputedStyle(button).cursor).toBe('pointer');
    // The button covers the opening with room to spare, and the spiral still sits in the opening.
    const box = button.getBoundingClientRect();
    const opening = spiralOf(canvasElement).getBoundingClientRect();
    await expect(box.left).toBeLessThan(opening.left);
    await expect(box.right).toBeGreaterThan(opening.right);
    await expect(box.top).toBeLessThan(opening.top);
    await expect(box.bottom).toBeGreaterThan(opening.bottom);
    await expect(openingGap(canvasElement)).toBeLessThanOrEqual(1);
    await expect(dialogOf(canvasElement).open).toBe(false);
  },
};

/** The pointer on the opening speeds the spiral up; elsewhere on the render it does not. */
export const PortalHover: Story = {
  args: { portal },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const spiral = spiralOf(canvasElement);
    const stage = spiral.closest('[data-contact-door] > div')!;
    // The render does not take the pointer at all; only the opening does.
    await expect(getComputedStyle(stage).pointerEvents).toBe('none');
    await userEvent.hover(canvasElement.querySelector('h1')!);
    await expect(spiral).toHaveAttribute('data-speed', 'rest');
    await userEvent.hover(portalButton(canvasElement));
    await waitFor(() => expect(spiral).toHaveAttribute('data-speed', 'active'));
    await userEvent.unhover(portalButton(canvasElement));
    await waitFor(() => expect(spiral).toHaveAttribute('data-speed', 'rest'));
  },
};

/** Keyboard focus on the opening speeds the spiral up and draws the ring round the ellipse. */
export const PortalFocus: Story = {
  args: { portal },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const spiral = spiralOf(canvasElement);
    const button = await tabToPortal(canvasElement);
    await waitFor(() => expect(spiral).toHaveAttribute('data-speed', 'active'));
    const style = getComputedStyle(button);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.borderTopLeftRadius).toBe('50%');
    await userEvent.tab();
    await waitFor(() => expect(spiral).toHaveAttribute('data-speed', 'rest'));
  },
};

/** Pressing it asks first: the dialog opens with focus on "Enter". */
export const PortalOpen: Story = {
  args: { portal },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await openPortal(canvasElement);
    await expect(portal.onEnter).not.toHaveBeenCalled();
  },
};

/** "Enter" closes the question and calls the handler once. */
export const PortalEnter: Story = {
  args: { portal: { ...portal, onEnter: fn() } },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ args, canvasElement }) => {
    const dialog = await openPortal(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enter' }));
    await waitFor(() => expect(dialog.open).toBe(false));
    await expect(args.portal!.onEnter).toHaveBeenCalledTimes(1);
  },
};

/** "Not now" closes it and focus goes back to the portal. */
export const PortalCancel: Story = {
  args: { portal: { ...portal, onEnter: fn() } },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ args, canvasElement }) => {
    const dialog = await openPortal(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Not now' }));
    await closedToPortal(canvasElement);
    await expect(args.portal!.onEnter).not.toHaveBeenCalled();
  },
};

/** Escape closes it and focus goes back to the portal. */
export const PortalEscape: Story = {
  args: { portal: { ...portal, onEnter: fn() } },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ args, canvasElement }) => {
    await tabToPortal(canvasElement);
    await userEvent.keyboard('{Enter}');
    await expect(dialogOf(canvasElement).open).toBe(true);
    await userEvent.keyboard('{Escape}');
    await closedToPortal(canvasElement);
    await expect(args.portal!.onEnter).not.toHaveBeenCalled();
  },
};

/** A click on the dimmed page behind closes it. */
export const PortalBackdrop: Story = {
  args: { portal: { ...portal, onEnter: fn() } },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ args, canvasElement }) => {
    const dialog = await openPortal(canvasElement);
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: dialog,
      coords: { clientX: 4, clientY: 4 },
    });
    await closedToPortal(canvasElement);
    await expect(args.portal!.onEnter).not.toHaveBeenCalled();
  },
};

/** On a phone the opening is still a large target and the question fits the screen. */
export const PortalPhone: Story = {
  args: { portal },
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    const box = portalButton(canvasElement).getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(44);
    await expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(openingGap(canvasElement)).toBeLessThanOrEqual(1);
    const dialog = await openPortal(canvasElement);
    const panel = dialog.getBoundingClientRect();
    await expect(panel.left).toBeGreaterThanOrEqual(16);
    await expect(panel.right).toBeLessThanOrEqual(window.innerWidth - 16);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Reduced motion: the spiral is a still frame, and the dialog appears without a fade. */
export const PortalReduced: Story = {
  args: { portal },
  globals: { motion: 'reduce', viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-motion', 'reduce'));
    const dialog = await openPortal(canvasElement);
    await expect(getComputedStyle(dialog).transitionDuration).toBe('0s');
  },
};
