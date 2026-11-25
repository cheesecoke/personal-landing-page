// @cwc/dive: the framework-free simulation behind the Contact page's "Portal dive".
// No DOM, no rendering, no clocks: a renderer calls `step` with its own frame time.
export { angleDelta, inGap, TAU, wrapAngle } from './angle';
export { createRng, type Rng } from './rng';
