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
import { createTouches, type Touches } from './touches';
import type { AudioContextLike } from './track';

type AmbienceModule = { createSiteAmbience: typeof createSiteAmbience };

export interface SiteSound {
  preference: SoundPreference;
  /** Starts listening (the shell, once mounted). Returns the stop. */
  install: () => () => void;
  /** The Portal dive is open: the ambience and every UI sound step aside until released. */
  hold: () => () => void;
  /** The small sounds and vibration: cues for explicit hooks (a tree node, a page change). */
  touches: Touches;
}

export interface SiteSoundOptions {
  preference: SoundPreference;
  /** Fetches the ambience chunk. Tests pass a fake. */
  load?: () => Promise<AmbienceModule>;
  /** Makes an audio context inside the first gesture. Default: the browser's. */
  createContext?: () => AudioContextLike | null;
  win?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  doc?: Document;
  nav?: Pick<Navigator, 'vibrate'> | null;
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
  nav,
}: SiteSoundOptions): SiteSound {
  let ambience: SiteAmbience | null = null;
  let loading = false;
  let listening = false;
  let holds = 0;
  /** When sound was last turned on before the chunk had arrived: its "on" cue plays on arrival. */
  let onAsked = -Infinity;

  const touches = createTouches({
    gate: () => preference.read() && holds === 0 && doc.visibilityState === 'visible',
    bus: () => ambience?.cues() ?? null,
    doc,
    nav,
  });

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
        if (preference.read()) {
          begin();
          if (performance.now() - onAsked < 1500) touches.cue('on');
        } else ambience.stop();
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
      touches.hum(false);
      ambience?.stop();
      return;
    }
    // Turned on here (a press, so a gesture): start now, with a small "on". From another tab:
    // wait for a gesture.
    if (doc.visibilityState === 'visible') {
      begin();
      touches.vibrate('strong');
      if (ambience) touches.cue('on');
      else onAsked = performance.now();
    }
    listen(true);
  };

  return {
    preference,
    install: () => {
      const unsubscribe = preference.subscribe(onChange);
      const untouch = touches.install();
      if (preference.read()) listen(true);
      return () => {
        unsubscribe();
        untouch();
        listen(false);
      };
    },
    hold: () => {
      holds += 1;
      touches.hum(false);
      ambience?.setHeld(true);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        holds -= 1;
        ambience?.setHeld(holds > 0);
      };
    },
    touches,
  };
}

let site: SiteSound | null = null;
/** The page's one site sound (browser only). Nothing listens until the shell installs it. */
export const siteSound = () => (site ??= createSiteSound({ preference: sitePreference() }));

/** For the Portal dive's overlay: the site's ambience steps aside while it is open. */
export const holdSiteAmbience = () => siteSound().hold();

/** A cue from an explicit hook (a tree node lighting up, a page change). Dropped if it cannot play. */
export const siteCue: Touches['cue'] = (name, note) => siteSound().touches.cue(name, note);

/** A vibration from an explicit hook (entering the portal). */
export const siteVibrate: Touches['vibrate'] = (kind) => siteSound().touches.vibrate(kind);
