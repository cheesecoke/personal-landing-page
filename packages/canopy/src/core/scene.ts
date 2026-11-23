import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  CubicBezierCurve3,
  type Curve,
  Float32BufferAttribute,
  Line,
  type Material,
  Mesh,
  type PerspectiveCamera,
  PlaneGeometry,
  QuadraticBezierCurve3,
  type Scene,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  type Texture,
  Vector3,
} from 'three';

import type { CanopyData } from '../types';
import type { CanopyColors } from './colors';
import {
  bounds,
  branchCurve,
  branchRadius,
  type CanopyLayout,
  flowCurve,
  homePoints,
  markSize,
  SIDES,
  STUMP_SCALE,
} from './layout';
import { type Cubic, hex, type Quadratic, seg, soft, type V3 } from './math';
import { outlineR, ring, STUMP, TAU } from './stump';
import type { CanopyIndex } from './tree';

/**
 * The tree of light: stump, trunk, two boughs, a branch per project and sub-branches for what sits
 * inside it. Each project is marked with the ring mark (centre dot, warm ring, outer ring with a
 * teal growth arc), flat and turned to face the viewer. On load the tree grows out of the stump;
 * when a project is opened its shoots grow out of its mark.
 */

export interface ShootRef {
  id: string;
  i: number;
}

/** What the stage tells the scene each frame. */
export interface StageState {
  active: string | null;
  hover: string | null;
  hoverShoot: ShootRef | null;
  /** The shoot whose tip holds the glow, if any. */
  glowShoot: ShootRef | null;
  /** Linear intro clock 0..1. */
  introLin: number;
  /** No easing: reduced motion or the flat drawing. */
  calm: boolean;
  phone: boolean;
  /** How lit a node is, 0..1: the open project's family stays lit, the rest dims. */
  lit: (id: string) => number;
  /** How far a project's shoots have grown out, 0..1. */
  grow: (id: string) => number;
  /** How solid a shoot is, 0 (dashed) .. 1 (grown). */
  solid: (id: string, i: number) => number;
  /** How far a shoot has pulled back to a knot, 0..1. */
  knot: (id: string, i: number) => number;
}

export interface CameraView {
  target: V3;
  dist: number;
  az: number;
  el: number;
}

export interface SkeletonStroke {
  pts?: Vector3[];
  /** A filled band between two rings (the stump's side). */
  wall?: [Vector3[], Vector3[]];
  fill?: string;
  color?: string;
  alpha: number;
  /** World radius at each end, for a tapered stroke. */
  r0?: number;
  r1?: number;
  px?: number;
  dash?: boolean;
}

export interface SkeletonMark {
  p: Vector3;
  size: number;
  kind: 'lead' | 'node' | 'shoot';
  alpha: number;
  arc?: number;
}

export interface SceneContext {
  scene: Scene;
  camera: PerspectiveCamera;
  index: CanopyIndex;
  data: CanopyData;
  layout: CanopyLayout;
  colors: CanopyColors;
  teaser: boolean;
  isPhone: () => boolean;
  /** Phones and touch devices get lighter geometry. */
  lowPower: boolean;
  /** Camera distance at which a sphere of radius `r` fits the free part of the stage. */
  fit: (r: number, margin?: number) => number;
}

export interface CanopyScene {
  /** World position of every mark, plus the root at the trunk's base. */
  nodes: Record<string, Vector3>;
  pickRadius: (id: string) => number;
  limits: { az: number; elMin: number; elMax: number; zoomMin: number; zoomMax: number };
  home: () => CameraView;
  view: (id: string) => CameraView;
  shootTips: (id: string) => Vector3[];
  /** Where a shoot's tip mark sits now (it travels back along the shoot as it becomes a knot). */
  shootPoint: (id: string, i: number, knot: number) => Vector3;
  labelIn: (key: string, st: StageState) => number;
  labelSide: (id: string) => 'left' | 'right' | null;
  /** Returns true while something is still moving. */
  update: (st: StageState, dt: number) => boolean;
  /** The same tree as flat strokes, for the static drawing. */
  skeleton: (st: StageState) => { strokes: SkeletonStroke[]; marks: SkeletonMark[] };
  dispose: () => void;
}

/** How far along its curve an answered shoot's knot sits. */
const KNOT_U = 0.3;

const V = (a: V3) => new Vector3(a[0], a[1], a[2]);
const cubic = (c: Cubic) => new CubicBezierCurve3(V(c[0]), V(c[1]), V(c[2]), V(c[3]));
const quadratic = (c: Quadratic) => new QuadraticBezierCurve3(V(c[0]), V(c[1]), V(c[2]));
const setU = (m: ShaderMaterial, k: string, value: number) => {
  m.uniforms[k]!.value = value;
};

