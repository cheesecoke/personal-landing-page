import {
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { cx, Heading, Panel, Readout, VisuallyHidden } from '../../../primitives';
import { useFirstView } from '../internal/useFirstView';
import styles from './BranchRings.module.css';
import { RING_THICKNESS, ringGeometry, type RingWeight } from './ringGeometry';

/** One ring: a stretch of work, or a release once the project is live. */
export interface RingData {
  id: string;
  /** The stretch it covers ("2026 Q4") or the version. */
  label: string;
  /** How busy the stretch was, in four steps. Never a raw count. */
  weight: RingWeight;
  kind: 'period' | 'release';
  /** One line about it, shown in the readout when the ring is selected. */
  text: string;
}

export interface BranchRingsProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title' | 'children'
> {
  /** The panel's label ("Branch rings"). */
  title: ReactNode;
  /** The readout on the right of the header ("Growing: this quarter", "No ring growing"). */
  status?: ReactNode;
  /** Oldest first: the first ring is at the centre. With none, the panel renders nothing. */
  rings: readonly RingData[];
  /**
   * How far the current stretch has grown, 0 to 1: the teal arc on the outline. 0 or left out:
   * no ring is growing and no arc is drawn.
   */
  growing?: number;
  /** The line under the panel ("Branch section · Duo Decide. Each ring is a quarter of work."). */
  note?: ReactNode;
  /** Thickness as a word, read out after each ring's label ("lean", "busy"). */
  weightLabels?: Record<RingWeight, string>;
  /** The ring selected on first render. Default: the newest. */
  defaultSelected?: string;
}

/** What moves, for the Motion docs block. */
export const motion = {
  select: 'Selecting a ring cross-fades its colour over `hover`.',
  arc: 'The teal arc draws once, the first time the panel scrolls into view, over `mark-arc`.',
  reduced: 'Instant: no cross-fade, the arc is drawn.',
} as const;

/**
 * Branch rings: the project's branch cross-section. One ring per stretch of work (or per release
 * once live), thickness is how busy it was, and the teal arc is the stretch still growing. The
 * drawing is decoration; the control is the ring list (buttons with `aria-pressed`, newest first),
 * and the readout under it announces the selected ring. The ring stacks above its list in a narrow
 * slot. With no rings it renders nothing.
 */
export function BranchRings({
  title,
  status,
  rings,
  growing = 0,
  note,
  weightLabels,
  defaultSelected,
  className,
  ...rest
}: BranchRingsProps) {
  const headingId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const arc = useFirstView(ref, { parent: true });
  const [picked, setPicked] = useState<string | undefined>(defaultSelected);

  if (rings.length === 0) return null;

  const selected = rings.find((ring) => ring.id === picked) ?? rings[rings.length - 1]!;
  const geometry = ringGeometry(rings.map((ring) => ring.weight));
  const grown = Math.max(0, Math.min(1, growing));
  const rows = [...rings].reverse();

  return (
    <Panel
      as="section"
      aria-labelledby={headingId}
      data-arc={arc}
      className={cx(
        styles.panel,
        'flex max-w-[680px] flex-col gap-5.5 px-[clamp(18px,3vw,32px)] pt-6 pb-5.5',
        className,
      )}
      {...rest}
    >
      <div ref={ref} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
        <Heading level={2} role="label" tone="secondary" id={headingId}>
          {title}
        </Heading>
        {status ? (
          <Readout kind="status" tone="secondary">
            {status}
          </Readout>
        ) : null}
      </div>
      <div className={styles.grid}>
        <svg
          aria-hidden="true"
          viewBox="0 0 280 280"
          fill="none"
          className="mx-auto block h-auto w-full max-w-[260px]"
        >
          <circle cx={140} cy={140} r={geometry.core} className="fill-bone" />
          {geometry.rings.map((ring, index) => {
            const on = rings[index]!.id === selected.id;
            return (
              <circle
                key={rings[index]!.id}
                data-ring={on ? 'selected' : ''}
                cx={140}
                cy={140}
                r={ring.r}
                strokeWidth={ring.width}
                strokeOpacity={on ? 1 : 0.55}
                className={cx(styles.ring, on ? 'stroke-hinoki' : 'stroke-cedar')}
              />
            );
          })}
          <circle cx={140} cy={140} r={geometry.outer} strokeWidth={1} className="stroke-tick" />
          {grown > 0 ? (
            <circle
              data-growing=""
              cx={140}
              cy={140}
              r={geometry.outer}
              strokeWidth={2.4}
              strokeLinecap="round"
              pathLength={100}
              transform="rotate(-90 140 140)"
              className={cx(styles.arc, 'stroke-signal')}
              style={{ '--arc': Math.round(grown * 100) } as CSSProperties}
            />
          ) : null}
        </svg>
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col">
            {rows.map((ring) => {
              const on = ring.id === selected.id;
              return (
                <button
                  key={ring.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(ring.id)}
                  className={cx(
                    styles.row,
                    'grid min-h-touch cursor-pointer grid-cols-[36px_minmax(0,1fr)] items-center gap-3.5 border-0 border-t border-solid border-hairline bg-transparent px-0 py-2 text-left',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      styles.bar,
                      'block rounded-[1px]',
                      on ? 'bg-hinoki opacity-100' : 'bg-cedar opacity-70',
                    )}
                    style={{ height: RING_THICKNESS[ring.weight] }}
                  />
                  <span className="type-readout-status text-inherit">
                    {ring.label}
                    {weightLabels ? (
                      <VisuallyHidden>, {weightLabels[ring.weight]}</VisuallyHidden>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            aria-live="polite"
            className="flex min-h-[86px] flex-col gap-1.5 border-t border-hairline pt-4"
          >
            <Readout kind="status" tone="warm">
              {selected.label}
            </Readout>
            <p className="m-0 text-[15px] leading-normal text-primary">{selected.text}</p>
          </div>
        </div>
      </div>
      {note ? (
        <p className="m-0 font-readout text-[12px] leading-normal font-medium tracking-[0.04em] text-secondary">
          {note}
        </p>
      ) : null}
    </Panel>
  );
}
