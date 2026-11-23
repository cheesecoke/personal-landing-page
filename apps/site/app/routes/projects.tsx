import { useMemo } from 'react';

import { Canopy, type CanopyLinkProps } from '@cwc/canopy';
import { isoToday } from '@cwc/content';
import { FreshnessProvider, useFreshness } from '@cwc/content/react';

import { freshShoots, toCanopyCopy, toCanopyData, withCanopyFresh } from '../content/canopy';
import { handContent } from '../content/hand.server';
import { freshCandidates, markerSlots, statusKeyTone, toFreshProp } from '../content/live';
import { liveContent } from '../content/live.server';
import { pageMeta } from '../content/meta';
import { RouterLink } from '../shell/RouterLink';
import {
  ProjectsTemplate,
  type ProjectsFresh,
  type ProjectsLive,
} from '../templates/ProjectsTemplate';
import type { Route } from './+types/projects';

/**
 * The page's hand content and the project tree (hand content's map, with live status and shoots),
 * and from live data only what the index shows: each row's status, the rows' change dates in
 * page order (a family counts as one project), and which rows keep room for a new mark.
 */
export function loader() {
  const { projectsIndex, map } = handContent();
  const { projects } = liveContent();
  const rows = projectsIndex.index.groups.flatMap((group) => group.rows.map((row) => row.id));

  const status: NonNullable<ProjectsLive['status']> = {};
  for (const project of projects) {
    if (rows.includes(project.slug)) {
      status[project.slug] = {
        label: project.status.label,
        tone: statusKeyTone(project.status.key),
      };
    }
  }
  const candidates = freshCandidates(projects, rows).filter(({ id }) => rows.includes(id));
  return {
    content: projectsIndex,
    live: { status, reserve: markerSlots(candidates, isoToday()) } satisfies ProjectsLive,
    candidates,
    map: {
      data: toCanopyData(map, projects),
      shoots: freshShoots(projects),
      words: { headline: map.headline, hint: map.hint, labels: map.labels },
    },
  };
}

/** The tree's card links go through the router, like every other link on the site. */
const canopyLink = ({ href, className, children }: CanopyLinkProps) => (
  <RouterLink href={href} className={className}>
    {children}
  </RouterLink>
);

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.content.header.lead });

/**
 * The new marks, decided in the browser once the page has hydrated: three at most, the same
 * projects on the tree and in the index. The tree's stage (three.js) is the canopy's own lazy
 * chunk: it loads after this page has mounted and is no part of the page's JavaScript.
 */
function ProjectsPage({ content, live, map }: Route.ComponentProps['loaderData']) {
  const { marks } = useFreshness();
  const fresh = useMemo(() => {
    const rows: ProjectsFresh = {};
    for (const [id, mark] of Object.entries(marks)) rows[id] = toFreshProp(mark)!;
    return rows;
  }, [marks]);
  const tree = useMemo(() => withCanopyFresh(map.data, marks, map.shoots), [map, marks]);
  const copy = useMemo(() => toCanopyCopy(map.words), [map.words]);
  return (
    <ProjectsTemplate
      content={content}
      fresh={fresh}
      live={live}
      map={<Canopy variant="full" data={tree} copy={copy} renderLink={canopyLink} />}
    />
  );
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  return (
    <FreshnessProvider candidates={loaderData.candidates}>
      <ProjectsPage {...loaderData} />
    </FreshnessProvider>
  );
}
