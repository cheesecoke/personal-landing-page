import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx } from '../../../primitives';
import type { ProjectImage } from '../ProjectFigure/ProjectFigure';

export interface HeroCaptureProps extends Omit<ComponentPropsWithoutRef<'figure'>, 'children'> {
  image: ProjectImage;
  /** What the capture shows, in a sentence. */
  caption?: ReactNode;
  /** A second, quieter line in the label style ("Working title in the app: Life Inbox."). */
  captionNote?: ReactNode;
}

/**
 * A hero that is a real capture with a sentence under it (Lifebox). Unlike `HeroFigure` it does
 * not bleed: it stays in the column, 600px at most, and sits to the right beside the title on a
 * wide page. Place it in `ProjectOpening`.
 */
export function HeroCapture({ image, caption, captionNote, className, ...rest }: HeroCaptureProps) {
  return (
    <figure
      className={cx(
        'relative z-1 m-0 mt-8 flex min-w-0 flex-col gap-4 @[864px]:mt-0 @[864px]:items-end',
        className,
      )}
      {...rest}
    >
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        className="block h-auto w-full max-w-[600px]"
      />
      {caption || captionNote ? (
        <figcaption className="flex w-full max-w-[600px] flex-col gap-2">
          {caption ? (
            <span className="text-[15px] leading-normal text-primary">{caption}</span>
          ) : null}
          {captionNote ? <span className="type-label">{captionNote}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
