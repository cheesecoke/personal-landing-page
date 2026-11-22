import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { z } from 'zod';

import { HomeContent } from './home';
import { MapContent } from './map';
import { ProjectPageContent } from './project-page';
import { ProjectsIndexContent } from './projects-index';

/**
 * Build-time loader for hand-written content. Node only: routes call it from their loaders during
 * pre-render, and components get the result as plain props.
 */

/** Every hand file: the key it loads under, its path inside the hand folder, and its schema. */
const handFiles = {
  home: { file: 'home.json', schema: HomeContent },
  projectsIndex: { file: 'projects-index.json', schema: ProjectsIndexContent },
  map: { file: 'map.json', schema: MapContent },
} as const;

/**
 * Project pages: the key each loads under and its path inside the hand folder. The key is the
 * camel-cased slug, and the file's `slug` must match it.
 */
const projectFiles = {
  pas: 'projects/pas.json',
  atti: 'projects/atti.json',
  lifebox: 'projects/lifebox.json',
  personalBrain: 'projects/personal-brain.json',
  aiSystem: 'projects/ai-system.json',
  duoDecide: 'projects/duo-decide.json',
  threadQuest: 'projects/thread-quest.json',
} as const;

export type ProjectKey = keyof typeof projectFiles;

export type HandContent = {
  [Key in keyof typeof handFiles]: z.infer<(typeof handFiles)[Key]['schema']>;
} & { projects: Record<ProjectKey, ProjectPageContent> };

const kebab = (key: string) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** A hand file that is missing, is not JSON, or does not match its schema. */
export class HandContentError extends Error {
  constructor(
    readonly file: string,
    readonly problems: string[],
  ) {
    super(`Hand content ${file} is invalid:\n${problems.map((line) => `  ${line}`).join('\n')}`);
    this.name = 'HandContentError';
  }
}

function loadFile<Schema extends z.ZodType>(
  dir: string,
  file: string,
  schema: Schema,
): z.infer<Schema> {
  const path = join(dir, file);
  if (!existsSync(path)) throw new HandContentError(file, ['file is missing']);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new HandContentError(file, [`not valid JSON: ${(error as Error).message}`]);
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new HandContentError(
      file,
      result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`),
    );
  }
  return result.data;
}

/**
 * Read and validate every hand file under `dir` (the `apps/site/content/hand` folder).
 * Throws `HandContentError`, naming the file and the path inside it, so a bad file fails the build.
 */
export function loadHandContent(dir: string): HandContent {
  const entries = Object.entries(handFiles).map(([key, { file, schema }]) => [
    key,
    loadFile(dir, file, schema),
  ]);
  const projects = Object.entries(projectFiles).map(([key, file]) => {
    const page = loadFile(dir, file, ProjectPageContent);
    if (page.slug !== kebab(key)) {
      throw new HandContentError(file, [`slug: expected "${kebab(key)}", found "${page.slug}"`]);
    }
    return [key, page];
  });
  return { ...Object.fromEntries(entries), projects: Object.fromEntries(projects) } as HandContent;
}

/** The path of every hand file, relative to the hand folder. */
export const handFilePaths: readonly string[] = [
  ...Object.values(handFiles).map(({ file }) => file),
  ...Object.values(projectFiles),
];

function walk(value: unknown, path: string, visit: (text: string, path: string) => void): void {
  if (typeof value === 'string') visit(value, path);
  else if (Array.isArray(value))
    value.forEach((item, index) => walk(item, `${path}[${index}]`, visit));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value))
      walk(item, path ? `${path}.${key}` : key, visit);
  }
}

/** Every `/media/...` file the content points at, sorted and without repeats. */
export function listHandMedia(content: unknown): string[] {
  const found = new Set<string>();
  walk(content, '', (text) => {
    if (text.startsWith('/media/')) found.add(text);
  });
  return [...found].sort();
}

/** Media the content points at that is not in `publicDir` (the `apps/site/public` folder). */
export function findMissingMedia(content: unknown, publicDir: string): string[] {
  return listHandMedia(content).filter((path) => !existsSync(join(publicDir, path)));
}

/** Every `[CONFIRM: ...]` marker left in the content. Production builds must find none. */
export function findConfirms(content: unknown): { path: string; text: string }[] {
  const found: { path: string; text: string }[] = [];
  walk(content, '', (text, path) => {
    if (text.includes('[CONFIRM')) found.push({ path, text });
  });
  return found;
}
