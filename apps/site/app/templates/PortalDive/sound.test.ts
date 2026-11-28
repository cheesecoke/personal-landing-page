import { describe, expect, it } from 'vitest';

import { parseSound, SOUND_KEY, soundStore } from './sound';

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
    removeItem: (k) => void data.delete(k),
  };
}

describe('parseSound', () => {
  it('reads only the values it writes', () => {
    expect(parseSound('on')).toBe(true);
    expect(parseSound('off')).toBe(false);
    expect(parseSound(null)).toBeNull();
    expect(parseSound('true')).toBeNull();
    expect(parseSound('')).toBeNull();
  });
});

describe('soundStore', () => {
  it('is on by default', () => {
    expect(soundStore(storage()).read()).toBe(true);
  });

  it('respects a stored "off", and ignores anything it did not write', () => {
    expect(soundStore(storage({ [SOUND_KEY]: 'off' })).read()).toBe(false);
    expect(soundStore(storage({ [SOUND_KEY]: 'nope' })).read()).toBe(true);
  });

  it('keeps the choice for the next visit', () => {
    const s = storage();
    soundStore(s).write(false);
    expect(s.getItem(SOUND_KEY)).toBe('off');
    expect(soundStore(s).read()).toBe(false);
    soundStore(s).write(true);
    expect(soundStore(s).read()).toBe(true);
  });

  it('never throws when storage is blocked, and remembers for the visit', () => {
    const store = soundStore(storage({}, true));
    expect(store.read()).toBe(true);
    expect(() => store.write(false)).not.toThrow();
    expect(store.read()).toBe(false);
  });

  it('works with no storage at all', () => {
    const store = soundStore(null);
    expect(store.read()).toBe(true);
    store.write(false);
    expect(store.read()).toBe(false);
  });
});
