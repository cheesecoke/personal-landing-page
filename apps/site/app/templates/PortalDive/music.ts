/**
 * The Portal dive's sound: the music (one looping track, quiet, faded in and out) and, in the
 * garden a win arrives in, an optional looping ambience that the music hands over to. Only the
 * game's lazy chunk imports this file, so no part of it (and no request for a track) is on the
 * Contact page until the reader enters the portal.
 */
import {
  type AudioContextFactory,
  type AudioContextLike,
  type AudioFactory,
  browserAudio,
  browserAudioContext,
  createTrack,
  type MusicSource,
} from '../../sound/track';
import ambienceAac from './music/portal-dive-ambience.m4a';
import ambienceOpus from './music/portal-dive-ambience.webm';
import musicAac from './music/portal-dive-music.m4a';
import musicOpus from './music/portal-dive-music.webm';

// The shared track (`app/sound/track.ts`) is what plays; these stay importable from here.
export {
  type AudioContextFactory,
  type AudioContextLike,
  type AudioFactory,
  type AudioLike,
  browserAudio,
  browserAudioContext,
  type Fade,
  type GainLike,
  type MusicSource,
  pickSource,
  volumeAt,
} from '../../sound/track';

/** The playing volume: about a quarter of full, under the game rather than over it. */
export const MUSIC_VOLUME = 0.25;
/** On the crash and win screens the music carries on, a little lower: this share of playing. */
export const DUCK = 0.6;
/** How long each change of volume takes, in ms. */
export const FADE_IN_MS = 800;
export const DUCK_MS = 500;
export const FADE_OUT_MS = 300;
/** Arriving in the garden, the music lets go slowly while the scene comes in. */
export const ARRIVAL_FADE_MS = 2500;

/** The garden's ambience: quiet, and slow to come in. */
export const AMBIENCE_VOLUME = 0.3;
export const AMBIENCE_FADE_IN_MS = 3000;
/** Leaving the garden ("Dive again"), the ambience goes as the music comes back. */
export const AMBIENCE_FADE_OUT_MS = FADE_IN_MS;

/**
 * The track, best first: Opus where it plays, AAC for Safari versions without Opus. Imported as
 * assets, so the build fingerprints them and only this chunk knows their addresses.
 */
export const MUSIC_SOURCES: readonly MusicSource[] = [
  { src: musicOpus, type: 'audio/webm; codecs="opus"' },
  { src: musicAac, type: 'audio/mp4; codecs="mp4a.40.2"' },
];

/**
 * The garden's ambience (wind chimes), best first, the same way as the music. An empty list would
 * mean no ambience element at all and a quiet garden. Where both tracks come from: `music/CREDITS.md`.
 */
export const AMBIENCE_SOURCES: readonly MusicSource[] = [
  { src: ambienceOpus, type: 'audio/webm; codecs="opus"' },
  { src: ambienceAac, type: 'audio/mp4; codecs="mp4a.40.2"' },
];

/**
 * Where the game is. `wait`: nothing has started yet (the start screen), so nothing plays.
 * `play`: a run. `duck`: the crash and win screens, a little quieter. `arrive`: the garden a win
 * opens into; the music fades away and the ambience (if there is one) comes in.
 */
export type MusicMood = 'wait' | 'play' | 'duck' | 'arrive';

export interface MusicInput {
  /** The reader's choice. */
  enabled: boolean;
  mood: MusicMood;
  /** The tab is hidden. */
  hidden: boolean;
  /** This track could not load, or there is no audio. */
  unavailable: boolean;
}

/** The volume the music should settle at. */
export function targetVolume({ enabled, mood, hidden, unavailable }: MusicInput): number {
  if (!enabled || hidden || unavailable || mood === 'wait' || mood === 'arrive') return 0;
  return mood === 'duck' ? MUSIC_VOLUME * DUCK : MUSIC_VOLUME;
}

/** The volume the ambience should settle at: only in the garden. */
export function ambienceVolume({ enabled, mood, hidden, unavailable }: MusicInput): number {
  if (!enabled || hidden || unavailable || mood !== 'arrive') return 0;
  return AMBIENCE_VOLUME;
}

/** How long to take from one volume to the next: in from silence, out to silence, or a duck. */
export function fadeMs(from: number, to: number): number {
  if (to === 0) return FADE_OUT_MS;
  if (from === 0) return FADE_IN_MS;
  return DUCK_MS;
}

/** The music's fades: as `fadeMs`, except the slow let-go on arriving in the garden. */
export function musicFadeMs(from: number, to: number, mood: MusicMood): number {
  if (mood === 'arrive' && to === 0) return ARRIVAL_FADE_MS;
  return fadeMs(from, to);
}

/** The ambience's fades: slow in, and out as quickly as the music comes back. */
export function ambienceFadeMs(_from: number, to: number): number {
  return to === 0 ? AMBIENCE_FADE_OUT_MS : AMBIENCE_FADE_IN_MS;
}

export interface MusicOptions {
  enabled: boolean;
  create?: AudioFactory;
  /** Makes the Web Audio context, on the first `unlock()`. Default: the browser's. */
  createContext?: AudioContextFactory;
  sources?: readonly MusicSource[];
  /** The garden's ambience. Default: `AMBIENCE_SOURCES`; empty means no ambience element. */
  ambience?: readonly MusicSource[];
  /** Makes the ambience's element. Default: `create`. */
  createAmbience?: AudioFactory;
  /** Milliseconds, for fades. Default: `performance.now`. */
  now?: () => number;
  /** Called whenever `available` changes. */
  onAvailable?: (available: boolean) => void;
}

