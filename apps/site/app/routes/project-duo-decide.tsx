import { handContent } from '../content/hand.server';
import { liveContent, publicProjectBySlug } from '../content/live.server';
import { pageMeta } from '../content/meta';
import { ProjectTemplate } from '../templates/ProjectTemplate';
import { withoutConfirms } from '../templates/ProjectTemplate.map';
import type { Route } from './+types/project-duo-decide';

/** Duo Decide: its hand content, its live file when one is published, and the day of the build. */
export function loader() {
  const content = withoutConfirms(handContent().projects.duoDecide);
  return {
    content,
    project: publicProjectBySlug(liveContent(), content.slug) ?? null,
    today: new Date().toISOString().slice(0, 10),
  };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.content.hero.lead });

export default function DuoDecide({ loaderData }: Route.ComponentProps) {
  return <ProjectTemplate {...loaderData} />;
}
