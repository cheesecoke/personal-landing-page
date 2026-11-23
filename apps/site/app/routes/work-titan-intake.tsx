import { handContent } from '../content/hand.server';
import { liveContent } from '../content/live.server';
import { pageMeta } from '../content/meta';
import { JobTemplate } from '../templates/JobTemplate';
import { withoutConfirms } from '../templates/ProjectTemplate.map';
import type { Route } from './+types/work-titan-intake';

/** Titan Intake: its hand content. The job log is null unless its file says `enabled: true`. */
export function loader() {
  const content = withoutConfirms(handContent().titanIntake);
  return { content, log: liveContent().titanLog };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.content.hero.lead });

export default function TitanIntake({ loaderData }: Route.ComponentProps) {
  return <JobTemplate {...loaderData} />;
}
