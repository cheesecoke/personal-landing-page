import { palette } from '@cwc/tokens';

import { portalScene } from './scene';

/**
 * A stand-in for the portal render, for stories: a ring round the scene's opening, a platform and
 * a power unit whose toe is the scene's plug. Stories only; the site passes the real render.
 */
const { width, height, opening: o, plug } = portalScene;
const [px, py] = plug;
const body = [
  // The platform under the ring.
  `<path d="M${o.cx - 380} ${py - 10} L${o.cx - 340} ${py - 70} H${o.cx + 340} L${o.cx + 380} ${py - 10} Z" fill="${palette.surface}"/>`,
  // The ring: a thick band round the opening, with a teal and a warm line in it.
  `<ellipse cx="${o.cx}" cy="${o.cy}" rx="${o.rx + 70}" ry="${o.ry + 70}" fill="${palette.raised}"/>`,
  `<ellipse cx="${o.cx}" cy="${o.cy}" rx="${o.rx + 48}" ry="${o.ry + 48}" fill="none" stroke="${palette.ember}" stroke-width="3"/>`,
  `<ellipse cx="${o.cx}" cy="${o.cy}" rx="${o.rx + 22}" ry="${o.ry + 22}" fill="none" stroke="${palette.signal}" stroke-width="3"/>`,
  `<ellipse cx="${o.cx}" cy="${o.cy}" rx="${o.rx}" ry="${o.ry}" fill="${palette.ground}"/>`,
  // The power unit, standing on the floor, its toe at the plug.
  `<path d="M${px} ${py} h200 v-150 h-170 v130 h-30 z" fill="${palette.raised}"/>`,
  `<path d="M${px + 200} ${py - 60} C${px + 300} ${py - 60} ${o.cx - 380} ${py - 120} ${o.cx - 330} ${py - 170}" fill="none" stroke="${palette.surface}" stroke-width="24"/>`,
].join('');

export const portalArt = {
  src: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${palette.ground}"/>${body}</svg>`,
  )}`,
  width,
  height,
};
