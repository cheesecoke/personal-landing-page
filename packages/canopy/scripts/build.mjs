// Builds the package the way the site will consume it (React and the list in one chunk, the
// three.js stage in a lazy one) and checks the lazy part against the budget.
//   pnpm --filter @cwc/canopy build
import { readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { build } from 'vite';

const BUDGET_KB = 160;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
rmSync(dist, { recursive: true, force: true });

const result = await build({
  root,
  configFile: false,
  logLevel: 'warn',
  build: {
    outDir: dist,
    minify: true,
    lib: { entry: resolve(root, 'src/index.ts'), formats: ['es'], fileName: 'canopy' },
    rollupOptions: { external: ['react', 'react/jsx-runtime', 'react-dom'] },
  },
});

const chunks = (Array.isArray(result) ? result : [result])
  .flatMap((r) => r.output)
  .filter((o) => o.type === 'chunk');
const byName = Object.fromEntries(chunks.map((c) => [c.fileName, c]));
const entry = chunks.find((c) => c.isEntry);

/** Every file a chunk needs before it can run: itself and its static imports. */
function closure(names, seen = new Set()) {
  for (const name of names) {
    if (seen.has(name) || !byName[name]) continue;
    seen.add(name);
    closure(byName[name].imports, seen);
  }
  return seen;
}
const eager = closure([entry.fileName]);
const lazy = [...closure(entry.dynamicImports)].filter((name) => !eager.has(name));
if (!lazy.length) throw new Error('canopy: the stage is no longer a lazy chunk');

const gz = (name) => gzipSync(readFileSync(resolve(dist, name)), { level: 9 }).length;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const report = (label, names) => {
  const total = names.reduce((sum, name) => sum + gz(name), 0);
  console.log(`${label}: ${kb(total)} gz  (${names.map((n) => `${n} ${kb(gz(n))}`).join(', ')})`);
  return total;
};
report('eager (list, card, flat drawing; React external)', [...eager]);
const lazyBytes = report('lazy  (stage + three.js)', lazy);
const usesThree = [...eager].some((name) => /WebGLRenderer|three\.module/.test(byName[name].code));
if (usesThree) throw new Error('canopy: three.js leaked into the eager chunk');
if (lazyBytes > BUDGET_KB * 1024) {
  throw new Error(
    `canopy: the stage chunk is ${kb(lazyBytes)} gz, over the ${BUDGET_KB} KB budget`,
  );
}
console.log(`within the ${BUDGET_KB} KB gz budget`);
