import { paragraphText } from '@cwc/content/hand';

import { handContent } from '../content/hand.server';
import { liveContent } from '../content/live.server';
import { pageMeta } from '../content/meta';
import { PreloadImage } from '../content/preload';
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
  pageMeta({ path: '/about', title: data?.content.title, description: data?.description });

export default function About({ loaderData }: Route.ComponentProps) {
  return (
    <>
      {/* The stump is the largest paint on this page. */}
      <PreloadImage image={loaderData.content.rings.image} />
      <AboutTemplate
        content={loaderData.content}
        now={loaderData.now}
        currentRole={loaderData.currentRole}
      />
    </>
  );
}
