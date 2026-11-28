/**
 * The single source for every design value. `pnpm --filter @cwc/tokens generate` turns this file
 * into `generated/tokens.css` (custom properties), `generated/theme.css` (Tailwind v4 theme) and
 * `generated/tokens.json` (for three.js). Never edit the generated files by hand.
 */

/** Primitives: the palette. Dark on purpose; black is about 90% of every view. */
export const palette = {
  ground: '#07080A',
  surface: '#0E0E10',
  raised: '#141312',
  hairline: '#25231F',
  tick: '#3A372F',
  bone: '#ECE8E1',
  ash: '#A8A49C',
  smoke: '#8A867E',
  hinoki: '#DDBF94',
  cedar: '#B88A5E',
  signal: '#6FE3D2',
  signalDim: '#3F9E92',
  ember: '#F0803C',
} as const;

export type PaletteName = keyof typeof palette;

/** Semantic colour: what a colour is for. Values are palette names. */
export const semantic = {
  bg: { ground: 'ground', surface: 'surface', raised: 'raised' },
  line: { hairline: 'hairline', tick: 'tick' },
  text: { primary: 'bone', secondary: 'ash', label: 'smoke' },
  accent: { signal: 'signal', warm: 'hinoki' },
  status: { build: 'ember', live: 'signal', private: 'ash' },
  fresh: { ring: 'hinoki', track: 'tick' },
  /** The thread down the left gutter: its line, and the node the reader is on. */
  thread: { line: 'signalDim', on: 'signal' },
} as const satisfies Record<string, Record<string, PaletteName>>;

/**
 * Tones: colours the boards use between two palette steps. They are not palette colours and have
 * no swatch; each exists for the one job its name says. Emitted as `--<group>-<role>`.
 */
export const tone = {
  line: {
    /** Every fifth tick on a tick scale (Home, the design system board). */
    tickMajor: '#4A463D',
    /** Diagram outlines, and the brighter major tick on project pages. */
    outline: '#5A564D',
  },
  thread: {
    /** Border of a thread node the reader has not reached. */
    next: '#2C6A62',
    /** Border of a thread node the reader has passed. */
    past: '#4FB3A6',
  },
  text: {
    /** Step labels inside diagrams (the at-work pipeline). */
    diagram: '#D9D3C8',
  },
} as const satisfies Record<string, Record<string, string>>;

/** Light. One glow per view. */
export const glow = {
  signal: { color: 'signal', alpha: 0.6, blur: '12px' },
  /** The lit part of the thread (its progress fill). */
  thread: { color: 'signal', alpha: 0.5, blur: '8px' },
} as const satisfies Record<string, { color: PaletteName; alpha: number; blur: string }>;

/** Edges: the 1px inner highlight along the top of a panel. */
export const edge = {
  panel: { color: 'hinoki', alpha: 0.08 },
} as const satisfies Record<string, { color: PaletteName; alpha: number }>;

/** Mona Sans speaks. Tomorrow only measures (numerals, status words, dates). */
export const font = {
  sans: "'Mona Sans', 'Helvetica Neue', Arial, sans-serif",
  readout: "'Tomorrow', 'Mona Sans', ui-monospace, monospace",
} as const;

export type FontName = keyof typeof font;

export interface TypeRole {
  font: FontName;
  size: string;
  weight: number;
  /** `font-stretch`; Mona Sans is a width-variable face. */
  stretch?: string;
  lineHeight: string;
  tracking: string;
  uppercase?: boolean;
  color: PaletteName;
}

