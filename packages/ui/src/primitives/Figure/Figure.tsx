import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Caption } from '../Caption/Caption';
import { cx } from '../cx';

export interface FigureProps extends ComponentPropsWithoutRef<'figure'> {
  /** The image, video or drawing. An `<img>` or `<video>` child fills the width and keeps its shape. */
  children: ReactNode;
  /** One line under it, 20px clear of the image. */
  caption?: ReactNode;
  captionClassName?: string;
}

/**
 * An image with its caption. Project imagery already sits on a near-black ground: the figure adds
 * no border, card or shadow, so the image floats on the page.
 */
export function Figure({ caption, captionClassName, className, children, ...rest }: FigureProps) {
  return (
    <figure
      className={cx(
        'm-0 min-w-0 [&>img]:block [&>img]:h-auto [&>img]:w-full [&>img]:max-w-full [&>video]:block [&>video]:h-auto [&>video]:w-full [&>video]:max-w-full',
        className,
      )}
      {...rest}
    >
      {children}
      {caption ? <Caption className={cx('mt-5', captionClassName)}>{caption}</Caption> : null}
    </figure>
  );
}
