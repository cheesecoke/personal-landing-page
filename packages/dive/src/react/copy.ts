/**
 * The few words the game itself needs, for assistive technology and the HUD's hidden labels.
 * The page passes its own from content; these defaults keep the component usable on its own.
 */
export interface DiveCopy {
  /** Names the game area. */
  label: string;
  /** How to steer, read out with the game area. */
  instructions: string;
  /** "Lives 2 of 3" is built as `${lives} ${left} of ${total}`. */
  lives: string;
  /** Names the progress bar. */
  progress: string;
}

export const defaultDiveCopy: DiveCopy = {
  label: 'Portal dive',
  instructions:
    'Steer with the left and right arrow keys or A and D. On a touch screen, hold the left or right side.',
  lives: 'Lives',
  progress: 'Progress',
};
