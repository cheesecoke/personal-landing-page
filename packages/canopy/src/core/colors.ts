import tokens from '@cwc/tokens/tokens.json';

/**
 * Every colour the canopy draws with. The palette comes from the design tokens; the rest are the
 * tree's own materials (bark and wood), which exist only in this scene and have no token.
 */
export interface CanopyColors {
  ground: string;
  hairline: string;
  tick: string;
  bone: string;
  ash: string;
  smoke: string;
  hinoki: string;
  cedar: string;
  signal: string;
  signalDim: string;
  /** Bough and branch tone for systems. */
  toneSystem: string;
  /** Bough and branch tone for products. */
  toneProduct: string;
  toneTrunk: string;
  /** The stump in the flat drawing: its side and its cut face. */
  stumpWall: string;
  stumpTop: string;
  /** A shoot label's words at rest, between Ash and Smoke. */
  shootLabel: string;
}

const p = tokens.palette;

export const canopyColors: CanopyColors = {
  ground: p.ground,
  hairline: p.hairline,
  tick: p.tick,
  bone: p.bone,
  ash: p.ash,
  smoke: p.smoke,
  hinoki: p.hinoki,
  cedar: p.cedar,
  signal: p.signal,
  signalDim: p.signalDim,
  toneSystem: p.hinoki,
  toneProduct: '#7FCFC3',
  toneTrunk: '#B9B3A8',
  stumpWall: '#120E0B',
  stumpTop: '#251B13',
  shootLabel: '#B3AFA6',
};

export const canopyFonts = {
  sans: tokens.font.sans,
  readout: tokens.font.readout,
} as const;

/** Seconds, from the motion tokens. */
export const canopyMotion = {
  intro: tokens.duration['canopy-intro'] / 1000,
  grow: tokens.duration['canopy-grow'] / 1000,
  shrink: tokens.duration['canopy-shrink'] / 1000,
} as const;
