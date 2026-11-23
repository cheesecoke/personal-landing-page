import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { ProjectStateBadge } from '../../../primitives';
import { HeroDrawn, ProjectOpening } from '../ProjectOpening/ProjectOpening';
import { TitanFlow } from './TitanFlow';

const label =
  'Flow: product spec, tickets, agents build, agents test, engineer review. A harness measures each stage; a memory layer feeds lessons back into the build step.';

// Copy from the generic job-page draft only: no system names, numbers, tools, customers or
// coworkers. The status line is left out here because the draft's carries a date.
const meta = {
  title: 'Sections/Project/TitanFlow',
  component: TitanFlow,
  parameters: { layout: 'fullscreen' },
  args: {
    label,
    steps: ['Product spec', 'Tickets', 'Agents build', 'Agents test', 'Engineer review'],
    feedbackNote: 'Memory feeds lessons back',
    measureNote: 'Harness measures each stage',
  },
  decorators: [
    (_Story, context) => (
      <ThreadScope hash={false}>
        <Container width="project" className="overflow-x-clip pt-11 pb-16">
          <ThreadColumn placement="gutter">
            <div className="relative pt-6">
              <Thread placement="gutter" top={40} bottom={0} />
              <ProjectOpening
                title="Titan Intake"
                subtitle="Senior Software Engineer, AI"
                status={<ProjectStateBadge status="live" label="Current" />}
                lead="I build the company’s AI orchestrator: agents turn a product spec into tested code, and a harness measures every stage."
              >
                <HeroDrawn
                  padded={false}
                  caption="What the system does. No work imagery by design."
                >
                  <TitanFlow {...context.args} />
                </HeroDrawn>
              </ProjectOpening>
            </div>
          </ThreadColumn>
        </Container>
      </ThreadScope>
    ),
  ],
} satisfies Meta<typeof TitanFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

const shown = (root: HTMLElement, flow: string) =>
  getComputedStyle(root.querySelector(`[data-flow="${flow}"]`)!).display !== 'none';

/** The job page's hero: the flow runs across, beside the title. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: label })).toBeVisible();
    await expect(shown(canvasElement, 'across')).toBe(true);
    await expect(shown(canvasElement, 'down')).toBe(false);
    await expect(canvasElement.querySelector('figcaption')).toHaveTextContent(
      'What the system does. No work imagery by design.',
    );
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** On a phone the flow runs down, the return path up its left side. */
export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await expect(shown(canvasElement, 'down')).toBe(true);
    await expect(shown(canvasElement, 'across')).toBe(false);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };
