import { describe, expect, it } from 'vitest';

import { CEILING, ceilingCurve, createCueBus, CUE, type CueName, NODE_NOTES } from './cues';

type Event = [method: string, value: number, time: number];

/** An AudioParam that records its automation. */
class Param {
  value: number;
  events: Event[] = [];
  constructor(value = 0) {
    this.value = value;
  }
  setValueAtTime(v: number, t: number) {
    this.events.push(['set', v, t]);
  }
  linearRampToValueAtTime(v: number, t: number) {
    this.events.push(['linear', v, t]);
  }
  exponentialRampToValueAtTime(v: number, t: number) {
    this.events.push(['exp', v, t]);
  }
  setTargetAtTime(v: number, t: number, tc: number) {
    this.events.push(['target', v, tc]);
    void t;
  }
  cancelScheduledValues(t: number) {
    this.events.push(['cancel', 0, t]);
  }
}

class Node {
  to: unknown[] = [];
  connect(node: unknown) {
    this.to.push(node);
    return node;
  }
  disconnect() {
    this.to = [];
  }
}

/** A Web Audio context that makes no sound and records every node and schedule. */
class RecordingContext {
  currentTime = 10;
  sampleRate = 48000;
  destination = new Node();
  gains: (Node & { gain: Param })[] = [];
  oscs: (Node & { type: string; frequency: Param; started: number; stopped: number })[] = [];
  sources: (Node & { started: number; stopped: number })[] = [];
  filters: (Node & { type: string; frequency: Param; Q: Param })[] = [];
  shapers: (Node & { curve: Float32Array | null })[] = [];
  createGain() {
    const g = Object.assign(new Node(), { gain: new Param(1) });
    this.gains.push(g);
    return g;
  }
  createOscillator() {
    const o = Object.assign(new Node(), {
      type: 'sine',
      frequency: new Param(440),
      started: -1,
      stopped: -1,
      start(t: number) {
        o.started = t;
      },
      stop(t: number) {
        o.stopped = t;
      },
    });
    this.oscs.push(o);
    return o;
  }
  createBufferSource() {
    const s = Object.assign(new Node(), {
      buffer: null as unknown,
      started: -1,
      stopped: -1,
      start(t: number) {
        s.started = t;
      },
      stop(t: number) {
        s.stopped = t;
      },
    });
    this.sources.push(s);
    return s;
  }
  createBiquadFilter() {
    const f = Object.assign(new Node(), {
      type: 'lowpass',
      frequency: new Param(350),
      Q: new Param(1),
    });
    this.filters.push(f);
    return f;
  }
  createWaveShaper() {
    const w = Object.assign(new Node(), { curve: null as Float32Array | null });
    this.shapers.push(w);
    return w;
  }
  createBuffer(_channels: number, length: number) {
    const data = new Float32Array(length);
    return { getChannelData: () => data };
  }
}

function setup() {
  const ctx = new RecordingContext();
  const bus = createCueBus(ctx as unknown as BaseAudioContext);
  // The bus gain is the first gain; voices come after.
  const voices = () => ctx.gains.slice(1);
  return { ctx, bus, voices };
}

/** An envelope starts silent, rises to its peak, and ends at exactly zero: no clicks. */
function expectClean(param: Param, peak: number, start: number, length: number) {
  const [first, rise] = param.events;
  const last = param.events.at(-1)!;
  expect(first).toEqual(['set', 0, start]);
  expect(rise![0]).toBe('linear');
  expect(rise![1]).toBeCloseTo(peak, 6);
  // An attack of a millisecond or more.
  expect(rise![2] - start).toBeGreaterThanOrEqual(0.00099);
  expect(last[0]).toBe('linear');
  expect(last[1]).toBe(0);
  expect(last[2]).toBeCloseTo(start + length, 6);
}

describe('the UI bus', () => {
  it('ends in a soft ceiling: linear for quiet input, never past the ceiling', () => {
    const { ctx } = setup();
    expect(ctx.shapers).toHaveLength(1);
    const curve = ceilingCurve(1025);
    expect(curve[512]).toBeCloseTo(0, 6);
    // At a cue's level (about -26 dBFS, 0.05) the curve is all but straight.
    const x = 0.05;
    const i = Math.round(((x + 1) / 2) * 1024);
    expect(curve[i]! / ((i / 1024) * 2 - 1)).toBeGreaterThan(0.98);
    expect(Math.max(...curve)).toBeLessThanOrEqual(CEILING);
    expect(Math.min(...curve)).toBeGreaterThanOrEqual(-CEILING);
  });

  it('keeps every cue far under the ceiling and the ambience (peaks of 0.035 or less)', () => {
    expect(CUE.tick.peak).toBeLessThan(CUE.press.peak);
    for (const peak of [CUE.tick.peak, CUE.press.peak, CUE.node.peak, CUE.on.peak, CUE.hum.peak]) {
      expect(peak).toBeLessThanOrEqual(0.035);
    }
  });
});

