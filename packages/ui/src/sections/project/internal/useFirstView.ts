import { useLayoutEffect, useState, type RefObject } from 'react';

/** `armed`: off screen, waiting. `in`: it has scrolled into view. `undefined`: nothing to play. */
export type FirstView = 'armed' | 'in' | undefined;

/**
 * Plays an entrance once, the first time an element scrolls into view. It only arms when script
 * runs, motion is allowed and the element starts off screen: without script, under reduced motion,
 * or when the element is already in view, the result stays `undefined` and nothing is hidden.
 */
export function useFirstView(
  ref: RefObject<Element | null>,
  { threshold = 0.15, parent = false }: { threshold?: number; parent?: boolean } = {},
): FirstView {
  const [state, setState] = useState<FirstView>(undefined);

  useLayoutEffect(() => {
    const element = parent ? ref.current?.parentElement : ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const reduced =
      document.documentElement.dataset.motion === 'reduce' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    let armed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setState(armed ? 'in' : undefined);
          observer.disconnect();
        } else if (!armed) {
          armed = true;
          setState('armed');
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold, parent]);

  return state;
}
