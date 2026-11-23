import type { ComponentPropsWithoutRef } from 'react';

import {
  cx,
  newMark,
  NewMarkerLabel,
  Readout,
  useHydrated,
  VisuallyHidden,
} from '../../../primitives';
import { formatLogDate } from '../LogEntry/logDate';

export type ShootKind = 'goal' | 'idea' | 'question';
export type ShootState = 'open' | 'grown' | 'answered' | 'dropped';

/** One goal, idea or question a project has not grown yet, or has since grown or answered. */
export interface ShootData {
  id: string;
  label: string;
  kind: ShootKind;
  state: ShootState;
  /** A status word of its own, shown in place of the kind ("Spec written", "Parked"). */
  note?: string;
  /** What happened, once it has grown or been answered. */
  resolved: { date: string; text: string } | null;
}

export interface ShootLabels {
  /** The word for each kind ("Goal", "Idea", "Question"). */
  kind: Record<ShootKind, string>;
  /** The word for each state ("Not yet grown", "Grown", "Answered"). */
  state: Record<Exclude<ShootState, 'dropped'>, string>;
}

export interface ShootItemProps extends Omit<ComponentPropsWithoutRef<'li'>, 'children'> {
  shoot: ShootData;
  labels: ShootLabels;
  /** The new mark for a shoot that just grew or was answered, as plain numbers. */
  fresh?: { ageDays: number; lifeDays: number } | null;
  /** `raised`: inside a panel (the state word is Ash). `ground`: on the page (Smoke). */
  surface?: 'raised' | 'ground';
  /** As `NewMarker`'s: leave it out, or pass `false` to see the page without script. */
  hydrated?: boolean;
}

/** Open: a dashed stem to a hollow bud. Grown: a solid stem, the bud filled. Answered: a knot. */
function ShootIcon({ state }: { state: Exclude<ShootState, 'dropped'> }) {
  return (
    <svg
      aria-hidden="true"
      width={22}
      height={10}
      viewBox="0 0 22 10"
      fill="none"
      className={cx('block', state === 'grown' ? 'stroke-hinoki' : 'stroke-cedar')}
    >
      {state === 'answered' ? (
        <>
          <path d="M1 5H8" />
          <circle cx={12} cy={5} r={3.6} />
          <circle cx={12} cy={5} r={1.2} className="fill-cedar" stroke="none" />
        </>
      ) : (
        <>
          <path d="M1 5H15" strokeDasharray={state === 'open' ? '3 3' : undefined} />
          <circle cx={18} cy={5} r={2.6} className={cx(state === 'grown' && 'fill-hinoki')} />
        </>
      )}
    </svg>
  );
}

/**
 * One shoot: a goal, idea or question. `open` is dashed, `grown` is solid (and may carry the new
 * mark), `answered` is a knot with its one-line answer, `dropped` is not rendered. The state is
 * always a word; the icon is decoration.
 */
export function ShootItem({
  shoot,
  labels,
  fresh,
  surface = 'raised',
  hydrated,
  className,
  ...rest
}: ShootItemProps) {
  const detected = useHydrated();
  if (shoot.state === 'dropped') return null;
  const { state } = shoot;
  const mark = (hydrated ?? detected) && fresh && state !== 'open' ? newMark(fresh) : null;
  const word = state === 'open' ? (shoot.note ?? labels.kind[shoot.kind]) : labels.state[state];
  const answer = state !== 'open' ? shoot.resolved : null;
  return (
    <li
      data-shoot={state}
      className={cx(
        'grid min-h-9 grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-3 border-t border-[color-mix(in_srgb,var(--line-hairline)_70%,var(--bg-ground))] py-1.5',
        className,
      )}
      {...rest}
    >
      <ShootIcon state={state} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 text-[15px] leading-[1.35] text-primary">
          {shoot.label}
          {state === 'open' ? <VisuallyHidden>, {labels.state.open}</VisuallyHidden> : null}
          {mark ? <NewMarkerLabel text={mark.text} spoken={mark.spoken} /> : null}
        </span>
        {answer ? (
          <span className="text-[14px] leading-normal text-secondary">
            {answer.text}{' '}
            <Readout kind="date" dateTime={answer.date} className="whitespace-nowrap">
              {formatLogDate(answer.date)}
            </Readout>
          </span>
        ) : null}
      </span>
      <Readout
        kind="status"
        tone={surface === 'raised' ? 'secondary' : 'label'}
        className="whitespace-nowrap"
      >
        {word}
      </Readout>
    </li>
  );
}
