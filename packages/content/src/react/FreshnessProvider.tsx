import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';

import { hasNavRing, selectFreshMarks, type FreshCandidate, type FreshMark } from '../freshness';
import { isoToday } from '../schema/shared';

/** What a component can ask about freshness. */
export interface Freshness {
  /**
   * The day markers are drawn for, as `YYYY-MM-DD`. Null during pre-render and hydration: the
   * date is set only after hydration, so server and client HTML match and no marker shows
   * without JavaScript.
   */
  now: string | null;
  /** The markers that show on this page, by candidate id. Empty until `now` is set. */
  marks: Readonly<Record<string, FreshMark>>;
  /** The marker for one candidate, or null (expired, over the cap, unknown, or not hydrated). */
  markFor: (id: string) => FreshMark | null;
  /** True while a release among this provider's candidates is at most 7 days old. */
  navRing: boolean;
}

const noMarks: Readonly<Record<string, FreshMark>> = Object.freeze({});
const inert: Freshness = { now: null, marks: noMarks, markFor: () => null, navRing: false };

const FreshnessContext = createContext<Freshness | null>(null);

// "Today" as an external store with no server value: React renders null on the server and while
// hydrating, then re-renders with the real date. No effect, no hydration mismatch.
const subscribe = () => () => {};
const clientToday = () => isoToday();
const serverToday = () => null;

export interface FreshnessProviderProps {
  /**
   * A fixed date (`YYYY-MM-DD`), for Storybook and tests. Leave it out on the site: the browser's
   * date is used once the page has hydrated. A nested provider without `now` uses its parent's.
   */
  now?: string;
  /** Everything on this page that could carry a marker, in page order. */
  candidates?: readonly FreshCandidate[];
  /** Most markers on the page. Defaults to the `fresh.cap` token. */
  cap?: number;
  children: ReactNode;
}

/**
 * Holds "now", ranks the page's candidates and enforces the cap. Non-visual.
 *
 * Put one at the root (it supplies the date; give it every project's `fresh` and it answers
 * `navRing`), and one per page with that page's candidates (it answers `markFor`).
 */
export function FreshnessProvider({ now, candidates, cap, children }: FreshnessProviderProps) {
  const parent = useContext(FreshnessContext);
  const today = useSyncExternalStore(subscribe, clientToday, serverToday);
  const day = now ?? (parent ? parent.now : today);

  const value = useMemo<Freshness>(() => {
    if (day === null) return inert;
    const marks = candidates ? selectFreshMarks(candidates, day, cap) : noMarks;
    return {
      now: day,
      marks,
      markFor: (id) => marks[id] ?? null,
      navRing: candidates ? hasNavRing(candidates, day) : false,
    };
  }, [day, candidates, cap]);

  return <FreshnessContext value={value}>{children}</FreshnessContext>;
}

/** Freshness for the nearest provider. Without one, nothing is ever fresh. */
export const useFreshness = (): Freshness => useContext(FreshnessContext) ?? inert;

/** The marker for one candidate id, or null. */
export const useFreshMark = (id: string): FreshMark | null => useFreshness().markFor(id);