type GlLine = Line<BufferGeometry, ShaderMaterial>;

export function buildScene(ctx: SceneContext): CanopyScene {
  const { index, data, layout, colors: C, scene, camera } = ctx;
  const idx = index.byId;
  const low = ctx.lowPower;
  const { pos: POS, from: FROM, win: WIN, bySide, sideOf } = layout;
  const TONE = { system: C.toneSystem, product: C.toneProduct, trunk: C.toneTrunk };

  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];
  const keepG = <G extends BufferGeometry>(g: G) => (geometries.push(g), g);
  const keepM = <M extends Material>(m: M) => (materials.push(m), m);

  /* A polyline that can draw itself from start to end (uP), dashed (uN, uD) or fading (uG). */
  function line(
    points: (Vector3 | V3)[],
    o: { color: string; alpha?: number; dash?: number; duty?: number; fade?: number },
  ): { l: GlLine; pts: Vector3[] } {
    const P = points.map((p) => (p instanceof Vector3 ? p : V(p)));
    const arr: number[] = [];
    let at: number[] = [];
    let L = 0;
    P.forEach((p, i) => {
      if (i) L += p.distanceTo(P[i - 1]!);
      at.push(L);
      arr.push(p.x, p.y, p.z);
    });
    at = at.map((d) => (L ? d / L : 0));
    const g = keepG(new BufferGeometry());
    g.setAttribute('position', new Float32BufferAttribute(arr, 3));
    g.setAttribute('aT', new Float32BufferAttribute(at, 1));
    const c = hex(o.color);
    const m = keepM(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uC: { value: new Vector3(c[0], c[1], c[2]) },
          uA: { value: o.alpha ?? 1 },
          uN: { value: o.dash ? L / o.dash : 0 },
          uD: { value: o.duty ?? 0.5 },
          uP: { value: 1 },
          uG: { value: o.fade ?? 0 },
        },
        vertexShader:
          'attribute float aT; varying float vT; void main(){ vT=aT; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader:
          'uniform vec3 uC; uniform float uA; uniform float uN; uniform float uD; uniform float uP; uniform float uG; varying float vT; void main(){ if (vT>uP+0.0001) discard; if (uN>0.0 && fract(vT*uN)>uD) discard; gl_FragColor=vec4(uC,uA*(1.0-uG+uG*vT)); }',
      }),
    );
    return { l: new Line(g, m), pts: P };
  }

  /* ---------- stump: the hero object, light ---------- */
  const SC = STUMP_SCALE;
  const SH = STUMP.H * SC;
  const N = low ? 96 : 160;
  const stumpRings: {
    l: GlLine;
    pts: Vector3[];
    w: [number, number];
    a: number;
    color: string;
    dash?: boolean;
  }[] = [];
  {
    const pos: number[] = [];
    const nor: number[] = [];
    const shade: number[] = [];
    const ind: number[] = [];
    const rows = low ? 5 : 8;
    for (let r = 0; r <= rows; r++) {
      const y = r / rows;
      const yy = y * SH;
      for (let k = 0; k <= N; k++) {
        const a = (k / N) * TAU;
        const grain = Math.sin(a * 34 + Math.sin(a * 7) * 2);
        const rr =
          outlineR(a) * SC * (1 + 0.07 * Math.exp(-yy / 0.12)) + 0.018 * grain * (0.6 + 0.4 * y);
        pos.push(Math.cos(a) * rr, yy, Math.sin(a) * rr);
        nor.push(Math.cos(a), 0.05, Math.sin(a));
        shade.push(0.55 + 0.45 * Math.abs(grain));
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < N; k++) {
        const i0 = r * (N + 1) + k;
        const i1 = i0 + N + 1;
        ind.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1);
      }
    }
    const g = keepG(new BufferGeometry());
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    g.setAttribute('aS', new Float32BufferAttribute(shade, 1));
    g.setIndex(ind);
    scene.add(
      new Mesh(
        g,
        keepM(
          new ShaderMaterial({
            uniforms: { uH: { value: SH } },
            vertexShader:
              'attribute float aS; varying vec3 vN; varying vec3 vW; varying float vS; varying float vY; uniform float uH; void main(){ vS=aS; vY=position.y/uH; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
            fragmentShader:
              'varying vec3 vN; varying vec3 vW; varying float vS; varying float vY; void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW); float key=max(dot(N,normalize(vec3(-0.6,0.5,0.6))),0.0); float rim=pow(1.0-max(dot(N,V),0.0),3.0)*max(dot(N,normalize(vec3(0.9,0.1,-0.2))),0.0);' +
              ' vec3 bark=vec3(0.085,0.068,0.055)*(0.55+0.45*vS); vec3 col=bark*(0.35+1.1*key)+vec3(0.25,0.62,0.57)*rim*0.3; col*=0.55+0.45*smoothstep(0.0,0.9,vY); gl_FragColor=vec4(col,1.0); }',
          }),
        ),
      ),
    );
    const tp = [0, SH, 0];
    const ti: number[] = [];
    for (let k = 0; k <= N; k++) {
      const a = (k / N) * TAU;
      const r = outlineR(a) * SC;
      tp.push(Math.cos(a) * r, SH, Math.sin(a) * r);
    }
    for (let k = 1; k <= N; k++) ti.push(0, k + 1, k);
    const tg = keepG(new BufferGeometry());
    tg.setAttribute('position', new Float32BufferAttribute(tp, 3));
    tg.setIndex(ti);
    scene.add(
      new Mesh(
        tg,
        keepM(
          new ShaderMaterial({
            vertexShader:
              'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
            fragmentShader:
              'varying vec3 vP; void main(){ float r=length(vP.xz); float g=0.5+0.5*sin(r*46.0); vec3 c=mix(vec3(0.16,0.115,0.08),vec3(0.2,0.145,0.1),g*0.5); c*=0.75+0.25*smoothstep(1.6,0.0,r); gl_FragColor=vec4(c,1.0); }',
          }),
        ),
      ),
    );
    /* growth rings drawn round from the pith out, the outermost (living) ring in teal */
    STUMP.major.forEach((t, i) => {
      const last = i === STUMP.major.length - 1;
      const pts = ring(t, low ? 120 : 180, SC).map((p): V3 => [p[0], SH + 0.004, p[1]]);
      const color = last ? C.signal : C.signalDim;
      const a = last ? 0.7 : 0.3;
      const ln = line(pts, { color, alpha: a });
      scene.add(ln.l);
      stumpRings.push({ ...ln, w: [0.01 + i * 0.022, 0.12 + i * 0.022], a, color });
    });
    [1.35, 1.62].forEach((s, i) => {
      const pts = ring(1, 220, SC * s).map((p): V3 => [p[0], 0.001, p[1]]);
      const a = i ? 0.2 : 0.32;
      const ln = line(pts, { color: C.signalDim, alpha: a, dash: i ? 0.07 : 0.12 });
      scene.add(ln.l);
      stumpRings.push({
        ...ln,
        w: [0.1 + i * 0.04, 0.3 + i * 0.04],
        a,
        color: C.signalDim,
        dash: true,
      });
    });
  }

  /* ---------- branches: tapered tubes that grow from base to tip (uP), the tip drawn to a point ---------- */
  const RADIAL = low ? 6 : 9;
  function tubeGeo(curve: Curve<Vector3>, r0: number, r1: number, segs: number) {
    const fr = curve.computeFrenetFrames(segs, false);
    const pos: number[] = [];
    const nor: number[] = [];
    const au: number[] = [];
    const ac: number[] = [];
    const ind: number[] = [];
    const P = new Vector3();
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      curve.getPointAt(u, P);
      const rr = r0 + (r1 - r0) * Math.pow(u, 0.8);
      const Nn = fr.normals[i]!;
      const B = fr.binormals[i]!;
      for (let j = 0; j <= RADIAL; j++) {
        const v = (j / RADIAL) * Math.PI * 2;
        const cx = Math.cos(v);
        const sx = Math.sin(v);
        const nx = cx * Nn.x + sx * B.x;
        const ny = cx * Nn.y + sx * B.y;
        const nz = cx * Nn.z + sx * B.z;
        pos.push(P.x + rr * nx, P.y + rr * ny, P.z + rr * nz);
        nor.push(nx, ny, nz);
        au.push(u);
        ac.push(P.x, P.y, P.z);
      }
    }
    for (let i = 0; i < segs; i++) {
      for (let j = 0; j < RADIAL; j++) {
        const a = i * (RADIAL + 1) + j;
        const b = a + RADIAL + 1;
        ind.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = keepG(new BufferGeometry());
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    g.setAttribute('aU', new Float32BufferAttribute(au, 1));
    g.setAttribute('aC', new Float32BufferAttribute(ac, 3));
    g.setIndex(ind);
    return g;
  }
  function branchMat(color: string) {
    const c = hex(color);
    return keepM(
      new ShaderMaterial({
        uniforms: {
          uC: { value: new Vector3(c[0], c[1], c[2]) },
          uL: { value: 1 },
          uP: { value: 1 },
        },
        vertexShader:
          'uniform float uP; attribute float aU; attribute vec3 aC; varying vec3 vN; varying vec3 vW; varying float vU; void main(){ vU=aU; float k=clamp((uP-aU)/0.06,0.0,1.0); k=k*(2.0-k); vec3 p=aC+(position-aC)*k; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(p,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
        fragmentShader:
          'uniform vec3 uC; uniform float uL; uniform float uP; varying vec3 vN; varying vec3 vW; varying float vU; void main(){ if (vU>uP+0.001) discard; vec3 V=normalize(cameraPosition-vW); float f=max(dot(normalize(vN),V),0.0); vec3 col=uC*(0.5+0.5*pow(f,0.6))*(0.86+0.14*vU); col=mix(vec3(dot(col,vec3(0.3,0.5,0.2)))*0.22,col,uL); gl_FragColor=vec4(col,1.0); }',
      }),
    );
  }
  interface Branch {
    key: string;
    lit: string | null;
    m: ShaderMaterial;
    curve: Curve<Vector3>;
    r0: number;
    r1: number;
    color: string;
    win: [number, number];
  }
  const branches: Branch[] = [];
  function addBranch(
    key: string,
    curve: Curve<Vector3>,
    r0: number,
    r1: number,
    color: string,
    win: [number, number],
    lit: string | null,
  ) {
    const m = branchMat(color);
    scene.add(new Mesh(tubeGeo(curve, r0, r1, low ? 24 : 36), m));
    branches.push({ key, lit, m, curve, r0, r1, color, win });
  }
  addBranch('trunk', cubic(layout.trunk), 0.068, 0.047, TONE.trunk, WIN.trunk!, null);
  for (const s of SIDES) {
    if (!bySide[s].length) continue;
    const curve = cubic(branchCurve(layout.fork, layout.bough[s], 'bough'));
    addBranch(`bough:${s}`, curve, 0.047, 0.04, TONE[s], WIN[s]!, `side:${s}`);
  }
  for (const n of data.nodes) {
    const parentW = n.parent ? idx[n.parent]!.weight : 5;
    addBranch(
      n.id,
      cubic(branchCurve(FROM[n.id]!, POS[n.id]!, 'branch')),
      branchRadius(Math.min(parentW, n.weight + 1.5)),
      branchRadius(n.weight) * 0.8,
      TONE[sideOf(n.id)],
      WIN[n.id]!,
      n.id,
    );
  }

  /* ---------- flows: faint arcs, brighter toward the receiving end; they draw from source to target ---------- */
  const flows = data.flows
    .filter((f) => POS[f.from] && POS[f.to])
    .map((f) => {
      const curve = quadratic(flowCurve(POS[f.from]!, POS[f.to]!));
      const ln = line(curve.getSpacedPoints(low ? 40 : 70), {
        color: C.signal,
        alpha: 0.14,
        fade: 0.85,
      });
      scene.add(ln.l);
      return { f, ...ln, draw: 1, on: false };
    });

  /* ---------- marks: the ring logo, flat, facing the camera ---------- */
  const markGeo = keepG(new PlaneGeometry(1, 1));
  const MARK_FS = [
    'uniform float uA; uniform float uOuter; uniform float uArc; uniform float uDash; uniform float uLit; uniform float uHot;',
    'uniform vec3 cCedar; uniform vec3 cHinoki; uniform vec3 cBone; uniform vec3 cSignal; uniform vec3 cGround; uniform vec3 cSmoke;',
    'varying vec2 vUv;',
    'float band(float r, float R, float w, float aa){ return 1.0 - smoothstep(w*0.5, w*0.5 + aa, abs(r - R)); }',
    'void over(inout vec4 acc, vec3 c, float a){ acc.rgb = mix(acc.rgb, c, a); acc.a = a + acc.a*(1.0 - a); }',
    'void main(){',
    '  vec2 p = vUv*2.0 - 1.0; float r = length(p); float aa = fwidth(r)*1.1; float px = fwidth(r);',
    '  if (r > 1.0) discard;',
    '  float ang = atan(p.x, p.y); float a01 = ang < 0.0 ? ang/6.28318 + 1.0 : ang/6.28318;',
    '  vec4 acc = vec4(0.0);',
    '  float dim = 0.3 + 0.7*uLit;',
    '  if (uDash > 0.5) {',
    '    float d = band(r, 0.72, max(0.07, 1.3*px), aa) * step(0.45, fract(a01*12.0));',
    '    over(acc, mix(cSmoke, cBone, uHot), d*(0.75 + 0.25*uHot));',
    '    float c = 1.0 - smoothstep(0.1, 0.1 + aa, r); over(acc, mix(cSmoke, cBone, uHot), c*0.7);',
    '  } else {',
    '    float back = 1.0 - smoothstep(mix(0.66, 0.95, uOuter), mix(0.66, 0.95, uOuter) + aa, r);',
    '    over(acc, cGround, back*0.9);',
    '    over(acc, cCedar, band(r, 0.86, max(0.045, 1.2*px), aa) * 0.7 * uOuter);',
    '    over(acc, cHinoki, band(r, mix(0.56, 0.54, uOuter), max(0.05, 1.25*px), aa) * mix(0.85, 0.7, uOuter));',
    '    float arc = band(r, 0.86, max(0.1, 2.0*px), aa) * (1.0 - smoothstep(uArc, uArc + 0.006, a01)) * step(0.001, uArc);',
    '    over(acc, cSignal, arc);',
    '    float dot = 1.0 - smoothstep(0.13, 0.13 + aa, r); over(acc, cBone, dot);',
    '  }',
    '  acc.rgb = mix(vec3(dot(acc.rgb, vec3(0.3,0.5,0.2)))*0.5, acc.rgb, uLit);',
    '  gl_FragColor = vec4(acc.rgb, acc.a * uA * dim);',
    '}',
  ].join('\n');
  const col = (h: string) => {
    const c = hex(h);
    return { value: new Vector3(c[0], c[1], c[2]) };
  };
  function markMat(dash: boolean) {
    return keepM(
      new ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uA: { value: 1 },
          uOuter: { value: 0 },
          uArc: { value: 0 },
          uDash: { value: dash ? 1 : 0 },
          uLit: { value: 1 },
          uHot: { value: 0 },
          cCedar: col(C.cedar),
          cHinoki: col(C.hinoki),
          cBone: col(C.bone),
          cSignal: col(C.signal),
          cGround: col(C.ground),
          cSmoke: col(C.smoke),
        },
        vertexShader:
          'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: MARK_FS,
      }),
    );
  }
  type MarkMesh = Mesh<PlaneGeometry, ShaderMaterial>;
  const sizeOf = (id: string) => markSize(index, id);
  const marks: Record<
    string,
    { mesh: MarkMesh; size: number; lead: boolean; arc: number; outer: number }
  > = {};
  const nodes: Record<string, Vector3> = {};
  for (const n of data.nodes) {
    const mesh: MarkMesh = new Mesh(markGeo, markMat(false));
    mesh.renderOrder = 10;
    mesh.position.copy(V(POS[n.id]!));
    scene.add(mesh);
    const lead = idx[n.id]!.start >= 0;
    marks[n.id] = { mesh, size: sizeOf(n.id), lead, arc: lead ? 0.25 : 0, outer: lead ? 1 : 0 };
    nodes[n.id] = mesh.position;
  }
  nodes[index.rootId] = V(layout.base);

  /* ---------- shoots: dashed while open, a solid twig once grown, a knot once answered ---------- */
  interface Shoot {
    curve: QuadraticBezierCurve3;
    tip: Vector3;
    dashed: GlLine;
    tube: Mesh<BufferGeometry, ShaderMaterial>;
    openTip: MarkMesh;
    solidTip: MarkMesh;
    at: Vector3;
  }
  const shoots: Record<string, Shoot[]> = {};
  for (const id of Object.keys(layout.shoots)) {
    shoots[id] = layout.shoots[id]!.map((u) => {
      const curve = quadratic(u.curve);
      const dashed = line(curve.getSpacedPoints(low ? 18 : 28), {
        color: C.smoke,
        alpha: 0.8,
        dash: 0.06,
        duty: 0.55,
      }).l;
      setU(dashed.material, 'uP', 0);
      dashed.visible = false;
      const tube = new Mesh(
        tubeGeo(curve, branchRadius(1) * 0.9, branchRadius(1) * 0.5, low ? 12 : 18),
        branchMat(TONE[sideOf(id)]),
      );
      tube.visible = false;
      const openTip: MarkMesh = new Mesh(markGeo, markMat(true));
      const solidTip: MarkMesh = new Mesh(markGeo, markMat(false));
      for (const m of [openTip, solidTip]) {
        m.renderOrder = 11;
        m.position.copy(V(u.tip));
        m.visible = false;
      }
      scene.add(dashed, tube, openTip, solidTip);
      return { curve, tip: V(u.tip), dashed, tube, openTip, solidTip, at: V(u.tip) };
    });
  }
  const shootPoint = (id: string, i: number, knot: number) => {
    const s = shoots[id]![i]!;
    return knot <= 0 ? s.at.copy(s.tip) : s.curve.getPointAt(1 - (1 - KNOT_U) * soft(knot), s.at);
  };

  /* the one glow: on the pith at rest, behind the open project's mark otherwise */
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = haloCanvas.height = 128;
  const hg = haloCanvas.getContext('2d');
  if (hg) {
    const gr = hg.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,0.5)');
    gr.addColorStop(0.28, 'rgba(255,255,255,0.14)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    hg.fillStyle = gr;
    hg.fillRect(0, 0, 128, 128);
  }
  const halo = new CanvasTexture(haloCanvas);
  textures.push(halo);
  const glow = new Sprite(
    keepM(
      new SpriteMaterial({
        map: halo,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    ),
  );
  glow.renderOrder = 9;
  scene.add(glow);

  /* ---------- camera framing ---------- */
  const all = homePoints(layout);
  function famPts(id: string): V3[] {
    const n = idx[id]!;
    const out: V3[] = [POS[id]!];
    if (n.parent) out.push(POS[n.parent]!);
    for (const c of n.children) {
      out.push(POS[c]!);
      for (const d of idx[c]!.children) out.push(POS[d]!);
    }
    for (const u of layout.shoots[id] ?? []) out.push(u.tip);
    return out;
  }

  function shootP(id: string, i: number, g: number) {
    const n = (layout.shoots[id] ?? []).length;
    const st = n > 1 ? i * 0.1 : 0;
    const span = 1 - (n - 1) * 0.1;
    return soft((g - st) / Math.max(0.3, span));
  }
  const bloomOf = (id: string, u: number) => seg(u, WIN[id]![1] - 0.03, WIN[id]![1] + 0.09);
  const hotColor = hex(C.bone);
  const restColor = hex(C.smoke);
  const warm = hex(C.hinoki);
  const teal = hex(C.signal);

  return {
    nodes,
    pickRadius: (id) => sizeOf(id) * 0.5,
    limits: { az: 38, elMin: -4, elMax: 32, zoomMin: 0.5, zoomMax: 1.6 },
    home() {
      const b = bounds(all);
      const ph = ctx.isPhone();
      const te = ctx.teaser;
      return {
        target: [b.c[0], b.c[1] + (ph ? 0.1 : 0.15), 0],
        dist: ctx.fit(Math.max(b.w / 2, b.h / 2) + (te ? 0.1 : ph ? 0.1 : 0.2), te ? 0.97 : 0.95),
        az: 0,
        el: 9,
      };
    },
    view(id) {
      const b = bounds(famPts(id), 0);
      const s = sideOf(id) === 'product' ? 1 : -1;
      const ph = ctx.isPhone();
      return {
        target: b.c,
        dist: ctx.fit(Math.max(1.5, b.r + (ph ? 0.75 : 0.65)), 0.9),
        az: s * 16,
        el: 6,
      };
    },
    shootTips: (id) => (shoots[id] ?? []).map((s) => s.tip),
    shootPoint,
    labelIn(k, st) {
      if (k.startsWith('shoot:')) {
        const p = k.split(':');
        const id = p[1]!;
        const i = Number(p[2]);
        return seg(shootP(id, i, st.grow(id)), 0.75, 1) * (1 - seg(st.knot(id, i), 0.2, 0.8));
      }
      if (st.calm) return 1;
      const w = WIN[k];
      return w ? seg(st.introLin, w[1] + 0.01, w[1] + 0.1) : 1;
    },
    labelSide: (id) =>
      idx[id]!.depth === 0 ? (sideOf(id) === 'product' ? 'right' : 'left') : null,
    update(st, dt) {
      const u = st.calm ? 1 : st.introLin;
      const key = st.active ?? st.hover;
      let moving = false;
      for (const r of stumpRings) setU(r.l.material, 'uP', seg(u, r.w[0], r.w[1]));
      for (const b of branches) {
        setU(b.m, 'uP', soft((u - b.win[0]) / (b.win[1] - b.win[0])));
        const L =
          b.lit == null
            ? 1
            : b.lit.startsWith('side:')
              ? Math.max(...bySide[b.lit.slice(5) as 'system' | 'product'].map((i) => st.lit(i)))
              : st.lit(b.lit);
        setU(b.m, 'uL', b.key === 'trunk' ? 1 : L);
      }
      const phone = ctx.isPhone();
      for (const id of Object.keys(marks)) {
        const m = marks[id]!;
        const mat = m.mesh.material;
        const on = id === key;
        const act = id === st.active;
        const bl = bloomOf(id, u);
        const sz = m.size * (phone ? 1.25 : 1) * (0.35 + 0.65 * bl) * (act ? 1.12 : 1);
        /* the outer ring and the teal arc: always on for the start projects; they grow in on the open project */
        const outerGoal = m.lead || on ? 1 : 0;
        const arcGoal = m.lead ? 0.25 : act ? 0.25 : 0;
        m.outer += (outerGoal - m.outer) * (st.calm ? 1 : 1 - Math.exp(-dt * 3.2));
        m.arc += (arcGoal - m.arc) * (st.calm ? 1 : 1 - Math.exp(-dt * 1.6));
        if (Math.abs(outerGoal - m.outer) > 0.002 || Math.abs(arcGoal - m.arc) > 0.002) {
          moving = true;
        }
        const arcIntro = m.lead ? seg(u, WIN[id]![1] + 0.04, WIN[id]![1] + 0.18) : 1;
        m.mesh.scale.set(sz, sz, 1);
        m.mesh.quaternion.copy(camera.quaternion);
        setU(mat, 'uA', bl);
        setU(mat, 'uLit', st.lit(id));
        setU(mat, 'uOuter', m.outer);
        setU(mat, 'uArc', m.arc * arcIntro);
        setU(mat, 'uHot', on ? 1 : 0);
        m.mesh.visible = bl > 0.002;
      }
      for (const id of Object.keys(shoots)) {
        const g = st.grow(id);
        const hu = st.hoverShoot;
        const lit = st.lit(id);
        shoots[id]!.forEach((s, i) => {
          const p = shootP(id, i, g);
          const hot = !!hu && hu.id === id && hu.i === i;
          const solid = st.solid(id, i);
          const knot = st.knot(id, i);
          /* the shoot pulls back toward its base as it is answered, and its line fades out */
          const reach = 1 - (1 - KNOT_U) * soft(knot);
          const dm = s.dashed.material;
          s.dashed.visible = p > 0.001 && solid < 1 && knot < 1;
          setU(dm, 'uP', p * reach);
          setU(dm, 'uA', (hot ? 1 : 0.7) * (0.3 + 0.7 * lit) * (1 - seg(knot, 0.6, 1)));
          const c = hot ? hotColor : restColor;
          (dm.uniforms.uC!.value as Vector3).set(c[0], c[1], c[2]);
          /* grown: a solid twig draws over the dashes, base to tip */
          s.tube.visible = p > 0.001 && solid > 0.001;
          setU(s.tube.material, 'uP', Math.min(p, soft(solid)));
          setU(s.tube.material, 'uL', lit);
          const tb = seg(p, 0.82, 1);
          const firm = Math.max(seg(solid, 0.82, 1), seg(knot, 0.4, 1));
          const base = (phone ? 0.26 : 0.2) * (0.4 + 0.6 * tb) * (hot ? 1.25 : 1);
          const at = shootPoint(id, i, knot);
          s.openTip.visible = tb * (1 - firm) > 0.002;
          s.openTip.position.copy(at);
          s.openTip.scale.setScalar(base);
          s.openTip.quaternion.copy(camera.quaternion);
          setU(s.openTip.material, 'uA', tb * (1 - firm));
          setU(s.openTip.material, 'uHot', hot ? 1 : 0);
          setU(s.openTip.material, 'uLit', 1);
          s.solidTip.visible = tb * firm > 0.002;
          s.solidTip.position.copy(at);
          s.solidTip.scale.setScalar(base * (1.15 - 0.6 * soft(knot)));
          s.solidTip.quaternion.copy(camera.quaternion);
          setU(s.solidTip.material, 'uA', tb * firm);
          setU(s.solidTip.material, 'uHot', hot ? 1 : 0);
          setU(s.solidTip.material, 'uLit', lit);
        });
      }
      for (const fl of flows) {
        const on = !!key && (key === fl.f.from || key === fl.f.to);
        if (on && !fl.on && !st.calm) fl.draw = 0;
        fl.on = on;
        if (fl.draw < 1) {
          fl.draw = Math.min(1, fl.draw + dt / 1.6);
          moving = true;
        }
        const intro = seg(u, layout.flowWin[0], layout.flowWin[1]);
        setU(fl.l.material, 'uP', Math.min(intro, soft(fl.draw)));
        setU(fl.l.material, 'uA', on ? 0.85 : 0.13 * Math.min(st.lit(fl.f.from), st.lit(fl.f.to)));
      }
      const gid = st.active;
      const gm = glow.material;
      if (gid && marks[gid]) {
        /* a freshly grown shoot takes the glow from its project's mark */
        const gs = st.glowShoot && st.glowShoot.id === gid ? st.glowShoot : null;
        const k = gs
          ? seg(st.solid(gid, gs.i), 0.82, 1) * seg(shootP(gid, gs.i, st.grow(gid)), 0.82, 1)
          : 0;
        glow.position.copy(nodes[gid]!);
        if (gs && k > 0) glow.position.lerp(shoots[gid]![gs.i]!.tip, k);
        const size = marks[gid]!.size * 4.2 * (1 - 0.55 * k);
        glow.scale.set(size, size, 1);
        gm.color.setRGB(warm[0], warm[1], warm[2]);
        gm.opacity = 0.32;
      } else {
        glow.position.set(0, SH + 0.02, 0);
        glow.scale.set(1.1, 1.1, 1);
        gm.color.setRGB(teal[0], teal[1], teal[2]);
        gm.opacity = 0.4 * seg(u, 0, 0.2);
      }
      return moving;
    },
    skeleton(st) {
      const strokes: SkeletonStroke[] = [];
      const mk: SkeletonMark[] = [];
      const front: Vector3[] = [];
      const back: Vector3[] = [];
      for (let k = 0; k <= 48; k++) {
        const a = (k / 48) * Math.PI * 2;
        const r = outlineR(a) * SC;
        front.push(new Vector3(Math.cos(a) * r, SH, Math.sin(a) * r));
        back.push(new Vector3(Math.cos(a) * r * 1.04, 0, Math.sin(a) * r * 1.04));
      }
      strokes.push({ wall: [front, back], fill: C.stumpWall, alpha: 1 });
      strokes.push({ pts: front, fill: C.stumpTop, alpha: 1 });
      for (const r of stumpRings) {
        strokes.push({ pts: r.pts, color: r.color, alpha: r.a, px: 1, dash: r.dash });
      }
      for (const b of branches) {
        const L = b.lit == null || b.lit.startsWith('side:') ? 1 : st.lit(b.lit);
        strokes.push({
          pts: b.curve.getSpacedPoints(20),
          r0: b.r0,
          r1: b.r1,
          color: b.color,
          alpha: 0.25 + 0.75 * L,
        });
      }
      for (const fl of flows) {
        const on = !!st.active && (st.active === fl.f.from || st.active === fl.f.to);
        strokes.push({ pts: fl.pts, color: C.signal, alpha: on ? 0.75 : 0.12, px: 1 });
      }
      for (const id of Object.keys(shoots)) {
        if (st.grow(id) < 0.5) continue;
        shoots[id]!.forEach((s, i) => {
          const knot = st.knot(id, i);
          if (knot >= 0.5) {
            mk.push({ p: shootPoint(id, i, 1).clone(), size: 0.11, kind: 'node', alpha: 1 });
            return;
          }
          const pts = s.curve.getSpacedPoints(16);
          if (st.solid(id, i) >= 0.5) {
            strokes.push({
              pts,
              r0: branchRadius(1) * 0.9,
              r1: branchRadius(1) * 0.5,
              color: TONE[sideOf(id)],
              alpha: 1,
            });
            mk.push({ p: s.tip, size: 0.23, kind: 'node', alpha: 1 });
          } else {
            strokes.push({ pts, color: C.smoke, alpha: 0.8, px: 1, dash: true });
            mk.push({ p: s.tip, size: 0.2, kind: 'shoot', alpha: 1 });
          }
        });
      }
      const phone = ctx.isPhone();
      for (const id of Object.keys(marks)) {
        const m = marks[id]!;
        const act = id === st.active;
        mk.push({
          p: nodes[id]!,
          size: m.size * (phone ? 1.25 : 1),
          kind: m.lead || act ? 'lead' : 'node',
          arc: m.lead || act ? 0.25 : 0,
          alpha: 0.3 + 0.7 * st.lit(id),
        });
      }
      return { strokes, marks: mk };
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
      scene.clear();
    },
  };
}
