// @cwc/dive: the framework-free simulation behind the Contact page's "Portal dive".
// No DOM, no rendering, no clocks: a renderer calls `step` with its own frame time.
export { angleDelta, inGap, TAU, wrapAngle } from './angle';
export { DIVE_CONFIG, type DiveConfig, type DiveProfile } from './config';
export { buildCourse, ringPairIsPassable, speedAt, type Ring } from './course';
export { createRng, type Rng } from './rng';
