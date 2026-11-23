import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { ProjectStateBadge } from '../../../primitives';
import { ProjectOpening } from '../ProjectOpening/ProjectOpening';
import { WhereItsAt } from '../WhereItsAt/WhereItsAt';
import { DuoLensMark } from './DuoLensMark';
import { RingsDecor } from './RingsDecor';

const meta = {
  title: 'Sections/Project/DrawnMarks',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ThreadScope hash={false}>
        <Container width="project" className="overflow-x-clip pt-11 pb-16">
          <ThreadColumn placement="gutter">
            <div className="relative pt-6">
              <Thread placement="gutter" top={40} bottom={0} />
              <Story />
            </div>
          </ThreadColumn>
        </Container>
      </ThreadScope>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Duo Decide lens under "Where it's at" (copy from the Duo Decide board). */
export const DuoLens: Story = {
  render: () => (
    <WhereItsAt
      title="Where it’s at"
      paragraphs={[
        'Voting, three-round polls, option lists, history and real-time sync work on iOS and the web. The redesign shipped in October. November went to App Store readiness: an iOS 26 build, over-the-air updates, archive and soft delete, and a native accessibility pass.',
      ]}
      mark={<DuoLensMark />}
      facts={[
        {
          value: '1,167',
          unit: 'test cases',
          caption: 'Run in CI with lint, formatting and typecheck.',
        },
        {
          value: '24',
          unit: 'SQL migrations',
          caption: 'Each applied and tested on PGlite in CI.',
        },
        {
          value: '6',
          unit: 'end-to-end flows',
          caption: 'Auth, vote, poll, history, option lists, archive.',
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg[viewBox="0 0 132 72"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};

/** The Thread Quest opening: type only, with the rings where a hero would be. */
export const Rings: Story = {
  render: () => (
    <ProjectOpening
      title="Thread Quest"
      status={<ProjectStateBadge status="private" label="Being expanded" />}
      lead="A closet and style tool. Save the clothes you like into your own closet, and build outfits from them."
    >
      <RingsDecor />
    </ProjectOpening>
  ),
};

export const RingsPhone: Story = { ...Rings, globals: { viewport: { value: 'phone' } } };
