import { describe, expect, it } from 'vitest';

import { defaultCanopyData } from '../data/default';
import type { CanopyData, CanopyNode } from '../types';
import { canopyColors } from './colors';
import { flatTree } from './flat';
import { placeLabels } from './labels';
import { layoutCanopy } from './layout';
import { outlineR, ringR } from './stump';
import { buildIndex } from './tree';

const index = buildIndex(defaultCanopyData);

describe('layoutCanopy', () => {
  const L = layoutCanopy(index);

  it('puts systems on the left bough and products on the right', () => {
    expect(L.sideOf('lifebox')).toBe('system');
    expect(L.sideOf('thread-quest')).toBe('product');
    expect(L.pos.pas![0]).toBeLessThan(0);
    expect(L.pos['duo-decide']![0]).toBeGreaterThan(0);
  });

  it('starts each branch at its parent mark, or at its bough', () => {
    expect(L.from.atti).toEqual(L.pos.pas);
    expect(L.from.pas).toEqual(L.bough.system);
  });

  it('lays out a tip for every drawn shoot, none pointing down into the tree', () => {
    for (const id of index.ids) {
      const tips = L.shoots[id] ?? [];
      expect(tips).toHaveLength(index.byId[id]!.shoots.length);
      for (const t of tips) expect(t.tip[1] - L.pos[id]![1]).toBeGreaterThan(-0.3);
    }
  });

  it('schedules growth inside the intro: trunk, boughs, branches, then what sits inside', () => {
    for (const w of Object.values(L.win)) {
      expect(w[0]).toBeGreaterThanOrEqual(0);
      expect(w[1]).toBeLessThanOrEqual(0.8601);
    }
    expect(L.win.trunk![0]).toBeLessThan(L.win.system![0]);
    expect(L.win.pas![0]).toBeLessThan(L.win.atti![0]);
    expect(L.win.atti![0]).toBeLessThan(L.win.lifebox![0]);
    expect(L.win.pas![0]).toBeLessThan(L.win['duo-decide']![0]);
  });

  it('pulls the crown in on phones without moving it up or down', () => {
    const P = layoutCanopy(index, 0.8);
    expect(P.pos.pas![0]).toBeCloseTo(L.pos.pas![0] * 0.8);
    expect(P.pos.pas![1]).toBe(L.pos.pas![1]);
  });

  it('places ids it has never seen', () => {
    const node = (id: string, parent: string | null, kind: CanopyNode['kind']): CanopyNode => ({
      id,
      label: id,
      parent,
      kind,
      status: 'In build',
      weight: 3,
      page: true,
      href: '/',
      oneLine: '',
      shoots: [{ id: `${id}-s`, label: 'Next', state: 'open' }],
    });
    const data: CanopyData = {
      root: { id: 'root', label: 'Root' },
      nodes: [node('x', null, 'system'), node('y', 'x', 'system'), node('z', null, 'product')],
      flows: [{ from: 'x', to: 'z', label: 'feeds' }],
      start: ['z'],
    };
    const made = layoutCanopy(buildIndex(data));
    for (const id of ['x', 'y', 'z']) {
      for (const v of made.pos[id]!) expect(Number.isFinite(v)).toBe(true);
      expect(made.shoots[id]).toHaveLength(1);
    }
    expect(made.pos.x![0]).toBeLessThan(0);
    expect(made.pos.z![0]).toBeGreaterThan(0);
  });
});

describe('stump', () => {
  it('has an outline near radius 1 and rings inside it', () => {
    for (let a = 0; a < 6.28; a += 0.4) {
      expect(outlineR(a)).toBeGreaterThan(0.8);
      expect(outlineR(a)).toBeLessThan(1.2);
      expect(ringR(0.5, a)).toBeLessThan(outlineR(a));
    }
  });
});

describe('placeLabels', () => {
  it('keeps labels inside the bounds and off each other', () => {
    const items = [
      { id: 'a', x: 100, y: 100, r: 10, w: 60, h: 20 },
      { id: 'b', x: 104, y: 100, r: 10, w: 60, h: 20 },
    ];
    const placed = placeLabels(items, [], [0, 0, 300, 200]);
    const a = placed.a!.rect;
    const b = placed.b!.rect;
    const overlap = a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    expect(overlap).toBe(false);
    for (const r of [a, b]) {
      expect(r[0]).toBeGreaterThanOrEqual(0);
      expect(r[2]).toBeLessThanOrEqual(300);
    }
  });

  it('leaves a label out when nothing is free', () => {
    const placed = placeLabels(
      [{ id: 'a', x: 10, y: 10, r: 4, w: 500, h: 20 }],
      [],
      [0, 0, 100, 100],
    );
    expect(placed.a).toBeUndefined();
  });
});

describe('flatTree', () => {
  it.each([
    ['desktop', { width: 1128, height: 800, phone: false, teaser: false, top: 82 }],
    ['phone', { width: 390, height: 590, phone: true, teaser: false, top: 62 }],
    ['teaser', { width: 760, height: 460, phone: false, teaser: true }],
  ])('frames the whole tree inside the %s stage', (_, frame) => {
    const tree = flatTree(index, defaultCanopyData, canopyColors, frame);
    expect(tree.marks).toHaveLength(12);
    for (const m of tree.marks) {
      expect(m.x - m.r).toBeGreaterThan(0);
      expect(m.x + m.r).toBeLessThan(frame.width);
      expect(m.y - m.r).toBeGreaterThan(0);
      expect(m.y + m.r).toBeLessThan(frame.height);
    }
    const labelled = tree.labels.map((l) => l.id);
    for (const id of defaultCanopyData.start) expect(labelled).toContain(id);
    for (const s of tree.shapes) expect(s.d).not.toMatch(/NaN|Infinity/);
  });
});
