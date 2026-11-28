/**
 * The site's one sound choice: on unless the visitor turned it off, kept across visits. The header
 * button, the site's ambience and the Portal dive all read and change this one value, so turning
 * sound off anywhere turns it off everywhere (and in the visitor's other tabs, through the
 * `storage` event). It is part of every page's first JavaScript, so it stays small.
 */
export const SOUND_KEY = 'cwc-sound';
/** Where the Portal dive kept its own choice before the site had one: read once, then moved. */
export const LEGACY_SOUND_KEY = 'cwc-portal-dive-sound';

export interface SoundPreference {
  /** The kept choice: true (on) unless the visitor turned it off. Never throws. */
  read: () => boolean;
  /** Keeps the choice and tells every listener at once (inside the press that changed it). */
  write: (on: boolean) => void;
  toggle: () => void;
  /** Called on every change, from this tab or another. Returns the unsubscribe. */
  subscribe: (listener: () => void) => () => void;
}

/** A stored value, if it is one this code wrote: 'on' or 'off'. Anything else is null. */
export function parseSound(raw: string | null | undefined): boolean | null {
  return raw === 'on' ? true : raw === 'off' ? false : null;
}

/** The browser's localStorage, or null where it is missing or blocked (private mode, settings). */
function localStore(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export interface SoundPreferenceOptions {
  /** Default: localStorage. Null keeps the choice in memory for the visit. */
  storage?: Storage | null;
  /** Where `storage` events come from (other tabs). Default: `window`; null for none. */
  events?: Pick<Window, 'addEventListener' | 'removeEventListener'> | null;
}

/**
 * The choice over `storage`. Without storage, or when it throws, the choice holds in memory for
 * the visit and nothing fails. A choice the Portal dive kept under its old key is carried over.
 */
export function createSoundPreference({
  storage = localStore(),
  events = typeof window === 'undefined' ? null : window,
}: SoundPreferenceOptions = {}): SoundPreference {
  let memory: boolean | null = null;
  const listeners = new Set<() => void>();
  const get = (key: string) => {
    try {
      return parseSound(storage?.getItem(key));
    } catch {
      return null;
    }
  };
  const store = (on: boolean) => {
    try {
      storage?.setItem(SOUND_KEY, on ? 'on' : 'off');
    } catch {
      // Full or blocked storage: keep it for this visit only.
    }
  };
  const read = () => {
    if (memory !== null) return memory;
    memory = get(SOUND_KEY);
    if (memory === null) {
      memory = get(LEGACY_SOUND_KEY);
      if (memory !== null) {
        store(memory);
        try {
          storage?.removeItem(LEGACY_SOUND_KEY);
        } catch {
          // Left behind: harmless, the new key wins from now on.
        }
      }
    }
    return (memory ??= true);
  };
  const set = (on: boolean) => {
    if (on === read()) return;
    memory = on;
    for (const listener of [...listeners]) listener();
  };
  // Another tab changed it: follow.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SOUND_KEY && event.key !== null) return;
    const next = get(SOUND_KEY);
    if (next !== null) set(next);
  };
  const write = (on: boolean) => {
    read(); // Settle what it was before the write changes storage.
    store(on);
    set(on);
  };
  return {
    read,
    write,
    toggle: () => write(!read()),
    subscribe: (listener) => {
      if (listeners.size === 0) events?.addEventListener('storage', onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) events?.removeEventListener('storage', onStorage);
      };
    },
  };
}

let site: SoundPreference | null = null;
/** The site's own choice, over localStorage: one for the page's whole life. */
export const sitePreference = () => (site ??= createSoundPreference());

/**
 * The text of an inline `<head>` script: marks `<html data-sound="off">` before the first paint
 * when the kept choice is off, so the pre-rendered header shows the muted speaker at once (the
 * HTML is rendered with the default, on). It reads the old key too and never throws.
 */
export const soundMirrorScript = `try{var s=localStorage,v=s.getItem('${SOUND_KEY}');if(v!=='on'&&v!=='off')v=s.getItem('${LEGACY_SOUND_KEY}');if(v==='off')document.documentElement.setAttribute('data-sound','off')}catch(e){}`;
