import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AMBIENCE_LEVEL,
  AMBIENCE_SOURCES,
  createSiteAmbience,
  FADE_IN_MS,
  HIDE_FADE_MS,
  HOLD_FADE_MS,
  OFF_FADE_MS,
  type SiteAmbienceOptions,
} from './ambience';
import { FakeAudio, FakeAudioContext } from './fakeAudio';

/** A document whose visibility a test can change. */
function page() {
  const target = new EventTarget();
  const doc = Object.assign(target, { visibilityState: 'visible' as DocumentVisibilityState });
  return {
    doc: doc as unknown as Document,
    set(state: DocumentVisibilityState) {
      doc.visibilityState = state;
      target.dispatchEvent(new Event('visibilitychange'));
    },
  };
}

function setup(options: SiteAmbienceOptions = {}) {
  const elements: FakeAudio[] = [];
  const contexts: FakeAudioContext[] = [];
  const visibility = page();
  const ambience = createSiteAmbience({
    create: () => {
      const audio = new FakeAudio();
      elements.push(audio);
      return audio;
    },
    createContext: () => {
      const c = new FakeAudioContext();
      contexts.push(c);
      return c;
    },
    doc: visibility.doc,
    now: () => Date.now(),
    ...options,
  });
  const level = () => contexts.at(-1)?.level ?? null;
  return { ambience, elements, contexts, visibility, level };
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('the site ambience', () => {
  it('sits at 0.18 and fades in over 2.5 s', () => {
    expect(AMBIENCE_LEVEL).toBe(0.18);
    expect(FADE_IN_MS).toBe(2500);
    expect(HOLD_FADE_MS).toBe(1000);
  });

  it('ships the loop as Opus first, AAC for Safari without Opus', () => {
    expect(AMBIENCE_SOURCES.map((s) => s.type)).toEqual([
      'audio/webm; codecs="opus"',
      'audio/mp4; codecs="mp4a.40.2"',
    ]);
    expect(AMBIENCE_SOURCES[0]!.src).toMatch(/site-ambience.*\.webm/);
  });

  it('makes and fetches nothing until started', () => {
    const { elements, contexts } = setup();
    expect(elements).toHaveLength(0);
    expect(contexts).toHaveLength(0);
  });

  it('on start: one looping element through a gain, fading in to 0.18 over 2.5 s', async () => {
    const { ambience, elements, contexts, level } = setup();
    await expect(ambience.start()).resolves.toBe(true);
    const [audio] = elements;
    expect(elements).toHaveLength(1);
    expect(audio!.loop).toBe(true);
    expect(audio!.preload).toBe('auto');
    expect(audio!.paused).toBe(false);
    expect(audio!.volume).toBe(1);
    expect(contexts[0]!.state).toBe('running');
    vi.advanceTimersByTime(FADE_IN_MS / 2);
    expect(level()).toBeCloseTo(AMBIENCE_LEVEL / 2, 2);
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(level()).toBeCloseTo(AMBIENCE_LEVEL, 5);
    // Starting again (another gesture) changes nothing.
    await ambience.start();
    expect(elements).toHaveLength(1);
  });

  it('uses the context the first gesture made, and wakes it', async () => {
    const primed = new FakeAudioContext();
    const { ambience, contexts } = setup({ context: primed });
    await ambience.start();
    expect(contexts).toHaveLength(0);
    expect(primed.gains).toHaveLength(1);
    expect(primed.state).toBe('running');
  });

  it('steps aside for the Portal dive over 1 s, and comes back when it closes', async () => {
    const { ambience, elements, level } = setup();
    await ambience.start();
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    ambience.setHeld(true);
    vi.advanceTimersByTime(HOLD_FADE_MS / 2);
    expect(level()).toBeCloseTo(AMBIENCE_LEVEL / 2, 2);
    vi.advanceTimersByTime(HOLD_FADE_MS + 50);
    expect(level()).toBe(0);
    expect(elements[0]!.paused).toBe(true);
    ambience.setHeld(false);
    expect(elements[0]!.paused).toBe(false);
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(level()).toBeCloseTo(AMBIENCE_LEVEL, 5);
    expect(elements).toHaveLength(1);
  });

  it('started while the game is open: plays silently once (the gesture), then waits', async () => {
    const { ambience, elements, level } = setup({ held: true });
    await expect(ambience.start()).resolves.toBe(true);
    expect(elements[0]!.plays).toBe(1);
    expect(elements[0]!.paused).toBe(true);
    expect(level()).toBe(0);
    ambience.setHeld(false);
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(level()).toBeCloseTo(AMBIENCE_LEVEL, 5);
  });

  it('pauses with a short fade while the tab is hidden, and fades back in', async () => {
    const { ambience, elements, level, visibility } = setup();
    await ambience.start();
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    visibility.set('hidden');
    vi.advanceTimersByTime(HIDE_FADE_MS + 50);
    expect(level()).toBe(0);
    expect(elements[0]!.paused).toBe(true);
    visibility.set('visible');
    expect(elements[0]!.paused).toBe(false);
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(level()).toBeCloseTo(AMBIENCE_LEVEL, 5);
  });

  it('turned off: fades out, lets the track and the context go; on again starts afresh', async () => {
    const { ambience, elements, contexts, level } = setup();
    await ambience.start();
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    ambience.stop();
    vi.advanceTimersByTime(OFF_FADE_MS / 2);
    expect(level()).toBeGreaterThan(0);
    vi.advanceTimersByTime(OFF_FADE_MS);
    expect(elements[0]!.paused).toBe(true);
    expect(elements[0]!.src).toBe('');
    expect(contexts[0]!.state).toBe('closed');
    await ambience.start();
    expect(elements).toHaveLength(2);
    expect(contexts).toHaveLength(2);
    expect(elements[1]!.paused).toBe(false);
  });

  it('reports a refused play, and plays on a later start', async () => {
    const { ambience, elements } = setup();
    const first = ambience.start();
    elements[0]!.playResult = 'reject';
    // The first play was already asked for; make the next one refuse instead.
    await expect(first).resolves.toBe(true);
    elements[0]!.pause();
    ambience.setHeld(true);
    ambience.setHeld(false);
    await expect(ambience.start()).resolves.toBe(false);
    elements[0]!.playResult = 'resolve';
    await expect(ambience.start()).resolves.toBe(true);
  });

  it('a track that fails to load goes quiet and stays unavailable', async () => {
    const { ambience, elements } = setup();
    await ambience.start();
    elements[0]!.fail();
    expect(ambience.available()).toBe(false);
    await expect(ambience.start()).resolves.toBe(false);
    expect(elements[0]!.paused).toBe(true);
  });

  it('with no source that can play, makes nothing play', async () => {
    const { ambience, elements } = setup({
      create: () => {
        const a = new FakeAudio();
        a.canPlay = () => '';
        elements.push(a);
        return a;
      },
    });
    await expect(ambience.start()).resolves.toBe(false);
    expect(ambience.available()).toBe(false);
    expect(elements[0]!.plays).toBe(0);
  });

  it('without Web Audio, the element volume holds the level where it can', async () => {
    const { ambience, elements } = setup({ createContext: () => null });
    await ambience.start();
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(elements[0]!.volume).toBeCloseTo(AMBIENCE_LEVEL, 5);
  });

  it('where neither Web Audio nor the element volume works (old iOS), it stays silent', async () => {
    const elements: FakeAudio[] = [];
    const { ambience } = setup({
      createContext: () => {
        throw new Error('no Web Audio');
      },
      create: () => {
        const a = new FakeAudio();
        // iOS keeps an element's volume at 1 whatever it is set to.
        Object.defineProperty(a, 'volume', { get: () => 1, set: () => {} });
        elements.push(a);
        return a;
      },
    });
    await expect(ambience.start()).resolves.toBe(false);
    expect(elements[0]!.plays).toBe(0);
    expect(ambience.available()).toBe(false);
  });
});
