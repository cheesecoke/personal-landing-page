import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type AudioLike,
  createMusic,
  DUCK,
  DUCK_MS,
  FADE_IN_MS,
  FADE_OUT_MS,
  fadeMs,
  MUSIC_SOURCES,
  MUSIC_VOLUME,
  pickSource,
  targetVolume,
  volumeAt,
} from './music';

/** A silent `<audio>` stand-in that records what was asked of it. */
class FakeAudio implements AudioLike {
  src = '';
  loop = false;
  preload = 'none';
  volume = 1;
  paused = true;
  plays = 0;
  loads = 0;
  playResult: 'resolve' | 'reject' | 'throw' = 'resolve';
  canPlay: (type: string) => string = (type) => (type.includes('opus') ? 'probably' : '');
  private listeners = new Set<() => void>();

  play() {
    this.plays += 1;
    if (this.playResult === 'throw') throw new Error('NotAllowedError');
    if (this.playResult === 'reject') return Promise.reject(new Error('NotAllowedError'));
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  load() {
    this.loads += 1;
  }
  canPlayType(type: string) {
    return this.canPlay(type);
  }
  removeAttribute(name: string) {
    if (name === 'src') this.src = '';
  }
  addEventListener(_type: 'error', listener: () => void) {
    this.listeners.add(listener);
  }
  removeEventListener(_type: 'error', listener: () => void) {
    this.listeners.delete(listener);
  }
  fail() {
    for (const listener of this.listeners) listener();
  }
  get listening() {
    return this.listeners.size;
  }
}

const near = (value: number, expected: number) => expect(value).toBeCloseTo(expected, 5);

describe('volume rules', () => {
  it('plays at a quarter of full, ducks to 60% of that, and is silent otherwise', () => {
    const base = { enabled: true, hidden: false, unavailable: false } as const;
    expect(targetVolume({ ...base, mood: 'play' })).toBe(MUSIC_VOLUME);
    near(targetVolume({ ...base, mood: 'duck' }), MUSIC_VOLUME * DUCK);
    expect(MUSIC_VOLUME).toBe(0.25);
    expect(DUCK).toBe(0.6);
    expect(targetVolume({ ...base, mood: 'wait' })).toBe(0);
    expect(targetVolume({ ...base, mood: 'play', enabled: false })).toBe(0);
    expect(targetVolume({ ...base, mood: 'play', hidden: true })).toBe(0);
    expect(targetVolume({ ...base, mood: 'play', unavailable: true })).toBe(0);
  });

  it('fades in slowly, ducks a little faster, and fades out quickly', () => {
    expect(fadeMs(0, 0.25)).toBe(FADE_IN_MS);
    expect(FADE_IN_MS).toBe(800);
    expect(fadeMs(0.25, 0.15)).toBe(DUCK_MS);
    expect(fadeMs(0.15, 0.25)).toBe(DUCK_MS);
    expect(fadeMs(0.25, 0)).toBe(FADE_OUT_MS);
  });

  it('moves in a straight line and holds at the end', () => {
    const fade = { from: 0, to: 0.25, start: 100, ms: 800 };
    expect(volumeAt(fade, 0)).toBe(0);
    near(volumeAt(fade, 500), 0.125);
    expect(volumeAt(fade, 900)).toBe(0.25);
    expect(volumeAt(fade, 5000)).toBe(0.25);
    expect(volumeAt({ from: 0.2, to: 5, start: 0, ms: 0 }, 0)).toBe(1);
  });

  it('picks the first source the browser can play', () => {
    const audio = new FakeAudio();
    expect(pickSource(audio, MUSIC_SOURCES)).toMatch(/\.webm$/);
    audio.canPlay = (type) => (type.includes('mp4') ? 'maybe' : '');
    expect(pickSource(audio, MUSIC_SOURCES)).toMatch(/\.m4a$/);
    audio.canPlay = () => '';
    expect(pickSource(audio, MUSIC_SOURCES)).toBeNull();
  });
});

describe('createMusic', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (enabled = true, audio = new FakeAudio()) => {
    const onAvailable = vi.fn();
    const music = createMusic({
      enabled,
      create: () => audio,
      now: () => Date.now(),
      onAvailable,
    });
    return { music, audio, onAvailable };
  };

  it('loads the track at mount when sound is on, but plays nothing until Start', () => {
    const { audio } = setup();
    expect(audio.loop).toBe(true);
    expect(audio.preload).toBe('auto');
    expect(audio.src).toMatch(/\.webm$/);
    expect(audio.volume).toBe(0);
    vi.advanceTimersByTime(2000);
    expect(audio.plays).toBe(0);
    expect(audio.paused).toBe(true);
  });

  it('does not fetch the track while sound is off', () => {
    const { audio, music } = setup(false);
    expect(audio.src).toBe('');
    music.setMood('play');
    vi.advanceTimersByTime(1000);
    expect(audio.src).toBe('');
    expect(audio.plays).toBe(0);
    music.setEnabled(true);
    expect(audio.src).toMatch(/\.webm$/);
    expect(audio.plays).toBe(1);
  });

  it('fades in over about 800 ms on Start, then ducks on an end screen', () => {
    const { audio, music } = setup();
    music.setMood('play');
    expect(audio.plays).toBe(1);
    vi.advanceTimersByTime(400);
    expect(audio.volume).toBeGreaterThan(0.08);
    expect(audio.volume).toBeLessThan(0.17);
    vi.advanceTimersByTime(500);
    expect(audio.volume).toBe(MUSIC_VOLUME);
    music.setMood('duck');
    vi.advanceTimersByTime(DUCK_MS + 50);
    near(audio.volume, MUSIC_VOLUME * DUCK);
    expect(audio.paused).toBe(false);
    // "Dive again": back up to the playing volume, without restarting the track.
    music.setMood('play');
    vi.advanceTimersByTime(DUCK_MS + 50);
    expect(audio.volume).toBe(MUSIC_VOLUME);
    expect(audio.plays).toBe(1);
  });

  it('fades out and pauses when turned off, and comes back when turned on', () => {
    const { audio, music } = setup();
    music.setMood('play');
    vi.advanceTimersByTime(1000);
    music.setEnabled(false);
    vi.advanceTimersByTime(FADE_OUT_MS + 50);
    expect(audio.volume).toBe(0);
    expect(audio.paused).toBe(true);
    music.setEnabled(true);
    expect(audio.paused).toBe(false);
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(audio.volume).toBe(MUSIC_VOLUME);
  });

  it('stops at once while the tab is hidden and fades back in when it returns', () => {
    const { audio, music } = setup();
    music.setMood('play');
    vi.advanceTimersByTime(1000);
    music.setHidden(true);
    expect(audio.paused).toBe(true);
    expect(audio.volume).toBe(0);
    music.setHidden(false);
    expect(audio.paused).toBe(false);
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(audio.volume).toBe(MUSIC_VOLUME);
  });

  it('stays quiet when play() is refused, and tries again on the next change', async () => {
    const audio = new FakeAudio();
    audio.playResult = 'reject';
    const { music } = setup(true, audio);
    expect(() => music.setMood('play')).not.toThrow();
    await vi.advanceTimersByTimeAsync(1000);
    expect(audio.paused).toBe(true);
    expect(music.available()).toBe(true);
    audio.playResult = 'resolve';
    music.setMood('duck');
    expect(audio.paused).toBe(false);
  });

  it('survives a play() that throws', () => {
    const audio = new FakeAudio();
    audio.playResult = 'throw';
    const { music } = setup(true, audio);
    expect(() => music.setMood('play')).not.toThrow();
  });

  it('reports unavailable when the track fails to load, and goes silent', () => {
    const { audio, music, onAvailable } = setup();
    music.setMood('play');
    vi.advanceTimersByTime(200);
    audio.fail();
    expect(music.available()).toBe(false);
    expect(onAvailable).toHaveBeenCalledWith(false);
    expect(audio.paused).toBe(true);
    music.setEnabled(true);
    music.setMood('play');
    expect(audio.paused).toBe(true);
  });

  it('reports unavailable when no source plays, or there is no audio at all', () => {
    const audio = new FakeAudio();
    audio.canPlay = () => '';
    expect(setup(true, audio).music.available()).toBe(false);
    const none = createMusic({ enabled: true, create: () => null });
    expect(none.available()).toBe(false);
    expect(() => none.setMood('play')).not.toThrow();
    expect(() => none.dispose({ fade: true })).not.toThrow();
  });

  it('on close fades out, then pauses and lets the track go', () => {
    const { audio, music } = setup();
    music.setMood('play');
    vi.advanceTimersByTime(1000);
    music.dispose({ fade: true });
    expect(audio.paused).toBe(false);
    vi.advanceTimersByTime(FADE_OUT_MS / 2);
    expect(audio.volume).toBeLessThan(MUSIC_VOLUME);
    vi.advanceTimersByTime(FADE_OUT_MS);
    expect(audio.paused).toBe(true);
    expect(audio.src).toBe('');
    expect(audio.loads).toBe(1);
    expect(audio.listening).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    // Nothing brings it back.
    music.setEnabled(true);
    music.setMood('play');
    expect(audio.paused).toBe(true);
  });

  it('stops at once when closed without a fade, or before anything played', () => {
    const { audio, music } = setup();
    music.dispose({ fade: true });
    expect(audio.paused).toBe(true);
    expect(audio.src).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });
});
