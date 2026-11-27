import { cx } from '@cwc/ui';

import type { PortalDiveCopy } from './copy';

export interface SoundToggleProps {
  /** Sound is on (the button is pressed). */
  on: boolean;
  /** False when the track could not load: the button shows off and does nothing. */
  available: boolean;
  onToggle: () => void;
  copy: PortalDiveCopy['sound'];
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
      {on ? (
        <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" />
      ) : (
        <path d="M13.5 8l4 4M17.5 8l-4 4" />
      )}
    </svg>
  );
}

/**
 * The sound button in the overlay's top bar, beside Exit: a 44px square named "Sound", pressed
 * while sound is on. The tooltip says how it is now (on, off, or unavailable).
 */
export function SoundToggle({ on, available, onToggle, copy }: SoundToggleProps) {
  const pressed = on && available;
  return (
    <button
      type="button"
      data-dive-sound={!available ? 'unavailable' : pressed ? 'on' : 'off'}
      aria-pressed={pressed}
      aria-label={copy.label}
      aria-disabled={available ? undefined : true}
      title={!available ? copy.unavailable : pressed ? copy.on : copy.off}
      onClick={available ? onToggle : undefined}
      className={cx(
        'box-border inline-flex size-touch flex-none items-center justify-center rounded-button border border-hairline bg-transparent p-0',
        'motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]',
        available
          ? 'cursor-pointer text-bone hover:border-signal hover:text-signal'
          : 'cursor-not-allowed text-label',
      )}
    >
      <SpeakerIcon on={pressed} />
    </button>
  );
}
