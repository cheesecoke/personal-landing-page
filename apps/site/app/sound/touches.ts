/**
 * The small sounds and phone vibration for the site's controls, as much of it as every page loads:
 * one set of delegated listeners that decides which cue a hover, focus or press asks for. The
 * sounds themselves are made by the lazy sound chunk (`cues.ts`); until it has loaded (after the
 * visitor's first gesture, with sound on) a cue is simply dropped, never queued.
 *
 * Rules:
 * - Links and buttons (`a[href]`, `button`, `[role=button]`): a soft tick on hover with a mouse or
 *   on keyboard focus (never for touch), at most one every 90 ms and not again for the same
 *   control within a second; a soft click on press (pointer, or Enter/Space).
 * - `data-ui-sound="none"` on a control or any ancestor: silent. `"soft"`: no hover tick and a
 *   quieter press (the project tree, which rings its own note on hover).
 * - The Contact portal hums while hovered or focused. The sound buttons and everything inside the
 *   Portal dive (which has its own soundscape) make no UI sound.
 * - Vibration (where `navigator.vibrate` exists): a 10 ms pulse on a touch press, never on hover,
 *   never with reduced motion (vibration counts as motion).
 * - Nothing at all while sound is off, the tab is hidden or the game is open (`gate`).
 */
import type { CueBus, CueName } from './cues';

const CONTROL = 'a[href], button, [role="button"]';
/** No more than one hover tick in this many ms, and not twice for one control in `SAME_MS`. */
export const TICK_GAP_MS = 90;
export const SAME_MS = 1000;
/** Vibration lengths, in ms: a press, and the bigger moments (sound on, entering the portal). */
export const VIBRATE = { press: 10, strong: 22 } as const;

export interface Touches {
  /** Plays a cue now, if sound may play. `note` picks the tree node's note. */
  cue: (name: CueName, note?: number) => void;
  /** The portal's hum: swells while true. Turning it off always goes through. */
  hum: (on: boolean) => void;
  vibrate: (kind: keyof typeof VIBRATE) => void;
  /** Starts listening on `doc`. Returns the stop. */
  install: () => () => void;
}

export interface TouchesOptions {
  /** True while sound may play: on, the tab visible, the game not open. */
  gate: () => boolean;
  /** The cue bus, once the sound chunk has loaded; null before. */
  bus: () => CueBus | null;
  doc?: Document;
  nav?: Pick<Navigator, 'vibrate'> | null;
  now?: () => number;
}

type Mode = 'none' | 'soft' | 'portal' | 'normal';

/** What a control asks for. */
export function modeOf(el: Element): Mode {
  if (el.closest('[data-portal-dive]') || el.matches('[data-site-sound], [data-dive-sound]')) {
    return 'none';
  }
  if (el.matches('[data-contact-portal]')) return 'portal';
  const asked = el.closest('[data-ui-sound]')?.getAttribute('data-ui-sound');
  return asked === 'none' || asked === 'soft' ? asked : 'normal';
}

/** The control an event is about, if it is one that is enabled. */
export function controlOf(target: EventTarget | null): Element | null {
  const el = (target as Element | null)?.closest?.(CONTROL) ?? null;
  if (!el || el.matches(':disabled, [aria-disabled="true"]')) return null;
  return el;
}

export function createTouches({
  gate,
  bus,
  doc = document,
  nav = typeof navigator === 'undefined' ? null : navigator,
  now = () => performance.now(),
}: TouchesOptions): Touches {
  let lastTick = -Infinity;
  const ticked = new WeakMap<Element, number>();
  let humming: Element | null = null;

  const cue = (name: CueName, note?: number) => {
    if (gate()) bus()?.play(name, note);
  };
  const hum = (on: boolean) => {
    if (on && !gate()) return;
    bus()?.hum(on);
  };
  const vibrate = (kind: keyof typeof VIBRATE) => {
    if (!gate() || doc.documentElement.dataset.motion === 'reduce') return;
    try {
      if (typeof nav?.vibrate === 'function') nav.vibrate(VIBRATE[kind]);
    } catch {
      // Not allowed here: nothing to do.
    }
  };

  const hover = (el: Element) => {
    const mode = modeOf(el);
    if (mode === 'portal') {
      humming = el;
      return hum(true);
    }
    if (mode !== 'normal') return;
    const t = now();
    if (t - lastTick < TICK_GAP_MS || t - (ticked.get(el) ?? -Infinity) < SAME_MS) return;
    if (!gate() || !bus()) return;
    lastTick = t;
    ticked.set(el, t);
    cue('tick');
  };
  const leave = (event: Event) => {
    const to = (event as FocusEvent).relatedTarget as Node | null;
    if (humming && !humming.contains(to)) {
      humming = null;
      hum(false);
    }
  };

  const onPointerOver = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const el = controlOf(event.target);
    if (el) hover(el);
  };
  const onFocusIn = (event: FocusEvent) => {
    const el = controlOf(event.target);
    if (el?.matches(':focus-visible')) hover(el);
  };
  const press = (el: Element | null, touch: boolean) => {
    if (!el) return;
    const mode = modeOf(el);
    if (mode === 'none') return;
    cue(mode === 'soft' ? 'soft' : 'press');
    if (touch) vibrate('press');
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || !event.isPrimary) return;
    press(controlOf(event.target), event.pointerType !== 'mouse');
  };
  // Enter or Space on a control: a click with no pointer behind it.
  const onClick = (event: MouseEvent) => {
    if (event.detail === 0) press(controlOf(event.target), false);
  };
  const onHidden = () => {
    if (doc.visibilityState === 'hidden') hum(false);
  };

  const listeners = [
    ['pointerover', onPointerOver],
    ['focusin', onFocusIn],
    ['pointerout', leave],
    ['focusout', leave],
    ['pointerdown', onPointerDown],
    ['click', onClick],
    ['visibilitychange', onHidden],
  ] as const;

  return {
    cue,
    hum,
    vibrate,
    install: () => {
      for (const [type, fn] of listeners) doc.addEventListener(type, fn as EventListener, true);
      return () => {
        for (const [type, fn] of listeners)
          doc.removeEventListener(type, fn as EventListener, true);
      };
    },
  };
}
