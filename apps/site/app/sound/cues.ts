/**
 * The site's small interaction sounds, made in code with Web Audio (oscillators, a little noise,
 * envelopes, filters): no audio files. Quiet instrument-panel tones that sit over the ambient bed.
 *
 * The ambience centres on C# (its chroma leans on C#, E, F#, G#, B: C# minor pentatonic), so every
 * pitched cue is a note of that scale. Each voice has a short attack and release (never a jump in
 * level, so never a click), and everything goes through one UI bus: a gain, then a soft ceiling, so no
 * pile-up of cues can get loud. Lives in the lazy sound chunk; nothing here is in a page's first
 * JavaScript.
 */

/** The cues. `soft` is a quieter press, for places that ask for less. */
export type CueName = 'tick' | 'press' | 'soft' | 'node' | 'page' | 'on';

/** C# minor pentatonic, C#5 to C#6: the notes a tree node may ring on. */
export const NODE_NOTES = [554.37, 659.26, 739.99, 830.61, 987.77, 1108.73] as const;

/** Each cue's recipe: the numbers the tests and the audition files are held to. */
export const CUE = {
  /** Hover or keyboard focus: a very short, very soft sine tick on C#7. */
  tick: { freq: 2217.46, peak: 0.018, attack: 0.0015, length: 0.03 },
  /** Press: a triangle on C#5 with a breath of band-passed noise on top. */
  press: { freq: 554.37, peak: 0.035, noise: 0.02, attack: 0.002, length: 0.08 },
  /** A softer press (the tree's list, places that opt for less). */
  soft: { freq: 554.37, peak: 0.022, noise: 0.01, attack: 0.002, length: 0.07 },
  /** A tree node lighting up: a small bell (inharmonic partials), its note from NODE_NOTES. */
  node: {
    peak: 0.025,
    partials: [1, 2.76, 5.4],
    amps: [1, 0.25, 0.08],
    attack: 0.005,
    length: 1.1,
  },
  /** Page change: noise through a band-pass sweeping up, an airy breath. */
  page: { from: 500, to: 2600, peak: 0.06, attack: 0.09, length: 0.32 },
  /** Sound turned on: two notes up, C#6 then G#6. */
  on: { notes: [1108.73, 1661.22], gap: 0.07, peak: 0.035, attack: 0.003, length: 0.13 },
  /** The Contact portal: a low C# hum (C#2, C#3, G#3) that swells in and falls away. */
  hum: { notes: [69.3, 138.59, 207.65], amps: [1, 0.6, 0.2], peak: 0.02, rise: 0.35, fall: 0.2 },
} as const;

/**
 * The ceiling at the end of the UI bus: a soft clipper, transparent at the cues' own levels (they
 * peak far below it) and rounding off anything that piles up past about -12 dBFS. Web Audio's own
 * compressor adds make-up gain, which would lift every cue, so it is not used.
 */
export const CEILING = 0.25;

/** The clipper's curve: y = c * tanh(x / c), linear for quiet input, never past `c`. */
export function ceilingCurve(points = 1024, c: number = CEILING) {
  const curve = new Float32Array(points);
  for (let i = 0; i < points; i += 1) {
    const x = (i / (points - 1)) * 2 - 1;
    curve[i] = c * Math.tanh(x / c);
  }
  return curve;
}

/** The smallest level an exponential ramp can reach; then a short linear step to silence. */
const FLOOR = 0.0001;

export interface CueBus {
  /** Plays a cue now. `note` picks the node's note (any integer; it wraps). */
  play: (name: CueName, note?: number) => void;
  /** The portal's hum: swells while true, falls away when false. */
  hum: (on: boolean) => void;
  /** Lets every node go. */
  dispose: () => void;
}

/** One envelope: silent, up to `peak` in `attack`, exponentially down to silence by `end`. */
function envelope(gain: AudioParam, t: number, peak: number, attack: number, end: number) {
  gain.setValueAtTime(0, t);
  gain.linearRampToValueAtTime(peak, t + attack);
  gain.exponentialRampToValueAtTime(FLOOR, end - 0.004);
  gain.linearRampToValueAtTime(0, end);
}

/**
 * The UI bus over `ctx`, ending at `destination` (default: the speakers). Works with an
 * `OfflineAudioContext` too, which is how the audition files are rendered.
 */
