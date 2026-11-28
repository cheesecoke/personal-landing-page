import { useEffect, useRef, useSyncExternalStore } from 'react';

import { type SiteSound, siteSound } from './site';

const serverOn = () => true;

/**
 * The header's sound button state, and the site's sound started for the page's life. The server
 * (the pre-render) has no stored choice, so it renders the default, on; in the browser the kept
 * choice takes over right after hydration. Before that, the `<head>` script has already marked
 * `<html data-sound="off">` for a visitor who turned it off, and the page's CSS shows the muted
 * speaker from the first paint, so the icon never flashes the wrong way.
 *
 * `page` is the current path: a change plays the page-change cue, as the new page fades in.
 */
export function useSiteSound(page?: string, site: SiteSound | null = null) {
  const sound = site ?? (typeof window === 'undefined' ? null : siteSound());
  const on = useSyncExternalStore(
    sound?.preference.subscribe ?? noSubscribe,
    sound?.preference.read ?? serverOn,
    serverOn,
  );
  useEffect(() => sound?.install(), [sound]);
  const shown = useRef(page);
  useEffect(() => {
    if (page === shown.current) return;
    shown.current = page;
    sound?.touches.cue('page');
  }, [page, sound]);
  return { on, toggle: sound?.preference.toggle ?? noop };
}

const noop = () => {};
const noSubscribe = () => noop;
