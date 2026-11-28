import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, HandoffLink, TextLink } from '../../primitives';
import { NextStepHint } from './NextStepHint';

/*
 * Stories rest for `IDLE` ms instead of six seconds (`debugIdleMs`, stories only): repeats come
 * every 2 x IDLE and each play lasts IDLE, so the tests run in about a second.
 */
const IDLE = 250;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits until the hint's listeners are on the page (they load after hydration). */
const ready = (canvasElement: HTMLElement) =>
  waitFor(() =>
    expect(canvasElement.querySelector('[data-next-step-cue]')).toHaveAttribute('data-ready'),
  );

/** Counts the plays on an element: each time `attribute` is set to `play`. */
function countPlays(element: Element, attribute: string) {
  const count = { plays: 0 };
  if (element.getAttribute(attribute) === 'play') count.plays += 1;
  new MutationObserver(() => {
    if (element.getAttribute(attribute) === 'play') count.plays += 1;
  }).observe(element, { attributes: true, attributeFilter: [attribute] });
  return count;
}

const target = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole('link', { name: 'See the projects' });

/** The Home hero pair, the primary action marked as the next step. */
function HeroPair() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button href="#projects" arrow nextStep>
        See the projects
      </Button>
      <Button href="#contact" variant="quiet">
        Get in touch
      </Button>
    </div>
  );
}

const meta = {
  title: 'Layout/NextStepHint',
  component: NextStepHint,
  args: { debugIdleMs: IDLE },
  render: (args) => (
    <>
      <HeroPair />
      <NextStepHint {...args} />
    </>
  ),
} satisfies Meta<typeof NextStepHint>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As shipped: rest six seconds and the primary action's arrow eases forward under a light. */
export const Default: Story = { args: { debugIdleMs: undefined } };

/** After a rest the marked action plays its hint once, then rests. */
export const PlaysAfterRest: Story = {
  play: async ({ canvasElement }) => {
    const link = target(canvasElement);
    await expect(link).toHaveAttribute('data-next-step');
    await waitFor(() => expect(link).toHaveAttribute('data-next-step-hint', 'play'), {
      timeout: IDLE * 6,
    });
    await waitFor(() => expect(link).not.toHaveAttribute('data-next-step-hint'), {
      timeout: IDLE * 4,
    });
  },
};

/** Moving the pointer keeps restarting the rest; the hint waits for a full rest after it. */
export const ActivityResets: Story = {
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    const link = target(canvasElement);
    const count = countPlays(link, 'data-next-step-hint');
    for (let step = 0; step < 6; step += 1) {
      window.dispatchEvent(new PointerEvent('pointermove'));
      await pause(IDLE / 2);
    }
    await expect(count.plays).toBe(0);
    await waitFor(() => expect(count.plays).toBe(1), { timeout: IDLE * 6 });
  },
};

/** While the visitor keeps resting the hint repeats, three times a page view at most. */
export const CapOfThree: Story = {
  play: async ({ canvasElement }) => {
    const count = countPlays(target(canvasElement), 'data-next-step-hint');
    await waitFor(() => expect(count.plays).toBe(3), { timeout: IDLE * 12 });
    await pause(IDLE * 6);
    await expect(count.plays).toBe(3);
  },
};

/** Once the visitor has hovered the action it is never hinted again. */
export const NotAfterHover: Story = {
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    const link = target(canvasElement);
    const count = countPlays(link, 'data-next-step-hint');
    await userEvent.hover(link);
    await userEvent.unhover(link);
    await pause(IDLE * 6);
    await expect(count.plays).toBe(0);
  },
};

/** Nor after it has had focus, even once focus has gone. */
export const NotAfterFocus: Story = {
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    const link = target(canvasElement);
    const count = countPlays(link, 'data-next-step-hint');
    link.focus();
    link.blur();
    await pause(IDLE * 6);
    await expect(count.plays).toBe(0);
  },
};

/** Nor after it has been used. */
export const NotAfterClick: Story = {
  render: (args) => (
    <>
      <Button arrow nextStep>
        Back to the map
      </Button>
      <NextStepHint {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    const button = within(canvasElement).getByRole('button', { name: 'Back to the map' });
    const count = countPlays(button, 'data-next-step-hint');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await pause(IDLE * 6);
    await expect(count.plays).toBe(0);
  },
};

/** Under reduced motion there is no hint at all. */
export const Reduced: Story = {
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const count = countPlays(target(canvasElement), 'data-next-step-hint');
    await pause(IDLE * 6);
    await expect(count.plays).toBe(0);
  },
};

/** Nothing plays while a dialog is open (the phone menu and the Portal dive are dialogs too). */
export const NotWhileDialogOpen: Story = {
  render: (args) => (
    <>
      <HeroPair />
      {/* Open without taking focus, so only the open dialog holds the hint back. */}
      <dialog open aria-label="A dialog over the page" className="bg-surface p-6 text-primary">
        A dialog over the page.
      </dialog>
      <NextStepHint {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector('[data-next-step]')!;
    const count = countPlays(link, 'data-next-step-hint');
    await pause(IDLE * 6);
    await expect(count.plays).toBe(0);
  },
};

/**
 * The action below the fold: a quiet line and chevron at the bottom centre fades in and drifts
 * down. Scrolling ends it; once the action is on screen, the in-place hint takes over.
 */
export const ScrollCue: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <>
      <div style={{ height: '160vh' }} />
      <div className="px-6 pb-16">
        <HandoffLink href="#next" label="Next" variant="page" nextStep>
          Contact
        </HandoffLink>
      </div>
      <NextStepHint {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    window.scrollTo(0, 0);
    const cue = canvasElement.querySelector('[data-next-step-cue]')!;
    const link = within(canvasElement).getByRole('link', { name: 'Contact' });
    await expect(cue).toHaveAttribute('aria-hidden', 'true');
    await waitFor(() => expect(cue).toHaveAttribute('data-cue', 'play'), { timeout: IDLE * 6 });
    link.scrollIntoView({ block: 'center' });
    await waitFor(() => expect(cue).not.toHaveAttribute('data-cue'));
    await waitFor(() => expect(link).toHaveAttribute('data-next-step-hint', 'play'), {
      timeout: IDLE * 8,
    });
    window.scrollTo(0, 0);
  },
};

/** No cue when the action is already on screen: the hint plays in place. */
export const NoCueInView: Story = {
  play: async ({ canvasElement }) => {
    const cue = countPlays(canvasElement.querySelector('[data-next-step-cue]')!, 'data-cue');
    const hint = countPlays(target(canvasElement), 'data-next-step-hint');
    await waitFor(() => expect(hint.plays).toBe(1), { timeout: IDLE * 6 });
    await expect(cue.plays).toBe(0);
  },
};

/** The hand-off link as the next step: its long arrow reaches further. */
export const OnHandoffLink: Story = {
  render: (args) => (
    <>
      <HandoffLink href="#projects" label="Next" variant="home" nextStep>
        Projects
      </HandoffLink>
      <NextStepHint {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Projects' });
    await waitFor(() => expect(link).toHaveAttribute('data-next-step-hint', 'play'), {
      timeout: IDLE * 6,
    });
  },
};

/** A text link as the next step: only its arrow moves. */
export const OnTextLink: Story = {
  render: (args) => (
    <>
      <TextLink href="#about" size="body">
        More about the work
      </TextLink>
      <br />
      <TextLink href="#projects" size="body" nextStep>
        All projects
      </TextLink>
      <NextStepHint {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'All projects' });
    await waitFor(() => expect(link).toHaveAttribute('data-next-step-hint', 'play'), {
      timeout: IDLE * 6,
    });
  },
};
