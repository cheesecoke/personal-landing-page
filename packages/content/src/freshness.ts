import { fresh as freshTokens } from '@cwc/tokens';

import type { Fresh, FreshChangeKind } from './schema/shoot';

/** Whole calendar days from one `YYYY-MM-DD` to another (negative if `to` is earlier). */
export const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/**
 * How many days a marker lives, by kind of change. The numbers are design tokens. A `state` change
 * has no lifetime of its own in the design, so it lives as long as an update.
 */
export const freshLifetime = (kind: FreshChangeKind): number =>
  kind === 'state' ? freshTokens.life.update : freshTokens.life[kind];

/** The longest any marker lives. An item older than this never needs a marker slot. */
export const maxFreshLifetime = Math.max(...Object.values(freshTokens.life));

/** A marker that should show: how old the change is and how much of its life is left. */
export interface FreshMark {
  changedAt: string;
  changeKind: FreshChangeKind;
  /** Whole days since the change. 0 is today. */
  ageDays: number;
  lifeDays: number;
  /** The share of the lifetime left, above 0 and at most 1. The ring drains to this. */
  remaining: number;
}

/**
 * The marker for one item on the day `now`, or null when there is nothing to mark or the marker
 * has run out. It shows on day 0 and through the last day (`lifeDays - 1`), and is gone after.
 * A date ahead of `now` (a clock that is behind) counts as today.
 */
export function freshMark(fresh: Fresh | undefined, now: string): FreshMark | null {
  if (!fresh) return null;
  const ageDays = Math.max(0, daysBetween(fresh.changedAt, now));
  const lifeDays = freshLifetime(fresh.changeKind);
  const remaining = 1 - ageDays / lifeDays;
  if (remaining <= 0) return null;
  return { changedAt: fresh.changedAt, changeKind: fresh.changeKind, ageDays, lifeDays, remaining };
}

/**
 * Something on a page that could carry a marker. `id` is unique on the page. `project` groups
 * candidates that count as one project: the family's top slug when a parent and its children
 * should share one mark.
 */
export interface FreshCandidate {
  id: string;
  project: string;
  fresh: Fresh | undefined;
}

/**
 * Which markers show on a page, by candidate id.
 *
 * 1. Expired markers are dropped (lifetime by kind of change).
 * 2. One mark per project: its newest change.
 * 3. At most `cap` on the page: the newest.
 *
 * Ties keep the order the candidates were given in, which is page order.
 */
export function selectFreshMarks(
  candidates: readonly FreshCandidate[],
  now: string,
  cap: number = freshTokens.cap,
): Record<string, FreshMark> {
  const newestFirst = (a: { mark: FreshMark }, b: { mark: FreshMark }) =>
    a.mark.changedAt < b.mark.changedAt ? 1 : a.mark.changedAt > b.mark.changedAt ? -1 : 0;

  const marked = candidates
    .flatMap((candidate) => {
      const mark = freshMark(candidate.fresh, now);
      return mark ? [{ ...candidate, mark }] : [];
    })
    .sort(newestFirst);

  const projects = new Set<string>();
  const marks: Record<string, FreshMark> = {};
  for (const { id, project, mark } of marked) {
    if (projects.has(project)) continue;
    if (projects.size >= cap) break;
    projects.add(project);
    marks[id] = mark;
  }
  return marks;
}

/** The nav ring: on only while some release is at most `fresh.nav` days old. */
export const hasNavRing = (
  candidates: readonly Pick<FreshCandidate, 'fresh'>[],
  now: string,
): boolean =>
  candidates.some(
    ({ fresh }) =>
      fresh?.changeKind === 'release' &&
      freshMark(fresh, now) !== null &&
      daysBetween(fresh.changedAt, now) <= freshTokens.nav,
  );
