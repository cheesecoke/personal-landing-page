/**
 * The site's sound, as much of it as every page loads: the sound choice, one set of listeners for
 * the visitor's first gesture, and the hand-off to the Portal dive. The ambience itself (its code
 * and its track) is a separate chunk, imported on that first gesture and only with sound on.
 *
 * Browsers hold sound back until the visitor interacts, so "on by default" means: on the first
 * pointerdown, keydown or touchend anywhere (the gestures that count as activation; scroll and
 * mousemove do not), an audio context is made and woken inside the gesture, the ambience chunk
 * is fetched, and it fades in. If the browser still refuses, the next gesture tries again, now
 * with the chunk in hand. Once it plays the listeners go.
 */
import type { createSiteAmbience, SiteAmbience } from './ambience';
import { type SoundPreference, sitePreference } from './preference';
import type { AudioContextLike } from './track';

type AmbienceModule = { createSiteAmbience: typeof createSiteAmbience };

export interface SiteSound {
  preference: SoundPreference;
  /** Starts listening (the shell, once mounted). Returns the stop. */
  install: () => () => void;
  /** The Portal dive is open: the ambience steps aside until the returned release is called. */
  hold: () => () => void;
}

export interface SiteSoundOptions {
  preference: SoundPreference;
  /** Fetches the ambience chunk. Tests pass a fake. */
  load?: () => Promise<AmbienceModule>;
  /** Makes an audio context inside the first gesture. Default: the browser's. */
  createContext?: () => AudioContextLike | null;
  win?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  doc?: Pick<Document, 'visibilityState' | 'documentElement'>;
}

const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;

function browserContext(): AudioContextLike | null {
  const w = window as unknown as Record<string, (new () => AudioContextLike) | undefined>;
  const Context = w.AudioContext ?? w.webkitAudioContext;
  return Context ? new Context() : null;
}

export function createSiteSound({
  preference,
  load = () => import('./ambience'),
  createContext = browserContext,
  win = window,
  doc = document,
}: SiteSoundOptions): SiteSound {
  let ambience: SiteAmbience | null = null;
  let loading = false;
  let listening = false;
  let holds = 0;

  const listen = (on: boolean) => {
    if (on === listening) return;
    listening = on;
    for (const type of GESTURES) {
      if (on) win.addEventListener(type, onGesture, { capture: true, passive: true });
      else win.removeEventListener(type, onGesture, { capture: true });
    }
  };

  /** Inside a gesture, with sound on: start, or fetch the chunk and then start. */
  const begin = () => {
    if (ambience) {
      if (!ambience.available()) return listen(false);
      const a = ambience;
      void a.start().then((ok) => {
        if (ok && ambience === a && preference.read()) listen(false);
        else if (!a.available()) listen(false);
      });
      return;
    }
    if (loading) return;
    loading = true;
    let context: AudioContextLike | null = null;
    try {
      // Made and woken now, while the browser still counts this as the visitor's gesture.
      context = createContext();
      void Promise.resolve(context?.resume()).catch(() => {});
    } catch {
      context = null;
    }
    load().then(
      (mod) => {
        ambience = mod.createSiteAmbience({ context, held: holds > 0 });
        if (preference.read()) begin();
        else ambience.stop();
      },
      () => {
        // The chunk did not load: stay quiet, say nothing; the button still works.
        loading = false;
        try {
          void Promise.resolve(context?.close()).catch(() => {});
        } catch {
          // Already closed.
        }
      },
    );
  };

  function onGesture() {
    if (preference.read()) begin();
    else listen(false);
  }

  const onChange = () => {
    const on = preference.read();
    if (on) doc.documentElement.removeAttribute('data-sound');
    else doc.documentElement.setAttribute('data-sound', 'off');
    if (!on) {
      listen(false);
      ambience?.stop();
      return;
    }
    // Turned on here (a press, so a gesture): start now. From another tab: wait for a gesture.
    if (doc.visibilityState === 'visible') begin();
    listen(true);
  };

  return {
    preference,
    install: () => {
      const unsubscribe = preference.subscribe(onChange);
      if (preference.read()) listen(true);
      return () => {
        unsubscribe();
        listen(false);
      };
    },
    hold: () => {
      holds += 1;
      ambience?.setHeld(true);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        holds -= 1;
        ambience?.setHeld(holds > 0);
      };
    },
  };
}

let site: SiteSound | null = null;
/** The page's one site sound (browser only). Nothing listens until the shell installs it. */
export const siteSound = () => (site ??= createSiteSound({ preference: sitePreference() }));

/** For the Portal dive's overlay: the site's ambience steps aside while it is open. */
export const holdSiteAmbience = () => siteSound().hold();
