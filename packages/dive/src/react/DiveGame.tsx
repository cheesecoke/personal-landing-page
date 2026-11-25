import {
  type PointerEvent as ReactPointerEvent,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { Readout, VisuallyHidden } from '@cwc/ui';

import { createRun, type DiveState, startRun, step } from '../run';
import { type DiveColors, fallbackDiveColors, readDiveColors } from './colors';
import { type DiveCopy, defaultDiveCopy } from './copy';
import s from './DiveGame.module.css';
import { drawFrame } from './draw';
import { advanceFx, createFx, decay, FX_MS, type Fx } from './fx';
import { type Held, keyDirection, pointerDirection, press, release, steerFromHeld } from './input';
import { type Viewport, viewportFor } from './projection';
import { buildResult, type DiveResult } from './result';

export interface DiveGameHandle {
  /** Start the run if it is waiting ('ready'). Does nothing once it is running or over. */
  start: () => void;
  /** Throw the run away and begin a new one: a fresh seed, or `seed` when given. */
  restart: (seed?: number) => void;
  /** The current snapshot of the run, or null before mount. For tests and tooling. */
  state: () => DiveState | null;
}

export interface DiveGameProps {
  /**
   * Seeds the course: same seed, same rings. Left out, a fresh seed is drawn for each run, in an
   * effect (never during render, so pre-rendered HTML stays stable).
   */
  seed?: number;
  /** Calm mode: slower and wider gaps, no shake, no streaks. Default: the reduced-motion setting. */
  calm?: boolean;
  /** Freeze the run and stop the frame loop (for a menu or dialog over the game). */
  paused?: boolean;
  /** Start running as soon as the run is laid out (default true). False waits for `ref.start()`. */
  autoStart?: boolean;
  /** Called once when a run ends, won or crashed. */
  onEnd?: (result: DiveResult) => void;
  copy?: Partial<DiveCopy>;
  className?: string;
  /**
   * Start from this snapshot instead of a fresh run. For stories and visual checks (a frozen
   * frame); it replaces `seed`, `calm` and `autoStart`.
   */
  initialState?: DiveState;
  ref?: Ref<DiveGameHandle>;
}

const REDUCE = '(prefers-reduced-motion: reduce)';
const media = (query: string) =>
  typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;

/** The OS setting, or `[data-motion="reduce"]` on the root (the site's switch). */
function subscribeMotion(onChange: () => void) {
  const mq = media(REDUCE);
  mq?.addEventListener('change', onChange);
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => {
    mq?.removeEventListener('change', onChange);
    mo.disconnect();
  };
}
const motionReduced = () =>
  document.documentElement.dataset.motion === 'reduce' || !!media(REDUCE)?.matches;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}
const pageHidden = () => document.visibilityState === 'hidden';

const freshSeed = () => Math.floor(Math.random() * 0x1_0000_0000);

/** Typing in a field is never steering. */
function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

interface Hud {
  lives: number;
  total: number;
  /** Whole percent, 0..100. */
  percent: number;
}

/**
 * Portal dive: one run, drawn on a 2D canvas. Fly down the tunnel along the thread and steer
 * through the gap in each ring. The component only plays and reports the end (`onEnd`); start,
 * crash and win screens belong to the page around it.
 *
 * The player stays at the bottom of the screen and the tunnel turns around them, so left and
 * right on screen always mean the same thing. Keyboard: Left/Right or A/D. Touch and mouse: hold
 * the left or right half. Nothing touches `window`, `document` or a canvas until mount.
 */
