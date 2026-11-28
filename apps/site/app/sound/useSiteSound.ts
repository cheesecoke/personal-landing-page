import { useEffect, useSyncExternalStore } from 'react';

import { type SiteSound, siteSound } from './site';

const serverOn = () => true;

/**
 * The header's sound button state, and the site's sound started for the page's life. The server
 * (the pre-render) has no stored choice, so it renders the default, on; in the browser the kept
 * choice takes over right after hydration. Before that, the `<head>` script has already marked
 * `<html data-sound="off">` for a visitor who turned it off, and the page's CSS shows the muted
 * speaker from the first paint, so the icon never flashes the wrong way.
 */
export function useSiteSound(site: SiteSound | null = null) {
  const sound = site ?? (typeof window === 'undefined' ? null : siteSound());
  const on = useSyncExternalStore(
    sound?.preference.subscribe ?? noSubscribe,
    sound?.preference.read ?? serverOn,
    serverOn,
  );
  useEffect(() => sound?.install(), [sound]);
  return { on, toggle: sound?.preference.toggle ?? noop };
}

const noop = () => {};
const noSubscribe = () => noop;
