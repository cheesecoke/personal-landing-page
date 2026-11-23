// The no-data render test. Builds the site with the live content folder pointing at an empty
// folder (what the site gets if nothing was ever published) and checks every pre-rendered page:
// it exists, it carries no live-only section, no marker slot and no "nothing here yet" text, and
// project status falls back to hand content. The output goes to `build/empty`, beside the real
// build, and is left there to look at.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const buildDir = join('build', 'empty');
const emptyLive = mkdtempSync(join(tmpdir(), 'site-live-empty-'));
const env = { ...process.env, CONTENT_LIVE_DIR: emptyLive, SITE_BUILD_DIR: buildDir };

try {
  for (const [command, ...args] of [
    ['pnpm', 'exec', 'react-router', 'build'],
    ['node', 'scripts/postbuild.mjs'],
  ]) {
    execFileSync(command, args, { cwd: root, env, stdio: 'inherit' });
  }
} finally {
  rmSync(emptyLive, { recursive: true, force: true });
}

const pagePaths = [
  ...readFileSync(join(root, 'app', 'paths.ts'), 'utf8')
    .split('pagePaths = [')[1]
    .split(']')[0]
    .matchAll(/'([^']+)'/g),
].map((match) => match[1]);

/** What must not be in a page built with no live data, each with what it would mean. */
const forbidden = [
  [/data-live=/, 'a live-only section (log, release panel, branch rings, Now, Latest)'],
  [/data-titan-role/, 'the job log'],
  [/data-current-role/, 'the live current role'],
  [/data-new-(label|ring|slot)/, 'a new marker'],
  [/data-nav-ring/, 'the nav release ring'],
  [/Last update/, 'the footer "Last update" line'],
  [/no updates?\b|coming soon|nothing (here|to show) yet/i, 'empty-state text'],
  [/changedAt|publishedAt|publishId/, 'live data fields in the page data'],
];

const failures = [];
const read = (path) =>
  readFileSync(join(root, buildDir, 'client', path === '/' ? '' : path, 'index.html'), 'utf8');

for (const path of pagePaths) {
  const html = read(path);
  // The page must have rendered: a main landmark with a heading in it.
  if (!/<main[\s\S]*<h1[\s>]/.test(html)) failures.push(`${path}: no <h1> inside <main>`);
  for (const [pattern, meaning] of forbidden) {
    const found = html.match(pattern);
    if (found) failures.push(`${path}: ${meaning} ("${found[0].slice(0, 60)}")`);
  }
}

// Status falls back to hand content: every row of the Projects index shows its hand-written word.
const projects = read('/projects');
const index = JSON.parse(
  readFileSync(join(root, 'content', 'hand', 'projects-index.json'), 'utf8'),
);
for (const row of index.index.groups.flatMap((group) => group.rows)) {
  if (!projects.includes(row.name) || !projects.includes(row.status)) {
    failures.push(`/projects: "${row.name}" is missing its hand-written status "${row.status}"`);
  }
}

if (failures.length > 0) {
  console.error(
    `build:empty: ${failures.length} problem(s) with no live data\n  ${failures.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  `build:empty: ${pagePaths.length} pages built with no live data, none shows a live-only shell`,
);