export function DiveGame({
  seed,
  calm,
  paused = false,
  autoStart = true,
  onEnd,
  copy: copyIn,
  className,
  initialState,
  ref,
}: DiveGameProps) {
  const copy = { ...defaultDiveCopy, ...copyIn };
  const reduced = useSyncExternalStore(subscribeMotion, motionReduced, () => false);
  const hidden = useSyncExternalStore(subscribeVisibility, pageHidden, () => false);
  const isCalm = calm ?? reduced;
  const quiet = isCalm || reduced;

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const viewRef = useRef<Viewport>(viewportFor(1, 1));
  const colorsRef = useRef<DiveColors>(fallbackDiveColors);
  const stateRef = useRef<DiveState | null>(null);
  const fxRef = useRef<Fx>(createFx());
  const heldRef = useRef<Held[]>([]);
  const endedRef = useRef(false);
  const quietRef = useRef(quiet);
  const onEndRef = useRef(onEnd);
  const wakeRef = useRef<() => void>(() => {});
  const seedRef = useRef<number | undefined>(undefined);

  const [run, setRun] = useState(0);
  const [hud, setHud] = useState<Hud | null>(null);

  useEffect(() => {
    quietRef.current = quiet;
    onEndRef.current = onEnd;
  });

  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    const state = stateRef.current;
    if (!ctx || !state) return;
    drawFrame(ctx, viewRef.current, state, fxRef.current, colorsRef.current, {
      quiet: quietRef.current,
    });
  }, []);

  const syncHud = useCallback(() => {
    const state = stateRef.current;
    if (!state) return;
    const next: Hud = {
      lives: state.lives,
      total: state.config.lives,
      percent: Math.floor(state.progress * 100),
    };
    setHud((h) =>
      h && h.lives === next.lives && h.total === next.total && h.percent === next.percent
        ? h
        : next,
    );
  }, []);

  // Canvas, colours and size: once, on mount.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    ctxRef.current = canvas.getContext('2d');
    const style = getComputedStyle(root);
    colorsRef.current = readDiveColors((name) => style.getPropertyValue(name));

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctxRef.current?.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewRef.current = viewportFor(rect.width, rect.height);
      draw();
    };
    resize();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    return () => ro.disconnect();
  }, [draw]);

  // A run: laid out from the seed whenever the seed, the mode or `restart` changes.
  useEffect(() => {
    let state: DiveState;
    if (initialState) {
      state = initialState;
    } else {
      state = createRun({ seed: seedRef.current ?? seed ?? freshSeed(), calm: isCalm });
      if (autoStart) state = startRun(state);
    }
    seedRef.current = undefined;
    stateRef.current = state;
    fxRef.current = createFx();
    heldRef.current = [];
    endedRef.current = false;
    wakeRef.current();
    // `autoStart` is read once per run on purpose: flipping it later does not restart the run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, isCalm, run, initialState]);

  // The frame loop. Runs while there is something moving; stops when paused, hidden or unmounted.
  useEffect(() => {
    let frame = 0;
    let last: number | null = null;
    let active = false;
    const stopped = paused || hidden;

    const tick = (t: number) => {
      const dt = last === null ? 0 : t - last;
      last = t;
      let state = stateRef.current;
      if (state && state.status === 'running') {
        state = step(state, { steer: steerFromHeld(heldRef.current) }, dt);
        stateRef.current = state;
      }
      if (state) fxRef.current = advanceFx(fxRef.current, state, dt);
      draw();
      syncHud();

      if (state && !endedRef.current) {
        const result = buildResult(state);
        if (result) {
          endedRef.current = true;
          onEndRef.current?.(result);
        }
      }

      const fx = fxRef.current;
      const settling =
        decay(fx.now, fx.hitAt, FX_MS.hit) > 0 || decay(fx.now, fx.passAt, FX_MS.pass) > 0;
      if (state?.status === 'running' || settling) {
        frame = requestAnimationFrame(tick);
      } else {
        active = false;
      }
    };

    const wake = () => {
      if (stopped) {
        draw();
        syncHud();
        return;
      }
      if (active) return;
      active = true;
      last = null;
      frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;
    wake();

    return () => {
      cancelAnimationFrame(frame);
      wakeRef.current = () => {};
    };
  }, [paused, hidden, draw, syncHud]);

  // Keyboard: only the steering keys, only while a run is going. Everything else passes through.
  useEffect(() => {
    const steering = () => !paused && stateRef.current?.status === 'running';
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return;
      const dir = keyDirection(e.key);
      if (dir === null) return;
      const id = e.key.toLowerCase();
      if (e.type === 'keyup') {
        heldRef.current = release(heldRef.current, id);
        return;
      }
      if (!steering()) return;
      e.preventDefault();
      heldRef.current = press(heldRef.current, id, dir);
    };
    const clear = () => (heldRef.current = []);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('blur', clear);
    };
  }, [paused]);

  const onPointer = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const id = `pointer:${e.pointerId}`;
    if (e.type === 'pointerdown') {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } else if (e.type !== 'pointermove') {
      heldRef.current = release(heldRef.current, id);
      return;
    }
    // A move only counts for a pointer already held: sliding across the middle switches sides.
    if (e.type === 'pointermove' && !heldRef.current.some((h) => h.id === id)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    heldRef.current = press(
      heldRef.current,
      id,
      pointerDirection(e.clientX - rect.left, rect.width),
    );
  };

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        const state = stateRef.current;
        if (state?.status !== 'ready') return;
        stateRef.current = startRun(state);
        wakeRef.current();
      },
      restart: (nextSeed) => {
        seedRef.current = nextSeed;
        setRun((n) => n + 1);
      },
      state: () => stateRef.current,
    }),
    [],
  );

  return (
    <section
      ref={rootRef}
      aria-label={copy.label}
      className={[s.root, className].filter(Boolean).join(' ')}
      data-dive-calm={isCalm || undefined}
    >
      <VisuallyHidden as="p">{copy.instructions}</VisuallyHidden>
      <canvas
        ref={canvasRef}
        className={s.canvas}
        aria-hidden="true"
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onPointerUp={onPointer}
        onPointerCancel={onPointer}
        onLostPointerCapture={onPointer}
        onContextMenu={(e) => e.preventDefault()}
      />
      {hud && (
        <div className={s.hud}>
          <div role="status">
            <VisuallyHidden>{`${copy.lives}: ${hud.lives}/${hud.total}`}</VisuallyHidden>
            <ul className={s.lives} aria-hidden="true">
              {Array.from({ length: hud.total }, (_, i) => (
                <li key={i} className={i < hud.lives ? s.life : `${s.life} ${s.lifeLost}`} />
              ))}
            </ul>
          </div>
          <div className={s.progress}>
            <div
              className={s.track}
              role="progressbar"
              aria-label={copy.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={hud.percent}
            >
              <div className={s.fill} style={{ width: `${hud.percent}%` }} />
            </div>
            <Readout kind="status" tone="secondary" className={s.percent} aria-hidden="true">
              {hud.percent}%
            </Readout>
          </div>
        </div>
      )}
    </section>
  );
}
