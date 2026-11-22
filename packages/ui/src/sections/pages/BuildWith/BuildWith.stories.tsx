import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StoryPage } from '../internal/StoryPage';
import { BuildWith } from './BuildWith';

/** "What I build with" on About: the agent tools on a rail, from tried to current. */
const meta = {
  title: 'Sections/Pages/BuildWith',
  component: BuildWith,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'What I build with',
    listLabel: 'Agent tools, from tried to current',
    stageLabels: { tried: 'Tried', also: 'Also', current: 'Current' },
    tools: [
      { name: 'Warp', stage: 'tried' },
      { name: 'Codex', stage: 'also' },
      { name: 'Claude app', stage: 'also' },
      { name: 'Claude Code', stage: 'current' },
      { name: 'Herdr', stage: 'current' },
    ],
    facts: [{ label: 'Editor', value: 'Neovim with LazyVim' }],
    link: { label: 'Let me know what else I should try.', href: '/contact' },
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
} satisfies Meta<typeof BuildWith>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Agent tools, from tried to current' });
    const items = within(list).getAllByRole('listitem');
    await expect(items.length).toBe(5);
    // Each tool names its stage in text, whether or not the stage row is showing.
    await expect(items[0]).toHaveTextContent('Warp Tried');
    await expect(items[4]).toHaveTextContent('Herdr Current');
    await expect(canvas.getByRole('link', { name: /what else I should try/ })).toHaveAttribute(
      'href',
      '/contact',
    );
  },
};

/** In a narrow slot the rail runs down the side and each tool shows its stage beside its name. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const list = within(canvasElement).getByRole('list', { name: /Agent tools/ });
    const [first, second] = within(list).getAllByRole('listitem');
    await expect(second!.getBoundingClientRect().top).toBeGreaterThan(
      first!.getBoundingClientRect().top,
    );
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };

/** Only the rail: no facts and no link. */
export const RailOnly: Story = { args: { facts: undefined, link: undefined } };