export function createCueBus(
  ctx: BaseAudioContext,
  destination: AudioNode = ctx.destination,
): CueBus {
  const bus = ctx.createGain();
  bus.gain.value = 1;
  const limiter = ctx.createWaveShaper();
  limiter.curve = ceilingCurve();
  bus.connect(limiter);
  limiter.connect(destination);

  // Half a second of white noise, made once and shared by every noisy cue.
  const noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.5), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;

  /** A voice: source -> (filter) -> its own gain -> the bus; started now, stopped after `end`. */
  const voice = (
    source: AudioScheduledSourceNode,
    filter: AudioNode | null,
    t: number,
    end: number,
  ) => {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    if (filter) {
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.connect(gain);
    }
    gain.connect(bus);
    source.start(t);
    source.stop(end + 0.02);
    return gain.gain;
  };

  const tone = (type: OscillatorType, freq: number) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    return osc;
  };

  const hiss = (freq: number, q: number) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    return { src, filter };
  };

  const press = (r: typeof CUE.press | typeof CUE.soft, t: number) => {
    envelope(
      voice(tone('triangle', r.freq), null, t, t + r.length),
      t,
      r.peak,
      r.attack,
      t + r.length,
    );
    const { src, filter } = hiss(3500, 1.2);
    envelope(voice(src, filter, t, t + 0.014), t, r.noise, 0.001, t + 0.014);
  };

  let hum: { gain: AudioParam; stop: (at: number) => void } | null = null;

  return {
    play: (name, note = 0) => {
      const t = ctx.currentTime;
      if (name === 'tick') {
        const r = CUE.tick;
        envelope(
          voice(tone('sine', r.freq), null, t, t + r.length),
          t,
          r.peak,
          r.attack,
          t + r.length,
        );
      } else if (name === 'press' || name === 'soft') {
        press(CUE[name], t);
      } else if (name === 'node') {
        const r = CUE.node;
        const n = NODE_NOTES.length;
        const base = NODE_NOTES[((note % n) + n) % n]!;
        r.partials.forEach((p, i) => {
          const end = t + r.length / (1 + i);
          envelope(
            voice(tone('sine', base * p), null, t, end),
            t,
            r.peak * r.amps[i]!,
            r.attack,
            end,
          );
        });
      } else if (name === 'page') {
        const r = CUE.page;
        const { src, filter } = hiss(r.from, 0.8);
        filter.frequency.setValueAtTime(r.from, t);
        filter.frequency.exponentialRampToValueAtTime(r.to, t + r.length);
        envelope(voice(src, filter, t, t + r.length), t, r.peak, r.attack, t + r.length);
      } else {
        const r = CUE.on;
        r.notes.forEach((freq, i) => {
          const at = t + i * r.gap;
          envelope(
            voice(tone('sine', freq), null, at, at + r.length),
            at,
            r.peak,
            r.attack,
            at + r.length,
          );
        });
      }
    },
    hum: (on) => {
      const t = ctx.currentTime;
      const r = CUE.hum;
      if (on) {
        if (hum) return;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.setTargetAtTime(r.peak, t, r.rise);
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 600;
        lowpass.connect(gain);
        gain.connect(bus);
        const oscs = r.notes.map((freq, i) => {
          const osc = tone(i === 2 ? 'triangle' : 'sine', freq);
          const level = ctx.createGain();
          level.gain.value = r.amps[i]!;
          osc.connect(level);
          level.connect(lowpass);
          osc.start(t);
          return osc;
        });
        hum = { gain: gain.gain, stop: (at) => oscs.forEach((osc) => osc.stop(at)) };
        return;
      }
      if (!hum) return;
      // Falls away from wherever the swell had got to; stopped once it is silent.
      // Hold the level it has reached (a cancel alone would jump back), then let it go.
      const level = hum.gain.value;
      hum.gain.cancelScheduledValues(t);
      hum.gain.setValueAtTime(level, t);
      hum.gain.setTargetAtTime(0, t, r.fall);
      hum.stop(t + r.fall * 6);
      hum = null;
    },
    dispose: () => {
      if (hum) {
        hum.stop(ctx.currentTime + 0.05);
        hum = null;
      }
      try {
        bus.disconnect();
        limiter.disconnect();
      } catch {
        // Already gone with the context.
      }
    },
  };
}
