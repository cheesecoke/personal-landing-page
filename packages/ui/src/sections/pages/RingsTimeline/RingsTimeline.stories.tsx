import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { StoryPage } from '../internal/StoryPage';
import { RingsTimeline, type RingsChapter } from './RingsTimeline';
import { chapters, ending, stumpArt } from './RingsTimeline.fixtures';

/**
 * The About chapters as growth rings. Select a chapter: its rings light on the image, its details
 * open, and a dotted connector runs from the end of the lit leader to the chapter's marker.
 */
const meta = {
  title: 'Sections/Pages/RingsTimeline',
  component: RingsTimeline,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Rings',
    lead: 'One ring for each chapter, from the center out. Select a ring for the details.',
    art: stumpArt,
    items: chapters,
    ending,
  },
  decorators: [
    (Story) => (
      <StoryPage>
        <Story />
      </StoryPage>
    ),
  ],
} satisfies Meta<typeof RingsTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = (element: Element) => element.getBoundingClientRect();

/**
 * The connector is one circle on the end of the lit leader, and its line ends level with the
 * chapter's marker. Returns how far off each of those is, in px.
 */
function connectorOffsets(root: HTMLElement, id: string) {
  const group = root.querySelector(`[data-ring-connector="${id}"]`)!;
  const circles = group.querySelectorAll('circle');
  const dot = box(circles[0]!);
  const leader = box(root.querySelector(`[data-ring-leader="${id}"] line`)!);
  const marker = box(root.querySelector(`[data-ring-marker="${id}"]`)!);
  const path = box(group.querySelector('path[mask]')!);
  return {
    circles: circles.length,
    startX: Math.abs(dot.left + dot.width / 2 - leader.right),
    startY: Math.abs(dot.top + dot.height / 2 - (leader.top + leader.height / 2)),
    // The line runs up or down to the marker's row, so one end of its box is level with it.
    endY: Math.min(
      Math.abs(path.bottom - (marker.top + marker.height / 2)),
      Math.abs(path.top - (marker.top + marker.height / 2)),
    ),
    endX: marker.left - path.right,
  };
}

async function expectAligned(root: HTMLElement, id: string) {
  await waitFor(() => expect(root.querySelector(`[data-ring-connector="${id}"]`)).not.toBeNull());
  await waitFor(() => {
    const off = connectorOffsets(root, id);
    expect(off.circles).toBe(1);
    expect(off.startX).toBeLessThanOrEqual(1.5);
    expect(off.startY).toBeLessThanOrEqual(1.5);
    expect(off.endY).toBeLessThanOrEqual(1.5);
    // The line stops at the marker's edge (up to its 4px ring), never past it.
    expect(off.endX).toBeGreaterThanOrEqual(-0.5);
    expect(off.endX).toBeLessThanOrEqual(5);
  });
}

const direction = (root: HTMLElement, id: string) =>
  root.querySelector(`[data-ring-connector="${id}"]`)?.getAttribute('data-direction');

/**
 * Stacked, the chapters sit below the image: the leader leaves the ring heading down, the one
 * circle sits on its lower end, and the dotted line runs on from the circle to the marker.
 */
async function expectAlignedDown(root: HTMLElement, id: string) {
  await waitFor(() => expect(direction(root, id)).toBe('down'));
  await waitFor(() => {
    const group = root.querySelector(`[data-ring-connector="${id}"]`)!;
    const circles = group.querySelectorAll('circle');
    const dot = box(circles[0]!);
    const dotX = dot.left + dot.width / 2;
    const dotY = dot.top + dot.height / 2;
    const leaderGroup = root.querySelector(`[data-ring-leader="${id}"]`)!;
    const line = leaderGroup.querySelector('line')!;
    const leader = box(line);
    const ringDot = box(leaderGroup.querySelector('circle')!);
    const marker = box(root.querySelector(`[data-ring-marker="${id}"]`)!);
    const markerY = marker.top + marker.height / 2;
    const path = box(group.querySelector('path[mask]')!);
    const image = box(root.querySelector('img')!.closest('[style*="aspect-ratio"]')!);

    expect(circles.length).toBe(1);
    // The leader is vertical and ends below its start, which is on the ring.
    expect(leader.width).toBeLessThanOrEqual(0.5);
    expect(line.y2.baseVal.value).toBeGreaterThan(line.y1.baseVal.value);
    expect(Math.abs(ringDot.top + ringDot.height / 2 - leader.top)).toBeLessThanOrEqual(1.5);
    // The circle is centred on the leader's lower end, inside the image, above the marker.
    expect(Math.abs(dotX - leader.left)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(dotY - leader.bottom)).toBeLessThanOrEqual(1.5);
    expect(dotY).toBeLessThanOrEqual(image.bottom);
    expect(dotY).toBeLessThan(marker.top);
    // The dotted line starts at the circle's centre and comes down to the marker's row, level
    // with the marker, stopping at its edge (up to its 4px ring) and never past it.
    expect(Math.abs(path.top - dotY)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(path.right - dotX)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(path.bottom - markerY)).toBeLessThanOrEqual(1.5);
    expect(path.left).toBeLessThan(marker.left);
    const d = group.querySelector('path[mask]')!.getAttribute('d')!;
    const endX =
      Number(/H(-?[\d.]+)$/.exec(d)![1]) +
      box(root.querySelector('svg[data-ring-connectors]')!).left;
    expect(marker.left - endX).toBeGreaterThanOrEqual(-0.5);
    expect(marker.left - endX).toBeLessThanOrEqual(5);
  });
}

