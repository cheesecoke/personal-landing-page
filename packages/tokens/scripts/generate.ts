import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { generatedFiles } from '../src/build';

const outDir = join(import.meta.dirname, '..', 'generated');
mkdirSync(outDir, { recursive: true });
for (const [file, render] of Object.entries(generatedFiles)) {
  writeFileSync(join(outDir, file), render());
  console.log(`tokens: wrote generated/${file}`);
}
