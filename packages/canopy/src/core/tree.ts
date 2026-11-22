import type { CanopyData, CanopyFlow, CanopyNode, CanopyShoot, CanopyStatusTone } from '../types';

/** A node with everything the tree needs worked out once. The root has depth -1. */
export interface IndexedNode extends Omit<CanopyNode, 'shoots'> {
  children: string[];
  depth: number;
  flowsIn: CanopyFlow[];
  flowsOut: CanopyFlow[];
  /** Drawn shoots: dropped ones removed, six at most. */
  shoots: CanopyShoot[];
  /** Rank among the start projects, or -1. */
  start: number;
}

export interface CanopyIndex {
  rootId: string;
  ids: string[];
  byId: Record<string, IndexedNode>;
}

export const MAX_SHOOTS = 6;

/** id -> node plus children, depth, flows in and out, drawn shoots and start rank. */
export function buildIndex(data: CanopyData): CanopyIndex {
  const byId: Record<string, IndexedNode> = {};
  const rootId = data.root.id;
  byId[rootId] = {
    ...data.root,
    parent: null,
    kind: 'system',
    status: '',
    oneLine: '',
    weight: 5,
    page: false,
    href: '/',
    children: [],
    depth: -1,
    flowsIn: [],
    flowsOut: [],
    shoots: [],
    start: -1,
  };
  for (const n of data.nodes) {
    byId[n.id] = {
      ...n,
      children: [],
      depth: 0,
      flowsIn: [],
      flowsOut: [],
      shoots: (n.shoots ?? []).filter((s) => s.state !== 'dropped').slice(0, MAX_SHOOTS),
      start: data.start.indexOf(n.id),
    };
  }
  for (const n of data.nodes) {
    if (n.parent !== null && !byId[n.parent]) {
      throw new Error(`canopy: node "${n.id}" has an unknown parent "${n.parent}"`);
    }
    byId[n.parent ?? rootId]!.children.push(n.id);
  }
  for (const n of data.nodes) {
    let depth = 0;
    let q = byId[n.id]!;
    while (q.parent) {
      depth++;
      q = byId[q.parent]!;
      if (depth > data.nodes.length) throw new Error(`canopy: node "${n.id}" is in a parent loop`);
    }
    byId[n.id]!.depth = depth;
  }
  for (const f of data.flows) {
    const from = byId[f.from];
    const to = byId[f.to];
    if (from && to) {
      from.flowsOut.push(f);
      to.flowsIn.push(f);
    }
  }
  return { rootId, ids: data.nodes.map((n) => n.id), byId };
}

export function ancestors(index: CanopyIndex, id: string): string[] {
  const out: string[] = [];
  let q = index.byId[id];
  while (q && q.parent) {
    out.push(q.parent);
    q = index.byId[q.parent];
  }
  return out;
}

export function descendants(index: CanopyIndex, id: string): string[] {
  const out: string[] = [];
  const walk = (i: string) => {
    for (const c of index.byId[i]!.children) {
      out.push(c);
      walk(c);
    }
  };
  walk(id);
  return out;
}

/** The node, what it sits inside, what sits inside it, and what it feeds or is fed by. */
export function family(index: CanopyIndex, id: string): Record<string, true> {
  const f: Record<string, true> = { [id]: true, [index.rootId]: true };
  if (id === index.rootId) {
    for (const i of index.ids) f[i] = true;
    return f;
  }
  for (const a of [...ancestors(index, id), ...descendants(index, id)]) f[a] = true;
  for (const l of index.byId[id]!.flowsIn) f[l.from] = true;
  for (const l of index.byId[id]!.flowsOut) f[l.to] = true;
  return f;
}

/** Shoots still waiting to grow: the number on a row and in the card heading. */
export function openShoots(node: Pick<IndexedNode, 'shoots'>): number {
  return node.shoots.filter((s) => s.state === 'open').length;
}

/** The status dot, read from the status word when the node does not set a tone. */
export function statusTone(node: Pick<CanopyNode, 'status' | 'tone'>): CanopyStatusTone {
  if (node.tone) return node.tone;
  const s = node.status.toLowerCase();
  return /in build/.test(s) ? 'build' : /daily|running/.test(s) ? 'live' : 'quiet';
}

/** Rows for the list beside the tree: start projects first, then the rest by weight. */
export interface CanopyRow {
  id: string;
  depth: number;
}

export function listRows(
  index: CanopyIndex,
  data: CanopyData,
): { start: CanopyRow[]; more: CanopyRow[] } {
  const branch = (id: string, depth: number, out: CanopyRow[]) => {
    out.push({ id, depth: Math.min(depth, 2) });
    for (const c of index.byId[id]!.children) branch(c, depth + 1, out);
    return out;
  };
  const start: CanopyRow[] = [];
  const more: CanopyRow[] = [];
  for (const id of data.start) if (index.byId[id]) branch(id, 0, start);
  data.nodes
    .filter((n) => !n.parent && !data.start.includes(n.id))
    .sort((a, b) => b.weight - a.weight)
    .forEach((n) => branch(n.id, 0, more));
  return { start, more };
}
