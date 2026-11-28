import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FakeAudio, FakeAudioContext } from './fakeAudio';
import {
  AMBIENCE_FADE_IN_MS,
  AMBIENCE_FADE_OUT_MS,
  AMBIENCE_SOURCES,
  AMBIENCE_VOLUME,
  ARRIVAL_FADE_MS,
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
      // The music alone: the garden's ambience has its own tests below.
      ambience: [],
      // No Web Audio here: the element's own volume (the fallback path). Web Audio is below.
      createContext: () => null,
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
    const none = createMusic({ enabled: true, create: () => null, ambience: [] });
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

describe('createMusic through Web Audio', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (context = new FakeAudioContext()) => {
    const audio = new FakeAudio();
    const createContext = vi.fn(() => context);
    const music = createMusic({
      enabled: true,
      create: () => audio,
      // The music alone: the garden's ambience has its own tests below.
      ambience: [],
      createContext,
      now: () => Date.now(),
    });
    return { music, audio, context, createContext };
  };

  it('makes nothing until a press unlocks it, then routes element -> gain -> speakers', () => {
    const { music, audio, context, createContext } = setup();
    expect(createContext).not.toHaveBeenCalled();
    music.unlock();
    expect(createContext).toHaveBeenCalledTimes(1);
    expect(context.sources).toEqual([audio]);
    expect(context.gains).toHaveLength(1);
    expect(context.gains[0]!.to).toBe(context.destination);
    expect(context.resumes).toBe(1);
    // The element plays at full into the gain; the gain sets the level.
    expect(audio.volume).toBe(1);
    expect(context.level).toBe(0);
    music.unlock();
    expect(createContext).toHaveBeenCalledTimes(1);
  });

  it('fades the gain in to 0.25, ducks it to 0.15, and back, leaving the element at full', () => {
    const { music, audio, context } = setup();
    music.unlock();
    music.setMood('play');
    vi.advanceTimersByTime(400);
    expect(context.level).toBeGreaterThan(0.08);
    expect(context.level).toBeLessThan(0.17);
    vi.advanceTimersByTime(FADE_IN_MS);
    expect(context.level).toBe(MUSIC_VOLUME);
    music.setMood('duck');
    vi.advanceTimersByTime(DUCK_MS + 50);
    near(context.level!, 0.15);
    music.setMood('play');
    vi.advanceTimersByTime(DUCK_MS + 50);
    expect(context.level).toBe(MUSIC_VOLUME);
    expect(audio.volume).toBe(1);
  });

  it('fades the gain out on close, then pauses the element and closes the context', () => {
    const { music, audio, context } = setup();
    music.unlock();
    music.setMood('play');
    vi.advanceTimersByTime(1000);
    music.dispose({ fade: true });
    vi.advanceTimersByTime(FADE_OUT_MS / 2);
    expect(context.level).toBeLessThan(MUSIC_VOLUME);
    expect(context.state).not.toBe('closed');
    vi.advanceTimersByTime(FADE_OUT_MS);
    expect(audio.paused).toBe(true);
    expect(context.state).toBe('closed');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('closes the context on an instant close too', () => {
    const { music, context } = setup();
    music.unlock();
    music.dispose();
    expect(context.state).toBe('closed');
  });

  it('falls back to the element volume when Web Audio fails', () => {
    const context = new FakeAudioContext();
    context.failOn = 'source';
    const { music, audio } = setup(context);
    expect(() => music.unlock()).not.toThrow();
    expect(context.state).toBe('closed');
    music.setMood('play');
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(audio.volume).toBe(MUSIC_VOLUME);
  });

  it('falls back to the element volume when there is no Web Audio, or making it throws', () => {
    for (const createContext of [
      () => null,
      () => {
        throw new Error('NotSupportedError');
      },
    ]) {
      const audio = new FakeAudio();
      const music = createMusic({
        enabled: true,
        create: () => audio,
        ambience: [],
        // The music alone: the garden's ambience has its own tests below.
        ambience: [],
        createContext,
        now: () => Date.now(),
      });
      expect(() => music.unlock()).not.toThrow();
      music.setMood('play');
      vi.advanceTimersByTime(FADE_IN_MS + 50);
      expect(audio.volume).toBe(MUSIC_VOLUME);
      music.dispose();
    }
  });

  it('takes over the level mid-fade without a jump', () => {
    const { music, context } = setup();
    music.setMood('play');
    vi.advanceTimersByTime(400);
    music.unlock();
    const at = context.level!;
    expect(at).toBeGreaterThan(0.05);
    vi.advanceTimersByTime(FADE_IN_MS);
    expect(context.level).toBe(MUSIC_VOLUME);
  });
});

describe('the garden hand-off', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const AMBIENCE = [{ src: '/garden.webm', type: 'audio/webm; codecs="opus"' }] as const;

  /** Music and (optionally) an ambience, both through one fake Web Audio context. */
  const setup = ({ ambience = true, enabled = true } = {}) => {
    const music = new FakeAudio();
    const garden = new FakeAudio();
    const context = new FakeAudioContext();
    const onAvailable = vi.fn();
    const controller = createMusic({
      enabled,
      create: () => music,
      createAmbience: () => garden,
      ambience: ambience ? AMBIENCE : [],
      createContext: () => context,
      now: () => Date.now(),
      onAvailable,
    });
    /** The level of each element's gain (music first), or null before it is routed. */
    const level = (el: FakeAudio) => {
      const i = context.sources.indexOf(el);
      return i < 0 ? null : context.gains[i]!.gain.value;
    };
    return { controller, music, garden, context, level, onAvailable };
  };

  it('ships the wind chimes as the ambience: Opus first, AAC for Safari without Opus', () => {
    expect(AMBIENCE_SOURCES.map((s) => s.type)).toEqual([
      'audio/webm; codecs="opus"',
      'audio/mp4; codecs="mp4a.40.2"',
    ]);
    expect(AMBIENCE_SOURCES[0]!.src).toMatch(/portal-dive-ambience\.webm$/);
    expect(AMBIENCE_SOURCES[1]!.src).toMatch(/portal-dive-ambience\.m4a$/);
    const audio = new FakeAudio();
    expect(pickSource(audio, AMBIENCE_SOURCES)).toMatch(/\.webm$/);
    audio.canPlay = (type) => (type.includes('mp4') ? 'maybe' : '');
    expect(pickSource(audio, AMBIENCE_SOURCES)).toMatch(/\.m4a$/);
  });

  it('plays the synthwave as the music, the same way', () => {
    expect(MUSIC_SOURCES[0]!.src).toMatch(/portal-dive-music\.webm$/);
    expect(MUSIC_SOURCES[1]!.src).toMatch(/portal-dive-music\.m4a$/);
  });

  it('arriving fades the music out over 2.5 s; with no ambience, the garden is quiet', () => {
    const { controller, music, context } = setup({ ambience: false });
    controller.unlock();
    expect(context.sources).toEqual([music]);
    controller.setMood('play');
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    controller.setMood('arrive');
    vi.advanceTimersByTime(ARRIVAL_FADE_MS / 2);
    expect(context.level).toBeGreaterThan(0.05);
    expect(context.level).toBeLessThan(MUSIC_VOLUME);
    vi.advanceTimersByTime(ARRIVAL_FADE_MS / 2 + 50);
    expect(context.level).toBe(0);
    expect(music.paused).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    // "Dive again": the music comes back.
    controller.setMood('play');
    expect(music.paused).toBe(false);
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    expect(context.level).toBe(MUSIC_VOLUME);
  });

  it('fetches the ambience on the first press (not at mount) and starts it silently', async () => {
    const { controller, garden, level } = setup();
    expect(garden.src).toBe('');
    controller.unlock();
    expect(garden.src).toBe('/garden.webm');
    expect(garden.loop).toBe(true);
    expect(garden.plays).toBe(1);
    expect(level(garden)).toBe(0);
    expect(garden.volume).toBe(1);
    await vi.advanceTimersByTimeAsync(0);
    // Primed: played once inside the press, then paused again until the garden.
    expect(garden.paused).toBe(true);
  });

  it('cross-fades: music out over 2.5 s while the ambience comes in over 3 s, and back', () => {
    const { controller, music, garden, level } = setup();
    controller.unlock();
    controller.setMood('play');
    vi.advanceTimersByTime(FADE_IN_MS + 50);
    controller.setMood('duck');
    vi.advanceTimersByTime(DUCK_MS + 50);

    controller.setMood('arrive');
    expect(garden.paused).toBe(false);
    vi.advanceTimersByTime(1500);
    expect(level(music)).toBeGreaterThan(0);
    expect(level(music)).toBeLessThan(MUSIC_VOLUME * DUCK);
    expect(level(garden)).toBeGreaterThan(0.1);
    expect(level(garden)).toBeLessThan(AMBIENCE_VOLUME);
    vi.advanceTimersByTime(ARRIVAL_FADE_MS);
    expect(level(music)).toBe(0);
    expect(music.paused).toBe(true);
    vi.advanceTimersByTime(AMBIENCE_FADE_IN_MS);
    expect(level(garden)).toBe(AMBIENCE_VOLUME);
    expect(AMBIENCE_VOLUME).toBe(0.3);
    expect(AMBIENCE_FADE_IN_MS).toBe(3000);
    expect(ARRIVAL_FADE_MS).toBe(2500);

    // "Dive again": the synthwave returns and the ambience goes.
    controller.setMood('play');
    vi.advanceTimersByTime(AMBIENCE_FADE_OUT_MS + 50);
    expect(level(garden)).toBe(0);
    expect(garden.paused).toBe(true);
    expect(level(music)).toBe(MUSIC_VOLUME);
  });

  it('the sound button acts on whichever is playing', () => {
    const { controller, music, garden, level } = setup();
    controller.unlock();
    controller.setMood('play');
    controller.setMood('arrive');
    vi.advanceTimersByTime(AMBIENCE_FADE_IN_MS + 50);
    controller.setEnabled(false);
    vi.advanceTimersByTime(AMBIENCE_FADE_OUT_MS + 50);
    expect(level(garden)).toBe(0);
    expect(garden.paused).toBe(true);
    expect(music.paused).toBe(true);
    controller.setEnabled(true);
    expect(garden.paused).toBe(false);
    expect(music.paused).toBe(true);
    vi.advanceTimersByTime(AMBIENCE_FADE_IN_MS + 50);
    expect(level(garden)).toBe(AMBIENCE_VOLUME);
  });

  it('stops the ambience at once while the tab is hidden', () => {
    const { controller, garden, level } = setup();
    controller.unlock();
    controller.setMood('arrive');
    vi.advanceTimersByTime(AMBIENCE_FADE_IN_MS + 50);
    controller.setHidden(true);
    expect(garden.paused).toBe(true);
    expect(level(garden)).toBe(0);
  });

  it('does not fetch the ambience while sound is off', () => {
    const { controller, garden } = setup({ enabled: false });
    controller.unlock();
    controller.setMood('arrive');
    vi.advanceTimersByTime(AMBIENCE_FADE_IN_MS);
    expect(garden.src).toBe('');
    expect(garden.plays).toBe(0);
  });

  it('on leaving, fades both out and lets both go', () => {
    const { controller, music, garden, context } = setup();
    controller.unlock();
    controller.setMood('arrive');
    vi.advanceTimersByTime(AMBIENCE_FADE_IN_MS + 50);
    controller.dispose({ fade: true });
    vi.advanceTimersByTime(FADE_OUT_MS + 50);
    for (const el of [music, garden]) {
      expect(el.paused).toBe(true);
      expect(el.src).toBe('');
      expect(el.listening).toBe(0);
    }
    expect(context.state).toBe('closed');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a failed ambience leaves the music and the game as they are', () => {
    const { controller, garden, music, onAvailable } = setup();
    controller.unlock();
    garden.fail();
    expect(controller.available()).toBe(true);
    expect(onAvailable).not.toHaveBeenCalled();
    controller.setMood('arrive');
    vi.advanceTimersByTime(AMBIENCE_FADE_IN_MS);
    expect(garden.paused).toBe(true);
    controller.setMood('play');
    expect(music.paused).toBe(false);
  });

  it('with the music failed, the ambience still counts as sound', () => {
    const { controller, music, onAvailable } = setup();
    music.fail();
    expect(controller.available()).toBe(true);
    expect(onAvailable).not.toHaveBeenCalled();
  });

  it('keeps the ambience out when Web Audio will not take it', () => {
    const { controller, garden, context } = setup();
    let calls = 0;
    const original = context.createMediaElementSource.bind(context);
    context.createMediaElementSource = (el: never) => {
      calls += 1;
      if (calls === 2) throw new Error('InvalidStateError');
      return original(el);
    };
    controller.unlock();
    controller.setMood('arrive');
    vi.advanceTimersByTime(AMBIENCE_FADE_IN_MS);
    expect(garden.paused).toBe(true);
    expect(garden.src).toBe('');
    expect(controller.available()).toBe(true);
  });
});
