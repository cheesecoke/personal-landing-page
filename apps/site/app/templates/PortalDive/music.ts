/**
 * The Portal dive's music: one looping track, quiet, faded in and out. Only the game's lazy chunk
 * imports this file, so no part of it (and no request for the track) is on the Contact page until
 * the reader enters the portal.
 */
import musicAac from './music/portal-dive-music.m4a';
import musicOpus from './music/portal-dive-music.webm';

/** The playing volume: about a quarter of full, under the game rather than over it. */
export const MUSIC_VOLUME = 0.25;
/** On the crash and win screens the music carries on, a little lower: this share of playing. */
export const DUCK = 0.6;
/** How long each change of volume takes, in ms. */
export const FADE_IN_MS = 800;
export const DUCK_MS = 500;
export const FADE_OUT_MS = 300;

/**
 * The track, best first: Opus where it plays, AAC for Safari versions without Opus. Imported as
 * assets, so the build fingerprints them and only this chunk knows their addresses.
 */
export const MUSIC_SOURCES: readonly MusicSource[] = [
  { src: musicOpus, type: 'audio/webm; codecs="opus"' },
  { src: musicAac, type: 'audio/mp4; codecs="mp4a.40.2"' },
];

export interface MusicSource {
  src: string;
  type: string;
}

/** What the music needs of an `<audio>` element. Tests pass a fake. */
export interface AudioLike {
  src: string;
  loop: boolean;
  preload: string;
  volume: number;
  readonly paused: boolean;
  play: () => Promise<void> | void;
  pause: () => void;
  load: () => void;
  canPlayType: (type: string) => string;
  removeAttribute: (name: string) => void;
  addEventListener: (type: 'error', listener: () => void) => void;
  removeEventListener: (type: 'error', listener: () => void) => void;
}

/** Makes the element. Default: `new Audio()`; null where there is no audio at all. */
export type AudioFactory = () => AudioLike | null;

export const browserAudio: AudioFactory = () =>
  typeof Audio === 'function' ? (new Audio() as AudioLike) : null;

/**
 * Where the game is. `wait`: nothing has started yet (the start screen), so nothing plays.
 * `play`: a run. `duck`: the crash and win screens, a little quieter.
 */
export type MusicMood = 'wait' | 'play' | 'duck';

export interface MusicInput {
  /** The reader's choice. */
  enabled: boolean;
  mood: MusicMood;
  /** The tab is hidden. */
  hidden: boolean;
  /** The track could not load, or there is no audio. */
  unavailable: boolean;
}

/** The volume the music should settle at. */
export function targetVolume({ enabled, mood, hidden, unavailable }: MusicInput): number {
  if (!enabled || hidden || unavailable || mood === 'wait') return 0;
  return mood === 'duck' ? MUSIC_VOLUME * DUCK : MUSIC_VOLUME;
}

/** How long to take from one volume to the next: in from silence, out to silence, or a duck. */
export function fadeMs(from: number, to: number): number {
  if (to === 0) return FADE_OUT_MS;
  if (from === 0) return FADE_IN_MS;
  return DUCK_MS;
}

export interface Fade {
  from: number;
  to: number;
  start: number;
  ms: number;
}

/** The volume `t` ms into a fade: a straight line, held at the end, always between 0 and 1. */
export function volumeAt(fade: Fade, t: number): number {
  const k = fade.ms <= 0 ? 1 : Math.min(1, Math.max(0, (t - fade.start) / fade.ms));
  return Math.min(1, Math.max(0, fade.from + (fade.to - fade.from) * k));
}

/** The first source the element says it can play, or null. */
export function pickSource(audio: AudioLike, sources: readonly MusicSource[]): string | null {
  for (const source of sources) {
    try {
      if (audio.canPlayType(source.type) !== '') return source.src;
    } catch {
      // A broken canPlayType: try the next.
    }
  }
  return null;
}

export interface MusicOptions {
  enabled: boolean;
  create?: AudioFactory;
  sources?: readonly MusicSource[];
  /** Milliseconds, for fades. Default: `performance.now`. */
  now?: () => number;
  /** Called whenever `available` changes. */
  onAvailable?: (available: boolean) => void;
}

export interface Music {
  setEnabled: (on: boolean) => void;
  setMood: (mood: MusicMood) => void;
  setHidden: (hidden: boolean) => void;
  /** False once the track failed to load (or there is no audio): the game goes on in silence. */
  available: () => boolean;
  /**
   * Stops for good: a short fade (`fade: true`), then the element is paused and let go. Nothing
   * keeps playing after this; later calls do nothing.
   */
  dispose: (options?: { fade?: boolean }) => void;
}

