import type { AudioLike } from './music';

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
