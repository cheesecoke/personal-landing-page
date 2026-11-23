import { Fragment, type ReactNode } from 'react';

import type { Fact, LogEntry, Ring } from '@cwc/content';
import type {
  Artifact,
  PageFact,
  PageSection,
  Paragraph,
  ProjectPageContent,
} from '@cwc/content/hand';
import {
  ArtifactList,
  type ArtifactData,
  type ArtifactMedia,
  type FactData,
  type GoDeeperItem,
  type ProjectImage,
} from '@cwc/ui';

import { renderParagraph } from '../content/paragraph';
import { cropFor } from './ProjectTemplate.looks';

/** One kind of hand section. */
export type SectionOf<Type extends PageSection['type']> = Extract<PageSection, { type: Type }>;

/**
 * A page's content without its `[CONFIRM: ...]` markers. The pages never print them; a loader
 * runs its page through this so they are not in the page's data either.
 */
export function withoutConfirms(content: ProjectPageContent): ProjectPageContent {
  return {
    ...content,
    sections: content.sections.map((section) =>
      section.type === 'goDeeper'
        ? {
            ...section,
            expanders: section.expanders.map(({ confirm: _confirm, ...row }) => row),
          }
        : section,
    ),
  };
}

/** A figure as the sections take it: the image, its caption and where its subject sits. */
export const toFigure = <Figure extends { image: ProjectImage; caption?: string }>(
  figure: Figure,
) => ({ image: figure.image, caption: figure.caption, crop: cropFor(figure.image.src) });

/** Paragraphs set as one block, a blank line between them, as the boards print a row's text. */
export function renderBody(paragraphs: readonly Paragraph[]): ReactNode {
  return paragraphs.map((paragraph, index) => (
    <Fragment key={index}>
      {index > 0 ? (
        <>
          <br />
          <br />
        </>
      ) : null}
      {renderParagraph(paragraph)}
    </Fragment>
  ));
}

const plainText = (paragraph: Paragraph) =>
  typeof paragraph === 'string'
    ? paragraph
    : paragraph.map((run) => (typeof run === 'string' ? run : run.text)).join('');

/**
 * The "where it's at" text. Live data carries it as plain words; hand content may hold links. So
 * the hand paragraphs stay while they say the same thing, and the live text takes over once it
 * says something new.
 */
export function whereItsAtParagraphs(hand: readonly Paragraph[], live?: string): ReactNode[] {
  if (live && live !== hand.map(plainText).join(' ')) return [live];
  return hand.map(renderParagraph);
}

const COUNTED = /^[\d.,]+$/;

/**
 * The facts beside "Where it's at". A counted number is a numeral over its unit. Anything else is
 * set in words, and what would be its unit becomes the small readout under the scale. Where live
 * data counts the same thing (its label is the fact's unit), the live value is the one shown.
 */
export function toFacts(facts: readonly PageFact[], live: readonly Fact[] = []): FactData[] {
  return facts.map((fact) => {
    const value = live.find((counted) => counted.label === fact.unit)?.value ?? fact.value;
    if (fact.unit && COUNTED.test(value)) {
      return { kind: 'numeral', value, unit: fact.unit, caption: fact.caption };
    }
    return { kind: 'word', value, note: fact.unit, caption: fact.caption };
  });
}

const isWide = (media: NonNullable<Artifact['media']>[number]) =>
  media.kind === 'video' || media.image.width > media.image.height;

/** A tall capture on its own is capped, as on the boards. */
const TALL_CAPTURE = 240;

export function toArtifact(artifact: Artifact): ArtifactData {
  const alone = artifact.media?.length === 1;
  return {
    stamp: artifact.stamp,
    date: artifact.date,
    title: artifact.title,
    text: renderParagraph(artifact.text),
    source: artifact.source,
    media: artifact.media?.map((media): ArtifactMedia =>
      media.kind === 'image' && alone && !isWide(media)
        ? { ...media, maxWidth: TALL_CAPTURE }
        : media,
    ),
  };
}

/** Cards with a wide capture or a clip need the wider column; the rest pack tighter. */
export const artifactMin = (artifacts: readonly Artifact[]): 230 | 280 =>
  artifacts.some((artifact) => artifact.media?.some(isWide)) ? 280 : 230;

/**
 * The "Go deeper" rows. A row's `[CONFIRM: ...]` markers are left out. A row with no anchor of its
 * own is numbered after the section's.
 */
export function toDeeperItems(section: SectionOf<'goDeeper'>): GoDeeperItem[] {
  return section.expanders.map((row, index) => ({
    id: row.id ?? `${section.id}-${index + 1}`,
    title: row.title,
    meta: row.countLabel,
    body: renderBody(row.paragraphs),
    children: row.artifacts ? (
      <ArtifactList
        label={section.artifactsLabel ?? section.title}
        artifacts={row.artifacts.map(toArtifact)}
        min={artifactMin(row.artifacts)}
      />
    ) : undefined,
  }));
}

/** Rows that open to artifact cards get the wide column; text rows the log's. */
export const deeperMeasure = (section: SectionOf<'goDeeper'>): 'deeper' | 'log' =>
  section.expanders.some((row) => row.artifacts?.length) ? 'deeper' : 'log';

const DAY = 86_400_000;
const utc = (date: string) => Date.parse(`${date}T00:00:00Z`);

/** No entry for six weeks: the log shows only its last entry. From the Captain's log board. */
export const QUIET_DAYS = 42;

/** Whether a log has gone quiet by `today` (`YYYY-MM-DD`). Without a date it never is. */
export function isQuiet(log: readonly Pick<LogEntry, 'date'>[], today?: string): boolean {
  const newest = log[0]?.date;
  if (!newest || !today) return false;
  return (utc(today) - utc(newest)) / DAY > QUIET_DAYS;
}

/**
 * How far the outermost ring has grown, 0 to 1: the share of its quarter that had passed at the
 * newest log entry. 0 when the log is quiet, when the outermost ring is a release, or when the
 * newest entry is not inside that ring's quarter ("2026 Q4").
 */
export function ringGrowth(
  rings: readonly Pick<Ring, 'label' | 'kind'>[],
  log: readonly Pick<LogEntry, 'date'>[],
  quiet: boolean,
): number {
  const outer = rings.at(-1);
  const newest = log[0]?.date;
  const quarter = outer?.kind === 'period' ? /^(\d{4}) Q([1-4])$/.exec(outer.label) : null;
  if (!quarter || !newest || quiet) return 0;
  const year = Number(quarter[1]);
  const first = (Number(quarter[2]) - 1) * 3;
  const start = Date.UTC(year, first, 1);
  const end = Date.UTC(year, first + 3, 1);
  const at = utc(newest);
  if (at < start || at >= end) return 0;
  return Math.round(((at - start) / (end - start)) * 100) / 100;
}
