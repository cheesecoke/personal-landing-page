import type { Status } from '@cwc/ui';

/**
 * Which dot goes with a status word. Hand content carries the word as the board shows it; the
 * boards draw in-use projects with the Signal dot, the ones in build with the Ember dot and every
 * other state with the hollow ring. When a project has live data its status key replaces this.
 */
const tones: Record<string, Status> = {
  'daily use': 'live',
  running: 'live',
  'in build': 'build',
};

export function statusTone(label: string): Status {
  return tones[label.trim().toLowerCase()] ?? 'private';
}
