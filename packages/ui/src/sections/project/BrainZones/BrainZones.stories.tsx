import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { ProjectStateBadge } from '../../../primitives';
import { HeroDrawn, ProjectOpening } from '../ProjectOpening/ProjectOpening';
import { BrainZones } from './BrainZones';

const label =
  'How the personal brain is organised: Atti, skills and pipelines write into an open zone of markdown (study notes, ideas, plans, Atti’s records). A sealed vault sits beside it, out of reach of the tools. Only a publish gate puts anything into the public folder.';

const meta = {
  title: 'Sections/Project/BrainZones',
  component: BrainZones,
  // Copy from the Personal brain board.
  args: {
    label,
    writes: { title: 'Writes', items: ['Atti', 'Skills', 'Pipelines'] },
    open: {
      title: 'Open zone',
      note: 'Markdown in git',
      items: ['Study notes', 'Ideas', 'Plans', 'Atti’s records'],
    },
    sealed: { title: 'Sealed vault', note: 'Out of reach of the tools' },
    gate: 'Publish gate',
    destination: 'Public folder',
  },
} satisfies Meta<typeof BrainZones>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[640px] pt-2">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: label })).toBeVisible();
  },
};

/** As the hero of the Personal brain page, with its caption. */
export const AsHero: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    (_Story, context) => (
      <ThreadScope hash={false}>
        <Container width="project" className="overflow-x-clip pt-11 pb-16">
          <ThreadColumn placement="gutter">
            <div className="relative pt-6">
              <Thread placement="gutter" top={40} bottom={0} />
              <ProjectOpening
                title="Personal brain"
                status={<ProjectStateBadge status="live" label="Daily use" />}
                lead="The umbrella for my brains: markdown in git that my assistant and agents read and write."
              >
                <HeroDrawn caption="How the brain is organised. No private contents shown.">
                  <BrainZones {...context.args} />
                </HeroDrawn>
              </ProjectOpening>
            </div>
          </ThreadColumn>
        </Container>
      </ThreadScope>
    ),
  ],
};

/** On a phone the three parts run down and the arrows turn. */
export const Phone: Story = { ...AsHero, globals: { viewport: { value: 'phone' } } };
