/**
 * One looping `<audio>` track and its level, shared by the Portal dive's music and the site's
 * ambience: loading the best source, fades, routing through a Web Audio gain (iOS Safari ignores
 * an element's `volume`, so the gain is what holds a quiet level there), falling back to the
 * element's own volume where Web Audio is missing, and letting the track go. Only lazily loaded
 * code imports this file; no page's first JavaScript carries it.
 */

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

const TICK_MS = 16;

/** One looping element and its level: loading, fading, routing through a gain, letting go. */
export interface Track {
  readonly audio: AudioLike | null;
  /** The track failed to load, or there is no element. */
  unavailable: () => boolean;
  ensureLoaded: () => void;
  /**
   * Moves toward `to`: a fade of `ms(from, to)`, or at once. Plays first when `to` is above 0.
   * Settles true when the element is playing (or did not need to), false when play was refused.
   */
  moveTo: (
    to: number,
    ms: (from: number, to: number) => number,
    instant?: boolean,
  ) => Promise<boolean>;
  /** Routes the element through a new gain on `context`. Throws if Web Audio refuses it. */
  route: (context: AudioContextLike) => void;
  /** Forgets the gain (the context is gone): the element's volume is in charge again. */
  unroute: () => void;
  /**
   * Starts the element silently and pauses it again: lets it play later without a press. Settles
   * true when the browser let it play, false when it refused.
   */
  prime: () => Promise<boolean>;
  /** A fade of `ms` (or none), then paused and let go; `done` is called once it is. */
  close: (ms: number, done: () => void) => void;
}

export function createTrack(
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
    // A track no source of which can play is unavailable from the start (asking fetches nothing),
    // so the sound button does not offer a garden ambience that could never play.
    if (pickSource(audio, sources) === null) unavailable = true;
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

  const play = (): Promise<boolean> => {
    if (!audio) return Promise.resolve(false);
    try {
      // A refused play (no gesture yet, or a browser setting) is quiet: the game goes on.
      return Promise.resolve(audio.play()).then(
        () => true,
        () => false,
      );
    } catch {
      // Thrown rather than rejected, in older browsers: the same.
      return Promise.resolve(false);
    }
  };
  const settled = Promise.resolve(true);

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
      if (closed || !audio) return Promise.resolve(false);
      let started = settled;
      if (to > 0) {
        ensureLoaded();
        if (unavailable) return Promise.resolve(false);
        if (audio.paused) started = play();
      }
      if (instant) {
        fade = null;
        stopTimer();
        setVolume(to);
        if (to === 0) audio.pause();
        return started;
      }
      if (to === volume && !fade) {
        if (to === 0 && !audio.paused) audio.pause();
        return started;
      }
      if (fade && fade.to === to) return started;
      fade = { from: volume, to, start: now(), ms: ms(volume, to) };
      if (timer === null) timer = setInterval(tick, TICK_MS);
      return started;
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
      if (closed || !audio || unavailable) return Promise.resolve(false);
      ensureLoaded();
      if (unavailable) return Promise.resolve(false);
      if (!audio.paused || volume > 0) return settled;
      const el = audio;
      return play().then((ok) => {
        // Still silent and not asked to play since: back to paused, ready for later.
        if (!closed && volume === 0 && !fade && !el.paused) el.pause();
        return ok;
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
