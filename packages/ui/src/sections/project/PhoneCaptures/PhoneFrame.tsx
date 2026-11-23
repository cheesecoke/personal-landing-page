import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../../../primitives';
import type { ProjectImage } from '../ProjectFigure/ProjectFigure';

export interface PhoneFrameProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** A raw phone capture. */
  image: ProjectImage;
  /** Widest the frame gets, in px (220 or 240 on the boards). */
  maxWidth?: number;
}

/** A raw phone capture inside a thin phone frame. It fills its slot up to `maxWidth`. */
export function PhoneFrame({ image, maxWidth = 240, className, style, ...rest }: PhoneFrameProps) {
  return (
    <div
      className={cx(
        'box-border w-full overflow-hidden rounded-[26px] border border-[color-mix(in_srgb,var(--line-tick)_71%,var(--line-hairline))] bg-raised shadow-panel',
        className,
      )}
      style={{ maxWidth, ...style }}
      {...rest}
    >
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading="lazy"
        className="block h-auto w-full max-w-full"
      />
    </div>
  );
}
