import type { ReactNode } from 'react';

import { Section } from '../../../layout';
import { cx } from '../../../primitives';
import { ProjectFigure, type FigureCrop, type ProjectImage } from '../ProjectFigure/ProjectFigure';

export interface DetailsFigure {
  image: ProjectImage;
  caption?: ReactNode;
  crop?: FigureCrop;
}

export interface DetailsStripProps {
  /** The section's accessible name ("Details"). */
  label: string;
  /** One figure, or two side by side. Ignored when `children` is given. */
  figures?: readonly DetailsFigure[];
  /** Caps a single figure at 820px, as on the PAS board. */
  narrow?: boolean;
  /** Anything else that sits in the details slot (a drawn diagram) in place of figures. */
  children?: ReactNode;
  id?: string;
  className?: string;
}

/**
 * The details strip: one or two closer looks under the log. Two figures sit side by side; in a
 * narrow slot they become a strip you swipe (and can reach and scroll with the keyboard). It has
 * no node on the thread. With nothing to show it renders nothing.
 */
export function DetailsStrip({
  label,
  figures = [],
  narrow = false,
  children,
  id,
  className,
}: DetailsStripProps) {
  if (!children && figures.length === 0) return null;
  const pair = !children && figures.length > 1;
  return (
    <Section
      id={id}
      aria-label={label}
      space="details"
      className={cx('@container z-1 scroll-mt-6', className)}
    >
      {children ??
        (pair ? (
          <div
            role="group"
            aria-label={label}
            tabIndex={0}
            data-strip=""
            className="grid grid-cols-2 gap-6 @max-md:flex @max-md:snap-x @max-md:snap-mandatory @max-md:gap-4 @max-md:overflow-x-auto @max-md:pb-2"
          >
            {figures.map((figure) => (
              <ProjectFigure
                key={figure.image.src}
                image={figure.image}
                caption={figure.caption}
                crop={figure.crop}
                className="@max-md:flex-[0_0_82%] @max-md:snap-start"
              />
            ))}
          </div>
        ) : (
          <ProjectFigure
            image={figures[0]!.image}
            caption={figures[0]!.caption}
            crop={figures[0]!.crop}
            className={cx(narrow && 'max-w-[820px]')}
          />
        ))}
    </Section>
  );
}
