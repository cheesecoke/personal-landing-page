import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { z } from 'zod';

import { checkProjectLinks, emptyLiveContent, type LiveContent } from '../live';
import { aboutSchema, metaSchema, titanLogSchema } from '../schema/about';
import { describeIssues, issuePaths } from '../schema/issues';
import { projectSchema, type Project } from '../schema/project';

/** A content file that cannot be used. The build stops on it. */
export class ContentError extends Error {
  /** The file, relative to the live folder: `projects/duo-decide.json`. */
  readonly file: string;
  /** Where in the file, as a dotted path: `log.0.date`. Empty for a problem with the whole file. */
  readonly path: string;
  /** Every problem found in the file, one line each. */
  readonly issues: string[];

  constructor(file: string, path: string, issues: string[]) {
    super(`Invalid content in ${file}${path ? ` at ${path}` : ''}:\n  ${issues.join('\n  ')}`);
    this.name = 'ContentError';
    this.file = file;
    this.path = path;
    this.issues = issues;
  }
}

/** The seed data the site ships on until content is published: `fixtures/seed` in this package. */
export const seedLiveDir = fileURLToPath(new URL('../../fixtures/seed', import.meta.url));

/** The folder to read: the argument, else `CONTENT_LIVE_DIR`, else the seed fixtures. */
export const resolveLiveDir = (dir?: string): string =>
  resolve(dir ?? (process.env.CONTENT_LIVE_DIR || seedLiveDir));

const ROOT_FILES = ['meta.json', 'about.json', 'titan-log.json'];

const jsonFiles = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => entry.name)
        .sort()
    : [];

/** Read and parse one file. A missing file is `undefined`; anything else wrong throws. */
function readFile<Schema extends z.ZodType>(
  dir: string,
  file: string,
  schema: Schema,
): z.output<Schema> | undefined {
  const full = join(dir, file);
  if (!existsSync(full)) return undefined;
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(full, 'utf8'));
  } catch (error) {
    throw new ContentError(file, '', [`Not valid JSON: ${(error as Error).message}`]);
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ContentError(file, issuePaths(result.error)[0] ?? '', describeIssues(result.error));
  }
  return result.data;
}

function read(dir: string): LiveContent {
  const content = emptyLiveContent();
  if (!existsSync(dir)) return content;

  const unknown = jsonFiles(dir).find((file) => !ROOT_FILES.includes(file));
  if (unknown) throw new ContentError(unknown, '', ['Not a file this site knows how to read']);

  content.meta = readFile(dir, 'meta.json', metaSchema) ?? null;
  content.about = readFile(dir, 'about.json', aboutSchema) ?? content.about;
  const titanLog = readFile(dir, 'titan-log.json', titanLogSchema);
  content.titanLog = titanLog?.enabled ? titanLog : null;

  const projects: Project[] = [];
  for (const name of jsonFiles(join(dir, 'projects'))) {
    const file = `projects/${name}`;
    const project = readFile(dir, file, projectSchema);
    if (!project) continue;
    if (`${project.slug}.json` !== name) {
      throw new ContentError(file, 'slug', [
        `slug: "${project.slug}" does not match the file name`,
      ]);
    }
    projects.push(project);
  }
  for (const [slug, message] of checkProjectLinks(projects)) {
    throw new ContentError(`projects/${slug}.json`, 'parent', [`parent: ${message}`]);
  }
  content.projects = projects;
  return content;
}

const cache = new Map<string, LiveContent>();

/**
 * Read the live content folder once per build.
 *
 * - `dir` defaults to `CONTENT_LIVE_DIR`, then to the seed fixtures.
 * - A missing file (or a missing folder) means defaults: no project data, no Now line, no job log.
 * - An invalid file throws a `ContentError` naming the file and the path, which fails the build.
 */
export function loadLiveContent(dir?: string): LiveContent {
  const resolved = resolveLiveDir(dir);
  let content = cache.get(resolved);
  if (!content) {
    content = read(resolved);
    cache.set(resolved, content);
  }
  return content;
}

/** Forget what was read (tests, and a dev server that should pick up an edited file). */
export const clearLiveContentCache = (): void => cache.clear();
