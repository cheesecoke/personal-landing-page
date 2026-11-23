import type { HTMLAttributes, ReactNode } from 'react';

import { Heading, Text } from '../../primitives';
import { cx } from '../internal/cx';

/**
 * `project`: a project page. Status above the title, the lead below, in a 520px column.
 * `stack`: About, Beyond, Contact. Title, lead and anything else in one column, 18px apart.
 * `row`: Projects. Title on the left, lead on the right on the same baseline; they wrap.
 */
export type PageHeaderLayout = 'project' | 'stack' | 'row';

/** The lead's line length, in ch, as set on each board. */
export type PageHeaderMeasure = 32 | 34 | 36 | 40 | 44;

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The page title: the page's one `h1`. */
  title: ReactNode;
  /** An id for the `h1`, for the section's `aria-labelledby`. */
  titleId?: string;
  /** The sentence under the title. */
  lead?: ReactNode;
  /** `project` only: the status line above the title (a status dot and word). */
  status?: ReactNode;
  layout?: PageHeaderLayout;
  /** Line length of the lead. Default: 40 for `project`, 44 for `row`, 34 for `stack`. */
  measure?: PageHeaderMeasure;
  /** Anything under the lead (`stack`: the Beyond status line and note). */
  children?: ReactNode;
}

const measureClass: Record<PageHeaderMeasure, string> = {
  32: 'max-w-[32ch]',
  34: 'max-w-[34ch]',
  36: 'max-w-[36ch]',
  40: 'max-w-[40ch]',
  44: 'max-w-[44ch]',
};

const defaultMeasure: Record<PageHeaderLayout, PageHeaderMeasure> = {
  project: 40,
  stack: 34,
  row: 44,
};

const layoutClass: Record<PageHeaderLayout, string> = {
  project: 'flex max-w-[520px] flex-col',
  stack: 'flex flex-col gap-4.5',
  row: 'flex flex-wrap items-end justify-between gap-x-16 gap-y-4',
};

/** The title block at the top of a page: the `h1`, its lead, and the status on a project page. */
export function PageHeader({
  title,
  titleId,
  lead,
  status,
  layout = 'stack',
  measure,
  className,
  children,
  ...rest
}: PageHeaderProps) {
  const leadClass = cx(
    measureClass[measure ?? defaultMeasure[layout]],
    layout === 'project' && 'mt-5',
    layout === 'row' && 'mb-1',
  );
  return (
    <header className={cx('relative', layoutClass[layout], className)} {...rest}>
      {status && layout === 'project' ? <div className="mb-5">{status}</div> : null}
      <Heading level={1} id={titleId}>
        {title}
      </Heading>
      {lead ? (
        <Text role="lead" className={leadClass}>
          {lead}
        </Text>
      ) : null}
      {children}
    </header>
  );
}
