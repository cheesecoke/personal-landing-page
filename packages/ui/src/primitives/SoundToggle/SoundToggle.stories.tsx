import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SoundToggle, type SoundToggleProps } from './SoundToggle';

const labels = {
  label: 'Sound',
  on: 'Sound on',
  off: 'Sound off',
  unavailable: 'Sound unavailable',
};

/** Holds `on` itself, as a page would. */
function Stateful(props: SoundToggleProps) {
  const [on, setOn] = useState(props.on);
  return (
    <SoundToggle
      {...props}
      on={on}
      onToggle={() => {
        props.onToggle();
        setOn((value) => !value);
      }}
    />
  );
}

const meta = {
  title: 'Primitives/SoundToggle',
  component: SoundToggle,
  args: { on: true, labels, onToggle: fn() },
  render: (args) => <Stateful {...args} />,
} satisfies Meta<typeof SoundToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

const button = (root: HTMLElement) => within(root).getByRole('button', { name: 'Sound' });

/** On: the speaker with its waves, pressed. A press turns it off; the name stays "Sound". */
export const On: Story = {
  play: async ({ canvasElement, args }) => {
    const b = button(canvasElement);
    await expect(b).toHaveAttribute('aria-pressed', 'true');
    await expect(b).toHaveAttribute('title', 'Sound on');
    await expect(b.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await expect(b.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.click(b);
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
    await expect(b).toHaveAttribute('aria-pressed', 'false');
    await expect(b).toHaveAttribute('title', 'Sound off');
    await expect(b).toHaveAccessibleName('Sound');
  },
};

/** Off: a cross where the waves were. */
export const Off: Story = { args: { on: false } };

/** Without a border, for the site header. */
export const Plain: Story = { args: { variant: 'plain' } };

/** Nothing can play: shows off, says so in the tooltip, and does nothing. */
export const Unavailable: Story = {
  args: { available: false },
  play: async ({ canvasElement, args }) => {
    const b = button(canvasElement);
    await expect(b).toHaveAttribute('aria-pressed', 'false');
    await expect(b).toHaveAttribute('aria-disabled', 'true');
    await expect(b).toHaveAttribute('title', 'Sound unavailable');
    await userEvent.click(b);
    await expect(args.onToggle).not.toHaveBeenCalled();
  },
};

/** Keyboard focus shows the Signal outline. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const b = button(canvasElement);
    await expect(b).toHaveFocus();
    await expect(getComputedStyle(b).outlineStyle).not.toBe('none');
  },
};

/** The shortcut presses it from anywhere, but not while typing or with a modifier held. */
export const Shortcut: Story = {
  args: { shortcut: 'm' },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Stateful {...args} />
      <input aria-label="A field" className="border border-hairline p-2 text-primary" />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const b = button(canvasElement);
    await userEvent.keyboard('m');
    await expect(b).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard('M');
    await expect(b).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Control>}m{/Control}');
    await expect(b).toHaveAttribute('aria-pressed', 'true');
    await userEvent.type(within(canvasElement).getByRole('textbox'), 'mm');
    await expect(b).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onToggle).toHaveBeenCalledTimes(2);
  },
};

/** Two buttons with the same shortcut (the header's, and the game's over it): one press, one toggle. */
export const ShortcutStacked: Story = {
  args: { shortcut: 'm' },
  render: (args) => (
    <div className="flex gap-4">
      <Stateful {...args} data-under="" />
      <Stateful {...args} data-over="" />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    await userEvent.keyboard('m');
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
    await expect(canvasElement.querySelector('[data-over]')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(canvasElement.querySelector('[data-under]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
