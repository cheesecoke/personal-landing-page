import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SiteNav, type SiteNavItem } from './SiteNav';

const items: SiteNavItem[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Beyond', href: '/beyond', quiet: true },
  { label: 'Contact', href: '/contact' },
];

const meta = {
  title: 'Layout/SiteNav',
  component: SiteNav,
  parameters: { layout: 'fullscreen' },
  args: {
    name: 'Chase Cole',
    label: 'Site',
    menu: { open: 'Menu', close: 'Close', home: 'Home' },
    items,
    current: '/',
  },
  argTypes: {
    current: { control: 'select', options: ['/', ...items.map((item) => item.href)] },
  },
} satisfies Meta<typeof SiteNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const timeline = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-nav-timeline]')!;
const settled = async (el: HTMLElement) => {
  await Promise.all(el.getAnimations().map((animation) => animation.finished));
};
/** Distance from the row's left edge to the centre of an element. */
const centreOf = (root: HTMLElement, el: Element) => {
  const row = timeline(root).parentElement!.getBoundingClientRect();
  const box = el.getBoundingClientRect();
  return box.left + box.width / 2 - row.left;
};
/** The line ends at the centre of the current item. */
const endsAtCurrent = async (root: HTMLElement) => {
  const current = root.querySelector('[aria-current="page"]')!;
  const target = current.hasAttribute('data-nav-item') ? current : current.parentElement!;
  await waitFor(async () => {
    await settled(timeline(root));
    const width = timeline(root).getBoundingClientRect().width;
    await expect(Math.abs(width - centreOf(root, target))).toBeLessThanOrEqual(0.5);
  });
};

/** Home: the line runs to the centre of the name. */
export const Home: Story = { play: ({ canvasElement }) => endsAtCurrent(canvasElement) };

export const Projects: Story = {
  args: { current: '/projects' },
  play: ({ canvasElement }) => endsAtCurrent(canvasElement),
};

export const About: Story = {
  args: { current: '/about' },
  play: ({ canvasElement }) => endsAtCurrent(canvasElement),
};

export const Contact: Story = {
  args: { current: '/contact' },
  play: ({ canvasElement }) => endsAtCurrent(canvasElement),
};

/** A page outside the nav (the 404 page): no item is current and no line is drawn. */
export const NoCurrent: Story = {
  args: { current: undefined },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-nav-timeline]')).toBeNull();
    await expect(canvasElement.querySelector('[aria-current]')).toBeNull();
  },
};

/**
 * A release marks the nav for its first 7 days: a small Hinoki ring after Projects. The ring has
 * a text label for assistive tech.
 */
export const ReleaseRing: Story = {
  args: {
    current: '/projects',
    items: items.map((item) =>
      item.href === '/projects' ? { ...item, ring: { label: 'New release' } } : item,
    ),
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /Projects/ });
    await expect(link).toHaveAccessibleName('Projects New release');
    await endsAtCurrent(canvasElement);
  },
};

/**
 * Moving between pages: the nav stays mounted and only `current` changes, so the line travels.
 * Use the buttons, or the `current` control.
 */
export const Travel: Story = {
  render: function TravelStory(args) {
    const [current, setCurrent] = useState(args.current);
    return (
      <>
        <SiteNav {...args} current={current} />
        <div className="mx-auto flex max-w-page flex-wrap gap-2 px-gutter pt-10">
          {[{ label: 'Home', href: '/' }, ...args.items].map((item) => (
            <button
              key={item.href}
              type="button"
              aria-pressed={current === item.href}
              onClick={() => setCurrent(item.href)}
              className="min-h-touch cursor-pointer rounded-button border border-hairline bg-transparent px-4 type-nav text-secondary aria-pressed:border-tick aria-pressed:text-primary"
            >
              Go to {item.label}
            </button>
          ))}
        </div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await endsAtCurrent(canvasElement);
    // After the first paint, the line's width is what animates.
    await waitFor(() =>
      expect(getComputedStyle(timeline(canvasElement)).transitionProperty).toBe('width'),
    );
    for (const name of ['Go to Contact', 'Go to About', 'Go to Projects', 'Go to Home']) {
      await userEvent.click(canvas.getByRole('button', { name }));
      await endsAtCurrent(canvasElement);
    }
  },
};

/** Reduced motion: the line jumps to place. */
export const Reduced: Story = {
  ...Travel,
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(document.documentElement.dataset.motion).toBe('reduce'));
    await userEvent.click(canvas.getByRole('button', { name: 'Go to Contact' }));
    await expect(getComputedStyle(timeline(canvasElement)).transitionDuration).toBe('0s');
    await endsAtCurrent(canvasElement);
  },
};

