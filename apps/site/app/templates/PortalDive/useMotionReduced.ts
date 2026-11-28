import { useSyncExternalStore } from 'react';

const REDUCE = '(prefers-reduced-motion: reduce)';
const reduceQuery = () =>
  typeof window.matchMedia === 'function' ? window.matchMedia(REDUCE) : null;

function subscribe(onChange: () => void) {
  const mq = reduceQuery();
  mq?.addEventListener('change', onChange);
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => {
    mq?.removeEventListener('change', onChange);
    mo.disconnect();
  };
}

const reduced = () =>
  document.documentElement.dataset.motion === 'reduce' || !!reduceQuery()?.matches;

/** The OS setting, or `[data-motion="reduce"]` on the root (the site's switch). Reduced on the server. */
export function useMotionReduced(): boolean {
  return useSyncExternalStore(subscribe, reduced, () => true);
}
