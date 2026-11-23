#!/usr/bin/env node
// PreToolUse (Write/Edit/Bash): apps/site/content/live/ is written only by the publish bot.
// Fixtures live in packages/content/fixtures/ (AGENTS.md, site rule 5).
import { readFileSync } from 'node:fs';

const LIVE = /apps\/site\/content\/live(\/|$|\s|["'])/;
const WRITES =
  /(>|\b(cp|mv|rm|tee|touch|mkdir|rsync|install|ln|truncate)\b|\bsed\s+-i|\bgit\s+(rm|mv)\b)/;

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const tool = input.tool_name ?? '';
const args = input.tool_input ?? {};
const path = String(args.file_path ?? args.notebook_path ?? '').replaceAll('\\', '/');
const command = String(args.command ?? '');

const blocked =
  tool === 'Bash' ? LIVE.test(command) && WRITES.test(command) : LIVE.test(`${path} `);

if (blocked) {
  console.error(
    'Blocked: apps/site/content/live/ is owned by the publish bot and is never edited by hand. ' +
      'Put fixtures in packages/content/fixtures/ instead.',
  );
  process.exit(2);
}
process.exit(0);
