// The three.js canopy: framework-free core plus a React wrapper.
// This entry never imports three.js. The core lives at `@cwc/canopy/core` and is loaded lazily.
export type {
  CanopyData,
  CanopyFlow,
  CanopyFresh,
  CanopyKind,
  CanopyNode,
  CanopyShoot,
  CanopyShootState,
  CanopyStatusTone,
  CanopyVariant,
} from './types';
export { defaultCanopyData } from './data/default';
export { buildIndex, listRows, openShoots, statusTone } from './core/tree';
export type { CanopyIndex, CanopyRow, IndexedNode } from './core/tree';
