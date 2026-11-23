import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { SiteNav } from '../../../layout';
import { heroCopy, heroProjects, heroRings } from '../internal/homeCopy';
import { stumpPhoneArt, stumpWideArt, stumpWideLitArt } from '../internal/storyArt';
import { StumpHero } from './StumpHero';

const meta = {
  title: 'Sections/Home/StumpHero',
  component: StumpHero,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: heroCopy.eyebrow,
    headline: heroCopy.headline,
    underline: heroCopy.underline,
    lead: heroCopy.lead,
    primaryAction: heroCopy.primaryAction,
    secondaryAction: heroCopy.secondaryAction,
    image: stumpWideArt,
    litImage: stumpWideLitArt,
    phoneImage: { ...stumpPhoneArt, alt: heroCopy.phoneAlt },
    projects: heroProjects,
    rings: heroRings,
    projectsLabel: heroCopy.projectsLabel,
  },
} satisfies Meta<typeof StumpHero>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The wide hero: the stump right of centre, project nodes and ring callouts over it. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
      'What I’ve built,and what’sstill growing.',
    );
    // Every project is a link, both as a floating callout and as a row in the phone list.
    for (const project of heroProjects) {
      const links = canvasElement.querySelectorAll(`a[href="${project.href}"]`);
      await expect(links).toHaveLength(2);
      for (const link of links) await expect(link).toHaveTextContent(project.status);
    }
    // The line under the last word ends just past the full stop.
    await waitFor(async () => {
      const line = canvasElement.querySelector<HTMLElement>('[data-headline-line]');
      await expect(line).not.toBeNull();
      const end = canvasElement.querySelector<HTMLElement>('[data-headline-end]')!;
      const size = parseFloat(getComputedStyle(end.parentElement!).fontSize);
      const gap = line!.getBoundingClientRect().right - end.getBoundingClientRect().left;
      await expect(Math.abs(gap - 0.06 * size)).toBeLessThanOrEqual(1);
    });
  },
};

/** As on the board: the site nav sits inside the hero and the stump runs behind it. */
export const WithNav: Story = {
  args: {
    nav: (
      <SiteNav
        name="Chase Cole"
        label="Site"
        menu={{ open: 'Menu', close: 'Close', home: 'Home' }}
        current="/"
        items={[
          { label: 'Projects', href: '/projects' },
          { label: 'About', href: '/about' },
          { label: 'Beyond', href: '/beyond', quiet: true },
          { label: 'Contact', href: '/contact' },
        ]}
      />
    ),
  },
};

export const WithNavPhone: Story = { ...WithNav, globals: { viewport: { value: 'phone' } } };

/** Status words are data: change them and the callouts and the phone list follow. */
export const StatusFromData: Story = {
  args: {
    projects: heroProjects.map((project, index) =>
      index === 3 ? { ...project, status: 'Daily use', dot: 'live' as const } : project,
    ),
  },
  play: async ({ canvasElement }) => {
    const links = canvasElement.querySelectorAll('a[href="/projects/duo-decide"]');
    for (const link of links) await expect(link).toHaveTextContent('Daily use');
  },
};

/** Projects only: no ring callouts, and no line under the headline. */
export const ProjectsOnly: Story = { args: { rings: [], underline: undefined } };

/** 768 wide: under 900px the phone render and the list take over. */
export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** 390 wide: the `stump-phone` variant, with the projects as a list under the render. */
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };

/** Reduced motion: the overlay is drawn and still, the line is in place, no light travels. */
export const Reduced: Story = {
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const drawn = canvasElement.querySelector('path[pathLength]')!;
    await waitFor(() => expect(getComputedStyle(drawn).animationName).toBe('none'));
  },
};

const withSource = <Art extends { src: string }>(art: Art) => ({
  ...art,
  sources: [{ src: art.src, type: 'image/svg+xml' }],
});

/**
 * With modern formats: each render sits in a `<picture>` and still fills the stage exactly, under
 * the drawn overlay.
 */
export const WithSources: Story = {
  args: {
    image: withSource(stumpWideArt),
    litImage: withSource(stumpWideLitArt),
    phoneImage: { ...withSource(stumpPhoneArt), alt: heroCopy.phoneAlt },
  },
  play: async ({ canvasElement }) => {
    const images = [...canvasElement.querySelectorAll('picture > img')];
    await expect(images.length).toBe(3);
    const wide = images[0]!.getBoundingClientRect();
    const stage = images[0]!.closest('picture')!.parentElement!.getBoundingClientRect();
    await expect(wide.width).toBeGreaterThan(200);
    await expect(Math.abs(wide.width - stage.width)).toBeLessThan(1);
    await expect(Math.abs(wide.height - stage.height)).toBeLessThan(1);
    await expect(Math.abs(wide.left - stage.left)).toBeLessThan(1);
  },
};

export const PhoneReduced: Story = {
  globals: { viewport: { value: 'phone' }, motion: 'reduce' },
};
