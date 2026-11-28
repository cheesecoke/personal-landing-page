import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog';

/** A trigger and the dialog it opens, with the open state held here as a page would. */
function Demo(args: ConfirmDialogProps) {
  const [open, setOpen] = useState(args.open);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="p-6">
      <button
        ref={trigger}
        type="button"
        data-demo-trigger=""
        className="min-h-touch cursor-pointer border border-hairline bg-transparent px-4 type-button text-primary"
        onClick={() => setOpen(true)}
      >
        Open the dialog
      </button>
      <ConfirmDialog
        {...args}
        open={open}
        returnFocusRef={trigger}
        onConfirm={() => {
          setOpen(false);
          args.onConfirm();
        }}
        onCancel={() => {
          setOpen(false);
          args.onCancel();
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Primitives/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    open: false,
    title: 'Step through?',
    body: "The portal's been running all day. Nobody seems to know where it goes.",
    confirmLabel: 'Enter',
    cancelLabel: 'Not now',
    onConfirm: fn(),
    onCancel: fn(),
  },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const trigger = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('[data-demo-trigger]')!;
const dialogOf = (root: HTMLElement) =>
  root.ownerDocument.querySelector<HTMLDialogElement>('[data-confirm-dialog]')!;

/** Opens it from the trigger and checks what an open dialog must be. */
async function openDialog(root: HTMLElement) {
  await userEvent.click(trigger(root));
  const dialog = dialogOf(root);
  await expect(dialog.open).toBe(true);
  await expect(dialog.matches(':modal')).toBe(true);
  const panel = within(dialog);
  await expect(dialog).toHaveAccessibleName('Step through?');
  await expect(dialog).toHaveAccessibleDescription(
    "The portal's been running all day. Nobody seems to know where it goes.",
  );
  await expect(panel.getByRole('button', { name: 'Enter' })).toHaveFocus();
  await expect(root.ownerDocument.documentElement.style.overflow).toBe('hidden');
  for (const button of panel.getAllByRole('button')) {
    await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  }
  return dialog;
}

async function closed(root: HTMLElement) {
  await waitFor(() => expect(dialogOf(root).open).toBe(false));
  await expect(trigger(root)).toHaveFocus();
  await expect(root.ownerDocument.documentElement.style.overflow).toBe('');
}

/** Closed: nothing shows but the trigger. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    await expect(dialogOf(canvasElement).open).toBe(false);
  },
};

/** Open, as the reader sees it: focus on the primary answer. */
export const Open: Story = {
  args: { open: true },
  play: async ({ canvasElement }) => {
    const dialog = dialogOf(canvasElement);
    await expect(dialog.open).toBe(true);
    await expect(within(dialog).getByRole('button', { name: 'Enter' })).toHaveFocus();
  },
};

/** The primary answer closes it and reports the confirm. */
export const Confirm: Story = {
  play: async ({ args, canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enter' }));
    await closed(canvasElement);
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(args.onCancel).not.toHaveBeenCalled();
  },
};

/** The quiet answer cancels. */
export const CancelButton: Story = {
  play: async ({ args, canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Not now' }));
    await closed(canvasElement);
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

/** Escape cancels. */
export const Escape: Story = {
  play: async ({ args, canvasElement }) => {
    await openDialog(canvasElement);
    await userEvent.keyboard('{Escape}');
    await closed(canvasElement);
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};

/** A click on the dimmed page behind cancels; a click inside the panel does not. */
export const Backdrop: Story = {
  play: async ({ args, canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(within(dialog).getByRole('heading'));
    await expect(dialog.open).toBe(true);
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: dialog,
      coords: { clientX: 4, clientY: 4 },
    });
    await closed(canvasElement);
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};

/** On a phone the panel keeps a gutter each side and nothing scrolls sideways. */
export const Phone: Story = {
  args: { open: true },
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    const box = dialogOf(canvasElement).getBoundingClientRect();
    await expect(box.left).toBeGreaterThanOrEqual(16);
    await expect(box.right).toBeLessThanOrEqual(window.innerWidth - 16);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Reduced motion: it appears at once, with no fade or rise. */
export const Reduced: Story = {
  args: { open: true },
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const dialog = dialogOf(canvasElement);
    // The toolbar switch lands on the root just after the story mounts; then nothing moves.
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-motion', 'reduce'));
    await expect(getComputedStyle(dialog).transitionDuration).toBe('0s');
    await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'));
    await expect(getComputedStyle(dialog).translate).toBe('none');
  },
};
