import { useMemo } from 'react';

import { isoToday } from '@cwc/content';
import { FreshnessProvider, useFreshness } from '@cwc/content/react';

import { handContent } from '../content/hand.server';
import { freshCandidates, markerSlots, statusKeyTone, toFreshProp } from '../content/live';
import { liveContent } from '../content/live.server';
import { pageMeta } from '../content/meta';
import {
  ProjectsTemplate,
  type ProjectsFresh,
  type ProjectsLive,
} from '../templates/ProjectsTemplate';
import type { Route } from './+types/projects';

/**
 * The page's hand content, and from live data only what the index shows: each row's status, the
 * rows' change dates in page order (a family counts as one project), and which rows keep room
 * for a new mark.
 */
export function loader() {
  const { projectsIndex } = handContent();
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
  };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.content.header.lead });

/** The rows' new marks, decided in the browser once the page has hydrated: three at most. */
function ProjectsPage({ content, live }: Route.ComponentProps['loaderData']) {
  const { marks } = useFreshness();
  const fresh = useMemo(() => {
    const rows: ProjectsFresh = {};
    for (const [id, mark] of Object.entries(marks)) rows[id] = toFreshProp(mark)!;
    return rows;
  }, [marks]);
  return <ProjectsTemplate content={content} fresh={fresh} live={live} />;
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  return (
    <FreshnessProvider candidates={loaderData.candidates}>
      <ProjectsPage {...loaderData} />
    </FreshnessProvider>
  );
}
