/**
 * The next-step hint's clock, without the DOM: it decides when the page's marked next step draws
 * the eye. The page feeds it the visitor's activity; it asks the page, at the moment it would
 * play, whether a hint is welcome and where the target is.
 *
 * Rules
 * - Resting: no activity for `idle` ms. Any activity restarts that clock.
 * - On rest, if the target is on screen, the in-place hint plays once. If the target is below the
 *   fold, the page can scroll and the visitor has not scrolled for `repeat` ms, the scroll cue plays
 *   instead. Neither plays while `canHint()` says no (hidden tab, open dialog, reduced motion, a
 *   page transition, keyboard focus being read).
 * - While the visitor keeps resting it plays again at most every `repeat` ms (from the last start),
 *   and at most `plays` times a page view, hint and cue together.
 * - Once the visitor has hovered, focused or used the target (`engage`), it never plays again.
 * - No timer runs while the page is hidden; showing it again starts a fresh rest.
 */

export type NextStepKind = 'hint' | 'cue';

/** Where the target is: on screen, below the fold, or neither (above, hidden, absent). */
export type NextStepPlacement = 'inView' | 'below' | 'away';

export interface NextStepTimings {
  idle: number;
  repeat: number;
  plays: number;
  /** How long the in-place hint plays. */
  hint: number;
  /** How long the scroll cue plays. */
  cue: number;
}

export interface NextStepEnv {
  /** Whether a hint is welcome right now. */
  canHint(): boolean;
  placement(): NextStepPlacement;
  /** Whether the page can scroll (the cue points at somewhere you can go). */
  canScroll(): boolean;
  play(kind: NextStepKind): void;
  stop(kind: NextStepKind): void;
}

export interface NextStepController {
  /** The visitor did something. `scroll` also counts as a recent scroll and ends a cue. */
  activity(kind?: 'scroll' | 'other'): void;
  /** The visitor hovered, focused or used the target: never hint it again. */
  engage(): void;
  /** The page was hidden (`true`) or shown again (`false`). */
  hidden(isHidden: boolean): void;
  /** How many hints and cues have played. */
  readonly played: number;
  destroy(): void;
}

export function createNextStepController(
  env: NextStepEnv,
  timings: NextStepTimings,
  startHidden = false,
): NextStepController {
  let lastActivity = Date.now();
  let lastScroll = -Infinity;
  let lastPlay = -Infinity;
  let played = 0;
  let done = false;
  let isHidden = startHidden;
  let playing: NextStepKind | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopTimer: ReturnType<typeof setTimeout> | undefined;

  const clear = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  const stopPlaying = () => {
    clearTimeout(stopTimer);
    stopTimer = undefined;
    if (playing) env.stop(playing);
    playing = null;
  };

  const finished = () => done || played >= timings.plays;

  function schedule(at = Math.max(lastActivity + timings.idle, lastPlay + timings.repeat)) {
    clear();
    if (finished() || isHidden) return;
    timer = setTimeout(tick, Math.max(0, at - Date.now()));
  }

  function play(kind: NextStepKind) {
    played += 1;
    lastPlay = Date.now();
    playing = kind;
    env.play(kind);
    stopTimer = setTimeout(stopPlaying, kind === 'hint' ? timings.hint : timings.cue);
    schedule();
  }

  function tick() {
    timer = undefined;
    const now = Date.now();
    // Activity since the timer was set: wait for the rest of the new rest.
    if (now < lastActivity + timings.idle || now < lastPlay + timings.repeat) return schedule();
    if (playing) return schedule(now + timings.idle);
    if (!env.canHint()) return schedule(now + timings.idle);
    const placement = env.placement();
    if (placement === 'inView') return play('hint');
    if (placement === 'below' && env.canScroll() && now >= lastScroll + timings.repeat) {
      return play('cue');
    }
    // Nothing to point at yet: look again after another rest.
    schedule(now + timings.idle);
  }

  schedule();

  return {
    activity(kind = 'other') {
      lastActivity = Date.now();
      if (kind === 'scroll') {
        lastScroll = lastActivity;
        if (playing === 'cue') stopPlaying();
      }
      // The pending timer re-checks the clock when it fires; only start one if none is pending.
      if (timer === undefined) schedule();
    },
    engage() {
      if (done) return;
      done = true;
      clear();
      stopPlaying();
    },
    hidden(next) {
      isHidden = next;
      if (next) {
        clear();
        stopPlaying();
      } else {
        lastActivity = Date.now();
        schedule();
      }
    },
    get played() {
      return played;
    },
    destroy() {
      done = true;
      clear();
      stopPlaying();
    },
  };
}
