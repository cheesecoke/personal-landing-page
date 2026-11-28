import { useEffect, useRef } from 'react';

import styles from './NextStepHint.module.css';

export interface NextStepHintProps {
  /**
   * Stories and tests only: rest this long (ms) instead of the token's six seconds. Repeats and
   * play lengths scale with it. The site never passes it.
   */
  debugIdleMs?: number;
}

/**
 * The page's next step, hinted when the visitor rests. Mark one action with `nextStep` (Button,
 * HandoffLink, TextLink) and render this once on the page. After about six seconds without a
 * pointer, key, wheel, scroll or touch, the marked action plays its hint once; while the visitor
 * keeps resting it plays again at most every twelve seconds, three times a page view at most.
 * Hovering, focusing or using the action ends it for the page view.
 *
 * If the action is below the fold it draws a quiet scroll cue instead: a thin line and chevron at
 * the bottom centre that fades in, drifts down a few pixels and fades out. It is decoration
 * (`aria-hidden`) and never takes a click.
 *
 * Nothing plays under reduced motion, while the tab is hidden, while a dialog (the phone menu, the
 * Portal dive) is open, during a page transition, or while a keyboard reader's focus is showing.
 * Focus never moves and nothing is announced.
 */
export function NextStepHint({ debugIdleMs }: NextStepHintProps) {
  const cueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // The clock and listeners load after hydration: nothing of them is in the page's first JS.
    let stop: (() => void) | undefined;
    let gone = false;
    void import('./start').then(({ startNextStepHint }) => {
      if (!gone && cueRef.current) stop = startNextStepHint(cueRef.current, debugIdleMs);
    });
    return () => {
      gone = true;
      stop?.();
    };
  }, [debugIdleMs]);

  return (
    <span ref={cueRef} aria-hidden="true" data-next-step-cue="" className={styles.cue}>
      <svg width="12" height="34" viewBox="0 0 12 34" fill="none" className={styles.cueArt}>
        <path d="M6 1v30" className={styles.cueLine} />
        <path d="M1.5 27.5 6 32l4.5-4.5" className={styles.cueHead} />
      </svg>
    </span>
  );
}
