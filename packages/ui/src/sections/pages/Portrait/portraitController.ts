/**
 * The portrait's motion, ported from the Portrait board. Six short clips, all starting and ending
 * on the same pose: an idle loop and an eyes-down glance for each look, and a transformation
 * between the looks.
 *
 *   idle              the idle loop for the current look plays
 *   hover the switch  his eyes drop to the switch and hold; they come back when the pointer leaves
 *   click the switch  the transformation plays, then the other look's idle loop takes over
 *
 * Each hand-off is a short cross-fade between two nearly identical frames. No pointer tracking.
 */

export type PortraitLookName = 'normal' | 'cyber';

export const PORTRAIT_CLIPS = [
  'normalIdle',
  'cyberIdle',
  'normalGlance',
  'cyberGlance',
  'toCyber',
  'toNormal',
] as const;

export type PortraitClipName = (typeof PORTRAIT_CLIPS)[number];

/**
 * Glance clip timings in seconds. `start`: the eyes begin to drop. `hold` and `up` are the
 * turnaround, where the look down at the switch ends and the same frames play back in reverse.
 */
export interface PortraitGlanceTiming {
  start: number;
  hold: number;
  up: number;
}

export type PortraitMode = 'idle' | 'glance-in' | 'glance-hold' | 'glance-out' | 'morph';

export interface PortraitControllerOptions {
  /** The video element for a clip, or `null` while it is not mounted. */
  clip: (name: PortraitClipName) => HTMLVideoElement | null;
  timing: Record<PortraitLookName, PortraitGlanceTiming>;
  /** How much faster the eyes come back up when the switch is clicked mid-glance. */
  clickRate: number;
  /** Called when the look changes, so the stills and the switch follow. */
  onLook: (look: PortraitLookName) => void;
  look?: PortraitLookName;
}

/** How long after a clip is revealed the others are hidden and paused: just past the cross-fade. */
const SETTLE_MS = 220;

const other = (look: PortraitLookName): PortraitLookName =>
  look === 'normal' ? 'cyber' : 'normal';

export class PortraitController {
  look: PortraitLookName;
  mode: PortraitMode = 'idle';
  /** The name of the clip on top. */
  shown: PortraitClipName | null = null;

  private readonly options: PortraitControllerOptions;
  private readonly prepared = new WeakSet<HTMLVideoElement>();
  private visible = true;
  private still = false;
  private alive = true;
  private hovering = false;
  private morphQueued = false;
  private layer = 0;

  constructor(options: PortraitControllerOptions) {
    this.options = options;
    this.look = options.look ?? 'normal';
  }

  private clip(name: PortraitClipName) {
    return this.options.clip(name);
  }

  private idleName(): PortraitClipName {
    return this.look === 'normal' ? 'normalIdle' : 'cyberIdle';
  }

  private glanceName(): PortraitClipName {
    return this.look === 'normal' ? 'normalGlance' : 'cyberGlance';
  }

  /** True once all six clips are mounted. */
  ready(): boolean {
    return PORTRAIT_CLIPS.every((name) => this.clip(name));
  }

  /** One-time setup for each clip: inline muted playback and the listeners that move the state. */
  private setup() {
    PORTRAIT_CLIPS.forEach((name) => {
      const video = this.clip(name);
      if (!video || this.prepared.has(video)) return;
      this.prepared.add(video);
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.loop = name === 'normalIdle' || name === 'cyberIdle';
      if (name === 'normalGlance' || name === 'cyberGlance') {
        const which: PortraitLookName = name === 'normalGlance' ? 'normal' : 'cyber';
        video.addEventListener('timeupdate', () => {
          if (
            which === this.look &&
            this.mode === 'glance-in' &&
            video.currentTime >= this.options.timing[which].hold
          ) {
            video.pause();
            this.mode = 'glance-hold';
          }
        });
        video.addEventListener('ended', () => {
          if (which !== this.look || this.mode !== 'glance-out') return;
          if (this.morphQueued) this.morph();
          else {
            this.toIdle();
            if (this.hovering) this.glanceIn();
          }
        });
      }
      if (name === 'toCyber' || name === 'toNormal') {
        video.addEventListener('ended', () => {
          if (this.mode === 'morph') this.toIdle();
        });
      }
    });
  }

