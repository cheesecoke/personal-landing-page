import { inGap, wrapAngle } from './angle';
import { DIVE_CONFIG, type DiveConfig, type DiveProfile } from './config';
import { buildCourse, speedAt, type Ring } from './course';

export type DiveStatus = 'ready' | 'running' | 'crashed' | 'won';

/** Things that happened during one `step` (or `startRun`), for flashes, shakes and sound. */
export type DiveEvent =
  | { type: 'started' }
  /** Flew through the ring's gap. */
  | { type: 'passed'; ringId: number }
  /** Struck the ring outside its gap and lost a life. */
  | { type: 'hit'; ringId: number; livesLeft: number }
  /** Struck the ring while invulnerable after a hit; no life lost. */
  | { type: 'shielded'; ringId: number }
  | { type: 'crashed' }
  | { type: 'won'; elapsedMs: number };

/** A ring ahead of the player, as a renderer needs it. */
export interface UpcomingRing {
  id: number;
  /** Depth still to travel before the ring reaches the player (> 0). */
  distance: number;
  /** Gap centre angle in [0, 2π). */
  gapCentre: number;
  /** Full gap width, radians. */
  gapWidth: number;
}

export interface DiveOptions {
  /** Seeds the course. Same seed, same rings. Pass an integer; it is read as uint32. */
  seed: number;
  /** Reduced-motion mode: slower top speed, wider gaps. */
  calm?: boolean;
  /** Override the tuning (tests, play-testing). Defaults to `DIVE_CONFIG`. */
  config?: DiveConfig;
}

export interface DiveInput {
  /**
   * Steering in [-1, 1]. Positive turns the angle up, negative down, 0 lets the turn ease
   * out. Out-of-range values are clamped; NaN counts as 0. Keyboards send -1/0/1, pointers
   * and tilt can send anything in between.
   */
  steer: number;
}

/**
 * A snapshot of a run. Treat it as read-only: `step` and `startRun` return a new object and
 * never mutate the one passed in. `course` is frozen and shared between snapshots.
 */
export interface DiveState {
  readonly status: DiveStatus;
  readonly seed: number;
  readonly calm: boolean;
  readonly config: DiveConfig;
  /** The profile in use (`config.calm` or `config.normal`). */
  readonly profile: DiveProfile;
  /** Time spent running, ms. Does not advance in 'ready', 'crashed' or 'won'. */
  readonly elapsedMs: number;
  /** Player depth along the tunnel. */
  readonly depth: number;
  readonly totalDepth: number;
  /** depth / totalDepth, 0..1. */
  readonly progress: number;
  /** Forward speed at the current depth, units/s. */
  readonly speed: number;
  /** Player angle around the tunnel, [0, 2π). */
  readonly angle: number;
  /** Current turn rate, rad/s (eased toward steer × maxTurnRate). */
  readonly angularVelocity: number;
  readonly lives: number;
  /** Invulnerability left after a hit, ms. 0 when not invulnerable. */
  readonly invulnerableMs: number;
  readonly ringsPassed: number;
  readonly ringsHit: number;
  /** Elapsed time at the finish, set once the run is won; otherwise null. */
  readonly finishMs: number | null;
  /** Every ring of the run, in depth order. */
  readonly course: readonly Ring[];
  /** Index into `course` of the next ring the player has not reached. */
  readonly nextRing: number;
  /** Rings within `config.viewDepth` ahead, nearest first. */
  readonly upcoming: readonly UpcomingRing[];
  /** What happened during the call that produced this state. */
  readonly events: readonly DiveEvent[];
}

function upcomingFrom(
  course: readonly Ring[],
  from: number,
  depth: number,
  viewDepth: number,
): UpcomingRing[] {
  const out: UpcomingRing[] = [];
  for (let i = from; i < course.length; i++) {
    const ring = course[i]!;
    const distance = ring.depth - depth;
    if (distance > viewDepth) break;
    out.push({ id: ring.id, distance, gapCentre: ring.gapCentre, gapWidth: ring.gapWidth });
  }
  return out;
}

