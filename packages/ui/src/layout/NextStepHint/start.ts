/*
 * The next-step hint's wiring to the page: the listeners, what "welcome" means, where the target
 * is. Loaded after hydration (a dynamic import in `NextStepHint`), so none of it is in a page's
 * first JS.
 */
import { duration, nudge } from '@cwc/tokens';

import {
  createNextStepController,
  type NextStepEnv,
  type NextStepPlacement,
  type NextStepTimings,
} from './controller';

const TARGET = '[data-next-step]';
const HINT_ATTR = 'data-next-step-hint';

const timingsFor = (debugIdleMs?: number): NextStepTimings =>
  debugIdleMs === undefined
    ? { ...nudge, hint: duration.hint, cue: duration['hint-cue'] }
    : {
        idle: debugIdleMs,
        repeat: debugIdleMs * 2,
        plays: nudge.plays,
        hint: debugIdleMs,
        cue: debugIdleMs,
      };

/**
 * Whether a hint is welcome: the tab is shown, motion is welcome, no page transition is running, no
 * dialog is open (the phone menu and the Portal dive are dialogs), and no keyboard reader's focus
 * ring is showing (they are reading with Tab).
 */
const welcome = () =>
  !document.hidden &&
  document.documentElement.dataset.motion !== 'reduce' &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !(document as Document & { activeViewTransition?: unknown }).activeViewTransition &&
  !document.querySelector('dialog[open],:focus-visible:not(body,#main)');

const findTarget = () => document.querySelector<HTMLElement>(TARGET);

function placementOf(target: HTMLElement | null): NextStepPlacement {
  if (!target) return 'away';
  const rect = target.getBoundingClientRect();
  if (rect.height === 0 || rect.width === 0) return 'away';
  const viewport = window.innerHeight;
  const shown = Math.min(rect.bottom, viewport) - Math.max(rect.top, 0);
  if (shown >= rect.height * nudge.inView) return 'inView';
  return rect.top > 0 ? 'below' : 'away';
}

/** Starts the hint on the page; returns the clean-up. `cue` is the scroll cue's element. */
export function startNextStepHint(cue: HTMLElement, debugIdleMs?: number): () => void {
  let hinted: HTMLElement | null = null;
  const env: NextStepEnv = {
    canHint: welcome,
    placement: () => {
      const target = findTarget();
      // Hovered or focused before the listeners were there: that counts as engaged.
      if (target?.matches(':hover,:focus')) {
        controller.engage();
        return 'away';
      }
      return placementOf(target);
    },
    canScroll: () => document.documentElement.scrollHeight - window.innerHeight > 1,
    play: (kind) => {
      if (kind === 'cue') {
        cue.setAttribute('data-cue', 'play');
        return;
      }
      hinted = findTarget();
      hinted?.setAttribute(HINT_ATTR, 'play');
    },
    stop: (kind) => {
      if (kind === 'cue') {
        cue.removeAttribute('data-cue');
        return;
      }
      hinted?.removeAttribute(HINT_ATTR);
      hinted = null;
    },
  };
  const controller = createNextStepController(env, timingsFor(debugIdleMs), document.hidden);

  const onActivity = () => controller.activity();
  const onScroll = () => controller.activity('scroll');
  const onEngage = (event: Event) => {
    if (event.target instanceof Element && event.target.closest(TARGET)) controller.engage();
  };
  const onVisibility = () => controller.hidden(document.hidden);

  const options = { passive: true, capture: true } as const;
  const activity = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
  const engage = ['pointerover', 'focusin', 'click'] as const;
  for (const type of activity) window.addEventListener(type, onActivity, options);
  for (const type of engage) document.addEventListener(type, onEngage, options);
  window.addEventListener('scroll', onScroll, options);
  document.addEventListener('visibilitychange', onVisibility);
  // Listening: stories and tests wait for this before they act.
  cue.setAttribute('data-ready', '');

  return () => {
    controller.destroy();
    for (const type of activity) window.removeEventListener(type, onActivity, options);
    for (const type of engage) document.removeEventListener(type, onEngage, options);
    window.removeEventListener('scroll', onScroll, options);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
