import { handContent } from '../content/hand.server';
import { pageMeta } from '../content/meta';
import { ProjectsTemplate } from '../templates/ProjectsTemplate';
import type { Route } from './+types/projects';

export function loader() {
  return { content: handContent().projectsIndex };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.content.header.lead });

export default function Projects({ loaderData }: Route.ComponentProps) {
  return <ProjectsTemplate content={loaderData.content} />;
}
