import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { FieldNotes } from '../FieldNotes/FieldNotes';
import { rules } from '../FieldNotes/FieldNotes.stories';
import { StoryPage } from '../internal/StoryPage';
import { Portrait } from '../Portrait/Portrait';
import { cyberLook, normalLook, portraitCopy } from '../Portrait/Portrait.fixtures';
import { AboutIntro } from './AboutIntro';

/**
 * The person on About: the portrait, who he is, what he does outside work, and the rules he works
 * by. The portrait and the rules are passed in.
 */
const meta = {
  title: 'Sections/Pages/AboutIntro',
  component: AboutIntro,
  parameters: { layout: 'fullscreen' },
  args: {
    'aria-label': 'Outside work and rules I work by',
    portrait: <Portrait normal={normalLook} cyber={cyberLook} {...portraitCopy} />,
    lead: 'Software engineer since 2014, with some time on a wildland fire crew along the way. I build products people use, developer tools, and AI systems. My background is web, and I keep learning outward from it: backend systems, hardware, networking, and how they all fit together.',
    body: "Outside work I balance being active with being still. In Colorado that means hiking, running and biking. I've trained in martial arts for years, most recently aikido, and I keep a Zen meditation practice. I travel often, and I'm just as happy at home or at dinner with friends.",
    children: <FieldNotes title="Rules I work by" notes={rules} />,
  },
  decorators: [
    (Story) => (
      <StoryPage>
        <div className="pt-16">
          <Story />
        </div>
      </StoryPage>
    ),
  ],
} satisfies Meta<typeof AboutIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('region', { name: 'Outside work and rules I work by' }),
    ).toBeInTheDocument();
    // Side by side: the text starts to the right of the portrait.
    const figure = canvasElement.querySelector('figure')!.getBoundingClientRect();
    const rulesBox = canvas.getByRole('list', { name: 'Rules I work by' }).getBoundingClientRect();
    await expect(rulesBox.left).toBeGreaterThan(figure.right);
  },
};

/** One column: the portrait, then the text. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' }, motion: 'reduce' },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const figure = canvasElement.querySelector('figure')!.getBoundingClientRect();
    const list = within(canvasElement).getByRole('list', { name: 'Rules I work by' });
    await expect(list.getBoundingClientRect().top).toBeGreaterThan(figure.bottom);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** Reduced motion: the portrait is a still and nothing else moves. */
export const Reduced: Story = { globals: { motion: 'reduce' } };
