/**
 * Inline placeholder drawings for stories: the real images are passed in by the site. Stories
 * only. `subject` is where the drawn subject sits, as pixel rows, for stories that crop.
 */
export function placeholder(
  width: number,
  height: number,
  {
    kind = 'screens',
    subject,
  }: { kind?: 'screens' | 'capture' | 'phone'; subject?: [number, number] } = {},
): string {
  const [top, bottom] = subject ?? [height * 0.09, height * 0.89];
  const h = bottom - top;
  const frame = (x: number, w: number) =>
    `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="${Math.min(w, h) * 0.08}" fill="gray" fill-opacity=".1" stroke="gray" stroke-opacity=".55" stroke-width="2"/>` +
    [0.12, 0.3, 0.48]
      .map(
        (y, i) =>
          `<rect x="${x + w * 0.1}" y="${top + h * y}" width="${w * 0.8}" height="${h * 0.12}" rx="6" fill="gray" fill-opacity="${0.22 - i * 0.05}"/>`,
      )
      .join('');
  const body =
    kind === 'screens'
      ? [0.14, 0.4, 0.66].map((x) => frame(width * x, width * 0.2)).join('')
      : kind === 'phone'
        ? frame(width * 0.04, width * 0.92)
        : `<rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="6" fill="gray" fill-opacity=".08" stroke="gray" stroke-opacity=".5" stroke-width="2"/><rect x="0" y="0" width="${width * 0.22}" height="${height}" fill="gray" fill-opacity=".1"/>` +
          [0.12, 0.3, 0.48, 0.66]
            .map(
              (y) =>
                `<rect x="${width * 0.28}" y="${height * y}" width="${width * 0.64}" height="${height * 0.1}" rx="6" fill="gray" fill-opacity=".14"/>`,
            )
            .join('');
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`,
  )}`;
}
