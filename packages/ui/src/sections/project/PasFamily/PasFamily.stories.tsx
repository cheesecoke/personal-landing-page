import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Container } from '../../../layout';
import { placeholder } from '../internal/storyMedia';
import { PasFamily } from './PasFamily';

const meta = {
  title: 'Sections/Project/PasFamily',
  component: PasFamily,
  parameters: { layout: 'fullscreen' },
  // Copy from the PAS board; the image is a placeholder.
  args: {
    label: 'The PAS family',
    members: [
      {
        name: 'PAS',
        status: 'Daily use',
        line: 'My personal assistant system.',
        label: 'PAS, personal assistant system',
      },
      {
        name: 'Atti',
        status: 'Daily use',
        line: 'The assistant I text. It remembers, keeps my commitments and runs my day.',
        label: 'Open Atti, the assistant',
        href: '/projects/pas/atti',
      },
      {
        name: 'Lifebox',
        status: 'Experiment',
        line: 'One interface per person. Planned as Atti’s phone app.',
        label: 'Open Lifebox, the phone app experiment',
        href: '/projects/pas/lifebox',
      },
    ],
    figure: {
      image: {
        src: placeholder(1600, 1000, { subject: [90, 890] }),
        width: 1600,
        height: 1000,
        alt: 'Three visual directions for Life Inbox’s Now screen (Quiet Ink, Night Garden, Swiss Utility), design mockups.',
      },
      caption: 'Lifebox design mockups: three visual directions',
      crop: { top: 90, bottom: 890 },
    },
  },
  decorators: [
    (Story) => (
      <Container width="project" className="pb-16">
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof PasFamily>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The outer ring is selected to begin with. Each ring sets the readout. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'The PAS family' })).toBeVisible();
    const readout = canvasElement.querySelector('[aria-live="polite"]')!;
    await expect(readout).toHaveTextContent('PAS · Daily use');

    const outer = canvas.getByRole('button', { name: 'PAS, personal assistant system' });
    const atti = canvas.getByRole('link', { name: 'Open Atti, the assistant' });
    const lifebox = canvas.getByRole('link', { name: 'Open Lifebox, the phone app experiment' });
    await expect(outer).toHaveAttribute('aria-pressed', 'true');
    await expect(atti).toHaveAttribute('href', '/projects/pas/atti');
    await expect(atti).toHaveAttribute('aria-describedby', readout.id);

    await userEvent.hover(atti);
    await expect(readout).toHaveTextContent('Atti · Daily use');
    await expect(outer).toHaveAttribute('aria-pressed', 'false');

    // Keyboard: focus sets the readout too.
    lifebox.focus();
    await waitFor(() => expect(readout).toHaveTextContent('Lifebox · Experiment'));
    await expect(readout).toHaveTextContent('One interface per person.');

    await userEvent.click(outer);
    await expect(readout).toHaveTextContent('My personal assistant system.');
  },
};

/** Without the image: the rings and their readout alone. */
export const RingsOnly: Story = { args: { figure: undefined } };

/** On a phone the rings sit above the image. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    const readout = canvasElement.querySelector('[aria-live="polite"]')!.getBoundingClientRect();
    const figure = canvasElement.querySelector('figure')!.getBoundingClientRect();
    await expect(figure.top).toBeGreaterThanOrEqual(readout.bottom);
  },
};

/** Reduced motion: nothing ripples; the border and the connector change at once. */
export const Reduced: Story = {
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const ring = within(canvasElement).getByRole('link', { name: 'Open Atti, the assistant' });
    await expect(getComputedStyle(ring).transitionDuration).toBe('0s');
  },
};
