import tokens from '@cwc/tokens/tokens.json';

/**
 * Every colour the dive draws with, by role. Read from the site's custom properties at mount, so
 * the game follows the tokens; the token file's palette is only a fallback for a page that does
 * not load the token CSS. Signal and Ember never meet here: there is no ember role.
 */
export interface DiveColors {
  /** The background. `--bg-ground` */
  ground: string;
  /** The tunnel wall and guide rings. `--line-hairline` */
  hairline: string;
  /** Far rings. `--line-tick` */
  tick: string;
  /** Rings as they near. `--text-secondary` */
  ring: string;
  /** The next ring, and the flash on a hit. `--text-primary` */
  bright: string;
  /** Gap edges. `--accent-warm` */
  warm: string;
  /** The player, its trail, a passed ring. `--accent-signal` */
  signal: string;
  /** The thread into the distance. `--thread-line` */
  thread: string;
}

const p = tokens.palette;

/** The custom property each role reads, and its fallback. */
export const DIVE_COLOR_VARS: Readonly<Record<keyof DiveColors, [string, string]>> = {
  ground: ['--bg-ground', p.ground],
  hairline: ['--line-hairline', p.hairline],
  tick: ['--line-tick', p.tick],
  ring: ['--text-secondary', p.ash],
  bright: ['--text-primary', p.bone],
  warm: ['--accent-warm', p.hinoki],
  signal: ['--accent-signal', p.signal],
  thread: ['--thread-line', p.signalDim],
};

/** Resolve the colours with a property reader (`getComputedStyle(el).getPropertyValue`). */
export function readDiveColors(read: (name: string) => string): DiveColors {
  const out = {} as DiveColors;
  for (const [role, [name, fallback]] of Object.entries(DIVE_COLOR_VARS)) {
    out[role as keyof DiveColors] = read(name).trim() || fallback;
  }
  return out;
}

/** The fallback set, for drawing before mount and in tests. */
export const fallbackDiveColors: DiveColors = readDiveColors(() => '');