describe('each cue', () => {
  it('tick: one sine on C#7, 30 ms, very soft', () => {
    const { ctx, bus, voices } = setup();
    bus.play('tick');
    expect(ctx.oscs).toHaveLength(1);
    expect(ctx.oscs[0]!.type).toBe('sine');
    expect(ctx.oscs[0]!.frequency.value).toBeCloseTo(2217.46, 1);
    expectClean(voices()[0]!.gain, CUE.tick.peak, 10, CUE.tick.length);
    expect(ctx.oscs[0]!.stopped).toBeGreaterThan(10 + CUE.tick.length);
  });

  it.each(['press', 'soft'] as const)('%s: a triangle on C#5 and a breath of noise', (name) => {
    const { ctx, bus, voices } = setup();
    bus.play(name);
    expect(ctx.oscs.map((o) => o.type)).toEqual(['triangle']);
    expect(ctx.sources).toHaveLength(1);
    expect(ctx.filters[0]!.type).toBe('bandpass');
    expectClean(voices()[0]!.gain, CUE[name].peak, 10, CUE[name].length);
    expectClean(voices()[1]!.gain, CUE[name].noise, 10, 0.014);
  });

  it('node: a small bell on a C# minor pentatonic note, chosen by the node', () => {
    const { ctx, bus, voices } = setup();
    bus.play('node', 2);
    const base = NODE_NOTES[2];
    expect(ctx.oscs.map((o) => o.frequency.value)).toEqual(CUE.node.partials.map((p) => base * p));
    expectClean(voices()[0]!.gain, CUE.node.peak, 10, CUE.node.length);
    // Any integer picks a note (it wraps, negatives too).
    bus.play('node', -1);
    expect(ctx.oscs[3]!.frequency.value).toBe(NODE_NOTES.at(-1));
    bus.play('node', NODE_NOTES.length);
    expect(ctx.oscs[6]!.frequency.value).toBe(NODE_NOTES[0]);
  });

  it('page: noise through a band-pass sweeping 500 Hz to 2.6 kHz in 320 ms', () => {
    const { ctx, bus, voices } = setup();
    bus.play('page');
    const sweep = ctx.filters[0]!.frequency.events;
    expect(sweep).toEqual([
      ['set', 500, 10],
      ['exp', 2600, 10 + CUE.page.length],
    ]);
    expectClean(voices()[0]!.gain, CUE.page.peak, 10, CUE.page.length);
  });

  it('on: two notes up, C#6 then G#6', () => {
    const { ctx, bus, voices } = setup();
    bus.play('on');
    expect(ctx.oscs.map((o) => Math.round(o.frequency.value))).toEqual([1109, 1661]);
    expectClean(voices()[0]!.gain, CUE.on.peak, 10, CUE.on.length);
    expectClean(voices()[1]!.gain, CUE.on.peak, 10 + CUE.on.gap, CUE.on.length);
  });

  it.each(['tick', 'press', 'node', 'page', 'on'] as CueName[])(
    '%s: every voice reaches the bus, not the speakers directly',
    (name) => {
      const { ctx, bus, voices } = setup();
      bus.play(name, 0);
      const busGain = ctx.gains[0]!;
      for (const v of voices()) expect(v.to).toEqual([busGain]);
    },
  );
});

describe('the portal hum', () => {
  it('swells in, holds while on, and falls away from where it got to, then stops', () => {
    const { ctx, bus } = setup();
    bus.hum(true);
    bus.hum(true);
    expect(ctx.oscs.map((o) => Math.round(o.frequency.value))).toEqual([69, 139, 208]);
    const swell = ctx.gains[1]!.gain;
    expect(swell.events).toEqual([
      ['set', 0, 10],
      ['target', CUE.hum.peak, CUE.hum.rise],
    ]);
    swell.value = 0.012;
    ctx.currentTime = 11;
    bus.hum(false);
    expect(swell.events.slice(2)).toEqual([
      ['cancel', 0, 11],
      ['set', 0.012, 11],
      ['target', 0, CUE.hum.fall],
    ]);
    for (const o of ctx.oscs) expect(o.stopped).toBeCloseTo(11 + CUE.hum.fall * 6, 6);
    // Off again does nothing; on again starts a new hum.
    bus.hum(false);
    bus.hum(true);
    expect(ctx.oscs).toHaveLength(6);
  });
});
