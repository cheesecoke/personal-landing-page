/**
 * Input to steer. Pure: the component keeps a list of what is held and asks for a number to pass
 * to `step`.
 *
 * Steering sign: the core turns the angle up for positive steer, and the renderer draws a larger
 * angle to the player's left (see `screenAngle`). So "left" is +1 and "right" is -1.
 */

export type Direction = 1 | -1;
export const LEFT: Direction = 1;
export const RIGHT: Direction = -1;

/** One held key or pointer. `id` is the key name or `pointer:<pointerId>`. */
export interface Held {
  id: string;
  dir: Direction;
}

/** Keys that steer, by `KeyboardEvent.key` (letters lower-cased). Nothing else is handled. */
const KEY_DIRECTION: Readonly<Record<string, Direction>> = {
  arrowleft: LEFT,
  a: LEFT,
  arrowright: RIGHT,
  d: RIGHT,
};

/** +1, -1, or null when the key does not steer (Escape, Tab and the rest pass through). */
export function keyDirection(key: string): Direction | null {
  return KEY_DIRECTION[key.toLowerCase()] ?? null;
}

/** A pointer held on the left half steers left, on the right half steers right. */
export function pointerDirection(x: number, width: number): Direction {
  return x < width / 2 ? LEFT : RIGHT;
}

/**
 * The latest press wins: tapping right while still holding left turns right at once, and letting
 * go of right goes back to left. Nothing held is 0 and the core eases the turn out.
 */
export function steerFromHeld(held: readonly Held[]): number {
  return held.length ? held[held.length - 1]!.dir : 0;
}

/** Add (or move to the end, with its new direction) a press. Key repeat leaves the order alone. */
export function press(held: readonly Held[], id: string, dir: Direction): Held[] {
  const current = held.find((h) => h.id === id);
  if (current && current.dir === dir) return held as Held[];
  return [...held.filter((h) => h.id !== id), { id, dir }];
}

export function release(held: readonly Held[], id: string): Held[] {
  return held.some((h) => h.id === id) ? held.filter((h) => h.id !== id) : (held as Held[]);
}
