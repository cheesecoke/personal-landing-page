/**
 * The site's ambience: one quiet looping bed under every page. Only `site.ts` imports this file,
 * and only dynamically after the visitor's first gesture with sound on, so neither this code nor
 * the track is part of any page's first load. One instance lives for the page's whole life, above
 * the routes, so it keeps playing across client-side page changes.
 */
import { createCueBus, type CueBus } from './cues';
import ambienceAac from './media/site-ambience.m4a';
import ambienceOpus from './media/site-ambience.webm';
import {
  type AudioContextFactory,
  type AudioContextLike,
  type AudioFactory,
  browserAudio,
  browserAudioContext,
  createTrack,
  type MusicSource,
  type Track,
} from './track';

/**
 * The playing level, as a gain on the track (normalised to about -20 LUFS): 0.18 is about 15 dB
 * down, near -35 LUFS. That sits well under speech and reading at any sensible device volume,
 * and under the Portal dive's music (0.25 of a track at a similar loudness).
 */
export const AMBIENCE_LEVEL = 0.18;
/** Coming in, on the first gesture and after the game: slow, so it arrives rather than starts. */
export const FADE_IN_MS = 2500;
/** The Portal dive opening: the site's bed steps aside for the game's music. */
export const HOLD_FADE_MS = 1000;
/** The tab going hidden: short (timers slow down in a hidden tab, so a long fade would drag). */
export const HIDE_FADE_MS = 250;
/** Coming back to the tab. */
export const SHOW_FADE_MS = 1000;
/** Sound turned off: out, then the track is let go. */
export const OFF_FADE_MS = 600;

/** Where the track comes from: `media/CREDITS.md`. Opus first, AAC for Safari without Opus. */
export const AMBIENCE_SOURCES: readonly MusicSource[] = [
  { src: ambienceOpus, type: 'audio/webm; codecs="opus"' },
  { src: ambienceAac, type: 'audio/mp4; codecs="mp4a.40.2"' },
];

export interface SiteAmbience {
  /**
   * Call inside a gesture (with sound on): makes and routes the track the first time, wakes the
   * audio, and fades in (or, while the game holds it, starts it silently so it may play later).
   * Settles true once the browser let it play, false if it refused or the track cannot play.
   */
  start: () => Promise<boolean>;
  /** Sound turned off: fades out, then lets the track and the audio context go. */
  stop: () => void;
  /** The Portal dive is open (true) or closed: fade out for the game's music, and back. */
  setHeld: (held: boolean) => void;
  /** False once the track cannot play (it failed to load, or there is no audio). */
  available: () => boolean;
  /**
   * The small interaction sounds, on the same audio context as the bed (made if there is none
   * yet, e.g. when the track could not load). Null without Web Audio. The caller gates them.
   */
  cues: () => CueBus | null;
}

export interface SiteAmbienceOptions {
  /** An audio context made (and resumed) inside the first gesture, before this chunk arrived. */
  context?: AudioContextLike | null;
  /** Makes a context when there is none. Default: the browser's. */
  createContext?: AudioContextFactory;
  /** Makes the element. Default: `new Audio()`. Tests pass a fake. */
  create?: AudioFactory;
  sources?: readonly MusicSource[];
  /** Held from the start (the game was already open). */
  held?: boolean;
  /** Where visibility changes come from. Default: `document`; null for none. */
  doc?: Pick<Document, 'visibilityState' | 'addEventListener'> | null;
  now?: () => number;
}

/** Whether an element's own volume does anything here (iOS Safari keeps it at 1). */
function volumeWorks(audio: { volume: number }) {
  try {
    audio.volume = 0.5;
    const works = Math.abs(audio.volume - 0.5) < 0.01;
    audio.volume = 0;
    return works;
  } catch {
    return false;
  }
}

/** The site's ambience. Nothing is made, fetched or played until the first `start()`. */
export function createSiteAmbience({
  context: primed = null,
  createContext = browserAudioContext,
  create = browserAudio,
  sources = AMBIENCE_SOURCES,
  held: heldIn = false,
  doc = typeof document === 'undefined' ? null : document,
  now = () => performance.now(),
}: SiteAmbienceOptions = {}): SiteAmbience {
  let context = primed;
  let track: Track | null = null;
  let failed = false;
  let held = heldIn;
  let hidden = doc?.visibilityState === 'hidden';
  let fadeUp = FADE_IN_MS;
  let bus: CueBus | null = null;

  const level = () => (held || hidden ? 0 : AMBIENCE_LEVEL);
  const fade = (_from: number, to: number) =>
    to > 0 ? fadeUp : hidden ? HIDE_FADE_MS : HOLD_FADE_MS;

  const closeContext = (c: AudioContextLike | null) => {
    try {
      if (c) void Promise.resolve(c.close()).catch(() => {});
    } catch {
      // Already closed.
    }
  };

  const update = (up: number) => {
    fadeUp = up;
    if (track) void track.moveTo(level(), fade);
  };

  doc?.addEventListener('visibilitychange', () => {
    hidden = doc.visibilityState === 'hidden';
    update(SHOW_FADE_MS);
  });

  /** Makes the track and routes it through a gain; false when it cannot hold a quiet level. */
  const make = () => {
    const t = createTrack(create, sources, now, () => {
      failed = true;
    });
    if (!t.audio || t.unavailable()) {
      failed = true;
      t.close(0, () => {});
      return false;
    }
    try {
      context ??= createContext();
      if (!context) throw new Error('no Web Audio');
      t.route(context);
    } catch {
      // No Web Audio: the element's own volume sets the level, where it can (not on iOS).
      closeContext(context);
      context = null;
      t.unroute();
      if (!volumeWorks(t.audio)) {
        failed = true;
        t.close(0, () => {});
        return false;
      }
    }
    track = t;
    return true;
  };

  return {
    start: () => {
      if (failed) return Promise.resolve(false);
      if (!track && !make()) return Promise.resolve(false);
      if (context?.state === 'suspended') {
        try {
          void Promise.resolve(context.resume()).catch(() => {});
        } catch {
          // A context that will not wake: the next gesture tries again.
        }
      }
      const t = track!;
      fadeUp = FADE_IN_MS;
      return level() === 0 ? t.prime() : t.moveTo(level(), fade);
    },
    stop: () => {
      const t = track;
      const c = context;
      bus?.dispose();
      bus = null;
      track = null;
      context = null;
      t?.close(OFF_FADE_MS, () => closeContext(c));
      if (!t) closeContext(c);
    },
    setHeld: (next) => {
      if (next === held) return;
      held = next;
      update(FADE_IN_MS);
    },
    available: () => !failed && !(track?.unavailable() ?? false),
    cues: () => {
      if (bus) return bus;
      try {
        context ??= createContext();
        if (!context) return null;
        if (context.state === 'suspended') void Promise.resolve(context.resume()).catch(() => {});
        bus = createCueBus(context as unknown as BaseAudioContext);
      } catch {
        bus = null;
      }
      return bus;
    },
  };
}
