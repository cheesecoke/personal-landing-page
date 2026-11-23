/**
 * The data the canopy draws. The core never knows a project by name: the tree, its layout and its
 * growth order all come from this shape, so the caller owns the list.
 */

/** Which bough a top-level project grows on. `both` is only a tag; it sits with the systems. */
export type CanopyKind = 'system' | 'product' | 'both';

/**
 * A shoot is a goal, idea or question that has not grown yet.
 * `open` is dashed, `grown` is solid, `answered` has pulled back to a knot, `dropped` is not drawn.
 */
export type CanopyShootState = 'open' | 'grown' | 'answered' | 'dropped';

/** The "new" marker for a node or shoot. The caller works out freshness; the canopy only draws it. */
export interface CanopyFresh {
  /** Share of the marker's life that is left, 0..1. The ring drains with it. */
  left: number;
  /** The readout beside it, for example `New · 2d`. */
  label: string;
}

export interface CanopyShoot {
  id: string;
  label: string;
  note?: string;
  state: CanopyShootState;
  /** A freshly grown shoot carries the map's one glow at its tip. */
  fresh?: CanopyFresh | null;
}

export type CanopyStatusTone = 'build' | 'live' | 'quiet';

export interface CanopyNode {
  id: string;
  label: string;
  /** The node this one sits inside, or `null` for a branch off a bough. */
  parent: string | null;
  kind: CanopyKind;
  /** The status word, for example `In build`. */
  status: string;
  /** The status dot. Left out, it is read from the status word. */
  tone?: CanopyStatusTone;
  oneLine: string;
  /** Prominence, 1..5: branch thickness and label priority. */
  weight: number;
  /** `true` when the project has its own page; `false` when it is an entry on another page. */
  page: boolean;
  /** Where the card's link goes on the site. */
  href: string;
  /** The link's words when "Open project" does not fit. */
  open?: string;
  /** At most six are drawn. */
  shoots?: readonly CanopyShoot[];
  fresh?: CanopyFresh | null;
}

/** What feeds what, drawn as a faint arc from `from` to `to`. */
export interface CanopyFlow {
  from: string;
  to: string;
  label: string;
}

export interface CanopyData {
  /** The stump. It is not a project and has no mark. */
  root: { id: string; label: string };
  nodes: readonly CanopyNode[];
  flows: readonly CanopyFlow[];
  /** The projects to start with, in order. They carry the full ring mark and a larger label. */
  start: readonly string[];
}

export type CanopyVariant = 'teaser' | 'full';