const TICK_MS = 16;

/**
 * The music for one visit to the overlay. It makes its element only once it is created (the
 * chunk has mounted) and fetches the track only while sound is on. Playing waits for `setMood
 * ('play')`, which the Start press calls, so the browser counts it as the reader's own gesture; a
 * refused `play()` is ignored (it tries again on the next change). A track that fails to load
 * leaves the game as it is and reports `available` false.
 */
export function createMusic({
  enabled: enabledIn,
  create = browserAudio,
  sources = MUSIC_SOURCES,
  now = () => performance.now(),
  onAvailable,
}: MusicOptions): Music {
  const input: MusicInput = { enabled: enabledIn, mood: 'wait', hidden: false, unavailable: false };
  let audio: AudioLike | null = null;
  let loaded = false;
  let volume = 0;
  let fade: Fade | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let disposed = false;

  const markUnavailable = () => {
    if (input.unavailable || disposed) return;
    input.unavailable = true;
    stopTimer();
    volume = 0;
    fade = null;
    try {
      audio?.pause();
    } catch {
      // Already gone.
    }
    onAvailable?.(false);
  };
  const onError = () => markUnavailable();

  try {
    audio = create();
  } catch {
    audio = null;
  }
  if (!audio) {
    input.unavailable = true;
  } else {
    audio.loop = true;
    audio.volume = 0;
    audio.addEventListener('error', onError);
  }

  /** Points the element at the track the first time sound is wanted. */
  const ensureLoaded = () => {
    if (loaded || !audio || input.unavailable) return;
    const src = pickSource(audio, sources);
    if (!src) return markUnavailable();
    loaded = true;
    audio.preload = 'auto';
    audio.src = src;
  };

  function stopTimer() {
    if (timer !== null) clearInterval(timer);
    timer = null;
  }

  const setVolume = (v: number) => {
    volume = v;
    if (audio) audio.volume = v;
  };

  const tick = () => {
    if (!fade || !audio) return stopTimer();
    setVolume(volumeAt(fade, now()));
    if (volume === fade.to) {
      fade = null;
      stopTimer();
      if (volume === 0) audio.pause();
    }
  };

  /** Moves toward the volume the input calls for: a fade, or at once (`instant`). */
  const update = (instant = false) => {
    if (disposed || !audio) return;
    const to = targetVolume(input);
    if (to > 0) {
      ensureLoaded();
      if (input.unavailable) return;
      if (audio.paused) {
        try {
          // A refused play (no gesture yet, or a browser setting) is quiet: the game goes on.
          void Promise.resolve(audio.play()).catch(() => {});
        } catch {
          // Thrown rather than rejected, in older browsers: the same.
        }
      }
    }
    if (instant) {
      fade = null;
      stopTimer();
      setVolume(to);
      if (to === 0) audio.pause();
      return;
    }
    if (to === volume && !fade) {
      if (to === 0 && !audio.paused) audio.pause();
      return;
    }
    if (fade && fade.to === to) return;
    fade = { from: volume, to, start: now(), ms: fadeMs(volume, to) };
    if (timer === null) timer = setInterval(tick, TICK_MS);
  };

  // Fetch the track now (the chunk has mounted), so Start can play at once; not while sound is off.
  if (input.enabled) ensureLoaded();

  return {
    setEnabled: (on) => {
      input.enabled = on;
      if (on) ensureLoaded();
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
    available: () => !input.unavailable,
    dispose: ({ fade: soft = false } = {}) => {
      if (disposed) return;
      const el = audio;
      const release = () => {
        stopTimer();
        if (!el) return;
        try {
          el.pause();
          el.removeEventListener('error', onError);
          // Let go of the track so nothing keeps loading or playing.
          el.removeAttribute('src');
          el.load();
        } catch {
          // Already gone.
        }
      };
      input.enabled = false;
      if (soft && el && !el.paused && volume > 0) {
        fade = { from: volume, to: 0, start: now(), ms: FADE_OUT_MS };
        stopTimer();
        timer = setInterval(() => {
          setVolume(volumeAt(fade!, now()));
          if (volume === 0) release();
        }, TICK_MS);
      } else {
        release();
      }
      disposed = true;
    },
  };
}
