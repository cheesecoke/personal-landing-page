import { useId, type CSSProperties } from 'react';

import { ThreadSection, type LinkComponent } from '../../../layout';
import { cx, Heading, Text, TextLink } from '../../../primitives';
import styles from './ProjectPlates.module.css';
import { ProjectTile, type ProjectTileProps } from './ProjectTile';

/** A plate in the row: a `ProjectTile`, plus how wide its column is against the others. */
export interface ProjectPlate extends Omit<
  ProjectTileProps,
  'linkAs' | 'className' | 'headingLevel'
> {
  key: string;
  /** The column's share of the row (the board's three are 1.45, 0.8 and 1.35). Default 1. */
  weight?: number;
}

export interface ProjectPlatesProps {
  /** The section's label, its heading ("On my own time"). */
  label: string;
  /** The short line beside the label. */
  intro?: string;
  /** The link at the right of the header ("All projects"). */
  allLink?: { label: string; href: string };
  plates: readonly ProjectPlate[];
  /** The element or component for the links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

/**
 * Home's "On my own time" section: a header line and a row of project plates of unequal width.
 * Under a 560px slot the plates stack and each takes its phone crop. It is a section on the Home
 * thread.
 */
export function ProjectPlates({
  label,
  intro,
  allLink,
  plates,
  linkAs,
  className,
}: ProjectPlatesProps) {
  const labelId = useId();
  const columns = {
    '--plates-columns': plates.map((plate) => `minmax(0, ${plate.weight ?? 1}fr)`).join(' '),
  } as CSSProperties;

  return (
    <ThreadSection
      placement="edge"
      nodeTop={20}
      aria-labelledby={labelId}
      className={cx('pt-4 pb-14', className)}
    >
      <div className="@container">
        <div className="-mt-3.5 flex min-h-touch flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <Heading level={2} role="label" id={labelId}>
              {label}
            </Heading>
            {intro ? <Text>{intro}</Text> : null}
          </div>
          {allLink ? (
            <TextLink as={linkAs} href={allLink.href} tone="secondary">
              {allLink.label}
            </TextLink>
          ) : null}
        </div>
        <ul className={styles.gallery} style={columns}>
          {plates.map(({ key, weight: _weight, ...tile }) => (
            <li key={key} className="min-w-0">
              <ProjectTile {...tile} linkAs={linkAs} />
            </li>
          ))}
        </ul>
      </div>
    </ThreadSection>
  );
}
