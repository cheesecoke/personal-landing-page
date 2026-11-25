import type { DiveState } from '../run';

/**
 * How a run ended. Every finished run takes about the same time (speed depends only on
 * progress), so time is not the score: rings threaded and lives left are. A run with no hits is
 * a clean dive.
 */
export interface DiveResult {
  status: 'won' | 'crashed';
  /** Rings flown through. */
  ringsPassed: number;
  /** Rings in the whole course. */
  ringsTotal: number;
  /** Rings struck that cost a life. */
  ringsHit: number;
  livesLeft: number;
  /** Time spent running, ms. */
  elapsedMs: number;
  /** Won without a single hit. */
  clean: boolean;
}

/** The result of a finished run, or null while it is still 'ready' or 'running'. */
export function buildResult(state: DiveState): DiveResult | null {
  if (state.status !== 'won' && state.status !== 'crashed') return null;
  return {
    status: state.status,
    ringsPassed: state.ringsPassed,
    ringsTotal: state.course.length,
    ringsHit: state.ringsHit,
    livesLeft: state.lives,
    elapsedMs: Math.round(state.elapsedMs),
    clean: state.status === 'won' && state.ringsHit === 0,
  };
}
