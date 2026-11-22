/** Text colours a type role can be set in. `inherit` leaves the colour to the parent. */
export type TextTone = 'primary' | 'secondary' | 'label' | 'warm' | 'signal' | 'inherit';

// Whole class names: Tailwind cannot see names built from parts.
export const toneClass: Record<TextTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  label: 'text-label',
  warm: 'text-accent-warm',
  signal: 'text-accent-signal',
  inherit: 'text-inherit',
};