/** The newest chapter is selected and open, as on the board. */
export const Default: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /Titan Intake/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expectAligned(canvasElement, 'titan-intake');
    // Beside the image the leader points right: it is level, and it ends right of its start.
    await expect(direction(canvasElement, 'titan-intake')).toBe('right');
    const line = canvasElement.querySelector<SVGLineElement>(
      '[data-ring-leader="titan-intake"] line',
    )!;
    await expect(line.y2.baseVal.value).toBe(line.y1.baseVal.value);
    await expect(line.x2.baseVal.value).toBeGreaterThan(line.x1.baseVal.value);
    // Only the selected chapter's connector shows.
    await expect(canvasElement.querySelectorAll('[data-ring-connector][data-on]').length).toBe(1);
  },
};

/** The fire chapter lights in Ember: its ring, the scar on it, the leader and the connector. */
export const WildlandFire: Story = {
  args: { defaultSelected: 'wildland-fire' },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await expectAligned(canvasElement, 'wildland-fire');
  },
};

/** A chapter can span several rings: the roots light the two at the centre. */
export const Roots: Story = {
  args: { defaultSelected: 'roots' },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await expectAligned(canvasElement, 'roots');
    await expect(canvasElement.querySelectorAll('polygon[class*="on"]').length).toBe(2);
  },
};

/** Selecting moves the light and the connector; selecting the open chapter again closes it. */
export const Select: Story = {
  globals: { viewport: { value: 'desktop' }, motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const truecar = canvas.getByRole('button', { name: /TrueCar/ });
    await userEvent.click(truecar);
    await expect(truecar).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: /Titan Intake/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expectAligned(canvasElement, 'truecar');
    await userEvent.click(truecar);
    await expect(truecar).toHaveAttribute('aria-expanded', 'false');
    await expectAligned(canvasElement, 'truecar');
  },
};

/** Nothing open: the list at its shortest. */
export const Closed: Story = { args: { defaultOpen: false } };

const withLatest = chapters.map((item) =>
  item.id === 'titan-intake'
    ? ({
        ...item,
        latest: {
          label: 'Latest from the log · October 2026',
          // A stand-in line: the log this slot reads from is not published.
          text: 'The newest line from this chapter’s log goes here.',
          link: { label: 'The monthly log', href: '/work/titan-intake#log' },
        },
      } as RingsChapter)
    : item,
);

/** A chapter with a log shows its newest line under the row. Without one, the slot is not there. */
export const WithLatest: Story = { args: { items: withLatest } };

/**
 * With modern formats: the image sits in a `<picture>` and is laid out exactly as without one.
 */
export const WithSources: Story = {
  args: { art: { ...stumpArt, sources: [{ src: stumpArt.src, type: 'image/svg+xml' }] } },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('picture > img')!;
    await expect(canvasElement.querySelector('picture > source')).toHaveAttribute(
      'srcset',
      stumpArt.src,
    );
    // The traced rings are placed by the same rule as the image, so the two must coincide.
    const traced = canvasElement.querySelector('svg[class*="artSvg"]')!.getBoundingClientRect();
    const drawn = img.getBoundingClientRect();
    await expect(drawn.width).toBeGreaterThan(200);
    await expect(Math.abs(drawn.left - traced.left)).toBeLessThan(1);
    await expect(Math.abs(drawn.top - traced.top)).toBeLessThan(1);
    await expect(Math.abs(drawn.width - traced.width)).toBeLessThan(1);
  },
};

/** Reduced motion: rings, leader and connector switch at once; the open ring's dot does not breathe. */
export const Reduced: Story = {
  globals: { motion: 'reduce', viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-ring-connector="titan-intake"]');
    await waitFor(() => expect(group).not.toBeNull());
    await expect(
      getComputedStyle(canvasElement.querySelector('[data-ring-connector]')!).transitionDuration,
    ).toBe('0s');
  },
};

/**
 * Stacked (a narrow slot): the image sits above the list, so the leader points down and the
 * connector runs down to the selected chapter's marker.
 */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expectAlignedDown(canvasElement, 'titan-intake');
    await expect(canvasElement.querySelectorAll('[data-ring-connector][data-on]').length).toBe(1);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Stacked, the fire chapter: the downward leader and its connector are Ember too. */
export const StackedWildlandFire: Story = {
  args: { defaultSelected: 'wildland-fire' },
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expectAlignedDown(canvasElement, 'wildland-fire');
    const stroke = (selector: string) =>
      getComputedStyle(canvasElement.querySelector(selector)!).stroke;
    const ember = stroke('[data-ring-connector="wildland-fire"] path[mask]');
    await expect(ember).not.toBe(stroke('[data-ring-connector="titan-intake"] path[mask]'));
    await expect(stroke('[data-ring-leader="wildland-fire"] line')).toBe(ember);
  },
};

/** Stacked: the connector follows the selection, and a chapter opening or closing above it. */
export const StackedSelect: Story = {
  globals: { viewport: { value: 'phone' }, motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const truecar = canvas.getByRole('button', { name: /TrueCar/ });
    await userEvent.click(truecar);
    await expectAlignedDown(canvasElement, 'truecar');
    await userEvent.click(truecar);
    await expectAlignedDown(canvasElement, 'truecar');
    await userEvent.click(canvas.getByRole('button', { name: /Roots/ }));
    await expectAlignedDown(canvasElement, 'roots');
    await expect(
      getComputedStyle(canvasElement.querySelector('[data-ring-connector="roots"]')!)
        .transitionDuration,
    ).toBe('0s');
  },
};

/** At tablet width the slot is still narrow, so this is the stacked layout too. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
  play: async ({ canvasElement }) => {
    await expectAlignedDown(canvasElement, 'titan-intake');
  },
};
