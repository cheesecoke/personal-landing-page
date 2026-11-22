import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx } from '../cx';
import { newMark, type NewMarkInput } from '../NewMarker/newMark';
import { NewMarkerLabel, NewMarkerRing, useHydrated } from '../NewMarker/NewMarker';
import { StatusDot, type Status } from '../StatusDot/StatusDot';

/** The status word's colour: Ash in a page header, Smoke in the index, Bone on its own. */
export type ProjectStateTone = 'primary' | 'secondary' | 'label';

const tones: Record<ProjectStateTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  label: 'text-label',
};

export interface ProjectStateFresh extends NewMarkInput {
  /** Extra detail after the age (a release's version). */
  detail?: ReactNode;
}

export interface ProjectStateBadgeProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** Which dot: `build` (Ember), `live` (Signal), `private` (hollow). */
  status: Status;
  /** The status word ("In build", "Daily use"). Status is always a word plus a dot. */
  label: ReactNode;
  tone?: ProjectStateTone;
  /**
   * The new mark, as plain numbers: age and lifetime in days. `null` or left out: no mark. A mark
   * that has run out draws nothing.
   */
  fresh?: ProjectStateFresh | null;
  /**
   * Keeps an empty slot of fixed width where the new mark's readout goes, so nothing shifts when
   * it appears after hydration. Set it at pre-render for items that might still be fresh.
   */
  reserveMarker?: boolean;
  /** As `NewMarker`'s: leave it out, or pass `false` to see the page without script. */
  hydrated?: boolean;
}

/**
 * A project's state: the status dot, the status word, and room for the new mark. The ring draws
 * around the dot, inside its box; the readout follows the word.
 */
export function ProjectStateBadge({
  status,
  label,
  tone = 'secondary',
  fresh,
  reserveMarker = false,
  hydrated,
  className,
  ...rest
}: ProjectStateBadgeProps) {
  const detected = useHydrated();
  const mark = (hydrated ?? detected) && fresh ? newMark(fresh) : null;
  return (
    <span
      className={cx(
        'inline-flex flex-wrap items-start gap-x-2 gap-y-1 type-readout-status',
        tones[tone],
        className,
      )}
      {...rest}
    >
      <StatusDot status={status} className="mt-[0.41em]">
        {mark ? <NewMarkerRing dash={mark.dash} /> : null}
      </StatusDot>
      <span>{label}</span>
      {mark ? (
        <NewMarkerLabel
          text={mark.text}
          spoken={mark.spoken}
          detail={fresh?.detail}
          className={cx(reserveMarker && 'min-w-[12ch]')}
        />
      ) : reserveMarker ? (
        <span data-new-slot="" aria-hidden="true" className="inline-block min-w-[12ch]" />
      ) : null}
    </span>
  );
}
