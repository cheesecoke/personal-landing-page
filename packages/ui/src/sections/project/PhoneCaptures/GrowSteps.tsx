import { useId, type ReactNode } from 'react';

import { cx, Heading, Panel, Readout, Text } from '../../../primitives';
import type { ProjectImage } from '../ProjectFigure/ProjectFigure';
import { PhoneFrame } from './PhoneFrame';

export interface GrowStep {
  /** The step's readout ("Step 1"). */
  label: string;
  image: ProjectImage;
  text: ReactNode;
}

export interface GrowStepsProps {
  /** The feature's title ("Grow your own app"). */
  title: ReactNode;
  text: ReactNode;
  /** Accessible name of the steps ("Three steps, from request to change"). */
  stepsLabel: string;
  steps: readonly GrowStep[];
  /** The anchor of the feature. */
  id?: string;
  /** The heading element of the title. Default 3 (it sits under "Go deeper"). */
  headingLevel?: 3 | 4;
  className?: string;
}

/**
 * A short illustrated walk-through at the top of "Go deeper" (Lifebox: grow your own app): a
 * title, a paragraph and a few phone captures in order. The steps sit side by side; in a narrow
 * slot they become a strip you swipe (and can reach and scroll with the keyboard).
 */
export function GrowSteps({
  title,
  text,
  stepsLabel,
  steps,
  id,
  headingLevel = 3,
  className,
}: GrowStepsProps) {
  const headingId = useId();
  return (
    <Panel
      as="article"
      id={id}
      aria-labelledby={headingId}
      className={cx(
        '@container mb-10 flex scroll-mt-6 flex-col gap-5 px-[clamp(18px,3vw,32px)] pt-6 pb-7',
        className,
      )}
    >
      <Heading level={headingLevel} role="h3" id={headingId}>
        {title}
      </Heading>
      <Text measure>{text}</Text>
      <ol
        aria-label={stepsLabel}
        tabIndex={0}
        data-strip=""
        className="m-0 mt-2 grid list-none grid-cols-3 gap-6 p-0 @max-[620px]:flex @max-[620px]:snap-x @max-[620px]:snap-mandatory @max-[620px]:gap-4 @max-[620px]:overflow-x-auto @max-[620px]:pb-2"
      >
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex min-w-0 flex-col gap-3.5 @max-[620px]:flex-[0_0_72%] @max-[620px]:snap-start"
          >
            <Readout kind="status" tone="warm">
              {step.label}
            </Readout>
            <PhoneFrame image={step.image} maxWidth={240} />
            <p className="m-0 max-w-[30ch] text-[14px] leading-normal text-secondary">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
