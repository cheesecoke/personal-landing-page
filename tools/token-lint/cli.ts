import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { LINTED_FILE, lintSource, SKIPPED_FILE, type Finding } from './token-lint';

// Usage: tsx tools/token-lint/cli.ts [file or directory ...]   (default: packages/ui/src)
const root = resolve(import.meta.dirname, '..', '..');
const targets = process.argv.slice(2);
const inputs = targets.length > 0 ? targets : [join(root, 'packages', 'ui', 'src')];

function walk(path: string): string[] {
  if (statSync(path).isDirectory()) {
    return readdirSync(path)
      .filter((name) => name !== 'node_modules')
      .flatMap((name) => walk(join(path, name)));
  }
  return LINTED_FILE.test(path) && !SKIPPED_FILE.test(path) ? [path] : [];
}

const files = inputs.flatMap((input) => walk(resolve(input)));
const findings: Finding[] = files.flatMap((file) =>
  lintSource(relative(root, file), readFileSync(file, 'utf8')),
);

for (const finding of findings) {
  console.error(
    `${finding.file}:${finding.line}  ${finding.rule}  ${finding.text}\n    ${finding.message}`,
  );
}
if (findings.length > 0) {
  console.error(`\ntoken-lint: ${findings.length} problem(s) in ${files.length} file(s)`);
  process.exit(1);
}
console.log(`token-lint: ${files.length} file(s) clean`);
