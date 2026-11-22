import { useId, type ReactNode } from 'react';

import { Section, ThreadSection } from '../../../layout';
import { cx, Heading, Text } from '../../../primitives';
import { FactList, type FactData } from './FactList';

export interface WhereItsAtProps {
  /** The section label ("Where it's at"; "What it is" on the job page). */
  title: ReactNode;
  /** The "where it's at" paragraphs, in the lead style. A paragraph may hold a link. */
  paragraphs: readonly ReactNode[];
  /** The facts on the right. Left out or empty: the text stands alone. */
  facts?: readonly FactData[];
  /** The words before a fact's date ("As of"). */
  asOfLabel?: string;
  /** A small drawn mark under the text (the Duo Decide lens). */
  mark?: ReactNode;
  /** An anchor for the section. */
  id?: string;
  /** Put a node on the thread beside the section. Default `true`. */
  node?: boolean;
  className?: string;
}

/**
 * "Where it's at": where the project stands, in a sentence or two, beside its facts. Text and
 * facts sit side by side when the section is wide enough, and stack otherwise.
 */
export function WhereItsAt({
  title,
  paragraphs,
  facts,
  asOfLabel,
  mark,
  id,
  node = true,
  className,
}: WhereItsAtProps) {
  const headingId = useId();
  const Wrapper = node ? ThreadSection : Section;
  return (
    <Wrapper id={id} aria-labelledby={headingId} className={cx('z-1 scroll-mt-6', className)}>
      <div className="@container">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-12 @[860px]:grid-cols-[minmax(0,400px)_minmax(0,1fr)] @[860px]:gap-14">
          <div className="flex flex-col">
            <Heading level={2} role="label" id={headingId} className="mb-4">
              {title}
            </Heading>
            {paragraphs.map((paragraph, index) => (
              <Text key={index} role="lead" measure className={cx(index > 0 && 'mt-4')}>
                {paragraph}
              </Text>
            ))}
            {mark ? <div className="mt-8">{mark}</div> : null}
          </div>
          {facts?.length ? <FactList facts={facts} asOfLabel={asOfLabel} /> : null}
        </div>
      </div>
    </Wrapper>
  );
}