/** Type roles, exposed as `<Text role>` and as `type-<role>` utilities. */
export const type = {
  hero: {
    font: 'sans',
    size: 'clamp(38px, 5vw, 72px)',
    weight: 500,
    stretch: '125%',
    lineHeight: '1',
    tracking: '-0.035em',
    color: 'bone',
  },
  h1: {
    font: 'sans',
    size: 'clamp(34px, 4.2vw, 58px)',
    weight: 500,
    stretch: '125%',
    lineHeight: '1.02',
    tracking: '-0.03em',
    color: 'bone',
  },
  h2: {
    font: 'sans',
    size: 'clamp(24px, 2.3vw, 32px)',
    weight: 500,
    stretch: '112.5%',
    lineHeight: '1.12',
    tracking: '-0.02em',
    color: 'bone',
  },
  h3: {
    font: 'sans',
    size: '19px',
    weight: 600,
    stretch: '100%',
    lineHeight: '1.25',
    tracking: '-0.01em',
    color: 'bone',
  },
  lead: {
    font: 'sans',
    size: 'clamp(18px, 1.45vw, 19px)',
    weight: 400,
    stretch: '100%',
    lineHeight: '1.45',
    tracking: '0',
    color: 'bone',
  },
  body: {
    font: 'sans',
    size: '16px',
    weight: 400,
    stretch: '100%',
    lineHeight: '1.6',
    tracking: '0',
    color: 'ash',
  },
  /** Smoke on Ground and Surface. On Raised, set the colour to Ash (Smoke never sits on Raised). */
  label: {
    font: 'sans',
    size: '11px',
    weight: 500,
    stretch: '100%',
    lineHeight: '1.4',
    tracking: '0.12em',
    uppercase: true,
    color: 'smoke',
  },
  /** Buttons. */
  button: {
    font: 'sans',
    size: '14px',
    weight: 600,
    stretch: '100%',
    lineHeight: '1',
    tracking: '0',
    color: 'bone',
  },
  /** Nav items. */
  nav: {
    font: 'sans',
    size: '14px',
    weight: 500,
    stretch: '100%',
    lineHeight: '1.4',
    tracking: '0.005em',
    color: 'ash',
  },
  /** Small text links with an arrow. */
  link: {
    font: 'sans',
    size: '14px',
    weight: 500,
    stretch: '100%',
    lineHeight: '1.4',
    tracking: '0',
    color: 'bone',
  },
  /** The hand-off link on project pages (main pages use h1). */
  handoff: {
    font: 'sans',
    size: 'clamp(30px, 3.6vw, 50px)',
    weight: 500,
    stretch: '125%',
    lineHeight: '1.05',
    tracking: '-0.03em',
    color: 'bone',
  },
  'readout-numeral': {
    font: 'readout',
    size: 'clamp(36px, 4vw, 60px)',
    weight: 300,
    lineHeight: '0.95',
    tracking: '-0.01em',
    color: 'hinoki',
  },
  'readout-status': {
    font: 'readout',
    size: '11px',
    weight: 500,
    lineHeight: '1.4',
    tracking: '0.16em',
    uppercase: true,
    color: 'bone',
  },
  'readout-stardate': {
    font: 'readout',
    size: '24px',
    weight: 300,
    lineHeight: '28px',
    tracking: '0',
    color: 'hinoki',
  },
} as const satisfies Record<string, TypeRole>;

export type TypeRoleName = keyof typeof type;

/** Space and layout. Spacing is a 4px unit (Tailwind's spacing scale multiplies it). */
export const layout = {
  spaceUnit: '4px',
  containerMax: '1200px',
  gutter: 'clamp(20px, 5vw, 72px)',
  measure: '56ch',
  radiusPanel: '6px',
  radiusButton: '4px',
  touchTarget: '44px',
} as const;

/** Min widths in px. Container queries first; viewport queries only for the shell. */
export const breakpoint = {
  xs: 0,
  sm: 560,
  md: 700,
  lg: 900,
  xl: 1180,
} as const;

export type BreakpointName = keyof typeof breakpoint;

export const ease = {
  out: 'cubic-bezier(.16,1,.3,1)',
  standard: 'cubic-bezier(.4,0,.2,1)',
} as const;

/** Durations in milliseconds. */
export const duration = {
  nav: 600,
  hover: 400,
  /** Link and hand-off arrows sliding on hover. */
  arrow: 500,
  rise: 700,
  'mark-arc': 800,
  'fresh-in': 600,
  'log-in': 700,
  'ar-draw': 1400,
  breathe: 9000,
  'thread-pulse': 11000,
  /** A thread node changing state (next, on, past). */
  'thread-node': 450,
  /** The thread's progress fill following the reader. */
  'thread-fill': 140,
  'canopy-intro': 5200,
  'canopy-grow': 2600,
  'canopy-shrink': 1000,
  /** The Portal dive's win: the tunnel's light blooms and the garden resolves out of it. */
  arrival: 2400,
  /** The next-step hint: the arrow easing forward and back, a light along the edge. Once. */
  hint: 1600,
  /** The scroll cue: a thin line and chevron fading in, drifting down and fading out. Once. */
  'hint-cue': 2000,
} as const;

export type DurationName = keyof typeof duration;

/**
 * Freshness: how long a "new" marker lives, in days, by kind of change. Design and code share
 * these numbers.
 */
export const fresh = {
  life: { update: 14, grown: 21, answered: 21, release: 30 },
  /** Most markers on one page. */
  cap: 3,
  /** Days a release marks the nav ring. */
  nav: 7,
} as const;

export type FreshKind = keyof typeof fresh.life;

/**
 * The next-step hint: when the visitor rests, the page's most likely next action draws the eye
 * once, then rests. Times in milliseconds. Design and code share these numbers.
 */
export const nudge = {
  /** No pointer, key, wheel, scroll or touch for this long counts as resting. */
  idle: 6000,
  /** While the visitor keeps resting, the soonest the hint plays again (from the last start). */
  repeat: 12000,
  /** Most hints in one page view, the in-place hint and the scroll cue together. */
  plays: 3,
  /** How much of the target's height must be on screen for the in-place hint. */
  inView: 0.6,
} as const;

/** The one texture: a film-grain filter over the page. */
export const texture = {
  grain: {
    opacity: 0.05,
    baseFrequency: 0.62,
    numOctaves: 3,
    colorMatrix: '0 0 0 0 .95 0 0 0 0 .86 0 0 0 0 .74 0 0 0 1.3 -.3',
  },
} as const;

export const tokens = {
  palette,
  semantic,
  tone,
  glow,
  edge,
  font,
  type,
  layout,
  breakpoint,
  ease,
  duration,
  fresh,
  nudge,
  texture,
} as const;

export type Tokens = typeof tokens;
