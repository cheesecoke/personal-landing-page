import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AboutContent } from '@cwc/content/hand';
import { palette } from '@cwc/tokens';
import { stumpRings } from '@cwc/ui';

import about from '../../content/hand/about.json';
import { AboutTemplate } from './AboutTemplate';

/*
 * Storybook does not serve the site's media, so the stories swap in drawings: the stump as its
 * traced rings, the portrait as two stills with no clips. Every word is the site's own.
 */
const svg = (viewBox: string, body: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`)}`;

const stump = svg(
  `0 0 ${stumpRings.viewBox.width} ${stumpRings.viewBox.height}`,
  `<rect width="100%" height="100%" fill="${palette.ground}"/><ellipse cx="992" cy="756" rx="430" ry="372" fill="${palette.raised}"/>` +
    stumpRings.rings
      .map(
        (ring) =>
          `<polygon points="${ring.points}" fill="none" stroke="${palette.tick}" stroke-width="3"/>`,
      )
      .join(''),
);

const still = (cyber: boolean) =>
  svg(
    '0 0 864 1080',
    `<rect width="864" height="1080" fill="${palette.ground}"/><ellipse cx="432" cy="1080" rx="380" ry="330" fill="${palette.raised}" stroke="${palette.tick}" stroke-width="2"/><ellipse cx="432" cy="470" rx="170" ry="215" fill="${palette.raised}" stroke="${palette.tick}" stroke-width="2"/><rect x="350" y="440" width="50" height="10" fill="${palette.ash}"/><rect x="470" y="440" width="50" height="10" fill="${cyber ? palette.signal : palette.ash}"/>`,
  );

const parsed = AboutContent.parse(about);
const portrait = parsed.person.portrait;
const clip = { ...portrait.clips.normalIdle };
const content: AboutContent = {
  ...parsed,
  rings: { ...parsed.rings, image: { ...parsed.rings.image, src: stump } },
  person: {
    ...parsed.person,
    portrait: {
      ...portrait,
      stills: {
        normal: { ...portrait.stills.normal, src: still(false) },
        cyber: { ...portrait.stills.cyber, src: still(true) },
      },
      // The real clips are not here: an empty source keeps the portrait on its stills.
      clips: {
        normalIdle: { ...clip, src: '' },
        cyberIdle: { ...clip, src: '' },
        normalGlance: { ...clip, src: '' },
        cyberGlance: { ...clip, src: '' },
        toCyber: { ...clip, src: '' },
        toNormal: { ...clip, src: '' },
      },
    },
  },
};

/** The About page, fed by the site's own hand content. */
const meta = {
  title: 'Templates/About',
  component: AboutTemplate,
  parameters: { layout: 'fullscreen' },
  args: { content },
  // The portrait's clips are stand-ins here, so every story holds it on its stills.
  globals: { motion: 'reduce' },
} satisfies Meta<typeof AboutTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No live data: there is no Now section, and the current job's ring opens with the hand-written
 * role line.
 */
export const NoLiveData: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 }).length).toBe(1);
    await expect(canvas.queryByRole('heading', { name: content.now.title })).toBeNull();
    await expect(canvasElement.querySelector('[data-current-role]')).toBeNull();
    await expect(canvasElement).not.toHaveTextContent('Latest from the log');
    // The newest chapter is open, with its link to the job page.
    const titan = canvas.getByRole('button', { name: /Titan Intake/ });
    await expect(titan).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'More about the work' })).toHaveAttribute(
      'href',
      '/work/titan-intake',
    );
    // The fire chapter opens to one paragraph.
    const fire = canvas.getByRole('button', { name: /Wildland fire/ });
    await userEvent.click(fire);
    const deep = canvasElement.querySelector(`#${fire.getAttribute('aria-controls')}`)!;
    await expect(deep.querySelectorAll('p').length).toBe(1);
    await expect(canvas.getByRole('navigation', { name: content.next.label })).toBeInTheDocument();
  },
};

/** With live data: the Now line with its month, and the role written from its start month. */
export const WithLiveData: Story = {
  args: {
    // Stand-in lines: nothing is published yet.
    now: { month: '2026-11', text: 'The line about this month goes here.' },
    currentRole: {
      role: { title: 'Senior Software Engineer, AI', org: 'Titan Intake', since: '2026-01' },
      sinceLabel: 'since',
    },
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: content.now.title })).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-current-role] time')).toHaveAttribute(
      'datetime',
      '2026-01',
    );
  },
};

/** One column: the stump above the chapters, the portrait above the text. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };
