/**
 * Every tuning number for Portal dive lives here, so play-testing changes stay in one file.
 *
 * Units: depth is abstract "tunnel units" (the renderer picks a scale), speed is units per
 * second, angles are radians around the tunnel wall, times are milliseconds unless named
 * otherwise. The values are tuned so a clean run takes about 45 s in both profiles; the tests
 * in `run.test.ts` measure that and will fail if a change here pushes it outside 44-46 s.
 */

/** The parts of the run that differ between the normal and calm (reduced-motion) modes. */
export interface DiveProfile {
  /** Speed at the start of the run, units/s. */
  startSpeed: number;
  /** Speed at the end of the run, units/s. Speed eases from start to top across progress. */
  topSpeed: number;
  /** Depth of the far side. Reaching it wins. */
  totalDepth: number;
  /** Full gap width of the first ring, radians. */
  gapStart: number;
  /** Full gap width near the end of the run, radians. */
  gapEnd: number;
  /** Random +/- added to each gap width, radians. */
  gapJitter: number;
  /** Depth between rings at the start of the run. */
  spacingStart: number;
  /** Depth between rings near the end of the run. */
  spacingEnd: number;
  /** Random +/- fraction applied to each spacing (0.15 = up to 15% closer or further). */
  spacingJitter: number;
}

export interface DiveConfig {
  /** Lives at the start. Zero lives ends the run as 'crashed'. */
  lives: number;
  /** After a hit, rings crossed within this window are 'shielded' instead of costing a life. */
  invulnerableMs: number;
  /** Largest frame time `step` accepts; longer gaps (a tab switch) are clamped to this. */
  maxStepMs: number;
  /** `step` integrates in slices no longer than this, so ring crossings are caught precisely. */
  substepMs: number;
  /** Turn rate at full steer (|steer| = 1), radians per second. */
  maxTurnRate: number;
  /** Time constant of the steering ease: turn rate closes ~63% of the way to target in this time. */
  steerEaseMs: number;
  /** Player angle at the start (0 = bottom of the tunnel). */
  startAngle: number;
  /** How far ahead rings are reported in `state.upcoming`. */
  viewDepth: number;
  /** Clear depth before the first ring. */
  leadInDepth: number;
  /** No rings closer than this to the far side, so the finish is a clean run-out. */
  finishBuffer: number;
  /** The player must be able to get this far inside the next gap's edge, radians. */
  edgeMargin: number;
  /**
   * Share of the worst-case reachable angle that ring placement may use (0..1). The rest is
   * slack for imperfect steering. See `buildCourse` for the guarantee.
   */
  reachSafety: number;
  normal: DiveProfile;
  calm: DiveProfile;
}

export const DIVE_CONFIG: DiveConfig = {
  lives: 3,
  invulnerableMs: 900,
  maxStepMs: 50,
  substepMs: 8,
  maxTurnRate: 3.2,
  steerEaseMs: 100,
  startAngle: 0,
  viewDepth: 140,
  leadInDepth: 60,
  finishBuffer: 40,
  edgeMargin: 0.05,
  reachSafety: 0.6,
  normal: {
    startSpeed: 20,
    topSpeed: 46,
    totalDepth: 1370,
    gapStart: 1.3,
    gapEnd: 0.55,
    gapJitter: 0.08,
    spacingStart: 48,
    spacingEnd: 16,
    spacingJitter: 0.15,
  },
  calm: {
    startSpeed: 16,
    topSpeed: 32,
    totalDepth: 1020,
    gapStart: 1.7,
    gapEnd: 0.9,
    gapJitter: 0.08,
    spacingStart: 44,
    spacingEnd: 20,
    spacingJitter: 0.15,
  },
};
