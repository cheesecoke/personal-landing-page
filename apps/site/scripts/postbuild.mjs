// After `react-router build`: publish the pre-rendered catch-all as 404.html (what static hosts
// serve for unknown URLs), fail the build if any page is missing its HTML file, and write the
// sitemap from the pages' own canonical addresses.
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const out = join(import.meta.dirname, '..', process.env.SITE_BUILD_DIR || 'build', 'client');
const pathsSource = readFileSync(join(import.meta.dirname, '..', 'app', 'paths.ts'), 'utf8');
const pagePaths = [
  ...pathsSource
    .split('pagePaths = [')[1]
    .split(']')[0]
    .matchAll(/'([^']+)'/g),
].map((match) => match[1]);

const notFound = join(out, '404', 'index.html');
if (!existsSync(notFound)) throw new Error('postbuild: the 404 page was not pre-rendered');
copyFileSync(notFound, join(out, '404.html'));
rmSync(join(out, '404'), { recursive: true });

const missing = pagePaths.filter(
  (path) => !existsSync(join(out, path === '/' ? '' : path, 'index.html')),
);
if (pagePaths.length === 0 || missing.length > 0) {
  throw new Error(`postbuild: no pre-rendered HTML for ${missing.join(', ') || 'any page'}`);
}
// Notes for the author (`[CONFIRM: ...]`, `[PLACEHOLDER ...]`) stay out of what is published: no
// page's HTML or data may carry one.
const leaked = readdirSync(out, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.(html|data)$/.test(file))
  .filter((file) => /\[(CONFIRM|PLACEHOLDER)/.test(readFileSync(join(out, file), 'utf8')));
if (leaked.length > 0) {
  throw new Error(`postbuild: an author's marker is in ${leaked.join(', ')}`);
}

// The Portal dive's hidden note is only for people who win: it lives in the game's lazy chunk and
// must never be in a page's HTML or data.
const diveNote = readFileSync(
  join(import.meta.dirname, '..', 'app', 'templates', 'PortalDive', 'copy.ts'),
  'utf8',
).match(/\bnote:\s*'([^']+)'/)?.[1];
if (!diveNote) throw new Error('postbuild: could not read the Portal dive note from its copy file');
const noteIn = readdirSync(out, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.(html|data)$/.test(file))
  .filter((file) => readFileSync(join(out, file), 'utf8').includes(diveNote));
if (noteIn.length > 0) {
  throw new Error(`postbuild: the Portal dive note is in ${noteIn.join(', ')}`);
}

// The sitemap lists each page's canonical address, read back from its HTML, so the two cannot
// disagree. robots.txt points at it.
const canonical = (path) => {
  const html = readFileSync(join(out, path === '/' ? '' : path, 'index.html'), 'utf8');
  const href = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!href) throw new Error(`postbuild: ${path} has no canonical address`);
  return href;
};
const addresses = pagePaths.map(canonical);
writeFileSync(
  join(out, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...addresses.map((address) => `  <url><loc>${address}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'),
);
appendFileSync(
  join(out, 'robots.txt'),
  `\nSitemap: ${new URL('/sitemap.xml', addresses[0]).href}\n`,
);

console.log(`postbuild: ${pagePaths.length} pages + 404.html in ${out}`);
