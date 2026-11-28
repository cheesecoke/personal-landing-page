import { createGardenRenderer, type GardenRenderer } from './gardenGl';
import { backingSize, easeIn, flockAt } from './gardenMath';

/**
 * Where the garden's motion is, on the canvas as `data-garden-motion` (stories and tests read it):
 * `loading` (masks on their way), `running`, `paused` (scene not on screen, or the tab hidden),
 * `unsupported` (no WebGL2, or the program would not build), `lost` (the context went away),
 * `failed` (the masks did not load). Only while `running` or `paused` is the canvas shown; in every
 * other state the plain image underneath is what the reader sees.
 */
export type MotionState = 'loading' | 'running' | 'paused' | 'unsupported' | 'lost' | 'failed';

export type ContextFactory = (canvas: HTMLCanvasElement) => WebGL2RenderingContext | null;

export const browserContext: ContextFactory = (canvas) =>
  canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  });

export interface LiveOptions {
  /** The masks' address. */
  masks: string;
  /** Makes the context. Default: the browser's WebGL2. Stories pass one that fails. */
  getContext?: ContextFactory;
  /** Called on every state change. */
  onState?: (state: MotionState) => void;
}

export interface Live {
  /** On screen (the garden is shown) or not: the loop runs only while it is. */
  setActive: (active: boolean) => void;
  /** Stops for good and lets the context go. */
  dispose: () => void;
}

/** Frames are drawn at about this rate: the motion is slow, and it halves the cost on phones. */
const FRAME_MS = 1000 / 30;

/**
 * Brings the garden to life on `canvas`, drawing `img` (already decoded) through the shader. The
 * canvas sits exactly over the image, so the pan and the arrival's zoom move both together; until
 * the first frame is drawn (identical to the image, the motion eases in from zero), the canvas is
 * invisible and the image shows.
 */
export function startGardenMotion(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  { masks, getContext = browserContext, onState }: LiveOptions,
): Live {
  let state: MotionState = 'loading';
  let renderer: GardenRenderer | null = null;
  let active = false;
  let disposed = false;
  let frame = 0;
  let last = 0;
  // Seconds of motion so far: reset each time the scene comes on screen, kept across a hidden tab.
  let clock = 0;
  let resized: ResizeObserver | null = null;

  const set = (next: MotionState) => {
    if (state === next) return;
    state = next;
    canvas.dataset.gardenMotion = next;
    onState?.(next);
  };
  canvas.dataset.gardenMotion = state;

  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const size = () => {
    if (!renderer) return;
    const box = canvas.getBoundingClientRect();
    // The box's own size, before any transform (the arrival's zoom).
    const cssW = canvas.clientWidth || box.width;
    const cssH = canvas.clientHeight || box.height;
    const { width, height } = backingSize(
      cssW,
      cssH,
      window.devicePixelRatio || 1,
      img.naturalWidth,
    );
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    renderer.resize(width, height);
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (!renderer) return;
    if (last && now - last < FRAME_MS - 2) return;
    const step = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    clock += step;
    renderer.draw(clock, easeIn(clock), flockAt(clock));
    // Shown only once a real frame is on it (the first is the still image exactly).
    if (!('gardenDrawn' in canvas.dataset)) canvas.dataset.gardenDrawn = '';
    if (state !== 'running') set('running');
  };

  const run = () => {
    if (disposed || !renderer || frame) return;
    if (!active || document.visibilityState === 'hidden') {
      if (state === 'running') set('paused');
      return;
    }
    last = 0;
    frame = requestAnimationFrame(tick);
  };

  const pause = () => {
    stop();
    if (state === 'running') set('paused');
  };

  const onVisibility = () => (document.visibilityState === 'hidden' ? pause() : run());
  const onLost = (event: Event) => {
    event.preventDefault();
    stop();
    renderer = null;
    delete canvas.dataset.gardenDrawn;
    set('lost');
  };
  const onImage = () => {
    if (!renderer || !img.complete || img.naturalWidth === 0) return;
    renderer.setImage(img);
    size();
  };

  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = getContext(canvas);
  } catch {
    gl = null;
  }
  if (!gl) {
    set('unsupported');
  } else {
    const context = gl;
    canvas.addEventListener('webglcontextlost', onLost);
    const maskImg = new Image();
    maskImg.decoding = 'async';
    maskImg.src = masks;
    const decoded = typeof maskImg.decode === 'function' ? maskImg.decode() : Promise.resolve();
    decoded.then(
      () => {
        if (disposed || state === 'lost') return;
        renderer = createGardenRenderer(context, maskImg);
        if (!renderer) return set('unsupported');
        renderer.setImage(img);
        size();
        resized = typeof ResizeObserver === 'function' ? new ResizeObserver(size) : null;
        resized?.observe(canvas);
        img.addEventListener('load', onImage);
        document.addEventListener('visibilitychange', onVisibility);
        set('paused');
        run();
      },
      () => {
        if (!disposed) set('failed');
      },
    );
  }

  return {
    setActive: (on) => {
      if (on === active) return;
      active = on;
      if (on) {
        // Each arrival starts from the still image.
        clock = 0;
        run();
      } else {
        pause();
      }
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      stop();
      resized?.disconnect();
      img.removeEventListener('load', onImage);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      if (renderer) renderer.dispose();
      else gl?.getExtension('WEBGL_lose_context')?.loseContext();
      renderer = null;
    },
  };
}
