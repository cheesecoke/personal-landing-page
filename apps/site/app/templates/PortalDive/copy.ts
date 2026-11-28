import type { BestResult, DiveCopy } from '@cwc/dive/react';

/**
 * Every word of the Portal dive overlay, in one place. Only the game's lazy chunk imports this
 * file, so none of it is in the Contact page's HTML or first JavaScript (the hidden note stays
 * hidden until someone wins). The postbuild check fails the build if `note` leaks into a page.
 */
export const diveCopy = {
  name: 'Portal dive',
  start: 'Follow the thread. Steer through the gap in each ring.',
  keysHint: 'Use the left and right arrow keys.',
  touchHint: 'Hold the left or right side of the screen.',
  crashed: 'The tunnel won this one.',
  won: 'You made it through.',
  note: 'Hardly anyone finds this place, and fewer reach the far side. Tell me you made it through. I will know what you mean.',
  linkedin: 'Find me on LinkedIn',
  email: 'Or send an email',
  clean: 'Clean dive',
  /** On the start screen, so the music is no surprise. */
  soundNote: 'There is music. Press M or use the sound button to turn it off.',
  /** The same, where touch comes first (no keyboard to press M on). */
  soundNoteTouch: 'There is music. Use the sound button to turn it off.',
  /** The sound button: a fixed name with `aria-pressed`; the tooltip says how it is now. */
  sound: {
    label: 'Sound',
    on: 'Sound on',
    off: 'Sound off',
    unavailable: 'Sound unavailable',
  },
  buttons: {
    start: 'Start',
    again: 'Dive again',
    back: 'Back to Contact',
    exit: 'Exit',
    /** On the win card over the garden: hides the card and leaves the reader in the scene. */
    sit: 'Sit for a while',
  },
  /** The garden a win arrives in. */
  garden: {
    /** The scene's text alternative. */
    alt: 'A quiet garden at sunrise on another world: a still pond, raked gravel, mossy steps, two moons and a ringed planet, and the portal you came through on a rise to the left.',
    /** The portal in the scene, as a button: it leaves the game. */
    portal: 'Go back through the portal',
    /** Shown for a few seconds, and announced, when the reader sits down. */
    hint: 'Press Escape, or step back through the portal, to leave.',
    /** The same, where touch comes first. */
    hintTouch: 'Step back through the portal to leave.',
  },
  rings: (passed: number, total: number) => `Rings threaded: ${passed} of ${total}`,
  lives: (left: number) => `Lives left: ${left}`,
  best: (best: BestResult) =>
    best.status === 'won'
      ? best.clean
        ? 'Best: a clean dive'
        : `Best: through, with ${best.livesLeft} ${best.livesLeft === 1 ? 'life' : 'lives'} left`
      : `Best: ${best.ringsPassed} of ${best.ringsTotal} rings`,
  /** The game's own words: its accessible name, how to steer, and the HUD's hidden labels. */
  game: {
    label: 'Portal dive',
    instructions:
      'Steer with the left and right arrow keys. On a touch screen, hold the left or right side.',
    lives: 'Lives',
    progress: 'Progress',
  } satisfies DiveCopy,
};

export type PortalDiveCopy = typeof diveCopy;
