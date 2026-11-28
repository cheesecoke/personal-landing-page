/** Whether the Portal dive plays its music: on unless the reader turned it off. */
export interface SoundStore {
  /** The kept choice: true (on) unless the reader turned it off. Never throws. */
  read: () => boolean;
  /** Keeps the choice for next time. Never throws; without storage it lasts for the visit. */
  write: (on: boolean) => void;
}

export const SOUND_KEY = 'cwc-portal-dive-sound';

/** A stored value, if it is one this code wrote: 'on' or 'off'. Anything else is null. */
export function parseSound(raw: string | null): boolean | null {
  if (raw === 'on') return true;
  if (raw === 'off') return false;
  return null;
}

/** The browser's localStorage, or null where it is missing or blocked (private mode, settings). */
function localStore(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * The sound choice over `storage` (localStorage by default), the same way the best result is kept:
 * without storage, or when it throws, the choice holds in memory for the visit and nothing fails.
 */
export function soundStore(
  storage: Storage | null = localStore(),
  key: string = SOUND_KEY,
): SoundStore {
  let memory: boolean | null = null;
  return {
    read: () => {
      if (memory !== null) return memory;
      try {
        memory = parseSound(storage?.getItem(key) ?? null);
      } catch {
        // Unreadable storage: the default stands.
      }
      return memory ?? true;
    },
    write: (on) => {
      memory = on;
      try {
        storage?.setItem(key, on ? 'on' : 'off');
      } catch {
        // Full or blocked storage: keep it for this visit only.
      }
    },
  };
}
