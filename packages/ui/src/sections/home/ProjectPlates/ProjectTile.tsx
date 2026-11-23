import type { CSSProperties, ElementType } from 'react';

import type { LinkComponent } from '../../../layout';
import {
  cx,
  Heading,
  Label,
  ProjectStateBadge,
  Text,
  type ProjectStateFresh,
  type Status,
} from '../../../primitives';
import styles from './ProjectPlates.module.css';

/** How an image sits in its plate: position and width as percentages of the plate's width. */
export interface PlateCrop {
  left: number;
  top: number;
  width: number;
}

/** A plate's frame: its width over its height, and the crop of the image inside it. */
export interface PlateFrame {
  aspect: number;
  crop: PlateCrop;
}

export interface ProjectTileProps {
  name: string;
  /** One sentence under the name. */
  summary: string;
  href: string;
  /** What the image is ("Concept drawing", "Design mock"). */
  kind: string;
  /** Which status dot. */
  status: Status;
  /** The status word, from data ("Daily use", "In build"). */
  statusLabel: string;
  /** The new mark, as plain numbers (see `ProjectStateBadge`). */
  fresh?: ProjectStateFresh | null;
  image: { src: string; width: number; height: number; alt: string };
  /** The plate from a 560px slot. */
  frame: PlateFrame;
  /** The plate under a 560px slot. Default: the same as `frame`. */
  phoneFrame?: PlateFrame;
  /** The first plate: the name in the H2 style, and the lit edge on the frame. */
  featured?: boolean;
  /** The heading level of the name. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** The element or component for the link. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

const percent = (value: number) => `${value}%`;

/**
 * One project plate: a framed image, then what the image is and the project's state, its name and
 * one sentence. The whole tile is one link; it rises on hover.
 */
export function ProjectTile({
  name,
  summary,
  href,
  kind,
  status,
  statusLabel,
  fresh,
  image,
  frame,
  phoneFrame,
  featured = false,
  headingLevel = 3,
  linkAs,
  className,
}: ProjectTileProps) {
  const Link: ElementType = linkAs ?? 'a';
  const frameStyle = {
    '--plate-aspect': frame.aspect,
    '--plate-left': percent(frame.crop.left),
    '--plate-top': percent(frame.crop.top),
    '--plate-width': percent(frame.crop.width),
    ...(phoneFrame
      ? {
          '--plate-aspect-phone': phoneFrame.aspect,
          '--plate-left-phone': percent(phoneFrame.crop.left),
          '--plate-top-phone': percent(phoneFrame.crop.top),
          '--plate-width-phone': percent(phoneFrame.crop.width),
        }
      : null),
  } as CSSProperties;

  return (
    <Link href={href} className={cx(styles.tile, className)}>
      <span className={styles.plate} style={frameStyle}>
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          loading="lazy"
          className={styles.image}
        />
        <span aria-hidden="true" className={cx(styles.corner, styles.cornerTopLeft)} />
        <span aria-hidden="true" className={cx(styles.corner, styles.cornerTopRight)} />
        <span aria-hidden="true" className={cx(styles.corner, styles.cornerBottomLeft)} />
        <span aria-hidden="true" className={cx(styles.corner, styles.cornerBottomRight)} />
        {featured ? <span aria-hidden="true" className={styles.litEdge} /> : null}
      </span>
      <span className={styles.meta}>
        <Label>{kind}</Label>
        <ProjectStateBadge
          status={status}
          label={statusLabel}
          fresh={fresh}
          className={styles.status}
        />
      </span>
      <span className={styles.nameRow}>
        <Heading level={headingLevel} role={featured ? 'h2' : 'h3'} className={styles.name}>
          {name}
        </Heading>
      </span>
      <Text as="span" className={styles.summary}>
        {summary}
      </Text>
    </Link>
  );
}
