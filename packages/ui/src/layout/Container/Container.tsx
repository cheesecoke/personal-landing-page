import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cx } from '../internal/cx';

export type ContainerWidth = 'page' | 'wide' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. Default `div`. */
  as?: ElementType;
  /**
   * `page`: the 1200px page column with the gutter (every board's main column).
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
  page: 'mx-auto w-full max-w-page px-gutter',
  wide: 'mx-auto w-full max-w-[1440px]',
  full: 'w-full',
};

/** The page column: centred, capped at the container token, padded by the fluid gutter. */
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
