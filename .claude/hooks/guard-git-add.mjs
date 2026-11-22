#!/usr/bin/env node
// PreToolUse (Bash): block blanket staging. Stage files by name (AGENTS.md, hard rule 2).
import { readFileSync } from 'node:fs';

let command = '';
try {
  command = JSON.parse(readFileSync(0, 'utf8')).tool_input?.command ?? '';
} catch {
  process.exit(0);
}

// Look at each `git ... add <args>` up to the next command separator.
const adds = command.matchAll(/\bgit\b(?:\s+-[^\s]+(?:\s+[^\s-][^\s]*)?)*\s+add\b([^;&|\n]*)/g);
for (const [, args] of adds) {
  const tokens = args.trim().split(/\s+/).filter(Boolean);
  const blanket = tokens.find((token) =>
    /^(-A|--all|-[a-zA-Z]*A[a-zA-Z]*|\.|\.\/|\*|:\/)$/.test(token),
  );
  if (blanket) {
    console.error(
      `Blocked: "git add ${blanket}" stages everything. Stage files by name: git add <path> <path>.`,
    );
    process.exit(2);
  }
}
process.exit(0);
