import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx, Heading, Label, Panel, Readout } from '../../../primitives';
import type { ProjectImage } from '../ProjectFigure/ProjectFigure';

/** A muted, looping screen recording. `label` is its accessible name. */
export interface ProjectVideoData {
  src: string;
  width: number;
  height: number;
  poster?: string;
  label?: string;
}

export type ArtifactMedia =
  | {
      kind: 'image';
      image: ProjectImage;
      /** Caps a tall capture, in px (240 on the boards). */ maxWidth?: number;
    }
  | { kind: 'video'; video: ProjectVideoData };

/** A dated piece of evidence: what happened, and where it is recorded. */
export interface ArtifactData {
  /** The stardate as printed ("2026.279"). */
  stamp: string;
  /** The day as printed ("6 Oct 2026"). */
  date: string;
  /** The ISO day, for `<time>`. Default: worked out from the stamp. */
  dateTime?: string;
  title: ReactNode;
  /** One or two sentences. May hold a link. */
  text: ReactNode;
  /** Where it comes from ("Pull request · duo-decide #18"). */
  source: ReactNode;
  /** A capture or clip at the top of the card. Two images sit side by side (two phone captures). */
  media?: readonly ArtifactMedia[];
}

/** `2026.279` as an ISO day (`2026-10-06`), or `undefined` when it is not a stardate. */
export function stampToIso(stamp: string): string | undefined {
  const match = /^(\d{4})\.(\d{3})$/.exec(stamp);
  if (!match) return undefined;
  const date = new Date(Date.UTC(Number(match[1]), 0, Number(match[2])));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

const mediaClass = 'block h-auto w-full max-w-full rounded-[3px]';

/** A screen recording: muted, looping, with controls, and loaded only when played. */
export function ProjectVideo({
  video,
  className,
  ...rest
}: { video: ProjectVideoData } & Omit<ComponentPropsWithoutRef<'video'>, 'children'>) {
  return (
    <video
      src={video.src}
      poster={video.poster}
      width={video.width}
      height={video.height}
      muted
      loop
      playsInline
      controls
      preload="none"
      aria-label={video.label}
      className={cx(mediaClass, 'bg-ground', className)}
      {...rest}
    />
  );
}

function CardImage({ image, maxWidth }: { image: ProjectImage; maxWidth?: number }) {
  return (
    <img
      src={image.src}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading="lazy"
      className={mediaClass}
      style={maxWidth ? { maxWidth } : undefined}
    />
  );
}

function CardMedia({ media }: { media: readonly ArtifactMedia[] }) {
  const images = media.filter((item) => item.kind === 'image');
  if (media.length === 2 && images.length === 2) {
    return (
      <div className="grid max-w-80 grid-cols-2 gap-2.5">
        {images.map((item) => (
          <CardImage key={item.image.src} image={item.image} />
        ))}
      </div>
    );
  }
  return (
    <>
      {media.map((item) =>
        item.kind === 'image' ? (
          <CardImage key={item.image.src} image={item.image} maxWidth={item.maxWidth} />
        ) : (
          <ProjectVideo key={item.video.src} video={item.video} />
        ),
      )}
    </>
  );
}

export interface ArtifactCardProps extends Omit<ComponentPropsWithoutRef<'li'>, 'title'> {
  artifact: ArtifactData;
  /** Gives the card the lit edge. At most one per view. */
  lit?: boolean;
  /** The heading element of the card's title. Default 4 (the card sits under an `h3` row). */
  headingLevel?: 3 | 4;
}

/** One dated artifact card: an optional capture or clip, the stardate and day, a title and a line. */
export function ArtifactCard({
  artifact,
  lit = false,
  headingLevel = 4,
  className,
  ...rest
}: ArtifactCardProps) {
  const dateTime = artifact.dateTime ?? stampToIso(artifact.stamp);
  const hasMedia = Boolean(artifact.media?.length);
  return (
    <Panel
      as="li"
      padded
      litEdge={lit}
      className={cx('flex flex-col gap-2.5', className)}
      {...rest}
    >
      {hasMedia ? <CardMedia media={artifact.media!} /> : null}
      <span className={cx('flex flex-wrap items-baseline gap-x-3 gap-y-1', hasMedia && 'mt-1.5')}>
        <Readout kind="stardate" className="text-[20px] leading-none">
          {artifact.stamp}
        </Readout>
        <Readout kind="date" dateTime={dateTime}>
          {artifact.date}
        </Readout>
      </span>
      <Heading level={headingLevel} className="mt-1 text-[17px] leading-[1.3]">
        {artifact.title}
      </Heading>
      <p className="m-0 text-[15px] leading-normal text-secondary">{artifact.text}</p>
      <Label as="p" tone="secondary" className="mt-auto border-t border-hairline pt-3">
        {artifact.source}
      </Label>
    </Panel>
  );
}

export interface ArtifactListProps extends Omit<ComponentPropsWithoutRef<'ol'>, 'children'> {
  /** Accessible name of the list ("Dated artifacts"). */
  label: string;
  artifacts: readonly ArtifactData[];
  /** Column floor in px. 230: cards without captures. 280: cards with captures. 220: PAS pages. */
  min?: 220 | 230 | 280;
  /** `start`: each card is as tall as its content. `stretch`: cards in a row share a height. */
  align?: 'start' | 'stretch';
  /** Light the first card's edge. Default `true`; at most one lit edge per view. */
  litFirst?: boolean;
  headingLevel?: 3 | 4;
}

const minClass = {
  220: 'grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]',
  230: 'grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))]',
  280: 'grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]',
} as const;

/**
 * Dated artifact cards: the evidence under a "Go deeper" row. Each card is tied to one real
 * artifact (a pull request, a doc, a capture). Pass it as the row's children. With no artifacts it
 * renders nothing.
 */
export function ArtifactList({
  label,
  artifacts,
  min = 230,
  align = 'start',
  litFirst = true,
  headingLevel,
  className,
  ...rest
}: ArtifactListProps) {
  if (artifacts.length === 0) return null;
  return (
    <ol
      aria-label={label}
      className={cx(
        'm-0 mb-8 grid list-none gap-4 p-0',
        minClass[min],
        align === 'start' && 'items-start',
        className,
      )}
      {...rest}
    >
      {artifacts.map((artifact, index) => (
        <ArtifactCard
          key={`${artifact.stamp}-${index}`}
          artifact={artifact}
          lit={litFirst && index === 0}
          headingLevel={headingLevel}
        />
      ))}
    </ol>
  );
}
