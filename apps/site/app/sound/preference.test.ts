import { describe, expect, it, vi } from 'vitest';

import {
  createSoundPreference,
  LEGACY_SOUND_KEY,
  parseSound,
  SOUND_KEY,
  soundMirrorScript,
} from './preference';

function storage(initial: Record<string, string> = {}, blocked = false): Storage {
  const data = new Map(Object.entries(initial));
  const guard = () => {
    if (blocked) throw new Error('blocked');
  };
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    getItem: (k) => (guard(), data.get(k) ?? null),
    setItem: (k, v) => (guard(), void data.set(k, v)),
    removeItem: (k) => (guard(), void data.delete(k)),
  };
}

/** A stand-in for `window`'s storage events: `fire` is another tab writing. */
function tabs() {
  const listeners = new Set<(event: StorageEvent) => void>();
  return {
    addEventListener: (_: string, fn: (event: StorageEvent) => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: (event: StorageEvent) => void) => listeners.delete(fn),
    fire: (key: string | null) => listeners.forEach((fn) => fn({ key } as StorageEvent)),
    get size() {
      return listeners.size;
    },
  } as unknown as Window & { fire: (key: string | null) => void; size: number };
}

const make = (s: Storage | null, events: ReturnType<typeof tabs> | null = null) =>
  createSoundPreference({ storage: s, events });

describe('parseSound', () => {
  it('reads only the values it writes', () => {
    expect(parseSound('on')).toBe(true);
    expect(parseSound('off')).toBe(false);
    expect(parseSound(null)).toBeNull();
    expect(parseSound('true')).toBeNull();
    expect(parseSound('')).toBeNull();
  });
});

describe('the site sound preference', () => {
  it('is on by default', () => {
    expect(make(storage()).read()).toBe(true);
  });

  it('respects a stored "off", and ignores anything it did not write', () => {
    expect(make(storage({ [SOUND_KEY]: 'off' })).read()).toBe(false);
    expect(make(storage({ [SOUND_KEY]: 'nope' })).read()).toBe(true);
  });

  it('keeps the choice for the next visit', () => {
    const s = storage();
    make(s).write(false);
    expect(s.getItem(SOUND_KEY)).toBe('off');
    expect(make(s).read()).toBe(false);
    make(s).toggle();
    expect(make(s).read()).toBe(true);
  });

  it('carries over the Portal dive\'s old "off", and moves it to the new key', () => {
    const s = storage({ [LEGACY_SOUND_KEY]: 'off' });
    expect(make(s).read()).toBe(false);
    expect(s.getItem(SOUND_KEY)).toBe('off');
    expect(s.getItem(LEGACY_SOUND_KEY)).toBeNull();
    expect(make(s).read()).toBe(false);
  });

  it('prefers the new key over the old one', () => {
    const s = storage({ [SOUND_KEY]: 'on', [LEGACY_SOUND_KEY]: 'off' });
    expect(make(s).read()).toBe(true);
  });

  it('never throws when storage is blocked, and remembers for the visit', () => {
    const pref = make(storage({}, true));
    expect(pref.read()).toBe(true);
    expect(() => pref.write(false)).not.toThrow();
    expect(pref.read()).toBe(false);
  });

  it('works with no storage at all: on for the visit', () => {
    const pref = make(null);
    expect(pref.read()).toBe(true);
    pref.toggle();
    expect(pref.read()).toBe(false);
  });

  it('tells listeners at once, only on a real change, and lets them go', () => {
    const pref = make(storage());
    const listener = vi.fn(() => expect(pref.read()).toBe(false));
    const stop = pref.subscribe(listener);
    pref.write(false);
    pref.write(false);
    expect(listener).toHaveBeenCalledTimes(1);
    stop();
    pref.write(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('follows another tab through the storage event while anyone listens', () => {
    const s = storage();
    const events = tabs();
    const pref = make(s, events);
    expect(pref.read()).toBe(true);
    const listener = vi.fn();
    const stop = pref.subscribe(listener);
    expect(events.size).toBe(1);
    s.setItem(SOUND_KEY, 'off');
    events.fire('another-key');
    expect(listener).not.toHaveBeenCalled();
    events.fire(SOUND_KEY);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(pref.read()).toBe(false);
    stop();
    expect(events.size).toBe(0);
  });
});

describe('soundMirrorScript', () => {
  const run = (s: Storage | null) => {
    const root = { attrs: new Map<string, string>() };
    const document = {
      documentElement: { setAttribute: (k: string, v: string) => root.attrs.set(k, v) },
    };
    new Function('localStorage', 'document', soundMirrorScript)(s, document);
    return root.attrs.get('data-sound');
  };

  it('marks the page off before paint when the kept choice is off (either key)', () => {
    expect(run(storage({ [SOUND_KEY]: 'off' }))).toBe('off');
    expect(run(storage({ [LEGACY_SOUND_KEY]: 'off' }))).toBe('off');
    expect(run(storage({ [SOUND_KEY]: 'on', [LEGACY_SOUND_KEY]: 'off' }))).toBeUndefined();
    expect(run(storage())).toBeUndefined();
  });

  it('never throws', () => {
    expect(() => run(storage({}, true))).not.toThrow();
    expect(() => run(null)).not.toThrow();
  });
});
