import type { ElementType, ReactNode } from 'react';

import {
  ArrowIcon,
  cx,
  Heading,
  Label,
  ProjectStateBadge,
  Text,
  type ProjectStateFresh,
  type Status,
} from '../../../primitives';
import type { LinkComponent } from '../internal/link';

export interface ProjectIndexRow {
  id: string;
  name: string;
  /** The status word and which dot goes with it. */
  status: { label: string; tone: Status };
  /** One line about the project. A name-only project has none. */
  line?: ReactNode;
  /** Where the row goes. Without it the row is plain text: a project with no page of its own. */
  href?: string;
  /** How deep the project sits under the one above it. Default 0. */
  depth?: 0 | 1 | 2;
  /**
   * The new mark, as age and lifetime in days. The caller decides which rows get one (one per
   * project, the newest three on a page); a mark that has run out draws nothing.
   */
  fresh?: ProjectStateFresh | null;
  /** Keep room for the new mark's readout, so nothing shifts when it appears after hydration. */
  reserveMarker?: boolean;
}

export interface ProjectIndexGroup {
  title: string;
  rows: ProjectIndexRow[];
}

export interface ProjectIndexProps {
  /** The section's title ("Index"). */
  title: ReactNode;
  /** An id for the title. Default `projects-index`. */
  titleId?: string;
  groups: ProjectIndexGroup[];
  /** The element or component for the rows that are links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

const indent: Record<0 | 1 | 2, string> = { 0: '', 1: 'pl-6', 2: 'pl-12' };
const branchLeft: Record<1 | 2, string> = { 1: 'left-[5px]', 2: 'left-[29px]' };

const rowClass = 'flex items-start gap-4 border-t border-hairline pt-4.5 pb-5 text-primary';
const slide = 'motion-ok:transition-[color,transform] motion-ok:duration-hover motion-ok:ease-out';

/**
 * The Projects index: every project by group, one row each, with its state. A row with a page is
 * a link; a name-only project is a name and its status and nothing else. On a phone the groups
 * stack.
 */
export function ProjectIndex({
  title,
  titleId = 'projects-index',
  groups,
  linkAs,
  className,
}: ProjectIndexProps) {
  const Link: ElementType = linkAs ?? 'a';
  return (
    <section aria-labelledby={titleId} className={cx('pt-24 md:pt-28', className)}>
      <Heading level={2} id={titleId}>
        {title}
      </Heading>
      <div className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-start gap-x-12 gap-y-14">
        {groups.map((group) => (
          <div key={group.title} className="min-w-0">
            <Label as="h3" className="mb-4 block">
              {group.title}
            </Label>
            <ul className="m-0 list-none border-b border-hairline p-0">
              {group.rows.map((row) => {
                const depth = row.depth ?? 0;
                const body = (
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span
                      className={cx(
                        'type-h3',
                        row.href && 'group-hover/row:text-signal',
                        row.href && slide,
                      )}
                    >
                      {row.name}
                    </span>
                    <ProjectStateBadge
                      status={row.status.tone}
                      label={row.status.label}
                      tone="label"
                      fresh={row.fresh}
                      reserveMarker={row.reserveMarker}
                    />
                    {row.line ? (
                      <Text as="span" className="mt-0.5 max-w-measure">
                        {row.line}
                      </Text>
                    ) : null}
                  </span>
                );
                return (
                  <li key={row.id} data-row={row.id} className={cx('relative', indent[depth])}>
                    {depth > 0 ? (
                      <svg
                        aria-hidden="true"
                        width={14}
                        height={32}
                        viewBox="0 0 14 32"
                        fill="none"
                        strokeWidth={1}
                        className={cx('absolute top-0 stroke-tick', branchLeft[depth as 1 | 2])}
                      >
                        <path d="M0.5 0v30.5h13" />
                      </svg>
                    ) : null}
                    {row.href ? (
                      <Link href={row.href} className={cx('group/row no-underline', rowClass)}>
                        {body}
                        <ArrowIcon
                          size="md"
                          className={cx(
                            'mt-[7px] text-label group-hover/row:translate-x-1 group-hover/row:text-signal group-focus-visible/row:translate-x-1',
                            slide,
                          )}
                        />
                      </Link>
                    ) : (
                      <div className={rowClass}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export interface ProjectsMapSlotProps {
  /** The section's accessible name ("Map of the projects"). */
  'aria-label': string;
  /** The map. It is another package's component: pass it in. */
  children?: ReactNode;
  className?: string;
}

/**
 * The slot the project map sits in on Projects, between the page header and the index: full
 * width, no frame, up to 1440px. It sits outside the page container.
 */
export function ProjectsMapSlot({
  'aria-label': ariaLabel,
  children,
  className,
}: ProjectsMapSlotProps) {
  return (
    <section aria-label={ariaLabel} className={cx('mx-auto max-w-[1440px]', className)}>
      {children}
    </section>
  );
}
