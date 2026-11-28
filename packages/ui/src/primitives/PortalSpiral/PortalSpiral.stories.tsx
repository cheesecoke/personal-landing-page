import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';

import { PORTAL_ACTIVE_RATE, PortalSpiral } from './PortalSpiral';

const meta = {
  title: 'Primitives/PortalSpiral',
  component: PortalSpiral,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PortalSpiral>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A box of a given shape for the spiral to fill. */
function Frame({ className, children }: { className: string; children: ReactNode }) {
  return <div className={className}>{children}</div>;
}

const svgOf = (root: HTMLElement) => root.querySelector('svg')!;

const ratesOf = (root: HTMLElement) =>
  svgOf(root)
    .getAnimations({ subtree: true })
    .map((animation) => animation.playbackRate);

/** At rest: a slow turn, rings drifting inward. */
export const Rest: Story = {
  render: (args) => (
    <Frame className="size-[min(80vw,480px)]">
      <PortalSpiral {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const svg = svgOf(canvasElement);
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    await expect(svg).toHaveAttribute('data-speed', 'rest');
  },
};

/** Active, as when the door is hovered or focused: the same drawing, four times as fast. */
export const Active: Story = {
  args: { speed: 'active' },
  render: Rest.render,
  play: async ({ canvasElement }) => {
    await expect(svgOf(canvasElement)).toHaveAttribute('data-speed', 'active');
    // Under the OS reduced-motion setting there is nothing to speed up.
    if (ratesOf(canvasElement).length === 0) return;
    await waitFor(
      () => expect(ratesOf(canvasElement).every((rate) => rate === PORTAL_ACTIVE_RATE)).toBe(true),
      { timeout: 3000 },
    );
  },
};

/** Hover or focus the doorway: the spiral eases up to speed and back down, without a jump. */
export const HoverToSpeedUp: Story = {
  render: function Render(args) {
    const [active, setActive] = useState(false);
    return (
      <a
        href="#contact"
        className="block size-[min(80vw,480px)] rounded-full"
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
      >
        <PortalSpiral {...args} speed={active ? 'active' : 'rest'} />
        <span className="sr-only">Contact</span>
      </a>
    );
  },
};

/** Reduced motion: a still frame, rings set at their places down the tunnel. */
export const ReducedMotion: Story = {
  render: Rest.render,
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(ratesOf(canvasElement)).toHaveLength(0));
  },
};

/** A tall doorway (1:2), clipped by its parent to an arch (outlined here): the tunnel stretches to fit. */
export const TallDoorway: Story = {
  render: (args) => (
    <Frame className="h-[min(80vh,640px)] w-[min(40vh,320px)] overflow-hidden rounded-t-full border border-hairline">
      <PortalSpiral {...args} />
    </Frame>
  ),
};

/** A round opening. */
export const Circle: Story = {
  render: (args) => (
    <Frame className="size-[min(80vw,360px)] overflow-hidden rounded-full">
      <PortalSpiral {...args} />
    </Frame>
  ),
};

/** At phone width, in a doorway that takes most of the screen. */
export const PhoneWidth: Story = {
  globals: { viewport: { value: 'phone' } },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="flex justify-center px-gutter py-8">
      <Frame className="aspect-[1/2] w-[min(100%,240px)] overflow-hidden rounded-t-full border border-hairline">
        <PortalSpiral {...args} />
      </Frame>
    </div>
  ),
};
