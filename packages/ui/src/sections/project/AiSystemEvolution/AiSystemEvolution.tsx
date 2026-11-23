import { useId, type CSSProperties, type ReactNode } from 'react';

import { Section, ThreadSection, type LinkComponent } from '../../../layout';
import { cx, Heading, Readout, Text } from '../../../primitives';
import { stampToIso } from '../ArtifactList/ArtifactList';
import { ProjectFigure, type FigureCrop, type ProjectImage } from '../ProjectFigure/ProjectFigure';
import styles from './AiSystemEvolution.module.css';

/**
 * One stop on the timeline. A dated stop has `stamp` and `date`; the last stop, the version that
 * has not grown yet, has a `tag` instead ("Next version") and usually a link.
 */
export interface EvolutionStop {
  /** The stardate as printed ("2026.130"). */
  stamp?: string;
  /** The day as printed ("10 May 2026"). */
  date?: string;
  /** The ISO day, for `<time>`. Default: worked out from the stamp. */
  dateTime?: string;
  /** Printed in place of a date ("Next version"). */
  tag?: string;
  title: ReactNode;
  text?: ReactNode;
  link?: { label: string; href: string };
}

export interface AiSystemEvolutionProps {
  /** The section label ("From the first pipeline to Distill"). */
  title: ReactNode;
  /** Accessible name of the list ("Milestones, oldest first"). */
  label: string;
  /** Oldest first. */
  stops: readonly EvolutionStop[];
  /** The capture under the timeline. */
  figure?: { image: ProjectImage; caption?: ReactNode; crop?: FigureCrop };
  /**
   * The block the last stop links to: the next version in a paragraph or two, under its own
   * heading with a dashed ring (it has not grown yet).
   */
  next?: { id: string; title: ReactNode; paragraphs: readonly ReactNode[] };
  /** The anchor of the timeline ("timeline"). */
  id?: string;
  /** The element used for links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  /** Put a node on the thread beside the section. Default `true`. */
  node?: boolean;
  className?: string;
}

/**
 * How the AI system grew: dated stops on one line, oldest first, ending at the next version (a
 * dashed ring: not yet grown), with a capture of the board under it and, after that, the block the
 * last stop links to. The line runs down the side in a narrow slot and across the top in a wide
 * one. Nothing here moves.
 */
export function AiSystemEvolution({
  title,
  label,
  stops,
  figure,
  next,
  id,
  linkAs,
  node = true,
  className,
}: AiSystemEvolutionProps) {
  const headingId = useId();
  const nextId = useId();
  const Wrapper = node ? ThreadSection : Section;
  const Link = linkAs ?? 'a';
  return (
    <>
      <Wrapper id={id} aria-labelledby={headingId} className={cx('z-1 scroll-mt-6', className)}>
        <Heading level={2} role="label" id={headingId} className="mb-7">
          {title}
        </Heading>
        <div className={styles.root}>
          <ol
            aria-label={label}
            className={styles.list}
            style={{ '--stops': stops.length } as CSSProperties}
          >
            {stops.map((stop, index) => (
              <li key={index} className={styles.stop} data-stop={stop.tag ? 'next' : 'dated'}>
                <span aria-hidden="true" className={cx(styles.dot, stop.tag && styles.dotNext)} />
                {stop.tag ? (
                  <Readout kind="status" tone="signal" className="text-[10px] leading-[18px]">
                    {stop.tag}
                  </Readout>
                ) : (
                  <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    {stop.stamp ? (
                      <Readout kind="stardate" className="text-[18px] leading-none">
                        {stop.stamp}
                      </Readout>
                    ) : null}
                    {stop.date ? (
                      <Readout
                        kind="date"
                        dateTime={
                          stop.dateTime ?? (stop.stamp ? stampToIso(stop.stamp) : undefined)
                        }
                        className="text-[10px]"
                      >
                        {stop.date}
                      </Readout>
                    ) : null}
                  </span>
                )}
                <Heading level={3} className="mt-1 text-[17px] leading-[1.3]">
                  {stop.title}
                </Heading>
                {stop.text ? (
                  <p className="m-0 text-[15px] leading-normal text-secondary">{stop.text}</p>
                ) : null}
                {stop.link ? (
                  <Link
                    href={stop.link.href}
                    className="inline-flex min-h-touch items-center gap-2.5 self-start text-[15px] text-primary underline decoration-signal-dim underline-offset-4 hover:text-signal motion-ok:transition-colors motion-ok:duration-hover"
                  >
                    {stop.link.label}
                    <svg
                      aria-hidden="true"
                      width={12}
                      height={14}
                      viewBox="0 0 12 14"
                      fill="none"
                      stroke="currentColor"
                      className="flex-none"
                    >
                      <path d="M6 0v12M1 7l5 5 5-5" />
                    </svg>
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
        {figure ? (
          <ProjectFigure
            image={figure.image}
            caption={figure.caption}
            crop={figure.crop}
            rounded
            className="mt-[clamp(40px,4vw,56px)] max-w-[1040px]"
          />
        ) : null}
      </Wrapper>
      {next ? (
        <Section
          id={next.id}
          aria-labelledby={nextId}
          space="details"
          className="z-1 max-w-[640px] scroll-mt-6"
        >
          <Heading level={2} id={nextId} className="mb-3 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="box-border size-[13px] flex-none rounded-full border border-dashed border-signal"
            />
            {next.title}
          </Heading>
          {next.paragraphs.map((paragraph, index) => (
            <Text key={index} measure className={cx(index > 0 && 'mt-4')}>
              {paragraph}
            </Text>
          ))}
        </Section>
      ) : null}
    </>
  );
}
