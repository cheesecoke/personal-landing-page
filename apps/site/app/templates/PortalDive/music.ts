/**
 * The Portal dive's sound: the music (one looping track, quiet, faded in and out) and, in the
 * garden a win arrives in, an optional looping ambience that the music hands over to. Only the
 * game's lazy chunk imports this file, so no part of it (and no request for a track) is on the
 * Contact page until the reader enters the portal.
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
 * The garden's ambience, best first. None yet: with an empty list there is no ambience element at
 * all and the garden is quiet. To add one, put the file in `./music/` and add one line here, e.g.
 * `{ src: new URL('./music/garden.webm', import.meta.url).href, type: 'audio/webm; codecs="opus"' },`
 * (Vite fingerprints a `new URL(..., import.meta.url)` asset the same way as an import).
 */
export const AMBIENCE_SOURCES: readonly MusicSource[] = [];

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

/** The parts of Web Audio the music uses: element -> gain -> speakers. Tests pass a fake. */
export interface GainLike {
  gain: { value: number };
  connect: (destination: unknown) => unknown;
}
export interface AudioContextLike {
  readonly state: string;
  readonly destination: unknown;
  createMediaElementSource: (element: never) => { connect: (node: GainLike) => unknown };
  createGain: () => GainLike;
  resume: () => Promise<void> | void;
  close: () => Promise<void> | void;
}

/** Makes the audio context. Default: `AudioContext` (or Safari's prefixed one); null without. */
export type AudioContextFactory = () => AudioContextLike | null;

type ContextConstructor = new () => AudioContextLike;
export const browserAudioContext: AudioContextFactory = () => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: ContextConstructor;
    webkitAudioContext?: ContextConstructor;
  };
  const Context = w.AudioContext ?? w.webkitAudioContext;
  return Context ? new Context() : null;
};

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

const TICK_MS = 16;

/** One looping element and its level: loading, fading, routing through a gain, letting go. */
interface Track {
  readonly audio: AudioLike | null;
  /** The track failed to load, or there is no element. */
  unavailable: () => boolean;
  ensureLoaded: () => void;
  /** Moves toward `to`: a fade of `ms(from, to)`, or at once. Plays first when `to` is above 0. */
  moveTo: (to: number, ms: (from: number, to: number) => number, instant?: boolean) => void;
  /** Routes the element through a new gain on `context`. Throws if Web Audio refuses it. */
  route: (context: AudioContextLike) => void;
  /** Forgets the gain (the context is gone): the element's volume is in charge again. */
  unroute: () => void;
  /** Starts the element silently and pauses it again: lets it play later without a press. */
  prime: () => void;
  /** A fade of `ms` (or none), then paused and let go; `done` is called once it is. */
  close: (ms: number, done: () => void) => void;
}

function createTrack(
  create: AudioFactory,
  sources: readonly MusicSource[],
  now: () => number,
  onUnavailable: () => void,
): Track {
  let audio: AudioLike | null = null;
  let unavailable = false;
  let loaded = false;
  let volume = 0;
  let fade: Fade | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let gain: GainLike | null = null;
  let closed = false;

  function stopTimer() {
    if (timer !== null) clearInterval(timer);
    timer = null;
  }

  const markUnavailable = () => {
    if (unavailable || closed) return;
    unavailable = true;
    stopTimer();
    volume = 0;
    fade = null;
    try {
      audio?.pause();
    } catch {
      // Already gone.
    }
    onUnavailable();
  };
  const onError = () => markUnavailable();

  try {
    audio = create();
  } catch {
    audio = null;
  }
  if (!audio) {
    unavailable = true;
  } else {
    audio.loop = true;
    audio.volume = 0;
    audio.addEventListener('error', onError);
  }

  /** The level goes to the gain when there is one (the element then stays at full), else the element. */
  const setVolume = (v: number) => {
    volume = v;
    if (gain) gain.gain.value = v;
    else if (audio) audio.volume = v;
  };

  const ensureLoaded = () => {
    if (loaded || !audio || unavailable) return;
    const src = pickSource(audio, sources);
    if (!src) return markUnavailable();
    loaded = true;
    audio.preload = 'auto';
    audio.src = src;
  };

  const play = () => {
    if (!audio) return Promise.resolve();
    try {
      // A refused play (no gesture yet, or a browser setting) is quiet: the game goes on.
      return Promise.resolve(audio.play()).catch(() => {});
    } catch {
      // Thrown rather than rejected, in older browsers: the same.
      return Promise.resolve();
    }
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

  return {
    audio,
    unavailable: () => unavailable || closed,
    ensureLoaded,
    moveTo: (to, ms, instant = false) => {
      if (closed || !audio) return;
      if (to > 0) {
        ensureLoaded();
        if (unavailable) return;
        if (audio.paused) void play();
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
      fade = { from: volume, to, start: now(), ms: ms(volume, to) };
      if (timer === null) timer = setInterval(tick, TICK_MS);
    },
    route: (context) => {
      if (!audio || unavailable || gain) return;
      const g = context.createGain();
      g.gain.value = volume;
      context.createMediaElementSource(audio as never).connect(g);
      g.connect(context.destination);
      gain = g;
      // The gain sets the level from here; the element plays at full into it.
      audio.volume = 1;
    },
    unroute: () => {
      gain = null;
      if (audio) audio.volume = volume;
    },
    prime: () => {
      if (closed || !audio || unavailable) return;
      ensureLoaded();
      if (unavailable || !audio.paused || volume > 0) return;
      const el = audio;
      void play().then(() => {
        // Still silent and not asked to play since: back to paused, ready for later.
        if (!closed && volume === 0 && !fade && !el.paused) el.pause();
      });
    },
    close: (ms, done) => {
      if (closed) return;
      closed = true;
      const el = audio;
      const release = () => {
        stopTimer();
        if (el) {
          try {
            el.pause();
            el.removeEventListener('error', onError);
            // Let go of the track so nothing keeps loading or playing.
            el.removeAttribute('src');
            el.load();
          } catch {
            // Already gone.
          }
        }
        done();
      };
      if (ms > 0 && el && !el.paused && volume > 0) {
        const out: Fade = { from: volume, to: 0, start: now(), ms };
        fade = out;
        stopTimer();
        timer = setInterval(() => {
          setVolume(volumeAt(out, now()));
          if (volume === 0) release();
        }, TICK_MS);
      } else {
        release();
      }
    },
  };
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
    music.moveTo(
      targetVolume({ ...input, unavailable: music.unavailable() }),
      (from, to) => musicFadeMs(from, to, mood),
      instant,
    );
    ambience?.moveTo(
      ambienceVolume({ ...input, unavailable: ambience.unavailable() }),
      ambienceFadeMs,
      instant,
    );
  };

  const unlock = () => {
    if (disposed || !available()) return;
    if (ambience && input.enabled) ambience.prime();
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
