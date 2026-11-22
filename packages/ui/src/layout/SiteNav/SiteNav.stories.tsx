import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
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
  args: { name: 'Chase Cole', label: 'Site', items, current: '/' },
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

/** Under `md` the name has its own row and the links spread across the row below. */
export const Phone: Story = {
  args: { current: '/projects' },
  globals: { viewport: { value: 'phone' } },
};

/** Home on a phone: the name is on its own row, so the line is hidden. */
export const PhoneHome: Story = { globals: { viewport: { value: 'phone' } } };

export const Tablet: Story = {
  args: { current: '/about' },
  globals: { viewport: { value: 'tablet' } },
};
