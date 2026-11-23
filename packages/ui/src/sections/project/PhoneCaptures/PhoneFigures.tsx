import { useId, type ReactNode } from 'react';

import { Section, ThreadSection } from '../../../layout';
import { Caption, cx, Heading, Text } from '../../../primitives';
import type { ProjectImage } from '../ProjectFigure/ProjectFigure';
import { PhoneFrame } from './PhoneFrame';

export interface PhoneFiguresProps {
  /** The section label ("Memory adapts too"). */
  title: ReactNode;
  /** The first paragraph is set as a lead; the rest as body text. */
  paragraphs?: readonly ReactNode[];
  /** Phone captures, each with a short caption ("Alex", "Blair"). */
  figures: readonly { image: ProjectImage; caption?: ReactNode }[];
  id?: string;
  /** Put a node on the thread beside the section. Default `true`. */
  node?: boolean;
  className?: string;
}

/**
 * A heading and a sentence or two beside two phone captures (Lifebox: the same screen for two
 * people). Text and captures sit side by side when the section is wide enough, and stack otherwise.
 */
export function PhoneFigures({
  title,
  paragraphs = [],
  figures,
  id,
  node = true,
  className,
}: PhoneFiguresProps) {
  const headingId = useId();
  const Wrapper = node ? ThreadSection : Section;
  return (
    <Wrapper id={id} aria-labelledby={headingId} className={cx('z-1 scroll-mt-6', className)}>
      <div className="@container">
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 @[864px]:grid-cols-[minmax(0,400px)_minmax(0,1fr)] @[864px]:gap-14">
          <div className="flex flex-col">
            <Heading level={2} role="label" id={headingId} className="mb-4">
              {title}
            </Heading>
            {paragraphs.map((paragraph, index) =>
              index === 0 ? (
                <Text key={index} role="lead" className="max-w-[40ch]">
                  {paragraph}
                </Text>
              ) : (
                <Text key={index} className="mt-4 max-w-[44ch]">
                  {paragraph}
                </Text>
              ),
            )}
          </div>
          <div className="grid grid-cols-[repeat(2,minmax(0,220px))] gap-5">
            {figures.map((figure) => (
              <figure key={figure.image.src} className="m-0 flex min-w-0 flex-col gap-3">
                <PhoneFrame image={figure.image} maxWidth={220} />
                {figure.caption ? <Caption>{figure.caption}</Caption> : null}
              </figure>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