export const Tablet: Story = {
  args: { current: '/about' },
  globals: { viewport: { value: 'tablet' } },
};

/*
 * The phone nav (under `md`): one header row with the name and a menu button, and the menu panel.
 */

type PhoneWidth = 360 | 390 | 430;

const phone = (width: PhoneWidth) => ({
  viewport: {
    value: `phone${width}`,
    options: {
      [`phone${width}`]: {
        name: `Phone ${width}`,
        styles: { width: `${width}px`, height: '844px' },
        type: 'mobile',
      },
    },
  },
});
const phoneStory = (width: PhoneWidth) =>
  ({
    globals: { viewport: { value: `phone${width}` } },
    parameters: phone(width),
  }) as const;

const menuButton = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('[data-nav-menu-button]')!;
const menuPanel = (root: HTMLElement) =>
  root.querySelector<HTMLDialogElement>('dialog[data-nav-menu]')!;
const closeButton = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('[data-nav-menu-close]')!;

/** The header is one 56px row: the name, and a labelled menu button that names its panel. */
const closedHeader = async (root: HTMLElement) => {
  const button = menuButton(root);
  await expect(button).toBeVisible();
  await expect(button).toHaveAccessibleName('Menu');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button.getAttribute('aria-controls')).toBe(menuPanel(root).id);
  const box = button.getBoundingClientRect();
  await expect(box.width).toBeGreaterThanOrEqual(44);
  await expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(root.querySelector('nav')!.getBoundingClientRect().height).toBe(56);
  await expect(root.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
    root.ownerDocument.documentElement.clientWidth,
  );
  // The pages are in the markup while the menu is closed (crawlable), but not shown.
  await expect(root.querySelectorAll('[data-nav-menu-item]')).toHaveLength(items.length + 1);
  await expect(menuPanel(root).open).toBe(false);
};

/** Opens the menu and checks what an open menu must be. */
const openMenu = async (root: HTMLElement) => {
  await userEvent.click(menuButton(root));
  const panel = menuPanel(root);
  await expect(panel.open).toBe(true);
  await expect(panel.matches(':modal')).toBe(true);
  await expect(menuButton(root)).toHaveAttribute('aria-expanded', 'true');
  // Focus moves into the panel: to the panel itself, so Tab starts at its top.
  await expect(panel).toHaveFocus();
  await expect(root.ownerDocument.documentElement.style.overflow).toBe('hidden');
  const links = within(panel).getAllByRole('link');
  // The name, then Home and the four pages, each a row of 48px or more.
  await expect(links).toHaveLength(items.length + 2);
  for (const row of panel.querySelectorAll('[data-nav-menu-item]')) {
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  }
  await settled(panel);
  await expect(panel.getBoundingClientRect().height).toBe(
    root.ownerDocument.defaultView!.innerHeight,
  );
  return panel;
};

/** The teal line ends in its circle at the middle of the current row. */
const lineEndsAtCurrentRow = async (panel: HTMLElement) => {
  const row = panel.querySelector('[data-nav-menu-item][aria-current="page"]')!;
  const line = panel.querySelector('[data-nav-menu-timeline]')!;
  const rowBox = row.getBoundingClientRect();
  await expect(
    Math.abs(line.getBoundingClientRect().bottom - (rowBox.top + rowBox.height / 2)),
  ).toBeLessThanOrEqual(0.5);
};

const closedMenu = async (root: HTMLElement) => {
  await expect(menuPanel(root).open).toBe(false);
  await expect(menuButton(root)).toHaveAttribute('aria-expanded', 'false');
  await expect(menuButton(root)).toHaveFocus();
  await expect(root.ownerDocument.documentElement.style.overflow).toBe('');
};

/** Closed, on a page: the name and the menu button on one row. */
const closedAt = (width: PhoneWidth): Story => ({
  ...phoneStory(width),
  args: { current: '/projects' },
  play: async ({ canvasElement }) => {
    await expect(window.innerWidth).toBe(width);
    await closedHeader(canvasElement);
  },
});

export const PhoneClosed: Story = closedAt(390);
export const PhoneClosed360: Story = closedAt(360);
export const PhoneClosed430: Story = closedAt(430);

/** Open: the line runs down the panel's edge to the row of the page the reader is on. */
const openAt = (width: PhoneWidth, current: string): Story => ({
  ...phoneStory(width),
  args: { current },
  play: async ({ canvasElement }) => {
    await expect(window.innerWidth).toBe(width);
    const panel = await openMenu(canvasElement);
    await lineEndsAtCurrentRow(panel);
  },
});