  /** Play while the portrait is on screen and motion is allowed; otherwise pause. */
  run() {
    if (!this.ready()) return;
    this.setup();
    if (!this.alive || !this.visible || this.still || document.hidden) {
      this.halt();
      return;
    }
    if (!this.shown) {
      this.show(this.idleName());
      return;
    }
    const video = this.clip(this.shown);
    if (video && this.mode !== 'glance-hold') this.play(video);
  }

  halt() {
    const video = this.shown && this.clip(this.shown);
    if (video && !video.paused) video.pause();
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    this.run();
  }

  /** Stills only (reduced motion). Coming back from it starts again from the idle loop. */
  setStill(still: boolean) {
    if (still === this.still) return;
    this.still = still;
    this.shown = null;
    this.mode = 'idle';
    this.run();
  }

  destroy() {
    this.alive = false;
    this.halt();
  }

  private play(video: HTMLVideoElement) {
    const playing = video.play();
    playing?.catch(() => {});
    return playing;
  }

  /**
   * Show one clip from its start. It fades in on top of the clip that was showing, which stays
   * solid underneath until the fade is done.
   */
  private show(name: PortraitClipName) {
    const next = this.clip(name);
    if (!next) return;
    next.currentTime = 0;
    next.playbackRate = 1;
    this.shown = name;
    const reveal = () => {
      if (this.shown !== name || !this.alive) return;
      next.style.zIndex = String(++this.layer);
      next.style.opacity = '1';
      next.dataset.shown = '';
      // Once the fade is done, hide and pause every clip that is not the one showing.
      window.setTimeout(() => {
        PORTRAIT_CLIPS.forEach((otherName) => {
          const video = this.clip(otherName);
          if (video && otherName !== this.shown) {
            video.style.opacity = '0';
            delete video.dataset.shown;
            video.pause();
          }
        });
      }, SETTLE_MS);
    };
    // Wait for a decoded frame so the swap never flashes the still underneath.
    const after = () => {
      if (typeof next.requestVideoFrameCallback === 'function') {
        next.requestVideoFrameCallback(reveal);
      } else reveal();
    };
    const playing = this.play(next);
    if (playing) playing.then(after, reveal);
    else after();
  }

  private toIdle() {
    this.mode = 'idle';
    this.show(this.idleName());
  }

  private glanceIn() {
    if (this.mode !== 'idle' || this.still || !this.ready()) return;
    this.mode = 'glance-in';
    this.show(this.glanceName());
  }

  /**
   * Bring the eyes back up. The glance clip is the look down followed by the same frames in
   * reverse, so jumping to the mirrored time shows the same frame and the return starts at once.
   */
  private glanceOut(rate = 1) {
    const video = this.clip(this.glanceName());
    if (!video) return;
    const timing = this.options.timing[this.look];
    this.mode = 'glance-out';
    if (video.currentTime < timing.up) {
      video.currentTime = Math.max(timing.up, video.duration - video.currentTime);
    }
    video.playbackRate = rate;
    this.play(video);
  }

  /** True while the glance clip is showing but the eyes have not started to drop yet. */
  private eyesStillUp() {
    const video = this.clip(this.glanceName());
    return (
      this.mode === 'glance-in' &&
      Boolean(video) &&
      video!.currentTime < this.options.timing[this.look].start
    );
  }

  private morph() {
    this.mode = 'morph';
    this.morphQueued = false;
    const name: PortraitClipName = this.look === 'normal' ? 'toCyber' : 'toNormal';
    this.look = other(this.look);
    this.options.onLook(this.look);
    this.show(name);
  }

  enter() {
    this.hovering = true;
    this.glanceIn();
  }

  leave() {
    this.hovering = false;
    if (this.still || !this.ready()) return;
    if (this.eyesStillUp()) this.toIdle();
    else if (this.mode === 'glance-in' || this.mode === 'glance-hold') this.glanceOut();
  }

  toggle() {
    if (this.still || !this.ready()) {
      // No video: swap the stills.
      this.look = other(this.look);
      this.options.onLook(this.look);
      return;
    }
    if (this.mode === 'morph' || this.morphQueued) return;
    this.hovering = false; // after a click, no new glance until the pointer leaves and returns
    if (this.mode === 'idle' || this.eyesStillUp()) {
      this.morph();
      return;
    }
    // Mid-glance: bring the eyes back up quickly, then transform.
    this.morphQueued = true;
    if (this.mode === 'glance-out') {
      const video = this.clip(this.glanceName());
      if (video) video.playbackRate = this.options.clickRate;
    } else this.glanceOut(this.options.clickRate);
  }
}
