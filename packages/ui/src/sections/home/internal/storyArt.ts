import { palette } from '@cwc/tokens';

/**
 * Placeholder drawings for stories, as SVG data URIs. Stories only: the site passes the real
 * renders and screenshots in as props.
 */
const svg = (width: number, height: number, body: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${palette.ground}"/>${body}</svg>`,
  )}`;

const rings = (cx: number, cy: number, rx: number, ry: number, lit: boolean) =>
  [1, 0.82, 0.66, 0.5, 0.36, 0.22, 0.08]
    .map((t, index) => {
      const stroke = index === 0 ? palette.signal : index === 2 ? palette.ember : palette.cedar;
      const opacity = lit ? 1 : index === 0 || index === 2 ? 0.85 : 0.45;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx * t}" ry="${ry * t}" fill="none" stroke="${stroke}" stroke-width="${lit ? 5 : 3}" opacity="${opacity}"/>`;
    })
    .join('');

const stump = (cx: number, cy: number, rx: number, ry: number, depth: number, lit: boolean) =>
  `<path d="M${cx - rx} ${cy} v${depth} a${rx} ${ry} 0 0 0 ${rx * 2} 0 v${-depth} z" fill="${palette.surface}"/>` +
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${palette.raised}"/>` +
  rings(cx, cy, rx * 0.96, ry * 0.96, lit);

/** Stands in for the wide stump render: 2400 by 1500, the stump right of centre. */
export const stumpWideArt = {
  src: svg(2400, 1500, stump(1621, 742, 449, 210, 260, false)),
  width: 2400,
  height: 1500,
};

/** The same frame with the rings lit, for the breath. */
export const stumpWideLitArt = {
  src: svg(2400, 1500, stump(1621, 742, 449, 210, 260, true)),
  width: 2400,
  height: 1500,
};

/** Stands in for the phone render: 1170 by 1400, the stump in the lower two thirds. */
export const stumpPhoneArt = {
  src: svg(1170, 1400, stump(548, 800, 330, 152, 190, false)),
  width: 1170,
  height: 1400,
};

/** A flat 4:3 plate drawing: a frame, a title bar and a few rules. */
export const plateArt = (accent: 'signal' | 'ember' | 'ash') => ({
  src: svg(
    1200,
    900,
    `<rect x="300" y="180" width="600" height="540" rx="12" fill="${palette.surface}" stroke="${palette.tick}" stroke-width="2"/>` +
      `<rect x="340" y="230" width="220" height="14" fill="${palette[accent]}"/>` +
      [300, 360, 420, 480, 540, 600]
        .map(
          (y) =>
            `<rect x="340" y="${y}" width="${y % 120 === 0 ? 520 : 380}" height="8" fill="${palette.tick}"/>`,
        )
        .join(''),
  ),
  width: 1200,
  height: 900,
});
