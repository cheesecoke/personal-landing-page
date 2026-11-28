import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import s from './arrival.module.css';
import type { GardenScene } from './scene';
import { useMotionReduced } from './useMotionReduced';

/**
 * Where the garden's video is, as `data-garden-video` (stories and tests read it): `loading` (on
 * its way, unseen), `playing` (shown over the still), `paused` (shown, but the garden is off screen
 * or the tab hidden), `failed` (it could not load or play: the still stays).
 */
export type VideoState = 'loading' | 'playing' | 'paused' | 'failed';

export interface GardenVideoProps {
  scene: GardenScene;
  /** The garden is on screen. The video is not asked for until it first is. */
  shown: boolean;
}

/** Tall screens get the left half of the clip, as they get the left half of the still. */
function useTall(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;
      mq?.addEventListener('change', onChange);
      return () => mq?.removeEventListener('change', onChange);
    },
    () => (typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false),
    () => false,
  );
}

/**
 * The garden, moving: a muted, looping video of the same scene, exactly over the still (same box,
 * same framing; the camera never moves). It is only asked for once the garden is first shown, is
 * invisible until it plays, then cross-fades in over the still, which stays underneath. It pauses
 * while the garden is off screen or the tab is hidden, and lets go of the file when it unmounts.
 * With reduced motion it is not there at all; if it fails or stalls, the still is what shows.
 */
export function GardenVideo({ scene, shown }: GardenVideoProps) {
  const reduced = useMotionReduced();
  const tall = useTall(scene.tallMedia);
  const [asked, setAsked] = useState(false);
  if (shown && !asked && !reduced) setAsked(true);
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>('loading');
  const clip = scene.video ? (tall ? scene.video.tall : scene.video.wide) : null;
  // Which clip can play through (a phone turned on its side starts the other one from unseen).
  const [readyClip, setReadyClip] = useState<string | null>(null);
  const ready = !!clip && readyClip === clip.mp4;
  const mounted = !reduced && asked && !!clip;
  const clipKey = clip?.mp4;

  // Play while the garden is on screen and the tab is visible; pause otherwise.
  useEffect(() => {
    const video = ref.current;
    if (!video || state === 'failed') return;
    const sync = () => {
      const want = shown && document.visibilityState !== 'hidden';
      if (want && ready) {
        video.play().catch(() => setState('failed'));
      } else if (!want) {
        video.pause();
        if (ready) setState('paused');
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [shown, ready, state, clipKey]);

  // Let the file go when the element leaves (the garden closes, or another clip replaces it), so
  // nothing keeps loading or decoding behind the page.
  useEffect(() => {
    const video = ref.current;
    if (!mounted || !video) return;
    return () => {
      video.pause();
      video.removeAttribute('src');
      video.replaceChildren();
      video.load();
    };
  }, [mounted, clipKey]);

  if (!mounted) return null;
  return (
    <video
      // A new element for a new clip (a phone turned on its side), so the sources apply.
      key={clip.mp4}
      ref={ref}
      className={s.video}
      aria-hidden="true"
      tabIndex={-1}
      muted
      loop
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      preload="auto"
      data-garden-video={state}
      data-ready={ready && state !== 'failed' ? '' : undefined}
      onCanPlayThrough={() => setReadyClip(clip.mp4)}
      onPlaying={() => setState('playing')}
      onError={() => setState('failed')}
    >
      {clip.webm ? <source src={clip.webm} type="video/webm" /> : null}
      <source src={clip.mp4} type="video/mp4" onError={() => setState('failed')} />
    </video>
  );
}
