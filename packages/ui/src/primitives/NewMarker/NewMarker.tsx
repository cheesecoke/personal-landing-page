import { useSyncExternalStore, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { cx } from '../cx';
import { StatusDot, type Status } from '../StatusDot/StatusDot';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import { newMark, type NewMarkInput } from './newMark';

const subscribe = () => () => {};

/**
 * `false` on the server and on the first client render, `true` after hydration. The mark depends
 * on today's date, which only the browser knows: without script nothing shows.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

// Appears by fading in (ring and label). Under reduced motion it is simply there.
const fadeIn =
  'motion-ok:transition-opacity motion-ok:duration-fresh-in motion-ok:ease-standard motion-ok:starting:opacity-0';

export interface NewMarkerRingProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  /** How much of the ring is left: the dash length out of 100 (from `newMark`). */
  dash: number;
}

/**
 * The ring alone: a thin Hinoki ring on a Tick track, 14px, centred on the 6px status dot it is
 * placed inside (`<StatusDot><NewMarkerRing /></StatusDot>`). It draws inside the dot's existing
 * box, so nothing moves when it appears. Hidden from assistive technology.
 */
export function NewMarkerRing({ dash, className, ...rest }: NewMarkerRingProps) {
  return (
    <svg
      aria-hidden="true"
      data-new-ring=""
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      className={cx('pointer-events-none absolute -top-1 -left-1 max-w-none', fadeIn, className)}
      {...rest}
    >
      <circle cx={7} cy={7} r={6} className="stroke-fresh-track" strokeWidth={1} />
      <circle
        cx={7}
        cy={7}
        r={6}
        className="stroke-fresh-ring"
        strokeWidth={1.3}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${dash} 100`}
        transform="rotate(-90 7 7)"
      />
    </svg>
  );
}

export interface NewMarkerLabelProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** What the eye reads ("New · 3d"). */
  text: string;
  /** What a screen reader reads ("New, updated 3 days ago"). */
  spoken: string;
  /** Extra detail after the age, shown and read out (a release's version: "v1.0.0"). */
  detail?: ReactNode;
}

/**
 * The readout beside the status: "New · 3d". The word "New" is always there, so colour is never
 * the only signal. It is page content, not an announcement: no live region.
 */
export function NewMarkerLabel({ text, spoken, detail, className, ...rest }: NewMarkerLabelProps) {
  return (
    <span
      data-new-label=""
      className={cx('type-readout-status text-fresh-ring', fadeIn, className)}
      {...rest}
    >
      <span aria-hidden="true">
        {text}
        {detail ? <> · {detail}</> : null}
      </span>
      <VisuallyHidden>
        {spoken}
        {detail ? <>, {detail}</> : null}
      </VisuallyHidden>
    </span>
  );
}

export interface NewMarkerProps
  extends NewMarkInput, Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** The status dot the ring is drawn around. */
  status?: Status;
  /** Extra detail after the age (a release's version). */
  detail?: ReactNode;
  /**
   * Whether the page has hydrated. Leave it out: the component finds out by itself. Pass `false`
   * to see what a reader without script gets (nothing).
   */
  hydrated?: boolean;
}

/**
 * The new mark: a growth ring around the status dot that drains as the change gets older, and a
 * readout beside it. It takes plain numbers (the age and the lifetime, in days); working those
 * out from dates is the freshness provider's job. Renders nothing when the mark has run out, and
 * nothing before hydration.
 */
export function NewMarker({
  ageDays,
  lifeDays,
  status = 'live',
  detail,
  hydrated,
  className,
  ...rest
}: NewMarkerProps) {
  const detected = useHydrated();
  const mark = newMark({ ageDays, lifeDays });
  if (!(hydrated ?? detected) || !mark) return null;
  return (
    <span className={cx('inline-flex items-center gap-2', className)} {...rest}>
      {/* The dot sits in the ring's 14px box, as on the New marker board. */}
      <span className="inline-flex size-3.5 flex-none items-center justify-center">
        <StatusDot status={status}>
          <NewMarkerRing dash={mark.dash} />
        </StatusDot>
      </span>
      <NewMarkerLabel text={mark.text} spoken={mark.spoken} detail={detail} />
    </span>
  );
}