export const PhoneOpenHome: Story = openAt(390, '/');
export const PhoneOpenProjects: Story = openAt(390, '/projects');
export const PhoneOpenAbout: Story = openAt(390, '/about');
export const PhoneOpenBeyond: Story = openAt(390, '/beyond');
export const PhoneOpenContact: Story = openAt(390, '/contact');
export const PhoneOpen360: Story = openAt(360, '/about');
export const PhoneOpen430: Story = openAt(430, '/about');

/** A page outside the nav (the 404 page): the menu has no line and no current row. */
export const PhoneOpenNoCurrent: Story = {
  ...phoneStory(390),
  args: { current: undefined },
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement);
    await expect(panel.querySelector('[data-nav-menu-timeline]')).toBeNull();
    await expect(panel.querySelector('[aria-current]')).toBeNull();
  },
};

/** The release ring and the quiet page inside the menu. */
export const PhoneOpenReleaseRing: Story = {
  ...phoneStory(390),
  args: ReleaseRing.args,
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement);
    await expect(within(panel).getByRole('link', { name: /Projects/ })).toHaveAccessibleName(
      'Projects New release',
    );
    await expect(panel.querySelector('[data-nav-ring]')).toBeVisible();
    await lineEndsAtCurrentRow(panel);
  },
};

/** The close button closes the menu and focus goes back to the menu button. */
export const PhoneCloseButton: Story = {
  ...phoneStory(390),
  args: { current: '/about' },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    await expect(closeButton(canvasElement)).toHaveAccessibleName('Close');
    await userEvent.click(closeButton(canvasElement));
    await closedMenu(canvasElement);
  },
};

/** Escape closes the menu and focus goes back to the menu button. */
export const PhoneEscape: Story = {
  ...phoneStory(390),
  args: { current: '/about' },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    await userEvent.keyboard('{Escape}');
    await closedMenu(canvasElement);
  },
};

/** Tab stays inside the open menu: it wraps from the last row to the name and back. */
export const PhoneFocusTrap: Story = {
  ...phoneStory(390),
  args: { current: '/about' },
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement);
    const name = within(panel).getByRole('link', { name: 'Chase Cole' });
    const lastRow = within(panel).getByRole('link', { name: 'Contact' });
    // The name, the close button, Home and the four pages.
    const stops = items.length + 3;
    await userEvent.tab();
    await expect(name).toHaveFocus();
    await userEvent.tab();
    await expect(closeButton(canvasElement)).toHaveFocus();
    for (let step = 2; step < stops; step += 1) {
      await userEvent.tab();
      await expect(panel.contains(document.activeElement)).toBe(true);
    }
    await expect(lastRow).toHaveFocus();
    await userEvent.tab();
    await expect(name).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(lastRow).toHaveFocus();
  },
};

/** A link that stays on the story's page, as a router link does. */
function StayLink({ onClick, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      {...rest}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

/** Choosing a page closes the menu. */
export const PhoneLinkTap: Story = {
  ...phoneStory(390),
  args: { current: '/about', linkAs: StayLink },
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement);
    await userEvent.click(within(panel).getByRole('link', { name: 'Contact' }));
    await closedMenu(canvasElement);
  },
};

const NAVIGATE = 'sitenav-story:navigate';

/** A change of URL under the open menu (the back button) closes it. */
export const PhoneRouteChange: Story = {
  ...phoneStory(390),
  args: { current: '/projects', locationKey: '/projects/pas' },
  render: function RouteChangeStory(args) {
    const [locationKey, setLocationKey] = useState(args.locationKey);
    useEffect(() => {
      const onNavigate = () => setLocationKey('/projects');
      window.addEventListener(NAVIGATE, onNavigate);
      return () => window.removeEventListener(NAVIGATE, onNavigate);
    }, []);
    return <SiteNav {...args} locationKey={locationKey} />;
  },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    window.dispatchEvent(new Event(NAVIGATE));
    await waitFor(() => closedMenu(canvasElement));
  },
};

/** Reduced motion: the menu and its line appear at once. */
export const PhoneReduced: Story = {
  ...phoneStory(390),
  args: { current: '/about' },
  globals: { ...phoneStory(390).globals, motion: 'reduce' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(document.documentElement.dataset.motion).toBe('reduce'));
    const panel = await openMenu(canvasElement);
    await expect(getComputedStyle(panel).transitionDuration).toBe('0s');
    const line = panel.querySelector('[data-nav-menu-timeline]')!;
    for (const part of line.children) {
      await expect(getComputedStyle(part).transitionDuration).toBe('0s');
    }
    await expect(getComputedStyle(panel).opacity).toBe('1');
    await lineEndsAtCurrentRow(panel);
  },
};
