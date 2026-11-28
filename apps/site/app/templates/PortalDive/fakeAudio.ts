import type { AudioContextLike, AudioLike, GainLike } from './music';

/**
 * For tests and stories only: a silent stand-in for the music's `<audio>` element that records
 * what was asked of it. Stories pass it (through the `audio` prop) so a test run never plays.
 */
export class FakeAudio implements AudioLike {
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

/** For tests and stories only: a Web Audio context that records the graph and makes no sound. */
export class FakeAudioContext implements AudioContextLike {
  state: 'suspended' | 'running' | 'closed' = 'suspended';
  readonly destination = { kind: 'destination' };
  gains: { gain: { value: number }; connect: (to: unknown) => unknown; to: unknown }[] = [];
  sources: unknown[] = [];
  resumes = 0;
  failOn: 'none' | 'source' = 'none';

  createMediaElementSource(element: never) {
    if (this.failOn === 'source') throw new Error('InvalidStateError');
    this.sources.push(element);
    return { connect: (node: GainLike) => node };
  }
  createGain() {
    const node = {
      gain: { value: 1 },
      to: null as unknown,
      connect(to: unknown) {
        node.to = to;
        return to;
      },
    };
    this.gains.push(node);
    return node;
  }
  resume() {
    this.resumes += 1;
    this.state = 'running';
    return Promise.resolve();
  }
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
  /** The level the music is playing at, or null before it is routed. */
  get level() {
    return this.gains[0]?.gain.value ?? null;
  }
}
