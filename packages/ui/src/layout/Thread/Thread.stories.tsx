import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Container } from '../Container/Container';
import { Thread, ThreadColumn, ThreadNode, ThreadScope, ThreadSection } from './Thread';

/**
 * The thread follows the reader. Scroll the story: the lit segment fills to 40% of the viewport,
 * the node there is `on`, the ones above are `past`, the ones below `next`. At the very bottom the
 * last node is `on`.
 */
const meta = {
  title: 'Layout/Thread',
  component: Thread,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Thread>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A stand-in for a section body: a label and a block of a given height. */
function Body({ title, height }: { title: string; height: number }) {
  return (
    <>
      <h2 className="type-label m-0 mb-4">{title}</h2>
      <div
        className="rounded-panel border border-hairline bg-surface"
        style={{ height: `${height}px` }}
      />
    </>
  );
}

const sections: { title: string; height: number }[] = [
  { title: 'Duo Decide', height: 520 },
  { title: 'Where it’s at', height: 640 },
  { title: 'Captain’s log', height: 760 },
  { title: 'Go deeper', height: 420 },
  { title: 'Next project', height: 120 },
];

/** A project page: the thread in the gutter, one node per section. */
function ProjectPage({ items = sections }: { items?: typeof sections }) {
  return (
    <ThreadScope hash={false}>
      <Container as="main">
        <ThreadColumn placement="gutter">
          <div className="type-label flex min-h-touch items-center pt-5">Projects / Duo Decide</div>
          <div className="relative pt-6 pb-16">
            <Thread placement="gutter" top={40} bottom={56} />
            {items.map((item, index) => (
              <ThreadSection
                key={item.title}
                aria-label={item.title}
                space={index === 0 ? 'none' : 'section'}
              >
                <Body {...item} />
              </ThreadSection>
            ))}
          </div>
        </ThreadColumn>
      </Container>
    </ThreadScope>
  );
}

const nodeStates = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('[data-thread-node]')]
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
    .map((node) => node.getAttribute('data-thread-state'));

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
/** The fill's scaleY, 0 to 1. */
const fillOf = (root: HTMLElement) =>
  Number(
    /scaleY\(([\d.]+)\)/.exec(
      root.querySelector<HTMLElement>('[data-thread-fill]')?.style.transform ?? '',
    )?.[1],
  );

/** Scroll 0: first node on. Scroll down: no node is skipped. Max scroll: last node on, rest past. */
async function followsTheReader({ canvasElement }: { canvasElement: HTMLElement }) {
  window.scrollTo(0, 0);
  await waitFor(() =>
    expect(nodeStates(canvasElement)).toEqual(['on', 'next', 'next', 'next', 'next']),
  );

  const max = maxScroll();
  await expect(max).toBeGreaterThan(window.innerHeight);
  let previous = 0;
  for (let y = 0; y <= max; y += 60) {
    window.scrollTo(0, y);
    await frame();
    await frame();
    const states = nodeStates(canvasElement);
    const on = states.indexOf('on');
    await expect(on - previous).toBeGreaterThanOrEqual(0);
    await expect(on - previous).toBeLessThanOrEqual(1);
    await expect(states.slice(0, on).every((state) => state === 'past')).toBe(true);
    await expect(states.slice(on + 1).every((state) => state === 'next')).toBe(true);
    previous = on;
  }

  window.scrollTo(0, max);
  await waitFor(() =>
    expect(nodeStates(canvasElement)).toEqual(['past', 'past', 'past', 'past', 'on']),
  );
  // The fill is complete at max scroll.
  await waitFor(() => expect(fillOf(canvasElement)).toBe(1));
  window.scrollTo(0, 0);
}

/** A tall project page. The play function scrolls it top to bottom. */
export const Default: Story = {
  render: () => <ProjectPage />,
  play: followsTheReader,
};

/** At 390 the thread sits 10px from the screen edge and the content starts 24px clear of it. */
export const Phone: Story = {
  render: () => <ProjectPage />,
  globals: { viewport: { value: 'phone' } },
};

/**
 * Reduced motion: no pulse, no easing, and the fill steps from node to node instead of following
 * the scroll. The node states still change, instantly.
 */
export const Reduced: Story = {
  render: () => <ProjectPage />,
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    await followsTheReader({ canvasElement });
    const node = canvasElement.querySelector('[data-thread-node]');
    const fill = canvasElement.querySelector('[data-thread-fill]');
    await waitFor(() => expect(document.documentElement.dataset.motion).toBe('reduce'));
    await expect(getComputedStyle(node!).transitionDuration).toBe('0s');
    await expect(getComputedStyle(fill!).transitionDuration).toBe('0s');
  },
};

