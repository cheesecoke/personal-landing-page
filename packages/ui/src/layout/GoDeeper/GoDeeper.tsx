import { useId, type ReactNode } from 'react';

import { Expander, ExpanderGroup, Heading, Label, Panel, Readout, Text } from '../../primitives';
import { Grid } from '../Grid/Grid';
import { cx } from '../internal/cx';
import { Section } from '../Section/Section';
import { ThreadSection } from '../Thread/Thread';

export interface GoDeeperArtifact {
  /** The date as shown ("3 Jun 2026"). */
  date: string;
  /** The ISO date ("2026-06-03"); also drawn as the stardate. */
  dateTime: string;
  title: ReactNode;
  text: ReactNode;
  /** What it is and where it lives ("Pull request · duo-decide #7"). */
  source: ReactNode;
  /** A capture shown at the top of the card. */
  image?: { src: string; alt: string; width: number; height: number };
  /** Gives the card the lit edge. At most one per view. */
  lit?: boolean;
}

export interface GoDeeperItem {
  /** The row's id: a link to `#id` scrolls to the row and opens it. */
  id: string;
  title: ReactNode;
  /** The small readout on the right of the row ("3 artifacts"). */
  meta?: ReactNode;
  /** The paragraph shown when the row is open. */
  body?: ReactNode;
  /** Dated artifacts, shown as cards under the paragraph. */
  artifacts?: readonly GoDeeperArtifact[];
  /** Anything else in the open row, after the artifacts (a list of open questions). */
  children?: ReactNode;
  /** Open on first render. Rows are closed by default. */
  defaultOpen?: boolean;
}

export interface GoDeeperProps {
  /** The section label ("Go deeper"). */
  title: ReactNode;
  items: readonly GoDeeperItem[];
  /** Accessible name of each row's artifact list ("Dated artifacts"). */
  artifactsLabel: string;
  /** Put a node on the thread beside the section. Default `true`. */
  node?: boolean;
  className?: string;
}

function ArtifactCard({ artifact }: { artifact: GoDeeperArtifact }) {
  return (
    <Panel as="li" padded litEdge={artifact.lit} className="flex flex-col gap-2.5">
      {artifact.image ? (
        <img
          src={artifact.image.src}
          alt={artifact.image.alt}
          width={artifact.image.width}
          height={artifact.image.height}
          loading="lazy"
          className="block h-auto w-full max-w-60 rounded-[3px]"
        />
      ) : null}
      <span
        className={cx('flex flex-wrap items-baseline gap-x-3 gap-y-1', artifact.image && 'mt-1.5')}
      >
        <Readout
          kind="stardate"
          dateTime={artifact.dateTime}
          className="text-[20px] leading-none"
        />
        <Readout kind="date" dateTime={artifact.dateTime}>
          {artifact.date}
        </Readout>
      </span>
      <Heading level={4} className="mt-1 text-[17px] leading-[1.3]">
        {artifact.title}
      </Heading>
      <Text className="text-[15px] leading-normal">{artifact.text}</Text>
      <Label as="p" tone="secondary" className="mt-auto border-t border-hairline pt-3">
        {artifact.source}
      </Label>
    </Panel>
  );
}

/**
 * "Go deeper": the rows at the foot of a project page. Each opens to a paragraph and its dated
 * artifacts. Rows are closed by default; a link to a row's id opens it.
 */
export function GoDeeper({ title, items, artifactsLabel, node = true, className }: GoDeeperProps) {
  const headingId = useId();
  const Wrapper = node ? ThreadSection : Section;
  return (
    <Wrapper aria-labelledby={headingId} measure="deeper" className={className}>
      <Heading level={2} role="label" id={headingId} className="mb-4">
        {title}
      </Heading>
      <ExpanderGroup>
        {items.map((item) => (
          <Expander
            key={item.id}
            id={item.id}
            title={item.title}
            meta={item.meta}
            defaultOpen={item.defaultOpen}
            bodyClassName="pb-0"
          >
            {item.body ? (
              <Text measure className="pb-6">
                {item.body}
              </Text>
            ) : null}
            {item.artifacts?.length ? (
              <Grid
                as="ol"
                aria-label={artifactsLabel}
                min={230}
                gapX={16}
                align="start"
                className="mb-8"
              >
                {item.artifacts.map((artifact) => (
                  <ArtifactCard
                    key={`${artifact.dateTime}-${String(artifact.title)}`}
                    artifact={artifact}
                  />
                ))}
              </Grid>
            ) : null}
            {item.children}
          </Expander>
        ))}
      </ExpanderGroup>
    </Wrapper>
  );
}
