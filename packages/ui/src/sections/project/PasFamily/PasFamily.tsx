import { useId, useState, type ReactNode } from 'react';

import { Section, type LinkComponent } from '../../../layout';
import { cx, Readout, VisuallyHidden } from '../../../primitives';
import { ProjectFigure, type FigureCrop, type ProjectImage } from '../ProjectFigure/ProjectFigure';
import styles from './PasFamily.module.css';

/** One ring of the family: a project and the line its readout shows. */
export interface FamilyMember {
  name: string;
  /** The status word ("Daily use", "Experiment"). */
  status: string;
  /** One line about it, shown in the readout. */
  line: string;
  /** The ring's accessible name ("Open Atti, the assistant"). */
  label: string;
  /** Where the ring links to. The outer ring is this page and has none: it is a button. */
  href?: string;
}

export interface PasFamilyProps {
  /** The section's accessible name ("The PAS family"). */
  label: string;
  /** Outer ring first, then the ring inside it, then the innermost. Two or three members. */
  members: readonly FamilyMember[];
  /** The image beside the rings. */
  figure?: { image: ProjectImage; caption?: ReactNode; crop?: FigureCrop };
  /** The element used for the ring links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  id?: string;
  className?: string;
}

/** What moves, for the Motion docs block. */
export const motion = {
  ripple: 'Hover or focus ripples a ring once, over `mark-arc`.',
  connector: 'The connector to the ring inside it draws over `rise`.',
  reduced: 'No ripple; the border and the connector change at once.',
} as const;

const ringClass = [styles.outer, styles.middle, styles.inner];
const lineClass = [styles.lineOuter, styles.lineMiddle];
const nameClass = [
  'top-[7%] type-label font-semibold text-secondary',
  'top-[28%] font-sans text-[24px] font-medium tracking-[-0.02em] text-primary [font-stretch:125%]',
  'top-[61.5%] font-sans text-[11px] font-semibold text-primary',
];

/**
 * The PAS family: the system as nested rings, each a control. Pointing at, focusing or pressing a
 * ring ripples it, draws the connector to the ring inside it and sets the readout beside it; the
 * inner rings are links to their own pages. The readout is a polite live region. The rings sit
 * above the image in a narrow slot and beside it in a wide one.
 */
export function PasFamily({ label, members, figure, linkAs, id, className }: PasFamilyProps) {
  const readoutId = useId();
  const [selected, setSelected] = useState(0);
  const rings = members.slice(0, 3);
  if (rings.length === 0) return null;
  const current = rings[selected] ?? rings[0]!;
  const Link = linkAs ?? 'a';

  return (
    <Section
      id={id}
      aria-label={label}
      space="details"
      className={cx('z-1 scroll-mt-6', styles.root, className)}
    >
      <div className={styles.fam}>
        <div className="flex max-w-80 flex-col gap-5">
          <div className="relative aspect-square w-[min(320px,100%)]">
            {rings.map((member, index) => {
              const show = () => setSelected(index);
              const classes = cx(styles.ring, ringClass[index]);
              return member.href ? (
                <Link
                  key={member.name}
                  href={member.href}
                  aria-describedby={readoutId}
                  onMouseEnter={show}
                  onFocus={show}
                  className={classes}
                >
                  <VisuallyHidden>{member.label}</VisuallyHidden>
                </Link>
              ) : (
                <button
                  key={member.name}
                  type="button"
                  aria-describedby={readoutId}
                  aria-pressed={selected === index}
                  onMouseEnter={show}
                  onFocus={show}
                  onClick={show}
                  className={classes}
                >
                  <VisuallyHidden>{member.label}</VisuallyHidden>
                </button>
              );
            })}
            {rings.slice(0, -1).map((member, index) => (
              <span
                key={member.name}
                aria-hidden="true"
                className={cx(styles.line, lineClass[index])}
              />
            ))}
            {rings.map((member, index) => (
              <span
                key={member.name}
                aria-hidden="true"
                className={cx(
                  'pointer-events-none absolute inset-x-0 text-center',
                  nameClass[index],
                )}
              >
                {member.name}
              </span>
            ))}
          </div>
          <p id={readoutId} aria-live="polite" className="m-0 flex min-h-[66px] flex-col gap-1.5">
            <Readout kind="status" tone="secondary" className="flex items-center gap-2.5">
              <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-status-live" />
              {current.name} · {current.status}
            </Readout>
            <span className="text-[14px] leading-normal text-primary">{current.line}</span>
          </p>
        </div>
        {figure ? (
          <ProjectFigure image={figure.image} caption={figure.caption} crop={figure.crop} />
        ) : null}
      </div>
    </Section>
  );
}
