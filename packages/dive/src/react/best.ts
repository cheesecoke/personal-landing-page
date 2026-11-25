import type { DiveResult } from './result';

/** What is kept of a run to compare against the next ones. */
export type BestResult = Pick<
  DiveResult,
  'status' | 'ringsPassed' | 'ringsTotal' | 'livesLeft' | 'clean'
>;

/** Clean win, then any win, then a crash. */
const tier = (r: BestResult) => (r.status === 'won' ? (r.clean ? 2 : 1) : 0);

/**
 * Orders two results: positive when `a` is better. Time is not a score (every finished run takes
 * the same time), so: a clean win beats a win, a win with more lives left beats one with fewer,
 * and any win beats a crash; between crashes the one that threaded more rings is better.
 */
export function compareResults(a: BestResult, b: BestResult): number {
  const byTier = tier(a) - tier(b);
  if (byTier !== 0) return byTier;
  if (a.status === 'won') return a.livesLeft - b.livesLeft;
  return a.ringsPassed - b.ringsPassed;
}

/** True when `next` beats `best` (or there is no best yet). Equal is not better. */
export function isBetter(next: BestResult, best: BestResult | null): boolean {
  return best === null || compareResults(next, best) > 0;
}

const pick = (r: BestResult): BestResult => ({
  status: r.status,
  ringsPassed: r.ringsPassed,
  ringsTotal: r.ringsTotal,
  livesLeft: r.livesLeft,
  clean: r.clean,
});

const count = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0;

/** A stored value, if it is one this code wrote; anything else (old, edited, broken) is null. */
export function parseBest(raw: string | null): BestResult | null {
  if (!raw) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== 'object' || v === null) return null;
    const r = v as Record<string, unknown>;
    if (r.status !== 'won' && r.status !== 'crashed') return null;
    if (!count(r.ringsPassed) || !count(r.ringsTotal) || !count(r.livesLeft)) return null;
    if (typeof r.clean !== 'boolean' || r.ringsPassed > r.ringsTotal) return null;
    return pick(r as unknown as BestResult);
  } catch {
    return null;
  }
}

/** Where the best result is kept. Reads and writes never throw. */
export interface BestStore {
  read: () => BestResult | null;
  /** Keeps `result` if it beats what is stored. Returns the best after the run. */
  record: (result: BestResult) => BestResult;
}

export const BEST_KEY = 'cwc-portal-dive-best';

/** The browser's localStorage, or null where it is missing or blocked (private mode, settings). */
function localStore(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * A best-result store over `storage` (localStorage by default). Without storage, or when it
 * throws, it still works for the visit: it remembers the best in memory and never fails.
 */
export function bestStore(
  storage: Storage | null = localStore(),
  key: string = BEST_KEY,
): BestStore {
  let memory: BestResult | null = null;
  const read = () => {
    try {
      const stored = parseBest(storage?.getItem(key) ?? null);
      if (stored && isBetter(stored, memory)) memory = stored;
    } catch {
      // Unreadable storage: the in-memory best stands.
    }
    return memory;
  };
  return {
    read,
    record: (result) => {
      const best = read();
      if (!isBetter(result, best)) return best!;
      memory = pick(result);
      try {
        storage?.setItem(key, JSON.stringify(memory));
      } catch {
        // Full or blocked storage: keep it for this visit only.
      }
      return memory;
    },
  };
}
