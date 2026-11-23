import type { CSSProperties, ReactNode } from 'react';

import { ConfirmMarker, cx } from '../../../primitives';
import { beyondIcons, type BeyondIconName } from './beyondIcons';
import styles from './BeyondSlots.module.css';

/** Where a slot sits on the scene, in percent of the scene's width and height. */
export interface BeyondSlotPosition {
  left: number;
  top: number;
  width: number;
}

/** The board's four places, one on each arc, from the stump outwards. */
export const beyondSlotPositions: BeyondSlotPosition[] = [
  { left: 38.889, top: 77.075, width: 12 },
  { left: 52.431, top: 67.219, width: 12 },
  { left: 65.972, top: 57.391, width: 12 },
  { left: 79.167, top: 47.126, width: 10.5 },
];

export interface BeyondSlot {
  /** An id for links that land on the slot (`one-rep`). */
  id?: string;
  title: ReactNode;
  text: ReactNode;
  /** One of the board's drawings, or your own 34 x 24 drawing. */
  icon: BeyondIconName | ReactNode;
  /** `sm`: a smaller slot, for the outermost arc. Default `md`. */
  size?: 'md' | 'sm';
  /** A fact about this slot that is not confirmed yet: shown as a marker before the text. */
  confirm?: ReactNode;
  /** Where it sits on the wide scene. Default: the board's place for its position in the list. */
  position?: BeyondSlotPosition;
}

export interface BeyondSlotsProps {
  /** The section's accessible name ("What will be here"). */
  'aria-label': string;
  /** The stump image behind the slots. Decoration: it has no alt text. */
  art: { src: string; width?: number; height?: number };
  /** Up to four slots, nearest the stump first. */
  slots: BeyondSlot[];
  /**
   * Slide the wide scene 230px up under the page header before it, as on the board. The header
   * then needs `relative z-1` to stay above the art. Default `true`.
   */
  overlap?: boolean;
  className?: string;
}

// The arcs: four ellipses around the stump's centre, alternately dashed. One slot sits on each.
const arcs = [
  { rx: 520, ry: 218.4, opacity: 0.5, dash: '4 8' },
  { rx: 760, ry: 319.2, opacity: 0.38, dash: '2 9' },
  { rx: 1000, ry: 420, opacity: 0.28, dash: '4 8' },
  { rx: 1240, ry: 520.8, opacity: 0.2, dash: '2 9' },
];

const isIconName = (icon: BeyondSlot['icon']): icon is BeyondIconName =>
  typeof icon === 'string' && icon in beyondIcons;
const pct = (value: number) => `${value}%`;

/**
 * What Beyond will hold, as placeholders: each slot sits on an arc running out from the stump,
 * with a light breathing at its point. It is full width, outside the page container. In a slot
 * narrower than 1180px the art becomes a band and the slots a list under it.
 */
export function BeyondSlots({
  'aria-label': ariaLabel,
  art,
  slots,
  overlap = true,
  className,
}: BeyondSlotsProps) {
  return (
    <div className={cx(styles.root, className)}>
      <section aria-label={ariaLabel} className={cx(styles.scene, overlap && styles.overlap)}>
        <div aria-hidden="true" className={styles.art}>
          <img
            src={art.src}
            width={art.width}
            height={art.height}
            alt=""
            className={styles.stump}
          />
          <svg viewBox="0 0 1440 600" preserveAspectRatio="none" className={styles.arcs}>
            {arcs.map((arc) => (
              <ellipse
                key={arc.rx}
                cx={164}
                cy={604}
                rx={arc.rx}
                ry={arc.ry}
                strokeOpacity={arc.opacity}
                strokeDasharray={arc.dash}
                vectorEffect="non-scaling-stroke"
                className={styles.arc}
              />
            ))}
          </svg>
        </div>
        <ul className={styles.list}>
          {slots.map((slot, index) => {
            const position = slot.position ?? beyondSlotPositions[index];
            const small = slot.size === 'sm';
            const style = {
              '--slot-left': position ? pct(position.left) : undefined,
              '--slot-top': position ? pct(position.top) : undefined,
              '--slot-width': position ? pct(position.width) : undefined,
              // Each light is a quarter of a breath behind the one before it.
              '--slot-phase': (-index * 2.2) / 9,
            } as CSSProperties;
            return (
              <li key={index} id={slot.id} className={styles.slot} style={style}>
                <div aria-hidden="true" className={cx(styles.point, small && styles.pointSmall)}>
                  <span className={styles.pointBase} />
                  <span className={styles.pointLight} />
                </div>
                <div aria-hidden="true" className={styles.stem} />
                <div className={styles.body}>
                  <div aria-hidden="true" className={cx(styles.icon, small && styles.iconSmall)}>
                    {isIconName(slot.icon) ? beyondIcons[slot.icon] : slot.icon}
                  </div>
                  <h2 className={cx('m-0 type-h3', small && styles.titleSmall)}>{slot.title}</h2>
                  <p className={cx(styles.text, small && styles.textSmall)}>
                    {slot.confirm ? (
                      <>
                        <ConfirmMarker className="text-[12px]">{slot.confirm}</ConfirmMarker>{' '}
                      </>
                    ) : null}
                    {slot.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