/** A page that does not scroll shows the whole thread lit, with the last node on. */
export const ShortPage: Story = {
  render: () => (
    <ProjectPage
      items={[
        { title: 'Duo Decide', height: 80 },
        { title: 'Where it’s at', height: 80 },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(nodeStates(canvasElement)).toEqual(['past', 'on']));
    await waitFor(() => expect(fillOf(canvasElement)).toBe(1));
  },
};

/**
 * Projects, About, Beyond, Contact: the thread at the left of an indented column, with the nodes
 * on the rail itself. Here the rail stops 129px short of the column's foot, at its last node.
 */
export const Column: Story = {
  render: () => (
    <ThreadScope hash={false}>
      <Container as="main">
        <ThreadColumn placement="column">
          <Thread placement="column" bottom={129} fadeIn={2}>
            <ThreadNode placement="rail" top={52} />
            <ThreadNode placement="rail" bottom={0} />
          </Thread>
          <div className="pt-10">
            <h1 className="type-h1 m-0">Projects</h1>
          </div>
          <div className="pt-16">
            <Body title="Index" height={1400} />
          </div>
          <div className="pt-30 pb-24">
            <p className="type-label m-0">Next</p>
            <p className="type-h1 m-0 mt-3">About</p>
          </div>
        </ThreadColumn>
      </Container>
    </ThreadScope>
  ),
  play: async ({ canvasElement }) => {
    window.scrollTo(0, 0);
    await waitFor(() => expect(nodeStates(canvasElement)).toEqual(['on', 'next']));
    window.scrollTo(0, maxScroll());
    await waitFor(() => expect(nodeStates(canvasElement)).toEqual(['past', 'on']));
    window.scrollTo(0, 0);
  },
};

export const ColumnPhone: Story = {
  ...Column,
  play: undefined,
  globals: { viewport: { value: 'phone' } },
};

function EdgeSection({
  title,
  height,
  nodeTop,
}: {
  title: string;
  height: number;
  nodeTop: number;
}) {
  return (
    <ThreadSection placement="edge" aria-label={title} nodeTop={nodeTop} className="pt-10 pb-14">
      <Body title={title} height={height} />
    </ThreadSection>
  );
}

/** Home: the thread 36px left of the page column, on full-width sections. */
export const Edge: Story = {
  render: () => (
    <ThreadScope hash={false}>
      <ThreadColumn placement="edge">
        <Thread placement="edge" bottom={84} />
        <EdgeSection title="Proof" height={300} nodeTop={36} />
        <EdgeSection title="At work" height={700} nodeTop={36} />
        <EdgeSection title="Projects" height={700} nodeTop={36} />
        <EdgeSection title="Map" height={600} nodeTop={36} />
      </ThreadColumn>
    </ThreadScope>
  ),
};

export const EdgePhone: Story = { ...Edge, globals: { viewport: { value: 'phone' } } };

/** An expander changes the page height; the thread re-measures (ResizeObserver on the scope). */
function Growing({ children }: { children: ReactNode }) {
  return (
    <details className="type-body">
      <summary className="min-h-touch cursor-pointer">Open to make the page taller</summary>
      {children}
    </details>
  );
}

export const Remeasures: Story = {
  render: () => (
    <ThreadScope hash={false}>
      <Container as="main">
        <ThreadColumn placement="gutter">
          <div className="relative pt-6 pb-16">
            <Thread placement="gutter" top={40} bottom={56} />
            <ThreadSection aria-label="First" space="none">
              <h2 className="type-label m-0 mb-4">First</h2>
              <Growing>
                <div className="h-[1600px] rounded-panel border border-hairline bg-surface" />
              </Growing>
            </ThreadSection>
            <ThreadSection aria-label="Last">
              <Body title="Last" height={120} />
            </ThreadSection>
          </div>
        </ThreadColumn>
      </Container>
    </ThreadScope>
  ),
  play: async ({ canvasElement }) => {
    // Short page: everything lit.
    await waitFor(() => expect(nodeStates(canvasElement)).toEqual(['past', 'on']));
    canvasElement.querySelector('details')!.open = true;
    // Now it scrolls: at the top only the first node is on.
    await waitFor(() => expect(nodeStates(canvasElement)).toEqual(['on', 'next']));
    canvasElement.querySelector('details')!.open = false;
    await waitFor(() => expect(nodeStates(canvasElement)).toEqual(['past', 'on']));
  },
};
