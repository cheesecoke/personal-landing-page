import type { CSSProperties, ElementType } from 'react';

import { cx } from '../../../primitives';
import styles from './StumpHero.module.css';

/** The dot beside a ring callout's name: `signal` for now, `ember` for the fire ring. */
export type ArCalloutTone = 'signal' | 'ember';

export interface ArCalloutProps {
  /** What the mark is ("PAS · Atti", "Titan Intake"). */
  name: string;
  /** The readout under it: a status word ("Daily use") or a date ("2022–24"). From data. */
  status: string;
  /** A project callout links to its page. Without it the callout is plain text. */
  href?: string;
  /** A ring callout carries a dot in the ring's colour. */
  tone?: ArCalloutTone;
  /**
   * `side`: to the right of its point (project nodes). `above`: centred over it (rings).
   * `aboveShifted`: over it, pulled left to stay inside a frame that cuts the image's right side.
   */
  placement?: 'side' | 'above' | 'aboveShifted';
  /** The element or component for the link. Default `a`. It receives `href`. */
  linkAs?: ElementType;
  className?: string;
  /** Position: `left` and `top` as percentages of the image. */
  style?: CSSProperties;
}

/**
 * One label on the stump's AR overlay: a name and a status readout on a dim plate, so they stay
 * readable over the render.
 */
export function ArCallout({
  name,
  status,
  href,
  tone,
  placement = 'side',
  linkAs: Link = 'a',
  className,
  style,
}: ArCalloutProps) {
  const text = (
    <>
      <span className={styles.calloutName}>
        {tone ? <span aria-hidden="true" data-tone={tone} className={styles.calloutDot} /> : null}
        {name}
      </span>
      <span className={styles.calloutStatus}>{status}</span>
    </>
  );

  if (href !== undefined) {
    return (
      <Link href={href} className={cx(styles.calloutLink, className)} style={style}>
        <span className={styles.calloutPlate}>{text}</span>
      </Link>
    );
  }
  return (
    <p
      className={cx(
        styles.callout,
        styles.calloutPlate,
        placement === 'aboveShifted' && styles.calloutShift,
        className,
      )}
      style={style}
    >
      {text}
    </p>
  );
}
