// After `react-router build`: publish the pre-rendered catch-all as 404.html (what static hosts
// serve for unknown URLs) and fail the build if any page is missing its HTML file.
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
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
// page's HTML or data may carry one. Beyond shows its one marker on purpose, as its design does.
const showsItsMarker = new Set(['beyond/index.html', 'beyond.data']);
const leaked = readdirSync(out, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.(html|data)$/.test(file))
  .filter((file) => !showsItsMarker.has(file.split('\\').join('/')))
  .filter((file) => /\[(CONFIRM|PLACEHOLDER)/.test(readFileSync(join(out, file), 'utf8')));
if (leaked.length > 0) {
  throw new Error(`postbuild: an author's marker is in ${leaked.join(', ')}`);
}

console.log(`postbuild: ${pagePaths.length} pages + 404.html in ${out}`);
