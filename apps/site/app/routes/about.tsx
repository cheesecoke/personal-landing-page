import { paragraphText } from '@cwc/content/hand';

import { handContent } from '../content/hand.server';
import { liveContent } from '../content/live.server';
import { pageMeta } from '../content/meta';
import { AboutTemplate } from '../templates/AboutTemplate';
import type { Route } from './+types/about';

export function loader() {
  const { about } = handContent();
  // Live data: the Now line and the current role. Both are null until something is published.
  const { now, currentRole } = liveContent().about;
  // The page shows no log line on any chapter, so its words stay out of the page's data too.
  const chapters = about.rings.chapters.map(({ logTeaser: _, ...chapter }) => chapter);
  return {
    content: { ...about, rings: { ...about.rings, chapters } },
    description: paragraphText(about.person.paragraphs[0]!),
    now,
    currentRole,
  };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.description });

export default function About({ loaderData }: Route.ComponentProps) {
  return (
    <AboutTemplate
      content={loaderData.content}
      now={loaderData.now}
      currentRole={loaderData.currentRole}
    />
  );
}