export interface Music {
  /**
   * Call inside a press (Start, Dive again, the sound button): routes the elements through Web
   * Audio gains, made and resumed while the browser still counts the press as a gesture. The gains
   * are what set the level, because iOS Safari ignores an element's `volume`. Where Web Audio is
   * missing or fails, the music's own element volume is used as before. The ambience (if any) is
   * fetched and started silently here, so it may play later without a press of its own.
   */
  unlock: () => void;
  setEnabled: (on: boolean) => void;
  setMood: (mood: MusicMood) => void;
  setHidden: (hidden: boolean) => void;
  /** False once nothing can play (the tracks failed to load, or there is no audio). */
  available: () => boolean;
  /**
   * Stops for good: a short fade (`fade: true`), then the elements are paused and let go. Nothing
   * keeps playing after this; later calls do nothing.
   */
  dispose: (options?: { fade?: boolean }) => void;
}

/**
 * The sound for one visit to the overlay. It makes its elements only once it is created (the
 * chunk has mounted) and fetches the music only while sound is on; the ambience waits for the
 * first press. Playing waits for `setMood('play')`, which the Start press calls, so the browser
 * counts it as the reader's own gesture; a refused `play()` is ignored (it tries again on the next
 * change). A track that fails to load leaves the game as it is.
 *
 * Arriving in the garden (`setMood('arrive')`) fades the music out over 2.5 s while the ambience,
 * if there is one, fades in over 3 s; `play` again ("Dive again") swaps them back. The sound
 * button (`setEnabled`) and a hidden tab act on whichever is playing.
 */
export function createMusic({
  enabled: enabledIn,
  create = browserAudio,
  createContext = browserAudioContext,
  sources = MUSIC_SOURCES,
  ambience: ambienceSources = AMBIENCE_SOURCES,
  createAmbience = create,
  now = () => performance.now(),
  onAvailable,
}: MusicOptions): Music {
  const input = { enabled: enabledIn, mood: 'wait' as MusicMood, hidden: false };
  let disposed = false;
  let context: AudioContextLike | null = null;
  let triedContext = false;
  let wasAvailable = true;

  const available = () => !music.unavailable() || (ambience !== null && !ambience.unavailable());
  const onUnavailable = () => {
    const next = available();
    if (next === wasAvailable) return;
    wasAvailable = next;
    onAvailable?.(next);
  };

  const music = createTrack(create, sources, now, onUnavailable);
  const ambience =
    ambienceSources.length > 0
      ? createTrack(createAmbience, ambienceSources, now, onUnavailable)
      : null;
  const tracks = ambience ? [music, ambience] : [music];
  wasAvailable = available();

  const closeContext = () => {
    const c = context;
    context = null;
    for (const track of tracks) track.unroute();
    if (!c) return;
    try {
      void Promise.resolve(c.close()).catch(() => {});
    } catch {
      // Already closed.
    }
  };

  /** Moves each track toward the volume the input calls for: a fade, or at once (`instant`). */
  const update = (instant = false) => {
    if (disposed) return;
    const { mood } = input;
    void music.moveTo(
      targetVolume({ ...input, unavailable: music.unavailable() }),
      (from, to) => musicFadeMs(from, to, mood),
      instant,
    );
    void ambience?.moveTo(
      ambienceVolume({ ...input, unavailable: ambience.unavailable() }),
      ambienceFadeMs,
      instant,
    );
  };

  const unlock = () => {
    if (disposed || !available()) return;
    if (ambience && input.enabled) void ambience.prime();
    if (context) {
      // Already routed: a press is a chance to wake a suspended context.
      if (context.state === 'suspended') void Promise.resolve(context.resume()).catch(() => {});
      return;
    }
    if (triedContext || !music.audio || music.unavailable()) return;
    triedContext = true;
    let c: AudioContextLike | null = null;
    try {
      c = createContext();
      if (!c) return;
      music.route(c);
      void Promise.resolve(c.resume()).catch(() => {});
      context = c;
    } catch {
      // No Web Audio, or it failed: the music's own element volume stays in charge.
      context = c;
      closeContext();
      return;
    }
    if (ambience) {
      try {
        ambience.route(c);
      } catch {
        // The ambience cannot go through the gain (and iOS would ignore its volume): leave it out.
        ambience.close(0, () => {});
        onUnavailable();
      }
    }
  };

  // Fetch the music now (the chunk has mounted), so Start can play at once; not while sound is off.
  if (input.enabled) music.ensureLoaded();

  return {
    unlock,
    setEnabled: (on) => {
      input.enabled = on;
      if (on) music.ensureLoaded();
      update();
    },
    setMood: (mood) => {
      input.mood = mood;
      update();
    },
    // Hidden: stop at once (timers are slowed in a hidden tab, so a fade would drag). Back: fade in.
    setHidden: (hidden) => {
      input.hidden = hidden;
      update(hidden);
    },
    available,
    dispose: ({ fade: soft = false } = {}) => {
      if (disposed) return;
      disposed = true;
      input.enabled = false;
      let open = tracks.length;
      const done = () => {
        open -= 1;
        if (open === 0) closeContext();
      };
      for (const track of tracks) track.close(soft ? FADE_OUT_MS : 0, done);
    },
  };
}
