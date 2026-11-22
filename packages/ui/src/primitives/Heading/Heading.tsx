import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../cx';
import { typeClass } from '../Text/Text';
import { toneClass, type TextTone } from '../tone';

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingRole = 'hero' | 'h1' | 'h2' | 'h3' | 'label';

const tags = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' } as const;
const defaultRole: Record<HeadingLevel, HeadingRole> = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h3' };

export interface HeadingProps extends ComponentPropsWithoutRef<'h1'> {
  /** The heading element: the document outline. One `h1` per page. */
  level: HeadingLevel;
  /**
   * How it looks, when that differs from the level: the Home headline is `hero`, and a section
   * title on a project page is an `h2` set as a `label`.
   */
  role?: HeadingRole;
  tone?: TextTone;
}

/** A heading. `level` sets the element, `role` the type role (it follows the level by default). */
export function Heading({ level, role, tone, className, ...rest }: HeadingProps) {
  const Tag = tags[level];
  return (
    <Tag
      className={cx(
        'm-0',
        typeClass[role ?? defaultRole[level]],
        tone && toneClass[tone],
        className,
      )}
      {...rest}
    />
  );
}
