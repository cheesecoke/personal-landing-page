import type {
  FreshCandidate,
  FreshMark,
  LiveContent,
  Project,
  PublicProject,
  StatusKey,
} from '@cwc/content';
import type { Status } from '@cwc/ui';

/**
 * Pure helpers for live data, safe in the browser (no file system): templates and components use
 * them after hydration, loaders use them at pre-render. The loader itself is `live.server.ts`.
 */

/** A project's live file by slug, or undefined when nothing was published for it. */
export const projectBySlug = (
  content: Pick<LiveContent, 'projects'>,
  slug: string,
): Project | undefined => content.projects.find((project) => project.slug === slug);

/** The same, but only a project with a log, shoots and the rest (not a name-only one). */
export const publicProjectBySlug = (
  content: Pick<LiveContent, 'projects'>,
  slug: string,
): PublicProject | undefined => {
  const project = projectBySlug(content, slug);
  return project?.visibility === 'public' ? project : undefined;
};

/** The top of a project's family: PAS for Atti and for Lifebox, the project itself at the top. */
export function familySlug(projects: readonly Project[], slug: string): string {
  const seen = new Set<string>();
  let current = slug;
  for (;;) {
    seen.add(current);
    const parent = projects.find((project) => project.slug === current)?.parent;
    if (!parent || seen.has(parent)) return current;
    current = parent;
  }
}

/**
 * What a `FreshnessProvider` takes: one candidate per public project that has a change date, its
 * `id` the project slug. A parent and its children share one `project` key (the family's top
 * slug), so a family carries one mark on a page.
 *
 * Ties on the date keep the order given, so pass `order` (slugs in page order) where the page has
 * one; projects not named in it follow in the order they came.
 */
export function freshCandidates(
  projects: readonly Project[],
  order: readonly string[] = [],
): FreshCandidate[] {
  const rank = (slug: string) => {
    const index = order.indexOf(slug);
    return index === -1 ? order.length : index;
  };
  return projects
    .flatMap((project): FreshCandidate[] =>
      project.visibility === 'public' && project.fresh
        ? [{ id: project.slug, project: familySlug(projects, project.slug), fresh: project.fresh }]
        : [],
    )
    .sort((a, b) => rank(a.id) - rank(b.id));
}

/** The numbers the UI's new markers take (`NewMarker`, `fresh` props), from a provider's mark. */
export const toFreshProp = (
  mark: Pick<FreshMark, 'ageDays' | 'lifeDays'> | null | undefined,
): { ageDays: number; lifeDays: number } | null =>
  mark ? { ageDays: mark.ageDays, lifeDays: mark.lifeDays } : null;

const liveKeys: ReadonlySet<StatusKey> = new Set(['live', 'daily-use', 'running']);

/**
 * Which dot goes with a live status key: Signal for a project in use, Ember for one in build, the
 * hollow ring for every other state. Agrees with `statusTone` (which reads hand content's word).
 */
export function statusKeyTone(key: StatusKey): Status {
  if (key === 'in-build') return 'build';
  return liveKeys.has(key) ? 'live' : 'private';
}
