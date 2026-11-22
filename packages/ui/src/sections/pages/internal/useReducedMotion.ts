import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  // `[data-motion="reduce"]` on the root mirrors the OS setting (tests, the Storybook toolbar).
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-motion'],
  });
  return () => {
    media.removeEventListener('change', onChange);
    observer.disconnect();
  };
}

const reduced = () =>
  window.matchMedia(QUERY).matches || document.documentElement.dataset.motion === 'reduce';

/**
 * Whether motion should be left out. `true` on the server and on the first client render, so
 * reduced motion is the default and motion is added once the browser says it is welcome.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, reduced, () => true);
}
