import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { palette } from '@cwc/tokens';

import { Container, PageHeader, ThreadColumn } from '../../../layout';
import { BeyondSlots, type BeyondSlot } from './BeyondSlots';

/** A stand-in for the stump image: rings seen at an angle. The site passes the real image. */
const stump = () => {
  const rings = [60, 130, 200, 270, 340, 410]
    .map(
      (rx) =>
        `<ellipse cx="950" cy="500" rx="${rx}" ry="${rx * 0.42}" fill="none" stroke="${palette.tick}" stroke-width="2"/>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 900"><ellipse cx="950" cy="500" rx="450" ry="190" fill="${palette.raised}"/>${rings}</svg>`;
  return { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, width: 1500, height: 900 };
};

const slots: BeyondSlot[] = [
  {
    title: 'Work sessions',
    text: 'Screen and voice while I build my AI system. Long and calm.',
    icon: 'sessions',
  },
  {
    title: 'Clips',
    text: 'One moment from a session, 60 to 90 seconds, with a note.',
    icon: 'clips',
  },
  {
    title: 'References',
    text: 'The notes and links behind the work.',
    icon: 'references',
    confirm: 'what References holds',
  },
  {
    id: 'one-rep',
    title: 'One Rep',
    text: 'Ten reps between work sessions, and a simple way to log them.',
    icon: 'reps',
    size: 'sm',
  },
];

/**
 * The Beyond scene: placeholders for what the page will hold, each on an arc out from the stump.
 * The stories put the Beyond header above it, as on the page.
 */
const meta = {
  title: 'Sections/Pages/BeyondSlots',
  component: BeyondSlots,
  parameters: { layout: 'fullscreen' },
  args: { 'aria-label': 'What will be here', art: stump(), slots },
  decorators: [
    (Story) => (
      <main className="overflow-hidden pb-16">
        <Container className="relative z-1">
          <ThreadColumn placement="column">
            <PageHeader
              className="pt-10"
              title="Beyond"
              lead="Where I'll build in public: the real work, as it happens, including what fails."
              measure={36}
            />
          </ThreadColumn>
        </Container>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof BeyondSlots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scene = canvas.getByRole('region', { name: 'What will be here' });
    await expect(within(scene).getAllByRole('listitem').length).toBe(4);
    await expect(canvasElement.querySelector('#one-rep')).not.toBeNull();
    // Each slot is further right and higher than the one before it: they climb the arcs.
    const boxes = within(scene)
      .getAllByRole('listitem')
      .map((item) => item.getBoundingClientRect());
    for (let i = 1; i < boxes.length; i++) {
      await expect(boxes[i]!.left).toBeGreaterThan(boxes[i - 1]!.left);
      await expect(boxes[i]!.top).toBeLessThan(boxes[i - 1]!.top);
    }
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Everything confirmed: no marker. */
export const Confirmed: Story = {
  args: { slots: slots.map((slot) => ({ ...slot, confirm: undefined })) },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).not.toHaveTextContent('CONFIRM');
  },
};

/** Under 1180px the art is a band and the slots are a list under it. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const tops = within(canvasElement)
      .getAllByRole('listitem')
      .map((item) => item.getBoundingClientRect().top);
    for (let i = 1; i < tops.length; i++) await expect(tops[i]).toBeGreaterThan(tops[i - 1]!);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** With modern formats: the stump sits in a `<picture>` and is laid out exactly as without one. */
export const WithSources: Story = {
  args: { art: { ...stump(), sources: [{ src: stump().src, type: 'image/svg+xml' }] } },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('picture > img')!;
    await expect(canvasElement.querySelector('picture > source')).toBeTruthy();
    await expect(img.getBoundingClientRect().width).toBeGreaterThan(200);
  },
};

/** Reduced motion: every point is lit and still. */
export const Reduced: Story = {
  globals: { motion: 'reduce', viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const light = canvasElement.querySelector('[class*="pointLight"]')!;
    await expect(getComputedStyle(light).animationName).toBe('none');
    await expect(getComputedStyle(light).opacity).toBe('1');
  },
};
