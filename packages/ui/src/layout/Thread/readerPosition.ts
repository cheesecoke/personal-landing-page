/**
 * Thread progress maths. Pure functions, no DOM: the hook measures, these decide.
 *
 * All positions are document px (distance from the top of the scrolling content).
 */

/** The activation line: the reader is taken to be 40% of the way down the viewport. */
export const ACTIVATION_LINE = 0.4;

export type ThreadNodeState = 'next' | 'on' | 'past';

export interface ThreadView {
  /** Height of the viewport (or the scrolling ancestor). */
  viewport: number;
  /** The furthest the page can scroll. */
  maxScroll: number;
  /**
   * Where the thread ends: the last node, or the foot of a rail that runs on past it. The reader
   * reaches it exactly at max scroll.
   */
  end: number;
}

export interface ThreadRail {
  top: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

/**
 * Reader position = scroll + the activation line.
 *
 * End-of-page rule: when the thread's end sits below where the activation line can reach at max
 * scroll, the shortfall is added linearly over the last `max(0.5 × viewport, 1.25 × shortfall)` px
 * of scroll, so short last sections still light in order and the end lights exactly at max scroll.
 * A page that does not scroll returns `Infinity`: the whole thread is lit.
 */
export function readerPosition(scroll: number, view: ThreadView): number {
  const { viewport, maxScroll, end } = view;
  if (maxScroll <= 1) return Infinity;
  const s = clamp(scroll, 0, maxScroll);
  const line = viewport * ACTIVATION_LINE;
  let reader = s + line;
  const shortfall = end - (maxScroll + line);
  if (shortfall > 0) {
    const zone = Math.min(maxScroll, Math.max(viewport * 0.5, shortfall * 1.25));
    reader += shortfall * clamp((s - (maxScroll - zone)) / zone, 0, 1);
  }
  if (s >= maxScroll - 1) reader = Math.max(reader, end);
  return reader;
}

/** True when the page cannot scroll, or is scrolled to its end. */
export function isAtEnd(scroll: number, view: ThreadView): boolean {
  return view.maxScroll <= 1 || scroll >= view.maxScroll - 1;
}

/**
 * Index of the node the reader is on: the last node at or above the reader position. The first
 * node is on from the top of the page, even while it still sits below the reader (a tall page
 * header), so a thread always has one node lit. -1 only when there are no nodes.
 * `nodes` are node centres, sorted top to bottom.
 */
export function activeNode(nodes: readonly number[], reader: number): number {
  let on = nodes.length > 0 ? 0 : -1;
  for (let i = 1; i < nodes.length; i++) {
    const y = nodes[i];
    if (y !== undefined && y <= reader + 0.5) on = i;
  }
  return on;
}

/** The state of node `index` when node `on` is the active one. */
export function nodeState(index: number, on: number): ThreadNodeState {
  return index < on ? 'past' : index === on ? 'on' : 'next';
}

/**
 * How far down the fill reaches. With motion it follows the reader, and never stops short of the
 * first node (which is on from the top of the page). With reduced motion it steps to the active
 * node, except at the end, where it completes.
 */
export function fillTarget(input: {
  reader: number;
  on: number;
  nodes: readonly number[];
  reduced: boolean;
  atEnd: boolean;
}): number {
  const { reader, on, nodes, reduced, atEnd } = input;
  if (!reduced || atEnd) return Math.max(reader, nodes[0] ?? -Infinity);
  return on >= 0 ? (nodes[on] ?? -Infinity) : -Infinity;
}

/** The fill's `scaleY` for one rail: 0 at the rail's top, 1 at its foot (or the thread's end). */
export function fillScale(rail: ThreadRail, target: number, end: number): number {
  if (rail.height <= 0) return 0;
  return clamp((Math.min(target, end) - rail.top) / rail.height, 0, 1);
}
