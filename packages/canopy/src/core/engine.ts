import {
  LinearSRGBColorSpace,
  NoToneMapping,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

import type { CanopyData, CanopyShootState, CanopyVariant } from '../types';
import { type CanopyColors, canopyColors, canopyFonts, canopyMotion } from './colors';
import { type Box, dirsToward, type LabelItem, type LabelSlot, placeLabels } from './labels';
import { layoutCanopy } from './layout';
import { clamp, mixHex, rgba, smooth } from './math';
import { buildScene, type CameraView, type ShootRef, type StageState } from './scene';
import { buildIndex, family } from './tree';

/**
 * The stage: one WebGL canvas for the tree and one 2D canvas for its labels, mounted into an
 * element. It draws only the picture. Lists, cards and links belong to the page around it, which
 * hears about selection through `onChange` and drives the stage through the returned handle.
 *
 * Budget: DPR capped at 1.5 on phones (2 elsewhere), render on demand only, paused while off
 * screen or hidden, and a frame-rate watchdog that drops to DPR 1 and then to a flat 2D drawing.
 * The same flat drawing is used when WebGL is missing.
 */

export type CanopyMode = 'gl' | 'static';

export interface CanopySelection {
  active: string | null;
  hover: string | null;
  /** The shoot under the pointer or focus, else the pinned one. */
  hoverShoot: ShootRef | null;
  pinShoot: ShootRef | null;
}

export interface CanopyOptions {
  data: CanopyData;
  /** `teaser` is the picture only: no input, labels for the start projects. Default `full`. */
  variant?: CanopyVariant;
  colors?: Partial<CanopyColors>;
  /** The element whose width decides the phone layout. Default: the host. */
  container?: HTMLElement;
  /** Final state, no easing. Default: the `prefers-reduced-motion` setting. */
  reducedMotion?: boolean;
  /** `false` starts fully grown (the grow-in has already played this session). Default `true`. */
  intro?: boolean;
  /** Skip WebGL and use the flat drawing. */
  forceStatic?: boolean;
  /** `false` turns the frame-rate watchdog off. */
  watchdog?: boolean;
  /** Page elements over the stage, so the tree and its labels stay clear of them. */
  ui?: {
    /** The heading block: the tree is framed below it. */
    head?: () => Element | null;
    obstacles?: () => Element[];
    /** The open project's card, when it is showing. */
    card?: () => Element | null;
  };
  /** Words for the hint shown on a plain wheel over the stage. Left out, no hint. */
  zoomHint?: (mac: boolean) => string;
  onChange?: (selection: CanopySelection) => void;
  onMode?: (mode: CanopyMode, why: string) => void;
  /** Called once, when the grow-in first runs. */
  onIntroStart?: () => void;
}

export interface CanopyPoint {
  x: number;
  y: number;
  z: number;
  r: number;
}

export interface CanopyPerf {
  mode: CanopyMode;
  why: string;
  dpr: number;
  dprCap: number;
  size: [number, number];
  frames: number;
  rendered: number;
  log: { t: number; event: string; fps?: number }[];
  running: boolean;
  onScreen: boolean;
}

export interface CanopySnapshot extends CanopySelection {
  intro: number;
  /** How far each project's shoots have grown out, for those above zero. */
  grow: Record<string, number>;
  /** Every drawn shoot by id. `solid` 1 is grown; `knot` 1 is answered. */
  shoots: Record<string, { state: CanopyShootState; solid: number; knot: number }>;
  zoom: number;
  mode: CanopyMode;
}

export interface CanopyHandle {
  focus: (id: string) => void;
  reset: () => void;
  preview: (id: string | null) => void;
  hoverShoot: (i: number | null) => void;
  pinShoot: (i: number) => void;
  /** Re-frame after the page around the stage changed (a card opened, the layout switched). */
  relayout: () => void;
  /** Move shoots to new states. Changes animate unless motion is reduced. */
  setShootStates: (states: Record<string, CanopyShootState>) => void;
  /** Open the shoot's project and draw the shoot solid. Ends in the `grown` state. */
  grow: (shootId: string) => void;
  /** Run `seconds` of easing at once (deterministic, for tests and screenshots). */
  advance: (seconds: number) => void;
  forceStatic: () => void;
  points: () => Record<string, CanopyPoint>;
  perf: () => CanopyPerf;
  state: () => CanopySnapshot;
  /** Stop, remove every listener, free the GPU resources and remove the canvases. */
  destroy: () => void;
}

/* A small tile of film grain for the stage background (matte black, never noisy). */
let grainUrl: string | null = null;
function grain(): string {
  if (grainUrl !== null) return grainUrl;
  try {
    const n = 96;
    const c = document.createElement('canvas');
    c.width = c.height = n;
    const g = c.getContext('2d')!;
    const im = g.createImageData(n, n);
    let s = 1234567;
    for (let i = 0; i < n * n; i++) {
      s = (s * 16807) % 2147483647;
      const v = s % 255;
      im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
      im.data[i * 4 + 3] = 9;
    }
    g.putImageData(im, 0, 0);
    grainUrl = c.toDataURL('image/png');
  } catch {
    grainUrl = '';
  }
  return grainUrl;
}

const now = () => performance.now() / 1000;

export function mountCanopy(host: HTMLElement, options: CanopyOptions): CanopyHandle {
  const cfg = options;
  const data = cfg.data;
  const index = buildIndex(data);
  const idx = index.byId;
  const rootId = index.rootId;
  const ids = index.ids;
  const C: CanopyColors = { ...canopyColors, ...cfg.colors };
  const teaser = cfg.variant === 'teaser';
  const container = cfg.container ?? host;
  const introDur = canopyMotion.intro;
  const calm = cfg.reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const ac = new AbortController();
  const signal = ac.signal;
  let dead = false;

  /* ---------- canvases ---------- */
  const glc = document.createElement('canvas');
  const labc = document.createElement('canvas');
  for (const c of [glc, labc]) {
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  }
  labc.style.pointerEvents = 'none';
  const g2ctx = labc.getContext('2d');
  if (!g2ctx) throw new Error('canopy: no 2d canvas');
  const g2 = g2ctx;
  const hostStyle = host.getAttribute('style');
  host.append(glc, labc);
  host.style.touchAction = 'pan-y';
  host.style.userSelect = 'none';
  host.style.setProperty('-webkit-user-select', 'none');
  const tile = grain();
  if (tile) {
    host.style.backgroundImage = `url(${tile})`;
    host.style.backgroundRepeat = 'repeat';
  }

  const isPhone = () => container.clientWidth < (teaser ? 520 : 761);
  const fam = (id: string) => family(index, id);

  /* ---------- selection ---------- */
  let active: string | null = null;
  let hover: string | null = null;
  let hoverUg: ShootRef | null = null;
  let pinUg: ShootRef | null = null;
  let glowShoot: ShootRef | null = null;
  const lit: Record<string, number> = {};
  const litGoal: Record<string, number> = {};
  const grow: Record<string, number> = {};
  for (const id of [...ids, rootId]) {
    lit[id] = litGoal[id] = 1;
    grow[id] = 0;
  }
  const playIntro = cfg.intro !== false && !calm;
  let introT = playIntro ? 0 : introDur;
  let introLin = playIntro ? 0 : 1;
  let intro = playIntro ? 0 : 1;
  let introAnnounced = !playIntro;

  /* shoot states: solid 0..1 (grown) and knot 0..1 (answered), each easing toward its goal */
  interface ShootAnim {
    state: CanopyShootState;
    solid: number;
    knot: number;
  }
  const shootAnim: Record<string, ShootAnim[]> = {};
  const shootById: Record<string, ShootRef> = {};
  for (const id of ids) {
    shootAnim[id] = idx[id]!.shoots.map((s, i) => {
      shootById[s.id] = { id, i };
      return {
        state: s.state,
        solid: s.state === 'grown' ? 1 : 0,
        knot: s.state === 'answered' ? 1 : 0,
      };
    });
  }
  const freshShoot = (id: string): ShootRef | null => {
    const i = idx[id]!.shoots.findIndex(
      (s, k) => !!s.fresh && shootAnim[id]![k]!.state === 'grown',
    );
    return i < 0 ? null : { id, i };
  };

  const curUg = () => hoverUg ?? pinUg;
  const notify = () => cfg.onChange?.({ active, hover, hoverShoot: curUg(), pinShoot: pinUg });

  function setGoals() {
    const key = active ?? hover;
    const f = key ? fam(key) : null;
    for (const id of Object.keys(litGoal)) litGoal[id] = !f ? 1 : f[id] ? 1 : active ? 0.2 : 0.45;
    if (calm) for (const id of Object.keys(litGoal)) lit[id] = litGoal[id]!;
    wake();
  }
  function focus(id: string) {
    if (teaser) return;
    if (id === rootId || !idx[id]) {
      reset();
      return;
    }
    active = id;
    hover = null;
    hoverUg = null;
    pinUg = null;
    if (!glowShoot || glowShoot.id !== id) glowShoot = freshShoot(id);
    setGoals();
    notify();
    retarget(true);
    if (isPhone()) {
      const r = host.getBoundingClientRect();
      if (Math.abs(r.top) > 8) {
        window.scrollTo({ top: window.scrollY + r.top, behavior: calm ? 'auto' : 'smooth' });
      }
    }
  }
  function reset() {
    active = null;
    hover = null;
    hoverUg = null;
    pinUg = null;
    setGoals();
    notify();
    retarget(true);
  }
  function preview(id: string | null) {
    if (hover === id) return;
    hover = id;
    setGoals();
    notify();
  }
  function setHoverUg(h: ShootRef | null) {
    hoverUg = h;
    wake();
    notify();
  }

  /* ---------- three ---------- */
  let mode: CanopyMode = 'gl';
  let why = '';
  let renderer: WebGLRenderer | null = null;
  try {
    if (cfg.forceStatic) throw new Error('static requested');
    const probe = document.createElement('canvas');
    const gl2 = probe.getContext('webgl2');
    if (!gl2) throw new Error('no webgl2');
    gl2.getExtension('WEBGL_lose_context')?.loseContext();
    renderer = new WebGLRenderer({
      canvas: glc,
      antialias: true,
      alpha: true,
      powerPreference: isPhone() || coarse ? 'default' : 'high-performance',
    });
    if (!renderer.getContext()) throw new Error('no context');
  } catch {
    renderer = null;
    mode = 'static';
    why = cfg.forceStatic ? 'requested' : 'no-webgl';
  }
  let raf = 0;
  let onScreen = !('IntersectionObserver' in window);
  function wake() {
    if (!dead && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  }
  if (renderer) {
    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.toneMapping = NoToneMapping;
    renderer.setClearColor(0x000000, 0);
  }
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.05, 500);
  let W = 2;
  let H = 2;
  let dpr = 1;
  let dprCap = 2;
  let free: [number, number, number, number] = [0, 0, 2, 2];

  const S = buildScene({
    scene,
    camera,
    index,
    data,
    layout: layoutCanopy(index, isPhone() ? 0.8 : 1),
    colors: C,
    teaser,
    isPhone,
    lowPower: isPhone() || coarse,
    /* camera distance at which a sphere of radius r fits the free part of the stage (not under the card), margin m 0..1 */
    fit(r, m) {
      const tv = Math.tan((camera.fov * Math.PI) / 360);
      const fw = Math.max(80, free[2] - free[0]);
      const fh = Math.max(80, free[3] - free[1]);
      const a = Math.min(Math.atan((tv * fh) / H), Math.atan((tv * fw) / H));
      return r / Math.sin(a * (m ?? 0.9));
    },
  });
  const LIM = S.limits;
  const still = () => calm || mode === 'static';
  const setCursor = (c: string) => {
    host.style.cursor = teaser || mode === 'static' ? 'default' : c;
  };
  setCursor('grab');
  if (teaser) host.style.pointerEvents = 'none';

  /* ---------- camera: spherical around a target. Drag offsets (off) and zoom fold into the base on every retarget. ---------- */
  let cam: CameraView | null = null;
  let goal: CameraView = { target: [0, 0, 0], dist: 10, az: 0, el: 0 };
  const off = { az: 0, el: 0 };
  let zoom = 1;
  let zoomGoal = 1;
  let vo: [number, number] = [0, 0];
  let voGoal: [number, number] = [0, 0];
  const cardEl = () => {
    const c = cfg.ui?.card?.() as HTMLElement | null | undefined;
    return c && !c.hidden && c.offsetParent !== null ? c : null;
  };
  function computeFree() {
    const sr = host.getBoundingClientRect();
    const hdEl = cfg.ui?.head?.();
    const hd = hdEl ? hdEl.getBoundingClientRect() : { height: 0, bottom: 0 };
    const top = teaser || !hd.height ? 0 : Math.max(0, Math.min(H * 0.25, hd.bottom - sr.top + 4));
    const f: [number, number, number, number] = [0, top, W, H];
    const ce = cardEl();
    if (ce) {
      const cr = ce.getBoundingClientRect();
      if (isPhone()) {
        f[3] = Math.max(
          top + 120,
          Math.min(H, window.innerHeight - cr.height - Math.max(0, sr.top)),
        );
      } else f[2] = Math.max(W * 0.4, cr.left - sr.left - 12);
    }
    free = f;
    voGoal = [(f[0] + f[2]) / 2 - W / 2, (f[1] + f[3]) / 2 - H / 2];
  }
  function retarget(fold: boolean) {
    computeFree();
    const g = active ? S.view(active) : S.home();
    goal = { target: [...g.target], dist: g.dist, az: g.az, el: g.el };
    if (cam && fold) {
      cam.az += off.az;
      cam.el += off.el;
      cam.dist *= zoom;
      off.az = off.el = 0;
      zoom = zoomGoal = 1;
    }
    if (still() || !cam) {
      cam = { target: [...goal.target], dist: goal.dist, az: goal.az, el: goal.el };
      vo = [...voGoal];
    }
    wake();
  }
  function applyCam() {
    if (!cam) return;
    const D = Math.PI / 180;
    const az = (cam.az + off.az) * D;
    const el = clamp(cam.el + off.el, LIM.elMin, LIM.elMax) * D;
    const t = cam.target;
    const d = cam.dist * zoom;
    camera.position.set(
      t[0] + d * Math.cos(el) * Math.sin(az),
      t[1] + d * Math.sin(el),
      t[2] + d * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(t[0], t[1], t[2]);
    if (Math.abs(vo[0]) + Math.abs(vo[1]) > 0.5) camera.setViewOffset(W, H, -vo[0], -vo[1], W, H);
    else camera.clearViewOffset();
    camera.updateMatrixWorld();
  }
  function ease(dt: number) {
    if (!cam) return false;
    const k = still() ? 1 : 1 - Math.exp(-dt * 2.0);
    let m = false;
    for (const key of ['dist', 'el'] as const) {
      const d = goal[key] - cam[key];
      cam[key] += d * k;
      if (Math.abs(d) > 0.004 * (key === 'dist' ? goal.dist : 10)) m = true;
    }
    const da = ((goal.az - cam.az + 540) % 360) - 180;
    cam.az += da * k;
    if (Math.abs(da) > 0.05) m = true;
    for (let i = 0; i < 3; i++) {
      const d = goal.target[i]! - cam.target[i]!;
      cam.target[i]! += d * k;
      if (Math.abs(d) > 0.002) m = true;
    }
    for (let i = 0; i < 2; i++) {
      const dv = voGoal[i]! - vo[i]!;
      vo[i]! += dv * k;
      if (Math.abs(dv) > 0.5) m = true;
    }
    const kz = still() ? 1 : 1 - Math.exp(-dt * 9);
    const dz = zoomGoal - zoom;
    zoom += dz * kz;
    if (Math.abs(dz) > 0.002) m = true;
    return m;
  }

  let memo: Record<string, LabelSlot> = {};
  function resize() {
    const r = host.getBoundingClientRect();
    W = Math.max(2, Math.round(r.width));
    H = Math.max(2, Math.round(r.height));
    dprCap = Math.min(dprCap, isPhone() || coarse ? 1.5 : 2);
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    if (renderer) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H, false);
    }
    labc.width = Math.round(W * dpr);
    labc.height = Math.round(H * dpr);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    memo = {};
    retarget(false);
  }

  /* ---------- projection + picking ---------- */
  const v = new Vector3();
  const v2 = new Vector3();
  function project(p: Vector3): [number, number, number] {
    v.copy(p).project(camera);
    return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H, v.z];
  }
  function screenR(p: Vector3, r: number) {
    v2.copy(p).applyMatrix4(camera.matrixWorldInverse);
    const d = -v2.z;
    return d <= 0 ? 0 : ((r / d) * (H / 2)) / Math.tan((camera.fov * Math.PI) / 360);
  }
  let pts: Record<string, CanopyPoint> = {};
  let ugPts: Record<string, CanopyPoint[]> = {};
  let labelHit: Record<string, [number, number, number, number]> = {};
  function computePoints() {
    pts = {};
    ugPts = {};
    for (const id of ids) {
      const p = S.nodes[id]!;
      const s = project(p);
      pts[id] = { x: s[0], y: s[1], z: s[2], r: Math.max(4, screenR(p, S.pickRadius(id))) };
    }
    for (const id of ids) {
      if (grow[id]! < 0.02 || !idx[id]!.shoots.length) continue;
      ugPts[id] = idx[id]!.shoots.map((_, i) => {
        const p = S.shootPoint(id, i, shootAnim[id]![i]!.knot);
        const s = project(p);
        return { x: s[0], y: s[1], z: s[2], r: Math.max(5, screenR(p, 0.06)) };
      });
    }
  }
  type Hit = { id: string; shoot?: undefined } | { shoot: ShootRef; id?: undefined };
  const shootKey = (s: ShootRef) => `shoot:${s.id}:${s.i}`;
  const parseShootKey = (k: string): ShootRef => {
    const p = k.split(':');
    return { id: p[1]!, i: Number(p[2]) };
  };
  function pick(x: number, y: number): Hit | null {
    let best: Hit | null = null;
    let bd = 1e9;
    for (const id of Object.keys(ugPts)) {
      if (grow[id]! < 0.5) continue;
      ugPts[id]!.forEach((p, i) => {
        if (shootAnim[id]![i]!.knot > 0.5) return;
        const d = Math.hypot(p.x - x, p.y - y);
        if (p.z < 1 && d < 18 && d < bd) {
          bd = d;
          best = { shoot: { id, i } };
        }
      });
    }
    for (const k of Object.keys(labelHit)) {
      const r = labelHit[k]!;
      if (x >= r[0] - 3 && x <= r[2] + 3 && y >= r[1] - 3 && y <= r[3] + 3) {
        return k.startsWith('shoot:') ? { shoot: parseShootKey(k) } : { id: k };
      }
    }
    if (best) return best;
    for (const id of Object.keys(pts)) {
      const p = pts[id]!;
      if (p.z > 1) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      const lim = Math.max(isPhone() ? 24 : 18, p.r + 8);
      if (d < lim && d - p.r < bd) {
        bd = d - p.r;
        best = { id };
      }
    }
    return best;
  }

  /* ---------- static drawing (no WebGL, or the frame rate could not hold) ---------- */
  function paintStatic(st: StageState) {
    const sk = S.skeleton(st);
    g2.lineCap = 'round';
    g2.lineJoin = 'round';
    for (const s of sk.strokes) {
      if (s.alpha <= 0.01) continue;
      if (s.wall) {
        const A = s.wall[0].map(project);
        const B = s.wall[1].map(project);
        g2.fillStyle = rgba(s.fill!, s.alpha);
        for (let w = 1; w < A.length; w++) {
          g2.beginPath();
          g2.moveTo(A[w - 1]![0], A[w - 1]![1]);
          g2.lineTo(A[w]![0], A[w]![1]);
          g2.lineTo(B[w]![0], B[w]![1]);
          g2.lineTo(B[w - 1]![0], B[w - 1]![1]);
          g2.closePath();
          g2.fill();
        }
        continue;
      }
      const pp = s.pts!;
      if (s.fill) {
        g2.fillStyle = rgba(s.fill, s.alpha);
        g2.beginPath();
        pp.forEach((p, i) => {
          const q = project(p);
          if (i) g2.lineTo(q[0], q[1]);
          else g2.moveTo(q[0], q[1]);
        });
        g2.closePath();
        g2.fill();
        continue;
      }
      const P = pp.map((p) => {
        const q = project(p);
        return [q[0], q[1], screenR(p, 1)] as const;
      });
      g2.strokeStyle =
        s.r0 == null ? rgba(s.color!, s.alpha) : mixHex(s.color!, C.ground, s.alpha * 0.8);
      g2.setLineDash(s.dash ? [4, 4] : []);
      if (s.r0 == null || s.r1 == null) {
        g2.lineWidth = s.px ?? 1;
        g2.beginPath();
        P.forEach((q, i) => {
          if (i) g2.lineTo(q[0], q[1]);
          else g2.moveTo(q[0], q[1]);
        });
        g2.stroke();
        continue;
      }
      for (let i = 1; i < P.length; i++) {
        const t = i / (P.length - 1);
        const r = s.r0 + (s.r1 - s.r0) * Math.pow(t, 0.8);
        g2.lineWidth = Math.max(1, 2 * r * P[i]![2]);
        g2.beginPath();
        g2.moveTo(P[i - 1]![0], P[i - 1]![1]);
        g2.lineTo(P[i]![0], P[i]![1]);
        g2.stroke();
      }
    }
    g2.setLineDash([]);
    for (const m of sk.marks) {
      if (m.alpha <= 0.01) continue;
      const q = project(m.p);
      const R = Math.max(4, screenR(m.p, m.size / 2));
      const a = m.alpha;
      g2.lineWidth = 1.2;
      if (m.kind === 'shoot') {
        g2.setLineDash([3, 3]);
        g2.strokeStyle = rgba(C.smoke, 0.8 * a);
        g2.beginPath();
        g2.arc(q[0], q[1], R * 0.8, 0, 7);
        g2.stroke();
        g2.setLineDash([]);
        continue;
      }
      const lead = m.kind === 'lead';
      g2.fillStyle = rgba(C.ground, 0.9 * a);
      g2.beginPath();
      g2.arc(q[0], q[1], R * 0.95, 0, 7);
      g2.fill();
      if (lead) {
        g2.strokeStyle = rgba(C.cedar, 0.65 * a);
        g2.beginPath();
        g2.arc(q[0], q[1], R * 0.88, 0, 7);
        g2.stroke();
      }
      g2.strokeStyle = rgba(C.hinoki, (lead ? 0.6 : 0.75) * a);
      g2.beginPath();
      g2.arc(q[0], q[1], R * (lead ? 0.54 : 0.72), 0, 7);
      g2.stroke();
      if (m.arc) {
        g2.lineWidth = 2.2;
        g2.strokeStyle = rgba(C.signal, a);
        g2.beginPath();
        g2.arc(q[0], q[1], R * 0.88, -Math.PI / 2, -Math.PI / 2 + m.arc * Math.PI * 2);
        g2.stroke();
      }
      g2.fillStyle = rgba(C.bone, a);
      g2.beginPath();
      g2.arc(q[0], q[1], Math.max(1.6, R * 0.13), 0, 7);
      g2.fill();
    }
  }
  const perfLog: CanopyPerf['log'] = [];
  function freeRenderer() {
    if (!renderer) return;
    try {
      renderer.dispose();
      renderer.forceContextLoss();
    } catch {
      /* the context is already gone */
    }
    renderer = null;
  }
  function goStatic(reason: string) {
    if (mode === 'static') return;
    mode = 'static';
    why = reason;
    perfLog.push({ t: +now().toFixed(2), event: `static:${reason}` });
    introLin = intro = 1;
    introT = introDur;
    for (const id of Object.keys(lit)) {
      lit[id] = litGoal[id]!;
      grow[id] = id === active ? 1 : 0;
    }
    freeRenderer();
    glc.hidden = true;
    glc.style.display = 'none';
    setCursor('default');
    cam = null;
    retarget(false);
    cfg.onMode?.(mode, why);
  }

  /* ---------- labels ---------- */
  const F = {
    node: { font: `500 13px ${canopyFonts.sans}`, stretch: 'semi-expanded', h: 22, pad: 7 },
    start: { font: `620 15px ${canopyFonts.sans}`, stretch: 'expanded', h: 27, pad: 9 },
    shoot: { font: `450 12.5px ${canopyFonts.sans}`, stretch: 'normal', h: 21, pad: 7 },
  } as const;
  type LabelFont = (typeof F)[keyof typeof F];
  function setFont(f: LabelFont) {
    g2.font = f.font;
    if ('fontStretch' in g2) g2.fontStretch = f.stretch as CanvasFontStretch;
  }
  function rr(x: number, y: number, w: number, h: number, r: number) {
    g2.beginPath();
    g2.moveTo(x + r, y);
    g2.arcTo(x + w, y, x + w, y + h, r);
    g2.arcTo(x + w, y + h, x, y + h, r);
    g2.arcTo(x, y + h, x, y, r);
    g2.arcTo(x, y, x + w, y, r);
    g2.closePath();
  }
  function domObstacles(): Box[] {
    const sr = host.getBoundingClientRect();
    const out: Box[] = [];
    for (const el of cfg.ui?.obstacles?.() ?? []) {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) {
        out.push([
          r.left - sr.left - 6,
          r.top - sr.top - 4,
          r.right - sr.left + 6,
          r.bottom - sr.top + 4,
        ]);
      }
    }
    const ce = cardEl();
    if (ce) {
      const r = ce.getBoundingClientRect();
      out.push([
        r.left - sr.left - 10,
        r.top - sr.top - 10,
        r.right - sr.left + 10,
        r.bottom - sr.top + 10,
      ]);
    }
    return out;
  }
  const SIDE_DIR = { left: [-1, 0], right: [1, 0] } as const;
  function showLabel(id: string, st: StageState) {
    if (teaser) return idx[id]!.start >= 0;
    if (!st.phone) return true;
    const key = active ?? hover;
    if (idx[id]!.start >= 0 || id === key) return true;
    return !!active && !!fam(active)[id];
  }
  function ring(x: number, y: number, r: number, left: number) {
    g2.lineWidth = 1;
    g2.strokeStyle = rgba(C.tick, 0.9);
    g2.beginPath();
    g2.arc(x, y, r, 0, Math.PI * 2);
    g2.stroke();
    g2.strokeStyle = C.hinoki;
    g2.lineWidth = 1.3;
    g2.lineCap = 'round';
    g2.beginPath();
    g2.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(left, 0, 1));
    g2.stroke();
    g2.lineCap = 'butt';
  }
  interface DrawItem extends LabelItem {
    kind: 'node' | 'shoot';
    f: LabelFont;
    owner?: string;
    i?: number;
  }
  function drawLabels(st: StageState) {
    labelHit = {};
    const obs = domObstacles();
    const key = active ?? hover;
    const f = key ? fam(key) : null;
    const items: DrawItem[] = [];
    const u = curUg();
    for (const id of Object.keys(pts)) {
      const p = pts[id]!;
      const q: Box = [p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r];
      q.own = id;
      obs.push(q);
    }
    const base = project(S.nodes[rootId]!);
    /* node labels, priority: key, start projects, family, weight */
    const score = (id: string) =>
      (id === key ? 1000 : 0) +
      (f && f[id] ? 300 : 0) +
      (idx[id]!.start >= 0 ? 200 - idx[id]!.start : 0) +
      idx[id]!.weight * 10 -
      idx[id]!.depth;
    const order = Object.keys(pts)
      .filter((id) => showLabel(id, st) && S.labelIn(id, st) > 0.01)
      .sort((a, b) => score(b) - score(a));
    function pushShoots(id: string) {
      const list = ugPts[id];
      if (!list || grow[id]! < 0.05) return;
      if (st.phone && id !== active) return;
      const pp = pts[id]!;
      setFont(F.shoot);
      list.forEach((q, i) => {
        const t = idx[id]!.shoots[i];
        if (!t || q.z > 1) return;
        const k = shootKey({ id, i });
        if (S.labelIn(k, st) <= 0.01) return;
        const oq: Box = [q.x - 5, q.y - 5, q.x + 5, q.y + 5];
        oq.own = k;
        obs.push(oq);
        items.push({
          id: k,
          kind: 'shoot',
          owner: id,
          i,
          f: F.shoot,
          x: q.x,
          y: q.y,
          r: 5,
          w: g2.measureText(t.label).width + F.shoot.pad * 2,
          h: F.shoot.h,
          prev: memo[k],
          dirs: dirsToward(q.x - pp.x, q.y - pp.y),
          gaps: [8, 20, 36, 56],
        });
      });
    }
    for (const id of order) {
      const p = pts[id]!;
      if (p.z > 1 || p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30) continue;
      const font = idx[id]!.start >= 0 ? F.start : F.node;
      setFont(font);
      const parent = idx[id]!.parent;
      const par = parent && pts[parent] ? pts[parent] : { x: base[0], y: base[1] };
      const side = S.labelSide(id);
      const toward = side ? SIDE_DIR[side] : ([p.x - par.x, p.y - par.y] as const);
      items.push({
        id,
        kind: 'node',
        f: font,
        x: p.x,
        y: p.y,
        r: p.r,
        w: g2.measureText(idx[id]!.label).width + font.pad * 2,
        h: font.h,
        prev: memo[id],
        dirs: dirsToward(toward[0], toward[1]),
        gaps: [4, 14, 28],
      });
      if (id === key || (active && id === active)) pushShoots(id);
    }
    for (const id of Object.keys(ugPts)) {
      if (id !== key && id !== active && grow[id]! > 0.05 && !st.phone) pushShoots(id);
    }
    const res = placeLabels(items, obs, [6, 6, W - 6, H - 6]);
    for (const it of items) {
      const L = res[it.id];
      if (!L) {
        delete memo[it.id];
        continue;
      }
      memo[it.id] = L.slot;
      labelHit[it.id] = L.rect;
      const r = L.rect;
      const dx = L.ax - it.x;
      const dy = L.ay - it.y;
      const m = Math.hypot(dx, dy) || 1;
      if (it.kind === 'shoot') {
        const owner = it.owner!;
        const i = it.i!;
        const hot = !!u && u.id === owner && u.i === i;
        const grown = shootAnim[owner]![i]!.solid >= 1;
        const tone = hot ? C.bone : C.smoke;
        g2.globalAlpha = S.labelIn(it.id, st);
        if (!grown) g2.setLineDash([3, 3]);
        g2.strokeStyle = rgba(tone, 0.7);
        g2.lineWidth = 1;
        g2.beginPath();
        g2.moveTo(it.x + (dx / m) * 6, it.y + (dy / m) * 6);
        g2.lineTo(L.ax, L.ay);
        g2.stroke();
        rr(r[0], r[1], r[2] - r[0], r[3] - r[1], 4);
        g2.fillStyle = rgba(C.ground, 0.86);
        g2.fill();
        g2.strokeStyle = rgba(tone, hot ? 0.9 : 0.5);
        g2.stroke();
        g2.setLineDash([]);
        setFont(it.f);
        g2.fillStyle = hot || grown ? C.bone : C.shootLabel;
        g2.textBaseline = 'middle';
        const shoot = idx[owner]!.shoots[i]!;
        g2.fillText(shoot.label, r[0] + it.f.pad, (r[1] + r[3]) / 2 + 0.5);
        /* a freshly grown shoot carries the new ring at its tip */
        if (grown && shoot.fresh) ring(it.x, it.y, it.r + 5, shoot.fresh.left);
        continue;
      }
      const n = idx[it.id]!;
      const isKey = it.id === key;
      const isStart = n.start >= 0;
      g2.globalAlpha = S.labelIn(it.id, st) * (0.22 + 0.78 * lit[it.id]!);
      if (m > it.r + 6) {
        g2.strokeStyle = rgba(C.smoke, 0.5);
        g2.lineWidth = 1;
        g2.beginPath();
        g2.moveTo(it.x + (dx / m) * (it.r + 2), it.y + (dy / m) * (it.r + 2));
        g2.lineTo(L.ax, L.ay);
        g2.stroke();
      }
      rr(r[0], r[1], r[2] - r[0], r[3] - r[1], isStart ? 5 : 4);
      g2.fillStyle = rgba(C.ground, 0.8);
      g2.fill();
      if (isStart || isKey) {
        g2.strokeStyle = isKey ? rgba(C.bone, 0.85) : rgba(C.hinoki, 0.4);
        g2.lineWidth = 1;
        g2.stroke();
      }
      setFont(it.f);
      g2.fillStyle = isStart || isKey ? C.bone : C.ash;
      g2.textBaseline = 'middle';
      g2.fillText(n.label, r[0] + it.f.pad, (r[1] + r[3]) / 2 + 0.5);
      /* new marker: a thin Hinoki ring around the node that drains with age */
      if (n.fresh && n.fresh.left > 0) ring(it.x, it.y, it.r + 5, n.fresh.left);
    }
    g2.globalAlpha = 1;
  }

  /* ---------- pointer: drag to orbit, wheel / pinch to zoom, tap to pick ---------- */
  let hintT = 0;
  let hintEl: HTMLParagraphElement | null = null;
  if (!teaser) {
    interface Drag {
      x: number;
      y: number;
      az: number;
      el: number;
      id: number;
      touch: boolean;
    }
    let drag: Drag | null = null;
    let moved = false;
    const touches: Record<number, [number, number]> = {};
    let pinch: { d: number; z: number } | null = null;
    let hoverCanvas: string | null = null;
    let gest: { z: number } | null = null;
    const local = (e: { clientX: number; clientY: number }): [number, number] => {
      const r = host.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const tcount = () => Object.keys(touches).length;
    const spread = () => {
      const [a, b] = Object.values(touches) as [[number, number], [number, number]];
      return Math.hypot(a[0] - b[0], a[1] - b[1]);
    };
    const overCard = (e: Event) => {
      const c = cfg.ui?.card?.();
      return !!c && e.target instanceof Node && c.contains(e.target);
    };
    host.addEventListener(
      'pointerdown',
      (e) => {
        const p = local(e);
        if (e.pointerType === 'touch') {
          touches[e.pointerId] = p;
          if (tcount() === 2 && mode === 'gl') {
            pinch = { d: spread(), z: zoomGoal };
            drag = null;
            return;
          }
        }
        drag = {
          x: p[0],
          y: p[1],
          az: off.az,
          el: off.el,
          id: e.pointerId,
          touch: e.pointerType === 'touch',
        };
        moved = false;
      },
      { signal },
    );
    window.addEventListener(
      'pointermove',
      (e) => {
        const p = local(e);
        if (touches[e.pointerId]) touches[e.pointerId] = p;
        if (pinch && tcount() === 2) {
          zoomGoal = clamp((pinch.z * pinch.d) / Math.max(20, spread()), LIM.zoomMin, LIM.zoomMax);
          zoom = zoomGoal;
          wake();
          return;
        }
        if (drag && drag.id === e.pointerId) {
          const dx = p[0] - drag.x;
          const dy = p[1] - drag.y;
          if (!moved && Math.hypot(dx, dy) > 6) {
            /* vertical swipe: let the page scroll */
            if (mode === 'static' || (drag.touch && Math.abs(dy) > Math.abs(dx))) {
              drag = null;
              return;
            }
            moved = true;
            setCursor('grabbing');
            try {
              host.setPointerCapture(e.pointerId);
            } catch {
              /* the pointer is already gone */
            }
          }
          if (moved && cam) {
            off.az = drag.az - dx * 0.3;
            if (LIM.az < 180) {
              off.az = clamp(off.az, -LIM.az + goal.az - cam.az, LIM.az + goal.az - cam.az);
            }
            off.el = clamp(drag.el + dy * 0.2, LIM.elMin - cam.el, LIM.elMax - cam.el);
            wake();
          }
          return;
        }
        if (e.pointerType === 'touch') return;
        if (p[0] < 0 || p[1] < 0 || p[0] > W || p[1] > H || overCard(e)) {
          if (hoverCanvas) {
            hoverCanvas = null;
            setCursor('grab');
            preview(null);
            setHoverUg(null);
          }
          return;
        }
        const h = pick(p[0], p[1]);
        const hk = h ? (h.shoot ? shootKey(h.shoot) : h.id) : null;
        if (hk !== hoverCanvas) {
          hoverCanvas = hk;
          setCursor(h ? 'pointer' : 'grab');
          if (h?.shoot) {
            setHoverUg(h.shoot);
            preview(null);
          } else {
            setHoverUg(null);
            preview(h ? h.id! : null);
          }
        }
      },
      { signal },
    );
    const endPointer = (e: PointerEvent) => {
      if (touches[e.pointerId]) {
        delete touches[e.pointerId];
        if (pinch) {
          if (tcount() < 2) pinch = null;
          drag = null;
          moved = false;
          return;
        }
      }
      if (!drag || drag.id !== e.pointerId) return;
      const wasMoved = moved;
      setCursor(hoverCanvas ? 'pointer' : 'grab');
      drag = null;
      moved = false;
      if (wasMoved || e.type === 'pointercancel') return;
      const p = local(e);
      const h = pick(p[0], p[1]);
      if (h?.shoot) {
        if (active !== h.shoot.id) focus(h.shoot.id);
        pinUg = { id: h.shoot.id, i: h.shoot.i };
        wake();
        notify();
      } else if (h) focus(h.id!);
      else if (active) reset();
    };
    window.addEventListener('pointerup', endPointer, { signal });
    window.addEventListener('pointercancel', endPointer, { signal });
    /* Plain wheel / two-finger trackpad scroll belongs to the page: it scrolls past the map. Zoom needs ctrl or cmd, which is also what a
       trackpad pinch sends (ctrlKey wheel in Chrome, Firefox, Edge). The first plain wheel shows a small hint. */
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    let hintShown = false;
    const showHint = (e: WheelEvent) => {
      if (isPhone() || !cfg.zoomHint) return;
      if (!hintShown) {
        hintShown = true;
        const el = document.createElement('p');
        hintEl = el;
        el.setAttribute('aria-hidden', 'true');
        el.textContent = cfg.zoomHint(mac);
        el.style.cssText =
          `position:absolute;z-index:3;margin:0;padding:6px 12px;transform:translateX(-50%);border:1px solid ${C.hairline};border-radius:6px;` +
          `background:${rgba(C.ground, 0.86)};font:400 12.5px ${canopyFonts.readout};letter-spacing:0.02em;color:${C.ash};white-space:nowrap;pointer-events:none;opacity:0;` +
          (calm ? '' : 'transition:opacity 0.25s ease');
        host.appendChild(el);
        requestAnimationFrame(() => {
          el.style.opacity = '1';
        });
        hintT = window.setTimeout(() => {
          el.style.opacity = '0';
          hintT = 0;
        }, 1800);
      }
      /* sits just under the pointer, following it while the page scrolls under it, so it stays in view */
      if (hintT && hintEl) {
        const p = local(e);
        hintEl.style.left = `${clamp(p[0], 110, Math.max(110, W - 110))}px`;
        hintEl.style.top = `${clamp(p[1] + 22, 8, Math.max(8, H - 40))}px`;
      }
    };
    const zoomBy = (f: number) => {
      zoomGoal = clamp(zoomGoal * f, LIM.zoomMin, LIM.zoomMax);
      wake();
    };
    host.addEventListener(
      'wheel',
      (e) => {
        if (mode === 'static' || overCard(e)) return;
        if (!(e.ctrlKey || e.metaKey)) {
          showHint(e);
          return;
        }
        e.preventDefault(); /* also stops the browser's own ctrl+wheel page zoom over the map */
        if (gest) return;
        const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        if (hintT && hintEl) {
          clearTimeout(hintT);
          hintT = 0;
          hintEl.style.opacity = '0';
        }
        /* small deltas (trackpad pinch) get more gain than mouse notches (~100), continuous in between */
        const a = Math.abs(dy);
        zoomBy(Math.exp(Math.sign(dy) * Math.min(a * 0.008, 0.05 + a * 0.0012, 0.25)));
      },
      { passive: false, signal },
    );
    /* Safari (Mac trackpad pinch, iOS two-finger pinch) sends gesture events instead; iOS also sends pointers, which the pinch above handles */
    host.addEventListener(
      'gesturestart',
      (e) => {
        e.preventDefault();
        gest = { z: zoomGoal };
      },
      { signal },
    );
    host.addEventListener(
      'gesturechange',
      (e) => {
        e.preventDefault();
        const s = (e as Event & { scale?: number }).scale;
        if (!gest || pinch || tcount() || mode === 'static' || !s) return;
        zoomGoal = clamp(gest.z / s, LIM.zoomMin, LIM.zoomMax);
        wake();
      },
      { signal },
    );
    host.addEventListener('gestureend', () => (gest = null), { signal });
    /* touch: one finger keeps touch-action pan-y (vertical swipe scrolls the page, sideways drag turns the tree); two fingers pinch the map, not the page */
    host.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length > 1 && mode === 'gl' && e.cancelable) e.preventDefault();
      },
      { passive: false, signal },
    );
  }

  /* ---------- loop: render on demand, only while something moves and the map is on screen ---------- */
  let last = 0;
  let perfWin: number[] = [];
  let frames = 0;
  let rendered = 0;
  function state(): StageState {
    return {
      active,
      hover,
      hoverShoot: curUg(),
      glowShoot,
      introLin,
      calm: still(),
      phone: isPhone(),
      lit: (id) => lit[id] ?? 1,
      grow: (id) => grow[id] ?? 0,
      solid: (id, i) => shootAnim[id]?.[i]?.solid ?? 0,
      knot: (id, i) => shootAnim[id]?.[i]?.knot ?? 0,
    };
  }
  const toward = (x: number, goalValue: number, rate: number) =>
    goalValue > x ? Math.min(goalValue, x + rate) : Math.max(goalValue, x - rate);
  function step(dt: number) {
    let m = ease(dt);
    if (!still()) {
      if (!introAnnounced) {
        introAnnounced = true;
        cfg.onIntroStart?.();
      }
      introT += dt;
      introLin = clamp(introT / introDur, 0, 1);
      intro = smooth(introLin);
      if (introLin < 1) m = true;
    }
    const k = still() ? 1 : 1 - Math.exp(-dt * 5);
    const gUp = dt / canopyMotion.grow;
    const gDn = dt / canopyMotion.shrink;
    for (const id of Object.keys(litGoal)) {
      const d = litGoal[id]! - lit[id]!;
      lit[id]! += d * k;
      if (Math.abs(d) > 0.003) m = true;
      const gg = id === active ? 1 : 0;
      grow[id] = still() ? gg : toward(grow[id]!, gg, gg > grow[id]! ? gUp : gDn);
      if (grow[id] !== gg) m = true;
      for (const a of shootAnim[id] ?? []) {
        const sg = a.state === 'grown' ? 1 : 0;
        const kg = a.state === 'answered' ? 1 : 0;
        a.solid = still() ? sg : toward(a.solid, sg, gUp);
        a.knot = still() ? kg : toward(a.knot, kg, gDn);
        if (a.solid !== sg || a.knot !== kg) m = true;
      }
    }
    if (S.update(state(), still() ? 0 : dt)) m = true;
    return m;
  }
  function render() {
    const st = state();
    applyCam();
    if (renderer) renderer.render(scene, camera);
    rendered++;
    computePoints();
    g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    g2.clearRect(0, 0, W, H);
    if (mode === 'static') paintStatic(st);
    drawLabels(st);
  }
  function watchdog(ms: number) {
    if (mode !== 'gl' || cfg.watchdog === false) return;
    if (last) {
      perfWin.push(ms - last);
      if (perfWin.length > 40) perfWin.shift();
    }
    frames++;
    if (frames < 12 || perfWin.length < 40) return;
    const avg = perfWin.reduce((a, b) => a + b, 0) / perfWin.length;
    const fps = 1000 / avg;
    if (fps < 24 && dpr > 1) {
      dprCap = 1;
      perfLog.push({ t: +now().toFixed(2), event: 'dpr->1', fps: +fps.toFixed(1) });
      perfWin = [];
      resize();
      return;
    }
    if (fps < 18) goStatic('slow');
  }
  function frame(ms: number) {
    raf = 0;
    if (dead) return;
    watchdog(ms);
    const dt = last ? Math.min(0.05, (ms - last) / 1000) : 1 / 60;
    last = ms;
    const moving = step(dt);
    render();
    if (moving && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    else {
      last = 0;
      perfWin = [];
    }
  }
  document.addEventListener('visibilitychange', () => !document.hidden && wake(), { signal });
  glc.addEventListener(
    'webglcontextlost',
    (e) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      goStatic('context-lost');
    },
    { signal },
  );
  let io: IntersectionObserver | null = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      (es) => {
        const on = es[es.length - 1]!.isIntersecting;
        if (on === onScreen) return;
        onScreen = on;
        if (on) wake();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
          last = 0;
        }
      },
      { threshold: 0.01 },
    );
    io.observe(host);
  }
  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
  window.addEventListener(
    'resize',
    () => {
      computeFree();
      wake();
    },
    { signal },
  );
  if (mode === 'static') {
    glc.hidden = true;
    glc.style.display = 'none';
  }

  const fontsReady: Promise<unknown> = document.fonts?.load
    ? Promise.race([
        Promise.all([document.fonts.load(F.node.font), document.fonts.load(F.start.font)]),
        new Promise((r) => setTimeout(r, 2500)),
      ])
    : Promise.resolve();
  resize();
  void fontsReady.then(() => {
    memo = {};
    wake();
  });
  cfg.onMode?.(mode, why);

  return {
    focus,
    reset,
    preview: (id) => {
      if (!isPhone() || id === null) preview(id);
    },
    hoverShoot: (i) => setHoverUg(i == null || !active ? null : { id: active, i }),
    pinShoot(i) {
      if (!active) return;
      pinUg = pinUg && pinUg.i === i ? null : { id: active, i };
      wake();
      notify();
    },
    relayout() {
      computeFree();
      retarget(false);
    },
    setShootStates(states) {
      for (const sid of Object.keys(states)) {
        const ref = shootById[sid];
        const next = states[sid]!;
        if (!ref || next === 'dropped') continue;
        const a = shootAnim[ref.id]![ref.i]!;
        if (a.state === next) continue;
        a.state = next;
        if (next === 'grown') glowShoot = ref;
        else if (glowShoot && glowShoot.id === ref.id && glowShoot.i === ref.i) glowShoot = null;
      }
      wake();
    },
    grow(shootId) {
      const ref = shootById[shootId];
      if (!ref) return;
      shootAnim[ref.id]![ref.i]!.state = 'grown';
      glowShoot = ref;
      if (active !== ref.id) focus(ref.id);
      wake();
    },
    advance(s) {
      for (let i = 0; i < Math.round(s * 60); i++) step(1 / 60);
      render();
    },
    forceStatic: () => {
      goStatic('requested');
      wake();
    },
    points() {
      const o: Record<string, CanopyPoint> = { ...pts };
      for (const id of Object.keys(ugPts))
        ugPts[id]!.forEach((p, i) => (o[shootKey({ id, i })] = p));
      return o;
    },
    perf: () => ({
      mode,
      why,
      dpr,
      dprCap,
      size: [W, H],
      frames,
      rendered,
      log: perfLog.slice(),
      running: !!raf,
      onScreen,
    }),
    state() {
      const g: Record<string, number> = {};
      const shoots: CanopySnapshot['shoots'] = {};
      for (const id of ids) {
        if (grow[id]! > 0.001) g[id] = +grow[id]!.toFixed(3);
        idx[id]!.shoots.forEach((s, i) => (shoots[s.id] = { ...shootAnim[id]![i]! }));
      }
      return {
        active,
        hover,
        hoverShoot: curUg(),
        pinShoot: pinUg,
        intro,
        grow: g,
        shoots,
        zoom,
        mode,
      };
    },
    destroy() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(hintT);
      ac.abort();
      io?.disconnect();
      ro.disconnect();
      S.dispose();
      freeRenderer();
      glc.remove();
      labc.remove();
      hintEl?.remove();
      if (hostStyle === null) host.removeAttribute('style');
      else host.setAttribute('style', hostStyle);
    },
  };
}
