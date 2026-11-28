import { describe, expect, it } from 'vitest';

import { bestStore, type BestResult, compareResults, isBetter, parseBest } from './best';

const crash = (ringsPassed: number): BestResult => ({
  status: 'crashed',
  ringsPassed,
  ringsTotal: 30,
  livesLeft: 0,
  clean: false,
});
const win = (livesLeft: number): BestResult => ({
  status: 'won',
  ringsPassed: 30,
  ringsTotal: 30,
  livesLeft,
  clean: livesLeft === 3,
});

/** A Storage stand-in; `fail` makes every call throw, as a blocked store does. */
function memoryStorage(fail = false): Storage {
  const data = new Map<string, string>();
  const guard = () => {
    if (fail) throw new DOMException('blocked', 'SecurityError');
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

describe('compareResults', () => {
  it('ranks a clean win over a win, a win over any crash', () => {
    expect(compareResults(win(3), win(2))).toBeGreaterThan(0);
    expect(compareResults(win(1), crash(29))).toBeGreaterThan(0);
    expect(compareResults(crash(29), win(1))).toBeLessThan(0);
  });

  it('ranks wins by lives left and crashes by rings threaded', () => {
    expect(compareResults(win(2), win(1))).toBeGreaterThan(0);
    expect(compareResults(crash(12), crash(8))).toBeGreaterThan(0);
    expect(compareResults(crash(8), crash(8))).toBe(0);
  });

  it('counts an equal result as no improvement', () => {
    expect(isBetter(crash(8), crash(8))).toBe(false);
    expect(isBetter(crash(1), null)).toBe(true);
  });
});

describe('parseBest', () => {
  it('reads back what was written, and nothing else', () => {
    expect(parseBest(JSON.stringify(win(2)))).toEqual(win(2));
    for (const raw of [
      null,
      '',
      'nope',
      '{}',
      '[]',
      '42',
      JSON.stringify({ ...win(2), status: 'x' }),
    ])
      expect(parseBest(raw), String(raw)).toBeNull();
    expect(parseBest(JSON.stringify({ ...crash(3), ringsPassed: 99 }))).toBeNull();
    expect(parseBest(JSON.stringify({ ...crash(3), livesLeft: -1 }))).toBeNull();
  });
});

describe('bestStore', () => {
  it('keeps only improvements, in storage', () => {
    const storage = memoryStorage();
    const store = bestStore(storage, 'k');
    expect(store.read()).toBeNull();
    expect(store.record(crash(5))).toEqual(crash(5));
    expect(store.record(crash(3))).toEqual(crash(5));
    expect(store.record(win(1))).toEqual(win(1));
    expect(bestStore(storage, 'k').read()).toEqual(win(1));
  });

  it('works for the visit when storage throws or is missing', () => {
    for (const storage of [memoryStorage(true), null]) {
      const store = bestStore(storage, 'k');
      expect(store.read()).toBeNull();
      expect(store.record(crash(4))).toEqual(crash(4));
      expect(store.read()).toEqual(crash(4));
    }
  });

  it('ignores a broken stored value', () => {
    const storage = memoryStorage();
    storage.setItem('k', '{broken');
    expect(bestStore(storage, 'k').read()).toBeNull();
  });
});
