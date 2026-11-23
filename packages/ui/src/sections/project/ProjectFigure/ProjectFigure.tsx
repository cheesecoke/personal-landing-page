import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';

import { Caption, cx } from '../../../primitives';

/** An image, passed in by the page. `sources` are smaller modern formats for a `<picture>`. */
export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  /** Empty only when the image is decoration. */
  alt: string;
  sources?: readonly { src: string; type: string }[];
}

/**
 * Where the subject sits in the image, as pixel rows: everything above `top` and below `bottom`
 * is empty studio ground.
 */
export interface FigureCrop {
  top: number;
  bottom: number;
}

/**
 * The margins that pull an image's empty ground out of the layout, from the project boards: keep
 * 3% of the height above the subject, and put the caption 20px below the subject's bottom edge.
 * Percentages are of the figure's width, so they hold at every size. Nothing is ever cut off.
 */
export function cropMargins(
  image: Pick<ProjectImage, 'width' | 'height'>,
  crop: FigureCrop,
): { image: CSSProperties; caption: CSSProperties } {
  const top = (Math.max(0, crop.top - 0.03 * image.height) / image.width) * 100;
  const bottom = ((image.height - crop.bottom) / image.width) * 100;
  return {
    image: { marginTop: `-${top.toFixed(2)}%` },
    caption: { marginTop: `calc(20px - ${bottom.toFixed(2)}%)` },
  };
}

export interface ProjectFigureProps extends Omit<ComponentPropsWithoutRef<'figure'>, 'children'> {
  image: ProjectImage;
  /** One line under the image, in the label style. */
  caption?: ReactNode;
  /** Trims the empty ground above and below the subject (see `cropMargins`). */
  crop?: FigureCrop;
  /** Rounds the image's corners: a screen capture, not a studio image. */
  rounded?: boolean;
  /** Load the image only when it nears the viewport. Default `true`; `false` for a hero. */
  lazy?: boolean;
  captionClassName?: string;
}

/**
 * A project image with its caption. The image sits straight on the page: no border, card or
 * shadow. It fills its slot and keeps its shape.
 */
export function ProjectFigure({
  image,
  caption,
  crop,
  rounded = false,
  lazy = true,
  className,
  captionClassName,
  ...rest
}: ProjectFigureProps) {
  const margins = crop ? cropMargins(image, crop) : undefined;
  const img = (
    <img
      src={image.src}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={lazy ? 'lazy' : undefined}
      className={cx('block h-auto w-full max-w-full', rounded && 'rounded-button')}
      style={margins?.image}
    />
  );
  return (
    <figure className={cx('relative m-0 min-w-0', className)} {...rest}>
      {image.sources?.length ? (
        <picture>
          {image.sources.map((source) => (
            <source key={source.src} srcSet={source.src} type={source.type} />
          ))}
          {img}
        </picture>
      ) : (
        img
      )}
      {caption ? (
        <Caption className={cx('mt-5', captionClassName)} style={margins?.caption}>
          {caption}
        </Caption>
      ) : null}
    </figure>
  );
}
