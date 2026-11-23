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
export { canopyColors } from './core/colors';
export type { CanopyColors } from './core/colors';
export type {
  CanopyHandle,
  CanopyMode,
  CanopyOptions,
  CanopyPerf,
  CanopySelection,
  CanopySnapshot,
} from './core';
export { defaultCanopyCopy } from './data/copy';
export type { CanopyCopy } from './data/copy';
export { Canopy } from './react/Canopy';
export type { CanopyLinkProps, CanopyProps, CanopyRef } from './react/Canopy';
export { CanopyFlat } from './react/CanopyFlat';
export type { CanopyFlatProps } from './react/CanopyFlat';
