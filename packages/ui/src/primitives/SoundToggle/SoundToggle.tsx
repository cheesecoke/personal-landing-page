import { useEffect, useRef, type ButtonHTMLAttributes } from 'react';

import { cx } from '../cx';

/** The button's words: a fixed name, and a tooltip for each state. */
export interface SoundToggleLabels {
  /** The accessible name, the same in every state ("Sound"); the state is in `aria-pressed`. */
  label: string;
  on: string;
  off: string;
  unavailable: string;
}

export interface SoundToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onToggle' | 'children'
> {
  /** Sound is on (the button is pressed). */
  on: boolean;
  /** False when nothing can play: the button shows off and does nothing. Default true. */
  available?: boolean;
  onToggle: () => void;
  labels: SoundToggleLabels;
  /**
   * A key that presses the button from anywhere on the page ("m"), except while typing in a field
   * or with a modifier held. When several sound buttons are on the page (the header's, and the
   * game's over it), only the one mounted last answers, so one press toggles once.
   */
  shortcut?: string;
  /** `outline`: a bordered square (the game's top bar). `plain`: no border (the site header). */
  variant?: 'outline' | 'plain';
}

/** Typing in a field never presses the shortcut. */
function isEditable(target: EventTarget | null) {
  if (!target || !(target as HTMLElement).tagName) return false;
  const el = target as HTMLElement;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}

/** The buttons with a shortcut, in mount order: the last answers. One document listener for all. */
const stack: { key: string; press: () => void }[] = [];
function onShortcut(event: KeyboardEvent) {
  const top = stack[stack.length - 1];
  if (!top || event.key.toLowerCase() !== top.key) return;
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (isEditable(event.target)) return;
  event.preventDefault();
  top.press();
}

/** A speaker in the site's line style; with sound off, a cross where the waves were. */
function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block flex-none"
    >
      <path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" />
      {/* Both marks are drawn; one shows. A page can then show the right one before hydration. */}
      <path
        data-sound-waves=""
        className={on ? undefined : 'hidden'}
        d="M13 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10"
      />
      <path data-sound-cross="" className={on ? 'hidden' : undefined} d="M13.5 8l4 4M17.5 8l-4 4" />
    </svg>
  );
}

/**
 * The sound button: a 44px square with a speaker, named "Sound" and pressed while sound is on.
 * The tooltip says how it is now (on, off, or unavailable). It turns sound on and off; what that
 * means is the caller's.
 */
export function SoundToggle({
  on,
  available = true,
  onToggle,
  labels,
  shortcut,
  variant = 'outline',
  className,
  ...rest
}: SoundToggleProps) {
  const pressed = on && available;
  const press = useRef(() => {});
  useEffect(() => {
    press.current = available ? onToggle : () => {};
  });
  useEffect(() => {
    if (!shortcut) return;
    const entry = { key: shortcut.toLowerCase(), press: () => press.current() };
    stack.push(entry);
    if (stack.length === 1) document.addEventListener('keydown', onShortcut);
    return () => {
      stack.splice(stack.indexOf(entry), 1);
      if (stack.length === 0) document.removeEventListener('keydown', onShortcut);
    };
  }, [shortcut]);

  return (
    <button
      type="button"
      data-sound-toggle={!available ? 'unavailable' : pressed ? 'on' : 'off'}
      aria-pressed={pressed}
      aria-label={labels.label}
      aria-disabled={available ? undefined : true}
      title={!available ? labels.unavailable : pressed ? labels.on : labels.off}
      onClick={available ? onToggle : undefined}
      className={cx(
        'box-border inline-flex size-touch flex-none items-center justify-center rounded-button bg-transparent p-0',
        'motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]',
        variant === 'outline' ? 'border border-hairline' : 'border-0',
        !available
          ? 'cursor-not-allowed text-label'
          : variant === 'outline'
            ? 'cursor-pointer text-bone hover:border-signal hover:text-signal'
            : 'cursor-pointer text-secondary hover:text-signal',
        className,
      )}
      {...rest}
    >
      <SpeakerIcon on={pressed} />
    </button>
  );
}
