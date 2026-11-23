import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';
import { ProjectStateBadge } from '../../../primitives';
import { placeholder } from '../internal/storyMedia';
import { ProjectOpening } from '../ProjectOpening/ProjectOpening';
import { GrowSteps } from './GrowSteps';
import { HeroCapture } from './HeroCapture';
import { PhoneFigures } from './PhoneFigures';

// Copy and alt text from the Lifebox board (Alex and Blair are the app's sample people); the
// captures are placeholders.
const phone = (alt: string) => ({
  src: `${placeholder(462, 1000, { kind: 'phone', subject: [16, 984] })}#${alt.length}`,
  width: 462,
  height: 1000,
  alt,
});

const meta = {
  title: 'Sections/Project/PhoneCaptures',
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

/** The Lifebox opening: a real capture with a sentence and a quieter note under it. */
export const Hero: Story = {
  render: () => (
    <ProjectOpening
      title="Lifebox"
      status={<ProjectStateBadge status="private" label="Experiment" />}
      lead="An experiment in whether an app’s interface can be shaped for each person who uses it, instead of one design for everyone. It is planned as Atti’s phone app."
    >
      <HeroCapture
        image={{
          src: placeholder(991, 1000, { kind: 'screens', subject: [40, 960] }),
          width: 991,
          height: 1000,
          alt: 'Lifebox’s Now screen for Alex and Blair, the app’s two sample people, side by side. Alex sees four things as large cards with action buttons, starting with dog food. Blair sees three compact rows with check circles, starting with concert tickets.',
        }}
        caption="The same Now screen for two people: one app, assembled from each person’s data."
        captionNote="Working title in the app: Life Inbox."
      />
    </ProjectOpening>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('figcaption')).toHaveTextContent(
      'Working title in the app: Life Inbox.',
    );
  },
};

/** "Memory adapts too": two phone captures beside a sentence. */
export const Figures: Story = {
  render: () => (
    <PhoneFigures
      id="memory"
      title="Memory adapts too"
      paragraphs={[
        'Alex’s Memory opens on recent purchases. Blair’s opens on saved places.',
        'Both are the app’s built-in sample people, running the same code.',
      ]}
      figures={[
        {
          image: phone(
            'Alex’s Memory screen in Lifebox, sample data. It opens on Recent purchases: dog food and running shoes, then Coming up: a concert.',
          ),
          caption: 'Alex',
        },
        {
          image: phone(
            'Blair’s Memory screen in Lifebox, sample data. It opens on Saved places, such as a bakery and a coffee shop, then Upcoming: a concert and a birthday dinner.',
          ),
          caption: 'Blair',
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Memory adapts too' })).toBeVisible();
    await expect(canvas.getAllByRole('img')).toHaveLength(2);
  },
};

/** "Grow your own app": three steps, from request to change. */
export const Steps: Story = {
  render: () => (
    <div className="max-w-[1056px]">
      <GrowSteps
        id="grow"
        title="Grow your own app"
        text="You tell the app what you want in your own words. When the change fits the layout settings it already has, it makes it right away and keeps an Undo. Anything else can be sent on as an idea for a later build."
        stepsLabel="Three steps, from request to change"
        steps={[
          {
            label: 'Step 1',
            image: phone(
              'The Tell Life Inbox sheet in Lifebox, with An idea selected and the request: Can this be smaller? I only need a quick glance.',
            ),
            text: 'Alex asks in plain words: "Can this be smaller? I only need a quick glance."',
          },
          {
            label: 'Step 2',
            image: phone(
              'Lifebox answers I can do that now: show What matters now as compact rows, undo it anytime. A Do it button sits above Send it as an idea instead.',
            ),
            text: 'The app can make this change itself, so it offers to do it now.',
          },
          {
            label: 'Step 3',
            image: phone(
              'Alex’s Now screen after the change: the same four items as compact rows with check circles, and a sheet that says Done, undo anytime, with an Undo button.',
            ),
            text: 'Now switches to compact rows, and Undo stays one tap away.',
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('article', { name: 'Grow your own app' })).toBeVisible();
    const list = canvas.getByRole('list', { name: 'Three steps, from request to change' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  },
};

export const HeroPhone: Story = { ...Hero, globals: { viewport: { value: 'phone' } } };
export const FiguresPhone: Story = { ...Figures, globals: { viewport: { value: 'phone' } } };

/** On a phone the steps become a strip you swipe; the page itself never scrolls sideways. */
export const StepsPhone: Story = {
  ...Steps,
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    const strip = canvasElement.querySelector<HTMLElement>('[data-strip]')!;
    await expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
