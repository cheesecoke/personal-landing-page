import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cx } from '../internal/cx';

export type ContainerWidth = 'page' | 'project' | 'wide' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. Default `div`. */
  as?: ElementType;
  /**
   * `page`: the page column, 1200px of content plus the gutter each side (the nav, the footer,
   * Home, Projects, About, Beyond, Contact).
   * `project`: the narrower column of a project page, 1200px including the gutters.
   * `wide`: the 1440px full-bleed band, no gutter (the map, the Beyond scene).
   * `full`: no max width, no gutter.
   */
  width?: ContainerWidth;
  /**
   * Make this a query container, so children can respond to its width with `@sm:` / `@md:` /
   * `@lg:` / `@xl:` instead of the viewport. Default `false`.
   */
  query?: boolean;
  children?: ReactNode;
}

const widthClass: Record<ContainerWidth, string> = {
  page: 'mx-auto w-full max-w-[calc(var(--container-max)+2*var(--gutter))] px-gutter',
  project: 'mx-auto w-full max-w-page px-gutter',
  wide: 'mx-auto w-full max-w-[1440px]',
  full: 'w-full',
};

/** The page column: centred, capped by the container token, padded by the fluid gutter. */
export function Container({
  as: Tag = 'div',
  width = 'page',
  query = false,
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cx('box-border', widthClass[width], query && '@container', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
