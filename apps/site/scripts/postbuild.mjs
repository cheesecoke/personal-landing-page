// After `react-router build`: publish the pre-rendered catch-all as 404.html (what static hosts
// serve for unknown URLs) and fail the build if any page is missing its HTML file.
import { copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const out = join(import.meta.dirname, '..', 'build', 'client');
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
console.log(`postbuild: ${pagePaths.length} pages + 404.html in build/client`);
