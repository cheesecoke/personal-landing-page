import { emptyAbout, type About, type Meta, type TitanLog } from './schema/about';
import { isPublicProject, type Project, type PublicProject } from './schema/project';

/** Everything the live folder holds, parsed. This is what route loaders slice from. */
export interface LiveContent {
  /** The last publish, or null when there is no `meta.json`. */
  meta: Meta | null;
  /** Every project file, sorted by slug. Page order is the page's business. */
  projects: Project[];
  /** `now` and `currentRole` are null when there is no `about.json`. */
  about: About;
  /** The job log, and only when its file says `enabled: true`. Otherwise null: render nothing. */
  titanLog: TitanLog | null;
}

/** What the site gets when nothing has ever been published. */
export const emptyLiveContent = (): LiveContent => ({
  meta: null,
  projects: [],
  about: { ...emptyAbout },
  titanLog: null,
});

export const getProject = (content: LiveContent, slug: string): Project | undefined =>
  content.projects.find((project) => project.slug === slug);

/** The project with its log, shoots and the rest, or undefined if it is missing or name-only. */
export const getPublicProject = (content: LiveContent, slug: string): PublicProject | undefined => {
  const project = getProject(content, slug);
  return project && isPublicProject(project) ? project : undefined;
};

/** Cross-file rules: every parent is a project that exists. Returns `[slug, message]` pairs. */
export const checkProjectLinks = (projects: Project[]): [slug: string, message: string][] => {
  const slugs = new Set(projects.map((project) => project.slug));
  return projects.flatMap((project): [string, string][] =>
    project.parent !== null && !slugs.has(project.parent)
      ? [[project.slug, `Parent "${project.parent}" is not a project in this folder`]]
      : [],
  );
};
