import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { PageHeader, ThreadNode } from '../../../layout';
import { Caption, cx, VisuallyHidden } from '../../../primitives';
import { cropMargins, type FigureCrop, type ProjectImage } from '../ProjectFigure/ProjectFigure';
import styles from './ProjectOpening.module.css';

export interface ProjectOpeningProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** The page title: the page's one `h1`. */
  title: ReactNode;
  /** Printed under the title, in Ash; read out after a middle dot ("PAS · Atti and Lifebox"). */
  subtitle?: ReactNode;
  /** The status line above the title (a `ProjectStateBadge`). */
  status?: ReactNode;
  /** The sentence under the title. */
  lead?: ReactNode;
  /** The hero beside the title: a `HeroFigure`, a `HeroDrawn`, or any block. */
  children?: ReactNode;
  /** Put a node on the thread beside the title. Default `true`. */
  node?: boolean;
}

/**
 * The opening of a project page: status, title and lead on the left, the hero on the right. They
 * stack until the section is wide enough. The first node on the thread sits beside the status.
 */
export function ProjectOpening({
  title,
  subtitle,
  status,
  lead,
  children,
  node = true,
  className,
  ...rest
}: ProjectOpeningProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={cx('relative', styles.root, className)} {...rest}>
      <div className={styles.open}>
        <div className="relative z-1 flex max-w-[520px] flex-col">
          {node ? <ThreadNode placement="gutter" /> : null}
          <PageHeader
            layout="project"
            titleId={titleId}
            status={status}
            lead={lead}
            title={
              subtitle ? (
                <>
                  {title}
                  <span className="mt-3 block text-[clamp(19px,1.8vw,24px)] leading-[1.2] tracking-[-0.01em] text-secondary [font-stretch:112.5%]">
                    <VisuallyHidden> · </VisuallyHidden>
                    {subtitle}
                  </span>
                </>
              ) : (
                title
              )
            }
          />
        </div>
        {children}
      </div>
    </section>
  );
}

export interface HeroFigureProps extends Omit<ComponentPropsWithoutRef<'figure'>, 'children'> {
  image: ProjectImage;
  caption?: ReactNode;
  /** Trims the empty ground above and below the subject (see `cropMargins`). */
  crop?: FigureCrop;
}

/**
 * The hero image of a project page. It bleeds to the page edges and slides under the title on a
 * wide page; its caption sits right-aligned under it there, left-aligned on a phone.
 */
export function HeroFigure({ image, caption, crop, className, ...rest }: HeroFigureProps) {
  const margins = crop ? cropMargins(image, crop) : undefined;
  const img = (
    <img
      src={image.src}
      width={image.width}
      height={image.height}
      alt={image.alt}
      className="block h-auto w-full max-w-full"
      style={margins?.image}
    />
  );
  return (
    <figure className={cx(styles.hero, className)} {...rest}>
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
        <Caption className={cx('mt-5', styles.cap)} style={margins?.caption}>
          {caption}
        </Caption>
      ) : null}
    </figure>
  );
}

export interface HeroDrawnProps extends Omit<ComponentPropsWithoutRef<'figure'>, 'children'> {
  /** The drawn diagram. Give it `role="img"` and a label of its own. */
  children: ReactNode;
  caption?: ReactNode;
  /** Pad the drawing like the page (the Personal brain zones). `false` when it pads itself. */
  padded?: boolean;
}

/**
 * A drawn hero (a diagram instead of an image). It bleeds like the image on a phone; on a wide
 * page it keeps 32px clear of the title.
 */
export function HeroDrawn({
  children,
  caption,
  padded = true,
  className,
  ...rest
}: HeroDrawnProps) {
  return (
    <figure className={cx(styles.hero, styles.drawn, className)} {...rest}>
      {padded ? <div className={styles.pad}>{children}</div> : children}
      {caption ? <Caption className={cx('mt-5', styles.cap)}>{caption}</Caption> : null}
    </figure>
  );
}
