/** The framework-free core. Importing this module pulls in three.js: load it lazily. */
export { mountCanopy } from './engine';
export type {
  CanopyHandle,
  CanopyMode,
  CanopyOptions,
  CanopyPerf,
  CanopyPoint,
  CanopySelection,
  CanopySnapshot,
} from './engine';
export type { ShootRef } from './scene';
