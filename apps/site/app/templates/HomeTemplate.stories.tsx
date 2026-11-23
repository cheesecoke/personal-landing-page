import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { HomeContent } from '@cwc/content/hand';
import { palette } from '@cwc/tokens';

import home from '../../content/hand/home.json';
import { HomeTemplate } from './HomeTemplate';

/*
 * Storybook does not serve the site's media, so the stories swap in drawings: the stump as a few
 * rings, each plate as a blank sheet. Every word, frame and crop is the site's own.
 */
const svg = (width: number, height: number, body: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${palette.ground}"/>${body}</svg>`)}`;

const rings = (cx: number, cy: number, rx: number, ry: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${palette.raised}"/>` +
  [1, 0.8, 0.6, 0.4, 0.2]
    .map(
      (t, index) =>
        `<ellipse cx="${cx}" cy="${cy}" rx="${rx * t}" ry="${ry * t}" fill="none" stroke="${index === 2 ? palette.ember : palette.signal}" stroke-width="3" opacity="0.6"/>`,
    )
    .join('');

const sheet = svg(
  1200,
  900,
  `<rect x="60" y="60" width="1080" height="780" fill="${palette.raised}" stroke="${palette.tick}" stroke-width="2"/>`,
);

const parsed = HomeContent.parse(home);
const { stump } = parsed.hero;
const content: HomeContent = {
  ...parsed,
  hero: {
    ...parsed.hero,
    stump: {
      ...stump,
      wide: { ...stump.wide, src: svg(2400, 1500, rings(1621, 742, 449, 210)), sources: undefined },
      wideLit: {
        ...stump.wideLit,
        src: svg(2400, 1500, rings(1621, 742, 449, 210)),
        sources: undefined,
      },
      phone: {
        ...stump.phone,
        src: svg(1170, 1400, rings(572, 860, 330, 150)),
        sources: undefined,
      },
    },
  },
  ownTime: {
    ...parsed.ownTime,
    plates: parsed.ownTime.plates.map((plate) => ({
      ...plate,
      image: { ...plate.image, src: sheet },
    })),
  },
};

/** The Home page, fed by the site's own hand content. */
const meta = {
  title: 'Templates/Home',
  component: HomeTemplate,
  parameters: { layout: 'fullscreen' },
  args: { content },
  decorators: [
    (Story) => (
      <div className="overflow-x-clip">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HomeTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A stand-in for the tree teaser, which is another package's component. */
const map = (
  <div className="h-[360px] rounded-panel border border-dashed border-hairline md:h-[460px]" />
);

/**
 * No live data and no tree: every status and number is the hand one, no fact carries a date, no
 * plate carries a new mark, and there is no empty map section.
 */
export const NoLiveData: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
      parsed.hero.headline.join(''),
    );
    await expect(canvasElement.querySelectorAll('time')).toHaveLength(0);
    await expect(canvasElement.querySelectorAll('[data-new-label]')).toHaveLength(0);
    await expect(canvas.queryByRole('heading', { name: parsed.map.title })).toBeNull();
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(3);
    await expect(canvas.getByRole('region', { name: parsed.next.label })).toBeInTheDocument();
  },
};

/** With live data: statuses and counted facts from it, the facts dated, one plate newly changed. */
export const WithLiveData: Story = {
  args: {
    map,
    live: {
      status: {
        atti: { label: 'Daily use', tone: 'live' },
        pas: { label: 'Daily use', tone: 'live' },
        'duo-decide': { label: 'Live', tone: 'live' },
      },
      facts: {
        'atti/commits-by-atti': { value: '181', asOf: '2026-11-20' },
        'duo-decide/test-cases': { value: '1,167', asOf: '2026-11-20' },
      },
    },
    fresh: { pas: { ageDays: 2, lifeDays: 14 } },
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('time')).toHaveLength(2);
    await expect(canvas.getByText('181')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(4);
    await expect(canvas.getByRole('link', { name: parsed.map.mapLinkLabel })).toBeInTheDocument();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[data-new-label]').length).toBeGreaterThan(0),
    );
  },
};

export const Phone: Story = {
  args: { map },
  globals: { viewport: { value: 'phone' } },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const Tablet: Story = { args: { map }, globals: { viewport: { value: 'tablet' } } };

/** Reduced motion: the overlay is drawn and still, no light travels. */
export const Reduced: Story = { args: { map }, globals: { motion: 'reduce' } };
