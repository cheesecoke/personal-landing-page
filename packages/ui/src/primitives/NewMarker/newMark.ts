export interface NewMarkInput {
  /** Whole days since the change. 0 is today. */
  ageDays: number;
  /** How many days this kind of change stays marked. */
  lifeDays: number;
}

export interface NewMark {
  /** How much of the ring is left, as the dash length out of 100 (never under 4). */
  dash: number;
  /** What the eye reads: "New · today", "New · 3d". */
  text: string;
  /** What a screen reader reads: "New, updated 3 days ago". */
  spoken: string;
}

/**
 * The drawing rule for a new mark, from the New marker board:
 *   left  = 1 - age / life
 *   ring  = left > 0 ? max(4, round(left * 100)) of 100 : nothing
 *   label = "New · today" on day 0, "New · <age>d" after
 * Returns `null` when there is nothing to draw: the mark has run out, or the numbers make no sense
 * (a date in the future, a zero lifetime).
 */
export function newMark({ ageDays, lifeDays }: NewMarkInput): NewMark | null {
  if (!Number.isFinite(ageDays) || !Number.isFinite(lifeDays)) return null;
  const age = Math.floor(ageDays);
  if (age < 0 || lifeDays <= 0) return null;
  const left = 1 - age / lifeDays;
  if (left <= 0) return null;
  return {
    dash: Math.max(4, Math.round(left * 100)),
    text: age === 0 ? 'New · today' : `New · ${age}d`,
    spoken:
      age === 0 ? 'New, updated today' : `New, updated ${age} ${age === 1 ? 'day' : 'days'} ago`,
  };
}