/** A fresh run in 'ready': the course is laid out, nothing moves until `startRun`. */
export function createRun(options: DiveOptions): DiveState {
  const config = options.config ?? DIVE_CONFIG;
  const calm = options.calm ?? false;
  const profile = calm ? config.calm : config.normal;
  const seed = options.seed >>> 0;
  const course = buildCourse(config, profile, seed);
  return {
    status: 'ready',
    seed,
    calm,
    config,
    profile,
    elapsedMs: 0,
    depth: 0,
    totalDepth: profile.totalDepth,
    progress: 0,
    speed: speedAt(profile, 0),
    angle: wrapAngle(config.startAngle),
    angularVelocity: 0,
    lives: config.lives,
    invulnerableMs: 0,
    ringsPassed: 0,
    ringsHit: 0,
    finishMs: null,
    course,
    nextRing: 0,
    upcoming: upcomingFrom(course, 0, 0, config.viewDepth),
    events: [],
  };
}

/** 'ready' -> 'running' with a 'started' event. Any other status is returned unchanged. */
export function startRun(state: DiveState): DiveState {
  if (state.status !== 'ready') return state.events.length ? { ...state, events: [] } : state;
  return { ...state, status: 'running', events: [{ type: 'started' }] };
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/**
 * Advances a running run by `dtMs` of frame time and returns the next state.
 *
 * - `dtMs` is clamped to [0, config.maxStepMs] (NaN counts as 0), so a tab switch never
 *   teleports the player, then integrated in equal slices of at most `config.substepMs`.
 * - Each slice: turn rate eases toward `steer × maxTurnRate`, angle moves and wraps, depth
 *   moves at the current speed, and every ring whose depth was crossed is resolved
 *   (passed, shielded or hit). Zero lives ends the run as 'crashed'; reaching `totalDepth`
 *   ends it as 'won'. Nothing after the ending slice is simulated.
 * - When the run is not 'running', the state comes back as is (with `events` emptied).
 */
export function step(state: DiveState, input: DiveInput, dtMs: number): DiveState {
  if (state.status !== 'running') return state.events.length ? { ...state, events: [] } : state;

  const { config, profile, course } = state;
  const dt = clamp(Number.isFinite(dtMs) ? dtMs : 0, 0, config.maxStepMs);
  const steer = clamp(Number.isFinite(input.steer) ? input.steer : 0, -1, 1);
  const target = steer * config.maxTurnRate;
  const slices = Math.max(1, Math.ceil(dt / config.substepMs));
  const h = dt / slices;
  const ease = 1 - Math.exp(-h / config.steerEaseMs);

  let status: DiveStatus = 'running';
  let { angle, angularVelocity, depth, elapsedMs, lives, invulnerableMs, nextRing } = state;
  let { ringsPassed, ringsHit, finishMs } = state;
  const events: DiveEvent[] = [];

  for (let s = 0; s < slices && status === 'running'; s++) {
    const sec = h / 1000;
    angularVelocity += (target - angularVelocity) * ease;
    angle = wrapAngle(angle + angularVelocity * sec);
    depth += speedAt(profile, depth / profile.totalDepth) * sec;
    elapsedMs += h;
    invulnerableMs = Math.max(0, invulnerableMs - h);

    while (nextRing < course.length && course[nextRing]!.depth <= depth) {
      const ring = course[nextRing++]!;
      if (inGap(angle, ring.gapCentre, ring.gapWidth)) {
        ringsPassed++;
        events.push({ type: 'passed', ringId: ring.id });
      } else if (invulnerableMs > 0) {
        events.push({ type: 'shielded', ringId: ring.id });
      } else {
        lives--;
        ringsHit++;
        invulnerableMs = config.invulnerableMs;
        events.push({ type: 'hit', ringId: ring.id, livesLeft: lives });
        if (lives <= 0) {
          status = 'crashed';
          events.push({ type: 'crashed' });
          break;
        }
      }
    }

    if (status === 'running' && depth >= profile.totalDepth) {
      depth = profile.totalDepth;
      status = 'won';
      finishMs = elapsedMs;
      events.push({ type: 'won', elapsedMs });
    }
  }

  return {
    ...state,
    status,
    elapsedMs,
    depth,
    progress: depth / profile.totalDepth,
    speed: speedAt(profile, depth / profile.totalDepth),
    angle,
    angularVelocity,
    lives,
    invulnerableMs,
    ringsPassed,
    ringsHit,
    finishMs,
    nextRing,
    upcoming: upcomingFrom(course, nextRing, depth, config.viewDepth),
    events,
  };
}
